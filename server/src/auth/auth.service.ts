import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Role, User } from '@prisma/client'
import * as argon2 from 'argon2'
import { createHash, randomBytes } from 'node:crypto'
import { PrismaService } from '../prisma/prisma.service'
import { inviteValidity } from '../invites/invites.service'
import { LoginDto, RegisterDto, RegisterInviteDto } from './dto/auth.dto'
import { AccessTokenPayload } from './strategies/jwt.strategy'

export interface TokenBundle {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------- Registro: novo tenant + usuário OWNER ----------
  async register(dto: RegisterDto): Promise<{ user: PublicUser; tokens: TokenBundle }> {
    const slug = await this.uniqueSlug(dto.tenantName)
    const passwordHash = await argon2.hash(dto.password)

    const user = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name: dto.tenantName, slug } })
      return tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          role: Role.OWNER,
        },
      })
    })

    const tokens = await this.issueTokens(user)
    return { user: toPublicUser(user, slug), tokens }
  }

  // ---------- Registro VIA CONVITE (entra num tenant existente) ----------
  async registerWithInvite(dto: RegisterInviteDto): Promise<{ user: PublicUser; tokens: TokenBundle }> {
    const email = dto.email.toLowerCase()
    const passwordHash = await argon2.hash(dto.password)

    const { user, tenantSlug } = await this.prisma.$transaction(async (tx) => {
      const invite = await tx.invite.findUnique({ where: { token: dto.token }, include: { tenant: true } })
      if (!invite || inviteValidity(invite) !== 'ok') {
        throw new UnauthorizedException('Convite inválido ou expirado.')
      }
      if (invite.email && invite.email.toLowerCase() !== email) {
        throw new UnauthorizedException('Este convite é para outro e-mail.')
      }
      const existing = await tx.user.findUnique({
        where: { tenantId_email: { tenantId: invite.tenantId, email } },
      })
      if (existing) throw new ConflictException('Já existe uma conta com esse e-mail nesta organização.')

      const u = await tx.user.create({
        data: { tenantId: invite.tenantId, email, passwordHash, name: dto.name, role: invite.role },
      })
      await tx.invite.update({ where: { id: invite.id }, data: { useCount: { increment: 1 } } })
      return { user: u, tenantSlug: invite.tenant.slug }
    })

    const tokens = await this.issueTokens(user)
    return { user: toPublicUser(user, tenantSlug), tokens }
  }

  // ---------- Login (escopado por tenant) ----------
  async login(dto: LoginDto): Promise<{ user: PublicUser; tokens: TokenBundle }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug.toLowerCase() } })
    if (!tenant) throw new UnauthorizedException('Credenciais inválidas.')

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email.toLowerCase() } },
    })
    if (!user) throw new UnauthorizedException('Credenciais inválidas.')

    const ok = await argon2.verify(user.passwordHash, dto.password).catch(() => false)
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.')

    const tokens = await this.issueTokens(user)
    return { user: toPublicUser(user, tenant.slug), tokens }
  }

  // ---------- Refresh com ROTAÇÃO (revoga o antigo, emite novo) ----------
  async refresh(rawToken: string): Promise<TokenBundle> {
    const tokenHash = sha256(rawToken)
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } })
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.')
    }
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } })
    return this.issueTokens(record.user)
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = sha256(rawToken)
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } })
    if (!user) throw new UnauthorizedException()
    return toPublicUser(user, user.tenant.slug)
  }

  // ---------- helpers ----------
  private async issueTokens(user: User): Promise<TokenBundle> {
    const payload: AccessTokenPayload = { sub: user.id, tid: user.tenantId, role: user.role, email: user.email }
    const expiresIn = this.config.get<string>('JWT_ACCESS_TTL', '15m')
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn,
    })

    const refreshToken = randomBytes(48).toString('hex')
    const days = Number(this.config.get<number>('JWT_REFRESH_TTL_DAYS', 7))
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: sha256(refreshToken), expiresAt },
    })

    return { accessToken, refreshToken, expiresIn }
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 40) || 'tenant'
    for (let i = 0; i < 6; i++) {
      const slug = i === 0 ? base : `${base}-${randomBytes(2).toString('hex')}`
      const exists = await this.prisma.tenant.findUnique({ where: { slug } })
      if (!exists) return slug
    }
    throw new ConflictException('Não foi possível gerar um identificador único para a organização.')
  }
}

export interface PublicUser {
  id: string
  email: string
  name: string | null
  role: Role
  tenantId: string
  tenantSlug: string
}

function toPublicUser(user: User, tenantSlug: string): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug,
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}
