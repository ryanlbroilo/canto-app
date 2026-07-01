// PitchEngine v2 — captura de microfone + detecção de pitch, com DOIS backends
// atrás da MESMA interface pública (subscribe/start/stop/status):
//
//   • 'worklet'  → mic → AudioWorklet (captura) → ring buffer SAB → Web Worker
//                  rodando o núcleo WASM (MPM). Fora do main thread. Em PARALELO,
//                  um 2º worker roda o SwiftF0 (ONNX) como F0 neural robusto; a
//                  main thread reconcilia os dois (veto de oitava + confiança).
//                  Requer cross-origin isolation (COOP/COEP). Caminho SOTA.
//   • 'analyser' → AnalyserNode + MPM (TS) no main thread. Fallback sem isolamento.
//
// Consumidores (hooks/componentes) não mudam ao trocar de backend.

import { detectPitchMPM } from './mpm'
import { freqToNote, NoteInfo } from './notes'
import { PerceptionLayer } from './perception'
import { createRingSAB } from './ringbuffer'
import { RegisterEstimator, RegisterState } from './register'

export interface PitchFrame {
  time: number
  freq: number | null
  note: NoteInfo | null
  clarity: number
  rms: number
  /** Centróide espectral (Hz) — backend WASM; undefined no fallback */
  centroid?: number
  /** Tilt espectral — backend WASM; undefined no fallback */
  tilt?: number
  /** H1-H2 (dB) — backend WASM; undefined no fallback */
  h1h2?: number
  /** Confiança do F0 neural (SwiftF0), 0..1, quando disponível e recente */
  neuralConf?: number
  /** Estimativa de registro + evento de quebra (backend WASM) */
  register?: RegisterState
  // --- Camada perceptual (perception.ts): opcionais → não quebram UI existente ---
  /** F0 suavizado perceptualmente (Hz); use para exibição estável da agulha/nota */
  smoothedFreq?: number
  /** Estado da nota: silent/onset/sustain/release */
  noteState?: 'silent' | 'onset' | 'sustain' | 'release'
  /** Trava de afinador: afinado+sustentado (celebração visual) */
  locked?: boolean
  /** Há quanto tempo (ms) travado */
  lockMs?: number
  /** Loudness perceptual suave (0..1) */
  dynamics?: number
  /** Estabilidade de curto prazo (0..1) — nota firme */
  steadiness?: number
  /** SNR contra piso de ruído adaptativo (dB) */
  snr?: number
}

export type EngineStatus = 'idle' | 'starting' | 'running' | 'error'
export type Backend = 'worklet' | 'analyser'

type Listener = (frame: PitchFrame) => void

const CLARITY_MIN = 0.7
const RMS_MIN = 0.006
// Janela em que a estimativa neural é considerada "recente" o bastante para vetar.
const NEURAL_FRESH_MS = 220
const NEURAL_MIN_CONF = 0.6

export class PitchEngine {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private listeners = new Set<Listener>()

  // fallback (analyser)
  private analyser: AnalyserNode | null = null
  private buf = new Float32Array(2048)
  private raf = 0

  // worklet backend
  private node: AudioWorkletNode | null = null
  private worker: Worker | null = null
  private neuralWorker: Worker | null = null
  private silentGain: GainNode | null = null
  private latestNeural: { f0: number; conf: number; t: number } | null = null
  private register = new RegisterEstimator()
  // Camada perceptual: suaviza F0, estado de nota, trava, dinâmica, piso de ruído.
  private perception = new PerceptionLayer()

  status: EngineStatus = 'idle'
  backend: Backend | null = null
  onStatus?: (status: EngineStatus) => void
  lastError: string | null = null

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Calibra o estimador de registro com a extensão do usuário (passaggio). */
  setRange(lowMidi: number, highMidi: number): void {
    this.register.configure({ lowMidi, highMidi })
  }

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 48000
  }

  private setStatus(status: EngineStatus) {
    this.status = status
    this.onStatus?.(status)
  }

  private emit(frame: PitchFrame) {
    for (const l of this.listeners) l(frame)
  }

  /**
   * Converte features [f0, clarity, rms, centroid, tilt] em PitchFrame, aplicando
   * a reconciliação com o F0 neural (veto de oitava): se o MPM está ~1 oitava
   * (ou 2) longe do neural recente e confiante, corrige mantendo os cents finos.
   */
  private frameFromFeatures(f0: number, clarity: number, rms: number, centroid?: number, tilt?: number, h1h2?: number) {
    let f = f0
    let neuralConf: number | undefined
    const nb = this.latestNeural
    if (f > 0 && nb && nb.f0 > 0 && performance.now() - nb.t < NEURAL_FRESH_MS && nb.conf >= NEURAL_MIN_CONF) {
      neuralConf = nb.conf
      const octaves = Math.log2(f / nb.f0)
      const nearest = Math.round(octaves)
      if (nearest !== 0 && Math.abs(octaves - nearest) < 0.08) {
        f = f / Math.pow(2, nearest) // erro de oitava do MPM → snap para a oitava do neural
      }
    }
    const voiced = f > 0 && clarity >= CLARITY_MIN && rms >= RMS_MIN
    const finalF0 = voiced ? f : null
    const now = performance.now()
    const register = this.register.process({ f0: finalF0, rms, tilt, centroid, h1h2 }, now)
    // Camada perceptual: recebe o F0 já gated e devolve sinais suaves/com estado.
    const p = this.perception.push({ f0: finalF0, clarity, rms, tMs: now })
    // A nota EXIBIDA vem do F0 suavizado quando disponível (mais estável, sem
    // tremor); freq segue = finalF0 cru para compatibilidade com consumidores.
    const noteFreq = p.smoothedFreq ?? finalF0
    this.emit({
      time: this.ctx?.currentTime ?? 0,
      freq: finalF0,
      note: noteFreq != null ? freqToNote(noteFreq) : null,
      clarity,
      rms,
      centroid,
      tilt,
      h1h2,
      neuralConf,
      register,
      // campos perceptuais (opcionais)
      smoothedFreq: p.smoothedFreq ?? undefined,
      noteState: p.noteState,
      locked: p.locked,
      lockMs: p.lockMs,
      dynamics: p.dynamics,
      steadiness: p.steadiness,
      snr: p.snr,
    })
  }

  async start(): Promise<void> {
    if (this.status === 'running' || this.status === 'starting') return
    this.setStatus('starting')
    this.lastError = null
    this.perception.reset() // estado perceptual limpo a cada nova sessão
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      })
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      await this.ctx.resume()
      const source = this.ctx.createMediaStreamSource(this.stream)

      const canWorklet = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined'
      if (canWorklet) {
        try {
          await this.startWorklet(source)
          this.backend = 'worklet'
        } catch (e) {
          console.warn('[PitchEngine] backend worklet falhou, usando fallback analyser:', e)
          this.startAnalyser(source)
          this.backend = 'analyser'
        }
      } else {
        this.startAnalyser(source)
        this.backend = 'analyser'
      }
      console.log(`[PitchEngine] backend=${this.backend} · crossOriginIsolated=${typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated} · ${Math.round(this.sampleRate)}Hz`)
      this.setStatus('running')
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err)
      console.error('[PitchEngine] falha ao iniciar:', err)
      this.setStatus('error')
    }
  }

  // ---------- Backend worklet (SOTA) ----------
  private async startWorklet(source: MediaStreamAudioSourceNode) {
    const ctx = this.ctx!
    const sab = createRingSAB()
    await ctx.audioWorklet.addModule('/worklets/capture-processor.js')
    this.node = new AudioWorkletNode(ctx, 'capture-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: { sab },
    })
    this.silentGain = ctx.createGain()
    this.silentGain.gain.value = 0
    source.connect(this.node)
    this.node.connect(this.silentGain)
    this.silentGain.connect(ctx.destination)

    // Worker 1: MPM (WASM) — F0 rápido/preciso
    this.worker = new Worker(new URL('./dsp-worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'frame') {
        this.frameFromFeatures(m.f0, m.clarity, m.rms, m.centroid, m.tilt, m.h1h2)
      } else if (m.type === 'selftest') {
        console.log(`[DSP worker] self-test WASM: F0=${m.f0.toFixed(1)}Hz (esperado ~220)`)
      }
    }
    this.worker.postMessage({ type: 'init', sab, sampleRate: ctx.sampleRate })

    // Worker 2: SwiftF0 (ONNX) — F0 neural robusto, usado como veto de oitava
    this.neuralWorker = new Worker(new URL('./swiftf0-worker.ts', import.meta.url), { type: 'module' })
    this.neuralWorker.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'neural') {
        this.latestNeural = { f0: m.f0, conf: m.conf, t: performance.now() }
      } else if (m.type === 'neural-selftest') {
        console.log(`[SwiftF0] self-test ONNX: F0=${m.f0.toFixed(1)}Hz conf=${m.conf.toFixed(2)} (esperado ~220)`)
      } else if (m.type === 'ready') {
        console.log('[SwiftF0] modelo ONNX carregado no worker')
      } else if (m.type === 'error') {
        console.warn('[SwiftF0] erro (seguindo só com MPM):', m.error)
      }
    }
    this.neuralWorker.postMessage({ type: 'init', sab, sampleRate: ctx.sampleRate, modelUrl: '/model.onnx' })
  }

  // ---------- Backend fallback (AnalyserNode + MPM no main thread) ----------
  private startAnalyser(source: MediaStreamAudioSourceNode) {
    const ctx = this.ctx!
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.buf = new Float32Array(this.analyser.fftSize)
    source.connect(this.analyser)
    this.loopAnalyser()
  }

  private loopAnalyser = () => {
    if (!this.analyser || !this.ctx) return
    this.analyser.getFloatTimeDomainData(this.buf)
    let sum = 0
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i]
    const rms = Math.sqrt(sum / this.buf.length)
    const res = detectPitchMPM(this.buf, this.ctx.sampleRate)
    this.frameFromFeatures(res ? res.freq : 0, res?.clarity ?? 0, rms)
    this.raf = requestAnimationFrame(this.loopAnalyser)
  }

  stop(): void {
    cancelAnimationFrame(this.raf)
    for (const w of [this.worker, this.neuralWorker]) {
      if (w) {
        w.postMessage({ type: 'stop' })
        w.terminate()
      }
    }
    this.worker = null
    this.neuralWorker = null
    this.latestNeural = null
    this.register.reset()
    this.perception.reset()
    try {
      this.node?.disconnect()
      this.silentGain?.disconnect()
      this.analyser?.disconnect()
    } catch {
      /* noop */
    }
    this.node = null
    this.silentGain = null
    this.analyser = null
    this.stream?.getTracks().forEach((t) => t.stop())
    void this.ctx?.close()
    this.ctx = null
    this.stream = null
    this.backend = null
    this.setStatus('idle')
  }
}
