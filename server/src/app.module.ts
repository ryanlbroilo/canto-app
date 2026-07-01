import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { envValidationSchema } from './config/env.validation'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { bullRootConfig } from './queue/bull-config'
import { RedisModule } from './redis/redis.module'
import { SessionsModule } from './sessions/sessions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    PrismaModule,
    RedisModule,
    BullModule.forRootAsync(bullRootConfig),
    AuthModule,
    SessionsModule,
    HealthModule,
  ],
  providers: [
    // Autenticação JWT global — libere rotas específicas com @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
