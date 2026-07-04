import { Module } from '@nestjs/common'
import { BillingModule } from '../billing/billing.module'
import { MeController } from './me.controller'
import { MeService } from './me.service'

@Module({
  imports: [BillingModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
