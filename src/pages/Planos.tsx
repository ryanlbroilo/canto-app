import { useEffect, useState } from 'react'
import '../styles/planos.css'
import { PLANS, Plan, PlanId, brl } from '../data/plans'
import { fetchSubscription, openPortal, startCheckout, SubscriptionState } from '../data/billing'
import { Icon } from '../components/ui/Icon'

type Cycle = 'monthly' | 'yearly'

export default function Planos() {
  const [cycle, setCycle] = useState<Cycle>('yearly')
  const [sub, setSub] = useState<SubscriptionState | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState<PlanId | null>(null)

  useEffect(() => {
    fetchSubscription().then(setSub)
  }, [])

  const current: PlanId = sub?.plan ?? 'free'
  const isActive = sub?.status === 'active' || sub?.status === 'trialing'

  async function subscribe(plan: PlanId) {
    setMsg(null)
    setBusy(plan)
    try {
      await startCheckout(plan, cycle)
    } catch {
      setMsg('Os pagamentos ainda estão sendo ativados — em breve você assina por aqui. 🙏')
    } finally {
      setBusy(null)
    }
  }
  async function manage() {
    setMsg(null)
    try {
      await openPortal()
    } catch {
      setMsg('A gestão da assinatura abre aqui assim que os pagamentos forem ativados.')
    }
  }

  const b2c = PLANS.filter((p) => !p.b2b)
  const b2b = PLANS.filter((p) => p.b2b)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Planos</h1>
          <p className="page-sub">
            O grátis te dá o gostinho todo dia. O Pro entrega o coach: a EVA que explica, o caminho inteiro, a saúde
            vocal e o progresso a fundo. 14 dias grátis, cancela quando quiser.
          </p>
        </div>
      </div>

      {/* Assinatura atual */}
      <div className="card plan-current reveal">
        <div>
          <span className="plan-current-tag">Seu plano</span>
          <div className="plan-current-name">
            {PLANS.find((p) => p.id === current)?.name ?? 'Grátis'}
            {isActive && sub?.cancelAtPeriodEnd && <span className="badge" style={{ marginLeft: 8 }}>cancela no fim do ciclo</span>}
          </div>
          {isActive && sub?.currentPeriodEnd && (
            <div className="plan-current-sub">Renova em {new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}</div>
          )}
        </div>
        {isActive ? (
          <button className="btn" onClick={manage}>
            <Icon name="settings" size={15} /> Gerir assinatura
          </button>
        ) : (
          <span className="plan-current-hint">Escolha um plano abaixo para desbloquear tudo.</span>
        )}
      </div>

      {/* Ciclo */}
      <div className="plan-cycle" role="tablist" aria-label="Ciclo de cobrança">
        <button role="tab" aria-selected={cycle === 'monthly'} data-active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>Mensal</button>
        <button role="tab" aria-selected={cycle === 'yearly'} data-active={cycle === 'yearly'} onClick={() => setCycle('yearly')}>
          Anual <span className="plan-save">−2 meses</span>
        </button>
      </div>

      {msg && <div className="plan-msg reveal">{msg}</div>}

      {/* B2C */}
      <div className="plan-grid">
        {b2c.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} current={current} busy={busy === p.id} onSubscribe={subscribe} />
        ))}
      </div>

      {/* B2B2C */}
      <div className="plan-b2b-head reveal">
        <h2 className="plan-b2b-title">Para igrejas e professores</h2>
        <p className="plan-b2b-sub">Um líder convida o time inteiro. Preço por organização, progresso de todo mundo num painel só.</p>
      </div>
      <div className="plan-grid plan-grid--b2b">
        {b2b.map((p) => (
          <PlanCard key={p.id} plan={p} cycle={cycle} current={current} busy={busy === p.id} onSubscribe={subscribe} />
        ))}
      </div>

      <p className="plan-foot">
        Preços em reais, cobrança via Stripe. Cancele quando quiser — sem pegadinha de renovação, sem letra miúda.
      </p>
    </div>
  )
}

function priceFor(plan: Plan, cycle: Cycle): { big: string; per: string; note?: string } {
  if (plan.monthlyBRL == null) return { big: 'Grátis', per: 'pra sempre' }
  if (cycle === 'yearly' && plan.yearlyBRL != null) return { big: brl(plan.yearlyBRL), per: '/ano', note: plan.priceNote }
  return { big: brl(plan.monthlyBRL), per: '/mês', note: plan.priceNote }
}

function PlanCard({
  plan,
  cycle,
  current,
  busy,
  onSubscribe,
}: {
  plan: Plan
  cycle: Cycle
  current: PlanId
  busy: boolean
  onSubscribe: (id: PlanId) => void
}) {
  const price = priceFor(plan, cycle)
  const isCurrent = plan.id === current
  const isFree = plan.monthlyBRL == null

  return (
    <div className="plan-card" data-featured={!!plan.featured} data-current={isCurrent}>
      {plan.featured && <span className="plan-ribbon">Mais popular</span>}
      <div className="plan-card-head">
        <div className="plan-card-name">{plan.name}</div>
        <div className="plan-card-aud">{plan.audience}</div>
      </div>
      <div className="plan-price">
        <span className="plan-price-big">{price.big}</span>
        <span className="plan-price-per">{price.per}</span>
      </div>
      {price.note && <div className="plan-price-note">{price.note}</div>}
      <div className="plan-tagline">{plan.tagline}</div>

      <ul className="plan-feats">
        {plan.highlights.map((h, i) => (
          <li key={i}>
            <Icon name="check" size={14} /> {h}
          </li>
        ))}
      </ul>

      <div className="plan-cta">
        {isCurrent ? (
          <button className="btn btn--ghost" disabled>Plano atual</button>
        ) : isFree ? (
          <button className="btn btn--ghost" disabled>Incluso</button>
        ) : (
          <button className="btn btn--primary" onClick={() => onSubscribe(plan.id)} disabled={busy}>
            {busy ? 'Abrindo…' : plan.b2b ? 'Assinar organização' : 'Começar 14 dias grátis'}
          </button>
        )}
      </div>
    </div>
  )
}
