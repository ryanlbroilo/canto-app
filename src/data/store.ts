// Store local (localStorage). Enquanto validamos, tudo fica no dispositivo.
// Migra para a API do EVA Hub depois, mantendo a mesma forma.
import { Profile, Settings, SessionRecord, Streak, VocalBaseline } from './types'

const K = {
  profile: 'canto.profile.v1',
  settings: 'canto.settings.v1',
  baseline: 'canto.baseline.v1',
  rangeHistory: 'canto.rangeHistory.v1',
  sessions: 'canto.sessions.v1',
  seenOnboarding: 'canto.seenOnboarding.v1',
}

function read<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[store] falha ao gravar', key, e)
  }
}

// ---------- Perfil ----------
export const getProfile = (): Profile => read(K.profile, { name: '', goal: '' })
export const setProfile = (p: Profile) => write(K.profile, p)

// ---------- Configurações ----------
const DEFAULT_SETTINGS: Settings = { noiseGate: 0.006, fadingFeedback: true, targetGuide: true }
export const getSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(K.settings, {}) })
export const setSettings = (s: Settings) => write(K.settings, s)

// ---------- Baseline / range ----------
export const getBaseline = (): VocalBaseline | null => read<VocalBaseline | null>(K.baseline, null)
export function saveBaseline(b: VocalBaseline): void {
  write(K.baseline, b)
  const hist = getRangeHistory()
  hist.push(b)
  write(K.rangeHistory, hist)
}
export const getRangeHistory = (): VocalBaseline[] => read<VocalBaseline[]>(K.rangeHistory, [])

// ---------- Onboarding ----------
export const hasSeenOnboarding = (): boolean => read<boolean>(K.seenOnboarding, false)
export const setSeenOnboarding = () => write(K.seenOnboarding, true)

// ---------- Sessões ----------
export const getSessions = (): SessionRecord[] => read<SessionRecord[]>(K.sessions, [])
export function addSession(s: SessionRecord): void {
  const all = getSessions()
  all.push(s)
  write(K.sessions, all)
}

// ---------- Streak (derivado das sessões) ----------
function dayKey(iso: string): string {
  return iso.slice(0, 10)
}
export function getStreak(): Streak {
  const sessions = getSessions()
  const days = Array.from(new Set(sessions.map((s) => dayKey(s.dateISO)))).sort()
  const { current, longest } = computeRuns(days)
  return { current, longest, total: sessions.length, days }
}
function computeRuns(sortedDays: string[]): { current: number; longest: number } {
  if (sortedDays.length === 0) return { current: 0, longest: 0 }
  const set = new Set(sortedDays)
  let longest = 0
  for (const d of sortedDays) {
    // início de uma sequência?
    const prev = shiftDay(d, -1)
    if (!set.has(prev)) {
      let len = 1
      let next = shiftDay(d, 1)
      while (set.has(next)) {
        len++
        next = shiftDay(next, 1)
      }
      longest = Math.max(longest, len)
    }
  }
  // corrente: conta para trás a partir de hoje (ou ontem)
  const today = new Date().toISOString().slice(0, 10)
  let cursor = set.has(today) ? today : set.has(shiftDay(today, -1)) ? shiftDay(today, -1) : null
  let current = 0
  while (cursor && set.has(cursor)) {
    current++
    cursor = shiftDay(cursor, -1)
  }
  return { current, longest }
}
function shiftDay(day: string, delta: number): string {
  const d = new Date(day + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// ---------- util ----------
export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
