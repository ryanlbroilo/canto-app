// SCORING DE ENCAIXE — funções puras que transformam as amostras de uma nota
// sustentada (desvio em cents em relação ao ALVO do intervalo + firmeza) em duas
// dimensões: ACCURACY (o intervalo está afinado?) e BLEND (a nota ficou firme e
// encaixada, sem tremer contra a referência?). Puro e testável, sem áudio.
//
// Nota: o cents é medido contra o alvo de temperamento IGUAL (a nota MIDI do
// intervalo). Afinação justa (terças um tiquinho baixas) fica como refino futuro.

export interface NoteScore {
  /** afinação do intervalo, 0..100 (0¢ de desvio → 100, 50¢ → 0) */
  accuracy: number
  /** encaixe: firmeza + baixa variância contra a referência, 0..100 */
  blend: number
  /** nota combinada 0..100 */
  noteScore: number
  /** acertou de fato (afinado E firme o bastante) */
  hit: boolean
  /** desvio médio absoluto em cents (para avgCentsDev) */
  absMean: number
  /** espalhamento (desvio-padrão) do pitch em cents */
  jitter: number
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}
function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}
function stddev(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

const MISS: NoteScore = { accuracy: 0, blend: 0, noteScore: 0, hit: false, absMean: 999, jitter: 999 }

/**
 * Pontua UMA nota sustentada.
 * @param centsSamples desvio em cents (com sinal) do ALVO, por frame
 * @param steadySamples firmeza perceptual 0..1 (PitchFrame.steadiness), por frame
 */
export function scoreNote(centsSamples: number[], steadySamples: number[]): NoteScore {
  if (centsSamples.length < 8) return MISS
  const absMean = mean(centsSamples.map(Math.abs))
  const jitter = stddev(centsSamples)
  const steadyAvg = clamp01(mean(steadySamples))

  const accuracy = clamp01(1 - absMean / 50) * 100 // 0¢ → 100, 50¢ → 0
  const blend = clamp01(1 - jitter / 40) * 60 + steadyAvg * 40 // firmeza + baixa variância
  const noteScore = accuracy * 0.65 + blend * 0.35
  const hit = absMean <= 25 && jitter <= 30
  return { accuracy, blend, noteScore, hit, absMean, jitter }
}

export interface HarmonyResult {
  /** encaixe médio 0..100 (vai pra SessionRecord.notesHitPct) */
  notesHitPct: number
  /** desvio médio absoluto em cents das notas válidas (avgCentsDev) */
  avgCentsDev: number
  /** quantas notas foram "hit" */
  hits: number
  /** score exibido (= notesHitPct arredondado) */
  score: number
}

/** Consolida as notas de um drill num resultado compatível com addSession. */
export function finalizeHarmony(notes: NoteScore[]): HarmonyResult {
  if (notes.length === 0) return { notesHitPct: 0, avgCentsDev: 0, hits: 0, score: 0 }
  const notesHitPct = mean(notes.map((n) => n.noteScore))
  const finite = notes.filter((n) => n.absMean < 200)
  const avgCentsDev = finite.length ? mean(finite.map((n) => n.absMean)) : 0
  const hits = notes.filter((n) => n.hit).length
  return {
    notesHitPct: +notesHitPct.toFixed(1),
    avgCentsDev: +avgCentsDev.toFixed(1),
    hits,
    score: Math.round(notesHitPct),
  }
}
