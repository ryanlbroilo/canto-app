import type { PitchFrame } from '../../audio/PitchEngine'

// Detector PURO (sem React, RN-safe) da "primeira nota afinada" do onboarding.
// Não toca o motor: apenas observa os PitchFrame que o motor já emite. O próprio
// motor calcula a "trava do afinador" (afinado + sustentado) em `locked`/`lockMs`,
// então aqui só esperamos ela ficar ligada por tempo suficiente.

const DEFAULT_THRESHOLD_MS = 700

export interface InTuneCue {
  /** afinado agora? (trava do afinador ligada) */
  inTune: boolean
  /** nome da nota corrente (ex.: "A4") ou null */
  note: string | null
}

export class FirstInTuneDetector {
  private won = false
  constructor(private readonly thresholdMs = DEFAULT_THRESHOLD_MS) {}

  reset(): void {
    this.won = false
  }

  /**
   * Alimenta um frame. Retorna o nome da nota SE este frame fechou a vitória
   * (primeira nota afinada e sustentada >= thresholdMs) — e apenas uma vez.
   */
  feed(f: PitchFrame): string | null {
    if (this.won) return null
    if (f.locked && (f.lockMs ?? 0) >= this.thresholdMs) {
      this.won = true
      return noteName(f) ?? 'sua nota'
    }
    return null
  }

  /** Deixa visual do frame atual (afinado? qual nota?) — para o cue ao vivo. */
  static cue(f: PitchFrame): InTuneCue {
    return { inTune: !!f.locked, note: noteName(f) }
  }
}

function noteName(f: PitchFrame): string | null {
  return f.note ? `${f.note.name}${f.note.octave}` : null
}
