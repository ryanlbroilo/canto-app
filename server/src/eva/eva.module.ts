import { Module } from '@nestjs/common'
import { EvaController } from './eva.controller'
import { EvaService } from './eva.service'

@Module({
  controllers: [EvaController],
  providers: [EvaService],
})
export class EvaModule {}
