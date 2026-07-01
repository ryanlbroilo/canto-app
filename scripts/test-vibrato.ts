import { analyzeVibratoFromF0 } from '../src/audio/vibrato'

const fps = 150
function series(fn: (t: number) => number, dur = 1.2) {
  const n = Math.floor(fps * dur)
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(fn(i / fps))
  return out
}

// 5.5 Hz, ±30 cents em torno de 220 Hz
const vib = analyzeVibratoFromF0(series((t) => 220 * Math.pow(2, (30 * Math.sin(2 * Math.PI * 5.5 * t)) / 1200)), fps)
// tom estável
const steady = analyzeVibratoFromF0(series(() => 220), fps)
// oscilação lenta demais (1 Hz — não é vibrato)
const slow = analyzeVibratoFromF0(series((t) => 220 * Math.pow(2, (40 * Math.sin(2 * Math.PI * 1 * t)) / 1200)), fps)

console.log('vibrato 5.5Hz/30¢ →', JSON.stringify(vib), '[espera present, ~5.5Hz, ~30¢]')
console.log('tom estável      →', JSON.stringify(steady), '[espera present=false]')
console.log('oscilação 1Hz    →', JSON.stringify(slow), '[espera present=false — fora da faixa]')

const ok = vib.present && Math.abs(vib.rateHz - 5.5) < 1 && Math.abs(vib.extentCents - 30) < 10 && !steady.present && !slow.present
console.log('\n' + (ok ? '✓ vibrato OK' : '✗ verificar'))
