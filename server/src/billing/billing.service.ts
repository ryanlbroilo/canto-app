import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { PrismaService } from '../prisma/prisma.service'

export type PlanId = 'free' | 'pro' | 'igreja' | 'professor'
export type Cycle = 'monthly' | 'yearly'

export interface SubState {
  plan: PlanId
  status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

// Billing (Stripe). A fonte da verdade da assinatura é o Stripe: o webhook
// espelha o estado no nosso banco (Subscription 1:1 com Tenant). Sem
// STRIPE_SECRET_KEY o serviço fica "não configurado" e o app segue no free.
@Injectable()
export class BillingService {
  private readonly logger = new Logger('Billing')
  private readonly stripe: Stripe | null
  private readonly priceToPlan = new Map<string, { plan: PlanId; cycle: Cycle }>()
  private readonly planToPrice = new Map<string, string>()

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY')
    this.stripe = key ? new Stripe(key) : null
    const map: [PlanId, Cycle, string][] = [
      ['pro', 'monthly', 'STRIPE_PRICE_PRO_MONTHLY'],
      ['pro', 'yearly', 'STRIPE_PRICE_PRO_YEARLY'],
      ['igreja', 'monthly', 'STRIPE_PRICE_IGREJA_MONTHLY'],
      ['igreja', 'yearly', 'STRIPE_PRICE_IGREJA_YEARLY'],
      ['professor', 'monthly', 'STRIPE_PRICE_PROFESSOR_MONTHLY'],
      ['professor', 'yearly', 'STRIPE_PRICE_PROFESSOR_YEARLY'],
    ]
    for (const [plan, cycle, envKey] of map) {
      const price = this.config.get<string>(envKey)
      if (price) {
        this.priceToPlan.set(price, { plan, cycle })
        this.planToPrice.set(`${plan}:${cycle}`, price)
      }
    }
  }

  get configured(): boolean {
    return !!this.stripe
  }

  /** Estado atual da assinatura do tenant (default free). */
  async getState(tenantId: string): Promise<SubState> {
    const sub = await this.prisma.subscription.findUnique({ where: { tenantId } })
    if (!sub || sub.status === 'free') return { plan: 'free', status: 'free' }
    return {
      plan: sub.plan as PlanId,
      status: sub.status as SubState['status'],
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    }
  }

  /** Garante um customer do Stripe para o tenant e devolve o id. */
  private async ensureCustomer(tenantId: string, email: string, name?: string | null): Promise<string> {
    const existing = await this.prisma.subscription.findUnique({ where: { tenantId } })
    if (existing?.stripeCustomerId) return existing.stripeCustomerId
    const customer = await this.stripe!.customers.create({ email, name: name ?? undefined, metadata: { tenantId } })
    await this.prisma.subscription.upsert({
      where: { tenantId },
      create: { tenantId, stripeCustomerId: customer.id },
      update: { stripeCustomerId: customer.id },
    })
    return customer.id
  }

  /** Cria a sessão de Checkout do Stripe (assinatura, trial 14d). */
  async createCheckout(tenantId: string, email: string, name: string | null, plan: PlanId, cycle: Cycle): Promise<string> {
    const price = this.planToPrice.get(`${plan}:${cycle}`)
    if (!price) throw new Error(`price não configurado para ${plan}:${cycle}`)
    const customer = await this.ensureCustomer(tenantId, email, name)
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173')
    const session = await this.stripe!.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ price, quantity: 1 }],
      subscription_data: { trial_period_days: 14, metadata: { tenantId, plan } },
      allow_promotion_codes: true,
      success_url: `${appUrl}/planos?assinado=1`,
      cancel_url: `${appUrl}/planos`,
      metadata: { tenantId, plan },
    })
    if (!session.url) throw new Error('checkout sem url')
    return session.url
  }

  /** Portal de gestão da assinatura (cancelar/atualizar cartão). */
  async createPortal(tenantId: string): Promise<string> {
    const sub = await this.prisma.subscription.findUnique({ where: { tenantId } })
    if (!sub?.stripeCustomerId) throw new Error('sem customer')
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173')
    const portal = await this.stripe!.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/planos`,
    })
    return portal.url
  }

  /** Verifica a assinatura do webhook e devolve o evento. */
  constructEvent(raw: Buffer, signature: string): Stripe.Event {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')
    if (!this.stripe || !secret) throw new Error('webhook não configurado')
    return this.stripe.webhooks.constructEvent(raw, signature, secret)
  }

  /** Aplica um evento do Stripe no nosso banco (espelho). */
  async applyEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const tenantId = s.metadata?.tenantId
        if (tenantId && s.subscription) await this.syncFromSubscription(String(s.subscription), tenantId)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const tenantId = (sub.metadata?.tenantId as string) || (await this.tenantByCustomer(String(sub.customer)))
        if (tenantId) await this.syncFromSubscription(sub, tenantId)
        break
      }
      default:
        break
    }
  }

  private async tenantByCustomer(customerId: string): Promise<string | null> {
    const row = await this.prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } })
    return row?.tenantId ?? null
  }

  /** Escreve o estado de uma Stripe.Subscription no nosso banco. */
  private async syncFromSubscription(subOrId: string | Stripe.Subscription, tenantId: string): Promise<void> {
    const sub = typeof subOrId === 'string' ? await this.stripe!.subscriptions.retrieve(subOrId) : subOrId
    const priceId = sub.items.data[0]?.price?.id
    const mapped = priceId ? this.priceToPlan.get(priceId) : undefined
    const plan: PlanId = (sub.metadata?.plan as PlanId) || mapped?.plan || 'pro'
    const canceled = sub.status === 'canceled' || sub.status === 'incomplete_expired'
    const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
    await this.prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        plan: canceled ? 'free' : plan,
        status: canceled ? 'canceled' : (sub.status as string),
        stripeCustomerId: String(sub.customer),
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
      update: {
        plan: canceled ? 'free' : plan,
        status: canceled ? 'canceled' : (sub.status as string),
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
    })
    this.logger.log(`assinatura do tenant ${tenantId}: ${canceled ? 'free' : plan}/${sub.status}`)
  }
}
