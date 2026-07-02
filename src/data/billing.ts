import { api } from './api'
import { Entitlement, entitlementsOf, PlanId } from './plans'

// Cliente de assinatura (Stripe via backend NestJS /api/billing/*). Enquanto o
// backend de billing não está no ar, fetchSubscription cai em 'free' com
// elegância e startCheckout sinaliza "em breve" — nada quebra.

export type SubStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'

export interface SubscriptionState {
  plan: PlanId
  status: SubStatus
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  /** true quando o backend de billing respondeu (Stripe configurado) */
  live?: boolean
}

const FREE: SubscriptionState = { plan: 'free', status: 'free', live: false }

/** Estado atual da assinatura do tenant. Fallback 'free' se o backend não existir. */
export async function fetchSubscription(): Promise<SubscriptionState> {
  try {
    const s = await api<SubscriptionState>('/billing/state')
    return { ...s, live: true }
  } catch {
    return FREE
  }
}

export class BillingUnavailable extends Error {
  constructor() {
    super('billing indisponível')
  }
}

/** Abre o Checkout do Stripe para um plano/ciclo. Lança BillingUnavailable se off. */
export async function startCheckout(plan: PlanId, cycle: 'monthly' | 'yearly'): Promise<void> {
  try {
    const { url } = await api<{ url: string }>('/billing/checkout', { method: 'POST', body: { plan, cycle } })
    window.location.href = url
  } catch {
    throw new BillingUnavailable()
  }
}

/** Abre o portal de assinatura do Stripe (gerir/cancelar). */
export async function openPortal(): Promise<void> {
  try {
    const { url } = await api<{ url: string }>('/billing/portal', { method: 'POST' })
    window.location.href = url
  } catch {
    throw new BillingUnavailable()
  }
}

/** Um plano/estado libera esta feature? */
export function can(sub: SubscriptionState, ent: Entitlement): boolean {
  const active = sub.status === 'active' || sub.status === 'trialing'
  return active && entitlementsOf(sub.plan).has(ent)
}
