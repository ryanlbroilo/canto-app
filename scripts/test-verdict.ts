// Testes do veredito "é você ou é a música" (§4.5) e da ponte para os exercícios.
//
// O teste que dá nome ao arquivo é o da música fora do alcance com pouca extensão:
// dez semitons de melodia, três acima do agudo do cantor. A exigência de EXTENSÃO
// dessa música é baixa — ela é estreita — então um app que só comparasse eixos 0..1
// concluiria "a música é fácil, o problema é você" exatamente na situação em que o
// problema não é você. É esse erro, e não a ausência de features, que faz alguém
// desinstalar.

import assert from 'node:assert/strict'
import {
  judgeRun,
  judgeSkill,
  rangeFit,
  demandFor,
  ABSOLUTE_SKILLS,
  CEILING_MARGIN,
  VERDICT_GAP,
  type SingerRange,
} from '../src/domain/karaoke/verdict'
import type { Capability } from '../src/domain/karaoke/capability'
import type { Finding } from '../src/domain/karaoke/attribute'
import type { SongDemand } from '../src/domain/karaoke/track'
import { nextForVerdict, nextFromVerdict, LOW_DEMAND } from '../src/data/karaoke-next'
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

// ------------------------------------------------------------------ fixtures --

interface DemandOver {
  extensao?: number
  sustentacao?: number
  respiracao?: number
  afinacao?: number
  vibrato?: number
  loMidi?: number
  hiMidi?: number
}

function demand(over: DemandOver = {}): SongDemand {
  const loMidi = over.loMidi ?? 55
  const hiMidi = over.hiMidi ?? 67
  return {
    extensao: over.extensao ?? 0.2,
    sustentacao: over.sustentacao ?? 0.2,
    respiracao: over.respiracao ?? 0.2,
    afinacao: over.afinacao ?? 0.2,
    vibrato: over.vibrato ?? 0.2,
    raw: {
      loMidi,
      hiMidi,
      rangeSemitones: hiMidi - loMidi,
      medianNoteSec: 0.5,
      longNotePct: 0.1,
      medianPhraseSec: 4,
      maxPhraseSec: 6,
      leapPct: 0.1,
      notesPerSec: 2,
      vibratoNotePct: 0.1,
      scoredNotes: 60,
    },
  }
}

const cap = (value: number): Capability => ({ value, source: 'historico', sessions: 10 })
const unknownCap: Capability = { value: 0, source: 'desconhecido', sessions: 0 }

let seq = 0
function finding(skill: SkillId): Finding {
  return {
    skill,
    condition: 'nas notas longas',
    evidence: '19 cents pior que o seu normal',
    n: 8,
    coverage: 0.3,
    effect: { value: 19, unit: 'cents', threshold: 15 },
    reported: true,
    weakBecause: null,
    noteIdx: [seq++],
  }
}

// -------------------------------------------------------------- encaixe (§1) --

test('sem baseline medido o encaixe é desconhecido e não suspende nada', () => {
  const fit = rangeFit(demand(), null)
  assert.equal(fit.status, 'desconhecido')
  assert.equal(fit.suggestShift, 0)

  const v = judgeSkill('afinacao', demand({ afinacao: 0.8 }), cap(0.2), fit)
  assert.equal(v.culpa, 'musica', 'encaixe desconhecido não pode virar veredito indefinido')
})

test('música confortavelmente dentro da voz cabe', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 72 }
  const fit = rangeFit(demand({ loMidi: 55, hiMidi: 67 }), singer)
  assert.equal(fit.status, 'cabe')
  assert.equal(fit.overHigh, 0)
  assert.equal(fit.overLow, 0)
  assert.equal(fit.suggestShift, 0)
  assert.equal(fit.residual, 0)
})

test(`encostar a menos de ${CEILING_MARGIN} semitons do agudo é "no-limite", não "cabe"`, () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 72 }
  const fit = rangeFit(demand({ loMidi: 55, hiMidi: 71 }), singer)
  assert.equal(fit.status, 'no-limite')
  assert.equal(fit.overHigh, 0, 'no-limite ainda cabe — não há estouro')
})

test('música 3 semitons acima do agudo não cabe, e a transposição é exatamente -3', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 72 }
  const fit = rangeFit(demand({ loMidi: 65, hiMidi: 75 }), singer)
  assert.equal(fit.status, 'nao-cabe')
  assert.equal(fit.overHigh, 3)
  assert.equal(fit.suggestShift, -3)
  assert.equal(fit.residual, 0, 'cabendo depois de transpor, não sobra estouro')
})

test('música abaixo do grave sobe, e não desce', () => {
  const singer: SingerRange = { lowMidi: 55, highMidi: 79 }
  const fit = rangeFit(demand({ loMidi: 50, hiMidi: 62 }), singer)
  assert.equal(fit.status, 'nao-cabe')
  assert.equal(fit.overLow, 5)
  assert.equal(fit.suggestShift, 5)
  assert.equal(fit.residual, 0)
})

test('música mais LARGA que a voz: transpor ajuda mas sobra estouro, e isso é dito', () => {
  const singer: SingerRange = { lowMidi: 60, highMidi: 70 } // 10 semitons
  const fit = rangeFit(demand({ loMidi: 55, hiMidi: 75 }), singer) // 20 semitons
  assert.equal(fit.status, 'nao-cabe')
  assert.ok(fit.residual > 0, 'residual precisa denunciar que a transposição não resolve')
  assert.equal(fit.residual, 10, 'sobra a diferença de largura, esteja onde estiver')
})

test('quando várias transposições empatam, vence a menor', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 84 }
  const fit = rangeFit(demand({ loMidi: 60, hiMidi: 67 }), singer)
  assert.equal(fit.suggestShift, 0, 'já cabe: não mexer é a resposta certa')
})

// ------------------------------------------------------- o erro que importa --

test('música ESTREITA e fora do alcance NÃO vira culpa do cantor', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 72 }
  // dez semitons de melodia (exigência de extensão baixíssima), três acima do teto
  const d = demand({ loMidi: 65, hiMidi: 75, extensao: 0.1, afinacao: 0.1 })
  const v = judgeRun([finding('afinacao'), finding('extensao')], d, {
    afinacao: cap(0.8),
    extensao: cap(0.9),
  }, singer)

  assert.equal(v.fit.status, 'nao-cabe')
  for (const s of v.skills) {
    assert.equal(s.culpa, 'indefinido', `${s.skill} foi julgado por cima de música fora do alcance`)
    assert.equal(s.reason, 'fora-do-alcance')
  }
  // e a ação existe, mesmo sem culpado
  assert.equal(v.fit.suggestShift, -3)
})

test('a MESMA música dentro do alcance volta a ser julgável', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 79 }
  const d = demand({ loMidi: 65, hiMidi: 75, afinacao: 0.1 })
  const v = judgeRun([finding('afinacao')], d, { afinacao: cap(0.8) }, singer)
  assert.notEqual(v.fit.status, 'nao-cabe')
  assert.equal(v.skills[0].culpa, 'voce')
})

// ------------------------------------------------------------- eixos (§2) --

test('exigência bem acima da capacidade é culpa da música', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('respiracao', demand({ respiracao: 0.9 }), cap(0.3), fit)
  assert.equal(v.culpa, 'musica')
  assert.ok(v.gap !== null && v.gap >= VERDICT_GAP)
})

test('capacidade bem acima da exigência é déficit de execução', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('sustentacao', demand({ sustentacao: 0.1 }), cap(0.8), fit)
  assert.equal(v.culpa, 'voce')
})

test('diferença menor que a folga fica em cima do muro, e diz que ficou', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const quase = VERDICT_GAP - 0.05
  const v = judgeSkill('vibrato', demand({ vibrato: 0.5 }), cap(0.5 - quase), fit)
  assert.equal(v.culpa, 'indefinido')
  assert.equal(v.reason, 'proximo')
})

test('sem histórico na skill, o veredito não inventa lado', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('afinacao', demand({ afinacao: 0.9 }), unknownCap, fit)
  assert.equal(v.culpa, 'indefinido')
  assert.equal(v.reason, 'sem-capacidade')
})

test('passaggio e ressonância não têm eixo na música e se declaram assim', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  for (const skill of ['passaggio', 'ressonancia'] as SkillId[]) {
    assert.equal(demandFor(skill, demand()), null)
    const v = judgeSkill(skill, demand(), cap(0.9), fit)
    assert.equal(v.culpa, 'indefinido')
    assert.equal(v.reason, 'sem-eixo')
  }
})

test('todo eixo absoluto tem exigência calculável', () => {
  for (const skill of ABSOLUTE_SKILLS) {
    assert.notEqual(demandFor(skill, demand()), null, skill)
  }
})

test('o veredito respeita a ordem dos achados', () => {
  const fit = { lowMidi: 48, highMidi: 84 }
  const v = judgeRun([finding('respiracao'), finding('afinacao')], demand(), {}, fit)
  assert.deepEqual(
    v.skills.map((s) => s.skill),
    ['respiracao', 'afinacao'],
  )
})

// -------------------------------------------------------------- ponte (§3) --

test('música fora do alcance não gera tarefa — gera transposição', () => {
  const singer: SingerRange = { lowMidi: 48, highMidi: 72 }
  const fs = [finding('afinacao')]
  const v = judgeRun(fs, demand({ loMidi: 65, hiMidi: 75 }), { afinacao: cap(0.8) }, singer)
  assert.equal(nextFromVerdict(v, fs, 'intermediario'), null)
})

test('veredito indefinido não vira exercício', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('passaggio', demand(), cap(0.9), fit)
  assert.equal(nextForVerdict({ verdict: v, finding: finding('passaggio'), level: 'avancado' }), null)
})

test('falhar num eixo que a música mal cobra sugere VOLTAR um degrau', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('sustentacao', demand({ sustentacao: LOW_DEMAND - 0.1 }), cap(0.9), fit)
  assert.equal(v.culpa, 'voce')
  const next = nextForVerdict({ verdict: v, finding: finding('sustentacao'), level: 'avancado' })
  assert.ok(next, 'devia recomendar algo')
  assert.equal(next.stepBack, true)
  assert.match(next.recommendation.reason, /voltar um nível/)
})

test('falhar num eixo que a música cobra de verdade NÃO manda voltar', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('respiracao', demand({ respiracao: 0.9 }), cap(0.3), fit)
  const next = nextForVerdict({ verdict: v, finding: finding('respiracao'), level: 'intermediario' })
  assert.ok(next)
  assert.equal(next.stepBack, false)
  assert.match(next.recommendation.reason, /repertório à frente do preparo/)
})

test('o motivo sempre cita a evidência da corrida, nunca só o nome da skill', () => {
  const fit = rangeFit(demand(), { lowMidi: 48, highMidi: 84 })
  const v = judgeSkill('respiracao', demand({ respiracao: 0.9 }), cap(0.3), fit)
  const f = finding('respiracao')
  const next = nextForVerdict({ verdict: v, finding: f, level: 'iniciante' })
  assert.ok(next)
  assert.ok(next.recommendation.reason.includes(f.evidence))
  assert.ok(next.recommendation.reason.includes(f.condition))
})

test('a corrida devolve UMA tarefa: a do achado mais forte com veredito conclusivo', () => {
  const fit: SingerRange = { lowMidi: 48, highMidi: 84 }
  const fs = [finding('passaggio'), finding('respiracao')]
  const v = judgeRun(fs, demand({ respiracao: 0.9 }), { respiracao: cap(0.2) }, fit)
  const next = nextFromVerdict(v, fs, 'intermediario')
  assert.ok(next, 'o passaggio é indefinido, mas a respiração abaixo dele é conclusiva')
  assert.equal(next.recommendation.tag, 'respiracao')
})

console.log(`\n${passed} ok, ${failed} falharam`)
process.exit(failed > 0 ? 1 : 0)
