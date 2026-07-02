import {
  AdaptiveRecommendation,
  FeatureReport,
  SessionRecord,
  SkillProgress,
  TrackLevel,
  VocalBaseline,
} from './types'
import { getExercise, pickExercise, PickCriteria } from './exercises'
import { nextInTrack, trackForLevel } from './tracks'
import { unitForExercise } from './curriculum'
import { dueForReview } from './review'

// O ROTEADOR ADAPTATIVO — o coração do "trilhar pela quebra / passaggio".
// Ancorado no FeatureReport da última sessão, decide o próximo exercício em
// ordem de prioridade pedagógica. Cada regra devolve um `reason` caloroso e
// ESPECÍFICO (cita os números que motivaram) e um `tag` curto.
//
// A ordem importa: problemas de segurança/registro vêm antes de fundamentos,
// que vêm antes de refinamento, que vem antes de "evoluir na trilha".
//
// As âncoras NÃO são ids fixos: escolhemos o exercício por skill/kind/nível
// (pickExercise), então continua funcionando com a biblioteca de ~300.

interface RecommendArgs {
  lastReport?: FeatureReport
  sessions: SessionRecord[]
  skills: SkillProgress[]
  baseline: VocalBaseline | null
  completedIds: Set<string>
  /** melhor pontuação + contagem por exercício (para revisão espaçada) */
  exercisesDone?: Record<string, { count: number; bestScore: number }>
}

/** Acrescenta o nome da unidade ao motivo, quando o exercício está no path. */
function withUnit(id: string, reason: string): string {
  const u = unitForExercise(id)
  return u ? `${reason} (unidade “${u.title}”)` : reason
}

/** Nível de trilha sugerido a partir do progresso (heurística simples). */
function levelFromContext(args: RecommendArgs): TrackLevel {
  const done = args.completedIds.size
  if (done >= 12) return 'avancado'
  if (done >= 5) return 'intermediario'
  return 'iniciante'
}

function rec(exerciseId: string, reason: string, tag: string): AdaptiveRecommendation | null {
  // só recomenda se o exercício existe (protege contra ids trocados)
  return getExercise(exerciseId) ? { exerciseId, reason, tag } : null
}

/**
 * Recomendação por CRITÉRIO (skill/kind/nível). Escolhe o melhor exercício da
 * biblioteca; se nada casar, cai no próximo passo da trilha do nível.
 */
function recPick(
  crit: PickCriteria,
  level: TrackLevel,
  completedIds: Set<string>,
  reason: string,
  tag: string,
): AdaptiveRecommendation | null {
  const ex = pickExercise(crit)
  const id = ex?.id ?? nextInTrack(level, completedIds) ?? trackForLevel(level).exerciseIds[0]
  return rec(id, reason, tag)
}

export function recommendNext(args: RecommendArgs): AdaptiveRecommendation | null {
  const r = args.lastReport
  const level = levelFromContext(args)

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
    return recPick(
      { kind: 'siren', skills: ['passaggio'], level },
      level,
      args.completedIds,
      `Notei ${breaks} quebras de registro nessa sessão. Bora alisar a passagem: sirenes largas cruzando a sua zona, sem cortes.`,
      'passaggio',
    )
  }

  // (2) Afinação fraca (desvio alto OU acerto baixo) → voltar ao fundamento.
  if (p.avgCentsDeviation > 40 || p.notesHitPct < 50) {
    if (p.avgCentsDeviation > 40 && p.notesHitPct < 50) {
      return recPick(
        { kind: 'scale', skills: ['afinacao'], level },
        level,
        args.completedIds,
        `O desvio médio ficou em ${Math.round(p.avgCentsDeviation)} cents e só ${Math.round(
          p.notesHitPct,
        )}% das notas caíram na zona. Vamos calibrar o ouvido numa escala maior, sem pressa.`,
        'afinação',
      )
    }
    if (p.avgCentsDeviation > 40) {
      return recPick(
        { kind: 'scale', skills: ['afinacao'], level },
        level,
        args.completedIds,
        `Seu desvio médio foi de ${Math.round(
          p.avgCentsDeviation,
        )} cents — dá pra centrar melhor. Uma escala maior devagar ajuda a cravar cada grau.`,
        'afinação',
      )
    }
    return recPick(
      { kind: 'breathing', skills: ['respiracao'], level },
      level,
      args.completedIds,
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
    return recPick(
      { kind: 'interval', skills: ['extensao', 'passaggio'], level },
      level,
      args.completedIds,
      `Você passou ${pct}% do tempo em falsete. Vamos ancorar peito e mix com saltos de oitava, pra fortalecer a voz plena.`,
      'registro',
    )
  }

  // (4) Sustentou bem, mas sem vibrato onde era esperado → trabalhar sustentação.
  if (p.voicedPct >= 60 && p.vibrato.present === false) {
    return recPick(
      { kind: 'sustain', skills: ['vibrato', 'sustentacao'], level },
      level,
      args.completedIds,
      'Sua sustentação está firme, mas o vibrato ainda não apareceu. Na messa di voce, relaxe a garganta perto do fim e deixe a nota oscilar sozinha.',
      'vibrato',
    )
  }

  // (5) Indo muito bem (acerto alto e nenhuma quebra) → evoluir na trilha.
  if (p.notesHitPct >= 85 && breaks === 0) {
    const next = nextInTrack(level, args.completedIds)
    if (next) {
      return rec(
        next,
        withUnit(
          next,
          `Sessão afiada: ${Math.round(p.notesHitPct)}% de acerto e zero quebras. Você está pronto pro próximo passo do caminho.`,
        ),
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

  // (5.5) Repetição espaçada: NÃO estamos em "avançar agora" (rule 5 não disparou),
  // mas há um exercício já aprendido "esquecido" há vários dias → nudge de revisar.
  // Fica DEPOIS da progressão de propósito: quem está arrasando avança; a revisão
  // é manutenção quando o passo não é claramente "seguir em frente".
  const due = args.exercisesDone ? dueForReview(args.sessions, args.exercisesDone) : []
  const stale = due.find((d) => d.daysSince >= 5)
  const staleEx = stale ? getExercise(stale.id) : undefined
  if (stale && staleEx) {
    return rec(
      stale.id,
      withUnit(
        stale.id,
        `Faz ${Math.round(stale.daysSince)} dias que você não treina “${staleEx.name}”. Uma revisão rápida fixa o que já aprendeu.`,
      ),
      'revisão',
    )
  }

  // (6) Fallback neutro: continuar o caminho do nível apropriado.
  const next = nextInTrack(level, args.completedIds) ?? trackForLevel(level).exerciseIds[0]
  return rec(
    next,
    withUnit(next, 'Bom treino. Vamos seguir firmes no próximo passo do seu caminho.'),
    'continuar',
  )
}
