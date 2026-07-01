// Teste da lógica de registro (sem áudio real): sequências sintéticas de frames.
import { RegisterEstimator } from '../src/audio/register'

function settleZone(feats: { f0: number; rms: number; tilt: number; h1h2: number }, passaggio: number) {
  const est = new RegisterEstimator()
  est.configure({ lowMidi: 45, highMidi: 72, passaggioMidi: passaggio })
  let last
  for (let i = 0; i < 15; i++) last = est.process(feats, i * 20)
  return last!
}

const P = 60 // passaggio em C4 (~261 Hz)

// Zonas (heurística)
const chest = settleZone({ f0: 196, rms: 0.1, tilt: -3, h1h2: -2 }, P) // G3 grave, brilhante, não-breathy
const falsetto = settleZone({ f0: 392, rms: 0.05, tilt: -11, h1h2: 14 }, P) // G4 agudo, escuro, breathy
const head = settleZone({ f0: 330, rms: 0.09, tilt: -6, h1h2: 2 }, P) // E4 acima, conectado
const mix = settleZone({ f0: 262, rms: 0.09, tilt: -7, h1h2: 3 }, P) // no passaggio

console.log('=== Estimativa de zona (heurística v1) ===')
console.log(`grave+brilhante+conectado (G3) → ${chest.zone} (conf ${chest.confidence.toFixed(2)}) [espera peito]`)
console.log(`agudo+escuro+breathy (G4)      → ${falsetto.zone} (conf ${falsetto.confidence.toFixed(2)}) [espera falsete]`)
console.log(`acima+conectado (E4)           → ${head.zone} (conf ${head.confidence.toFixed(2)}) [espera cabeça]`)
console.log(`no passaggio (C4)              → ${mix.zone} (conf ${mix.confidence.toFixed(2)}) [espera mix]`)

// Evento de quebra: salto de F0 + queda de RMS + mudança de tilt
console.log('\n=== Detecção de evento de quebra ===')
const est = new RegisterEstimator()
est.configure({ lowMidi: 45, highMidi: 72, passaggioMidi: P })
let events = 0
// frames estáveis
for (let i = 0; i < 5; i++) est.process({ f0: 260, rms: 0.1, tilt: -4, h1h2: 0 }, i * 20)
// frame de QUEBRA: salta pra falsete, cai amplitude, muda tilt
const brk = est.process({ f0: 520, rms: 0.03, tilt: -9, h1h2: 12 }, 100)
if (brk.event === 'quebra') events++
console.log(`salto 260→520Hz + queda RMS 70% + tilt −4→−9 → evento=${brk.event} ${brk.event === 'quebra' ? '✓' : '✗ (esperado quebra)'}`)

// não deve disparar em movimento melódico suave
const est2 = new RegisterEstimator()
est2.configure({ lowMidi: 45, highMidi: 72, passaggioMidi: P })
let falsePos = 0
for (let i = 0; i < 5; i++) est2.process({ f0: 260, rms: 0.1, tilt: -4, h1h2: 0 }, i * 20)
const smooth = est2.process({ f0: 275, rms: 0.098, tilt: -4.1, h1h2: 0 }, 100) // subida suave
if (smooth.event === 'quebra') falsePos++
console.log(`subida suave 260→275Hz (sem queda) → evento=${smooth.event} ${smooth.event === null ? '✓ (sem falso positivo)' : '✗'}`)

console.log(`\nEvento detectado: ${events}/1 · Falsos positivos: ${falsePos}/1`)
