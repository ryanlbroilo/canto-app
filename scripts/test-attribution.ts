// Testes da tabela de atribuição e da guarda de honestidade (§4.2/§4.3).
//
// A metade que importa aqui é a NEGATIVA. Fazer um diagnosticador acusar alguma coisa
// é trivial — basta baixar limiar. O que se exige abaixo é que ele fique CALADO
// quando o cantor erra de forma uniforme, quando a amostra é pequena, quando a
// condição cobre a música inteira, e quando o sinal que confirmaria a causa não foi
// medido. Um app que acusa sete fundamentos por música é indistinguível de um que
// sorteia sete fundamentos.

import assert from 'node:assert/strict'
import {
  attributeRun,
  singerBaseline,
  MIN_NOTES,
  type Attribution,
  type Finding,
} from '../src/domain/karaoke/attribute'
import type { SungNote } from '../src/domain/karaoke/measure'
import type { SkillId } from '../src/data/types'

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

let seq = 0

/** Nota "comum": duração média, sem salto, meio da frase, meio da extensão, quase
 *  afinada. É ela que forma o baseline — o normal do próprio cantor. */
function note(over: Partial<SungNote> = {}): SungNote {
  const i = seq++
  return {
    index: i,
    refMidi: 60,
    startSec: i * 1.0,
    durSec: 0.7,
    centsDev: 5,
    onsetCents: 10,
    settleMs: 60,
    driftCentsPerSec: 0,
    timingMs: 0,
    voicedPct: 1,
    dynamicsAvg: 0.6,
    steadinessAvg: 0.9,
    h1h2Avg: 5,
    centroidAvg: 2000,
    vibrato: null,
    skipped: false,
    skipReason: null,
    phraseIndex: 0,
    posInPhrase: 0.5,
    phraseElapsedSec: 2,
    leapFromPrev: 2,
    localNoteRate: 1,
    relHeight: 0.5,
    ...over,
  }
}

/** n notas comuns — o pano de fundo contra o qual a condição se destaca. */
function plain(n: number, over: Partial<SungNote> = {}): SungNote[] {
  return Array.from({ length: n }, () => note(over))
}

const got = (a: Attribution, skill: SkillId): Finding | undefined =>
  a.findings.find((f) => f.skill === skill)
const weak = (a: Attribution, skill: SkillId): Finding | undefined =>
  a.weak.find((f) => f.skill === skill)

console.log('\nbaseline do cantor')

test('baseline sai das notas comuns, não da música inteira', () => {
  const notes = [
    ...plain(10, { centsDev: 10 }),
    // notas difíceis, com erro grande: não podem puxar o "normal" para cima
    ...plain(6, { centsDev: 90, durSec: 2.0, relHeight: 0.95 }),
  ]
  const b = singerBaseline(notes)
  assert.equal(b.reliable, true)
  assert.equal(b.cents, 10, `baseline = ${b.cents}`)
})

test('sem notas comuns suficientes o baseline é declarado não confiável', () => {
  const b = singerBaseline(plain(3, { centsDev: 10 }))
  assert.equal(b.reliable, false)
  assert.ok(b.n < MIN_NOTES)
})

console.log('\na guarda de honestidade')

test('cantor uniformemente mediano NÃO gera achado nenhum', () => {
  // erra 18 cents em tudo, sem concentrar em condição alguma. É o caso que separa
  // um diagnosticador de um horóscopo: aqui ele tem que calar a boca.
  const a = attributeRun(plain(40, { centsDev: 18 }))
  assert.deepEqual(a.findings, [], `achou: ${a.findings.map((f) => f.skill).join(', ')}`)
})

test('condição com menos de 5 notas vira sinal fraco, não achado', () => {
  const a = attributeRun([
    ...plain(30),
    ...plain(4, { durSec: 2.0, driftCentsPerSec: -30, centsDev: 60 }),
  ])
  assert.equal(got(a, 'sustentacao'), undefined)
  assert.equal(weak(a, 'sustentacao')?.weakBecause, 'poucas-notas')
})

test('condição que cobre a música inteira não é condição', () => {
  // TODAS as notas são longas e caindo: a "condição" é o baseline dele
  const a = attributeRun(plain(30, { durSec: 2.0, driftCentsPerSec: -30, centsDev: 60 }))
  assert.equal(got(a, 'sustentacao'), undefined)
  assert.equal(weak(a, 'sustentacao')?.weakBecause, 'condicao-generica')
})

test('efeito pequeno demais fica de fora, mesmo com amostra boa', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 10 }),
    // 8 cents acima do baseline: abaixo dos 15 exigidos
    ...plain(10, { leapFromPrev: 7, centsDev: 18, onsetCents: -90, settleMs: 400 }),
  ])
  assert.equal(got(a, 'afinacao'), undefined)
  assert.equal(weak(a, 'afinacao')?.weakBecause, 'efeito-pequeno')
})

test('sem baseline confiável, nenhuma regra em cents é reportada', () => {
  // nenhuma nota comum: todas são de salto
  const a = attributeRun(plain(30, { leapFromPrev: 7, centsDev: 80, onsetCents: -120, settleMs: 400 }))
  const f = weak(a, 'afinacao')
  assert.ok(f, 'deveria haver um candidato de afinação')
  assert.ok(
    f?.weakBecause === 'sem-baseline' || f?.weakBecause === 'condicao-generica',
    `weakBecause = ${f?.weakBecause}`,
  )
  assert.equal(got(a, 'afinacao'), undefined)
})

console.log('\nsustentação')

test('afinação caindo em nota longa vira achado de sustentação', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { durSec: 2.0, driftCentsPerSec: -22, centsDev: 40 }),
  ])
  const f = got(a, 'sustentacao')
  assert.ok(f, `não achou; fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
  assert.equal(f?.n, 8)
  assert.ok(f!.evidence.includes('22'), f!.evidence)
})

test('nota longa cantada firme não vira achado', () => {
  const a = attributeRun([...plain(30), ...plain(8, { durSec: 2.0, driftCentsPerSec: -1 })])
  assert.equal(got(a, 'sustentacao'), undefined)
})

console.log('\nrespiração')

test('fim de frase longa com erro subindo E volume caindo acusa respiração', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8, posInPhrase: 0.3, phraseElapsedSec: 1, dynamicsAvg: 0.7 }),
    ...plain(8, { centsDev: 45, posInPhrase: 0.9, phraseElapsedSec: 8, dynamicsAvg: 0.45 }),
  ])
  const f = got(a, 'respiracao')
  assert.ok(f, `não achou; fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
})

test('erro no fim da frase SEM queda de volume não é falta de ar', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8, posInPhrase: 0.3, phraseElapsedSec: 1, dynamicsAvg: 0.7 }),
    ...plain(8, { centsDev: 45, posInPhrase: 0.9, phraseElapsedSec: 8, dynamicsAvg: 0.7 }),
  ])
  assert.equal(got(a, 'respiracao'), undefined)
  assert.equal(weak(a, 'respiracao')?.weakBecause, 'efeito-pequeno')
})

console.log('\npassaggio')

test('erro concentrado numa faixa COM troca de timbre acusa passaggio', () => {
  const a = attributeRun([
    ...plain(30, { refMidi: 55, centsDev: 8, h1h2Avg: 4 }),
    ...plain(8, { refMidi: 66, centsDev: 50, h1h2Avg: 9 }),
  ])
  const f = got(a, 'passaggio')
  assert.ok(f, `não achou; fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
  assert.ok(f!.condition.includes('faixa'), f!.condition)
})

test('erro concentrado numa faixa SEM troca de timbre não é passaggio', () => {
  const a = attributeRun([
    ...plain(30, { refMidi: 55, centsDev: 8, h1h2Avg: 4 }),
    ...plain(8, { refMidi: 66, centsDev: 50, h1h2Avg: 4 }),
  ])
  assert.equal(got(a, 'passaggio'), undefined)
  assert.equal(weak(a, 'passaggio')?.weakBecause, 'sem-sinal')
})

test('aparelho sem H1-H2 devolve "não sei", não "está tudo bem"', () => {
  const a = attributeRun([
    ...plain(30, { refMidi: 55, centsDev: 8, h1h2Avg: null }),
    ...plain(8, { refMidi: 66, centsDev: 50, h1h2Avg: null }),
  ])
  assert.equal(got(a, 'passaggio'), undefined)
  assert.equal(weak(a, 'passaggio')?.weakBecause, 'sem-sinal')
  assert.equal(weak(a, 'ressonancia')?.weakBecause, 'sem-sinal')
})

console.log('\nextensão, afinação, vibrato, ressonância')

test('extremo da música com a voz custando a sair acusa extensão', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { relHeight: 0.95, centsDev: 45, voicedPct: 0.5, steadinessAvg: 0.6 }),
  ])
  assert.ok(got(a, 'extensao'), `fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
})

test('extremo cantado com firmeza não é falta de extensão', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { relHeight: 0.95, centsDev: 45, voicedPct: 1, steadinessAvg: 0.9 }),
  ])
  assert.equal(got(a, 'extensao'), undefined)
  assert.equal(weak(a, 'extensao')?.weakBecause, 'sem-sinal')
})

test('extensão não é cobrada dentro do alcance já conhecido do cantor', () => {
  const notes = [
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { refMidi: 67, relHeight: 0.95, centsDev: 45, voicedPct: 0.5, steadinessAvg: 0.6 }),
  ]
  const a = attributeRun(notes, { lo: 48, hi: 72 })
  assert.equal(got(a, 'extensao'), undefined)
})

test('salto grande com entrada fora e procura lenta acusa afinação', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { leapFromPrev: 7, centsDev: 45, onsetCents: -140, settleMs: 420 }),
  ])
  assert.ok(got(a, 'afinacao'), `fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
})

test('salto grande com ataque limpo não vira achado', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 8 }),
    ...plain(8, { leapFromPrev: 7, centsDev: 45, onsetCents: -12, settleMs: 50 }),
  ])
  assert.equal(got(a, 'afinacao'), undefined)
})

test('notas longas todas retas acusam vibrato ausente', () => {
  const a = attributeRun([
    ...plain(30),
    ...plain(8, { durSec: 2.0, vibrato: { present: false, rateHz: 0, extentCents: 4 } }),
  ])
  const f = got(a, 'vibrato')
  assert.ok(f, `fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
  assert.ok(f!.evidence.includes('retas'), f!.evidence)
})

test('vibrato saudável não vira achado', () => {
  const a = attributeRun([
    ...plain(30),
    ...plain(8, { durSec: 2.0, vibrato: { present: true, rateHz: 5.5, extentCents: 60 } }),
  ])
  assert.equal(got(a, 'vibrato'), undefined)
})

test('vibrato é medido em fração de notas, não em cents', () => {
  // vibrato torto não desloca a mediana da nota: se a regra cobrasse efeito em
  // cents, ela nunca dispararia. Aqui o desvio é o mesmo do baseline.
  const a = attributeRun([
    ...plain(30, { centsDev: 5 }),
    ...plain(8, { durSec: 2.0, centsDev: 5, vibrato: { present: true, rateHz: 8.2, extentCents: 40 } }),
  ])
  const f = got(a, 'vibrato')
  assert.ok(f, 'vibrato rápido demais deveria ser reportado mesmo afinado')
  assert.equal(f?.effect.unit, 'fracao')
})

test('notas erradas mais sopradas que o resto acusam ressonância', () => {
  const a = attributeRun([
    ...plain(30, { centsDev: 5, h1h2Avg: 3 }),
    ...plain(8, { centsDev: 60, h1h2Avg: 12 }),
  ])
  const f = got(a, 'ressonancia')
  assert.ok(f, `fracos: ${a.weak.map((w) => `${w.skill}:${w.weakBecause}`).join(', ')}`)
  assert.equal(f?.effect.unit, 'db')
})

test('notas erradas com o mesmo timbre do resto não acusam ressonância', () => {
  const a = attributeRun([...plain(30, { centsDev: 5, h1h2Avg: 5 }), ...plain(8, { centsDev: 60, h1h2Avg: 5 })])
  assert.equal(got(a, 'ressonancia'), undefined)
})

console.log('\nsinais sem referência')

test('notas mudas no agudo aparecem mesmo estando fora de toda regra', () => {
  const a = attributeRun([
    ...plain(20),
    ...plain(6, { relHeight: 0.95, skipped: true, skipReason: 'sem-voz', centsDev: null, voicedPct: 0.05 }),
  ])
  const s = a.signals.find((x) => x.kind === 'mudez-no-agudo')
  assert.ok(s, `sinais: ${a.signals.map((x) => x.kind).join(', ') || 'nenhum'}`)
  assert.equal(s?.n, 6)
  // e não podem ter entrado na contagem de notas avaliadas
  assert.equal(a.scored, 20)
})

console.log('\nordenação')

test('o achado mais grave vem primeiro', () => {
  const a = attributeRun([
    ...plain(20, { centsDev: 8 }),
    ...plain(6, { durSec: 2.0, driftCentsPerSec: -60, centsDev: 40 }),
    ...plain(6, { leapFromPrev: 7, centsDev: 30, onsetCents: -140, settleMs: 420 }),
  ])
  assert.ok(a.findings.length >= 2, `achados: ${a.findings.map((f) => f.skill).join(', ')}`)
  assert.equal(a.findings[0].skill, 'sustentacao')
})

console.log(`\n${passed} ok, ${failed} falhou\n`)
process.exit(failed > 0 ? 1 : 0)
