import { BullRootModuleOptions } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'

// Conexão Redis + política de retry padrão da fila (reutilizada por API e worker).
export const bullRootConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): BullRootModuleOptions => ({
    connection: {
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(config.get<number>('REDIS_PORT', 6379)),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 500,
      removeOnFail: 1000,
    },
  }),
}
