export interface VocalBaseline {
  lowMidi: number
  highMidi: number
  voiceType: string
  includesFalsetto: boolean
  measuredAt: string
}

export interface Profile {
  name: string
  goal: string
}

export interface Settings {
  /** Limiar de RMS para o gate de ruído (calibração) */
  noiseGate: number
  /** Desmame do feedback visual ao longo do treino (guidance hypothesis) */
  fadingFeedback: boolean
  /** Mostrar a nota-guia nos exercícios */
  targetGuide: boolean
}

export type ExerciseKind = 'breathing' | 'siren' | 'scale' | 'interval' | 'sustain'
export type ExercisePhase = 'aquecimento' | 'tecnica' | 'aplicacao'

export interface Exercise {
  id: string
  name: string
  phase: ExercisePhase
  focus: string
  durationMin: number
  description: string
  kind: ExerciseKind
  /** Offsets em semitons a partir da tônica (scale/interval/sustain) */
  pattern?: number[]
  /** Segundos por nota sustentada */
  holdSec?: number
}

export interface SessionRecord {
  id: string
  dateISO: string
  kind: 'practice' | 'exercise'
  exerciseId?: string
  label: string
  durationSec: number
  /** % de notas acertadas dentro da zona (0..100) */
  notesHitPct: number
  /** desvio médio absoluto em cents */
  avgCentsDev: number
  /** feature-JSON completo (contrato DSP→EVA), quando disponível */
  featureReport?: FeatureReport
}

export interface Streak {
  current: number
  longest: number
  total: number
  days: string[] // datas praticadas (YYYY-MM-DD)
}

// ---- Contrato DSP → LLM (o feature-JSON que a EVA consome; PRD §4.2) ----
// A EVA NUNCA vê áudio — só estes números que o DSP produziu.
export interface FeatureEvent {
  t: number // segundos desde o início da sessão
  type: 'register_break' | 'pitch_crack'
  from?: string
  to?: string
  note?: string
}

export interface FeatureReport {
  sessionId: string
  durationSec: number
  exercise?: { type: string; targetNotes?: string[] }
  performance: {
    /** amostragem da curva de pitch (downsampled p/ o LLM) */
    pitchTimeline: { t: number; note: string; centsOff: number }[]
    avgCentsDeviation: number
    notesHitPct: number
    voicedPct: number
    stability: { jitter: number; shimmer: number; clarity: number }
    vibrato: { present: boolean; rateHz: number; extentCents: number }
    events: FeatureEvent[]
    registerTime: { peito: number; mix: number; cabeca: number; falsete: number }
  }
}
