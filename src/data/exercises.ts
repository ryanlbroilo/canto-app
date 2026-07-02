import { Exercise, ExerciseKind, ExercisePhase, SkillId, TrackLevel } from './types'
import { EXERCISE_LIBRARY } from './exercise-library'

// A BIBLIOTECA é a fonte única da verdade: ~300 exercícios gerados e validados.
// pattern = offsets em semitons a partir da tônica (transposta pro range do usuário).
// kind fica restrito a 'breathing'|'siren'|'scale'|'interval'|'sustain' — o player
// só sabe renderizar esses. As trilhas (tracks.ts) e o roteador (adaptive.ts)
// derivam desta lista por skill/kind/nível, sem depender de ids fixos.
export const EXERCISES: Exercise[] = EXERCISE_LIBRARY

export const PHASES: { key: ExercisePhase; label: string; hint: string }[] = [
  { key: 'aquecimento', label: 'Aquecimento', hint: 'Sempre comece por aqui — canto não dói.' },
  { key: 'tecnica', label: 'Técnica', hint: 'Precisão, saltos, estabilidade e passaggio.' },
  { key: 'aplicacao', label: 'Aplicação', hint: 'Levar a técnica para a música.' },
]

export const getExercise = (id: string): Exercise | undefined => EXERCISES.find((e) => e.id === id)

export const exercisesByLevel = (level: TrackLevel): Exercise[] =>
  EXERCISES.filter((e) => e.level === level)

export const exercisesBySkill = (skill: SkillId): Exercise[] =>
  EXERCISES.filter((e) => e.skills.includes(skill))

/** Ordenação estável: dificuldade crescente, depois id (determinística). */
function byDifficulty(a: Exercise, b: Exercise): number {
  return (a.difficulty ?? 3) - (b.difficulty ?? 3) || a.id.localeCompare(b.id)
}

/** Critérios para escolher um exercício representativo (usado pelo roteador). */
export interface PickCriteria {
  kind?: ExerciseKind
  skills?: SkillId[]
  level?: TrackLevel
  phase?: ExercisePhase
}

/**
 * Escolhe o exercício mais adequado aos critérios, por pontuação:
 * nível certo pesa mais, cada skill em comum soma, fase é bônus leve.
 * Determinístico (desempata por dificuldade/id). Substitui os ids fixos que
 * o roteador usava — robusto a mudanças na biblioteca.
 */
export function pickExercise(c: PickCriteria): Exercise | undefined {
  let pool = EXERCISES
  if (c.kind) {
    const filtered = pool.filter((e) => e.kind === c.kind)
    if (filtered.length) pool = filtered
  }
  const score = (e: Exercise): number => {
    let s = 0
    if (c.level && e.level === c.level) s += 4
    if (c.phase && e.phase === c.phase) s += 1
    if (c.skills) s += c.skills.filter((sk) => e.skills.includes(sk)).length * 3
    return s
  }
  return [...pool].sort((a, b) => score(b) - score(a) || byDifficulty(a, b))[0]
}

/** Contagem total (mostrada na UI: "301 exercícios"). */
export const EXERCISE_COUNT = EXERCISES.length
