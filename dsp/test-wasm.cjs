// Verificação do núcleo DSP em WASM (sem microfone): senoides sintéticas.
const { Analyzer } = require('./pkg-node/canto_dsp.js')

const SR = 48000
const N = 2048
const an = new Analyzer(SR, N)

function harmonics(freq, amps) {
  // amps = [a1, a2, a3, ...] amplitudes dos harmônicos
  const b = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = i / SR
    let v = 0
    for (let h = 0; h < amps.length; h++) v += amps[h] * Math.sin(2 * Math.PI * (h + 1) * freq * t)
    b[i] = v
  }
  return b
}

const targets = [82.41, 110, 146.83, 220, 261.63, 329.63, 440, 523.25, 659.25, 880]
let pass = 0
console.log('alvo(Hz)  f0(Hz)   err(¢)  clarity  centroid  tilt   h1-h2   status')
for (const f of targets) {
  const r = an.analyze(harmonics(f, [0.35, 0.2, 0.12])) // [f0,clarity,rms,centroid,tilt,h1h2]
  const err = r[0] > 0 ? 1200 * Math.log2(r[0] / f) : NaN
  const ok = r[0] > 0 && Math.abs(err) < 25
  if (ok) pass++
  console.log(
    `${f.toFixed(2).padStart(8)}  ${r[0].toFixed(2).padStart(7)}  ${(isNaN(err) ? '-' : err.toFixed(1)).padStart(6)}  ${r[1].toFixed(2).padStart(6)}  ${r[3].toFixed(0).padStart(7)}  ${r[4].toFixed(2).padStart(5)}  ${r[5].toFixed(1).padStart(6)}  ${ok ? 'OK' : 'FAIL'}`,
  )
}

// H1-H2 deve discriminar registro/qualidade:
const pure = an.analyze(harmonics(220, [0.4]))[5] // só fundamental → H1>>H2
const rich = an.analyze(harmonics(220, [0.3, 0.35, 0.2]))[5] // 2º harmônico forte → H1-H2 baixo
const falsettoLike = an.analyze(harmonics(330, [0.45, 0.08, 0.03]))[5] // fundamental dominante
const chestLike = an.analyze(harmonics(220, [0.25, 0.3, 0.28, 0.2]))[5] // harmônicos fortes
console.log(`\nH1-H2 discriminação:`)
console.log(`  só fundamental 220Hz     = ${pure.toFixed(1)} dB (esperado alto/positivo)`)
console.log(`  2º harmônico forte 220Hz = ${rich.toFixed(1)} dB (esperado baixo/negativo)`)
console.log(`  "falsete-like" 330Hz     = ${falsettoLike.toFixed(1)} dB (fund. dominante → alto)`)
console.log(`  "peito-like" 220Hz       = ${chestLike.toFixed(1)} dB (harmônicos fortes → baixo)`)
const discriminates = pure > rich && falsettoLike > chestLike
console.log(`  discrimina? ${discriminates ? 'SIM ✓' : 'NÃO ✗'}`)

console.log(`\nsilêncio -> f0=${an.analyze(new Float32Array(N))[0].toFixed(2)} (esperado 0)`)
console.log(`${pass}/${targets.length} notas dentro de ±25¢`)
