// PERFIL DE EXIGÊNCIA da música — quanto ela cobra de cada fundamento.
//
// Serve à bifurcação que separa diagnóstico de ladainha: quando um fundamento falha
// num eixo que a música quase não cobra, é déficit seu; quando falha num eixo que ela
// cobra muito acima do seu nível, a música é que está errada para você. Sem isso o
// app te acusa de desafinar numa música três semitons fora do seu alcance.
//
// Só entra aqui o que dá para medir SEM saber quem canta. `passaggio` e `ressonancia`
// dependem do tipo vocal e da tessitura do cantor e são calculados no app, em cima de
// `track.notes`. O tipo AbsoluteDemandSkill documenta esse limite.

import type { TimedNote } from '../../data/songs'
import { midiToFreq } from '../../audio/notes'
import { analyzeVibratoFromF0 } from '../../audio/vibrato'
import type { KaraokePhrase, SongDemand, SongDemandRaw } from './track'
import { median } from './stats'

/** Nota acima disto conta como "sustentada" (s). */
export const LONG_NOTE_SEC = 1.2
/** Salto a partir disto exige audiação intervalar, não condução por grau conjunto. */
export const LEAP_SEMITONES = 5

/**
 * ÂNCORAS DE CALIBRAÇÃO — escolhas, não medições.
 *
 * Cada par é (valor que mapeia para 0, valor que mapeia para 1). Foram fixados por
 * julgamento sobre repertório pop/MPB típico, não derivados de dados. Estão isolados
 * aqui justamente para poderem ser recalibrados quando houver histórico real, sem
 * caçar número mágico espalhado pelo código.
 */
export const DEMAND_ANCHORS = {
  /** semitons de extensão: uma oitava larga é comum; duas é extremo */
  extensao: [8, 24],
  /** fração de notas longas */
  sustentacao: [0, 0.25],
  /** duração mediana de frase (s) */
  respiracao: [3, 10],
  /** fração de transições que são salto */
  afinacao: [0, 0.3],
  /** fração de notas longas com vibrato na referência */
  vibrato: [0, 0.5],
} as const

const norm = (v: number, [lo, hi]: readonly [number, number] | number[]): number => {
  if (hi === lo) return 0
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}

/** Extrai o trecho do contorno correspondente a uma nota, em Hz, só frames vozeados. */
function noteHz(note: TimedNote, contourMidi: (number | null)[], fps: number): number[] {
  const a = Math.max(0, Math.round(note.startSec * fps))
  const b = Math.min(contourMidi.length, Math.round(note.endSec * fps))
  const out: number[] = []
  for (let i = a; i < b; i++) {
    const m = contourMidi[i]
    if (m !== null) out.push(midiToFreq(m))
  }
  return out
}

export function computeDemand(
  notes: TimedNote[],
  phrases: KaraokePhrase[],
  contourMidi: (number | null)[],
  fps: number,
): SongDemand {
  const empty: SongDemandRaw = {
    loMidi: 0,
    hiMidi: 0,
    rangeSemitones: 0,
    medianNoteSec: 0,
    longNotePct: 0,
    medianPhraseSec: 0,
    maxPhraseSec: 0,
    leapPct: 0,
    notesPerSec: 0,
    vibratoNotePct: 0,
    scoredNotes: notes.length,
  }
  if (notes.length === 0) {
    return { extensao: 0, sustentacao: 0, respiracao: 0, afinacao: 0, vibrato: 0, raw: empty }
  }

  const midis = notes.map((n) => n.midi)
  const durs = notes.map((n) => n.endSec - n.startSec)
  const loMidi = Math.min(...midis)
  const hiMidi = Math.max(...midis)
  const rangeSemitones = hiMidi - loMidi

  const longNotes = notes.filter((n) => n.endSec - n.startSec > LONG_NOTE_SEC)
  const longNotePct = longNotes.length / notes.length

  const phraseDurs = phrases.map((p) => p.endSec - p.startSec)
  const medianPhraseSec = phraseDurs.length ? median(phraseDurs) : 0
  const maxPhraseSec = phraseDurs.length ? Math.max(...phraseDurs) : 0

  // Saltos só contam DENTRO da frase: o intervalo entre a última nota de uma frase e
  // a primeira da seguinte não é salto cantado, é uma respiração no meio.
  let leaps = 0
  let transitions = 0
  for (const p of phrases) {
    for (let k = 1; k < p.noteIdx.length; k++) {
      transitions++
      if (Math.abs(notes[p.noteIdx[k]].midi - notes[p.noteIdx[k - 1]].midi) >= LEAP_SEMITONES) {
        leaps++
      }
    }
  }
  const leapPct = transitions ? leaps / transitions : 0

  const sungSec = phraseDurs.reduce((a, c) => a + c, 0)
  const notesPerSec = sungSec > 0 ? notes.length / sungSec : 0

  let vibratoNotes = 0
  for (const n of longNotes) {
    if (analyzeVibratoFromF0(noteHz(n, contourMidi, fps), fps).present) vibratoNotes++
  }
  const vibratoNotePct = longNotes.length ? vibratoNotes / longNotes.length : 0

  const raw: SongDemandRaw = {
    loMidi,
    hiMidi,
    rangeSemitones,
    medianNoteSec: median(durs),
    longNotePct,
    medianPhraseSec,
    maxPhraseSec,
    leapPct,
    notesPerSec,
    vibratoNotePct,
    scoredNotes: notes.length,
  }

  return {
    extensao: norm(rangeSemitones, DEMAND_ANCHORS.extensao),
    sustentacao: norm(longNotePct, DEMAND_ANCHORS.sustentacao),
    respiracao: norm(medianPhraseSec, DEMAND_ANCHORS.respiracao),
    afinacao: norm(leapPct, DEMAND_ANCHORS.afinacao),
    vibrato: norm(vibratoNotePct, DEMAND_ANCHORS.vibrato),
    raw,
  }
}
