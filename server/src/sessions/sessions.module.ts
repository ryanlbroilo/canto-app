import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SESSIONS_QUEUE } from '../queue/queue.constants'
import { SessionsController } from './sessions.controller'
import { SessionsService } from './sessions.service'

@Module({
  imports: [BullModule.registerQueue({ name: SESSIONS_QUEUE })],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
