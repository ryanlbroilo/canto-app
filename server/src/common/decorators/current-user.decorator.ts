import { createParamDecorator, ExecutionContext } from '@nestjs/common'

// Identidade autenticada, anexada ao request pelo JwtStrategy.
export interface AuthUser {
  userId: string
  tenantId: string
  role: string
  email: string
}

/** Injeta o usuário autenticado (com tenantId) no handler. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest()
  return request.user as AuthUser
})
