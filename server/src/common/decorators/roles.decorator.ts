import { SetMetadata } from '@nestjs/common'
import { Role } from '@prisma/client'

export const ROLES_KEY = 'roles'

/** Exige um dos papéis informados (usar junto do RolesGuard). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
