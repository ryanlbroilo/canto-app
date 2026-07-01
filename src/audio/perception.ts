// Camada perceptual do motor de captação (o "acabamento" entre o F0 cru e a tela).
//
// Filosofia: o núcleo DSP entrega features CRUAS frame-a-frame (F0, clarity, rms).
// Jogadas direto na UI, elas parecem "frias": a agulha treme, a nota pisca no
// silêncio, não há noção de ataque/sustentação, nem de "acertei e travei". Esta
// camada é STATEFUL (uma instância por sessão de captação) e transforma esses
// números em sinais SUAVES e com ESTADO, sem esconder o F0 cru (que segue exposto
// para compatibilidade). Tudo TS puro, barato, roda no main thread por frame.
//
// Honestidade científica: nada aqui "mede" mais do que o DSP já mediu. São
// filtros perceptuais (mediana, EMA, histerese, envelopes) — deixam a leitura
// estável e legível, não inventam precisão que o sinal não tem.

import { freqToMidiFloat, midiToFreq, freqToNote } from './notes'

/** Entrada por frame: F0 já gated (null = unvoiced), clarity/rms crus, tempo. */
export interface PerceptionInput {
  f0: number | null
  clarity: number
  rms: number
  /** Timestamp em ms (performance.now()) — a camada é robusta a fps variável. */
  tMs: number
}

/** Máquina de estado por nota cantada. */
export type NoteState = 'silent' | 'onset' | 'sustain' | 'release'

/** Struct perceptual devolvida a cada push(). Todos os campos são "prontos p/ UI". */
export interface Perception {
  /** F0 suavizado perceptualmente (Hz) ou null quando realmente em silêncio. */
  smoothedFreq: number | null
  /** Estado da nota atual (silent/onset/sustain/release). */
  noteState: NoteState
  /** True quando afinado e sustentado o bastante (trava de afinador). */
  locked: boolean
  /** Há quanto tempo (ms) está travado; 0 se não travado. */
  lockMs: number
  /** Loudness perceptual suave 0..1 (envelope attack rápido / decay lento). */
  dynamics: number
  /** Estabilidade de curto prazo 0..1 (1 = nota firme, sem jitter). */
  steadiness: number
  /** Relação sinal/ruído estimada (dB) contra piso adaptativo. */
  snr: number
  /** True quando snr acima do limiar — sinal "mais inteligente" que o gate fixo. */
  aboveNoise: boolean
}

// ---- Constantes de sintonia (todas em unidades físicas / ms para clareza) ----

// Suavização de F0
const MEDIAN_N = 3 // mediana das últimas N amostras válidas (mata octave glitch)
const TAU_FAST_MS = 12 // EMA responsivo quando clarity alta
const TAU_SLOW_MS = 40 // EMA suave quando clarity baixa
const UNVOICED_HOLD_MS = 90 // segura o último F0 por um tempinho antes de zerar

// Máquina de estado da nota
const ONSET_MIN_MS = 50 // ataques mais curtos que isto são espúrios (rejeitados)
const ONSET_STABLE_CENTS = 30 // variação de F0 abaixo disto conta como "estável"
const ONSET_TO_SUSTAIN_MS = 90 // F0 estável por este tempo → sustain
const RELEASE_TIMEOUT_MS = 180 // release → silent após este silêncio

// Trava de afinador
const LOCK_CENTS = 12 // |cents| abaixo disto = "afinado"
const LOCK_HOLD_MS = 500 // afinado + clarity alto sustentado por isto → locked
const LOCK_CLARITY_MIN = 0.8 // clarity mínima para contar como afinação "de verdade"

// Envelope de dinâmica (coeficientes por-frame são derivados do dt real)
const DYN_ATTACK_MS = 30 // sobe rápido (attack ~0.3 a 100fps)
const DYN_RELEASE_MS = 250 // desce devagar (decay ~0.06 a 100fps)
const DYN_RMS_FLOOR = 0.004 // rms abaixo disto ≈ silêncio para fins de loudness
const DYN_RMS_CEIL = 0.2 // rms típico de voz forte → topo da faixa útil

// Estabilidade
const STEADY_WINDOW_MS = 250 // janela de análise de jitter
const STEADY_JITTER_FULL = 40 // desvio-padrão de cents que zera a estabilidade

// Piso de ruído adaptativo
const NOISE_WINDOW_MS = 2000 // janela do mínimo móvel de rms
const SNR_THRESHOLD_DB = 9 // acima disto = aboveNoise
const EPS = 1e-6

/**
 * Camada perceptual stateful. Instancie UMA por sessão; chame push() por frame
 * e reset() ao parar. Robusta a fps variável (usa dt real entre frames).
 */
export class PerceptionLayer {
  // --- histórico de F0 (em cents/MIDI-float) para mediana e jitter ---
  private midiHist: number[] = [] // últimas amostras VÁLIDAS (MIDI float) p/ mediana
  private emaMidi: number | null = null // estado do EMA (em MIDI float)
  private lastVoicedTMs = -Infinity // quando vimos F0 válido pela última vez
  private lastEmittedFreq: number | null = null

  // --- janela de cents com timestamp p/ steadiness ---
  private centsWin: { t: number; c: number }[] = []

  // --- máquina de estado da nota ---
  private state: NoteState = 'silent'
  private stateSinceMs = -Infinity // quando entramos no estado atual
  private onsetRefMidi: number | null = null // F0 de referência do ataque
  private onsetStableSinceMs = -Infinity // desde quando F0 está estável no onset
  private lastRms = 0

  // --- trava de afinador ---
  private inTuneSinceMs = -Infinity // desde quando |cents| < LOCK_CENTS c/ clarity alta
  private lockedSinceMs = -Infinity // quando a trava fechou

  // --- envelope de dinâmica ---
  private dyn = 0

  // --- piso de ruído: mínimo móvel de rms numa janela ~2s ---
  private noiseWin: { t: number; r: number }[] = []

  private lastTMs: number | null = null

  reset(): void {
    this.midiHist = []
    this.emaMidi = null
    this.lastVoicedTMs = -Infinity
    this.lastEmittedFreq = null
    this.centsWin = []
    this.state = 'silent'
    this.stateSinceMs = -Infinity
    this.onsetRefMidi = null
    this.onsetStableSinceMs = -Infinity
    this.lastRms = 0
    this.inTuneSinceMs = -Infinity
    this.lockedSinceMs = -Infinity
    this.dyn = 0
    this.noiseWin = []
    this.lastTMs = null
  }

  push(inp: PerceptionInput): Perception {
    const { f0, clarity, rms, tMs } = inp
    // dt real entre frames (robusto a worklet ~60-125fps ou RAF). Clampa p/ não
    // explodir coeficientes num primeiro frame ou após gap.
    const dt = this.lastTMs == null ? 16 : clamp(tMs - this.lastTMs, 1, 200)
    this.lastTMs = tMs
    const voiced = f0 != null && f0 > 0

    // ---------------------------------------------------------------------
    // 1) Piso de ruído adaptativo (independe de voiced — todo rms conta)
    //    Mínimo móvel do rms na janela ~2s = estimativa conservadora do piso.
    // ---------------------------------------------------------------------
    this.noiseWin.push({ t: tMs, r: rms })
    while (this.noiseWin.length && tMs - this.noiseWin[0].t > NOISE_WINDOW_MS) this.noiseWin.shift()
    let floor = Infinity
    for (const s of this.noiseWin) if (s.r < floor) floor = s.r
    if (!isFinite(floor)) floor = rms
    const snr = 20 * Math.log10((rms + EPS) / (floor + EPS))
    const aboveNoise = snr > SNR_THRESHOLD_DB

    // ---------------------------------------------------------------------
    // 2) Dinâmica (loudness perceptual): compressão sqrt do rms na faixa útil
    //    da voz, seguida de envelope assimétrico (attack rápido, release lento).
    // ---------------------------------------------------------------------
    const norm = clamp01((rms - DYN_RMS_FLOOR) / (DYN_RMS_CEIL - DYN_RMS_FLOOR))
    const targetDyn = Math.sqrt(norm) // sqrt ≈ compressão suave (mais range no baixo)
    // coeficiente de 1-pólo derivado do tempo-alvo: alpha = 1 - exp(-dt/tau)
    const aAtk = 1 - Math.exp(-dt / DYN_ATTACK_MS)
    const aRel = 1 - Math.exp(-dt / DYN_RELEASE_MS)
    const a = targetDyn > this.dyn ? aAtk : aRel
    this.dyn += (targetDyn - this.dyn) * a

    // ---------------------------------------------------------------------
    // 3) Suavização perceptual do F0 (o coração: mata o tremor da agulha)
    //    Trabalha em domínio log (MIDI float): mediana-de-3 rejeita outliers e
    //    octave glitches, depois EMA com tau ADAPTATIVO à clarity.
    // ---------------------------------------------------------------------
    let smoothedFreq: number | null = null
    if (voiced) {
      const midi = freqToMidiFloat(f0!)
      // mediana das últimas MEDIAN_N amostras válidas (inclui a atual)
      this.midiHist.push(midi)
      if (this.midiHist.length > MEDIAN_N) this.midiHist.shift()
      const medMidi = median(this.midiHist)
      // tau interpola entre rápido (clarity alta) e lento (clarity baixa)
      const tau = lerp(TAU_SLOW_MS, TAU_FAST_MS, clamp01(clarity))
      const alpha = 1 - Math.exp(-dt / tau)
      this.emaMidi = this.emaMidi == null ? medMidi : this.emaMidi + (medMidi - this.emaMidi) * alpha
      smoothedFreq = midiToFreq(this.emaMidi)
      this.lastVoicedTMs = tMs
      this.lastEmittedFreq = smoothedFreq
    } else if (this.emaMidi != null && tMs - this.lastVoicedTMs < UNVOICED_HOLD_MS) {
      // hold curto: segura o último valor por ~90ms antes de zerar (anti-flicker)
      smoothedFreq = this.lastEmittedFreq
    } else {
      // silêncio real: zera todo o estado de suavização
      this.midiHist = []
      this.emaMidi = null
      this.lastEmittedFreq = null
      smoothedFreq = null
    }

    // ---------------------------------------------------------------------
    // 4) Estabilidade (steadiness): 1 - jitter normalizado dos cents numa
    //    janela ~250ms. Usa o desvio à nota mais próxima do F0 suavizado.
    // ---------------------------------------------------------------------
    let steadiness = 0
    if (smoothedFreq != null) {
      const cents = freqToNote(smoothedFreq).cents
      this.centsWin.push({ t: tMs, c: cents })
      while (this.centsWin.length && tMs - this.centsWin[0].t > STEADY_WINDOW_MS) this.centsWin.shift()
      if (this.centsWin.length >= 3) {
        const sd = stddev(this.centsWin.map((s) => s.c))
        steadiness = clamp01(1 - sd / STEADY_JITTER_FULL)
      }
    } else {
      this.centsWin = []
    }

    // ---------------------------------------------------------------------
    // 5) Máquina de estado da nota
    //    silent → onset (voiced + rms subindo) → sustain (F0 estável ~90ms)
    //          → release (perdeu voicing) → silent (timeout ~180ms).
    //    Ataques < ONSET_MIN_MS são descartados (voltam a silent).
    // ---------------------------------------------------------------------
    const rmsRising = rms > this.lastRms
    const curMidi = smoothedFreq != null ? freqToMidiFloat(smoothedFreq) : null
    switch (this.state) {
      case 'silent':
        if (voiced && rmsRising && rms >= DYN_RMS_FLOOR) {
          this.enter('onset', tMs)
          this.onsetRefMidi = curMidi
          this.onsetStableSinceMs = tMs
        }
        break
      case 'onset':
        if (!voiced) {
          // ataque espúrio (curto demais) → descarta; senão vira release
          this.enter(tMs - this.stateSinceMs < ONSET_MIN_MS ? 'silent' : 'release', tMs)
        } else if (curMidi != null && this.onsetRefMidi != null) {
          const dCents = Math.abs(curMidi - this.onsetRefMidi) * 100
          if (dCents > ONSET_STABLE_CENTS) {
            // ainda deslizando (portamento/scoop): reancora a referência
            this.onsetRefMidi = curMidi
            this.onsetStableSinceMs = tMs
          } else if (tMs - this.onsetStableSinceMs >= ONSET_TO_SUSTAIN_MS && tMs - this.stateSinceMs >= ONSET_MIN_MS) {
            this.enter('sustain', tMs)
          }
        }
        break
      case 'sustain':
        if (!voiced) this.enter('release', tMs)
        break
      case 'release':
        if (voiced && rmsRising) {
          // recomeçou a cantar dentro do timeout → novo ataque
          this.enter('onset', tMs)
          this.onsetRefMidi = curMidi
          this.onsetStableSinceMs = tMs
        } else if (tMs - this.stateSinceMs >= RELEASE_TIMEOUT_MS) {
          this.enter('silent', tMs)
        }
        break
    }
    this.lastRms = rms

    // ---------------------------------------------------------------------
    // 6) Trava de afinador: |cents| < LOCK_CENTS com clarity alta sustentado
    //    por >LOCK_HOLD_MS → locked. lockMs = há quanto tempo travado.
    // ---------------------------------------------------------------------
    let locked = false
    let lockMs = 0
    if (smoothedFreq != null && clarity >= LOCK_CLARITY_MIN) {
      const cents = Math.abs(freqToNote(smoothedFreq).cents)
      if (cents < LOCK_CENTS) {
        if (!isFinite(this.inTuneSinceMs)) this.inTuneSinceMs = tMs
        if (tMs - this.inTuneSinceMs >= LOCK_HOLD_MS) {
          if (!isFinite(this.lockedSinceMs)) this.lockedSinceMs = tMs
          locked = true
          lockMs = tMs - this.lockedSinceMs
        }
      } else {
        // saiu de afinação → destrava
        this.inTuneSinceMs = -Infinity
        this.lockedSinceMs = -Infinity
      }
    } else {
      this.inTuneSinceMs = -Infinity
      this.lockedSinceMs = -Infinity
    }

    return { smoothedFreq, noteState: this.state, locked, lockMs, dynamics: this.dyn, steadiness, snr, aboveNoise }
  }

  /** Transição de estado com carimbo de tempo. */
  private enter(s: NoteState, tMs: number) {
    this.state = s
    this.stateSinceMs = tMs
  }
}

// ---- utilitários numéricos puros ----

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x
}
function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
function stddev(xs: number[]): number {
  const n = xs.length
  if (n < 2) return 0
  const mean = xs.reduce((a, b) => a + b, 0) / n
  const varr = xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n
  return Math.sqrt(varr)
}
