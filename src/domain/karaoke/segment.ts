// Limpeza e segmentação do contorno de F0 da referência em NOTAS.
//
// TS puro, sem I/O e sem dependência de runtime: roda na CLI de importação e é
// testável direto (scripts/test-karaoke.mjs). Trabalha em MIDI float, nunca em Hz —
// erro em Hz não é perceptualmente uniforme, e todo o resto do app já pensa em
// semitons/cents.
//
// A armadilha central aqui é a quantização. Arredondar cada frame para o inteiro
// mais próximo parece óbvio e está errado: uma nota sustentada com vibrato de ±80
// cents em cima de 60,5 alterna entre 60 e 61 dezenas de vezes e vira sopa de notas
// curtas. Por isso a segmentação é por HISTERESE com confirmação temporal — a nota
// só troca quando o contorno se afasta o bastante E fica afastado tempo suficiente.

import type { TimedNote } from '../../data/songs'
import type { KaraokePhrase } from './track'
import { median } from './stats'

/** Distância (semitons) do centro da nota que ainda conta como "a mesma nota". */
export const HOLD_SEMITONES = 0.7
/** Tempo afastado necessário para confirmar troca de nota (ms). */
export const CHANGE_CONFIRM_MS = 60
/**
 * Janela da mediana CENTRADA que remove o vibrato antes de segmentar (ms).
 *
 * Precisa cobrir ~1 período do vibrato mais lento que se queira ignorar (4 Hz = 250 ms;
 * 5,5 Hz típico = 182 ms). Custo conhecido e aceito: notas mais curtas que ~metade da
 * janela são absorvidas, ou seja, melisma acima de ~10 notas/s não é segmentado.
 */
export const SPINE_WINDOW_MS = 200
/** Ilhas vozeadas mais curtas que isto são ruído, não nota (ms). */
export const MIN_ISLAND_MS = 60
/** Buracos não-vozeados mais curtos que isto são consoante, e são interpolados (ms). */
export const MAX_GAP_FILL_MS = 50
/** Notas mais curtas que isto são descartadas (ms). */
export const MIN_NOTE_MS = 80
/** Silêncio que fecha uma frase (ms). */
export const PHRASE_GAP_MS = 350

/**
 * Mediana móvel de 3 sobre os frames VÁLIDOS. Mata o glitch de oitava do detector
 * (um frame isolado uma oitava fora) sem borrar transição real de nota, porque a
 * mediana de 3 preserva degrau.
 */
export function medianFilter3(midi: (number | null)[]): (number | null)[] {
  const out = midi.slice()
  for (let i = 1; i < midi.length - 1; i++) {
    const a = midi[i - 1]
    const b = midi[i]
    const c = midi[i + 1]
    if (a !== null && b !== null && c !== null) out[i] = median([a, b, c])
  }
  return out
}

/** Remove trechos vozeados curtos demais para serem nota. */
export function removeShortIslands(
  midi: (number | null)[],
  fps: number,
  minMs = MIN_ISLAND_MS,
): (number | null)[] {
  const out = midi.slice()
  const minFrames = Math.max(1, Math.round((minMs / 1000) * fps))
  let start = -1
  for (let i = 0; i <= out.length; i++) {
    const voiced = i < out.length && out[i] !== null
    if (voiced && start < 0) start = i
    else if (!voiced && start >= 0) {
      if (i - start < minFrames) for (let j = start; j < i; j++) out[j] = null
      start = -1
    }
  }
  return out
}

/**
 * Interpola buracos curtos. Consoante surda no meio de uma palavra ("ca-SA") apaga
 * o F0 por 20–40 ms; sem preencher, cada sílaba viraria uma nota separada e a
 * duração das notas — que é a condição do diagnóstico de sustentação — ficaria toda
 * subestimada.
 */
export function fillShortGaps(
  midi: (number | null)[],
  fps: number,
  maxMs = MAX_GAP_FILL_MS,
): (number | null)[] {
  const out = midi.slice()
  const maxFrames = Math.max(1, Math.round((maxMs / 1000) * fps))
  let i = 0
  while (i < out.length) {
    if (out[i] !== null) {
      i++
      continue
    }
    let j = i
    while (j < out.length && out[j] === null) j++
    const before = i > 0 ? out[i - 1] : null
    const after = j < out.length ? out[j] : null
    if (before !== null && after !== null && j - i <= maxFrames) {
      const span = j - i + 1
      for (let k = i; k < j; k++) out[k] = before + ((after - before) * (k - i + 1)) / span
    }
    i = j
  }
  return out
}

/**
 * Mediana CENTRADA — o "espinho" do contorno, com o vibrato removido.
 *
 * Não-causal de propósito: isto roda offline, na importação, então dá para olhar o
 * futuro. É o que resolve o problema que uma mediana causal não resolve — durante o
 * primeiro período de um vibrato, qualquer estimador causal de centro persegue a
 * oscilação em vez do centro, e a nota racha a cada meio período.
 *
 * Mediana e não média porque mediana PRESERVA DEGRAU: a fronteira entre duas notas
 * sai no mesmo frame em que estava, sem o deslocamento de meia janela que uma média
 * móvel introduziria — e deslocamento de fronteira vira erro de tempo no relatório.
 */
export function medianSpine(
  midi: (number | null)[],
  fps: number,
  windowMs = SPINE_WINDOW_MS,
): (number | null)[] {
  const half = Math.max(1, Math.round(((windowMs / 1000) * fps) / 2))
  const out: (number | null)[] = new Array(midi.length).fill(null)
  const buf: number[] = []
  for (let i = 0; i < midi.length; i++) {
    if (midi[i] === null) continue // silêncio continua silêncio
    buf.length = 0
    const a = Math.max(0, i - half)
    const b = Math.min(midi.length - 1, i + half)
    for (let j = a; j <= b; j++) {
      const v = midi[j]
      if (v !== null) buf.push(v)
    }
    out[i] = buf.length ? median(buf) : midi[i]
  }
  return out
}

export interface SegmentOptions {
  holdSemitones?: number
  changeConfirmMs?: number
  minNoteMs?: number
  spineWindowMs?: number
}

/**
 * Segmenta o contorno limpo em notas por histerese sobre o espinho.
 *
 * A decisão de FRONTEIRA sai do espinho (sem vibrato, estável desde o primeiro frame);
 * a ALTURA de cada nota sai do contorno cru dentro do intervalo dela — assim uma nota
 * ornamentada continua com o centro correto em vez do centro do espinho.
 */
export function segmentNotes(
  midi: (number | null)[],
  fps: number,
  opts: SegmentOptions = {},
): TimedNote[] {
  const hold = opts.holdSemitones ?? HOLD_SEMITONES
  const confirmFrames = Math.max(
    1,
    Math.round(((opts.changeConfirmMs ?? CHANGE_CONFIRM_MS) / 1000) * fps),
  )
  const minFrames = Math.max(1, Math.round(((opts.minNoteMs ?? MIN_NOTE_MS) / 1000) * fps))
  const spine = medianSpine(midi, fps, opts.spineWindowMs)

  const notes: TimedNote[] = []
  let center = 0
  let count = 0
  let startIdx = -1
  let pending = 0
  let changeStart = -1

  const close = (endIdx: number): void => {
    if (startIdx >= 0 && count >= minFrames) {
      const raw: number[] = []
      for (let j = startIdx; j < endIdx; j++) {
        const v = midi[j]
        if (v !== null) raw.push(v)
      }
      if (raw.length) {
        notes.push({
          index: notes.length,
          midi: Math.round(median(raw)),
          startSec: startIdx / fps,
          endSec: endIdx / fps,
          lyric: '',
        })
      }
    }
    startIdx = -1
    count = 0
    pending = 0
    changeStart = -1
  }

  const open = (i: number, v: number): void => {
    startIdx = i
    center = v
    count = 1
    pending = 0
    changeStart = -1
  }

  for (let i = 0; i < spine.length; i++) {
    const v = spine[i]
    if (v === null) {
      close(i)
      continue
    }
    if (startIdx < 0) {
      open(i, v)
      continue
    }
    if (Math.abs(v - center) <= hold) {
      // média incremental do espinho: já sem vibrato, não precisa de mediana aqui
      count++
      center += (v - center) / count
      pending = 0
      changeStart = -1
      continue
    }
    if (changeStart < 0) changeStart = i
    pending++
    if (pending >= confirmFrames) {
      // A nota nova começa onde o desvio começou, não onde ele foi confirmado —
      // senão os frames de transição somem e as notas ficam com buraco entre elas.
      const cut = changeStart
      close(cut)
      const sv = spine[cut]
      if (sv !== null) {
        open(cut, sv)
        // reprocessa os frames de transição na nota NOVA — eles pertencem a ela,
        // e não contá-los subestimaria a duração mínima de notas curtas
        for (let j = cut + 1; j <= i; j++) {
          const w = spine[j]
          if (w === null) continue
          count++
          center += (w - center) / count
        }
      }
    }
  }
  close(spine.length)
  return notes
}

/** Reindexa notas em ordem, mantendo `index` coerente com a posição no array. */
export function reindex(notes: TimedNote[]): TimedNote[] {
  return notes.map((n, i) => ({ ...n, index: i }))
}

/**
 * Une notas vizinhas de mesmo MIDI separadas por um buraco curto. Depois do
 * preenchimento de gaps ainda sobram casos (respiração curta no meio de uma nota
 * longa) que devem contar como UMA nota sustentada — é exatamente a condição que o
 * diagnóstico de sustentação procura.
 */
export function mergeAdjacent(notes: TimedNote[], maxGapMs = 50): TimedNote[] {
  if (notes.length === 0) return notes
  const out: TimedNote[] = [{ ...notes[0] }]
  for (let i = 1; i < notes.length; i++) {
    const prev = out[out.length - 1]
    const cur = notes[i]
    const gapMs = (cur.startSec - prev.endSec) * 1000
    if (cur.midi === prev.midi && gapMs <= maxGapMs) prev.endSec = cur.endSec
    else out.push({ ...cur })
  }
  return reindex(out)
}

/** Agrupa notas em frases; silêncio >= PHRASE_GAP_MS fecha a frase. */
export function groupPhrases(notes: TimedNote[], gapMs = PHRASE_GAP_MS): KaraokePhrase[] {
  const phrases: KaraokePhrase[] = []
  let cur: number[] = []
  const flush = (): void => {
    if (cur.length === 0) return
    phrases.push({
      index: phrases.length,
      startSec: notes[cur[0]].startSec,
      endSec: notes[cur[cur.length - 1]].endSec,
      noteIdx: cur,
    })
    cur = []
  }
  for (let i = 0; i < notes.length; i++) {
    if (cur.length > 0 && (notes[i].startSec - notes[i - 1].endSec) * 1000 >= gapMs) flush()
    cur.push(i)
  }
  flush()
  return phrases
}

/** Pipeline completo: contorno cru → notas + frases. */
export function contourToNotes(
  midi: (number | null)[],
  fps: number,
): { notes: TimedNote[]; phrases: KaraokePhrase[] } {
  const cleaned = fillShortGaps(removeShortIslands(medianFilter3(midi), fps), fps)
  const notes = mergeAdjacent(segmentNotes(cleaned, fps))
  return { notes, phrases: groupPhrases(notes) }
}
