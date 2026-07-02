import type { IconName } from '../components/ui/Icon'

export interface VocalBaseline {
  lowMidi: number
  highMidi: number
  voiceType: string
  includesFalsetto: boolean
  measuredAt: string
  // ---- Campos ADITIVOS/OPCIONAIS (onda "Meu range") ----
  // Backward-compatible: baselines antigos não têm estes campos; toda a UI trata
  // ausência com elegância. NÃO reordenar nem tornar obrigatórios.
  /** Limite grave da tessitura confortável (MIDI) — faixa que se sustenta sem esforço */
  tessituraLowMidi?: number
  /** Limite agudo da tessitura confortável (MIDI) */
  tessituraHighMidi?: number
  /** Passaggio medido via glissando/sirene (MIDI aproximado) — onde a voz "quebra" */
  passaggioMidi?: number
  /** Firmeza da captura de extremos (0..100) — derivado do desvio-padrão das amostras */
  stabilityScore?: number
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

// ---- Skills (as 7 competências vocais que a plataforma treina) ----
export type SkillId =
  | 'afinacao'
  | 'respiracao'
  | 'passaggio'
  | 'vibrato'
  | 'sustentacao'
  | 'ressonancia'
  | 'extensao'

export interface Skill {
  id: SkillId
  name: string
  icon: IconName
  color: string
  /** 1 linha do que essa skill treina */
  short: string
}

export type TrackLevel = 'iniciante' | 'intermediario' | 'avancado'

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
  /** Nível da trilha em que o exercício mora */
  level: TrackLevel
  /** Skills que o exercício desenvolve */
  skills: SkillId[]
  /** XP base concedido ao completar (antes dos fatores de desempenho) */
  xp: number
  /** Dificuldade relativa 1..5 (peso pedagógico) */
  difficulty?: 1 | 2 | 3 | 4 | 5
}

// ---- Trilhas de aprendizado (currículo ordenado estilo Duolingo) ----
export interface LearningTrack {
  id: string
  level: TrackLevel
  name: string
  hint: string
  /** Sequência ordenada de exercícios que forma o currículo do nível */
  exerciseIds: string[]
}

// ---- Currículo por UNIDADES (path longo estilo Duolingo) ----
// Cada nível (= "seção") é uma sequência de unidades temáticas; cada unidade
// é um grupo ordenado de exercícios (nós-lição). A UI insere um nó de "revisão"
// ao fim de cada unidade. Todos os ~300 exercícios vivem no path.
export interface CurriculumUnit {
  /** slug estável, ex.: 'ini-u1' */
  id: string
  level: TrackLevel
  /** ordem 1-based dentro do nível */
  index: number
  title: string
  subtitle: string
  /** exercícios da unidade, na ordem em que o aluno faz */
  exerciseIds: string[]
}

// ---- Conquistas ----
export interface Achievement {
  id: string
  icon: IconName
  label: string
  desc: string
  category: 'consistencia' | 'afinacao' | 'registro' | 'extensao' | 'vibrato' | 'marco'
}

// ---- Progresso por skill (derivado das sessões) ----
export interface SkillProgress {
  id: SkillId
  xp: number
  level: number
  /** média de notesHitPct das últimas sessões que treinaram a skill (0..100) */
  last5Avg: number
  /** variação recente do desempenho: negativo, 0 ou positivo */
  trend: number
}

// ---- Recomendação do roteador adaptativo ----
export interface AdaptiveRecommendation {
  exerciseId: string
  /** motivo caloroso e específico, citando os números do último relatório */
  reason: string
  /** rótulo curto (ex.: "passaggio", "afinação", "evoluir") */
  tag: string
}

// ---- Estado agregado de gamificação (puro, recomputável das sessões) ----
export interface GamificationState {
  totalXp: number
  level: number
  xpIntoLevel: number
  xpForNext: number
  skills: SkillProgress[]
  /** ids das conquistas desbloqueadas */
  achievements: string[]
  recommendation: AdaptiveRecommendation | null
  /** por exerciseId: quantas vezes fez e melhor pontuação (0..100) */
  exercisesDone: Record<string, { count: number; bestScore: number }>
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
  /** XP concedido pela sessão (cacheado; recomputável por xpForSession) */
  xpEarned?: number
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
