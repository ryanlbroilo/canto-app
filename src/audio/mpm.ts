// McLeod Pitch Method (MPM) — detecção de F0 para voz monofônica.
// Ref.: Philip McLeod & Geoff Wyvill, "A Smarter Way to Find Pitch" (2005).
//
// Por que MPM e não autocorrelação pura: o MPM usa a NSDF (Normalized Square
// Difference Function), que é mais estável para vibrato e mais resistente a
// erros de oitava do que a autocorrelação simples — exatamente o que a nossa
// pesquisa apontou como fraqueza do DSP clássico nos extremos.
//
// Esta é a implementação de referência (JS, main thread). A interface de saída
// { freq, clarity } é intencionalmente estável para que possamos trocar o motor
// por SwiftF0/PESTO em ONNX (AudioWorklet + WASM) sem tocar no resto do app.

export interface PitchResult {
  /** Frequência fundamental estimada, em Hz */
  freq: number
  /** "Clareza" da periodicidade (valor da NSDF no pico), ~0..1 */
  clarity: number
}

// Fração do maior pico usada para escolher o "key maximum" (evita erro de oitava para cima).
const K = 0.9
// Faixa plausível para voz cantada (Hz). Fora disso, descartamos.
const MIN_FREQ = 55 // ~A1
const MAX_FREQ = 1600 // ~G6

export function detectPitchMPM(buf: Float32Array, sampleRate: number): PitchResult | null {
  const n = buf.length
  const maxLag = n >> 1

  // NSDF[tau] = 2 * ACF[tau] / m[tau]
  //   ACF[tau] = Σ x[i] * x[i+tau]
  //   m[tau]   = Σ x[i]^2 + x[i+tau]^2
  const nsdf = new Float32Array(maxLag)
  for (let tau = 0; tau < maxLag; tau++) {
    let acf = 0
    let m = 0
    const limit = n - tau
    for (let i = 0; i < limit; i++) {
      const a = buf[i]
      const b = buf[i + tau]
      acf += a * b
      m += a * a + b * b
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0
  }

  // Coleta os máximos-chave entre cruzamentos de zero positivos,
  // ignorando o lóbulo inicial (tau próximo de 0, onde NSDF ≈ 1).
  const peaks: number[] = []
  let i = 0
  while (i < maxLag - 1 && nsdf[i] > 0) i++ // pula lóbulo inicial positivo
  while (i < maxLag - 1 && nsdf[i] <= 0) i++ // pula região negativa
  let cur = 0
  while (i < maxLag - 1) {
    if (nsdf[i] > nsdf[i - 1] && nsdf[i] >= nsdf[i + 1]) {
      if (cur === 0 || nsdf[i] > nsdf[cur]) cur = i
    }
    i++
    if (i < maxLag - 1 && nsdf[i] <= 0) {
      if (cur > 0) {
        peaks.push(cur)
        cur = 0
      }
      while (i < maxLag - 1 && nsdf[i] <= 0) i++
    }
  }
  if (cur > 0) peaks.push(cur)
  if (peaks.length === 0) return null

  // Maior pico -> limiar -> primeiro pico acima do limiar (o período correto).
  let highest = 0
  for (const p of peaks) if (nsdf[p] > highest) highest = nsdf[p]
  const threshold = K * highest
  let chosen = peaks[0]
  for (const p of peaks) {
    if (nsdf[p] >= threshold) {
      chosen = p
      break
    }
  }

  // Interpolação parabólica em torno do pico para tau sub-amostra (cents finos).
  const x0 = chosen > 0 ? chosen - 1 : chosen
  const x2 = chosen < maxLag - 1 ? chosen + 1 : chosen
  const a = nsdf[x0]
  const b = nsdf[chosen]
  const c = nsdf[x2]
  const denom = a - 2 * b + c
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0
  const tau = chosen + shift
  if (tau <= 0) return null

  const freq = sampleRate / tau
  if (freq < MIN_FREQ || freq > MAX_FREQ) return null

  return { freq, clarity: Math.max(0, Math.min(1, b)) }
}
