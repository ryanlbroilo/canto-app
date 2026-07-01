import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidationSchema } from '../config/env.validation'
import { PrismaModule } from '../prisma/prisma.module'
import { bullRootConfig } from './bull-config'
import { SESSIONS_QUEUE } from './queue.constants'
import { SessionProcessor } from './session.processor'

// Módulo RAIZ do processo worker: só conexão + Prisma + o processor da fila.
// (A API não importa isto, para não consumir jobs — separação produtor/consumidor.)
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    PrismaModule,
    BullModule.forRootAsync(bullRootConfig),
    BullModule.registerQueue({ name: SESSIONS_QUEUE }),
  ],
  providers: [SessionProcessor],
})
export class WorkerModule {}
