import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'

const DAY = 86_400_000
const dayKey = (d: Date): string => d.toISOString().slice(0, 10) // UTC, igual ao front

/** Início (00:00 UTC) da semana ISO atual (segunda-feira). */
function startOfIsoWeekUTC(nowMs: number): Date {
  const d = new Date(nowMs)
  const mondayOffset = (d.getUTCDay() + 6) % 7 // Dom=6, Seg=0…
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - mondayOffset))
}

/** Ofensiva atual a partir de um conjunto de dias (YYYY-MM-DD UTC), terminando hoje/ontem. */
function currentStreakFromDays(days: Set<string>, nowMs: number): number {
  const shift = (day: string, delta: number): string => {
    const d = new Date(day + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + delta)
    return d.toISOString().slice(0, 10)
  }
  const today = dayKey(new Date(nowMs))
  let cursor: string | null = days.has(today) ? today : days.has(shift(today, -1)) ? shift(today, -1) : null
  let n = 0
  while (cursor && days.has(cursor)) {
    n++
    cursor = shift(cursor, -1)
  }
  return n
}

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  // Ranking do ministério: XP da semana (liga), XP total, ofensiva e naipe por
  // membro. Tenant-scoped; qualquer membro lê o próprio time. Reusa xpEarned
  // (calculado pelo worker) — mesma fonte do totalXp do painel.
  async leaderboard(user: AuthUser) {
    const now = Date.now()
    const weekStart = startOfIsoWeekUTC(now)
    // Janela ampla p/ a ofensiva não ser truncada (>1 ano). Bounded pra não puxar
    // toda a história; ofensivas acima disso são irreais no horizonte atual.
    const streakSince = new Date(now - 400 * DAY)

    const [users, weekAgg, allAgg, dates] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true, name: true, email: true, role: true, ministryMember: { select: { voicePart: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vocalSession.groupBy({
        by: ['userId'],
        where: { tenantId: user.tenantId, dateISO: { gte: weekStart } },
        _sum: { xpEarned: true },
        _count: { _all: true },
      }),
      this.prisma.vocalSession.groupBy({
        by: ['userId'],
        where: { tenantId: user.tenantId },
        _sum: { xpEarned: true },
        _max: { dateISO: true },
      }),
      this.prisma.vocalSession.findMany({
        where: { tenantId: user.tenantId, dateISO: { gte: streakSince } },
        select: { userId: true, dateISO: true },
      }),
    ])

    const week = new Map(weekAgg.map((a) => [a.userId, a]))
    const all = new Map(allAgg.map((a) => [a.userId, a]))
    const daysByUser = new Map<string, Set<string>>()
    for (const s of dates) {
      let set = daysByUser.get(s.userId)
      if (!set) {
        set = new Set()
        daysByUser.set(s.userId, set)
      }
      set.add(dayKey(s.dateISO))
    }

    const rows = users.map((u) => {
      const w = week.get(u.id)
      const a = all.get(u.id)
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        voicePart: u.ministryMember?.voicePart ?? 'UNASSIGNED',
        weeklyXp: w?._sum.xpEarned ?? 0,
        weeklySessions: w?._count._all ?? 0,
        totalXp: a?._sum.xpEarned ?? 0,
        lastSessionAt: a?._max.dateISO ?? null,
        currentStreak: currentStreakFromDays(daysByUser.get(u.id) ?? new Set(), now),
      }
    })
    rows.sort(
      (x, y) => y.weeklyXp - x.weeklyXp || y.totalXp - x.totalXp || (x.name ?? x.email).localeCompare(y.name ?? y.email),
    )
    return rows
  }

  // Detalhe de UM membro (pro líder acompanhar): perfil + baseline + sessões cruas.
  // O front computa a gamificação (skills, nível, recomendação) a partir das sessões.
  async memberDetail(user: AuthUser, memberId: string) {
    const member = await this.prisma.user.findFirst({
      where: { id: memberId, tenantId: user.tenantId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, state: { select: { baseline: true } } },
    })
    if (!member) throw new NotFoundException('Membro não encontrado neste time.')

    const rows = await this.prisma.vocalSession.findMany({
      where: { tenantId: user.tenantId, userId: memberId },
      orderBy: { dateISO: 'desc' },
      take: 200,
    })
    const sessions = rows.map((r) => ({
      id: r.clientId || r.id,
      dateISO: r.dateISO.toISOString(),
      kind: r.kind,
      exerciseId: r.exerciseId ?? undefined,
      label: r.label,
      durationSec: r.durationSec,
      notesHitPct: r.notesHitPct,
      avgCentsDev: r.avgCentsDev,
      featureReport: r.featureReport ?? undefined,
      xpEarned: r.xpEarned ?? undefined,
    }))
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      baseline: member.state?.baseline ?? null,
      sessions,
    }
  }

  // Membros do tenant + progresso (pro painel do líder).
  async members(user: AuthUser) {
    const [users, agg] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vocalSession.groupBy({
        by: ['userId'],
        where: { tenantId: user.tenantId },
        _count: { _all: true },
        _sum: { xpEarned: true },
        _max: { dateISO: true },
      }),
    ])
    const byId = new Map(agg.map((a) => [a.userId, a]))
    return users.map((u) => {
      const a = byId.get(u.id)
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        sessionCount: a?._count._all ?? 0,
        totalXp: a?._sum.xpEarned ?? 0,
        lastSessionAt: a?._max.dateISO ?? null,
      }
    })
  }
}
