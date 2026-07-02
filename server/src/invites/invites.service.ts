import { Injectable, NotFoundException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInviteDto } from './dto/create-invite.dto'

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateInviteDto) {
    const token = randomBytes(18).toString('base64url')
    const days = dto.expiresInDays ?? 14
    const invite = await this.prisma.invite.create({
      data: {
        tenantId: user.tenantId,
        token,
        email: dto.email?.toLowerCase() ?? null,
        role: (dto.role as Role) ?? Role.MEMBER,
        expiresAt: new Date(Date.now() + days * 86_400_000),
        maxUses: dto.maxUses ?? null,
        createdById: user.userId,
      },
    })
    return this.shape(invite)
  }

  async list(user: AuthUser) {
    const invites = await this.prisma.invite.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    })
    return invites.map((i) => this.shape(i))
  }

  async revoke(user: AuthUser, id: string) {
    const invite = await this.prisma.invite.findFirst({ where: { id, tenantId: user.tenantId } })
    if (!invite) throw new NotFoundException('Convite não encontrado.')
    await this.prisma.invite.update({ where: { id }, data: { revokedAt: new Date() } })
    return { ok: true }
  }

  // Público: preview do convite pra tela de cadastro ("você foi convidado para X").
  async preview(token: string) {
    const invite = await this.prisma.invite.findUnique({ where: { token }, include: { tenant: true } })
    const status = invite ? this.validity(invite) : 'invalid'
    if (!invite || status !== 'ok') {
      return { valid: false, reason: status }
    }
    return {
      valid: true,
      tenantName: invite.tenant.name,
      tenantSlug: invite.tenant.slug,
      role: invite.role,
      email: invite.email,
    }
  }

  private validity(invite: { revokedAt: Date | null; expiresAt: Date; maxUses: number | null; useCount: number }): 'ok' | 'revoked' | 'expired' | 'exhausted' {
    if (invite.revokedAt) return 'revoked'
    if (invite.expiresAt < new Date()) return 'expired'
    if (invite.maxUses != null && invite.useCount >= invite.maxUses) return 'exhausted'
    return 'ok'
  }

  private shape(i: {
    id: string
    token: string
    email: string | null
    role: Role
    expiresAt: Date
    maxUses: number | null
    useCount: number
    revokedAt: Date | null
    createdAt: Date
  }) {
    return {
      id: i.id,
      token: i.token,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      maxUses: i.maxUses,
      useCount: i.useCount,
      status: this.validity(i),
    }
  }
}

// Reutilizado pelo AuthService.registerWithInvite (validação + consumo em transação).
export function inviteValidity(invite: { revokedAt: Date | null; expiresAt: Date; maxUses: number | null; useCount: number }): 'ok' | 'revoked' | 'expired' | 'exhausted' {
  if (invite.revokedAt) return 'revoked'
  if (invite.expiresAt < new Date()) return 'expired'
  if (invite.maxUses != null && invite.useCount >= invite.maxUses) return 'exhausted'
  return 'ok'
}
