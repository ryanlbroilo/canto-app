// Resampler para 16 kHz (exigência do SwiftF0). Faz anti-aliasing (FIR lowpass
// windowed-sinc, corte ~7.2 kHz) e reamostra por interpolação linear para
// qualquer sample rate de origem (48k, 44.1k, etc.). Decimação ingênua deslocaria
// o pitch por aliasing — por isso o lowpass antes.

const TARGET = 16000
const CUTOFF_HZ = 7200 // abaixo da Nyquist de 16k (8k)

function designLowpass(fcNorm: number, taps: number): Float32Array {
  // fcNorm = corte / sampleRate (0..0.5)
  const h = new Float32Array(taps)
  const M = taps - 1
  let sum = 0
  for (let n = 0; n < taps; n++) {
    const k = n - M / 2
    const sinc = k === 0 ? 2 * fcNorm : Math.sin(2 * Math.PI * fcNorm * k) / (Math.PI * k)
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / M) // Hann
    h[n] = sinc * w
    sum += h[n]
  }
  for (let n = 0; n < taps; n++) h[n] /= sum // ganho DC = 1
  return h
}

export class Resampler16k {
  private fir: Float32Array
  private ratio: number // amostras de saída por amostra de entrada
  private half: number
  private passthrough: boolean

  constructor(private srcRate: number) {
    this.passthrough = Math.abs(srcRate - TARGET) < 1
    this.ratio = TARGET / srcRate
    this.fir = designLowpass(CUTOFF_HZ / srcRate, 63)
    this.half = (this.fir.length - 1) >> 1
  }

  process(input: Float32Array): Float32Array {
    if (this.passthrough) return input.slice()

    // 1) anti-alias (convolução "same")
    const n = input.length
    const m = this.fir.length
    const filtered = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      let acc = 0
      const start = i - this.half
      for (let k = 0; k < m; k++) {
        const j = start + k
        if (j >= 0 && j < n) acc += input[j] * this.fir[k]
      }
      filtered[i] = acc
    }

    // 2) reamostra por interpolação linear
    const outLen = Math.floor(n * this.ratio)
    const out = new Float32Array(outLen)
    const step = 1 / this.ratio // amostras de entrada por amostra de saída
    for (let i = 0; i < outLen; i++) {
      const pos = i * step
      const i0 = Math.floor(pos)
      const frac = pos - i0
      const a = filtered[i0] ?? 0
      const b = i0 + 1 < n ? filtered[i0 + 1] : a
      out[i] = a + (b - a) * frac
    }
    return out
  }
}
