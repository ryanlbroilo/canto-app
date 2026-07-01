import { SessionRecord, SkillId } from './types'
import { getExercise } from './exercises'

// Camada de XP — 100% determinística (sem Math.random). Todo XP é recomputável
// a partir das sessões, para que o estado de gamificação seja puro.

const PRACTICE_BASE_XP = 20 // prática livre não tem exercício → base fixa

/**
 * XP de uma sessão. Combina:
 *   base        = xp do exercício (ou 20 p/ prática livre)
 *   fatorAcerto = 0.5..1.5, linear na notesHitPct (0% → 0.5, 100% → 1.5)
 *   bonusDur    = +1 XP por minuto praticado, limitado a +10
 *   bonusPrec   = até +8 XP quando o desvio médio é baixo (≤10 cents → +8, ≥50 → 0)
 *   bonusLimpo  = +6 XP se o featureReport não teve nenhuma quebra de registro
 *
 * total = round(base * fatorAcerto) + bonusDur + bonusPrec + bonusLimpo
 * Piso de 1 XP para qualquer sessão registrada.
 */
export function xpForSession(rec: SessionRecord): number {
  const ex = rec.exerciseId ? getExercise(rec.exerciseId) : undefined
  const base = ex?.xp ?? PRACTICE_BASE_XP

  const hit = clamp(rec.notesHitPct, 0, 100)
  const fatorAcerto = 0.5 + hit / 100 // 0 → 0.5, 100 → 1.5

  const minutes = rec.durationSec / 60
  const bonusDur = Math.min(10, Math.floor(minutes))

  const dev = Math.max(0, rec.avgCentsDev)
  // 10 cents ou menos = +8; cresce/decresce linear até 50 cents = 0.
  const precFrac = clamp((50 - dev) / 40, 0, 1)
  const bonusPrec = Math.round(precFrac * 8)

  const breaks = countRegisterBreaks(rec)
  const bonusLimpo = rec.featureReport && breaks === 0 ? 6 : 0

  const total = Math.round(base * fatorAcerto) + bonusDur + bonusPrec + bonusLimpo
  return Math.max(1, total)
}

/**
 * Curva de nível cumulativa. Subir DO nível L custa 100*L de XP.
 * Nível 1 começa em 0 XP; nível 2 em 100; nível 3 em 300; nível 4 em 600...
 * (soma triangular: para chegar ao nível N, 100 * N*(N-1)/2 de XP acumulado).
 */
export function levelForXp(totalXp: number): {
  level: number
  xpIntoLevel: number
  xpForNext: number
} {
  const xp = Math.max(0, Math.floor(totalXp))
  let level = 1
  let floor = 0 // XP acumulado no início do nível atual
  // custo para sair do nível `level` = 100 * level
  while (xp >= floor + 100 * level) {
    floor += 100 * level
    level++
  }
  const xpForNext = 100 * level
  const xpIntoLevel = xp - floor
  return { level, xpIntoLevel, xpForNext }
}

/**
 * Distribui o XP total da sessão entre as skills que o exercício desenvolve,
 * ponderado por desempenho (o mesmo fatorAcerto do XP). Prática livre (sem
 * exercício) distribui entre afinação + sustentação, que são o que uma prática
 * genérica mais exercita.
 */
export function skillXpFromSession(rec: SessionRecord): Partial<Record<SkillId, number>> {
  const total = xpForSession(rec)
  const ex = rec.exerciseId ? getExercise(rec.exerciseId) : undefined
  const skills: SkillId[] = ex?.skills?.length ? ex.skills : ['afinacao', 'sustentacao']

  const share = total / skills.length
  const out: Partial<Record<SkillId, number>> = {}
  for (const s of skills) {
    out[s] = (out[s] ?? 0) + Math.round(share)
  }
  return out
}

// ---- helpers ----
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function countRegisterBreaks(rec: SessionRecord): number {
  const events = rec.featureReport?.performance.events ?? []
  return events.filter((e) => e.type === 'register_break').length
}
