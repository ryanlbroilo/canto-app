// Web Worker de F0 NEURAL — roda o SwiftF0 (model.onnx) via onnxruntime-web.
// Lê janelas maiores do ring buffer (SAB), reamostra 48k→16k, e infere pitch_hz +
// confidence. Roda em paralelo (e mais devagar) que o MPM; a main thread usa a
// estimativa neural como VETO DE OITAVA e sinal de confiança.
//
// A matemática (pré-processamento, gate de validade, constantes do modelo) mora em
// swiftf0-core.ts, compartilhada com a CLI de importação do karaokê — os dois lados
// da comparação PRECISAM decidir "frame utilizável" da mesma forma. Aqui fica só a
// cola de browser: SAB, resample e transporte.
import * as ort from 'onnxruntime-web/wasm'
import { RING, ringViews } from './ringbuffer'
import { Resampler16k } from './resample'
import {
  SWIFTF0_CONF_LIVE,
  SWIFTF0_INPUT,
  SWIFTF0_OUT_CONF,
  SWIFTF0_OUT_PITCH,
  decodeFrames,
  latestVoiced,
  peakNorm,
} from './swiftf0-core'

ort.env.wasm.wasmPaths = '/ort/' // binários same-origin (compat COEP credentialless)
ort.env.wasm.numThreads = 1 // modelo minúsculo; single-thread simplifica e basta

const post = (m: unknown, transfer: Transferable[] = []) =>
  (self as unknown as { postMessage: (m: unknown, t: Transferable[]) => void }).postMessage(m, transfer)

const CHUNK = 6144 // amostras @srcRate lidas por inferência (~128ms @48k → ~8 frames @16k)
const NEURAL_HOP = 1536 // reprocessa quando avançou ~32ms @48k

let session: ort.InferenceSession | null = null
let control: Int32Array | null = null
let audio: Float32Array | null = null
let resampler: Resampler16k | null = null
let running = false
let lastWC = -1

self.onmessage = async (e: MessageEvent) => {
  const m = e.data
  if (m.type === 'init') {
    const v = ringViews(m.sab as SharedArrayBuffer)
    control = v.control
    audio = v.audio
    resampler = new Resampler16k(m.sampleRate)
    try {
      const buf = await (await fetch(m.modelUrl)).arrayBuffer()
      session = await ort.InferenceSession.create(buf, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    } catch (err) {
      post({ type: 'error', error: err instanceof Error ? err.message : String(err) })
      return
    }
    await selfTest()
    post({ type: 'ready' })
    running = true
    loop()
  } else if (m.type === 'stop') {
    running = false
  }
}

async function infer(audio16k: Float32Array): Promise<{ f0: number; conf: number }> {
  if (!session) return { f0: 0, conf: 0 }
  const norm = peakNorm(audio16k)
  const input = new ort.Tensor('float32', norm, [1, norm.length])
  const out = await session.run({ [SWIFTF0_INPUT]: input })
  const frames = decodeFrames(
    out[SWIFTF0_OUT_PITCH].data as Float32Array,
    out[SWIFTF0_OUT_CONF].data as Float32Array,
    SWIFTF0_CONF_LIVE,
  )
  const best = latestVoiced(frames)
  return { f0: best.f0, conf: best.conf }
}

// Verificação em runtime: senoide sintética 220Hz @16k.
async function selfTest() {
  const sr = 16000
  const n = 2048
  const b = new Float32Array(n)
  for (let i = 0; i < n; i++) b[i] = 0.4 * Math.sin((2 * Math.PI * 220 * i) / sr)
  const r = await infer(b)
  post({ type: 'neural-selftest', f0: r.f0, conf: r.conf })
}

async function loop() {
  if (!running || !control || !audio || !resampler) return
  const wc = Atomics.load(control, 0)
  if (wc >= CHUNK && wc - lastWC >= NEURAL_HOP) {
    lastWC = wc
    const base = wc - CHUNK
    const chunk = new Float32Array(CHUNK)
    for (let i = 0; i < CHUNK; i++) chunk[i] = audio[(base + i) % RING.CAPACITY]
    const audio16k = resampler.process(chunk)
    const r = await infer(audio16k)
    post({ type: 'neural', f0: r.f0, conf: r.conf })
  }
  setTimeout(loop, 30)
}
