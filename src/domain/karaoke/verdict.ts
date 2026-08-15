// O VEREDITO — "é você ou é a música?" (§4.5 do plano).
//
// Esta é a bifurcação que decide se o app é útil ou insuportável. Um achado de
// atribuição diz O QUE falhou; sozinho, ele soa sempre como acusação. O veredito
// coloca o achado contra duas coisas mensuráveis — quanto a MÚSICA cobra naquele eixo
// e quanto VOCÊ já demonstrou aguentar — e só então decide de quem é a conta.
//
// Sem isso, o app te acusa de desafinar numa faixa que está simplesmente três
// semitons acima do seu alcance, e você para de usar.
//
// Duas perguntas diferentes, na ordem certa:
//   1. A música CABE na sua voz? (alturas absolutas — `rangeFit`)
//   2. Se cabe, ela cobra mais do que você treinou naquele eixo? (0..1 — `judgeSkill`)
// A ordem não é estética. Quando a música não cabe, tudo falha junto: afinação,
// respiração, ressonância. Diagnosticar fundamento com o cantor espremido no teto da
// própria extensão é ler ruído — então a pergunta 1 SUSPENDE a pergunta 2, e o app
// devolve a única coisa acionável que existe ali: transponha e refaça.
//
// TS puro, sem DOM.

import type { SkillId } from '../../data/types'
import type { Capability } from './capability'
import type { Finding } from './attribute'
import type { SongDemand } from './track'

/**
 * Diferença mínima entre exigência e capacidade para o veredito sair de cima do muro.
 * Ambos os lados são estimativas grosseiras em 0..1; abaixo disso a diferença é
 * ruído de calibração, e fingir que não é seria inventar uma conclusão.
 */
export const VERDICT_GAP = 0.2

/**
 * Quantos semitons abaixo do agudo medido já contam como "no limite".
 *
 * A extensão medida é o extremo que você TOCOU uma vez, num teste, aquecido. Cantar
 * uma música inteira encostado nele não é a mesma coisa. Duas notas de folga não é
 * cautela: é a diferença entre extensão e tessitura.
 */
export const CEILING_MARGIN = 2

/** Transposições consideradas ao procurar a que faz a música caber. */
const MAX_SHIFT = 12

/**
 * Os únicos eixos com exigência calculável a partir da música sozinha.
 * `passaggio` e `ressonancia` dependem do tipo vocal de quem canta, então não têm
 * lado "a música cobra tanto" — para eles o veredito se declara indefinido em vez de
 * chutar. Ver o cabeçalho de `demand.ts`.
 */
export const ABSOLUTE_SKILLS: readonly SkillId[] = [
  'extensao',
  'sustentacao',
  'respiracao',
  'afinacao',
  'vibrato',
]

export type Culpa = 'musica' | 'voce' | 'indefinido'

export type UndefinedReason =
  /** a música está fora do seu alcance: não dá para diagnosticar nada por cima disso */
  | 'fora-do-alcance'
  /** o fundamento não tem exigência calculável a partir da música */
  | 'sem-eixo'
  /** falta histórico seu nesse fundamento para haver com o que comparar */
  | 'sem-capacidade'
  /** exigência e capacidade estão perto demais para separar */
  | 'proximo'

export type FitStatus = 'cabe' | 'no-limite' | 'nao-cabe' | 'desconhecido'

export interface SingerRange {
  lowMidi: number
  highMidi: number
}

export interface RangeFit {
  status: FitStatus
  /** semitons que a música passa do seu agudo (0 quando não passa) */
  overHigh: number
  /** semitons que a música passa do seu grave */
  overLow: number
  /** transposição, em semitons, que minimiza o estouro; 0 quando já cabe */
  suggestShift: number
  /** estouro que SOBRA na melhor transposição — >0 significa que a música é mais
   *  larga que a sua extensão, e transpor ajuda mas não resolve */
  residual: number
  song: { loMidi: number; hiMidi: number }
  singer: SingerRange | null
}

export interface SkillVerdict {
  skill: SkillId
  culpa: Culpa
  /** por que ficou indefinido; null quando o veredito é conclusivo */
  reason: UndefinedReason | null
  /** exigência da música naquele eixo, 0..1; null quando o eixo não existe */
  demand: number | null
  capability: Capability
  /** exigência menos capacidade; null quando falta um dos lados */
  gap: number | null
}

export interface Verdict {
  fit: RangeFit
  skills: SkillVerdict[]
}

function overflowAt(shift: number, song: RangeFit['song'], singer: SingerRange): number {
  return (
    Math.max(0, song.hiMidi + shift - singer.highMidi) +
    Math.max(0, singer.lowMidi - (song.loMidi + shift))
  )
}

/**
 * A música cabe na voz? E, se não cabe, quanto transpor?
 *
 * A transposição sai de uma varredura, não de uma fórmula: subtrair o estouro do
 * agudo funciona até a música bater no seu grave, e aí a resposta certa é a que
 * minimiza os dois estouros juntos. Empate resolve pelo menor deslocamento — mudar
 * pouco é sempre preferível a mudar muito.
 */
export function rangeFit(demand: SongDemand, singer: SingerRange | null): RangeFit {
  const song = { loMidi: demand.raw.loMidi, hiMidi: demand.raw.hiMidi }

  if (!singer || demand.raw.scoredNotes === 0) {
    return {
      status: 'desconhecido',
      overHigh: 0,
      overLow: 0,
      suggestShift: 0,
      residual: 0,
      song,
      singer,
    }
  }

  const overHigh = Math.max(0, song.hiMidi - singer.highMidi)
  const overLow = Math.max(0, singer.lowMidi - song.loMidi)

  let suggestShift = 0
  let residual = overflowAt(0, song, singer)
  for (let s = -MAX_SHIFT; s <= MAX_SHIFT; s++) {
    const r = overflowAt(s, song, singer)
    if (r < residual || (r === residual && Math.abs(s) < Math.abs(suggestShift))) {
      residual = r
      suggestShift = s
    }
  }

  const fits = overHigh === 0 && overLow === 0
  const status: FitStatus = !fits
    ? 'nao-cabe'
    : song.hiMidi > singer.highMidi - CEILING_MARGIN
      ? 'no-limite'
      : 'cabe'

  return { status, overHigh, overLow, suggestShift, residual, song, singer }
}

/** Exigência da música num eixo — null quando o eixo não é calculável da música. */
export function demandFor(skill: SkillId, demand: SongDemand): number | null {
  switch (skill) {
    case 'extensao':
      return demand.extensao
    case 'sustentacao':
      return demand.sustentacao
    case 'respiracao':
      return demand.respiracao
    case 'afinacao':
      return demand.afinacao
    case 'vibrato':
      return demand.vibrato
    default:
      return null
  }
}

/** Veredito de um fundamento isolado, já sabendo se a música cabe. */
export function judgeSkill(
  skill: SkillId,
  demand: SongDemand,
  capability: Capability,
  fit: RangeFit,
): SkillVerdict {
  const d = demandFor(skill, demand)
  const base = { skill, demand: d, capability }

  // A música fora do alcance contamina TODOS os eixos: quem canta espremido no teto
  // desafina, perde ar e aperta a ressonância junta. Listar cinco déficits aqui seria
  // inventar cinco causas para um efeito só.
  if (fit.status === 'nao-cabe') {
    return { ...base, culpa: 'indefinido', reason: 'fora-do-alcance', gap: null }
  }
  if (d === null) {
    return { ...base, culpa: 'indefinido', reason: 'sem-eixo', gap: null }
  }
  if (capability.source === 'desconhecido') {
    return { ...base, culpa: 'indefinido', reason: 'sem-capacidade', gap: null }
  }

  const gap = d - capability.value
  if (gap >= VERDICT_GAP) return { ...base, culpa: 'musica', reason: null, gap }
  if (gap <= -VERDICT_GAP) return { ...base, culpa: 'voce', reason: null, gap }
  return { ...base, culpa: 'indefinido', reason: 'proximo', gap }
}

/**
 * Veredito da corrida inteira: o encaixe da música na voz, mais um julgamento por
 * achado — na MESMA ordem em que a atribuição os entregou, que já é da causa mais
 * forte para a mais fraca.
 */
export function judgeRun(
  findings: readonly Finding[],
  demand: SongDemand,
  capabilities: Readonly<Record<string, Capability>>,
  singer: SingerRange | null,
): Verdict {
  const fit = rangeFit(demand, singer)
  const unknown: Capability = { value: 0, source: 'desconhecido', sessions: 0 }
  const skills = findings.map((f) => judgeSkill(f.skill, demand, capabilities[f.skill] ?? unknown, fit))
  return { fit, skills }
}
