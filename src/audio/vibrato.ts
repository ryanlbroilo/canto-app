// Detecção de vibrato a partir de uma série de F0 (Hz) e a taxa de frames (fps).
// Vibrato = oscilação periódica de F0 na faixa ~3.5–9 Hz. Usa autocorrelação da
// curva de cents (relativa à média). Reutilizado pelo agregador de sessão e pelo
// indicador ao vivo.

export interface VibratoResult {
  present: boolean
  rateHz: number
  extentCents: number
}

export function analyzeVibratoFromF0(f0: number[], fps: number): VibratoResult {
  const n = f0.length
  const none = { present: false, rateHz: 0, extentCents: 0 }
  if (n < Math.max(20, fps * 0.4)) return none
  if (!isFinite(fps) || fps < 20 || fps > 400) return none

  // cents relativo à F0 média (remove a "nota"; sobra a oscilação)
  const meanF0 = f0.reduce((a, c) => a + c, 0) / n
  if (meanF0 <= 0) return none
  const x = f0.map((v) => 1200 * Math.log2(v / meanF0))
  const mean = x.reduce((a, c) => a + c, 0) / n
  for (let i = 0; i < n; i++) x[i] -= mean
  const rms = Math.sqrt(x.reduce((a, c) => a + c * c, 0) / n)
  if (rms < 12) return none // oscilação pequena demais para ser vibrato

  // Autocorrelação normalizada na faixa de lags de ~3.2–10 Hz.
  const minLag = Math.max(1, Math.floor(fps / 10))
  const maxLag = Math.min(n - 2, Math.ceil(fps / 3.2))
  const denom = x.reduce((a, c) => a + c * c, 0) || 1
  const acf: number[] = []
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    for (let i = 0; i < n - lag; i++) s += x[i] * x[i + lag]
    acf.push(s / denom)
  }
  // Procura um PICO LOCAL (periodicidade real), não o máximo global — um drift
  // lento tem autocorrelação monotonicamente decrescente (sem pico) e é rejeitado.
  let bestJ = -1
  let bestVal = 0
  for (let j = 1; j < acf.length - 1; j++) {
    if (acf[j] > acf[j - 1] && acf[j] >= acf[j + 1] && acf[j] > bestVal) {
      bestVal = acf[j]
      bestJ = j
    }
  }
  const present = bestJ >= 0 && bestVal > 0.3
  const bestLag = bestJ >= 0 ? minLag + bestJ : 0
  const rateHz = bestLag ? +(fps / bestLag).toFixed(1) : 0
  // aceita só se a taxa cair na faixa fisiológica do vibrato (~4–8.5 Hz)
  if (present && rateHz >= 4 && rateHz <= 8.5) {
    return { present: true, rateHz, extentCents: +(rms * 1.414).toFixed(0) }
  }
  return { present: false, rateHz, extentCents: +(rms * 1.414).toFixed(0) }
}
