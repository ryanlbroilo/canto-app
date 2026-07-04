import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto, RefreshDto, RegisterDto, RegisterInviteDto, RequestResetDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto'
import { Public } from '../common/decorators/public.decorator'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'

// Endpoints sensíveis a força-bruta: 10 tentativas/min por IP.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register-invite')
  registerInvite(@Body() dto: RegisterInviteDto) {
    return this.auth.registerWithInvite(dto)
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken)
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId)
  }

  // ---------- Verificação de e-mail ----------
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.auth.verifyEmail(dto.token)
    return { ok: true }
  }

  // Autenticado, mas apertamos o rate-limit: reenvio de e-mail é caro/abusável.
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(200)
  @Post('resend-verification')
  async resendVerification(@CurrentUser() user: AuthUser) {
    await this.auth.resendVerification(user.userId, user.email)
    return { ok: true }
  }

  // ---------- Reset de senha (sempre responde ok — não vaza existência) ----------
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('request-reset')
  async requestReset(@Body() dto: RequestResetDto) {
    await this.auth.requestReset(dto.tenantSlug, dto.email)
    return { ok: true }
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.password)
    return { ok: true }
  }
}
