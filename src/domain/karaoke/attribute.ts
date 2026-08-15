// TABELA DE ATRIBUIÇÃO — de `SungNote[]` para achados por competência (§4.2/§4.3).
//
// O que este módulo NÃO faz: nota média, porcentagem de acerto, score. Um número
// dizendo "72%" não ensina ninguém a cantar. O que ele procura é CONCENTRAÇÃO: em
// que condição da música o seu erro se junta. "Você desafina" é inútil; "sua
// afinação cai nas notas acima de 1,2 s, e não nas outras" é uma instrução.
//
// Cada regra tem duas partes, e as duas precisam valer:
//   • a CONDIÇÃO — um recorte das notas feito só com features da MÚSICA;
//   • o SINAL QUE CONFIRMA — uma medição independente que aponte para a mesma causa.
// Sem a confirmação, qualquer recorte com erro acima da média viraria um diagnóstico.
// Com ela, "erro no agudo" só vira `extensao` se a voz também afinar menos firme lá.
//
// A guarda de honestidade (§4.3) é a razão de este arquivo existir do jeito que é, e
// ela é deliberadamente severa: prefere-se dizer MENOS. Um app que acusa sete
// fundamentos por música é indistinguível de um que sorteia.
//
// TS puro, sem DOM.

import type { SkillId } from '../../data/types'
import { LEAP_SEMITONES, LONG_NOTE_SEC } from './demand'
import { VIBRATO_MIN_SEC, type SungNote } from './measure'
import { median } from './stats'

// ---------------------------------------------------------------- guardas --

/** §4.3-1 — abaixo disto a condição não tem amostra, tem anedota. */
export const MIN_NOTES = 5
/** §4.3-2 — efeito mínimo, em cents ACIMA do baseline do próprio cantor. Menos que
 * isto é da ordem do erro do próprio detector, não do cantor. */
export const MIN_EFFECT_CENTS = 15
/** §4.3-3 — condição que cobre mais que isto da música não é condição, é o baseline. */
export const MAX_COVERAGE = 0.6
/** Notas "sem nada de especial" necessárias para o baseline valer. */
export const BASELINE_MIN_NOTES = 5

// ------------------------------------------------------- limiares por regra --

/** Deriva (cents/s) que caracteriza afinação caindo ao longo da nota. */
export const SUSTAIN_DRIFT_CPS = -8
/** Posição na frase a partir da qual a nota conta como "fim de frase". */
export const BREATH_POS = 0.66
/** Frase precisa ter durado isto (s) para a falta de ar ser plausível. */
export const BREATH_ELAPSED_SEC = 6
/** Queda relativa de dinâmica que confirma fôlego acabando. */
export const DYN_DROP_FRACTION = 0.1
/** Largura da faixa varrida em busca de uma zona de passagem (semitons). */
export const PASSAGGIO_BAND_SEMITONES = 4
/** Salto de H1-H2 (dB) dentro da faixa que confirma troca de mecanismo. */
export const H1H2_JUMP_DB = 3
/** Alturas relativas que contam como extremo da música. */
export const EXTREME_HIGH = 0.85
export const EXTREME_LOW = 0.15
/** Fração de frames vozeados abaixo da qual o agudo está claramente custando. */
export const EXTENSAO_VOICED_MAX = 0.7
/** Queda de estabilidade (0..1) que também confirma extremo custando. */
export const EXTENSAO_STEADINESS_DROP = 0.1
/** Scoop (cents) que caracteriza procurar a nota depois de um salto. */
export const SCOOP_CENTS = 50
/** Tempo até assentar (ms) que confirma a procura. */
export const SETTLE_SLOW_MS = 250
/** Faixa fisiológica de taxa de vibrato aceita como saudável (Hz). */
export const VIBRATO_RATE_MIN = 4.5
export const VIBRATO_RATE_MAX = 6.5
/** Amplitude (cents) acima da qual o vibrato virou oscilação de apoio. */
export const VIBRATO_EXTENT_MAX = 120
/** Fração das notas longas com vibrato defeituoso para virar achado. */
export const VIBRATO_DEFECT_FRACTION = 0.6
/** Excesso de H1-H2 (dB) nas notas erradas que caracteriza soprosidade. */
export const RESSONANCIA_H1H2_DB = 3

// ------------------------------------------------------------------ tipos --

export type EffectUnit = 'cents' | 'cents-por-segundo' | 'db' | 'fracao'

export type WeakReason =
  /** menos de MIN_NOTES notas na condição */
  | 'poucas-notas'
  /** a condição cobre mais que MAX_COVERAGE da música */
  | 'condicao-generica'
  /** o efeito existe mas é pequeno demais para se destacar do baseline */
  | 'efeito-pequeno'
  /** o sinal que confirmaria a causa não foi medido neste aparelho */
  | 'sem-sinal'
  /** não houve notas "comuns" suficientes para saber qual é o normal do cantor */
  | 'sem-baseline'

export interface Effect {
  value: number
  unit: EffectUnit
  /** valor a partir do qual o efeito conta; comparado em módulo para unidades negativas */
  threshold: number
}

export interface Finding {
  skill: SkillId
  /** a condição, em português, do jeito que vai para a tela */
  condition: string
  /** o que a medição mostrou naquela condição */
  evidence: string
  n: number
  /** fração das notas avaliáveis da corrida coberta pela condição */
  coverage: number
  effect: Effect
  reported: boolean
  weakBecause: WeakReason | null
  /** índices das notas que satisfazem a condição — o gráfico do relatório sai daqui */
  noteIdx: number[]
}

export type SignalKind = 'mudez-no-agudo' | 'mudez-no-grave' | 'colapso-dinamico'

/** Observação que NÃO depende da referência ser confiável — vale inclusive nos
 *  trechos descartados por `ref-fraca`. Descreve, não atribui culpa. */
export interface Signal {
  kind: SignalKind
  text: string
  n: number
}

export interface Attribution {
  baseline: { cents: number; n: number; reliable: boolean }
  /** achados que passaram na guarda inteira, do mais forte para o mais fraco */
  findings: Finding[]
  /** candidatos que bateram na guarda; ficam de fora do veredito, mas explicam o silêncio */
  weak: Finding[]
  signals: Signal[]
  /** notas efetivamente avaliáveis (não puladas e com desvio medido) */
  scored: number
}

// -------------------------------------------------------------- auxiliares --

const isScored = (n: SungNote): boolean => !n.skipped && n.centsDev !== null

const absDev = (n: SungNote): number => Math.abs(n.centsDev as number)

/** Mediana de uma extração que pode faltar em parte das notas; null se faltou em todas. */
function medianOf(notes: SungNote[], pick: (n: SungNote) => number | null): number | null {
  const xs = notes.map(pick).filter((v): v is number => v !== null && Number.isFinite(v))
  return xs.length ? median(xs) : null
}

/**
 * O "normal" do cantor: mediana de |desvio| nas notas sem nada de especial —
 * duração média, sem salto, no meio da frase e no meio da extensão da música.
 *
 * Precisa ser o normal DELE, e não um alvo absoluto, senão a mesma música acusaria
 * um iniciante em sete fundamentos e um cantor treinado em nenhum. O que interessa
 * é sempre o excesso sobre o próprio normal.
 */
export function singerBaseline(notes: SungNote[]): { cents: number; n: number; reliable: boolean } {
  const plain = notes.filter(
    (n) =>
      isScored(n) &&
      n.durSec >= 0.4 &&
      n.durSec <= 1.0 &&
      n.leapFromPrev < LEAP_SEMITONES &&
      n.posInPhrase >= 0.25 &&
      n.posInPhrase <= 0.75 &&
      n.relHeight >= 0.25 &&
      n.relHeight <= 0.75,
  )
  if (plain.length >= BASELINE_MIN_NOTES) {
    return { cents: median(plain.map(absDev)), n: plain.length, reliable: true }
  }
  // sem notas comuns suficientes ainda dá para descrever a corrida, mas nenhuma
  // regra baseada em cents pode ser reportada — ver `sem-baseline`
  const all = notes.filter(isScored)
  return { cents: all.length ? median(all.map(absDev)) : 0, n: plain.length, reliable: false }
}

interface Ctx {
  scored: SungNote[]
  all: SungNote[]
  baseline: { cents: number; n: number; reliable: boolean }
  /** extensão conhecida do cantor (MIDI), quando o app já mediu */
  singerRange: { lo: number; hi: number } | null
}

/** Aplica a guarda inteira e monta o achado. A ORDEM importa: sem amostra não se
 *  discute cobertura, e sem cobertura válida o tamanho do efeito é irrelevante. */
function guard(
  skill: SkillId,
  condition: string,
  evidence: string,
  hits: SungNote[],
  effect: Effect,
  ctx: Ctx,
  needsBaseline: boolean,
): Finding {
  const coverage = ctx.scored.length ? hits.length / ctx.scored.length : 0
  let weakBecause: WeakReason | null = null
  if (hits.length < MIN_NOTES) weakBecause = 'poucas-notas'
  else if (coverage > MAX_COVERAGE) weakBecause = 'condicao-generica'
  else if (needsBaseline && !ctx.baseline.reliable) weakBecause = 'sem-baseline'
  else if (Math.abs(effect.value) < Math.abs(effect.threshold)) weakBecause = 'efeito-pequeno'
  return {
    skill,
    condition,
    evidence,
    n: hits.length,
    coverage,
    effect,
    reported: weakBecause === null,
    weakBecause,
    noteIdx: hits.map((n) => n.index),
  }
}

/** Achado impossível de julgar porque o sinal confirmador não existe neste aparelho
 *  (H1-H2 e centróide só vêm do backend WASM). Melhor dizer "não sei" do que
 *  reportar a condição sozinha, que é justamente a parte que engana. */
function unmeasurable(skill: SkillId, condition: string, hits: SungNote[], ctx: Ctx): Finding {
  return {
    skill,
    condition,
    evidence: 'este aparelho não mede o sinal que confirmaria a causa',
    n: hits.length,
    coverage: ctx.scored.length ? hits.length / ctx.scored.length : 0,
    // efeito neutro: não é "efeito zero", é "não medido" — quem lê isto tem que
    // olhar para `weakBecause`, nunca para o número
    effect: { value: 0, unit: 'fracao', threshold: 1 },
    reported: false,
    weakBecause: 'sem-sinal',
    noteIdx: hits.map((n) => n.index),
  }
}

const cents = (v: number): string => `${Math.round(Math.abs(v))} cents`

// ------------------------------------------------------------------ regras --

/** sustentacao — nota longa, afinação escorregando ao longo dela (apoio cedendo). */
function ruleSustentacao(ctx: Ctx): Finding | null {
  const hits = ctx.scored.filter((n) => n.durSec > LONG_NOTE_SEC)
  if (hits.length === 0) return null
  const drift = medianOf(hits, (n) => n.driftCentsPerSec)
  if (drift === null) return null
  return guard(
    'sustentacao',
    `notas mais longas que ${LONG_NOTE_SEC.toFixed(1).replace('.', ',')} s`,
    `a afinação escorrega ${Math.abs(Math.round(drift))} cents a cada segundo enquanto você segura a nota`,
    hits,
    { value: drift, unit: 'cents-por-segundo', threshold: SUSTAIN_DRIFT_CPS },
    ctx,
    false,
  )
}

/** respiracao — fim de frase longa, com o erro subindo E a dinâmica caindo. */
function ruleRespiracao(ctx: Ctx): Finding | null {
  const hits = ctx.scored.filter(
    (n) => n.posInPhrase > BREATH_POS && n.phraseElapsedSec > BREATH_ELAPSED_SEC,
  )
  if (hits.length === 0) return null

  // a dinâmica do fim da frase é comparada com a do INÍCIO DA MESMA FRASE, e não
  // com a média da música: frases diferentes têm alturas e intensidades diferentes
  const phrases = new Set(hits.map((n) => n.phraseIndex))
  const drops: number[] = []
  for (const p of phrases) {
    const early = medianOf(
      ctx.scored.filter((n) => n.phraseIndex === p && n.posInPhrase <= 0.33),
      (n) => n.dynamicsAvg,
    )
    const late = medianOf(
      hits.filter((n) => n.phraseIndex === p),
      (n) => n.dynamicsAvg,
    )
    if (early !== null && late !== null && early > 0) drops.push((early - late) / early)
  }
  if (drops.length === 0) return unmeasurable('respiracao', 'no fim de frases longas', hits, ctx)

  const excess = median(hits.map(absDev)) - ctx.baseline.cents
  const drop = median(drops)
  const f = guard(
    'respiracao',
    'no fim de frases longas',
    `o erro sobe ${cents(excess)} e o volume cai ${Math.round(drop * 100)}% em relação ao começo da frase`,
    hits,
    { value: excess, unit: 'cents', threshold: MIN_EFFECT_CENTS },
    ctx,
    true,
  )
  // as duas coisas juntas OU nada: erro subindo sem o volume cair pode ser
  // qualquer outra coisa, e chamar isso de fôlego seria chute com número
  if (f.reported && drop < DYN_DROP_FRACTION) {
    f.reported = false
    f.weakBecause = 'efeito-pequeno'
  }
  return f
}

/**
 * passaggio — erro agrupado numa faixa estreita de altura, com troca de mecanismo.
 *
 * Diferente das outras, esta regra PROCURA a condição em vez de recebê-la pronta:
 * a zona de passagem é de cada voz, não da música. Varre faixas de 4 semitons e fica
 * com a pior. Como a busca escolhe o máximo, ela tenderia a achar "alguma" faixa
 * sempre — é a confirmação por H1-H2 (troca de mecanismo) que impede isso de virar
 * um achado garantido em toda corrida.
 */
function rulePassaggio(ctx: Ctx): Finding | null {
  if (ctx.scored.length < MIN_NOTES) return null
  const lo = Math.min(...ctx.scored.map((n) => n.refMidi))
  const hi = Math.max(...ctx.scored.map((n) => n.refMidi))
  if (hi - lo < PASSAGGIO_BAND_SEMITONES) return null

  let best: { hits: SungNote[]; excess: number } | null = null
  // varre até `hi` INCLUSIVE, e não até `hi - largura`: parar antes deixaria as
  // notas mais agudas da música fora de qualquer faixa examinada — exatamente onde
  // uma zona de passagem costuma estar. Faixas que passam do topo ficam parcialmente
  // vazias, o que é inofensivo: a exigência de MIN_NOTES já as descarta.
  for (let from = lo; from <= hi; from++) {
    const inBand = ctx.scored.filter(
      (n) => n.refMidi >= from && n.refMidi < from + PASSAGGIO_BAND_SEMITONES,
    )
    if (inBand.length < MIN_NOTES) continue
    const excess = median(inBand.map(absDev)) - ctx.baseline.cents
    if (!best || excess > best.excess) best = { hits: inBand, excess }
  }
  if (!best) return null

  const { hits: bandHits, excess } = best
  const outside = ctx.scored.filter((n) => !bandHits.includes(n))
  const inH1H2 = medianOf(bandHits, (n) => n.h1h2Avg)
  const outH1H2 = medianOf(outside, (n) => n.h1h2Avg)
  // rotula pelas notas que realmente caíram na faixa, não pela janela da varredura:
  // várias janelas empatam com o mesmo conjunto de notas, e o rótulo tem que
  // descrever o canto, não o passo do laço
  const bandLo = Math.min(...bandHits.map((n) => n.refMidi))
  const bandHi = Math.max(...bandHits.map((n) => n.refMidi))
  const band = bandLo === bandHi ? midiName(bandLo) : `${midiName(bandLo)}–${midiName(bandHi)}`
  if (inH1H2 === null || outH1H2 === null) {
    return unmeasurable('passaggio', `na faixa ${band}`, bandHits, ctx)
  }

  const jump = inH1H2 - outH1H2
  const f = guard(
    'passaggio',
    `na faixa ${band}`,
    `o erro se junta nessas notas (${cents(excess)} acima do seu normal) e o timbre muda ao entrar nelas`,
    bandHits,
    { value: excess, unit: 'cents', threshold: MIN_EFFECT_CENTS },
    ctx,
    true,
  )
  if (f.reported && Math.abs(jump) < H1H2_JUMP_DB) {
    // erro concentrado numa faixa SEM troca de mecanismo não é passagem: é só a
    // parte da música em que você erra mais, e isso as outras regras explicam melhor
    f.reported = false
    f.weakBecause = 'sem-sinal'
  }
  return f
}

/** extensao — extremos da música, com a voz custando a sair (menos vozeada ou menos firme). */
function ruleExtensao(ctx: Ctx): Finding | null {
  const outsideKnown = (n: SungNote): boolean =>
    ctx.singerRange === null || n.refMidi > ctx.singerRange.hi || n.refMidi < ctx.singerRange.lo
  const hits = ctx.scored.filter(
    (n) => (n.relHeight > EXTREME_HIGH || n.relHeight < EXTREME_LOW) && outsideKnown(n),
  )
  if (hits.length === 0) return null

  const excess = median(hits.map(absDev)) - ctx.baseline.cents
  const voiced = median(hits.map((n) => n.voicedPct))
  const steadyIn = medianOf(hits, (n) => n.steadinessAvg)
  const steadyOut = medianOf(
    ctx.scored.filter((n) => !hits.includes(n)),
    (n) => n.steadinessAvg,
  )
  const steadyDrop = steadyIn !== null && steadyOut !== null ? steadyOut - steadyIn : null
  const confirms =
    voiced < EXTENSAO_VOICED_MAX || (steadyDrop !== null && steadyDrop >= EXTENSAO_STEADINESS_DROP)

  const f = guard(
    'extensao',
    'nos extremos da extensão da música',
    `${cents(excess)} acima do seu normal, e a voz sai menos firme lá`,
    hits,
    { value: excess, unit: 'cents', threshold: MIN_EFFECT_CENTS },
    ctx,
    true,
  )
  if (f.reported && !confirms) {
    // desafinar no agudo sem nenhum sinal de esforço é falta de referência do
    // intervalo, não falta de extensão — e cai na regra de afinação
    f.reported = false
    f.weakBecause = 'sem-sinal'
  }
  return f
}

/** afinacao — depois de salto grande, entrando longe e demorando a achar a nota. */
function ruleAfinacao(ctx: Ctx): Finding | null {
  const hits = ctx.scored.filter((n) => n.leapFromPrev >= LEAP_SEMITONES)
  if (hits.length === 0) return null

  const excess = median(hits.map(absDev)) - ctx.baseline.cents
  const scoop = medianOf(hits, (n) => n.onsetCents)
  const settle = medianOf(hits, (n) => n.settleMs)
  if (scoop === null) return unmeasurable('afinacao', 'depois de saltos grandes', hits, ctx)

  const f = guard(
    'afinacao',
    `depois de saltos de ${LEAP_SEMITONES} semitons ou mais`,
    settle === null
      ? `você entra ${cents(scoop)} fora do alvo`
      : `você entra ${cents(scoop)} fora e leva ${Math.round(settle)} ms procurando a nota`,
    hits,
    { value: excess, unit: 'cents', threshold: MIN_EFFECT_CENTS },
    ctx,
    true,
  )
  if (f.reported && !(Math.abs(scoop) >= SCOOP_CENTS && (settle === null || settle > SETTLE_SLOW_MS))) {
    f.reported = false
    f.weakBecause = 'sem-sinal'
  }
  return f
}

/** vibrato — notas longas com vibrato ausente, rápido/lento demais ou largo demais. */
function ruleVibrato(ctx: Ctx): Finding | null {
  const hits = ctx.scored.filter((n) => n.durSec > VIBRATO_MIN_SEC && n.vibrato !== null)
  if (hits.length === 0) return null

  const bad = hits.filter((n) => {
    const v = n.vibrato as NonNullable<SungNote['vibrato']>
    if (!v.present) return true
    if (v.rateHz < VIBRATO_RATE_MIN || v.rateHz > VIBRATO_RATE_MAX) return true
    return v.extentCents > VIBRATO_EXTENT_MAX
  })
  const frac = bad.length / hits.length
  const absent = bad.filter((n) => !(n.vibrato as NonNullable<SungNote['vibrato']>).present).length

  // aqui o efeito NÃO é em cents: vibrato torto não desafina a nota (a mediana da
  // oscilação continua no lugar). Medir isto em cents deixaria a regra inalcançável.
  return guard(
    'vibrato',
    `em notas seguradas por mais de ${VIBRATO_MIN_SEC.toFixed(1).replace('.', ',')} s`,
    absent > bad.length / 2
      ? `${bad.length} de ${hits.length} saem retas, sem vibrato nenhum`
      : `${bad.length} de ${hits.length} têm vibrato fora da faixa saudável de ${VIBRATO_RATE_MIN}–${VIBRATO_RATE_MAX} Hz`,
    hits,
    { value: frac, unit: 'fracao', threshold: VIBRATO_DEFECT_FRACTION },
    ctx,
    false,
  )
}

/**
 * ressonancia — as notas em que você erra são também as mais sopradas.
 *
 * O efeito medido é o EXCESSO DE H1-H2, e não os cents: a condição desta regra já é
 * "onde houve erro", então cobrar dela um efeito em cents seria uma tautologia que
 * passa na guarda por construção.
 */
function ruleRessonancia(ctx: Ctx): Finding | null {
  const limiar = ctx.baseline.cents + MIN_EFFECT_CENTS
  const hits = ctx.scored.filter((n) => absDev(n) >= limiar)
  if (hits.length === 0) return null

  const inH1H2 = medianOf(hits, (n) => n.h1h2Avg)
  const allH1H2 = medianOf(ctx.scored, (n) => n.h1h2Avg)
  if (inH1H2 === null || allH1H2 === null) {
    return unmeasurable('ressonancia', 'nas notas em que o erro apareceu', hits, ctx)
  }

  const excessDb = inH1H2 - allH1H2
  return guard(
    'ressonancia',
    'nas notas em que o erro apareceu',
    `elas saem ${excessDb.toFixed(1)} dB mais sopradas que o resto da sua corrida`,
    hits,
    { value: excessDb, unit: 'db', threshold: RESSONANCIA_H1H2_DB },
    ctx,
    true,
  )
}

/** Nome da nota a partir do MIDI, para a faixa do passaggio sair legível. */
const NOTE_NAMES = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si']
function midiName(midi: number): string {
  const m = Math.round(midi)
  return `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`
}

// ------------------------------------------------------- sinais sem referência --

/** §4.2, último parágrafo: observações que valem mesmo onde a referência falhou.
 *  Descrevem o que aconteceu; não atribuem competência a ninguém. */
function collectSignals(all: SungNote[]): Signal[] {
  const out: Signal[] = []

  // Notas que a referência garantia existirem e saíram MUDAS. Ficam de fora de toda
  // regra (são `sem-voz`, logo não avaliáveis) — e é justamente por isso que
  // precisam aparecer: são o erro mais grave e o mais fácil de sumir do relatório.
  const mute = all.filter((n) => n.skipReason === 'sem-voz')
  const muteHigh = mute.filter((n) => n.relHeight > EXTREME_HIGH)
  const muteLow = mute.filter((n) => n.relHeight < EXTREME_LOW)
  if (muteHigh.length >= MIN_NOTES) {
    out.push({
      kind: 'mudez-no-agudo',
      text: `${muteHigh.length} notas do alto da música ficaram sem voz nenhuma`,
      n: muteHigh.length,
    })
  }
  if (muteLow.length >= MIN_NOTES) {
    out.push({
      kind: 'mudez-no-grave',
      text: `${muteLow.length} notas do grave da música ficaram sem voz nenhuma`,
      n: muteLow.length,
    })
  }

  // Colapso de dinâmica no fim das frases, medido sem depender de afinação.
  const phrases = new Set(all.map((n) => n.phraseIndex))
  const drops: number[] = []
  for (const p of phrases) {
    const early = medianOf(
      all.filter((n) => n.phraseIndex === p && n.posInPhrase <= 0.33),
      (n) => n.dynamicsAvg,
    )
    const late = medianOf(
      all.filter((n) => n.phraseIndex === p && n.posInPhrase > BREATH_POS),
      (n) => n.dynamicsAvg,
    )
    if (early !== null && late !== null && early > 0) drops.push((early - late) / early)
  }
  if (drops.length >= MIN_NOTES) {
    const d = median(drops)
    if (d >= DYN_DROP_FRACTION) {
      out.push({
        kind: 'colapso-dinamico',
        text: `o volume cai ${Math.round(d * 100)}% do começo ao fim das frases, de forma consistente`,
        n: drops.length,
      })
    }
  }

  return out
}

// ------------------------------------------------------------------ público --

/**
 * Atribui os achados de uma corrida.
 *
 * `singerRange` é a extensão já medida do cantor (do baseline do app), usada só para
 * não cobrar `extensao` de nota que está dentro do alcance conhecido dele. Sem ela a
 * regra fica mais frouxa, nunca mais severa.
 */
export function attributeRun(
  notes: SungNote[],
  singerRange: { lo: number; hi: number } | null = null,
): Attribution {
  const scored = notes.filter(isScored)
  const baseline = singerBaseline(notes)
  const ctx: Ctx = { scored, all: notes, baseline, singerRange }

  const candidates = [
    ruleSustentacao(ctx),
    ruleRespiracao(ctx),
    rulePassaggio(ctx),
    ruleExtensao(ctx),
    ruleAfinacao(ctx),
    ruleVibrato(ctx),
    ruleRessonancia(ctx),
  ].filter((f): f is Finding => f !== null)

  // ordena pela razão efeito/limiar: é a única escala comum entre regras medidas em
  // cents, em cents/s, em dB e em fração. "Duas vezes o limiar" quer dizer a mesma
  // coisa de gravidade em qualquer uma delas.
  const bySeverity = (a: Finding, b: Finding): number => {
    const ra = Math.abs(a.effect.value) / Math.abs(a.effect.threshold || 1)
    const rb = Math.abs(b.effect.value) / Math.abs(b.effect.threshold || 1)
    return rb - ra || b.n - a.n
  }

  return {
    baseline,
    findings: candidates.filter((f) => f.reported).sort(bySeverity),
    weak: candidates.filter((f) => !f.reported).sort(bySeverity),
    signals: collectSignals(notes),
    scored: scored.length,
  }
}
