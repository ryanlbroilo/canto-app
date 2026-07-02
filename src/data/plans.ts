// Fonte única dos PLANOS e do que cada um libera (entitlements). Usado pela tela
// de Planos e pelo gating de features. Preço em BRL; anual é o padrão (retém
// 92% vs 68% mensal). B2C: Free/Pro. B2B2C: Igreja/Professor (seat/org-based).
// O provedor é Stripe (ver billing.ts) — os price IDs ficam no backend.

export type PlanId = 'free' | 'pro' | 'igreja' | 'professor'

export type Entitlement =
  | 'unlimited_exercises' // caminho ilimitado (free = poucos por dia)
  | 'eva_coach' // a EVA que explica (chat + diagnóstico completo)
  | 'spaced_review' // revisão espaçada completa
  | 'vocal_health' // saúde vocal completa
  | 'progress_analytics' // progresso e competências detalhados
  | 'songs' // cantar músicas com feedback (em breve)
  | 'team_admin' // painel do líder + convites

/** Free tem um gostinho diário; o resto é do Pro pra cima. */
export const FREE_DAILY_EXERCISES = 3

export interface Plan {
  id: PlanId
  name: string
  audience: string
  tagline: string
  /** null = grátis; senão preço mensal em BRL */
  monthlyBRL: number | null
  /** preço anual em BRL (cobrado 1×/ano) */
  yearlyBRL?: number | null
  priceNote?: string
  featured?: boolean
  b2b?: boolean
  entitlements: Entitlement[]
  highlights: string[]
}

const PRO_ENTITLEMENTS: Entitlement[] = [
  'unlimited_exercises',
  'eva_coach',
  'spaced_review',
  'vocal_health',
  'progress_analytics',
  'songs',
]

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    audience: 'Pra experimentar',
    tagline: 'O gostinho diário — sem cartão.',
    monthlyBRL: null,
    entitlements: [],
    highlights: [
      `${FREE_DAILY_EXERCISES} exercícios do caminho por dia`,
      'Teste de extensão vocal',
      'Feedback de afinação em tempo real',
      'Ofensiva (streak) e primeiras conquistas',
    ],
  },
  {
    id: 'pro',
    name: 'Canto Pro',
    audience: 'Cantor individual',
    tagline: 'O coach completo, no seu bolso.',
    monthlyBRL: 19.9,
    yearlyBRL: 179,
    priceNote: 'no plano anual sai ~R$ 14,90/mês',
    featured: true,
    entitlements: PRO_ENTITLEMENTS,
    highlights: [
      'Caminho ilimitado + revisão espaçada',
      'EVA que explica o porquê e o como',
      'Saúde vocal completa (carga, sinal, rotinas)',
      'Progresso e competências detalhados',
      'Cantar músicas com feedback (em breve)',
    ],
  },
  {
    id: 'igreja',
    name: 'Canto Igreja',
    audience: 'Ministério de louvor',
    tagline: 'Todo o time cantando junto e afinado.',
    monthlyBRL: 149,
    yearlyBRL: 1490,
    priceNote: 'por organização · até 30 membros',
    b2b: true,
    entitlements: [...PRO_ENTITLEMENTS, 'team_admin'],
    highlights: [
      'Canto Pro para todos os membros',
      'Painel do líder: progresso do time',
      'Convites por link, gestão do ministério',
      'Preço por organização, não por assento',
    ],
  },
  {
    id: 'professor',
    name: 'Canto Professor',
    audience: 'Professor de canto',
    tagline: 'Acompanhe seus alunos entre as aulas.',
    monthlyBRL: 49,
    yearlyBRL: 490,
    priceNote: 'até 15 alunos',
    b2b: true,
    entitlements: [...PRO_ENTITLEMENTS, 'team_admin'],
    highlights: [
      'Canto Pro para você e seus alunos',
      'Painel com o progresso de cada aluno',
      'A EVA vira seu assistente entre as aulas',
    ],
  },
]

export const planById = (id: PlanId): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0]

/** Entitlements de um plano (o que ele libera). */
export const entitlementsOf = (id: PlanId): Set<Entitlement> => new Set(planById(id).entitlements)

/** Preço formatado em BRL (separador de milhar; centavos só quando houver). */
export function brl(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: v % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`
}
