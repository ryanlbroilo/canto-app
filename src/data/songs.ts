// MÚSICAS (S6) — catálogo estático pra cantar no app. Melodia como sequência de
// notas cronometradas (beat-based) + letra sílaba-a-sílaba + metadados de licença.
// Conteúdo SEGURO: autoral (obra original, on-theme com "músicas autorais") +
// domínio público (com letra autoral). Nada de obra protegida antes de CCLI (§7).
//
// A melodia é o degrau pro sing-along pontuado: no modo "Cantar", o app corre a
// melodia no relógio e compara o pitch do cantor com a nota-alvo (score-following
// leve). Transpõe pro range confortável do cantor (como os exercícios/harmonia).

import { VocalBaseline } from './types'

export type SongSource = 'autoral' | 'dominio-publico'

export interface SongNote {
  /** pitch MIDI (C4 = 60) na oitava de referência (transposta em runtime) */
  midi: number
  /** início em beats a partir do começo (semínima = 1 beat) */
  beat: number
  /** duração em beats */
  beats: number
  /** sílaba/palavra alinhada a esta nota */
  lyric: string
}

export interface Song {
  id: string
  title: string
  composer: string
  source: SongSource
  /** crédito/observação de licença exibido na UI */
  sourceNote: string
  bpm: number
  /** rótulo de tom pra exibição (a transposição real segue o range do cantor) */
  keyLabel: string
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  notes: SongNote[]
}

// atalho pra escrever a melodia enxuta: n(midi, beat, beats, lyric)
const n = (midi: number, beat: number, beats: number, lyric: string): SongNote => ({ midi, beat, beats, lyric })

// notas MIDI usadas: C4=60 D4=62 E4=64 F4=65 G4=67 A4=69
export const SONGS: Song[] = [
  {
    id: 'escada-louvor',
    title: 'Escada de Louvor',
    composer: 'Canto (autoral)',
    source: 'autoral',
    sourceNote: 'Melodia autoral — livre pra treinar',
    bpm: 88,
    keyLabel: 'Dó maior',
    difficulty: 1,
    tags: ['aquecimento', 'autoral', 'fácil'],
    notes: [
      n(60, 0, 1, 'Vou'),
      n(62, 1, 1, 'su-'),
      n(64, 2, 1, 'bir'),
      n(65, 3, 1, 'pra'),
      n(67, 4, 1, 'Ti'),
      n(65, 5, 1, 'Se-'),
      n(64, 6, 1, 'nhor'),
      n(62, 7, 1, 'meu'),
      n(60, 8, 2, 'Deus'),
    ],
  },
  {
    id: 'coracao-grato',
    title: 'Coração Grato',
    composer: 'Canto (autoral)',
    source: 'autoral',
    sourceNote: 'Melodia autoral — livre pra treinar',
    bpm: 80,
    keyLabel: 'Dó maior',
    difficulty: 2,
    tags: ['louvor', 'autoral', 'lento'],
    notes: [
      n(67, 0, 1, 'Meu'),
      n(64, 1, 1, 'co-'),
      n(60, 2, 1, 'ra-'),
      n(62, 3, 1, 'ção'),
      n(64, 4, 1, 'é'),
      n(64, 5, 1, 'gra-'),
      n(62, 6, 1, 'to'),
      n(60, 7, 2, 'a Ti'),
    ],
  },
  {
    id: 'alegria',
    title: 'Alegria',
    composer: 'L. v. Beethoven',
    source: 'dominio-publico',
    sourceNote: 'Melodia "Ode à Alegria" (domínio público) · letra autoral',
    bpm: 100,
    keyLabel: 'Dó maior',
    difficulty: 2,
    tags: ['louvor', 'clássico', 'alegre'],
    notes: [
      n(64, 0, 1, 'A-'),
      n(64, 1, 1, 'le-'),
      n(65, 2, 1, 'gri-'),
      n(67, 3, 1, 'a'),
      n(67, 4, 1, 'vem'),
      n(65, 5, 1, 'lou-'),
      n(64, 6, 1, 'var'),
      n(62, 7, 1, 'ao'),
      n(60, 8, 1, 'Se-'),
      n(60, 9, 1, 'nhor'),
      n(62, 10, 1, 'com'),
      n(64, 11, 1, 'to-'),
      n(64, 12, 1.5, 'do'),
      n(62, 13.5, 0.5, 'a-'),
      n(60, 14, 2, 'mor'),
    ],
  },
  {
    id: 'tua-graca',
    title: 'Tua Graça',
    composer: 'Canto (autoral)',
    source: 'autoral',
    sourceNote: 'Melodia autoral — livre pra treinar',
    bpm: 76,
    keyLabel: 'Dó maior',
    difficulty: 3,
    tags: ['louvor', 'autoral', 'extensão'],
    notes: [
      n(60, 0, 1, 'Tu-'),
      n(64, 1, 1, 'a'),
      n(67, 2, 1, 'gra-'),
      n(69, 3, 1, 'ça'),
      n(67, 4, 1, 'me'),
      n(64, 5, 1, 'sus-'),
      n(65, 6, 1, 'ten-'),
      n(62, 7, 1, 'ta,'),
      n(60, 8, 2, 'Deus'),
    ],
  },
]

export const getSong = (id: string): Song | undefined => SONGS.find((s) => s.id === id)

/** exerciseId gravado na sessão (namespaced → inerte pro currículo, como harmony:*). */
export const songSessionId = (id: string): string => `song:${id}`

export const secPerBeat = (bpm: number): number => 60 / bpm

/** Duração total da música em segundos. */
export function songDurationSec(song: Song): number {
  const end = Math.max(...song.notes.map((x) => x.beat + x.beats))
  return end * secPerBeat(song.bpm)
}

/** Extensão (MIDI) da melodia [grave, agudo]. */
export function songRange(song: Song): { lo: number; hi: number } {
  const midis = song.notes.map((x) => x.midi)
  return { lo: Math.min(...midis), hi: Math.max(...midis) }
}

function clampNum(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/**
 * Semitons a somar na melodia pra centralizá-la no range confortável do cantor
 * (mesma ideia da transposição dos exercícios/harmonia). 0 sem baseline.
 */
export function songTranspose(song: Song, baseline: VocalBaseline | null): number {
  if (!baseline) return 0
  const { lo, hi } = songRange(song)
  const center = (baseline.lowMidi + baseline.highMidi) / 2
  const songCenter = (lo + hi) / 2
  let shift = Math.round(center - songCenter)
  const minShift = baseline.lowMidi - lo
  const maxShift = baseline.highMidi - hi
  if (minShift <= maxShift) shift = clampNum(shift, minShift, maxShift)
  return shift
}

export interface TimedNote {
  index: number
  midi: number
  startSec: number
  endSec: number
  lyric: string
}

/** Melodia com tempos absolutos (segundos) e pitch já transposto. */
export function timedNotes(song: Song, shift: number): TimedNote[] {
  const spb = secPerBeat(song.bpm)
  return song.notes.map((x, i) => ({
    index: i,
    midi: x.midi + shift,
    startSec: x.beat * spb,
    endSec: (x.beat + x.beats) * spb,
    lyric: x.lyric,
  }))
}

/** Texto corrido da letra (pra prévia/compartilhamento). */
export const songLyrics = (song: Song): string => song.notes.map((x) => x.lyric).join(' ')
