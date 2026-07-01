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
