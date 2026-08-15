// MEDIÇÃO POR NOTA — transforma a corrida de karaokê em `SungNote[]`, a matéria-prima
// da tabela de atribuição (§4 do plano).
//
// Cada nota carrega DUAS famílias de campo, e a separação é o ponto inteiro do
// desenho: as MEDIÇÕES (o que você fez) e as CONDIÇÕES (o que a música pedia). O
// diagnóstico não sai do erro médio — sai de descobrir em QUE condição o erro se
// concentra. Nota longa? Fim de frase? Salto grande? Agudo? Sem as condições
// gravadas junto de cada nota, isso é impossível de calcular depois.
//
// TS puro, sem DOM. Ver align.ts para o offset/oitava de frase que entra aqui pronto.

import type { TimedNote } from '../../data/songs'
import { analyzeVibratoFromF0, type VibratoResult } from '../../audio/vibrato'
import type { KaraokeTrack } from './track'
import { MIN_CLARITY, type PhraseAlignment, type SungFrame } from './align'
import { median } from './stats'

/** Trecho inicial descartado da medição de afinação (ms). Ver §3.3: todo cantor entra
 * por baixo e sobe; incluir o scoop faz TODA nota parecer baixa. */
export const ONSET_SKIP_MS = 120
/** Janela do ataque, medida à parte — o scoop vira métrica, não contaminação. */
export const ONSET_WINDOW_MS = 80
/** Em notas curtas demais para descartar 120 ms, descarta esta fração da duração. */
export const SHORT_NOTE_SKIP_FRACTION = 0.4
/** |cents| abaixo disto conta como "achou a nota". */
export const SETTLE_CENTS = 25
/** Frames consecutivos dentro de SETTLE_CENTS para considerar assentado. */
export const SETTLE_CONSEC = 3
/** Só mede deriva em notas mais longas que isto (s) — abaixo, a reta é ruído. */
export const MIN_DRIFT_SEC = 0.6
export const MIN_DRIFT_POINTS = 8
/** Confiança mediana mínima da REFERÊNCIA para a nota valer pontuação (§3.5). */
export const REF_CONF_MIN = 0.6
/** Abaixo desta fração de frames vozeados, você não cantou a nota — não é desafinação. */
export const MIN_VOICED_PCT = 0.3
/** Busca do ataque cantado em torno do ataque esperado (ms). */
export const ONSET_SEARCH_MS = 200
/** Frames vozeados seguidos que caracterizam um ataque. */
export const ONSET_RUN_FRAMES = 3
/** Silêncio na referência antes da nota que a torna um ataque "destacado" (s). */
export const DETACHED_GAP_SEC = 0.1
/** Nota mais curta que isto (s) não é julgada quanto a vibrato — não dá tempo de
 * existir um. Mesmo limiar da regra de atribuição, para a medição e o julgamento
 * nunca discordarem sobre o que é "nota longa". */
export const VIBRATO_MIN_SEC = 1.5
/** Frames mínimos por segundo na nota para a análise de vibrato valer. Abaixo disso a
 * autocorrelação não resolve 4–8 Hz e devolveria ruído com cara de resultado. */
const VIBRATO_MIN_FPS = 25

export type SkipReason = 'ref-fraca' | 'sem-voz' | null

export interface SungNote {
  index: number
  refMidi: number
  startSec: number
  durSec: number

  // ---- medições (o que você fez) ----
  /** desvio mediano em cents, já sem o scoop inicial e já com a oitava removida */
  centsDev: number | null
  /** cents nos primeiros 80 ms — o scoop de entrada */
  onsetCents: number | null
  /** ms até assentar dentro de ±25 cents; null se nunca assentou */
  settleMs: number | null
  /** inclinação da afinação ao longo da nota; negativo = caindo (apoio) */
  driftCentsPerSec: number | null
  /** atraso do ataque em relação à referência, já sem o offset da frase */
  timingMs: number | null
  voicedPct: number
  dynamicsAvg: number | null
  steadinessAvg: number | null
  h1h2Avg: number | null
  centroidAvg: number | null
  /**
   * Vibrato do CANTOR nesta nota. `null` em nota curta demais para julgar (< 1,5 s)
   * ou sem frames suficientes — que é diferente de `{ present: false }`, "nota longa
   * cantada reta". Confundir os dois transformaria toda nota curta em "sem vibrato".
   */
  vibrato: VibratoResult | null
  /** true quando a nota não pode ser cobrada de você */
  skipped: boolean
  skipReason: SkipReason

  // ---- condições (o que a música pedia) ----
  phraseIndex: number
  /** 0 = começo da frase, 1 = fim */
  posInPhrase: number
  /** segundos decorridos de frase quando a nota começa */
  phraseElapsedSec: number
  /** salto em semitons desde a nota anterior DA MESMA FRASE; 0 na primeira */
  leapFromPrev: number
  /** notas por segundo na vizinhança de ±1 s */
  localNoteRate: number
  /** 0..1 dentro da extensão da música */
  relHeight: number
}

/** Inclinação de uma reta por mínimos quadrados. NaN com menos de 2 pontos. */
export function linearSlope(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return NaN
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]
    sy += ys[i]
  }
  const mx = sx / n
  const my = sy / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    num += dx * (ys[i] - my)
    den += dx * dx
  }
  return den === 0 ? NaN : num / den
}

/** Frames do cantor com t em [t0, t1), já filtrados por clareza e vozeamento. */
function framesIn(sung: SungFrame[], t0: number, t1: number): SungFrame[] {
  const out: SungFrame[] = []
  for (const f of sung) {
    if (f.t >= t1) break
    if (f.t >= t0 && f.midi !== null && f.clarity >= MIN_CLARITY) out.push(f)
  }
  return out
}

/** Todos os frames da janela, vozeados ou não — denominador de voicedPct. */
function allFramesIn(sung: SungFrame[], t0: number, t1: number): SungFrame[] {
  return sung.filter((f) => f.t >= t0 && f.t < t1)
}

const mean = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, c) => a + c, 0) / xs.length : null

/**
 * Ataque cantado dentro da janela de busca.
 *
 * Distingue dois casos, porque tratá-los igual erra metade das notas: quando a
 * referência tem silêncio antes, o ataque é uma retomada de VOZEAMENTO; em legato não
 * há silêncio nenhum, e o ataque é a TRAVESSIA DE ALTURA rumo à nota nova. Procurar
 * vozeamento numa nota ligada nunca acha nada, e o tempo sairia sempre null.
 */
function findSungOnset(
  sung: SungFrame[],
  expectedSec: number,
  targetMidi: number,
  prevMidi: number | null,
  detached: boolean,
): number | null {
  const t0 = expectedSec - ONSET_SEARCH_MS / 1000
  const t1 = expectedSec + ONSET_SEARCH_MS / 1000
  const win = allFramesIn(sung, t0, t1)
  if (win.length === 0) return null

  if (detached || prevMidi === null) {
    let run = 0
    for (const f of win) {
      const voiced = f.midi !== null && f.clarity >= MIN_CLARITY
      if (voiced) {
        run++
        if (run >= ONSET_RUN_FRAMES) return win[win.indexOf(f) - (ONSET_RUN_FRAMES - 1)].t
      } else {
        run = 0
      }
    }
    return null
  }

  // legato: primeira travessia do ponto médio entre a nota anterior e esta
  const mid = (prevMidi + targetMidi) / 2
  const rising = targetMidi > prevMidi
  let run = 0
  for (let i = 0; i < win.length; i++) {
    const m = win[i].midi
    if (m === null || win[i].clarity < MIN_CLARITY) {
      run = 0
      continue
    }
    const crossed = rising ? m >= mid : m <= mid
    if (crossed) {
      run++
      if (run >= 2) return win[i - 1].t
    } else {
      run = 0
    }
  }
  return null
}

/**
 * Vibrato do cantor no corpo da nota (o ataque já vem de fora, de propósito: um
 * scoop de entrada é uma rampa, e uma rampa entra na autocorrelação como se fosse
 * meio ciclo de vibrato lentíssimo).
 *
 * A taxa de frames é derivada dos PRÓPRIOS frames desta nota, e não de uma constante:
 * a captura ao vivo roda no requestAnimationFrame, que varia com a máquina e com a
 * aba. Presumir 60 fps num aparelho que entregou 40 deslocaria a taxa medida em 50%,
 * e a regra de vibrato julga exatamente a taxa.
 */
function vibratoOf(body: SungFrame[], durSec: number): VibratoResult | null {
  if (durSec < VIBRATO_MIN_SEC || body.length < 2) return null
  const spanSec = body[body.length - 1].t - body[0].t
  if (spanSec <= 0) return null
  const fps = (body.length - 1) / spanSec
  if (fps < VIBRATO_MIN_FPS) return null
  const f0 = body.map((f) => 440 * Math.pow(2, ((f.midi as number) - 69) / 12))
  return analyzeVibratoFromF0(f0, fps)
}

/** Confiança mediana da referência no intervalo da nota. */
function refConfidence(track: KaraokeTrack, note: TimedNote): number {
  const { fps, conf } = track.refContour
  const a = Math.max(0, Math.round(note.startSec * fps))
  const b = Math.min(conf.length, Math.round(note.endSec * fps))
  const xs: number[] = []
  for (let i = a; i < b; i++) xs.push(conf[i])
  return xs.length ? median(xs) : 0
}

/**
 * Mede a corrida inteira.
 *
 * `sung` precisa estar ordenado por tempo e já com o relógio da MÚSICA (latência
 * compensada). `alignments` vem de align.ts — offset e oitava por frase, já prontos.
 */
export function measureRun(
  track: KaraokeTrack,
  sung: SungFrame[],
  alignments: PhraseAlignment[],
): SungNote[] {
  const byPhrase = new Map<number, PhraseAlignment>()
  for (const a of alignments) byPhrase.set(a.phraseIndex, a)

  const { loMidi, hiMidi } = track.demand.raw
  const span = Math.max(1, hiMidi - loMidi)
  const out: SungNote[] = []

  for (const phrase of track.phrases) {
    const align = byPhrase.get(phrase.index)
    const offsetSec = (align?.offsetMs ?? 0) / 1000
    const octave = align?.octaveOffset ?? 0

    for (let k = 0; k < phrase.noteIdx.length; k++) {
      const note = track.notes[phrase.noteIdx[k]]
      const prev = k > 0 ? track.notes[phrase.noteIdx[k - 1]] : null
      const durSec = note.endSec - note.startSec

      const winStart = note.startSec + offsetSec
      const winEnd = note.endSec + offsetSec
      const all = allFramesIn(sung, winStart, winEnd)
      const voiced = framesIn(sung, winStart, winEnd)
      const voicedPct = all.length ? voiced.length / all.length : 0

      // Trecho de medição: sem o scoop. Em nota curta, 120 ms comeria tudo — aí
      // descarta uma fração, para sempre sobrar algo mensurável.
      const skipSec = Math.min(ONSET_SKIP_MS / 1000, durSec * SHORT_NOTE_SKIP_FRACTION)
      const body = framesIn(sung, winStart + skipSec, winEnd)

      const centsOf = (f: SungFrame): number =>
        100 * ((f.midi as number) - note.midi - 12 * octave)

      const bodyCents = body.map(centsOf)
      const onsetCents = framesIn(sung, winStart, winStart + ONSET_WINDOW_MS / 1000).map(centsOf)

      // assentamento: primeiro instante com SETTLE_CONSEC frames seguidos afinados
      let settleMs: number | null = null
      let run = 0
      for (const f of voiced) {
        if (Math.abs(centsOf(f)) <= SETTLE_CENTS) {
          run++
          if (run >= SETTLE_CONSEC) {
            settleMs = (f.t - winStart) * 1000
            break
          }
        } else {
          run = 0
        }
      }

      let driftCentsPerSec: number | null = null
      if (durSec > MIN_DRIFT_SEC && body.length >= MIN_DRIFT_POINTS) {
        const slope = linearSlope(
          body.map((f) => f.t),
          bodyCents,
        )
        driftCentsPerSec = Number.isFinite(slope) ? slope : null
      }

      const detached = prev === null || note.startSec - prev.endSec >= DETACHED_GAP_SEC
      const onsetT = findSungOnset(
        sung,
        winStart,
        note.midi + 12 * octave,
        prev ? prev.midi + 12 * octave : null,
        detached,
      )
      const timingMs = onsetT === null ? null : (onsetT - winStart) * 1000

      const refOk = refConfidence(track, note) >= REF_CONF_MIN
      const skipReason: SkipReason = !refOk ? 'ref-fraca' : voicedPct < MIN_VOICED_PCT ? 'sem-voz' : null

      // densidade local — proxy de agilidade exigida
      let near = 0
      for (const n of track.notes) {
        if (Math.abs(n.startSec - note.startSec) <= 1) near++
      }

      out.push({
        index: note.index,
        refMidi: note.midi,
        startSec: note.startSec,
        durSec,
        centsDev: bodyCents.length ? median(bodyCents) : null,
        onsetCents: onsetCents.length ? median(onsetCents) : null,
        settleMs,
        driftCentsPerSec,
        timingMs,
        voicedPct,
        dynamicsAvg: mean(voiced.map((f) => f.dynamics ?? NaN).filter(Number.isFinite)),
        steadinessAvg: mean(voiced.map((f) => f.steadiness ?? NaN).filter(Number.isFinite)),
        h1h2Avg: mean(voiced.map((f) => f.h1h2 ?? NaN).filter(Number.isFinite)),
        centroidAvg: mean(voiced.map((f) => f.centroid ?? NaN).filter(Number.isFinite)),
        vibrato: vibratoOf(body, durSec),
        skipped: skipReason !== null,
        skipReason,
        phraseIndex: phrase.index,
        posInPhrase: phrase.noteIdx.length > 1 ? k / (phrase.noteIdx.length - 1) : 0,
        phraseElapsedSec: note.startSec - phrase.startSec,
        leapFromPrev: prev ? Math.abs(note.midi - prev.midi) : 0,
        localNoteRate: near / 2,
        relHeight: (note.midi - loMidi) / span,
      })
    }
  }

  return out
}

/**
 * Cobertura da corrida: fração das notas efetivamente avaliadas.
 *
 * Precisa aparecer no relatório. Cobertura baixa por `ref-fraca` é problema da
 * IMPORTAÇÃO (voz enterrada na mixagem) e não do cantor — apresentar um diagnóstico
 * sobre 30% das notas como se fosse sobre a música inteira seria mentir por omissão.
 */
export function runCoverage(notes: SungNote[]): {
  scored: number
  total: number
  pct: number
  refWeak: number
  noVoice: number
} {
  const total = notes.length
  const refWeak = notes.filter((n) => n.skipReason === 'ref-fraca').length
  const noVoice = notes.filter((n) => n.skipReason === 'sem-voz').length
  const scored = total - refWeak - noVoice
  return { scored, total, pct: total ? scored / total : 0, refWeak, noVoice }
}
