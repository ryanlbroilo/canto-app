// Detecção de passaggio/registro (o "moat").
//
// Filosofia honesta (da fundamentação): o rótulo fisiológico de registro
// (peito/mix/cabeça/falsete = mecanismo laríngeo) NÃO é MENSURÁVEL só do
// microfone — é inferência. O que É robusto e defensável:
//   1) DETECÇÃO DO EVENTO de quebra (salto de F0 + queda de RMS + mudança de
//      tilt espectral) — sinal claro, em tempo real.
//   2) ESTIMATIVA de ZONA (peito/mix/cabeça/falsete) a partir de features
//      acústicas (tilt, H1-H2, centróide, F0 relativo ao passaggio do usuário).
//      É ESTIMATIVA, não laudo — os pesos abaixo são um v1 a calibrar com dados
//      reais (idealmente um dataset PT-BR validado por professor/EGG).

export type RegisterZone = 'peito' | 'mix' | 'cabeça' | 'falsete'

export interface RegisterState {
  zone: RegisterZone | null
  /** Confiança da estimativa de zona (0..1) — margem entre as duas melhores */
  confidence: number
  /** Evento pontual detectado neste frame */
  event: 'quebra' | null
}

export interface RegisterConfig {
  /** Nota (MIDI) aproximada do passaggio do usuário (calibrável) */
  passaggioMidi: number
  lowMidi: number
  highMidi: number
}

interface FrameFeat {
  f0: number | null
  rms: number
  tilt?: number
  centroid?: number
  h1h2?: number
}

const ZERO: Record<RegisterZone, number> = { peito: 0, mix: 0, cabeça: 0, falsete: 0 }

export class RegisterEstimator {
  private prev: { f0: number; rms: number; tilt: number } | null = null
  private lastEventT = -Infinity
  private smooth: Record<RegisterZone, number> = { ...ZERO }
  private cfg: RegisterConfig = { passaggioMidi: 64, lowMidi: 45, highMidi: 69 }

  configure(cfg: Partial<RegisterConfig>) {
    this.cfg = { ...this.cfg, ...cfg }
    // Passaggio default = ~55% da extensão, se não calibrado explicitamente.
    if (cfg.passaggioMidi === undefined && cfg.lowMidi !== undefined && cfg.highMidi !== undefined) {
      this.cfg.passaggioMidi = Math.round(cfg.lowMidi + 0.55 * (cfg.highMidi - cfg.lowMidi))
    }
  }

  reset() {
    this.prev = null
    this.smooth = { ...ZERO }
    this.lastEventT = -Infinity
  }

  process(f: FrameFeat, tMs: number): RegisterState {
    if (f.f0 == null || f.f0 <= 0) {
      this.prev = null
      return { zone: null, confidence: 0, event: null }
    }
    const f0 = f.f0
    const rms = f.rms
    const tilt = f.tilt ?? 0
    const h1h2 = f.h1h2 ?? 0
    const midi = 69 + 12 * Math.log2(f0 / 440)

    // ---- 1) Evento de quebra: salto de F0 + queda de RMS + mudança de tilt ----
    let event: 'quebra' | null = null
    if (this.prev) {
      const jumpSemis = 12 * Math.abs(Math.log2(f0 / this.prev.f0))
      const rmsDrop = this.prev.rms > 0 ? (this.prev.rms - rms) / this.prev.rms : 0
      const tiltJump = Math.abs(tilt - this.prev.tilt)
      if (jumpSemis > 4 && rmsDrop > 0.3 && tiltJump > 1.2 && tMs - this.lastEventT > 300) {
        event = 'quebra'
        this.lastEventT = tMs
      }
    }
    this.prev = { f0, rms, tilt }

    // ---- 2) Estimativa de zona (heurística acústica) ----
    const pos = midi - this.cfg.passaggioMidi // semitons acima(+)/abaixo(-) do passaggio
    const bright = clamp01((tilt + 12) / 12) // tilt alto (menos negativo) → brilhante (peito)
    const breathy = clamp01(h1h2 / 15) // H1-H2 alto → breathy/falsete

    const scores: Record<RegisterZone, number> = {
      peito: -pos * 0.5 + bright * 2 - breathy * 1.5,
      cabeça: pos * 0.35 + bright * 1 - breathy * 0.5,
      falsete: pos * 0.35 + breathy * 2.5 - bright * 1,
      mix: 1.2 - Math.abs(pos) * 0.25 + (0.5 - Math.abs(bright - 0.5)),
    }
    // suavização exponencial (evita flicker de zona)
    const keys: RegisterZone[] = ['peito', 'mix', 'cabeça', 'falsete']
    for (const k of keys) this.smooth[k] = this.smooth[k] * 0.7 + scores[k] * 0.3

    let best: RegisterZone = 'mix'
    let bestV = -Infinity
    let second = -Infinity
    for (const k of keys) {
      const v = this.smooth[k]
      if (v > bestV) {
        second = bestV
        bestV = v
        best = k
      } else if (v > second) {
        second = v
      }
    }
    const confidence = clamp01((bestV - second) / 3)
    return { zone: best, confidence, event }
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
