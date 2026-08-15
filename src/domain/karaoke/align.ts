// ALINHAMENTO POR FRASE entre o que você cantou e a referência.
//
// Por que não basta compensar a latência: mesmo com o relógio perfeito, cantor
// legitimamente entra adiantado ou atrasado numa frase — isso é fraseado, não erro.
// Se o erro de tempo for medido contra o relógio absoluto, uma entrada atrasada
// envenena a frase inteira e todas as notas dela viram "erro". Então o offset de cada
// frase é ESTIMADO e removido, e o erro de tempo por nota é medido do que sobra.
//
// O offset da frase não é jogado fora: um offset consistentemente positivo em muitas
// frases é ele mesmo um achado (condução rítmica) e é reportado à parte.
//
// TS puro, sem DOM: recebe frames já com o tempo no relógio da MÚSICA.

import type { KaraokePhrase, RefContour } from './track'

/** Um frame do cantor. `t` em segundos no relógio da música, já compensado de latência. */
export interface SungFrame {
  t: number
  /** MIDI float, ou null quando não-vozeado */
  midi: number | null
  clarity: number
  dynamics?: number
  steadiness?: number
  h1h2?: number | null
  centroid?: number | null
}

export interface PhraseAlignment {
  phraseIndex: number
  /** quanto o cantor atrasou em relação à referência (positivo = atrasado) */
  offsetMs: number
  /** oitavas de diferença (negativo = cantou abaixo). Constante DENTRO da frase. */
  octaveOffset: number
  /** frames em que os dois estavam vozeados e concordaram */
  matchedFrames: number
  /** false quando não houve material suficiente para estimar — não confie no offset */
  reliable: boolean
}

/** Busca de offset: ±300 ms cobre fraseado humano sem entrar na frase vizinha. */
export const MAX_OFFSET_MS = 300
/** Passo da busca. 8 ms está abaixo do que se percebe e abaixo de 1 frame do modelo. */
export const OFFSET_STEP_MS = 8
/** Concordância: dentro de 1 semitom conta como "mesma nota" para fins de alinhamento. */
export const MATCH_SEMITONES = 1
/** Abaixo disto a estimativa é chute; devolve offset 0 e reliable=false. */
export const MIN_MATCHED_FRAMES = 10

/** Clareza mínima para um frame do cantor entrar em qualquer conta. */
export const MIN_CLARITY = 0.6

/** Dobra uma diferença em semitons para a oitava mais próxima (−6..+6). */
export function foldOctave(deltaSemitones: number): number {
  return deltaSemitones - 12 * Math.round(deltaSemitones / 12)
}

/**
 * Valor do cantor no instante `t`, pelo frame mais próximo dentro de `tolSec`.
 *
 * Busca binária: os frames chegam a taxa variável (requestAnimationFrame), então
 * reamostrar para uma grade fixa introduziria erro que não existe no sinal. Pegar o
 * vizinho mais próximo com tolerância é honesto — ou tem frame perto, ou não tem.
 */
export function sungAt(frames: SungFrame[], t: number, tolSec = 0.025): SungFrame | null {
  if (frames.length === 0) return null
  let lo = 0
  let hi = frames.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (frames[mid].t < t) lo = mid + 1
    else hi = mid
  }
  const cands = [frames[lo - 1], frames[lo], frames[lo + 1]].filter(Boolean) as SungFrame[]
  let best: SungFrame | null = null
  let bestD = Infinity
  for (const f of cands) {
    const d = Math.abs(f.t - t)
    if (d < bestD) {
      bestD = d
      best = f
    }
  }
  return best && bestD <= tolSec ? best : null
}

interface Score {
  matched: number
  meanAbs: number
}

/** Concordância entre cantor e referência para um offset candidato. */
function scoreOffset(
  ref: RefContour,
  from: number,
  to: number,
  sung: SungFrame[],
  offsetSec: number,
): Score {
  let matched = 0
  let sumAbs = 0
  for (let i = from; i <= to; i++) {
    const rm = ref.midi[i]
    if (rm === null || rm === undefined) continue
    const f = sungAt(sung, i / ref.fps + offsetSec)
    if (!f || f.midi === null || f.clarity < MIN_CLARITY) continue
    const d = Math.abs(foldOctave(f.midi - rm))
    if (d <= MATCH_SEMITONES) {
      matched++
      sumAbs += d
    }
  }
  return { matched, meanAbs: matched ? sumAbs / matched : Infinity }
}

/**
 * Estima offset e oitava de uma frase.
 *
 * A oitava é decidida DEPOIS do offset, e vale para a frase inteira: dobrar oitava
 * frame a frame esconderia um erro real de oitava no meio da frase (perda de
 * referência), que é exatamente uma coisa que o diagnóstico quer ver.
 */
export function alignPhrase(
  ref: RefContour,
  phrase: KaraokePhrase,
  sung: SungFrame[],
  maxOffsetMs = MAX_OFFSET_MS,
): PhraseAlignment {
  const from = Math.max(0, Math.round(phrase.startSec * ref.fps))
  const to = Math.min(ref.midi.length - 1, Math.round(phrase.endSec * ref.fps))

  let bestOffsetMs = 0
  let best: Score = { matched: -1, meanAbs: Infinity }
  for (let ms = -maxOffsetMs; ms <= maxOffsetMs; ms += OFFSET_STEP_MS) {
    const s = scoreOffset(ref, from, to, sung, ms / 1000)
    // mais frames concordando ganha; empate desempata por erro médio menor
    if (s.matched > best.matched || (s.matched === best.matched && s.meanAbs < best.meanAbs)) {
      best = s
      bestOffsetMs = ms
    }
  }

  if (best.matched < MIN_MATCHED_FRAMES) {
    return {
      phraseIndex: phrase.index,
      offsetMs: 0,
      octaveOffset: 0,
      matchedFrames: Math.max(0, best.matched),
      reliable: false,
    }
  }

  // oitava da frase = mediana das oitavas frame a frame, no offset escolhido
  const octs: number[] = []
  for (let i = from; i <= to; i++) {
    const rm = ref.midi[i]
    if (rm === null || rm === undefined) continue
    const f = sungAt(sung, i / ref.fps + bestOffsetMs / 1000)
    if (!f || f.midi === null || f.clarity < MIN_CLARITY) continue
    octs.push(Math.round((f.midi - rm) / 12))
  }
  octs.sort((a, b) => a - b)
  const octaveOffset = octs.length ? octs[octs.length >> 1] : 0

  return {
    phraseIndex: phrase.index,
    offsetMs: bestOffsetMs,
    octaveOffset,
    matchedFrames: best.matched,
    reliable: true,
  }
}

/** Alinha todas as frases da faixa. */
export function alignPhrases(
  ref: RefContour,
  phrases: KaraokePhrase[],
  sung: SungFrame[],
): PhraseAlignment[] {
  return phrases.map((p) => alignPhrase(ref, p, sung))
}

/**
 * Tendência rítmica global: mediana dos offsets das frases confiáveis.
 *
 * Isto NÃO é latência residual — latência já foi calibrada e removida antes. É
 * condução: entrar sistematicamente atrás (ou à frente) da referência. Só faz sentido
 * reportar com um número mínimo de frases confiáveis, senão é ruído com cara de achado.
 */
export function rhythmicTendencyMs(
  alignments: PhraseAlignment[],
  minPhrases = 5,
): { medianMs: number; phrases: number; reportable: boolean } {
  const xs = alignments.filter((a) => a.reliable).map((a) => a.offsetMs)
  if (xs.length < minPhrases) return { medianMs: 0, phrases: xs.length, reportable: false }
  xs.sort((a, b) => a - b)
  const m = xs.length >> 1
  const medianMs = xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2
  return { medianMs, phrases: xs.length, reportable: true }
}
