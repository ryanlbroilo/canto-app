import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { envValidationSchema } from './config/env.validation'
import { EvaModule } from './eva/eva.module'
import { HealthModule } from './health/health.module'
import { InvitesModule } from './invites/invites.module'
import { PrismaModule } from './prisma/prisma.module'
import { TenantModule } from './tenant/tenant.module'
import { bullRootConfig } from './queue/bull-config'
import { RedisModule } from './redis/redis.module'
import { SessionsModule } from './sessions/sessions.module'
import { StateModule } from './state/state.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    // Rate-limit global (in-memory, por IP): 120 req/min por padrão. Endpoints
    // sensíveis apertam com @Throttle (auth, eva); o health pula com @SkipThrottle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    RedisModule,
    BullModule.forRootAsync(bullRootConfig),
    AuthModule,
    SessionsModule,
    StateModule,
    InvitesModule,
    TenantModule,
    EvaModule,
    HealthModule,
  ],
  providers: [
    // Rate-limit ANTES da autenticação (protege login/register mesmo anônimo).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Autenticação JWT global — libere rotas específicas com @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
