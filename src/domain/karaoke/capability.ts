// CAPACIDADE DO CANTOR por fundamento, na MESMA escala 0..1 de `SongDemand`.
//
// Existe só para uma pergunta: quando um fundamento falha, a música cobrava mais do
// que você treinou, ou você tem um déficit ali? Sem uma escala comum entre o que a
// música pede e o que você aguenta, essa pergunta não tem resposta — e o app cairia
// no vício que o plano inteiro tenta evitar: acusar você de desafinar numa faixa que
// simplesmente está fora do seu alcance.
//
// Duas naturezas de capacidade convivem aqui, e a diferença entre elas é reportada,
// nunca apagada:
//   • MEDIDO — sai de uma medição física do cantor (a extensão, do teste de range);
//   • HISTÓRICO — sai do desempenho recente em exercícios que treinam a skill.
// Histórico é inferência, não medição: acertar 90% em exercícios de nível 2 não prova
// que você aguenta uma música exigente. É por isso que `source` viaja junto do número
// até a tela, e é por isso que `desconhecido` NUNCA vira 0 — ausência de dado não é
// incompetência, e tratar como se fosse acusaria todo usuário novo de tudo.
//
// TS puro, sem DOM.

import type { SkillId, TrackLevel } from '../../data/types'
import { DEMAND_ANCHORS } from './demand'

/** Abaixo disto o histórico é anedota, não tendência. */
export const MIN_SESSIONS = 3

/**
 * ÂNCORA DE DIFICULDADE — escolha, não medição, no mesmo espírito de `DEMAND_ANCHORS`.
 *
 * Traduz o nível da TRILHA (a dificuldade dos exercícios que você vem fazendo) para
 * a escala 0..1. Repare que o nível usado aqui é o `TrackLevel`, e não o nível de XP
 * de `SkillProgress.level`: aquele é derivado do XP acumulado, não tem teto, e mede
 * VOLUME de prática, não dificuldade. Duas mil repetições de um exercício de
 * iniciante levam o nível de XP às alturas sem provar nada sobre capacidade — usar
 * aquele número aqui inflaria a capacidade de quem só pratica o fácil, que é
 * exatamente o cantor que o veredito precisa não superestimar.
 *
 * Nenhum nível chega a 1,0: a trilha avançada do app não é o teto do canto.
 */
export const TRACK_DIFFICULTY: Readonly<Record<TrackLevel, number>> = {
  iniciante: 0.3,
  intermediario: 0.6,
  avancado: 0.85,
}

/**
 * Peso do acerto dentro do nível. Com 0,5, alguém que treina no avançado mas acerta
 * metade fica em 0,75 do que o nível sozinho sugeriria — o nível diz ONDE você
 * treina, o acerto diz se você está segurando aquilo. Só o nível superestimaria
 * qualquer um que subiu de trilha e está apanhando lá em cima.
 */
const ACCURACY_WEIGHT = 0.5

export type CapabilitySource = 'medido' | 'historico' | 'desconhecido'

export interface SkillHistory {
  /** acerto médio recente nas sessões que treinaram a skill, 0..1 */
  accuracy: number
  /** nível da trilha em que esse acerto foi conseguido */
  level: TrackLevel
  /** quantas sessões entraram na conta */
  sessions: number
}

export interface CapabilityInput {
  /** extensão medida do cantor (MIDI), do baseline; null se ele nunca fez o teste */
  range: { lowMidi: number; highMidi: number } | null
  history: Partial<Record<SkillId, SkillHistory>>
}

export interface Capability {
  /** 0..1 na mesma escala de SongDemand; só tem sentido quando `source !== 'desconhecido'` */
  value: number
  source: CapabilitySource
  sessions: number
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

const norm = (v: number, [lo, hi]: readonly [number, number]): number =>
  hi === lo ? 0 : clamp01((v - lo) / (hi - lo))

/**
 * Capacidade numa skill.
 *
 * `extensao` é a única com medição direta: a extensão do cantor em semitons passa
 * pela MESMA âncora que normaliza a extensão da música, então os dois números
 * significam a mesma coisa e podem ser comparados sem conversão.
 *
 * Atenção ao que este eixo NÃO responde: ele mede QUANTO você abrange, não ONDE.
 * Uma música de 10 semitons inteiramente acima do seu agudo tem exigência de extensão
 * baixa e ainda assim é impossível para você. Essa outra pergunta é do `verdict.ts`,
 * que compara as alturas absolutas — confundir as duas é exatamente o erro que faria
 * o app mandar você "treinar extensão" quando a solução é transpor.
 *
 * Nas outras seis, o nível da trilha é GLOBAL — o app não guarda "em que nível você
 * treinou respiração" separado de "em que nível treinou vibrato". Então o que
 * diferencia uma skill da outra aqui é só o acerto recente. É pouco, e é honesto:
 * inventar uma dificuldade por skill a partir do XP daria a impressão de uma precisão
 * que o dado não tem.
 */
export function estimateCapability(skill: SkillId, input: CapabilityInput): Capability {
  if (skill === 'extensao') {
    if (!input.range) return { value: 0, source: 'desconhecido', sessions: 0 }
    const semitones = input.range.highMidi - input.range.lowMidi
    return {
      value: norm(semitones, DEMAND_ANCHORS.extensao),
      source: 'medido',
      sessions: 0,
    }
  }

  const h = input.history[skill]
  if (!h || h.sessions < MIN_SESSIONS) {
    return { value: 0, source: 'desconhecido', sessions: h?.sessions ?? 0 }
  }

  const levelPart = TRACK_DIFFICULTY[h.level]
  const value = clamp01(levelPart * (1 - ACCURACY_WEIGHT + ACCURACY_WEIGHT * clamp01(h.accuracy)))
  return { value, source: 'historico', sessions: h.sessions }
}

/** Todas as skills de uma vez — conveniência para o veredito e para a tela. */
export function estimateAllCapabilities(
  skills: readonly SkillId[],
  input: CapabilityInput,
): Record<string, Capability> {
  const out: Record<string, Capability> = {}
  for (const s of skills) out[s] = estimateCapability(s, input)
  return out
}
