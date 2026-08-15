import {
  GamificationState,
  SessionRecord,
  SkillId,
  SkillProgress,
  Streak,
  VocalBaseline,
} from './types'
import { SKILLS } from './skills'
import { getExercise } from './exercises'
import { levelForXp, skillXpFromSession, xpForSession } from './xp'
import { recommendNext } from './adaptive'
import { evaluateAchievements } from './achievements'

interface ComputeArgs {
  sessions: SessionRecord[]
  streak: Streak
  baseline: VocalBaseline | null
  rangeHistory: VocalBaseline[]
}

/**
 * Estado de gamificação — puro e recomputável apenas das sessões.
 * Soma o XP de todas as sessões, deriva nível, acumula XP por skill,
 * monta o histórico por exercício, chama o roteador adaptativo e avalia
 * as conquistas elegíveis. NÃO grava nada (isso é papel do store).
 */
export function computeGamification(args: ComputeArgs): GamificationState {
  const { sessions, streak, baseline, rangeHistory } = args

  // --- XP total e nível global ---
  let totalXp = 0
  const skillXp: Record<SkillId, number> = emptySkillMap()
  // desempenho por skill: guarda notesHitPct das sessões que a treinaram (ordenado)
  const skillHits: Record<SkillId, number[]> = {
    afinacao: [],
    respiracao: [],
    passaggio: [],
    vibrato: [],
    sustentacao: [],
    ressonancia: [],
    extensao: [],
  }
  const exercisesDone: Record<string, { count: number; bestScore: number }> = {}

  // sessões em ordem cronológica (para trend e last5)
  const ordered = [...sessions].sort((a, b) => a.dateISO.localeCompare(b.dateISO))

  for (const s of ordered) {
    totalXp += xpForSession(s)

    const dist = skillXpFromSession(s)
    for (const key of Object.keys(dist) as SkillId[]) {
      skillXp[key] += dist[key] ?? 0
      skillHits[key].push(s.notesHitPct)
    }

    if (s.exerciseId) {
      const cur = exercisesDone[s.exerciseId] ?? { count: 0, bestScore: 0 }
      cur.count += 1
      cur.bestScore = Math.max(cur.bestScore, s.notesHitPct)
      exercisesDone[s.exerciseId] = cur
    }
  }

  const { level, xpIntoLevel, xpForNext } = levelForXp(totalXp)

  // --- Progresso por skill ---
  const skills: SkillProgress[] = SKILLS.map((sk) => {
    const hits = skillHits[sk.id]
    const last5 = hits.slice(-5)
    const last5Avg = last5.length ? avg(last5) : 0
    const trend = computeTrend(hits)
    return {
      id: sk.id,
      xp: skillXp[sk.id],
      level: levelForXp(skillXp[sk.id]).level,
      last5Avg: +last5Avg.toFixed(1),
      trend,
    }
  })

  // --- Roteador adaptativo (último relatório disponível) ---
  const completedIds = dominatedExerciseIds(exercisesDone)
  const lastReport = [...ordered].reverse().find((s) => s.featureReport)?.featureReport
  const recommendation = recommendNext({
    lastReport,
    sessions: ordered,
    skills,
    baseline,
    completedIds,
    exercisesDone,
  })

  // --- Conquistas elegíveis ---
  const achievements = evaluateAchievements({
    sessions: ordered,
    streak,
    skills,
    baseline,
    rangeHistory,
    totalXp,
    level,
  })

  return {
    totalXp,
    level,
    xpIntoLevel,
    xpForNext,
    skills,
    achievements,
    recommendation,
    exercisesDone,
  }
}

// ---- helpers ----
function emptySkillMap(): Record<SkillId, number> {
  return {
    afinacao: 0,
    respiracao: 0,
    passaggio: 0,
    vibrato: 0,
    sustentacao: 0,
    ressonancia: 0,
    extensao: 0,
  }
}

function avg(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/**
 * Trend simples: média das últimas 3 sessões da skill menos a média das 3
 * anteriores. Positivo = melhorando, negativo = caindo, 0 = estável/sem dados.
 */
function computeTrend(hits: number[]): number {
  if (hits.length < 2) return 0
  const recent = hits.slice(-3)
  const prior = hits.slice(-6, -3)
  if (!prior.length) return 0
  return +(avg(recent) - avg(prior)).toFixed(1)
}

/** Um exercício é "dominado" quando a melhor pontuação chega a 90. */
export function dominatedExerciseIds(
  done: Record<string, { count: number; bestScore: number }>,
): Set<string> {
  const set = new Set<string>()
  for (const [id, v] of Object.entries(done)) {
    if (v.bestScore >= 90 && getExercise(id)) set.add(id)
  }
  return set
}
