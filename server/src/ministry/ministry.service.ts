import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { PutPlanDto } from './dto/put-plan.dto'
import { SetVoicePartDto } from './dto/set-voice-part.dto'

const DAY = 86_400_000
const HARMONY_PREFIX = 'harmony:'
const HARMONY_RECENT_DAYS = 7

export interface PlanItem {
  kind: 'warmup' | 'harmony'
  ref: string
  label: string
}

@Injectable()
export class MinistryService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Plano de ensaio (1 por tenant) ----
  // O front trabalha com uma lista PLANA; guardamos em duas colunas Json.
  async getPlan(user: AuthUser) {
    const plan = await this.prisma.ministryPlan.findUnique({ where: { tenantId: user.tenantId } })
    if (!plan) return { title: 'Ensaio do ministério', notes: null, items: [] as PlanItem[], updatedAt: null }
    return {
      title: plan.title,
      notes: plan.notes,
      items: this.toItems(plan.warmup, plan.harmonySet),
      updatedAt: plan.updatedAt,
    }
  }

  async putPlan(user: AuthUser, dto: PutPlanDto) {
    const items = dto.items ?? []
    const warmup = items.filter((i) => i.kind === 'warmup').map((i) => i.ref)
    const harmonySet = items.filter((i) => i.kind === 'harmony').map((i) => ({ ref: i.ref, label: i.label }))
    await this.prisma.ministryPlan.upsert({
      where: { tenantId: user.tenantId },
      create: {
        tenantId: user.tenantId,
        title: dto.title ?? 'Ensaio do ministério',
        notes: dto.notes ?? null,
        warmup: warmup as Prisma.InputJsonValue,
        harmonySet: harmonySet as unknown as Prisma.InputJsonValue,
        updatedById: user.userId,
      },
      update: {
        title: dto.title ?? undefined,
        // preserva notes quando omitido (undefined = Prisma não toca a coluna),
        // igual ao title — só sobrescreve se o cliente mandar de fato.
        notes: dto.notes === undefined ? undefined : dto.notes,
        warmup: warmup as Prisma.InputJsonValue,
        harmonySet: harmonySet as unknown as Prisma.InputJsonValue,
        updatedById: user.userId,
      },
    })
    return this.getPlan(user)
  }

  // Junta as duas colunas Json numa lista plana de itens (aquecimento primeiro).
  private toItems(warmup: unknown, harmonySet: unknown): PlanItem[] {
    const out: PlanItem[] = []
    const w = Array.isArray(warmup) ? (warmup as string[]) : []
    for (const ref of w) if (typeof ref === 'string') out.push({ kind: 'warmup', ref, label: ref })
    const h = Array.isArray(harmonySet) ? (harmonySet as { ref: string; label: string }[]) : []
    for (const item of h) if (item && typeof item.ref === 'string') out.push({ kind: 'harmony', ref: item.ref, label: item.label ?? item.ref })
    return out
  }

  // ---- Naipes (voz de cada membro) ----
  async members(user: AuthUser) {
    const users = await this.prisma.user.findMany({
      where: { tenantId: user.tenantId },
      select: { id: true, name: true, email: true, role: true, ministryMember: { select: { voicePart: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      voicePart: u.ministryMember?.voicePart ?? 'UNASSIGNED',
    }))
  }

  async setVoicePart(user: AuthUser, memberId: string, dto: SetVoicePartDto) {
    // garante que o membro pertence ao mesmo tenant
    const member = await this.prisma.user.findFirst({ where: { id: memberId, tenantId: user.tenantId }, select: { id: true } })
    if (!member) throw new NotFoundException('Membro não encontrado neste ministério.')
    await this.prisma.ministryMember.upsert({
      where: { userId: memberId },
      create: { userId: memberId, tenantId: user.tenantId, voicePart: dto.voicePart },
      update: { voicePart: dto.voicePart },
    })
    return { ok: true, voicePart: dto.voicePart }
  }

  // ---- Prontidão para o culto ----
  // Heurística v1 a partir das sessões que já sincronizam: aqueceu hoje? praticou
  // a harmonia nos últimos dias? Reusa o groupBy do painel de time.
  async readiness(user: AuthUser) {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const since = new Date(Date.now() - HARMONY_RECENT_DAYS * DAY)

    const [users, lastAgg, recent] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true, name: true, email: true, role: true, ministryMember: { select: { voicePart: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vocalSession.groupBy({ by: ['userId'], where: { tenantId: user.tenantId }, _max: { dateISO: true } }),
      this.prisma.vocalSession.findMany({
        where: { tenantId: user.tenantId, dateISO: { gte: since } },
        select: { userId: true, dateISO: true, exerciseId: true },
      }),
    ])

    const lastById = new Map(lastAgg.map((a) => [a.userId, a._max.dateISO]))
    const warmedToday = new Set<string>()
    const practicedHarmony = new Set<string>()
    for (const s of recent) {
      const isHarmony = !!s.exerciseId && s.exerciseId.startsWith(HARMONY_PREFIX)
      // "aqueceu hoje" = qualquer sessão de hoje que NÃO seja um drill de harmonia
      // (senão o drill de harmonia sozinho marcaria os dois sinais e daria 'pronto').
      if (s.dateISO >= startOfToday && !isHarmony) warmedToday.add(s.userId)
      if (isHarmony) practicedHarmony.add(s.userId)
    }

    return users.map((u) => {
      const warmedUpToday = warmedToday.has(u.id)
      const practicedHarmonyRecently = practicedHarmony.has(u.id)
      const score = (warmedUpToday ? 50 : 0) + (practicedHarmonyRecently ? 50 : 0)
      const status = score >= 100 ? 'ready' : score > 0 ? 'warm' : 'cold'
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        voicePart: u.ministryMember?.voicePart ?? 'UNASSIGNED',
        lastSessionAt: lastById.get(u.id) ?? null,
        warmedUpToday,
        practicedHarmonyRecently,
        score,
        status,
      }
    })
  }
}
