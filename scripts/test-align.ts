// Testes do alinhamento por frase e da medição por nota.
//
// Sintetiza um cantor com defeito CONHECIDO (scoop de entrada, afinação caindo,
// oitava abaixo, entrada atrasada) e exige que a medição reporte exatamente aquele
// defeito — e, o que importa mais, que NÃO reporte os outros. Um medidor que acusa
// tudo é tão inútil quanto um que não acusa nada.

import assert from 'node:assert/strict'
import { alignPhrase, rhythmicTendencyMs, type SungFrame } from '../src/domain/karaoke/align'
import { measureRun, runCoverage } from '../src/domain/karaoke/measure'
import { computeDemand } from '../src/domain/karaoke/demand'
import { groupPhrases } from '../src/domain/karaoke/segment'
import { KARAOKE_SCHEMA, type KaraokeTrack } from '../src/domain/karaoke/track'
import type { TimedNote } from '../src/data/songs'

const FPS = 62.5
const SUNG_FPS = 60 // taxa típica de requestAnimationFrame

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

interface NoteSpec {
  midi: number
  start: number
  end: number
}

/** Monta uma faixa sintética coerente (contorno + notas + frases + exigência). */
function makeTrack(specs: NoteSpec[], conf = 0.95): KaraokeTrack {
  const durationSec = Math.max(...specs.map((s) => s.end)) + 0.5
  const total = Math.ceil(durationSec * FPS)
  const midi: (number | null)[] = new Array(total).fill(null)
  const confArr: number[] = new Array(total).fill(0)
  for (const s of specs) {
    for (let i = Math.round(s.start * FPS); i < Math.round(s.end * FPS); i++) {
      midi[i] = s.midi
      confArr[i] = conf
    }
  }
  const notes: TimedNote[] = specs.map((s, i) => ({
    index: i,
    midi: s.midi,
    startSec: s.start,
    endSec: s.end,
    lyric: '',
  }))
  const phrases = groupPhrases(notes)
  return {
    schema: KARAOKE_SCHEMA,
    id: 'teste',
    title: 'Teste',
    artist: 'Teste',
    audioSha256: 'x',
    audioFileName: 'x.wav',
    durationSec,
    importer: { model: 'swiftf0', version: 'teste', separator: 'htdemucs' },
    refContour: { fps: FPS, midi, conf: confArr },
    notes,
    phrases,
    demand: computeDemand(notes, phrases, midi, FPS),
    coveragePct: 1,
  }
}

/** Gera frames do cantor a partir de uma função midi(t). null = silêncio. */
function sing(
  durationSec: number,
  midiAt: (t: number) => number | null,
  extra: Partial<SungFrame> = {},
): SungFrame[] {
  const out: SungFrame[] = []
  const n = Math.round(durationSec * SUNG_FPS)
  for (let i = 0; i < n; i++) {
    const t = i / SUNG_FPS
    out.push({ t, midi: midiAt(t), clarity: 0.95, dynamics: 0.6, steadiness: 0.9, ...extra })
  }
  return out
}

/** Nota que soa em [start,end) na altura dada, silêncio fora. */
const notesToFn =
  (specs: NoteSpec[], shiftSec = 0, transposeSemitones = 0) =>
  (t: number): number | null => {
    for (const s of specs) {
      if (t >= s.start + shiftSec && t < s.end + shiftSec) return s.midi + transposeSemitones
    }
    return null
  }

console.log('\nalinhamento de frase')

const SIMPLE: NoteSpec[] = [
  { midi: 60, start: 0.5, end: 1.3 },
  { midi: 62, start: 1.3, end: 2.1 },
  { midi: 64, start: 2.1, end: 2.9 },
]

test('cantar exatamente junto devolve offset ~0', () => {
  const track = makeTrack(SIMPLE)
  const sung = sing(4, notesToFn(SIMPLE))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  assert.ok(a.reliable, 'deveria ser confiável')
  assert.ok(Math.abs(a.offsetMs) <= 16, `offset = ${a.offsetMs}ms`)
  assert.equal(a.octaveOffset, 0)
})

test('entrada 120 ms atrasada é recuperada como offset +120 ms', () => {
  const track = makeTrack(SIMPLE)
  const sung = sing(4, notesToFn(SIMPLE, 0.12))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  assert.ok(Math.abs(a.offsetMs - 120) <= 16, `offset = ${a.offsetMs}ms, esperado ~120`)
})

test('cantar uma oitava abaixo é detectado como oitava, não como erro', () => {
  const track = makeTrack(SIMPLE)
  const sung = sing(4, notesToFn(SIMPLE, 0, -12))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  assert.equal(a.octaveOffset, -1, `octaveOffset = ${a.octaveOffset}`)
  assert.ok(Math.abs(a.offsetMs) <= 16, `offset = ${a.offsetMs}ms`)
})

test('silêncio total não inventa alinhamento', () => {
  const track = makeTrack(SIMPLE)
  const a = alignPhrase(track.refContour, track.phrases[0], sing(4, () => null))
  assert.equal(a.reliable, false)
  assert.equal(a.offsetMs, 0)
})

test('tendência rítmica exige um mínimo de frases para ser reportada', () => {
  const few = [0, 1, 2].map((i) => ({
    phraseIndex: i,
    offsetMs: 80,
    octaveOffset: 0,
    matchedFrames: 50,
    reliable: true,
  }))
  assert.equal(rhythmicTendencyMs(few).reportable, false)
  const many = [0, 1, 2, 3, 4, 5].map((i) => ({
    phraseIndex: i,
    offsetMs: 80,
    octaveOffset: 0,
    matchedFrames: 50,
    reliable: true,
  }))
  const r = rhythmicTendencyMs(many)
  assert.equal(r.reportable, true)
  assert.equal(r.medianMs, 80)
})

console.log('\nmedição por nota')

const LONG: NoteSpec[] = [{ midi: 60, start: 0.5, end: 2.5 }]

test('scoop de entrada NÃO contamina o desvio da nota', () => {
  // Entra 200 cents abaixo e sobe em 150 ms. Se os primeiros 120 ms entrassem na
  // conta, a nota inteira apareceria baixa — o erro mais comum deste tipo de app.
  const track = makeTrack(LONG)
  const sung = sing(3, (t) => {
    if (t < 0.5 || t >= 2.5) return null
    const into = t - 0.5
    return into < 0.15 ? 60 - 2 * (1 - into / 0.15) : 60
  })
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const [n] = measureRun(track, sung, [a])
  assert.ok(Math.abs(n.centsDev ?? 999) < 15, `centsDev = ${n.centsDev?.toFixed(1)} cents`)
  assert.ok((n.onsetCents ?? 0) < -80, `onsetCents = ${n.onsetCents?.toFixed(1)} — devia acusar o scoop`)
})

test('afinação caindo 30 cents em 2 s vira deriva de ~-15 c/s', () => {
  const track = makeTrack(LONG)
  const sung = sing(3, (t) => (t >= 0.5 && t < 2.5 ? 60 - 0.3 * ((t - 0.5) / 2) : null))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const [n] = measureRun(track, sung, [a])
  assert.ok(n.driftCentsPerSec !== null, 'deveria medir deriva numa nota de 2 s')
  assert.ok(
    Math.abs((n.driftCentsPerSec ?? 0) + 15) < 4,
    `deriva = ${n.driftCentsPerSec?.toFixed(1)} c/s, esperado ~-15`,
  )
})

test('nota cantada firme NÃO acusa deriva', () => {
  const track = makeTrack(LONG)
  const sung = sing(3, (t) => (t >= 0.5 && t < 2.5 ? 60 : null))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const [n] = measureRun(track, sung, [a])
  assert.ok(Math.abs(n.driftCentsPerSec ?? 0) < 3, `deriva = ${n.driftCentsPerSec?.toFixed(2)} c/s`)
})

test('oitava abaixo dá desvio ~0, não 1200 cents', () => {
  const track = makeTrack(SIMPLE)
  const sung = sing(4, notesToFn(SIMPLE, 0, -12))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const notes = measureRun(track, sung, [a])
  for (const n of notes) {
    assert.ok(Math.abs(n.centsDev ?? 999) < 20, `nota ${n.refMidi}: ${n.centsDev?.toFixed(1)} cents`)
  }
})

test('nota não cantada é marcada sem-voz, não como desafinação', () => {
  const track = makeTrack(SIMPLE)
  // canta as duas primeiras, cala na terceira
  const sung = sing(4, (t) => (t >= 0.5 && t < 2.1 ? notesToFn(SIMPLE)(t) : null))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const notes = measureRun(track, sung, [a])
  const last = notes[2]
  assert.equal(last.skipReason, 'sem-voz')
  assert.equal(last.skipped, true)
})

test('referência de baixa confiança é descartada, não cobrada do cantor', () => {
  const track = makeTrack(SIMPLE, 0.3) // conf abaixo de REF_CONF_MIN
  const sung = sing(4, notesToFn(SIMPLE))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const notes = measureRun(track, sung, [a])
  assert.ok(
    notes.every((n) => n.skipReason === 'ref-fraca'),
    'todas deveriam cair por referência fraca',
  )
  const cov = runCoverage(notes)
  assert.equal(cov.scored, 0)
  assert.equal(cov.refWeak, 3)
})

console.log('\nvibrato do cantor')

test('nota longa com oscilação de 5,5 Hz é medida como vibrato', () => {
  const track = makeTrack(LONG)
  const sung = sing(3, (t) =>
    t >= 0.5 && t < 2.5 ? 60 + 0.5 * Math.sin(2 * Math.PI * 5.5 * (t - 0.5)) : null,
  )
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const [n] = measureRun(track, sung, [a])
  assert.ok(n.vibrato, 'nota de 2 s deveria ter medição de vibrato')
  assert.equal(n.vibrato?.present, true, `present = ${n.vibrato?.present}`)
  assert.ok(Math.abs((n.vibrato?.rateHz ?? 0) - 5.5) < 0.6, `taxa = ${n.vibrato?.rateHz} Hz`)
  // e a oscilação NÃO pode contaminar o desvio da nota — a mediana fica no lugar
  assert.ok(Math.abs(n.centsDev ?? 999) < 15, `centsDev = ${n.centsDev?.toFixed(1)}`)
})

test('nota longa cantada reta é vibrato ausente, não vibrato desconhecido', () => {
  const track = makeTrack(LONG)
  const sung = sing(3, (t) => (t >= 0.5 && t < 2.5 ? 60 : null))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const [n] = measureRun(track, sung, [a])
  assert.ok(n.vibrato, 'deveria haver medição')
  assert.equal(n.vibrato?.present, false)
})

test('nota curta demais devolve null — que é diferente de "sem vibrato"', () => {
  const track = makeTrack(SIMPLE) // notas de 0,8 s
  const sung = sing(4, notesToFn(SIMPLE))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const notes = measureRun(track, sung, [a])
  assert.ok(
    notes.every((n) => n.vibrato === null),
    'nota de 0,8 s não dá para julgar quanto a vibrato',
  )
})

console.log('\ncondições gravadas junto da nota')

test('as condições da MÚSICA são registradas em cada nota', () => {
  const track = makeTrack(SIMPLE)
  const sung = sing(4, notesToFn(SIMPLE))
  const a = alignPhrase(track.refContour, track.phrases[0], sung)
  const notes = measureRun(track, sung, [a])
  assert.equal(notes[0].posInPhrase, 0)
  assert.equal(notes[2].posInPhrase, 1)
  assert.equal(notes[0].leapFromPrev, 0, 'primeira nota da frase não tem salto')
  assert.equal(notes[1].leapFromPrev, 2)
  assert.ok(notes[0].relHeight === 0 && notes[2].relHeight === 1, 'altura relativa nos extremos')
  assert.ok(Math.abs(notes[1].phraseElapsedSec - 0.8) < 0.01)
})

console.log(`\n${passed} ok, ${failed} falhou\n`)
process.exit(failed > 0 ? 1 : 0)
