// Web Worker de F0 NEURAL — roda o SwiftF0 (model.onnx) via onnxruntime-web.
// Lê janelas maiores do ring buffer (SAB), reamostra 48k→16k, e infere pitch_hz +
// confidence. Roda em paralelo (e mais devagar) que o MPM; a main thread usa a
// estimativa neural como VETO DE OITAVA e sinal de confiança.
//
// I/O do modelo (verificado nas fontes primárias):
//   entrada: 'input_audio' float32 [1, N] — waveform CRU mono @16kHz (STFT interna)
//   saídas:  'pitch_hz' [1, n_frames] (Hz) e 'confidence' [1, n_frames] (0..1)
import * as ort from 'onnxruntime-web/wasm'
import { RING, ringViews } from './ringbuffer'
import { Resampler16k } from './resample'

ort.env.wasm.wasmPaths = '/ort/' // binários same-origin (compat COEP credentialless)
ort.env.wasm.numThreads = 1 // modelo minúsculo; single-thread simplifica e basta

const post = (m: unknown, transfer: Transferable[] = []) =>
  (self as unknown as { postMessage: (m: unknown, t: Transferable[]) => void }).postMessage(m, transfer)

const FMIN = 46.875
const FMAX = 2093.75
const CONF_THRESH = 0.9
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

function peakNorm(x: Float32Array): Float32Array {
  let max = 0
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i])
    if (a > max) max = a
  }
  if (max <= 0) return x
  const y = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) y[i] = x[i] / max
  return y
}

async function infer(audio16k: Float32Array): Promise<{ f0: number; conf: number }> {
  if (!session) return { f0: 0, conf: 0 }
  const norm = peakNorm(audio16k)
  const input = new ort.Tensor('float32', norm, [1, norm.length])
  const out = await session.run({ input_audio: input })
  const pitch = out.pitch_hz.data as Float32Array
  const conf = out.confidence.data as Float32Array
  // frame voiced mais recente (mais próximo do "agora")
  for (let i = pitch.length - 1; i >= 0; i--) {
    if (conf[i] > CONF_THRESH && pitch[i] >= FMIN && pitch[i] <= FMAX) {
      return { f0: pitch[i], conf: conf[i] }
    }
  }
  // sem voiced: retorna o de maior confiança (para diagnóstico)
  let bi = 0
  let bc = 0
  for (let i = 0; i < conf.length; i++) {
    if (conf[i] > bc) {
      bc = conf[i]
      bi = i
    }
  }
  return { f0: pitch[bi] || 0, conf: bc }
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
