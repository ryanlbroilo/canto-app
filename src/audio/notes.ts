// Conversões musicais: frequência (Hz) <-> nota <-> MIDI, e desvio em cents.
// A referência é A4 = 440 Hz (MIDI 69). Cent = 1/100 de semitom.

const A4 = 440
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export interface NoteInfo {
  /** Nome da nota mais próxima, ex.: "A" */
  name: string
  /** Número MIDI da nota mais próxima */
  midi: number
  /** Oitava científica, ex.: 4 em A4 */
  octave: number
  /** Desvio em cents em relação à nota mais próxima (-50..+50) */
  cents: number
}

/** Frequência -> valor MIDI contínuo (fracionário). */
export function freqToMidiFloat(freq: number): number {
  return 69 + 12 * Math.log2(freq / A4)
}

/** Valor MIDI -> frequência (Hz). */
export function midiToFreq(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12)
}

/** Valor MIDI (inteiro) -> nome + oitava. */
export function midiToName(midi: number): { name: string; octave: number } {
  const name = NAMES[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return { name, octave }
}

/** Rótulo curto de uma nota MIDI, ex.: "A4". */
export function midiLabel(midi: number): string {
  const { name, octave } = midiToName(midi)
  return `${name}${octave}`
}

/** Frequência -> nota mais próxima + desvio em cents. */
export function freqToNote(freq: number): NoteInfo {
  const midiF = freqToMidiFloat(freq)
  const midi = Math.round(midiF)
  const cents = Math.round((midiF - midi) * 100)
  const { name, octave } = midiToName(midi)
  return { name, midi, cents, octave }
}

/** Lista de notas selecionáveis para o seletor de alvo (padrão C2..C6). */
export function noteList(lowMidi = 36, highMidi = 84) {
  const out: { midi: number; label: string; freq: number }[] = []
  for (let m = lowMidi; m <= highMidi; m++) {
    out.push({ midi: m, label: midiLabel(m), freq: midiToFreq(m) })
  }
  return out
}
