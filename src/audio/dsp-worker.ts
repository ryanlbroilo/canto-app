// Web Worker de DSP — lê janelas do ring buffer (SAB) e roda o núcleo WASM
// (canto-dsp: F0 via MPM + features espectrais), postando frames de features
// para a main thread. Fica fora da thread de áudio (não causa glitch) e fora da
// main thread (não trava a UI).
import init, { Analyzer } from '../wasm/canto_dsp.js'
import { RING, ringViews } from './ringbuffer'

// `self` no worker: postMessage do worker não pede targetOrigin; a lib DOM tipa
// como Window, então usamos um cast pontual.
const post = (msg: unknown) => (self as unknown as { postMessage: (m: unknown) => void }).postMessage(msg)

let analyzer: Analyzer | null = null
let control: Int32Array | null = null
let audio: Float32Array | null = null
let sampleRate = 48000
let running = false
let lastWC = -1
const win = new Float32Array(RING.WINDOW)
const HOP = 256 // reprocessa quando avançou ao menos isto (~5ms @48k)

self.onmessage = async (e: MessageEvent) => {
  const m = e.data
  if (m.type === 'init') {
    sampleRate = m.sampleRate
    const v = ringViews(m.sab as SharedArrayBuffer)
    control = v.control
    audio = v.audio
    await init()
    analyzer = new Analyzer(sampleRate, RING.WINDOW)
    selfTest()
    running = true
    loop()
  } else if (m.type === 'stop') {
    running = false
  }
}

// Verificação em runtime: analisa uma senoide sintética e reporta o F0.
function selfTest() {
  if (!analyzer) return
  const b = new Float32Array(RING.WINDOW)
  for (let i = 0; i < b.length; i++) {
    const t = i / sampleRate
    b[i] = 0.35 * Math.sin(2 * Math.PI * 220 * t) + 0.2 * Math.sin(2 * Math.PI * 440 * t)
  }
  const f = analyzer.analyze(b)
  post({ type: 'selftest', f0: f[0], centroid: f[3] })
}

function loop() {
  if (!running || !control || !audio || !analyzer) return
  const wc = Atomics.load(control, 0)
  if (wc >= RING.WINDOW && wc - lastWC >= HOP) {
    lastWC = wc
    const base = wc - RING.WINDOW
    for (let i = 0; i < RING.WINDOW; i++) {
      win[i] = audio[(base + i) % RING.CAPACITY]
    }
    const f = analyzer.analyze(win) // [f0, clarity, rms, centroid, tilt, h1h2]
    post({ type: 'frame', f0: f[0], clarity: f[1], rms: f[2], centroid: f[3], tilt: f[4], h1h2: f[5] })
  }
  setTimeout(loop, 8)
}
