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

// Histerese de zona (anti-flicker perto do passaggio):
// só troca a zona "estável" quando a candidata (argmax do score suavizado) supera
// a estável atual por uma MARGEM clara E persiste por alguns frames. Fora disso a
// zona fica sticky. Conservador: não regride a qualidade da estimativa, só evita
// que a zona pisque num ponto de fronteira.
const ZONE_SWITCH_MARGIN = 0.6 // candidata precisa liderar por +0.6 sobre a estável
const ZONE_SWITCH_FRAMES = 3 // ...e manter essa liderança por N frames p/ trocar

export class RegisterEstimator {
  private prev: { f0: number; rms: number; tilt: number } | null = null
  private lastEventT = -Infinity
  private smooth: Record<RegisterZone, number> = { ...ZERO }
  private cfg: RegisterConfig = { passaggioMidi: 64, lowMidi: 45, highMidi: 69 }
  // estado da histerese
  private stableZone: RegisterZone | null = null
  private pendingZone: RegisterZone | null = null // candidata que está "empurrando"
  private pendingCount = 0 // frames consecutivos que a candidata lidera com margem

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
    this.stableZone = null
    this.pendingZone = null
    this.pendingCount = 0
  }

  process(f: FrameFeat, tMs: number): RegisterState {
    if (f.f0 == null || f.f0 <= 0) {
      this.prev = null
      // solta a histerese no silêncio: a próxima nota começa "fresca"
      this.stableZone = null
      this.pendingZone = null
      this.pendingCount = 0
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

    // ---- 3) Histerese booleana (anti-flicker) ----
    // `best` é a candidata instantânea (argmax). A zona REPORTADA é a estável,
    // que só muda quando a candidata lidera a estável por >MARGIN e mantém isso
    // por >FRAMES. Primeira nota (stableZone null) adota a candidata na hora.
    if (this.stableZone === null) {
      this.stableZone = best
      this.pendingZone = null
      this.pendingCount = 0
    } else if (best === this.stableZone) {
      // candidata já é a estável → zera qualquer pressão de troca
      this.pendingZone = null
      this.pendingCount = 0
    } else {
      const margin = this.smooth[best] - this.smooth[this.stableZone]
      if (margin > ZONE_SWITCH_MARGIN) {
        // candidata lidera com margem clara: conta frames consecutivos
        this.pendingCount = this.pendingZone === best ? this.pendingCount + 1 : 1
        this.pendingZone = best
        if (this.pendingCount >= ZONE_SWITCH_FRAMES) {
          this.stableZone = best
          this.pendingZone = null
          this.pendingCount = 0
        }
      } else {
        // margem insuficiente → mantém sticky, dissipa pressão
        this.pendingZone = null
        this.pendingCount = 0
      }
    }

    return { zone: this.stableZone, confidence, event }
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
