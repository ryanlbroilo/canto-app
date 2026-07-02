import { Injectable } from '@nestjs/common'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

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
