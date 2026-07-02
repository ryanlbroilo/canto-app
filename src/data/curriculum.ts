import { CurriculumUnit, TrackLevel } from './types'
import { CURRICULUM_UNITS } from './curriculum-data'
import { exercisesByLevel } from './exercises'

// O CURRÍCULO = o "path" longo estilo Duolingo. Cada nível é uma sequência de
// unidades temáticas; o caminho inteiro cobre os ~300 exercícios. A biblioteca
// (Exercises.tsx → catálogo) é o "practice hub" para pular pra qualquer um.
export const CURRICULUM: CurriculumUnit[] = CURRICULUM_UNITS

export const unitsForLevel = (level: TrackLevel): CurriculumUnit[] =>
  CURRICULUM.filter((u) => u.level === level).sort((a, b) => a.index - b.index)

export const getUnit = (id: string): CurriculumUnit | undefined => CURRICULUM.find((u) => u.id === id)

/**
 * Caminho plano (ordenado) de um nível: os ids de todas as unidades em ordem.
 * Usado pelo roteador adaptativo (nextInTrack). Fallback: se não houver unidades
 * para o nível, usa a biblioteca do nível ordenada por dificuldade.
 */
export function levelExerciseIds(level: TrackLevel): string[] {
  const units = unitsForLevel(level)
  if (units.length) return units.flatMap((u) => u.exerciseIds)
  return exercisesByLevel(level)
    .slice()
    .sort((a, b) => (a.difficulty ?? 3) - (b.difficulty ?? 3) || a.id.localeCompare(b.id))
    .map((e) => e.id)
}

/** Unidade a que um exercício pertence (para "de volta à unidade" na UI). */
export function unitForExercise(exerciseId: string): CurriculumUnit | undefined {
  return CURRICULUM.find((u) => u.exerciseIds.includes(exerciseId))
}
