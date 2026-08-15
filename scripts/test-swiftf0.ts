// Teste do EXTRATOR DE REFERÊNCIA contra verdade conhecida.
//
// Este é o teste que mais importa do pipeline de importação: o que sair daqui é o que
// o app vai chamar de "a nota certa". Se o extrator tiver viés, o app cobra do cantor
// um erro que é do detector — e ele treina para corrigir um bug.
//
// Sintetiza notas de frequência EXATA (com harmônicos, para o modelo ver algo
// parecido com voz e não uma senoide pura) e exige que o pipeline inteiro —
// onnxruntime-node → gate → contorno → segmentação — devolva as notas certas, no
// tempo certo. Rode com: npm run test:swiftf0

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import * as ort from 'onnxruntime-node'

import { freqToMidiFloat } from '../src/audio/notes'
import {
  SWIFTF0_CONF_OFFLINE,
  SWIFTF0_INPUT,
  SWIFTF0_OUT_CONF,
  SWIFTF0_OUT_PITCH,
  SWIFTF0_RATE,
  absPeak,
  decodeFrames,
  framesPerSecond,
  normalizeBy,
} from '../src/audio/swiftf0-core'
import { contourToNotes } from '../src/domain/karaoke/segment'

const MODEL_PATH = 'public/model.onnx'

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

/** Tom com harmônicos decaindo — parecido o bastante com voz para o modelo. */
function tone(freq: number, sec: number): Float32Array {
  const n = Math.round(sec * SWIFTF0_RATE)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let v = 0
    for (let h = 1; h <= 6; h++) v += Math.sin((2 * Math.PI * freq * h * i) / SWIFTF0_RATE) / h
    // envelope suave nas pontas, para não criar transiente de clique
    const ramp = Math.min(1, i / 160, (n - i) / 160)
    out[i] = 0.4 * v * ramp
  }
  return out
}

function concat(parts: Float32Array[]): Float32Array {
  const total = parts.reduce((a, p) => a + p.length, 0)
  const out = new Float32Array(total)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

async function infer(
  session: ort.InferenceSession,
  audio: Float32Array,
): Promise<{ pitch: Float32Array; conf: Float32Array }> {
  const t = new ort.Tensor('float32', audio, [1, audio.length])
  const out = await session.run({ [SWIFTF0_INPUT]: t })
  return {
    pitch: out[SWIFTF0_OUT_PITCH].data as Float32Array,
    conf: out[SWIFTF0_OUT_CONF].data as Float32Array,
  }
}

async function main(): Promise<void> {
  if (!existsSync(MODEL_PATH)) {
    console.error(`modelo não encontrado em ${MODEL_PATH}`)
    process.exit(1)
  }

  console.log('\nextrator de referência (SwiftF0 + onnxruntime-node)')
  const session = await ort.InferenceSession.create(MODEL_PATH)

  // --- taxa de frames, derivada e não presumida ---
  const probe = tone(220, 5)
  const probeOut = await infer(session, probe)
  const fps = framesPerSecond(probeOut.pitch.length, probe.length)

  test('a taxa de frames do modelo é plausível (50–110 fps)', () => {
    assert.ok(fps > 50 && fps < 110, `fps derivado = ${fps.toFixed(2)}`)
  })

  // --- afinação absoluta: erro em cents contra frequência exata ---
  const cases: { hz: number; midi: number; nome: string }[] = [
    { hz: 146.83, midi: 50, nome: 'D3' },
    { hz: 220.0, midi: 57, nome: 'A3' },
    { hz: 329.63, midi: 64, nome: 'E4' },
    { hz: 440.0, midi: 69, nome: 'A4' },
    { hz: 659.26, midi: 76, nome: 'E5' },
  ]

  // O que se exige de cada caso, e por quê:
  //
  //  · a nota QUANTIZADA tem de sair certa — é ela que vira acerto/erro na tela;
  //  · a DISPERSÃO tem de ser baixa — é o ruído que sobrevive à média e vira erro
  //    aleatório no relatório;
  //  · o VIÉS é medido e registrado, mas NÃO reprovado. Viés sistemático do detector
  //    cancela na subtração, porque a referência e o cantor passam pelo mesmo modelo.
  //    É justamente por isso que a CLI usa o model.onnx do app em vez de um extrator
  //    melhor: um detector mais preciso, porém diferente, introduziria um viés que
  //    NÃO cancela e que o app cobraria do cantor.
  const bias: string[] = []

  for (const c of cases) {
    const buf = tone(c.hz, 1.2)
    const { pitch, conf } = await infer(session, normalizeBy(buf, absPeak(buf)))
    const frames = decodeFrames(pitch, conf, SWIFTF0_CONF_OFFLINE)
    const valid = frames.filter((f) => f.valid)
    const cents = valid.map((f) => 1200 * Math.log2(f.f0 / c.hz)).sort((a, b) => a - b)
    const medianCents = cents.length ? cents[cents.length >> 1] : NaN
    const iqr = cents.length
      ? cents[Math.floor(cents.length * 0.75)] - cents[Math.floor(cents.length * 0.25)]
      : NaN
    const medianHz = valid.length
      ? valid.map((f) => f.f0).sort((a, b) => a - b)[valid.length >> 1]
      : NaN
    bias.push(`${c.nome} ${medianCents >= 0 ? '+' : ''}${medianCents.toFixed(1)}c`)

    test(`${c.nome} (${c.hz} Hz): quantiza na nota certa`, () => {
      assert.ok(valid.length > 10, `só ${valid.length} frames válidos`)
      assert.equal(
        Math.round(freqToMidiFloat(medianHz)),
        c.midi,
        `quantizou em MIDI ${Math.round(freqToMidiFloat(medianHz))}, esperado ${c.midi}`,
      )
    })

    test(`${c.nome}: dispersão abaixo de 25 cents (o que não cancela)`, () => {
      assert.ok(iqr < 25, `IQR = ${iqr.toFixed(1)} cents`)
    })
  }

  console.log(`\n  viés medido por nota (informativo, cancela na subtração):`)
  console.log(`    ${bias.join('   ')}\n`)

  // --- pipeline completo: 4 notas conhecidas → 4 notas certas ---
  const seq = [
    { hz: 220.0, midi: 57 },
    { hz: 261.63, midi: 60 },
    { hz: 329.63, midi: 64 },
    { hz: 440.0, midi: 69 },
  ]
  const NOTE_SEC = 0.7
  const audio = concat(seq.map((s) => tone(s.hz, NOTE_SEC)))
  const { pitch, conf } = await infer(session, normalizeBy(audio, absPeak(audio)))
  const frames = decodeFrames(pitch, conf, SWIFTF0_CONF_OFFLINE)
  const midi = frames.map((f) => (f.valid ? freqToMidiFloat(f.f0) : null))
  const { notes, phrases } = contourToNotes(midi, fps)

  test('pipeline completo devolve as 4 notas sintetizadas', () => {
    assert.equal(notes.length, 4, `veio ${notes.length}: ${notes.map((n) => n.midi).join(', ')}`)
    assert.deepEqual(
      notes.map((n) => n.midi),
      seq.map((s) => s.midi),
    )
  })

  test('as 4 notas contíguas ficam numa frase só', () => {
    assert.equal(phrases.length, 1, `veio ${phrases.length} frases`)
  })

  test('a duração de cada nota bate com a sintetizada (±120 ms)', () => {
    for (const n of notes) {
      const dur = n.endSec - n.startSec
      assert.ok(
        Math.abs(dur - NOTE_SEC) < 0.12,
        `nota ${n.midi}: ${dur.toFixed(3)}s, esperado ~${NOTE_SEC}s`,
      )
    }
  })

  console.log(`\n${passed} ok, ${failed} falhou\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack : String(err))
  process.exit(1)
})
