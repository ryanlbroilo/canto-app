import { Achievement, SessionRecord, SkillProgress, Streak, VocalBaseline } from './types'

// Contexto que cada conquista avalia. Tudo derivado do store (puro).
export interface AchievementCtx {
  sessions: SessionRecord[]
  streak: Streak
  skills: SkillProgress[]
  baseline: VocalBaseline | null
  rangeHistory: VocalBaseline[]
  totalXp: number
  level: number
}

interface AchievementDef extends Achievement {
  /** true quando o contexto atual satisfaz a conquista */
  unlockWhen(ctx: AchievementCtx): boolean
}

// ---- helpers de avaliação ----
function countRegisterBreaks(rec: SessionRecord): number {
  return (rec.featureReport?.performance.events ?? []).filter((e) => e.type === 'register_break')
    .length
}
function totalSecondsInADay(sessions: SessionRecord[]): number {
  const byDay = new Map<string, number>()
  for (const s of sessions) {
    const day = s.dateISO.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + s.durationSec)
  }
  let max = 0
  for (const v of byDay.values()) max = Math.max(max, v)
  return max
}
/** Ganho de semitons (highMidi - lowMidi) entre a 1ª e a última medição de range. */
function rangeGainSemitones(hist: VocalBaseline[]): number {
  if (hist.length < 2) return 0
  const first = hist[0]
  const last = hist[hist.length - 1]
  const spanFirst = first.highMidi - first.lowMidi
  const spanLast = last.highMidi - last.lowMidi
  return spanLast - spanFirst
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primeira-nota-afinada',
    icon: 'target',
    label: 'Primeira nota afinada',
    desc: 'Você segurou uma nota afinada — a base de tudo.',
    category: 'afinacao',
    // Evento do onboarding (não derivada de sessão): desbloqueada imperativamente por
    // unlockAchievement('primeira-nota-afinada') quando o motor trava a nota afinada.
    unlockWhen: () => false,
  },
  {
    id: 'primeira-sessao',
    icon: 'star',
    label: 'Primeira nota',
    desc: 'Você registrou sua primeira sessão de treino.',
    category: 'marco',
    unlockWhen: (c) => c.sessions.length >= 1,
  },
  {
    id: 'streak-3',
    icon: 'flame',
    label: 'Três dias seguidos',
    desc: 'Ofensiva de 3 dias — o hábito está nascendo.',
    category: 'consistencia',
    unlockWhen: (c) => c.streak.longest >= 3,
  },
  {
    id: 'streak-7',
    icon: 'flame',
    label: 'Uma semana firme',
    desc: 'Ofensiva de 7 dias seguidos treinando.',
    category: 'consistencia',
    unlockWhen: (c) => c.streak.longest >= 7,
  },
  {
    id: 'streak-30',
    icon: 'crown',
    label: 'Um mês inteiro',
    desc: 'Ofensiva de 30 dias. Isso é disciplina de cantor.',
    category: 'consistencia',
    unlockWhen: (c) => c.streak.longest >= 30,
  },
  {
    id: 'sessao-perfeita',
    icon: 'target',
    label: 'Na mosca',
    desc: 'Uma sessão com 100% das notas dentro da zona.',
    category: 'afinacao',
    unlockWhen: (c) => c.sessions.some((s) => s.notesHitPct >= 100),
  },
  {
    id: 'vibrato-detectado',
    icon: 'wave',
    label: 'Vibrato à vista',
    desc: 'A estimativa detectou vibrato numa sustentação sua.',
    category: 'vibrato',
    unlockWhen: (c) => c.sessions.some((s) => s.featureReport?.performance.vibrato.present === true),
  },
  {
    id: 'vibrato-saudavel',
    icon: 'wave',
    label: 'Vibrato saudável',
    desc: 'Vibrato estimado entre 5 e 7 Hz — a faixa considerada natural.',
    category: 'vibrato',
    unlockWhen: (c) =>
      c.sessions.some((s) => {
        const v = s.featureReport?.performance.vibrato
        return !!v && v.present && v.rateHz >= 5 && v.rateHz <= 7
      }),
  },
  {
    id: 'sessao-limpa',
    icon: 'bridge',
    label: 'Sem quebras',
    desc: 'Uma sessão inteira sem nenhuma quebra de registro detectada.',
    category: 'registro',
    unlockWhen: (c) =>
      c.sessions.some((s) => !!s.featureReport && countRegisterBreaks(s) === 0),
  },
  {
    id: 'range-semitom',
    icon: 'gauge',
    label: '+1 semitom',
    desc: 'Sua extensão medida cresceu pelo menos um semitom.',
    category: 'extensao',
    unlockWhen: (c) => rangeGainSemitones(c.rangeHistory) >= 1,
  },
  {
    id: 'range-oitava',
    icon: 'gauge',
    label: '+1 oitava',
    desc: 'Sua extensão medida cresceu uma oitava inteira. Enorme.',
    category: 'extensao',
    unlockWhen: (c) => rangeGainSemitones(c.rangeHistory) >= 12,
  },
  {
    id: 'dez-sessoes',
    icon: 'medal',
    label: 'Dez treinos',
    desc: 'Você já completou 10 sessões de treino.',
    category: 'marco',
    unlockWhen: (c) => c.sessions.length >= 10,
  },
  {
    id: 'nivel-5',
    icon: 'bolt',
    label: 'Nível 5',
    desc: 'Você alcançou o nível 5 acumulando XP.',
    category: 'marco',
    unlockWhen: (c) => c.level >= 5,
  },
  {
    id: 'todas-skills',
    icon: 'route',
    label: 'Sete competências',
    desc: 'Você tocou em todas as 7 skills vocais pelo menos uma vez.',
    category: 'marco',
    unlockWhen: (c) => c.skills.filter((s) => s.xp > 0).length >= 7,
  },
  {
    id: 'trinta-min-dia',
    icon: 'flame',
    label: 'Meia hora num dia',
    desc: 'Você somou 30 minutos de treino em um único dia.',
    category: 'consistencia',
    unlockWhen: (c) => totalSecondsInADay(c.sessions) >= 30 * 60,
  },
  {
    id: 'exercicio-dominado',
    icon: 'trophy',
    label: 'Exercício dominado',
    desc: 'Você tirou 90 ou mais num exercício. Dominado.',
    category: 'afinacao',
    unlockWhen: (c) =>
      c.sessions.some((s) => s.kind === 'exercise' && s.notesHitPct >= 90),
  },
]

/** Retorna os ids de todas as conquistas atualmente elegíveis pelo contexto. */
export function evaluateAchievements(ctx: AchievementCtx): string[] {
  return ACHIEVEMENTS.filter((a) => a.unlockWhen(ctx)).map((a) => a.id)
}
