import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotImplementedException,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { Role } from '@prisma/client'
import { Request } from 'express'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { BillingService } from './billing.service'
import { CheckoutDto } from './dto/checkout.dto'

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  // Estado da assinatura do tenant — qualquer membro logado pode ler.
  @Get('state')
  state(@CurrentUser() user: AuthUser) {
    return this.billing.getState(user.tenantId)
  }

  // Assinar / gerir: só o líder (OWNER) ou co-líder (ADMIN) do tenant.
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post('checkout')
  async checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    if (!this.billing.configured) throw new NotImplementedException('billing não configurado')
    const url = await this.billing.createCheckout(user.tenantId, user.email, null, dto.plan, dto.cycle)
    return { url }
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post('portal')
  async portal(@CurrentUser() user: AuthUser) {
    if (!this.billing.configured) throw new NotImplementedException('billing não configurado')
    const url = await this.billing.createPortal(user.tenantId)
    return { url }
  }

  // Webhook do Stripe: público, sem throttle, corpo CRU (assinatura é sobre os
  // bytes originais). Configure a URL /api/billing/webhook no dashboard.
  @Public()
  @SkipThrottle()
  @HttpCode(200)
  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    if (!req.rawBody) throw new BadRequestException('sem corpo cru')
    let event
    try {
      event = this.billing.constructEvent(req.rawBody, sig)
    } catch (e) {
      throw new BadRequestException(`assinatura inválida: ${e instanceof Error ? e.message : ''}`)
    }
    await this.billing.applyEvent(event)
    return { received: true }
  }
}
