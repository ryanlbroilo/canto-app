import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../prisma/prisma.service'
import { JOB_PROCESS_SESSION, ProcessSessionJob, SESSIONS_QUEUE } from './queue.constants'

// Worker da fila operacional: processa cada sessão sincronizada — calcula o XP,
// marca processedAt e registra a execução (JobRun) para observabilidade.
@Processor(SESSIONS_QUEUE)
export class SessionProcessor extends WorkerHost {
  private readonly logger = new Logger(SessionProcessor.name)

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async process(job: Job<ProcessSessionJob>): Promise<{ xpEarned: number }> {
    if (job.name !== JOB_PROCESS_SESSION) {
      throw new Error(`Job desconhecido: ${job.name}`)
    }
    const { sessionId, tenantId } = job.data
    const session = await this.prisma.vocalSession.findFirst({ where: { id: sessionId, tenantId } })
    if (!session) throw new Error(`Sessão ${sessionId} não encontrada no tenant ${tenantId}`)

    const xpEarned = computeXp(session.notesHitPct, session.avgCentsDev, session.durationSec)

    await this.prisma.vocalSession.update({
      where: { id: session.id },
      data: { processedAt: new Date(), xpEarned },
    })
    await this.prisma.jobRun.create({
      data: {
        tenantId,
        queue: SESSIONS_QUEUE,
        name: job.name,
        status: 'completed',
        attempts: job.attemptsMade + 1,
        data: job.data as object,
        result: { xpEarned },
      },
    })

    this.logger.log(`sessão ${sessionId} processada · +${xpEarned} XP`)
    return { xpEarned }
  }
}

// XP determinístico (espelha a lógica do cliente, simplificado no servidor).
function computeXp(notesHitPct: number, avgCentsDev: number, durationSec: number): number {
  const base = 20
  const acerto = 0.5 + Math.min(100, Math.max(0, notesHitPct)) / 100 // 0.5..1.5
  const bonusDur = Math.min(10, Math.floor(durationSec / 60))
  const bonusPrec = avgCentsDev <= 10 ? 8 : avgCentsDev >= 50 ? 0 : Math.round(8 * (1 - (avgCentsDev - 10) / 40))
  return Math.max(1, Math.round(base * acerto) + bonusDur + bonusPrec)
}
