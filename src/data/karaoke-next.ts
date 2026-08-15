// PONTE do veredito do karaokê para a biblioteca de exercícios.
//
// O domínio do karaokê não conhece exercício nenhum, de propósito: ele responde "qual
// fundamento falhou e de quem é a conta". Traduzir isso em "faça este exercício" é
// trabalho daqui, onde a biblioteca e o nível da trilha existem.
//
// Não passa por `recommendNext`: aquele é o roteador do treino GERAL, uma cascata de
// prioridades pedagógicas que decide sozinha o que importa hoje. Aqui a skill já foi
// decidida pela música — o que falta é escolher o exercício, e o motivo tem que citar
// a evidência da corrida, não uma frase genérica.

import type { Finding } from '../domain/karaoke/attribute'
import type { SkillVerdict, Verdict } from '../domain/karaoke/verdict'
import { trackLevelForCompleted } from './adaptive'
import { pickExercise } from './exercises'
import { dominatedExerciseIds } from './gamification'
import { getGamification } from './store'
import { SKILLS } from './skills'
import type { AdaptiveRecommendation, SkillId, TrackLevel } from './types'

/**
 * Abaixo disto a música quase não cobra o eixo. Falhar num eixo que a música mal
 * cobra é o sinal que justifica VOLTAR um degrau em vez de insistir — é a pergunta
 * que o Ryan fez no começo, e a única condição em que responder "volte" é honesto.
 */
export const LOW_DEMAND = 0.35

const ORDER: readonly TrackLevel[] = ['iniciante', 'intermediario', 'avancado']

function stepDown(level: TrackLevel): TrackLevel {
  const i = ORDER.indexOf(level)
  return ORDER[Math.max(0, i - 1)]
}

function skillName(id: SkillId): string {
  return SKILLS.find((s) => s.id === id)?.name ?? id
}

export interface KaraokeNext {
  recommendation: AdaptiveRecommendation
  /** true quando a sugestão é descer um degrau na trilha */
  stepBack: boolean
}

interface NextArgs {
  verdict: SkillVerdict
  finding: Finding
  level: TrackLevel
}

/**
 * Exercício para um fundamento que falhou. `null` quando o veredito não sustenta
 * recomendação nenhuma — indefinido é indefinido, e mandar treinar mesmo assim
 * transformaria "não sei" em tarefa.
 */
export function nextForVerdict(args: NextArgs): KaraokeNext | null {
  const { verdict, finding, level } = args
  if (verdict.culpa === 'indefinido') return null

  const stepBack =
    verdict.culpa === 'voce' && verdict.demand !== null && verdict.demand < LOW_DEMAND

  const target = stepBack ? stepDown(level) : level
  const ex = pickExercise({ skills: [verdict.skill], level: target })
  if (!ex) return null

  const nome = skillName(verdict.skill)
  const reason = stepBack
    ? `${finding.condition}: ${finding.evidence}. A música quase não cobra ${nome.toLowerCase()}, então o degrau é seu — vale voltar um nível e firmar a base.`
    : verdict.culpa === 'musica'
      ? `${finding.condition}: ${finding.evidence}. Esta música cobra mais ${nome.toLowerCase()} do que você treinou até agora — não é falta de talento, é repertório à frente do preparo.`
      : `${finding.condition}: ${finding.evidence}. Você já sustenta esse nível de exigência em outros contextos, então aqui é execução: dá para atacar direto.`

  return {
    recommendation: { exerciseId: ex.id, reason, tag: verdict.skill },
    stepBack,
  }
}

/**
 * A recomendação da corrida: o achado mais forte que tem veredito conclusivo.
 *
 * Um por vez, e não uma lista. Sair de uma música com cinco tarefas é sair sem
 * nenhuma — e a atribuição já entregou os achados em ordem de força, então o
 * primeiro que sobrevive ao veredito é justamente o que mais explica a corrida.
 */
export function nextFromVerdict(
  verdict: Verdict,
  findings: readonly Finding[],
  level: TrackLevel = currentTrackLevel(),
): KaraokeNext | null {
  // Música fora do alcance: a ação é transpor, não treinar. Recomendar exercício
  // aqui seria dar tarefa para um problema que uma tecla resolve.
  if (verdict.fit.status === 'nao-cabe') return null

  for (const v of verdict.skills) {
    const f = findings.find((x) => x.skill === v.skill)
    if (!f) continue
    const next = nextForVerdict({ verdict: v, finding: f, level })
    if (next) return next
  }
  return null
}

/** Nível da trilha em que o cantor está hoje, lido do estado real do app. */
export function currentTrackLevel(): TrackLevel {
  return trackLevelForCompleted(dominatedExerciseIds(getGamification().exercisesDone).size)
}
