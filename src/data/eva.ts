// Serviço cliente da EVA — chama o backend NestJS (/api/eva/chat), que guarda a
// chave do EVA Hub (server-side, nunca no bundle) e é autenticado + rate-limited.
// A EVA recebe SÓ os números do DSP (feature-JSON) — nunca áudio.
import { Profile, VocalBaseline, FeatureReport } from './types'
import { midiLabel } from '../audio/notes'
import { API_URL, authHeaders, tryRefresh } from './api'

export interface EvaMessage {
  role: 'user' | 'assistant'
  content: string
}

/** POST /eva/chat no backend com Bearer; em 401 tenta refresh UMA vez e repete. */
async function evaFetch(body: unknown): Promise<Response> {
  const send = (): Promise<Response> =>
    fetch(`${API_URL}/eva/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
  let res = await send()
  if (res.status === 401 && (await tryRefresh())) res = await send()
  return res
}

/** Chama a persona EVA (sem streaming). Lança erro se não configurada / falha. */
export async function askEva(messages: EvaMessage[]): Promise<string> {
  const res = await evaFetch({ messages, stream: false })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`EVA ${res.status}: ${t.slice(0, 200)}`)
  }
  const data = await res.json()
  const content = data?.message?.content
  if (typeof content !== 'string' || !content.trim()) throw new Error('resposta EVA vazia/ inválida')
  return content
}

/**
 * Chama a EVA em STREAMING (SSE). Chama `onDelta` com o texto ACUMULADO a cada
 * pedaço; resolve com o texto final. Lança se não configurada / falha / vazio.
 */
export async function askEvaStream(messages: EvaMessage[], onDelta: (full: string) => void): Promise<string> {
  const res = await evaFetch({ messages, stream: true })
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => '')
    throw new Error(`EVA ${res.status}: ${t.slice(0, 200)}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''
  // percorre linhas SSE "data: {...}" (formato OpenAI); [DONE] encerra
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const s = line.trim()
      if (!s.startsWith('data:')) continue
      const payload = s.slice(5).trim()
      if (payload === '[DONE]') continue
      try {
        const obj = JSON.parse(payload)
        const delta =
          obj?.choices?.[0]?.delta?.content ??
          obj?.choices?.[0]?.message?.content ??
          obj?.message?.content ??
          obj?.delta ??
          ''
        if (delta) {
          full += delta
          onDelta(full)
        }
      } catch {
        /* linha de keep-alive / parcial — ignora */
      }
    }
  }
  if (!full.trim()) throw new Error('stream EVA vazio')
  return full
}

/**
 * Monta o bloco de contexto do aluno (perfil + range + última sessão resumida)
 * que a persona lê no início da conversa. Omite a pitchTimeline (grande demais).
 */
export function buildStudentContext(profile: Profile, baseline: VocalBaseline | null, lastReport?: FeatureReport): string {
  const ctx: Record<string, unknown> = {
    nome: profile.name || null,
    objetivo: profile.goal || null,
    range: baseline ? `${midiLabel(baseline.lowMidi)}–${midiLabel(baseline.highMidi)}` : null,
    tipo_vocal: baseline?.voiceType ?? null,
    passaggio_incluiu_falsete: baseline?.includesFalsetto ?? null,
  }
  if (lastReport) {
    const p = lastReport.performance
    ctx.ultima_sessao = {
      exercicio: lastReport.exercise?.type ?? 'pratica_livre',
      duracao_s: lastReport.durationSec,
      notas_acertadas_pct: p.notesHitPct,
      desvio_medio_cents: p.avgCentsDeviation,
      voz_detectada_pct: p.voicedPct,
      estabilidade: p.stability,
      vibrato: p.vibrato,
      tempo_em_registro_pct: p.registerTime,
      quebras_de_registro: p.events.filter((e) => e.type === 'register_break').length,
      eventos: p.events,
    }
  }
  return JSON.stringify(ctx)
}

/** Primeira mensagem (usuário) que dá o contexto + pede a análise de abertura. */
export function openingUserMessage(context: string): EvaMessage {
  return {
    role: 'user',
    content: `[DADOS_DO_ALUNO]\n${context}\n[/DADOS_DO_ALUNO]\n\nAnalise minha última sessão (se houver dados) e me dê o próximo passo. Seja breve, caloroso e direto.`,
  }
}

/** Intenções que o aluno pode escolher no seletor antes de falar com a EVA. */
export type EvaIntent = 'analisar' | 'musica' | 'plano' | 'duvida' | 'fraqueza'

/**
 * Monta a mensagem-primer do usuário (role:'user') específica de cada intenção,
 * sempre embutindo o bloco [DADOS_DO_ALUNO]. `extra` é usado por 'musica' (nome
 * da música) e 'duvida' (a pergunta digitada). Nada é chamado até isto ser usado.
 */
export function intentMessage(intent: EvaIntent, context: string, extra?: string): EvaMessage {
  const bloco = `[DADOS_DO_ALUNO]\n${context}\n[/DADOS_DO_ALUNO]`
  switch (intent) {
    case 'analisar':
      // Equivalente ao opener atual — delega pra manter um único texto de verdade.
      return openingUserMessage(context)
    case 'musica':
      return {
        role: 'user',
        content: `${bloco}\n\nQuero aprender a cantar "${extra ?? ''}". Com base no meu range/tipo vocal, me diga tom sugerido, trechos que vão exigir da minha passagem/agudos e um plano de estudo.`,
      }
    case 'plano':
      return {
        role: 'user',
        content: `${bloco}\n\nMonte um plano de treino pra mim pros próximos dias, baseado no meu perfil e última sessão.`,
      }
    case 'duvida':
      return {
        role: 'user',
        content: `${bloco}\n\n${extra ?? ''}`,
      }
    case 'fraqueza':
      return {
        role: 'user',
        content: `${bloco}\n\nQual é o meu ponto mais fraco agora e como eu ataco isso? Use os dados da minha última sessão.`,
      }
  }
}
