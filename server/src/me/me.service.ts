import { ConflictException, Injectable } from '@nestjs/common'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { BillingService } from '../billing/billing.service'
import { PrismaService } from '../prisma/prisma.service'

// LGPD — direito de acesso (exportar) e de exclusão (apagar). Escopo por usuário
// (e tenant onde faz sentido). Nunca devolve hash de senha nem segredos do Stripe.
@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async exportData(user: AuthUser) {
    const [u, state, sessions, refreshTokens, ministryMember, subscription, tenant] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { id: true, email: true, name: true, role: true, emailVerified: true, consentAt: true, createdAt: true },
      }),
      this.prisma.userState.findUnique({ where: { userId: user.userId } }),
      this.prisma.vocalSession.findMany({ where: { tenantId: user.tenantId, userId: user.userId }, orderBy: { dateISO: 'desc' } }),
      this.prisma.refreshToken.findMany({
        where: { userId: user.userId },
        select: { id: true, expiresAt: true, revokedAt: true, createdAt: true },
      }),
      this.prisma.ministryMember.findUnique({ where: { userId: user.userId } }),
      this.prisma.subscription.findUnique({
        where: { tenantId: user.tenantId },
        select: { plan: true, status: true, currentPeriodEnd: true, createdAt: true },
      }),
      this.prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { id: true, name: true, slug: true, createdAt: true } }),
    ])
    return { exportedAt: new Date().toISOString(), user: u, state, sessions, refreshTokens, ministryMember, subscription, tenant }
  }

  // OWNER sozinho → apaga o tenant inteiro (cascata). OWNER com outros membros é
  // bloqueado (não há transferência de organização ainda — decisão v1). Membro →
  // apaga o próprio usuário (cascata dos filhos: state, sessões, tokens, naipe).
  async deleteMe(user: AuthUser): Promise<void> {
    if (user.role === 'OWNER') {
      const members = await this.prisma.user.count({ where: { tenantId: user.tenantId } })
      if (members > 1) {
        throw new ConflictException('Você é o dono da organização. Transfira a liderança antes de excluir sua conta.')
      }
      // Encerra a cobrança ANTES de apagar (fora de transação — chamada externa
      // ao Stripe não pode segurar o banco). Best-effort: nunca lança.
      await this.billing.cancelForTenant(user.tenantId)
      await this.prisma.tenant.delete({ where: { id: user.tenantId } })
      return
    }
    await this.prisma.user.delete({ where: { id: user.userId } })
  }
}
