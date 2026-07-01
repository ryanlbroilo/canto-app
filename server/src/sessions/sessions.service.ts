import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Queue } from 'bullmq'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { JOB_PROCESS_SESSION, ProcessSessionJob, SESSIONS_QUEUE } from '../queue/queue.constants'
import { CreateSessionDto } from './dto/create-session.dto'

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SESSIONS_QUEUE) private readonly queue: Queue<ProcessSessionJob>,
  ) {}

  // Sincroniza uma sessão do cliente. Idempotente por (tenant, user, clientId):
  // reenviar o mesmo clientId ATUALIZA em vez de duplicar. Enfileira o processamento.
  async create(user: AuthUser, dto: CreateSessionDto) {
    const data = {
      tenantId: user.tenantId,
      userId: user.userId,
      clientId: dto.clientId ?? null,
      kind: dto.kind,
      exerciseId: dto.exerciseId ?? null,
      label: dto.label,
      durationSec: Math.round(dto.durationSec),
      notesHitPct: dto.notesHitPct,
      avgCentsDev: dto.avgCentsDev,
      featureReport: (dto.featureReport ?? null) as Prisma.InputJsonValue,
      dateISO: new Date(dto.dateISO),
    }

    const session = dto.clientId
      ? await this.prisma.vocalSession.upsert({
          where: {
            tenantId_userId_clientId: {
              tenantId: user.tenantId,
              userId: user.userId,
              clientId: dto.clientId,
            },
          },
          create: data,
          update: {
            label: data.label,
            durationSec: data.durationSec,
            notesHitPct: data.notesHitPct,
            avgCentsDev: data.avgCentsDev,
            featureReport: data.featureReport,
            processedAt: null,
          },
        })
      : await this.prisma.vocalSession.create({ data })

    await this.queue.add(
      JOB_PROCESS_SESSION,
      { sessionId: session.id, tenantId: user.tenantId },
      { jobId: `sess-${session.id}` },
    )

    return session
  }

  // Lista as sessões do usuário DENTRO do tenant (isolamento row-level).
  list(user: AuthUser, limit = 50) {
    return this.prisma.vocalSession.findMany({
      where: { tenantId: user.tenantId, userId: user.userId },
      orderBy: { dateISO: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
    })
  }

  async stats(user: AuthUser) {
    const [count, agg] = await Promise.all([
      this.prisma.vocalSession.count({ where: { tenantId: user.tenantId, userId: user.userId } }),
      this.prisma.vocalSession.aggregate({
        where: { tenantId: user.tenantId, userId: user.userId },
        _sum: { xpEarned: true },
        _avg: { notesHitPct: true },
      }),
    ])
    return { count, totalXp: agg._sum.xpEarned ?? 0, avgHitPct: agg._avg.notesHitPct ?? 0 }
  }
}
