import { BadRequestException, Injectable } from '@nestjs/common'
import { AuthTokenType } from '@prisma/client'
import { createHash, randomBytes } from 'node:crypto'
import { PrismaService } from '../prisma/prisma.service'

// Emite/consome AuthToken (verificação de e-mail, reset de senha). Guarda só o
// HASH (sha256) — o token cru só existe no link do e-mail. Mesmo padrão do
// RefreshToken. Fonte única pra verify + reset não duplicarem cripto.
@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  private sha256(s: string): string {
    return createHash('sha256').update(s).digest('hex')
  }

  /** Emite um token e devolve o CRU (só sai daqui pro link do e-mail). */
  async issue(userId: string, type: AuthTokenType, ttlMs: number): Promise<string> {
    const raw = randomBytes(48).toString('hex')
    await this.prisma.authToken.create({
      data: { userId, type, tokenHash: this.sha256(raw), expiresAt: new Date(Date.now() + ttlMs) },
    })
    return raw
  }

  /** Valida + marca usado; devolve o userId. Lança se inválido/expirado/já usado. */
  async consume(rawToken: string, type: AuthTokenType): Promise<string> {
    const rec = await this.prisma.authToken.findUnique({ where: { tokenHash: this.sha256(rawToken) } })
    if (!rec || rec.type !== type || rec.usedAt || rec.expiresAt < new Date()) {
      throw new BadRequestException('Link inválido ou expirado.')
    }
    // Marca usado de forma ATÔMICA: se duas requisições correrem com o mesmo
    // token válido, só uma vê count=1 (a condição usedAt:null falha na segunda).
    // Fecha replay de token de verificação/reset.
    const claimed = await this.prisma.authToken.updateMany({
      where: { id: rec.id, usedAt: null },
      data: { usedAt: new Date() },
    })
    if (claimed.count !== 1) throw new BadRequestException('Link inválido ou expirado.')
    return rec.userId
  }
}
