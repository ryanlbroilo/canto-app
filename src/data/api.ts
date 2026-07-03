// Cliente HTTP do backend do Canto: Bearer + refresh automático em 401.
// O token fica no localStorage; a chave da EVA continua SÓ no proxy (server-side).

import type { MinistryPlan, MinistryPlanItem, VoicePart } from './harmony'

export const API_URL = ((import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL as string) || 'http://localhost:3333/api'
const AUTH_KEY = 'canto.auth.v1'

export interface AuthUserInfo {
  id: string
  email: string
  name: string | null
  role: string
  tenantId: string
  tenantSlug: string
}
interface Tokens {
  accessToken: string
  refreshToken: string
}
interface StoredAuth {
  user: AuthUserInfo
  tokens: Tokens
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}`)
  }
  /** mensagem amigável extraída do corpo JSON, quando houver */
  friendly(): string {
    try {
      const j = JSON.parse(this.body)
      const m = j?.message
      return Array.isArray(m) ? m.join(' · ') : m || `Erro ${this.status}`
    } catch {
      return `Erro ${this.status}`
    }
  }
}

let memAuth: StoredAuth | null = loadAuth()

function loadAuth(): StoredAuth | null {
  try {
    const s = localStorage.getItem(AUTH_KEY)
    return s ? (JSON.parse(s) as StoredAuth) : null
  } catch {
    return null
  }
}
function saveAuth(a: StoredAuth | null): void {
  memAuth = a
  try {
    if (a) localStorage.setItem(AUTH_KEY, JSON.stringify(a))
    else localStorage.removeItem(AUTH_KEY)
  } catch {
    /* ignore */
  }
}

export const currentUser = (): AuthUserInfo | null => memAuth?.user ?? null
export const isAuthed = (): boolean => !!memAuth

/** Cabeçalho Authorization atual (para chamadas fora do helper `api`, ex.: EVA/SSE). */
export const authHeaders = (): Record<string, string> =>
  memAuth ? { Authorization: `Bearer ${memAuth.tokens.accessToken}` } : {}

export async function tryRefresh(): Promise<boolean> {
  if (!memAuth) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: memAuth.tokens.refreshToken }),
    })
    if (!res.ok) {
      saveAuth(null)
      return false
    }
    const data = (await res.json()) as Tokens
    saveAuth({ user: memAuth.user, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } })
    return true
  } catch {
    return false
  }
}

interface ApiOpts {
  method?: string
  body?: unknown
  auth?: boolean // default true
}

/** Faz uma chamada à API. Em 401, tenta refresh UMA vez e repete. */
export async function api<T>(path: string, opts: ApiOpts = {}): Promise<T> {
  const useAuth = opts.auth !== false
  const send = (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (useAuth && memAuth) headers.Authorization = `Bearer ${memAuth.tokens.accessToken}`
    return fetch(`${API_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    })
  }

  let res = await send()
  if (res.status === 401 && useAuth && memAuth) {
    if (await tryRefresh()) res = await send()
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => ''))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---------- Auth ----------
export interface RegisterInput {
  tenantName: string
  email: string
  password: string
  name?: string
}
export interface LoginInput {
  tenantSlug: string
  email: string
  password: string
}

export async function apiRegister(input: RegisterInput): Promise<AuthUserInfo> {
  const r = await api<{ user: AuthUserInfo; tokens: Tokens }>('/auth/register', { method: 'POST', body: input, auth: false })
  saveAuth({ user: r.user, tokens: r.tokens })
  return r.user
}
export async function apiLogin(input: LoginInput): Promise<AuthUserInfo> {
  const r = await api<{ user: AuthUserInfo; tokens: Tokens }>('/auth/login', { method: 'POST', body: input, auth: false })
  saveAuth({ user: r.user, tokens: r.tokens })
  return r.user
}
export async function apiLogout(): Promise<void> {
  if (memAuth) {
    await api('/auth/logout', { method: 'POST', body: { refreshToken: memAuth.tokens.refreshToken }, auth: false }).catch(() => undefined)
  }
  saveAuth(null)
}
export const apiMe = (): Promise<AuthUserInfo> => api<AuthUserInfo>('/auth/me')

// ---------- Convites / Time (B2B2C) ----------
export interface InvitePreview {
  valid: boolean
  reason?: string
  tenantName?: string
  tenantSlug?: string
  role?: string
  email?: string | null
}
export const apiPreviewInvite = (token: string): Promise<InvitePreview> =>
  api<InvitePreview>(`/invites/preview/${encodeURIComponent(token)}`, { auth: false })

export interface RegisterInviteInput {
  token: string
  email: string
  password: string
  name?: string
}
export async function apiRegisterInvite(input: RegisterInviteInput): Promise<AuthUserInfo> {
  const r = await api<{ user: AuthUserInfo; tokens: Tokens }>('/auth/register-invite', { method: 'POST', body: input, auth: false })
  saveAuth({ user: r.user, tokens: r.tokens })
  return r.user
}

export interface Invite {
  id: string
  token: string
  email: string | null
  role: string
  expiresAt: string
  maxUses: number | null
  useCount: number
  status: 'ok' | 'revoked' | 'expired' | 'exhausted'
}
export interface CreateInviteInput {
  role?: 'MEMBER' | 'ADMIN'
  email?: string
  expiresInDays?: number
  maxUses?: number
}
export const apiListInvites = (): Promise<Invite[]> => api<Invite[]>('/invites')
export const apiCreateInvite = (body: CreateInviteInput): Promise<Invite> => api<Invite>('/invites', { method: 'POST', body })
export const apiRevokeInvite = (id: string): Promise<unknown> => api(`/invites/${id}`, { method: 'DELETE' })

export interface Member {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  sessionCount: number
  totalXp: number
  lastSessionAt: string | null
}
export const apiListMembers = (): Promise<Member[]> => api<Member[]>('/tenant/members')

export interface MemberDetail {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  baseline: unknown | null
  sessions: import('./types').SessionRecord[]
}
export const apiMemberDetail = (id: string): Promise<MemberDetail> => api<MemberDetail>(`/tenant/members/${id}`)

// ---------- Ministério de louvor (S4) ----------
// O backend guarda o naipe como enum MAIÚSCULO (VoicePart do Prisma); o cliente
// trabalha em minúsculo. Estes dois mapeadores são a ÚNICA fronteira de case.
const partToApi = (p: VoicePart): string => p.toUpperCase()
const partFromApi = (p: string): VoicePart => p.toLowerCase() as VoicePart

// resposta crua do plano (o servidor já devolve a lista plana de itens)
interface PlanResponse {
  title: string
  notes: string | null
  items: MinistryPlanItem[]
  updatedAt: string | null
}
const mapPlan = (p: PlanResponse): MinistryPlan => ({
  title: p.title,
  notes: p.notes ?? undefined,
  items: p.items ?? [],
  updatedAt: p.updatedAt ?? undefined,
})

export interface MemberVoicePart {
  id: string
  name: string | null
  email: string
  role: string
  voicePart: VoicePart
}
export interface ReadinessRow {
  id: string
  name: string | null
  email: string
  role: string
  voicePart: VoicePart
  lastSessionAt: string | null
  warmedUpToday: boolean
  practicedHarmonyRecently: boolean
  score: number
  status: 'ready' | 'warm' | 'cold'
}

export const apiGetMinistryPlan = (): Promise<MinistryPlan> =>
  api<PlanResponse>('/ministry/plan').then(mapPlan)

export const apiSaveMinistryPlan = (plan: { title?: string; notes?: string; items: MinistryPlanItem[] }): Promise<MinistryPlan> =>
  api<PlanResponse>('/ministry/plan', { method: 'PUT', body: plan }).then(mapPlan)

export const apiListMinistryMembers = (): Promise<MemberVoicePart[]> =>
  api<Array<Omit<MemberVoicePart, 'voicePart'> & { voicePart: string }>>('/ministry/members').then((rows) =>
    rows.map((r) => ({ ...r, voicePart: partFromApi(r.voicePart) })),
  )

export const apiSetMyVoicePart = (part: VoicePart): Promise<unknown> =>
  api('/ministry/parts/me', { method: 'PUT', body: { voicePart: partToApi(part) } })

export const apiAssignVoicePart = (userId: string, part: VoicePart): Promise<unknown> =>
  api(`/ministry/members/${encodeURIComponent(userId)}/part`, { method: 'PUT', body: { voicePart: partToApi(part) } })

export const apiGetReadiness = (): Promise<ReadinessRow[]> =>
  api<Array<Omit<ReadinessRow, 'voicePart'> & { voicePart: string }>>('/ministry/readiness').then((rows) =>
    rows.map((r) => ({ ...r, voicePart: partFromApi(r.voicePart) })),
  )

// ---------- Comunidade: leaderboard / liga do ministério (S5) ----------
export interface LeaderboardRow {
  id: string
  name: string | null
  email: string
  role: string
  voicePart: VoicePart
  /** XP ganho na semana ISO atual (o placar da liga) */
  weeklyXp: number
  weeklySessions: number
  totalXp: number
  lastSessionAt: string | null
  currentStreak: number
}
export const apiLeaderboard = (): Promise<LeaderboardRow[]> =>
  api<Array<Omit<LeaderboardRow, 'voicePart'> & { voicePart: string }>>('/tenant/leaderboard').then((rows) =>
    rows.map((r) => ({ ...r, voicePart: partFromApi(r.voicePart) })),
  )
