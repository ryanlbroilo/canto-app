import { Exercise, FeatureReport, SkillId } from './types'

// MOTOR DE DIAGNÓSTICO — o "EVA que explica". Lê o feature-JSON do DSP (os
// MESMOS números que a EVA vê) e devolve um diagnóstico determinístico:
// o QUÊ aconteceu (com números), o PORQUÊ (a causa técnica) e o COMO resolver
// (uma dica acionável). É a resposta à queixa nº1 do mercado — "detecta pitch,
// não ensina". Puro e testável; a EVA (LLM) fala por cima disto, nunca no lugar.
//
// Base pedagógica: direção do desvio (abaixo=falta de apoio / acima=tensão),
// SOVT no passaggio (Titze), appoggio na sustentação, vibrato como fenômeno
// relaxado de taxa ~inata (não se "força"), foco de ressonância na máscara.

export interface Insight {
  id: string
  /** peso de prioridade (maior = mostrar primeiro) */
  rank: number
  severity: 'alta' | 'média' | 'leve'
  skill: SkillId
  /** observação concreta, com os números */
  what: string
  /** a causa técnica provável */
  why: string
  /** o que fazer na próxima — dica acionável */
  cue: string
}

export interface Diagnosis {
  tone: 'great' | 'good' | 'work'
  /** frase-resumo calorosa (1 linha) */
  headline: string
  /** 1–2 pontos fortes (a pedagogia pede reforço antes da correção) */
  strengths: string[]
  /** correções priorizadas (top 3) */
  insights: Insight[]
}

interface CentsStats {
  mean: number
  spread: number
  n: number
}

function centsStats(timeline: { centsOff: number }[]): CentsStats {
  const xs = timeline.map((p) => p.centsOff).filter((c) => Number.isFinite(c))
  if (xs.length === 0) return { mean: 0, spread: 0, n: 0 }
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const spread = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length)
  return { mean, spread, n: xs.length }
}

/** Diagnóstico completo de uma sessão de exercício. */
export function diagnose(report: FeatureReport | undefined, ex: Exercise, score: number | null): Diagnosis {
  const strengths: string[] = []
  const insights: Insight[] = []

  if (!report) {
    // respiração / sem áudio analisado → só reforço.
    return {
      tone: 'good',
      headline: 'Respiração é o alicerce — apoio firme deixa afinação e sustentação mais estáveis.',
      strengths: ['Você foi até o fim — constância é o que constrói voz.'],
      insights: [],
    }
  }

  const p = report.performance
  const hit = p.notesHitPct
  const dev = p.avgCentsDeviation
  const breaks = p.events.filter((e) => e.type === 'register_break')
  const cracks = p.events.filter((e) => e.type === 'pitch_crack').length
  const rt = p.registerTime
  const totalReg = rt.peito + rt.mix + rt.cabeca + rt.falsete
  const cs = centsStats(p.pitchTimeline)
  const isSustain = ex.kind === 'sustain' || (ex.holdSec ?? 0) >= 3

  // ---------- PONTOS FORTES (sempre pelo menos 1) ----------
  if (hit >= 80) strengths.push(`${Math.round(hit)}% das notas na zona — afinação sólida.`)
  if (dev > 0 && dev <= 20) strengths.push(`Desvio médio de só ${Math.round(dev)}¢ — bem centrado.`)
  if (p.vibrato.present && p.vibrato.rateHz >= 4.5 && p.vibrato.rateHz <= 7)
    strengths.push(`Vibrato natural de ${p.vibrato.rateHz} Hz — taxa saudável.`)
  if (breaks.length === 0 && (ex.skills.includes('passaggio') || ex.kind === 'siren'))
    strengths.push('Zero quebras — você atravessou a passagem lisinho.')
  if (strengths.length === 0) strengths.push('Você chegou ao fim inteiro — repetir é o que fixa a técnica.')

  // ---------- (1) PASSAGGIO / QUEBRAS (prioridade máxima) ----------
  if (breaks.length >= 1) {
    const where = breaks[0].note ? ` perto de ${breaks[0].note}` : ''
    insights.push({
      id: 'passaggio',
      rank: 100,
      severity: breaks.length >= 2 ? 'alta' : 'média',
      skill: 'passaggio',
      what: `Sua voz quebrou ${breaks.length}×${where}.`,
      why: 'A quebra é o passaggio — a zona onde a voz troca de peito para cabeça e "destrava" se você empurra.',
      cue: 'Atravesse em sirene ou lip trill (SOVT, protege as pregas) e deixe afinar mais leve no agudo, sem levar o peito pra cima.',
    })
  }

  // ---------- (2) AFINAÇÃO — direção do desvio ----------
  if (cs.n >= 4) {
    if (cs.mean <= -12) {
      insights.push({
        id: 'flat',
        rank: 90,
        severity: cs.mean <= -25 ? 'alta' : 'média',
        skill: 'afinacao',
        what: `Você cantou ~${Math.round(-cs.mean)}¢ ABAIXO na maioria das notas.`,
        why: 'Cantar abaixo quase sempre é falta de energia/apoio — a nota "senta" por baixo do alvo.',
        cue: 'Mire um tico acima do alvo e mantenha o ar constante, como se empurrasse a nota de baixo com o apoio.',
      })
    } else if (cs.mean >= 12) {
      insights.push({
        id: 'sharp',
        rank: 90,
        severity: cs.mean >= 25 ? 'alta' : 'média',
        skill: 'afinacao',
        what: `Você cantou ~${Math.round(cs.mean)}¢ ACIMA na maioria das notas.`,
        why: 'Cantar acima costuma ser tensão ou "empurrar" — a laringe sobe e aperta.',
        cue: 'Relaxe a mandíbula e a língua e pense em pousar a nota por cima, com menos força e mais fluxo.',
      })
    } else if (cs.spread >= 35) {
      insights.push({
        id: 'unstable-pitch',
        rank: 80,
        severity: cs.spread >= 55 ? 'alta' : 'média',
        skill: 'afinacao',
        what: `Sua mira está boa, mas cada nota oscilou ~±${Math.round(cs.spread)}¢.`,
        why: 'Oscilação assim é apoio irregular — a nota não "assenta" no centro.',
        cue: 'Chegue na nota e segure o centro mais tempo antes de mover; deixe a linha ficar reta na barra.',
      })
    }
  } else if (hit < 55 && dev > 40) {
    insights.push({
      id: 'tuning-generic',
      rank: 80,
      severity: 'média',
      skill: 'afinacao',
      what: `Só ${Math.round(hit)}% na zona e desvio de ${Math.round(dev)}¢.`,
      why: 'Muitas vezes é o ouvido ainda calibrando + apoio inconstante.',
      cue: 'Vá mais devagar: cante uma escala curta ouvindo cada nota "encaixar" antes de subir.',
    })
  }

  // ---------- (3) SUSTENTAÇÃO / APOIO ----------
  if (isSustain && (p.stability.clarity < 0.6 || p.stability.jitter > 0.02)) {
    insights.push({
      id: 'support',
      rank: 70,
      severity: p.stability.clarity < 0.45 ? 'alta' : 'média',
      skill: 'sustentacao',
      what: 'A linha tremeu ou ficou instável nas notas longas.',
      why: 'Tremor no fim da nota é o ar acabando sem apoio por baixo.',
      cue: 'Mantenha as costelas abertas (appoggio) e guarde ar pro final — não desabe o peito no fim.',
    })
  }

  // ---------- (4) VIBRATO ----------
  if (isSustain && p.voicedPct >= 60 && p.vibrato.present === false) {
    insights.push({
      id: 'vibrato-absent',
      rank: 40,
      severity: 'leve',
      skill: 'vibrato',
      what: 'A nota ficou reta — o vibrato não apareceu.',
      why: 'Vibrato nasce do relaxamento, não do esforço; e a taxa é quase inata (~5,5 Hz) — não se "faz na força".',
      cue: 'Na messa di voce, relaxe a garganta perto do fim e deixe a nota oscilar sozinha.',
    })
  } else if (p.vibrato.present && (p.vibrato.rateHz < 4.5 || p.vibrato.rateHz > 7)) {
    insights.push({
      id: 'vibrato-rate',
      rank: 35,
      severity: 'leve',
      skill: 'vibrato',
      what: `Vibrato a ${p.vibrato.rateHz} Hz — ${p.vibrato.rateHz > 7 ? 'rápido (tremido)' : 'lento (oscilante)'}.`,
      why: 'O ideal estético fica ~5–6 Hz; taxa fora disso costuma vir de tensão ou pouco apoio.',
      cue: 'Sustente relaxado e deixe o vibrato encontrar o próprio pulso — não acelere nem segure de propósito.',
    })
  }

  // ---------- (5) REGISTRO / FALSETE ----------
  if (totalReg > 0 && rt.falsete / totalReg > 0.5 && !ex.skills.includes('vibrato')) {
    insights.push({
      id: 'falsetto-heavy',
      rank: 50,
      severity: 'média',
      skill: 'extensao',
      what: `Você passou ${Math.round((rt.falsete / totalReg) * 100)}% do tempo em falsete.`,
      why: 'Muito falsete tira corpo e projeção — falta ancorar peito/mix.',
      cue: 'Pense em "falar cantado", mais fundo e conectado; ancore o peito antes de soltar o agudo.',
    })
  }

  // ---------- (6) RESSONÂNCIA ----------
  if (!isSustain && p.stability.clarity < 0.55 && insights.length < 3) {
    insights.push({
      id: 'resonance',
      rank: 30,
      severity: 'leve',
      skill: 'ressonancia',
      what: 'O som saiu meio soprado/difuso.',
      why: 'Falta foco de ressonância — a voz está espalhada em vez de projetada.',
      cue: 'Ache o zumbido na "máscara" (mmm no rosto) e leve essa vibração pra dentro da vogal.',
    })
  }

  // ---------- ONSET (cracks) ----------
  if (cracks >= 2 && insights.length < 3) {
    insights.push({
      id: 'onset',
      rank: 25,
      severity: 'leve',
      skill: 'respiracao',
      what: `Notei ${cracks} falhas de emissão (a voz "engasgou" no ataque).`,
      why: 'Ataque instável é ar e som chegando fora de sincronia.',
      cue: 'Comece a nota com um "ha" suave apoiado — o ar já fluindo quando o som nasce.',
    })
  }

  insights.sort((a, b) => b.rank - a.rank)
  const top = insights.slice(0, 3)

  // ---------- HEADLINE + TOM ----------
  const s = score ?? hit
  let tone: Diagnosis['tone']
  let headline: string
  if (top.length === 0 && s >= 80) {
    tone = 'great'
    headline = 'Sessão afiada — nada urgente a corrigir. Bora subir a dificuldade.'
  } else if (s >= 80) {
    tone = 'great'
    headline = 'Mandou muito bem — só um ajuste fino pra ficar redondo.'
  } else if (s >= 55) {
    tone = 'good'
    headline = top[0] ? `Bom treino. O ponto que mais te destrava agora: ${firstClause(top[0].what)}` : 'Bom treino — consistência acima de tudo.'
  } else {
    tone = 'work'
    headline = top[0] ? `Vamos destravar isto primeiro: ${firstClause(top[0].what)}` : 'Sem pressa — repetir devagar é o caminho.'
  }

  return { tone, headline, strengths: strengths.slice(0, 2), insights: top }
}

function firstClause(s: string): string {
  const t = s.replace(/\.$/, '')
  return t.charAt(0).toLowerCase() + t.slice(1)
}
