import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../prisma/prisma.service'
import { JOB_PROCESS_SESSION, ProcessSessionJob, SESSIONS_QUEUE } from './queue.constants'

// Worker da fila operacional: processa cada sessão sincronizada — registra o XP,
// marca processedAt e grava a execução (JobRun) para observabilidade.
//
// FONTE ÚNICA DE XP: o cliente calcula o XP determinístico (src/data/xp.ts, com o
// XP-base real do exercício + bônus de registro limpo) e o envia no sync. O servidor
// PRESERVA esse valor (session.xpEarned) — é o mesmo número que o dashboard do
// usuário exibe, então o leaderboard nunca diverge. O computeXp abaixo é apenas um
// FALLBACK para sessões antigas sem xpEarned do cliente.
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

    // Preserva o XP determinístico do cliente (fonte única); só recalcula se ausente.
    const xpEarned =
      session.xpEarned ??
      computeXp(session.notesHitPct, session.avgCentsDev, session.durationSec, session.featureReport)

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

// FALLBACK de XP (só p/ sessões sem xpEarned do cliente). Espelha a fórmula do
// cliente (src/data/xp.ts) — MENOS o XP-base por exercício, que vive na biblioteca
// do front, então aqui usa base fixa 20. Inclui o bônus de registro limpo (+6),
// lido do featureReport que o servidor já persiste.
function computeXp(
  notesHitPct: number,
  avgCentsDev: number,
  durationSec: number,
  featureReport?: unknown,
): number {
  const base = 20
  const acerto = 0.5 + Math.min(100, Math.max(0, notesHitPct)) / 100 // 0.5..1.5
  const bonusDur = Math.min(10, Math.floor(durationSec / 60))
  const dev = Math.max(0, avgCentsDev)
  const bonusPrec = Math.round(Math.min(1, Math.max(0, (50 - dev) / 40)) * 8)
  const breaks = countRegisterBreaks(featureReport)
  const bonusLimpo = featureReport && breaks === 0 ? 6 : 0
  return Math.max(1, Math.round(base * acerto) + bonusDur + bonusPrec + bonusLimpo)
}

function countRegisterBreaks(featureReport: unknown): number {
  const events = (featureReport as { performance?: { events?: Array<{ type?: string }> } } | null)
    ?.performance?.events
  if (!Array.isArray(events)) return 0
  return events.filter((e) => e?.type === 'register_break').length
}
