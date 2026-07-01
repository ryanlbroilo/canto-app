import {
  AdaptiveRecommendation,
  FeatureReport,
  SessionRecord,
  SkillProgress,
  VocalBaseline,
} from './types'
import { getExercise } from './exercises'
import { nextInTrack, trackForLevel } from './tracks'

// O ROTEADOR ADAPTATIVO — o coração do "trilhar pela quebra / passaggio".
// Ancorado no FeatureReport da última sessão, decide o próximo exercício em
// ordem de prioridade pedagógica. Cada regra devolve um `reason` caloroso e
// ESPECÍFICO (cita os números que motivaram) e um `tag` curto.
//
// A ordem importa: problemas de segurança/registro vêm antes de fundamentos,
// que vêm antes de refinamento, que vem antes de "evoluir na trilha".

interface RecommendArgs {
  lastReport?: FeatureReport
  sessions: SessionRecord[]
  skills: SkillProgress[]
  baseline: VocalBaseline | null
  completedIds: Set<string>
}

/** Nível de trilha sugerido a partir da extensão medida (heurística simples). */
function levelFromContext(args: RecommendArgs): 'iniciante' | 'intermediario' | 'avancado' {
  const done = args.completedIds.size
  if (done >= 12) return 'avancado'
  if (done >= 5) return 'intermediario'
  return 'iniciante'
}

function rec(exerciseId: string, reason: string, tag: string): AdaptiveRecommendation | null {
  // só recomenda se o exercício existe (protege contra ids trocados)
  return getExercise(exerciseId) ? { exerciseId, reason, tag } : null
}

export function recommendNext(args: RecommendArgs): AdaptiveRecommendation | null {
  const r = args.lastReport

  // (0) Sem relatório ainda → começar pela trilha iniciante.
  if (!r) {
    const first = trackForLevel('iniciante').exerciseIds[0]
    return rec(
      first,
      'Vamos começar pelo começo: respiração e apoio, a base que sustenta toda a afinação depois.',
      'começar',
    )
  }

  const p = r.performance
  const breaks = p.events.filter((e) => e.type === 'register_break').length

  // (1) Duas ou mais quebras de registro → treinar o passaggio.
  if (breaks >= 2) {
    return rec(
      'transicao',
      `Notei ${breaks} quebras de registro nessa sessão. Bora alisar a passagem: sirenes largas cruzando a sua zona, sem cortes.`,
      'passaggio',
    )
  }

  // (2) Afinação fraca (desvio alto OU acerto baixo) → voltar ao fundamento.
  if (p.avgCentsDeviation > 40 || p.notesHitPct < 50) {
    if (p.avgCentsDeviation > 40 && p.notesHitPct < 50) {
      return rec(
        'escala-maior',
        `O desvio médio ficou em ${Math.round(p.avgCentsDeviation)} cents e só ${Math.round(
          p.notesHitPct,
        )}% das notas caíram na zona. Vamos calibrar o ouvido numa escala maior, sem pressa.`,
        'afinação',
      )
    }
    if (p.avgCentsDeviation > 40) {
      return rec(
        'escala-maior',
        `Seu desvio médio foi de ${Math.round(
          p.avgCentsDeviation,
        )} cents — dá pra centrar melhor. Uma escala maior devagar ajuda a cravar cada grau.`,
        'afinação',
      )
    }
    return rec(
      'respiracao',
      `Só ${Math.round(
        p.notesHitPct,
      )}% das notas na zona — muitas vezes é falta de apoio. Vamos firmar a respiração antes de voltar às notas.`,
      'afinação',
    )
  }

  // (3) Muito tempo em falsete → puxar de volta pro peito/mix.
  const rt = p.registerTime
  const totalReg = rt.peito + rt.mix + rt.cabeca + rt.falsete
  if (totalReg > 0 && rt.falsete / totalReg > 0.5) {
    const pct = Math.round((rt.falsete / totalReg) * 100)
    return rec(
      'oitava',
      `Você passou ${pct}% do tempo em falsete. Vamos ancorar peito e mix com saltos de oitava, pra fortalecer a voz plena.`,
      'registro',
    )
  }

  // (4) Sustentou bem, mas sem vibrato onde era esperado → trabalhar sustentação.
  if (p.voicedPct >= 60 && p.vibrato.present === false) {
    return rec(
      'sustentacao',
      'Sua sustentação está firme, mas o vibrato ainda não apareceu. Na messa di voce, relaxe a garganta perto do fim e deixe a nota oscilar sozinha.',
      'vibrato',
    )
  }

  // (5) Indo muito bem (acerto alto e nenhuma quebra) → evoluir na trilha.
  if (p.notesHitPct >= 85 && breaks === 0) {
    const level = levelFromContext(args)
    const next = nextInTrack(level, args.completedIds)
    if (next) {
      return rec(
        next,
        `Sessão afiada: ${Math.round(
          p.notesHitPct,
        )}% de acerto e zero quebras. Você está pronto pro próximo passo da trilha.`,
        'evoluir',
      )
    }
    // trilha do nível dominada → tenta subir de nível
    const nextLevel =
      level === 'iniciante' ? 'intermediario' : level === 'intermediario' ? 'avancado' : null
    if (nextLevel) {
      const up = nextInTrack(nextLevel, args.completedIds) ?? trackForLevel(nextLevel).exerciseIds[0]
      return rec(
        up,
        `Você dominou a trilha ${level}. Hora de subir de nível — este é o primeiro desafio do próximo estágio.`,
        'evoluir',
      )
    }
  }

  // (6) Fallback neutro: continuar a trilha do nível apropriado.
  const level = levelFromContext(args)
  const next = nextInTrack(level, args.completedIds) ?? trackForLevel(level).exerciseIds[0]
  return rec(
    next,
    'Bom treino. Vamos seguir firmes no próximo passo da sua trilha.',
    'continuar',
  )
}
