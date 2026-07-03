// HARMONIA / ENCAIXE — o moat do S4 (ministério de louvor). Modela as VOZES do
// louvor (naipes) e os exercícios de "achar sua voz na harmonia": o cantor
// sustenta a SUA nota (terça, quinta, oitava…) contra um drone de referência,
// e o app mede a precisão do intervalo + o encaixe (blend). Tudo device-local.
//
// Convenção de intervalos: semitons COM SINAL a partir da tônica do acorde
// (root). Positivo = acima, negativo = abaixo. O drone toca `droneIntervals`
// (a referência) e o cantor mira `targetInterval`.

import { VocalBaseline } from './types'

// ---- Vozes do ministério (naipes) ----
// Subconjunto cantável no treinador (o cantor escolhe QUAL voz treinar).
export type WorshipPartId = 'melodia' | 'voz2' | 'voz3' | 'baixo'

// Conjunto COMPLETO para atribuição no painel (naipe de cada membro). Inclui a
// nomenclatura SATB clássica além dos rótulos de louvor + 'unassigned'.
// Espelha o enum VoicePart do backend (lá em MAIÚSCULO — o api.ts mapeia o case).
export type VoicePart =
  | 'melodia'
  | 'voz2'
  | 'voz3'
  | 'soprano'
  | 'contralto'
  | 'tenor'
  | 'baixo'
  | 'unassigned'

export interface WorshipPart {
  id: WorshipPartId
  name: string
  /** rótulo curto do intervalo característico (ex.: "terça acima") */
  subtitle: string
  /** equivalente aproximado no SATB clássico */
  satb: string
  /** uma linha do que essa voz faz no arranjo */
  hint: string
  /** cor semântica (reusa a paleta de tokens) */
  color: string
}

// As 4 vozes do louvor, do mais fácil (melodia) ao mais desafiador (baixo/terça).
export const WORSHIP_PARTS: WorshipPart[] = [
  {
    id: 'melodia',
    name: 'Melodia',
    subtitle: 'a linha principal',
    satb: 'Soprano',
    hint: 'A melodia que todo mundo canta — a base sobre a qual as vozes se apoiam.',
    color: 'var(--gold-2)',
  },
  {
    id: 'voz2',
    name: 'Voz 2',
    subtitle: 'terça acima',
    satb: 'Contralto',
    hint: 'A terça — a cor do louvor. Fica logo acima da melodia e dá brilho ao acorde.',
    color: 'var(--good)',
  },
  {
    id: 'voz3',
    name: 'Voz 3',
    subtitle: 'quinta / oitava',
    satb: 'Tenor',
    hint: 'Encorpando o acorde por cima — quinta ou oitava, sustentando a harmonia.',
    color: 'var(--info)',
  },
  {
    id: 'baixo',
    name: 'Baixo',
    subtitle: 'a fundação',
    satb: 'Baixo',
    hint: 'A base grave: a tônica do acorde, sustentando toda a harmonia por baixo.',
    color: 'var(--ember)',
  },
]

export const worshipPart = (id: WorshipPartId): WorshipPart =>
  WORSHIP_PARTS.find((p) => p.id === id) ?? WORSHIP_PARTS[0]

// Todas as vozes atribuíveis no roster (naipes), na ordem do seletor do painel.
export interface VoicePartMeta {
  id: VoicePart
  label: string
  group: 'louvor' | 'satb' | 'nenhum'
}
export const VOICE_PARTS: VoicePartMeta[] = [
  { id: 'melodia', label: 'Melodia', group: 'louvor' },
  { id: 'voz2', label: 'Voz 2 (terça)', group: 'louvor' },
  { id: 'voz3', label: 'Voz 3 (quinta)', group: 'louvor' },
  { id: 'soprano', label: 'Soprano', group: 'satb' },
  { id: 'contralto', label: 'Contralto', group: 'satb' },
  { id: 'tenor', label: 'Tenor', group: 'satb' },
  { id: 'baixo', label: 'Baixo', group: 'satb' },
  { id: 'unassigned', label: 'Sem naipe', group: 'nenhum' },
]
export const voicePartLabel = (id: VoicePart | null | undefined): string =>
  VOICE_PARTS.find((p) => p.id === (id ?? 'unassigned'))?.label ?? 'Sem naipe'

// ---- Exercícios de encaixe ----
export type ChordQuality = 'unison' | 'octave' | 'power' | 'maj' | 'min'

export interface HarmonyExercise {
  /** slug estável, ex.: 'fifth-up' (o exerciseId gravado é 'harmony:<id>') */
  id: string
  name: string
  /** dica curta e acionável mostrada antes de começar */
  cue: string
  /** qual naipe este drill treina */
  part: WorshipPartId
  /** semitons COM SINAL que o cantor mira, a partir da tônica */
  targetInterval: number
  /** semitons que o drone de referência toca (a base) */
  droneIntervals: number[]
  quality: ChordQuality
  /** segundos que a nota é sustentada (uma repetição) */
  holdSec: number
  /** quantas repetições da nota-alvo no drill */
  reps: number
  /** 1..5 — usada só para ordenar/rotular a progressão */
  difficulty: 1 | 2 | 3 | 4 | 5
}

// Progressão pedagógica: primeiro o cantor TRAVA no unísono e na oitava (sentir
// o batimento sumir), depois a quinta (o intervalo mais estável e fácil de
// ouvir), depois as terças (a cor), e por fim completa o acorde inteiro. Base:
// consonâncias perfeitas antes das imperfeitas; sustentar contra referência
// treina afinação relativa e "blend" (ver fundamentacao-academica-vocal.md).
export const HARMONY_EXERCISES: HarmonyExercise[] = [
  {
    id: 'unison',
    name: 'Unísono — travar na nota',
    cue: 'Cante a MESMA nota do drone. Quando o intervalo trava, o batimento some e vira uma nota só.',
    part: 'melodia',
    targetInterval: 0,
    droneIntervals: [0],
    quality: 'unison',
    holdSec: 5,
    reps: 3,
    difficulty: 1,
  },
  {
    id: 'octave-up',
    name: 'Oitava acima',
    cue: 'Cante a mesma nota, uma oitava acima do drone. Mesma cor, região mais brilhante.',
    part: 'voz3',
    targetInterval: 12,
    droneIntervals: [0],
    quality: 'octave',
    holdSec: 5,
    reps: 3,
    difficulty: 2,
  },
  {
    id: 'fifth-up',
    name: 'Quinta acima',
    cue: 'A quinta é o intervalo mais estável — cante acima do drone e sinta o encaixe firme.',
    part: 'voz3',
    targetInterval: 7,
    droneIntervals: [0],
    quality: 'power',
    holdSec: 5,
    reps: 4,
    difficulty: 2,
  },
  {
    id: 'fourth-up',
    name: 'Quarta acima',
    cue: 'Cante a quarta acima do drone. Firme, mas quer resolver — segure sem escorregar.',
    part: 'voz3',
    targetInterval: 5,
    droneIntervals: [0],
    quality: 'power',
    holdSec: 5,
    reps: 3,
    difficulty: 3,
  },
  {
    id: 'third-maj',
    name: 'Terça maior — a cor',
    cue: 'A terça maior é a voz 2 clássica do louvor. Cante acima do drone; ela tende a ficar alta — mire um tiquinho abaixo.',
    part: 'voz2',
    targetInterval: 4,
    droneIntervals: [0],
    quality: 'maj',
    holdSec: 5,
    reps: 4,
    difficulty: 3,
  },
  {
    id: 'third-min',
    name: 'Terça menor',
    cue: 'A terça menor dá o tom mais introspectivo. Cante acima do drone e sustente a cor.',
    part: 'voz2',
    targetInterval: 3,
    droneIntervals: [0],
    quality: 'min',
    holdSec: 5,
    reps: 3,
    difficulty: 3,
  },
  {
    id: 'sixth-maj',
    name: 'Sexta maior',
    cue: 'Uma segunda voz mais aberta. Cante a sexta acima do drone — doce e cheia.',
    part: 'voz2',
    targetInterval: 9,
    droneIntervals: [0],
    quality: 'maj',
    holdSec: 5,
    reps: 3,
    difficulty: 4,
  },
  {
    id: 'third-over-fifth',
    name: 'Terça sobre tônica+quinta',
    cue: 'O drone toca tônica e quinta. Entre na terça e complete o acorde maior — ouça as três vozes se encaixarem.',
    part: 'voz2',
    targetInterval: 4,
    droneIntervals: [0, 7],
    quality: 'maj',
    holdSec: 6,
    reps: 3,
    difficulty: 4,
  },
  {
    id: 'fifth-over-third',
    name: 'Quinta sobre tônica+terça',
    cue: 'O drone toca tônica e terça. Coroe o acorde com a quinta por cima e sustente.',
    part: 'voz3',
    targetInterval: 7,
    droneIntervals: [0, 4],
    quality: 'maj',
    holdSec: 6,
    reps: 3,
    difficulty: 4,
  },
  {
    id: 'bass-root',
    name: 'Baixo — a fundação',
    cue: 'O drone toca a terça e a quinta por cima. Você é a base: cante a tônica grave e sustente o acorde por baixo.',
    part: 'baixo',
    targetInterval: -12,
    droneIntervals: [-8, -5],
    quality: 'maj',
    holdSec: 6,
    reps: 3,
    difficulty: 5,
  },
]

export const getHarmonyExercise = (id: string): HarmonyExercise | undefined =>
  HARMONY_EXERCISES.find((e) => e.id === id)

/** exerciseId gravado na sessão para um drill de harmonia (namespaced, inerte pro currículo). */
export const harmonySessionId = (id: string): string => `harmony:${id}`

// ---- Transposição para o range confortável do cantor ----
// Mesma estratégia do Sequence (ExercisePlayer): centraliza o span do exercício
// no meio da extensão medida, reservando headroom para intervalos negativos
// (baixo = -12). Sem baseline, cai num dó/lá central seguro.

function clampNum(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/** Tônica (MIDI) do acorde, escolhida para que TODAS as notas caibam no range. */
export function rootFor(ex: HarmonyExercise, baseline: VocalBaseline | null): number {
  const ints = [ex.targetInterval, ...ex.droneIntervals]
  const hi = Math.max(0, ...ints) // maior offset acima da tônica
  const lo = Math.min(0, ...ints) // menor offset (negativo) abaixo da tônica
  if (!baseline) return 57 - lo // A3 de referência, deslocado p/ caber o grave
  const mid = Math.round((baseline.lowMidi + baseline.highMidi) / 2)
  // centraliza o span [lo, hi] no meio do range
  let root = mid - Math.round((hi + lo) / 2)
  // garante que root+lo ≥ low e root+hi ≤ high, quando o range comporta o span
  const minRoot = baseline.lowMidi - lo
  const maxRoot = baseline.highMidi - hi
  if (minRoot <= maxRoot) root = clampNum(root, minRoot, maxRoot)
  return Math.round(root)
}

/** Nota-alvo (MIDI) que o cantor deve sustentar. */
export const targetMidiFor = (ex: HarmonyExercise, baseline: VocalBaseline | null): number =>
  rootFor(ex, baseline) + ex.targetInterval

/** Notas (MIDI) do drone de referência. */
export const droneMidisFor = (ex: HarmonyExercise, baseline: VocalBaseline | null): number[] => {
  const root = rootFor(ex, baseline)
  return ex.droneIntervals.map((i) => root + i)
}

// ---- Plano do ministério (ensaio compartilhado) ----
// Contrato do CLIENTE: uma lista plana de itens (o backend guarda em duas colunas
// Json — aquecimento e set de harmonia — e o api.ts mescla/separa). Cada item
// aponta para um exercício da biblioteca (warmup) ou um drill de harmonia.
export interface MinistryPlanItem {
  kind: 'warmup' | 'harmony'
  /** warmup: id de exercício da biblioteca · harmony: id do drill (sem o prefixo 'harmony:') */
  ref: string
  label: string
}
export interface MinistryPlan {
  title: string
  notes?: string
  items: MinistryPlanItem[]
  updatedAt?: string
}
