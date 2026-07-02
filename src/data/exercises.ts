import { Exercise, ExerciseKind, ExercisePhase, SkillId, TrackLevel } from './types'
import { EXERCISE_LIBRARY } from './exercise-library'
import { CURATED_SPINES } from './curated-spines'

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

/**
 * Espinha do "caminho" de um nível (~12 exercícios). Prefere a curadoria
 * pedagógica (CURATED_SPINES, validada contra a biblioteca do nível); se ela
 * estiver vazia/quebrada, cai no heurístico automático abaixo.
 */
export function curatedTrackIds(level: TrackLevel): string[] {
  const inLevel = new Set(EXERCISES.filter((e) => e.level === level).map((e) => e.id))
  const curated = (CURATED_SPINES[level] ?? []).filter((id) => inLevel.has(id))
  if (curated.length >= 8) return curated
  return heuristicTrackIds(level)
}

/**
 * Fallback automático: 2 aquecimentos, até 7 técnicas cobrindo o máximo de
 * skills e 3 aplicações, derivado da biblioteca. Usado quando não há curadoria.
 */
function heuristicTrackIds(level: TrackLevel): string[] {
  const pool = EXERCISES.filter((e) => e.level === level)
  const inPhase = (p: ExercisePhase): Exercise[] => pool.filter((e) => e.phase === p).sort(byDifficulty)

  const warm = inPhase('aquecimento').slice(0, 2)

  // técnica: guloso por cobertura de skills, depois completa por dificuldade
  const tech = inPhase('tecnica')
  const picked: Exercise[] = []
  const covered = new Set<SkillId>()
  for (const ex of tech) {
    if (picked.length >= 7) break
    if (ex.skills.some((s) => !covered.has(s))) {
      picked.push(ex)
      ex.skills.forEach((s) => covered.add(s))
    }
  }
  for (const ex of tech) {
    if (picked.length >= 7) break
    if (!picked.includes(ex)) picked.push(ex)
  }

  const apply = inPhase('aplicacao').slice(0, 3)

  const ids = [...warm, ...picked, ...apply].map((e) => e.id)
  return ids.length ? ids : [...pool].sort(byDifficulty).slice(0, 8).map((e) => e.id)
}

/** Contagem total (mostrada na UI: "301 exercícios"). */
export const EXERCISE_COUNT = EXERCISES.length
