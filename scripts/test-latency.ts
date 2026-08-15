// Testes das funções puras de calibração de latência e detecção de vazamento.
// Sintetiza trens de cliques e envelopes com defeito CONHECIDO — cada teste nomeia
// o modo de falha que ele guarda, não é teste de cobertura. Rode com:
//   npm run test:latency

import assert from 'node:assert/strict'
import {
  rmsEnvelope,
  envelopeRateHz,
  findClickDelaysMs,
  summarizeDelays,
} from '../src/domain/karaoke/latency'
import { BleedDetector } from '../src/domain/karaoke/bleed'

let passed = 0
let failed = 0

function test(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (err) {
    failed++
    console.log(`  FALHOU  ${name}`)
    console.log(`        ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** PRNG determinístico (LCG) — os testes precisam de "ruído" reproduzível, não de
 * aleatoriedade de verdade; Math.random() tornaria uma falha esporádica impossível
 * de reproduzir. */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

const SAMPLE_RATE = 16000
const BURST_SEC = 0.005

/**
 * Constrói um trem sintético de cliques: ruído branco com decaimento exponencial em
 * cada instante esperado + atraso, silêncio (ou ruído de fundo) em volta.
 *
 * `delayMs` aceita um único atraso pra todos os cliques, um atraso por clique, ou
 * `null` num índice pra simular clique perdido (§ item 2 do plano).
 */
function buildClickTrain(
  expectedSec: number[],
  delayMs: number | (number | null)[],
  durationSec: number,
  rng: () => number,
): Float32Array {
  const n = Math.round(durationSec * SAMPLE_RATE)
  const samples = new Float32Array(n)
  const delays = Array.isArray(delayMs) ? delayMs : expectedSec.map(() => delayMs)
  const burstSamples = Math.max(1, Math.round(BURST_SEC * SAMPLE_RATE))

  expectedSec.forEach((t, i) => {
    const delay = delays[i]
    if (delay === null) return // clique propositalmente ausente
    const start = Math.round((t + delay / 1000) * SAMPLE_RATE)
    for (let k = 0; k < burstSamples; k++) {
      const idx = start + k
      if (idx < 0 || idx >= n) continue
      const decay = Math.exp(-6 * (k / burstSamples))
      samples[idx] += (rng() * 2 - 1) * decay
    }
  })
  return samples
}

function measure(samples: Float32Array, expectedSec: number[]): ReturnType<typeof summarizeDelays> {
  const env = rmsEnvelope(samples, SAMPLE_RATE)
  const envRate = envelopeRateHz(SAMPLE_RATE)
  const delays = findClickDelaysMs(env, envRate, expectedSec)
  return summarizeDelays(delays)
}

const EXPECTED = [0.5, 1.0, 1.5, 2.0, 2.5]
const DURATION_SEC = 3.5

console.log('\ncalibração de latência')

test('trem de cliques atrasado 87ms exatos é recuperado dentro de ±5ms', () => {
  const rng = seededRandom(1)
  const samples = buildClickTrain(EXPECTED, 87, DURATION_SEC, rng)
  const result = measure(samples, EXPECTED)
  assert.equal(result.detected, 5, `esperava 5 detectados, veio ${result.detected}`)
  assert.ok(result.ok, `esperava ok=true, veio ${JSON.stringify(result)}`)
  assert.ok(
    Math.abs(result.roundTripMs - 87) <= 5,
    `roundTripMs=${result.roundTripMs}, esperado ~87 (±5)`,
  )
})

test('1 clique perdido entre 5 ainda dá ok=true com o atraso correto', () => {
  const rng = seededRandom(2)
  const delays: (number | null)[] = [87, 87, null, 87, 87]
  const samples = buildClickTrain(EXPECTED, delays, DURATION_SEC, rng)
  const result = measure(samples, EXPECTED)
  assert.equal(result.detected, 4, `esperava 4 detectados, veio ${result.detected}`)
  assert.ok(result.ok, `esperava ok=true, veio ${JSON.stringify(result)}`)
  assert.ok(
    Math.abs(result.roundTripMs - 87) <= 5,
    `roundTripMs=${result.roundTripMs}, esperado ~87 (±5)`,
  )
})

test('só ruído de fundo, sem clique algum, não inventa uma calibração', () => {
  const rng = seededRandom(3)
  const n = Math.round(DURATION_SEC * SAMPLE_RATE)
  const samples = new Float32Array(n)
  for (let i = 0; i < n; i++) samples[i] = (rng() * 2 - 1) * 0.02 // ruído baixo e uniforme, sem transiente
  const result = measure(samples, EXPECTED)
  assert.equal(result.ok, false, `ruído puro não pode passar no gate, veio ${JSON.stringify(result)}`)
})

test('atrasos muito dispersos entre cliques reprovam por desvio-padrão, não travam', () => {
  const rng = seededRandom(4)
  const delays = [40, 90, 150, 200, 260]
  const samples = buildClickTrain(EXPECTED, delays, DURATION_SEC, rng)
  const result = measure(samples, EXPECTED)
  assert.equal(result.detected, 5, `esperava 5 detectados, veio ${result.detected}`)
  assert.equal(
    result.ok,
    false,
    `desvio-padrão alto deveria reprovar, veio ${JSON.stringify(result)}`,
  )
  assert.ok(result.stdevMs > 15, `stdevMs=${result.stdevMs}, esperado > 15`)
})

console.log('\ndetector de vazamento (BleedDetector)')

test('envelopes idênticos (playback vazando no mic) acusam vazamento', () => {
  const sampleRate = 16000
  const det = new BleedDetector(sampleRate)
  const n = Math.round(3 * sampleRate) // 3s ⇒ ~150 pontos de envelope a 50Hz
  const chunk = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    // amplitude modulada, não tom puro constante — um envelope constante teria
    // variância zero e a correlação de Pearson não seria sequer definida
    chunk[i] = Math.sin((2 * Math.PI * 220 * i) / sampleRate) * (0.5 + 0.5 * Math.sin((2 * Math.PI * 0.7 * i) / sampleRate))
  }
  det.pushMic(chunk)
  det.pushPlayback(chunk.slice())
  const r = det.result()
  assert.ok(r.points >= 100, `esperava >=100 pontos, veio ${r.points}`)
  assert.ok(r.correlation > 0.9, `correlation=${r.correlation}, esperado > 0.9`)
  assert.equal(r.bleeding, true)
})

test('mic independente do playback não acusa vazamento', () => {
  const sampleRate = 16000
  const det = new BleedDetector(sampleRate)
  const rngMic = seededRandom(6)
  const rngPb = seededRandom(60)
  const n = Math.round(3 * sampleRate)
  const mic = new Float32Array(n)
  const pb = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    mic[i] = rngMic() * 2 - 1
    pb[i] = rngPb() * 2 - 1
  }
  det.pushMic(mic)
  det.pushPlayback(pb)
  const r = det.result()
  assert.ok(r.points >= 100, `esperava >=100 pontos, veio ${r.points}`)
  assert.ok(Math.abs(r.correlation) < 0.5, `correlation=${r.correlation}, esperado perto de 0`)
  assert.equal(r.bleeding, false)
})

test('com poucos pontos, o detector diz "ainda não sei", nunca "está limpo"', () => {
  const sampleRate = 16000
  const det = new BleedDetector(sampleRate)
  const n = Math.round(0.3 * sampleRate) // 0.3s ⇒ ~15 pontos, bem abaixo de MIN_POINTS
  const chunk = new Float32Array(n)
  for (let i = 0; i < n; i++) chunk[i] = Math.sin(i)
  det.pushMic(chunk)
  det.pushPlayback(chunk.slice())
  const r = det.result()
  assert.ok(r.points < 100, `esperava <100 pontos, veio ${r.points}`)
  assert.equal(r.bleeding, false, 'poucos pontos não pode virar bleeding=true nem justificar limpo')
})

console.log(`\n${passed} ok, ${failed} falharam\n`)
process.exit(failed > 0 ? 1 : 0)
