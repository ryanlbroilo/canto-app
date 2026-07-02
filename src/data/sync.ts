// Sincronização das sessões com o backend (offline-first: falha não quebra o app).
import { api, isAuthed } from './api'
import { SessionRecord } from './types'

interface ServerSession {
  id: string
  clientId: string | null
  kind: 'practice' | 'exercise'
  exerciseId: string | null
  label: string
  durationSec: number
  notesHitPct: number
  avgCentsDev: number
  featureReport: SessionRecord['featureReport'] | null
  dateISO: string
  xpEarned: number | null
}

/** Empurra uma sessão pro backend (fire-and-forget). O worker processa a fila. */
export function pushSessionToBackend(rec: SessionRecord): void {
  if (!isAuthed()) return
  api('/sessions', {
    method: 'POST',
    body: {
      clientId: rec.id, // idempotência: o backend faz upsert por (tenant,user,clientId)
      kind: rec.kind,
      exerciseId: rec.exerciseId,
      label: rec.label,
      durationSec: rec.durationSec,
      notesHitPct: rec.notesHitPct,
      avgCentsDev: rec.avgCentsDev,
      featureReport: rec.featureReport,
      dateISO: rec.dateISO,
    },
  }).catch(() => {
    /* offline/erro — mantém local; um retry-queue pode ser adicionado depois */
  })
}

// ---------- Estado do usuário (perfil, range, settings, conquistas, onboarding) ----------
export interface UserStatePayload {
  profileName?: string
  profileGoal?: string
  settings?: Record<string, unknown>
  baseline?: Record<string, unknown> | null
  rangeHistory?: unknown[]
  achievements?: unknown[]
  seenOnboarding?: boolean
}

let statePushTimer: ReturnType<typeof setTimeout> | undefined

/** Empurra o estado do usuário pro backend (debounced — edições disparam em rajada). */
export function pushUserState(state: UserStatePayload): void {
  if (!isAuthed()) return
  clearTimeout(statePushTimer)
  statePushTimer = setTimeout(() => {
    api('/state', { method: 'PUT', body: state }).catch(() => {
      /* offline-tolerante */
    })
  }, 500)
}

/** Puxa o estado do usuário do backend (ao logar). null se nunca sincronizou. */
export function fetchUserState(): Promise<UserStatePayload | null> {
  return api<UserStatePayload | null>('/state')
}

/** Puxa as sessões do backend (ao logar) e converte pro SessionRecord do cliente. */
export async function fetchServerSessions(): Promise<SessionRecord[]> {
  const rows = await api<ServerSession[]>('/sessions?limit=200')
  return rows.map((r) => ({
    id: r.clientId || r.id,
    dateISO: typeof r.dateISO === 'string' ? r.dateISO : new Date(r.dateISO).toISOString(),
    kind: r.kind,
    exerciseId: r.exerciseId ?? undefined,
    label: r.label,
    durationSec: r.durationSec,
    notesHitPct: r.notesHitPct,
    avgCentsDev: r.avgCentsDev,
    featureReport: r.featureReport ?? undefined,
    xpEarned: r.xpEarned ?? undefined,
  }))
}
