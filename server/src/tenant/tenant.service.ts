import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

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
