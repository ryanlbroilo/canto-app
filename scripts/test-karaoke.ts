// Testes das funções puras do karaokê. Sintetiza contornos com defeito CONHECIDO e
// exige que a segmentação não caia nele. Rode com: npm run test:karaoke
//
// Cada teste existe por causa de um modo de falha concreto, nomeado no título — não
// são testes de cobertura, são armadilhas.

import assert from 'node:assert/strict'
import {
  contourToNotes,
  segmentNotes,
  medianFilter3,
  removeShortIslands,
  fillShortGaps,
  groupPhrases,
  mergeAdjacent,
} from '../src/domain/karaoke/segment'
import { computeDemand } from '../src/domain/karaoke/demand'

const FPS = 62.5 // taxa real do SwiftF0 (hop 256 @ 16 kHz)

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

/** Contorno constante de `sec` segundos em `midi`. */
const flat = (midi: number, sec: number): (number | null)[] =>
  new Array(Math.round(sec * FPS)).fill(midi)

/** Silêncio de `sec` segundos. */
const silence = (sec: number): (number | null)[] => new Array(Math.round(sec * FPS)).fill(null)

console.log('\nsegmentação')

test('vibrato de ±80 cents NÃO estilhaça a nota sustentada', () => {
  // Este é o motivo de a segmentação ser por histerese com confirmação temporal.
  // Quantização ingênua (arredondar cada frame) devolveria dezenas de notas aqui.
  const n = Math.round(2 * FPS)
  const midi: (number | null)[] = []
  for (let i = 0; i < n; i++) midi.push(60.5 + 0.8 * Math.sin((2 * Math.PI * 5.5 * i) / FPS))
  const notes = segmentNotes(midi, FPS)
  assert.equal(notes.length, 1, `esperava 1 nota, veio ${notes.length}`)
})

test('troca real de nota (60 → 64) é detectada como duas notas', () => {
  const notes = segmentNotes([...flat(60, 1), ...flat(64, 1)], FPS)
  assert.equal(notes.length, 2, `esperava 2 notas, veio ${notes.length}`)
  assert.equal(notes[0].midi, 60)
  assert.equal(notes[1].midi, 64)
})

test('a troca de nota não deixa buraco de tempo entre as notas', () => {
  // Se a nota nova começasse onde a troca foi CONFIRMADA (e não onde ela começou),
  // sumiriam ~60 ms por transição — e a duração das notas, que é a condição do
  // diagnóstico de sustentação, ficaria sistematicamente subestimada.
  const notes = segmentNotes([...flat(60, 1), ...flat(64, 1)], FPS)
  assert.equal(notes[0].endSec, notes[1].startSec, 'fim da nota 1 != início da nota 2')
})

test('notas rápidas mas realistas (250 ms cada) continuam separadas', () => {
  // Guarda do custo do espinho: a janela de 200 ms absorve notas abaixo de ~100 ms,
  // mas não pode comer uma escada de semínimas rápidas.
  const midi = [...flat(60, 0.25), ...flat(62, 0.25), ...flat(64, 0.25), ...flat(65, 0.25)]
  const notes = segmentNotes(midi, FPS)
  assert.equal(notes.length, 4, `esperava 4 notas, veio ${notes.length}`)
  assert.deepEqual(
    notes.map((n) => n.midi),
    [60, 62, 64, 65],
  )
})

test('glitch de oitava de 1 frame é morto pela mediana móvel', () => {
  const midi = [...flat(60, 1)]
  midi[Math.round(0.5 * FPS)] = 72 // um frame uma oitava acima
  const notes = segmentNotes(medianFilter3(midi), FPS)
  assert.equal(notes.length, 1, `esperava 1 nota, veio ${notes.length}`)
  assert.equal(notes[0].midi, 60)
})

test('consoante surda (buraco de 32 ms) não parte a nota em duas', () => {
  const midi = [...flat(60, 0.5), ...silence(0.032), ...flat(60, 0.5)]
  const { notes } = contourToNotes(midi, FPS)
  assert.equal(notes.length, 1, `esperava 1 nota, veio ${notes.length}`)
})

test('ilha vozeada de 40 ms é descartada (é ruído, não nota)', () => {
  const midi = [...silence(0.3), ...flat(60, 0.04), ...silence(0.3)]
  const cleaned = removeShortIslands(midi, FPS)
  assert.ok(
    cleaned.every((v) => v === null),
    'a ilha curta deveria ter sido removida',
  )
})

test('buraco longo (400 ms) NÃO é interpolado', () => {
  // Preencher isto uniria duas frases e destruiria a análise de respiração.
  const midi = [...flat(60, 0.5), ...silence(0.4), ...flat(60, 0.5)]
  const filled = fillShortGaps(midi, FPS)
  assert.ok(
    filled.slice(Math.round(0.55 * FPS), Math.round(0.8 * FPS)).some((v) => v === null),
    'o buraco longo não deveria ter sido preenchido',
  )
})

console.log('\nfrases')

test('silêncio de 500 ms fecha a frase', () => {
  const midi = [...flat(60, 0.6), ...silence(0.5), ...flat(62, 0.6)]
  const { notes, phrases } = contourToNotes(midi, FPS)
  assert.equal(notes.length, 2)
  assert.equal(phrases.length, 2, `esperava 2 frases, veio ${phrases.length}`)
})

test('notas contíguas ficam na mesma frase', () => {
  const midi = [...flat(60, 0.6), ...flat(62, 0.6), ...flat(64, 0.6)]
  const { phrases } = contourToNotes(midi, FPS)
  assert.equal(phrases.length, 1, `esperava 1 frase, veio ${phrases.length}`)
  assert.equal(phrases[0].noteIdx.length, 3)
})

test('notas iguais separadas por buraco curto são unidas em uma sustentada', () => {
  const merged = mergeAdjacent([
    { index: 0, midi: 60, startSec: 0, endSec: 1.0, lyric: '' },
    { index: 1, midi: 60, startSec: 1.03, endSec: 2.0, lyric: '' },
  ])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].endSec, 2.0)
})

console.log('\nexigência')

test('música de range largo exige mais extensão que a de range estreito', () => {
  const wide = [
    { index: 0, midi: 50, startSec: 0, endSec: 0.5, lyric: '' },
    { index: 1, midi: 74, startSec: 0.5, endSec: 1.0, lyric: '' },
  ]
  const narrow = [
    { index: 0, midi: 60, startSec: 0, endSec: 0.5, lyric: '' },
    { index: 1, midi: 63, startSec: 0.5, endSec: 1.0, lyric: '' },
  ]
  const dw = computeDemand(wide, groupPhrases(wide), [], FPS)
  const dn = computeDemand(narrow, groupPhrases(narrow), [], FPS)
  assert.ok(dw.extensao > dn.extensao, 'range largo deveria exigir mais extensão')
  assert.equal(dn.extensao, 0, 'range de 3 semitons deveria zerar a exigência')
})

test('exigência fica sempre em 0..1', () => {
  const absurd = [
    { index: 0, midi: 30, startSec: 0, endSec: 30, lyric: '' },
    { index: 1, midi: 100, startSec: 30, endSec: 60, lyric: '' },
  ]
  const d = computeDemand(absurd, groupPhrases(absurd), [], FPS)
  for (const [k, v] of Object.entries(d)) {
    if (k === 'raw') continue
    assert.ok(typeof v === 'number' && v >= 0 && v <= 1, `${k} fora de 0..1: ${String(v)}`)
  }
})

test('salto ENTRE frases não conta como salto cantado', () => {
  // O intervalo entre a última nota de uma frase e a primeira da seguinte é uma
  // respiração, não um salto — contá-lo inflaria a exigência de afinação.
  const notes = [
    { index: 0, midi: 60, startSec: 0, endSec: 0.5, lyric: '' },
    { index: 1, midi: 72, startSec: 2.0, endSec: 2.5, lyric: '' },
  ]
  const d = computeDemand(notes, groupPhrases(notes), [], FPS)
  assert.equal(d.raw.leapPct, 0, 'salto entre frases não deveria contar')
})

test('música vazia não quebra nem devolve NaN', () => {
  const d = computeDemand([], [], [], FPS)
  assert.equal(d.extensao, 0)
  assert.ok(Number.isFinite(d.raw.medianNoteSec))
})

console.log(`\n${passed} ok, ${failed} falhou\n`)
process.exit(failed > 0 ? 1 : 0)
