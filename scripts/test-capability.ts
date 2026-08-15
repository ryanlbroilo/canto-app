// Testes da capacidade do cantor (§4.5) — o outro lado da balança do veredito.
//
// O que se exige aqui é sobretudo que a capacidade NÃO seja inventada. Um número
// alto sem histórico faria o app dizer "a música é fácil, o problema é você"; um
// número baixo por ausência de dado faria o contrário, e diria a todo usuário novo
// que qualquer música está acima dele. Por isso `desconhecido` é um estado de
// primeira classe, e não um zero disfarçado.

import assert from 'node:assert/strict'
import {
  estimateCapability,
  estimateAllCapabilities,
  MIN_SESSIONS,
  TRACK_DIFFICULTY,
  type CapabilityInput,
} from '../src/domain/karaoke/capability'
import { buildCapabilityInput } from '../src/data/karaoke-capability'
import { DEMAND_ANCHORS } from '../src/domain/karaoke/demand'
import type { SessionRecord, SkillId, SkillProgress, TrackLevel } from '../src/data/types'

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

function input(over: Partial<CapabilityInput> = {}): CapabilityInput {
  return { range: null, history: {}, ...over }
}

function hist(
  skill: SkillId,
  accuracy: number,
  level: TrackLevel = 'intermediario',
  sessions = 10,
): CapabilityInput {
  return input({ history: { [skill]: { accuracy, level, sessions } } })
}

// ------------------------------------------------------------------ extensão --

test('extensão sem baseline é desconhecida, não zero-com-cara-de-medida', () => {
  const c = estimateCapability('extensao', input())
  assert.equal(c.source, 'desconhecido')
})

test('extensão medida usa a MESMA âncora que normaliza a exigência da música', () => {
  const [lo, hi] = DEMAND_ANCHORS.extensao
  // um cantor que abrange exatamente a âncora superior tem capacidade 1
  const c = estimateCapability('extensao', input({ range: { lowMidi: 48, highMidi: 48 + hi } }))
  assert.equal(c.source, 'medido')
  assert.equal(c.value, 1)

  // e um que abrange a âncora inferior tem capacidade 0 — mas MEDIDA, não ausente
  const baixo = estimateCapability('extensao', input({ range: { lowMidi: 48, highMidi: 48 + lo } }))
  assert.equal(baixo.source, 'medido')
  assert.equal(baixo.value, 0)
})

test('extensão ignora ONDE o cantor canta — só QUANTO ele abrange', () => {
  const grave = estimateCapability('extensao', input({ range: { lowMidi: 36, highMidi: 55 } }))
  const agudo = estimateCapability('extensao', input({ range: { lowMidi: 60, highMidi: 79 } }))
  assert.equal(grave.value, agudo.value)
})

// ------------------------------------------------------------------ histórico --

test('skill sem histórico nenhum é desconhecida', () => {
  const c = estimateCapability('respiracao', input())
  assert.equal(c.source, 'desconhecido')
  assert.equal(c.sessions, 0)
})

test(`abaixo de ${MIN_SESSIONS} sessões ainda é desconhecida, e reporta a contagem`, () => {
  const c = estimateCapability('respiracao', hist('respiracao', 0.95, 'avancado', MIN_SESSIONS - 1))
  assert.equal(c.source, 'desconhecido')
  assert.equal(c.sessions, MIN_SESSIONS - 1)
})

test(`a partir de ${MIN_SESSIONS} sessões vira histórico`, () => {
  const c = estimateCapability('respiracao', hist('respiracao', 0.9, 'avancado', MIN_SESSIONS))
  assert.equal(c.source, 'historico')
  assert.ok(c.value > 0)
})

test('acerto perfeito no nível X entrega exatamente a dificuldade do nível X', () => {
  for (const level of Object.keys(TRACK_DIFFICULTY) as TrackLevel[]) {
    const c = estimateCapability('afinacao', hist('afinacao', 1, level))
    assert.ok(
      Math.abs(c.value - TRACK_DIFFICULTY[level]) < 1e-9,
      `${level}: ${c.value} != ${TRACK_DIFFICULTY[level]}`,
    )
  }
})

test('mesmo acerto em nível mais alto vale mais capacidade', () => {
  const ini = estimateCapability('afinacao', hist('afinacao', 0.9, 'iniciante'))
  const inter = estimateCapability('afinacao', hist('afinacao', 0.9, 'intermediario'))
  const av = estimateCapability('afinacao', hist('afinacao', 0.9, 'avancado'))
  assert.ok(ini.value < inter.value, `${ini.value} !< ${inter.value}`)
  assert.ok(inter.value < av.value, `${inter.value} !< ${av.value}`)
})

test('quem subiu de trilha e está apanhando não fica acima de quem domina o nível abaixo', () => {
  const apanhando = estimateCapability('afinacao', hist('afinacao', 0.4, 'avancado'))
  const dominando = estimateCapability('afinacao', hist('afinacao', 1.0, 'intermediario'))
  assert.ok(apanhando.value < dominando.value, `${apanhando.value} !< ${dominando.value}`)
})

test('nenhum nível da trilha chega a 1,0 — a trilha do app não é o teto do canto', () => {
  for (const [level, d] of Object.entries(TRACK_DIFFICULTY)) {
    assert.ok(d < 1, `${level} = ${d}`)
  }
})

test('capacidade fica sempre em 0..1, mesmo com acerto fora da faixa', () => {
  for (const acc of [-5, 0, 0.5, 1, 42]) {
    const c = estimateCapability('vibrato', hist('vibrato', acc))
    assert.ok(c.value >= 0 && c.value <= 1, `acerto ${acc} => ${c.value}`)
  }
})

test('estimateAllCapabilities cobre todas as skills pedidas', () => {
  const skills: SkillId[] = ['afinacao', 'respiracao', 'extensao']
  const all = estimateAllCapabilities(skills, hist('afinacao', 0.8))
  assert.deepEqual(Object.keys(all).sort(), [...skills].sort())
  assert.equal(all.extensao.source, 'desconhecido')
  assert.equal(all.afinacao.source, 'historico')
})

// -------------------------------------------------------------------- ponte --

let seq = 0

function session(over: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: `s${seq++}`,
    dateISO: '2026-01-01T00:00:00.000Z',
    kind: 'practice',
    label: 'sessão',
    durationSec: 300,
    notesHitPct: 80,
    avgCentsDev: 20,
    ...over,
  }
}

function progress(id: SkillId, last5Avg: number): SkillProgress {
  return { id, xp: 0, level: 1, last5Avg, trend: 0 }
}

test('a ponte converte last5Avg de 0..100 para 0..1', () => {
  const inp = buildCapabilityInput({
    sessions: [],
    skills: [progress('afinacao', 72)],
    exercisesDone: {},
    baseline: null,
  })
  assert.equal(inp.history.afinacao?.accuracy, 0.72)
})

test('a ponte conta sessões pela MESMA regra da gamificação', () => {
  // sessão sem exerciseId conta para afinacao+sustentacao (fallback de skillXpFromSession)
  const inp = buildCapabilityInput({
    sessions: [session(), session(), session()],
    skills: [progress('afinacao', 80), progress('vibrato', 80)],
    exercisesDone: {},
    baseline: null,
  })
  assert.equal(inp.history.afinacao?.sessions, 3)
  assert.equal(inp.history.vibrato?.sessions, 0)
})

test('a ponte sobe o nível conforme exercícios são DOMINADOS, não só feitos', () => {
  const feitos: Record<string, { count: number; bestScore: number }> = {}
  for (let i = 0; i < 20; i++) feitos[`ex-${i}`] = { count: 9, bestScore: 70 }
  const inp = buildCapabilityInput({
    sessions: [],
    skills: [progress('afinacao', 80)],
    exercisesDone: feitos,
    baseline: null,
  })
  // 20 exercícios praticados mas nenhum dominado => ainda iniciante
  assert.equal(inp.history.afinacao?.level, 'iniciante')
})

test('a ponte só entrega range quando existe baseline medido', () => {
  const semBaseline = buildCapabilityInput({
    sessions: [],
    skills: [],
    exercisesDone: {},
    baseline: null,
  })
  assert.equal(semBaseline.range, null)

  const comBaseline = buildCapabilityInput({
    sessions: [],
    skills: [],
    exercisesDone: {},
    baseline: {
      lowMidi: 48,
      highMidi: 67,
      voiceType: 'baritono',
      includesFalsetto: false,
      measuredAt: '2026-01-01T00:00:00.000Z',
    },
  })
  assert.deepEqual(comBaseline.range, { lowMidi: 48, highMidi: 67 })
})

console.log(`\n${passed} ok, ${failed} falharam`)
process.exit(failed > 0 ? 1 : 0)
