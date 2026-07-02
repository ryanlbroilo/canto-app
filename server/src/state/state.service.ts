import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { PutStateDto } from './dto/put-state.dto'

// Campo Json do Prisma: undefined = não mexe; null = grava NULL (Prisma.DbNull).
function jsonField(v: unknown) {
  if (v === undefined) return undefined
  if (v === null) return Prisma.DbNull
  return v as Prisma.InputJsonValue
}

@Injectable()
export class StateService {
  constructor(private readonly prisma: PrismaService) {}

  // Estado atual do usuário (null se ainda não sincronizou nada).
  async get(user: AuthUser) {
    const s = await this.prisma.userState.findUnique({ where: { userId: user.userId } })
    if (!s) return null
    return {
      profileName: s.profileName,
      profileGoal: s.profileGoal,
      settings: s.settings,
      baseline: s.baseline,
      rangeHistory: s.rangeHistory,
      achievements: s.achievements,
      seenOnboarding: s.seenOnboarding,
      updatedAt: s.updatedAt,
    }
  }

  // Upsert do estado (idempotente). Só toca nos campos enviados.
  async put(user: AuthUser, dto: PutStateDto) {
    const fields = {
      profileName: dto.profileName,
      profileGoal: dto.profileGoal,
      settings: jsonField(dto.settings),
      baseline: jsonField(dto.baseline),
      rangeHistory: jsonField(dto.rangeHistory),
      achievements: jsonField(dto.achievements),
      seenOnboarding: dto.seenOnboarding,
    }
    await this.prisma.userState.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, tenantId: user.tenantId, ...fields },
      update: fields,
    })
    return { ok: true }
  }
}
