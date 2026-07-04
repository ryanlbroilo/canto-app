// Store local (localStorage). Enquanto validamos, tudo fica no dispositivo.
// Migra para a API do EVA Hub depois, mantendo a mesma forma.
import { GamificationState, Profile, Settings, SessionRecord, Streak, VocalBaseline } from './types'
import { computeGamification } from './gamification'
import { pushSessionToBackend, pushUserState, UserStatePayload } from './sync'
import { MinistryPlan, VoicePart } from './harmony'

const K = {
  profile: 'canto.profile.v1',
  settings: 'canto.settings.v1',
  baseline: 'canto.baseline.v1',
  rangeHistory: 'canto.rangeHistory.v1',
  sessions: 'canto.sessions.v1',
  seenOnboarding: 'canto.seenOnboarding.v1',
  achievements: 'canto.achievements.v1',
  reviewsDone: 'canto.reviewsDone.v1',
  voicePart: 'canto.voicePart.v1',
  ministryPlan: 'canto.ministryPlan.v1',
  freeze: 'canto.freeze.v1',
  weeklyGoal: 'canto.weeklyGoal.v1',
  reminder: 'canto.reminder.v1',
}

/** Conquista desbloqueada, com o momento em que caiu (para "novo!" na UI). */
export interface UnlockedAchievement {
  id: string
  at: string
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
export const setProfile = (p: Profile) => {
  write(K.profile, p)
  syncStateNow()
}

// ---------- Configurações ----------
const DEFAULT_SETTINGS: Settings = { noiseGate: 0.006, fadingFeedback: true, targetGuide: true }
export const getSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(K.settings, {}) })
export const setSettings = (s: Settings) => {
  write(K.settings, s)
  syncStateNow()
}

// ---------- Baseline / range ----------
export const getBaseline = (): VocalBaseline | null => read<VocalBaseline | null>(K.baseline, null)
export function saveBaseline(b: VocalBaseline): void {
  write(K.baseline, b)
  const hist = getRangeHistory()
  hist.push(b)
  write(K.rangeHistory, hist)
  syncStateNow()
}
export const getRangeHistory = (): VocalBaseline[] => read<VocalBaseline[]>(K.rangeHistory, [])

/**
 * Baseline anterior ao atual (penúltimo no histórico), para comparar deltas no
 * resultado do teste. O último item do histórico é o baseline recém-salvo; o
 * "anterior" é o de índice -2. Devolve null se não houver teste prévio.
 * ADITIVO: novo helper, não muda assinaturas existentes.
 */
export function getPreviousBaseline(): VocalBaseline | null {
  const hist = getRangeHistory()
  return hist.length >= 2 ? hist[hist.length - 2] : null
}

/**
 * Delta entre o teste mais recente e o anterior: semitons ganhos no grave/agudo,
 * variação de extensão total e dias decorridos. Números positivos = melhora
 * (grave mais grave, agudo mais agudo). null quando é o primeiro teste.
 * ADITIVO: novo helper.
 */
export interface RangeDelta {
  lowSemis: number // negativo = desceu mais grave (ganho); usamos sinal cru
  highSemis: number // positivo = subiu mais agudo (ganho)
  totalSemis: number // variação da extensão (high-low) atual vs anterior
  days: number // dias desde o teste anterior
  prevAt: string
}
export function getRangeDelta(current: VocalBaseline): RangeDelta | null {
  const prev = getPreviousBaseline()
  if (!prev) return null
  const curSpan = current.highMidi - current.lowMidi
  const prevSpan = prev.highMidi - prev.lowMidi
  const ms = new Date(current.measuredAt).getTime() - new Date(prev.measuredAt).getTime()
  return {
    lowSemis: prev.lowMidi - current.lowMidi, // >0 quando o grave desceu (ganhou)
    highSemis: current.highMidi - prev.highMidi, // >0 quando o agudo subiu (ganhou)
    totalSemis: curSpan - prevSpan,
    days: Math.max(0, Math.round(ms / 86_400_000)),
    prevAt: prev.measuredAt,
  }
}

// ---------- Onboarding ----------
export const hasSeenOnboarding = (): boolean => read<boolean>(K.seenOnboarding, false)
export const setSeenOnboarding = () => {
  write(K.seenOnboarding, true)
  syncStateNow()
}

// ---------- Sessões ----------
export const getSessions = (): SessionRecord[] => read<SessionRecord[]>(K.sessions, [])
export function addSession(s: SessionRecord): void {
  const all = getSessions()
  all.push(s)
  write(K.sessions, all)
  pushSessionToBackend(s) // sync com o backend (offline-tolerante)
}

/** Mescla sessões vindas do backend no store local (dedupe por id; servidor vence). */
export function mergeServerSessions(server: SessionRecord[]): void {
  const byId = new Map<string, SessionRecord>()
  for (const s of getSessions()) byId.set(s.id, s)
  for (const s of server) byId.set(s.id, { ...byId.get(s.id), ...s })
  const merged = Array.from(byId.values()).sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  write(K.sessions, merged)
}

// ---------- Revisões de unidade concluídas (troféu do path) ----------
// Local-only por ora (não sincroniza com o backend — é um marco de UI; a
// prática em si já é gravada como sessões normais e segue o usuário).
export const getReviewsDone = (): string[] => read<string[]>(K.reviewsDone, [])
export const isReviewDone = (unitId: string): boolean => getReviewsDone().includes(unitId)
export function markReviewDone(unitId: string): void {
  const cur = getReviewsDone()
  if (!cur.includes(unitId)) {
    cur.push(unitId)
    write(K.reviewsDone, cur)
  }
}

// ---------- Ministério: naipe do cantor + cache do plano de ensaio ----------
// O naipe (voz que a pessoa canta) fica local E sincroniza pelo endpoint próprio
// (não pelo blob de estado). O plano é um CACHE local — o servidor é a verdade.
export const getVoicePart = (): VoicePart => read<VoicePart>(K.voicePart, 'unassigned')
export function setVoicePart(p: VoicePart): void {
  write(K.voicePart, p)
}

export const getCachedPlan = (): MinistryPlan | null => read<MinistryPlan | null>(K.ministryPlan, null)
/** Guarda o plano vindo do servidor (servidor vence; puro cache, não re-empurra). */
export function mergeServerPlan(plan: MinistryPlan | null): void {
  write(K.ministryPlan, plan)
}

/** Limpa os dados locais do usuário (usar no logout, para não vazar entre contas). */
export function clearUserData(): void {
  for (const k of [K.sessions, K.baseline, K.rangeHistory, K.achievements, K.seenOnboarding, K.profile, K.reviewsDone, K.voicePart, K.ministryPlan, K.freeze, K.weeklyGoal, K.reminder]) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  }
}

// ---------- Streak (derivado das sessões) ----------
function dayKey(iso: string): string {
  return iso.slice(0, 10)
}
export function getStreak(): Streak {
  const fz = reconcileStreak()
  return computeStreak(getSessions(), fz.usedDays)
}

/**
 * Streak puro a partir de uma lista de sessões (reusado pro painel do líder).
 * `frozenDays` = dias cobertos por um PROTETOR DE OFENSIVA (streak freeze): contam
 * como mantidos na ofensiva atual/recorde, sem serem sessões reais.
 */
export function computeStreak(sessions: { dateISO: string }[], frozenDays: string[] = []): Streak {
  const practiced = Array.from(new Set(sessions.map((s) => dayKey(s.dateISO))))
  const days = Array.from(new Set([...practiced, ...frozenDays])).sort()
  const { current, longest } = computeRuns(days)
  // `days` devolve só os dias PRATICADOS (o calendário mostra prática real).
  return { current, longest, total: sessions.length, days: practiced.sort() }
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
  // UTC de ponta a ponta: as chaves de dia vêm de dateISO.slice(0,10) (UTC), então
  // o shift também precisa ser UTC — senão em fusos UTC-positivos a ofensiva conta
  // dia sim, dia não (parse local + chave UTC divergem).
  const d = new Date(day + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

// ---------- Protetor de ofensiva (streak freeze) ----------
// Pesquisa (Duolingo): a ANSIEDADE de perder a ofensiva é um dos maiores motores
// de retenção; um "protetor" que cobre 1 dia perdido reduz o abandono. Ganha-se 1
// a cada 7 dias de ofensiva (teto 2) e ele se auto-consome num único dia perdido.
export interface FreezeState {
  /** protetores disponíveis (0..2) */
  available: number
  /** dias que um protetor cobriu (contam na ofensiva) */
  usedDays: string[]
  /** maior marco de 7 dias já recompensado (evita re-conceder) */
  grantedMilestone: number
}
const FREEZE_CAP = 2
const DEFAULT_FREEZE: FreezeState = { available: 1, usedDays: [], grantedMilestone: 0 }
export const getFreezeState = (): FreezeState => ({ ...DEFAULT_FREEZE, ...read<Partial<FreezeState>>(K.freeze, {}) })

/**
 * Concilia o protetor com as sessões (idempotente; grava só se mudar):
 *  • auto-consome 1 protetor quando ONTEM foi perdido mas a ofensiva estava viva
 *    (anteontem praticado/protegido) — cobre um único dia de buraco;
 *  • concede +1 protetor a cada novo marco de 7 dias de ofensiva (teto 2).
 * Chamado por getStreak (como reconcileAchievements por getGamification).
 */
export function reconcileStreak(): FreezeState {
  const st = getFreezeState()
  const sessions = getSessions()
  const practiced = new Set(sessions.map((s) => dayKey(s.dateISO)))
  const used = new Set(st.usedDays)
  const today = new Date().toISOString().slice(0, 10)
  const y1 = shiftDay(today, -1)
  const y2 = shiftDay(today, -2)
  let changed = false

  // auto-consumo: buraco de UM dia (ontem) com ofensiva viva antes dele
  if (
    st.available > 0 &&
    !practiced.has(today) &&
    !practiced.has(y1) &&
    !used.has(y1) &&
    (practiced.has(y2) || used.has(y2))
  ) {
    st.usedDays = [...st.usedDays, y1]
    st.available -= 1
    used.add(y1)
    changed = true
  }

  // concessão por marco de 7 dias (usa a ofensiva já com os protegidos)
  const current = computeStreak(sessions, st.usedDays).current
  while (current >= st.grantedMilestone + 7) {
    st.grantedMilestone += 7
    if (st.available < FREEZE_CAP) st.available += 1
    changed = true
  }

  if (changed) write(K.freeze, st)
  return st
}

// ---------- Meta da semana (commitment device; pesquisa: aposta de meta ~+14% D14) ----------
export interface WeeklyGoal {
  /** dias de treino por semana (3, 5 ou 7) */
  target: number
}
const DEFAULT_GOAL: WeeklyGoal = { target: 5 }
export const getWeeklyGoal = (): WeeklyGoal => ({ ...DEFAULT_GOAL, ...read<Partial<WeeklyGoal>>(K.weeklyGoal, {}) })
export const setWeeklyGoal = (target: number): void => write(K.weeklyGoal, { target })

/** Dias distintos praticados na semana ISO atual (UTC, segunda→domingo). */
export function weekPracticeDays(sessions: { dateISO: string }[], nowMs = Date.now()): number {
  const d = new Date(nowMs)
  const mondayOffset = (d.getUTCDay() + 6) % 7
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - mondayOffset)).toISOString().slice(0, 10)
  return new Set(sessions.map((s) => dayKey(s.dateISO)).filter((k) => k >= start)).size
}

// ---------- Lembrete diário (opt-in; disparo real só com push/PWA, ver S8) ----------
export interface ReminderPref {
  enabled: boolean
  /** hora local 0..23 */
  hour: number
}
const DEFAULT_REMINDER: ReminderPref = { enabled: false, hour: 19 }
export const getReminder = (): ReminderPref => ({ ...DEFAULT_REMINDER, ...read<Partial<ReminderPref>>(K.reminder, {}) })
export const setReminder = (r: ReminderPref): void => write(K.reminder, r)

// ---------- Conquistas desbloqueadas ----------
export const getUnlockedAchievements = (): UnlockedAchievement[] =>
  read<UnlockedAchievement[]>(K.achievements, [])

/**
 * Concilia o conjunto de conquistas elegíveis com o que já está gravado:
 * grava as NOVAS com timestamp (preservando a data das antigas) e devolve a
 * lista completa e ordenada. Não remove conquistas já ganhas.
 */
export function reconcileAchievements(eligibleIds: string[]): UnlockedAchievement[] {
  const stored = getUnlockedAchievements()
  const known = new Set(stored.map((a) => a.id))
  const now = new Date().toISOString()
  let changed = false
  for (const id of eligibleIds) {
    if (!known.has(id)) {
      stored.push({ id, at: now })
      known.add(id)
      changed = true
    }
  }
  if (changed) {
    write(K.achievements, stored)
    syncStateNow()
  }
  return stored
}

// ---------- Gamificação (agregado, recomputável das sessões) ----------
export function getGamification(): GamificationState {
  const state = computeGamification({
    sessions: getSessions(),
    streak: getStreak(),
    baseline: getBaseline(),
    rangeHistory: getRangeHistory(),
  })
  // grava as conquistas recém-desbloqueadas e usa a lista final (persistida)
  const unlocked = reconcileAchievements(state.achievements)
  return { ...state, achievements: unlocked.map((a) => a.id) }
}

// ---------- Sync do estado (perfil/range/settings/conquistas → backend) ----------
// function declaration = hoisted, então os setters acima podem chamá-la.
function syncStateNow(): void {
  const p = getProfile()
  pushUserState({
    profileName: p.name,
    profileGoal: p.goal,
    settings: getSettings() as unknown as Record<string, unknown>,
    baseline: getBaseline() as unknown as Record<string, unknown> | null,
    rangeHistory: getRangeHistory() as unknown[],
    achievements: getUnlockedAchievements() as unknown[],
    seenOnboarding: hasSeenOnboarding(),
  })
}

/** Aplica o estado vindo do backend no store local (servidor vence; não re-empurra). */
export function hydrateUserState(s: UserStatePayload): void {
  write(K.profile, { name: s.profileName ?? '', goal: s.profileGoal ?? '' })
  if (s.settings) write(K.settings, s.settings)
  if (s.baseline) write(K.baseline, s.baseline)
  if (s.rangeHistory) write(K.rangeHistory, s.rangeHistory)
  if (s.achievements) write(K.achievements, s.achievements)
  if (s.seenOnboarding !== undefined) write(K.seenOnboarding, s.seenOnboarding)
}

// ---------- util ----------
export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
