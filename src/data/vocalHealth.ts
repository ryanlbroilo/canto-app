import { EXERCISES } from './exercises'
import { Exercise, FeatureReport, SessionRecord } from './types'

// SAÚDE VOCAL — consciência de bem-estar, NÃO diagnóstico médico. Base em
// evidência (repouso vocal previne distúrbios; aquecimento/desaquecimento;
// SOVT reduz esforço). Dois eixos robustos: CARGA & DESCANSO (das durações das
// sessões — não depende de calibração acústica) + um SINAL gentil derivado da
// estabilidade (jitter/shimmer/clareza). Sempre honesto: se persistir, fono.

const DAY = 86_400_000
export type VocalSignal = 'saudavel' | 'cansaco' | 'tensao'
const RANK: Record<VocalSignal, number> = { saudavel: 0, cansaco: 1, tensao: 2 }

/** Sinal de UMA sessão a partir da estabilidade acústica (gentil, conservador). */
export function sessionStrain(report: FeatureReport | undefined): VocalSignal | null {
  if (!report) return null
  const { clarity, jitter, shimmer } = report.performance.stability
  if (clarity < 0.5 || jitter > 0.03 || shimmer > 0.08) return 'tensao'
  if (clarity < 0.68 || jitter > 0.018 || shimmer > 0.05) return 'cansaco'
  return 'saudavel'
}

function voicedMinutes(s: SessionRecord): number {
  const frac = s.featureReport ? Math.max(0.3, s.featureReport.performance.voicedPct / 100) : 0.7
  return (s.durationSec * frac) / 60
}
const dayKey = (iso: string): string => iso.slice(0, 10)
function shiftDay(day: string, delta: number): string {
  const d = new Date(day + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export interface VocalDay {
  loadMin: number
  sessions: number
  signal: VocalSignal
  consecutiveDays: number
  tone: VocalSignal
  headline: string
  advice: string
}

/** Panorama de saúde vocal do dia: carga, sinal e conselho priorizado. */
export function vocalHealthToday(sessions: SessionRecord[], nowMs = Date.now()): VocalDay {
  const todayKey = new Date(nowMs).toISOString().slice(0, 10)
  const today = sessions.filter((s) => dayKey(s.dateISO) === todayKey)
  const loadMin = Math.round(today.reduce((a, s) => a + voicedMinutes(s), 0))
  const signals = today.map((s) => sessionStrain(s.featureReport)).filter((x): x is VocalSignal => x !== null)
  const signal = signals.reduce<VocalSignal>((w, x) => (RANK[x] > RANK[w] ? x : w), 'saudavel')

  // dias consecutivos praticando, terminando hoje (ou ontem)
  const set = new Set(sessions.map((s) => dayKey(s.dateISO)))
  let cursor: string | null = set.has(todayKey) ? todayKey : set.has(shiftDay(todayKey, -1)) ? shiftDay(todayKey, -1) : null
  let consecutiveDays = 0
  while (cursor && set.has(cursor)) {
    consecutiveDays++
    cursor = shiftDay(cursor, -1)
  }

  let headline: string
  let advice: string
  let tone: VocalSignal = signal
  if (signal === 'tensao') {
    headline = 'Sua voz deu sinais de tensão hoje.'
    advice =
      'Vá com calma: um SOVT leve (canudo ou lip trill), hidrate e dê uma pausa. Se a rouquidão ou o desconforto persistirem por mais de 2 semanas, procure um fonoaudiólogo.'
  } else if (loadMin >= 30) {
    tone = 'cansaco'
    headline = `Você já cantou ~${loadMin} min hoje.`
    advice = 'A voz é músculo — dose com pausas e água. Qualidade acima de quantidade.'
  } else if (consecutiveDays >= 6) {
    tone = 'cansaco'
    headline = `${consecutiveDays} dias seguidos treinando — sua voz merece um descanso.`
    advice = 'Um dia de folga deixa a voz mais forte, não mais fraca: o músculo se reconstrói no repouso.'
  } else if (signal === 'cansaco') {
    headline = 'Leves sinais de cansaço vocal.'
    advice = 'Nada grave — vá mais leve, hidrate e prefira exercícios semi-ocluídos (humming, canudo).'
  } else {
    headline = today.length ? 'Voz soando saudável hoje. 👏' : 'Comece pelo aquecimento — a voz agradece.'
    advice = 'Aqueça antes, desaqueça depois e mantenha a hidratação. Consistência sem exagero.'
  }
  return { loadMin, sessions: today.length, signal, consecutiveDays, tone, headline, advice }
}

/** Carga vocal (min de fonação) por dia nos últimos `days` dias. */
export function weeklyLoad(sessions: SessionRecord[], nowMs = Date.now(), days = 7): { day: string; label: string; min: number }[] {
  const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const out: { day: string; label: string; min: number }[] = []
  for (let k = days - 1; k >= 0; k--) {
    const d = new Date(nowMs - k * DAY)
    const key = d.toISOString().slice(0, 10)
    const min = Math.round(sessions.filter((s) => dayKey(s.dateISO) === key).reduce((a, s) => a + voicedMinutes(s), 0))
    out.push({ day: key, label: wd[d.getDay()], min })
  }
  return out
}

// ---- Rotinas guiadas: aquecimento e desaquecimento (SOVT, gentis) ----
const gentle = (e: Exercise): boolean => (e.difficulty ?? 3) <= 2

/** Aquecimento: respiração → SOVT (lip trill/humming) → glissando leve. ~4 nós. */
export function warmupQueue(): string[] {
  const breath = EXERCISES.find((e) => e.kind === 'breathing' && gentle(e))
  const sovt = EXERCISES.filter((e) => e.kind === 'siren' && gentle(e)).slice(0, 2)
  const hum = EXERCISES.find((e) => e.kind === 'scale' && e.skills.includes('ressonancia') && gentle(e))
  return [...new Set([breath, ...sovt, hum].filter((e): e is Exercise => Boolean(e)).map((e) => e.id))].slice(0, 4)
}

/** Desaquecimento: humming/sirenes descendentes e graves, relaxando a voz. ~3 nós. */
export function cooldownQueue(): string[] {
  const pref = EXERCISES.filter(
    (e) => (e.kind === 'siren' || e.kind === 'scale') && gentle(e) && /descend|grave|humming|mmm|nnn/i.test(`${e.id} ${e.name}`),
  )
  const fallback = EXERCISES.filter((e) => e.kind === 'siren' && gentle(e))
  return [...new Set([...pref, ...fallback].map((e) => e.id))].slice(0, 3)
}
