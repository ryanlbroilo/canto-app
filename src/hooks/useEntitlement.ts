import { useEffect, useState } from 'react'
import { can, fetchSubscription, SubscriptionState } from '../data/billing'
import { Entitlement } from '../data/plans'

// Gating de feature por entitlement do plano. Lê a assinatura do tenant (billing)
// e responde se a feature está liberada. Degrada com elegância: sem backend de
// billing → cai em 'free' (bloqueado) sem quebrar. Usado para SURFACE-gate (a
// tela some/tranca); ações de edição continuam gated por role no componente.
export function useEntitlement(ent: Entitlement): { allowed: boolean; loading: boolean; sub: SubscriptionState | null } {
  const [sub, setSub] = useState<SubscriptionState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchSubscription()
      .then((s) => {
        if (!alive) return
        setSub(s)
        setLoading(false)
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const allowed = sub ? can(sub, ent) : false
  return { allowed, loading, sub }
}
