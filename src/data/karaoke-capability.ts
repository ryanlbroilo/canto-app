// PONTE entre o histórico do app e a capacidade que o karaokê compara com a
// exigência da música.
//
// O domínio do karaokê (`domain/karaoke/capability.ts`) não sabe o que é localStorage,
// nem sessão, nem XP — ele recebe um `CapabilityInput` já pronto. Este arquivo é o
// único lugar que conhece as duas linguagens, e existe justamente para que a regra de
// "quanto você aguenta" possa ser testada sem tocar em armazenamento.

import type { CapabilityInput, SkillHistory } from '../domain/karaoke/capability'
import { trackLevelForCompleted } from './adaptive'
import { dominatedExerciseIds } from './gamification'
import { getBaseline, getGamification, getSessions } from './store'
import { SKILLS } from './skills'
import type { SessionRecord, SkillId, SkillProgress, VocalBaseline } from './types'
import { skillXpFromSession } from './xp'

interface BuildArgs {
  sessions: readonly SessionRecord[]
  skills: readonly SkillProgress[]
  exercisesDone: Record<string, { count: number; bestScore: number }>
  baseline: VocalBaseline | null
}

/**
 * Quantas sessões treinaram cada skill.
 *
 * Usa `skillXpFromSession`, que é a MESMA regra pela qual a gamificação decide que
 * uma sessão treinou uma skill. Contar por outro critério aqui faria o karaokê achar
 * que tem histórico onde o resto do app acha que não tem.
 */
function sessionsPerSkill(sessions: readonly SessionRecord[]): Record<SkillId, number> {
  const count = Object.fromEntries(SKILLS.map((s) => [s.id, 0])) as Record<SkillId, number>
  for (const s of sessions) {
    for (const key of Object.keys(skillXpFromSession(s)) as SkillId[]) count[key] += 1
  }
  return count
}

/** Monta o input de capacidade — puro, sem tocar em armazenamento. */
export function buildCapabilityInput(args: BuildArgs): CapabilityInput {
  const { sessions, skills, exercisesDone, baseline } = args

  // O nível é o da trilha (dificuldade), não o de XP (volume) — ver TRACK_DIFFICULTY.
  const level = trackLevelForCompleted(dominatedExerciseIds(exercisesDone).size)
  const counts = sessionsPerSkill(sessions)

  const history: Partial<Record<SkillId, SkillHistory>> = {}
  for (const p of skills) {
    history[p.id] = {
      // last5Avg vem em 0..100; a capacidade trabalha em 0..1
      accuracy: p.last5Avg / 100,
      level,
      sessions: counts[p.id] ?? 0,
    }
  }

  // Extensão só conta se ela foi MEDIDA. `includesFalsetto` não desqualifica: o
  // falsete é alcance de verdade, e o veredito precisa saber que ele existe antes
  // de acusar você de não alcançar o agudo da música.
  const range = baseline ? { lowMidi: baseline.lowMidi, highMidi: baseline.highMidi } : null

  return { range, history }
}

/** O mesmo, lendo o estado real do app. */
export function capabilityInputFromStore(): CapabilityInput {
  const g = getGamification()
  return buildCapabilityInput({
    sessions: getSessions(),
    skills: g.skills,
    exercisesDone: g.exercisesDone,
    baseline: getBaseline(),
  })
}
