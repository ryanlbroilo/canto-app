import { CurriculumUnit, SessionRecord } from './types'
import { getExercise } from './exercises'

// Filas de REVISÃO — a base das duas frentes estilo Duolingo:
//  • revisão de UNIDADE (troféu): repassa os exercícios mais fracos da unidade;
//  • revisão ESPAÇADA: traz de volta o que o aluno aprendeu em dias anteriores,
//    priorizando o mais "esquecido" (staleness) e o menos dominado.
// Tudo determinístico a partir das sessões + melhor pontuação por exercício.

const MASTERY = 90

export type DoneMap = Record<string, { count: number; bestScore: number }>

/**
 * Fila de revisão de uma unidade: até `n` exercícios, os mais fracos primeiro
 * (menor melhor-pontuação), desempatando pelos mais difíceis.
 */
export function unitReviewQueue(unit: CurriculumUnit, done: DoneMap, n = 3): string[] {
  return unit.exerciseIds
    .map((id) => ({ id, ex: getExercise(id), best: done[id]?.bestScore ?? 0 }))
    .filter((x) => x.ex)
    .sort(
      (a, b) =>
        a.best - b.best ||
        (b.ex!.difficulty ?? 3) - (a.ex!.difficulty ?? 3) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, n)
    .map((x) => x.id)
}

export interface DueItem {
  id: string
  /** dias desde a última prática deste exercício */
  daysSince: number
  best: number
  /** urgência da revisão (maior = mais devido) */
  weight: number
}

/**
 * Exercícios "devidos" para revisão espaçada: praticados em algum dia ANTERIOR
 * (daysSince ≥ 1) — o núcleo da repetição espaçada é revisitar depois de um tempo.
 * Peso = staleness (dias) + lacuna de domínio ((90-best)/15). Ordenado do mais
 * devido ao menos. Ignora ids que não existem mais na biblioteca.
 */
export function dueForReview(sessions: SessionRecord[], done: DoneMap, nowMs = Date.now()): DueItem[] {
  const last = new Map<string, number>()
  for (const s of sessions) {
    if (!s.exerciseId || !getExercise(s.exerciseId)) continue
    const t = new Date(s.dateISO).getTime()
    if (!last.has(s.exerciseId) || t > (last.get(s.exerciseId) as number)) last.set(s.exerciseId, t)
  }
  const items: DueItem[] = []
  for (const [id, t] of last) {
    const daysSince = Math.max(0, (nowMs - t) / 86_400_000)
    if (daysSince < 1) continue // praticado hoje ainda não é "revisão"
    const best = done[id]?.bestScore ?? 0
    const weight = daysSince + Math.max(0, MASTERY - best) / 15
    items.push({ id, daysSince, best, weight })
  }
  return items.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
}

/** Os `n` exercícios mais devidos, como fila pronta pro review runner. */
export const spacedReviewQueue = (sessions: SessionRecord[], done: DoneMap, n = 5): string[] =>
  dueForReview(sessions, done).slice(0, n).map((x) => x.id)
