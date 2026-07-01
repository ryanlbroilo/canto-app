import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthUser } from '../../common/decorators/current-user.decorator'

export interface AccessTokenPayload {
  sub: string // userId
  tid: string // tenantId
  role: string
  email: string
}

// Valida o access token e devolve a identidade (com tenantId) pro request.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET')
    if (!secret) throw new Error('JWT_ACCESS_SECRET ausente')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  validate(payload: AccessTokenPayload): AuthUser {
    if (!payload?.sub || !payload?.tid) throw new UnauthorizedException()
    return { userId: payload.sub, tenantId: payload.tid, role: payload.role, email: payload.email }
  }
}
