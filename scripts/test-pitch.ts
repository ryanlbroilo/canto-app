// Smoke test do detector de pitch (sem microfone): alimenta senoides sintéticas
// e confere se o MPM recupera a frequência correta em toda a faixa vocal.
// Rodar: npx esbuild scripts/test-pitch.ts --bundle --platform=node --format=esm | node --input-type=module
import { detectPitchMPM } from '../src/audio/mpm'
import { freqToNote } from '../src/audio/notes'

const SR = 48000
const N = 2048

function sine(freq: number): Float32Array {
  const b = new Float32Array(N)
  for (let i = 0; i < N; i++) b[i] = 0.4 * Math.sin((2 * Math.PI * freq * i) / SR)
  return b
}

// Onda "rica" (harmônicos) — mais parecida com voz do que uma senoide pura.
function voiceLike(freq: number): Float32Array {
  const b = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = i / SR
    b[i] =
      0.35 * Math.sin(2 * Math.PI * freq * t) +
      0.2 * Math.sin(2 * Math.PI * 2 * freq * t) +
      0.12 * Math.sin(2 * Math.PI * 3 * freq * t)
  }
  return b
}

function vibrato(freq: number): Float32Array {
  const b = new Float32Array(N)
  let ph = 0
  for (let i = 0; i < N; i++) {
    const f = freq * (1 + 0.03 * Math.sin((2 * Math.PI * 5.5 * i) / SR)) // ±3%, 5.5 Hz
    ph += (2 * Math.PI * f) / SR
    b[i] = 0.4 * Math.sin(ph)
  }
  return b
}

// E2, A2, D3, A3, C4, E4, A4, C5, E5, A5 — cobre grave masculino a agudo feminino.
const targets = [82.41, 110, 146.83, 220, 261.63, 329.63, 440, 523.25, 659.25, 880]

let pass = 0
console.log('nota-alvo   detectado   err(cents)  clarity  status')
for (const f of targets) {
  const r = detectPitchMPM(voiceLike(f), SR)
  const err = r ? 1200 * Math.log2(r.freq / f) : NaN
  const ok = !!r && Math.abs(err) < 25
  if (ok) pass++
  const note = r ? freqToNote(r.freq) : null
  console.log(
    `${f.toFixed(2).padStart(8)}   ${(r ? r.freq.toFixed(2) : 'null').padStart(8)}   ${(isNaN(err) ? '-' : err.toFixed(1)).padStart(8)}  ${(r ? r.clarity.toFixed(2) : '-').padStart(6)}   ${note ? note.name + note.octave : ''} ${ok ? 'OK' : 'FAIL'}`,
  )
}

const rv = detectPitchMPM(vibrato(440), SR)
const vibErr = rv ? 1200 * Math.log2(rv.freq / 440) : NaN
console.log(`\nvibrato 440Hz -> ${rv ? rv.freq.toFixed(2) : 'null'}Hz (err ${isNaN(vibErr) ? '-' : vibErr.toFixed(1)}c, clarity ${rv?.clarity.toFixed(2)})`)

// Silêncio/ruído baixo deve retornar null (gate).
const quiet = new Float32Array(N).map(() => (Math.random() - 0.5) * 0.002)
console.log(`ruído baixo -> ${detectPitchMPM(quiet, SR) ? 'DETECTOU (ruim)' : 'null (bom, gate ok)'}`)

console.log(`\n${pass}/${targets.length} notas dentro de ±25 cents`)
