import { useEffect, useRef, useState } from 'react'
import { useApp } from '../app/AppContext'
import { Icon } from '../components/ui/Icon'
import { Markdown } from '../components/ui/Markdown'
import { Profile, VocalBaseline, SessionRecord, FeatureReport } from '../data/types'
import { askEvaStream, buildStudentContext, intentMessage, EvaIntent, EvaMessage } from '../data/eva'

interface Msg {
  from: 'eva' | 'me'
  text: string
}

// ---------- Sugestões dinâmicas (chips) ----------
// Antes eram hardcoded; agora derivam do perfil + baseline + última sessão.
function generateSuggestions(profile: Profile, baseline: VocalBaseline | null, lastReport?: FeatureReport): string[] {
  const chips: string[] = []
  if (!lastReport) {
    chips.push('Começar pelo aquecimento')
  } else {
    if (lastReport.performance.notesHitPct < 50) chips.push('Exercício de afinação')
    if (lastReport.performance.events.some((e) => e.type === 'register_break')) chips.push('Trabalhar passaggio')
  }
  // Sempre um chip de técnica pro tipo vocal (fallback pro objetivo/genérico).
  const voice = baseline?.voiceType || profile.goal || 'minha voz'
  chips.push(`Técnica pro ${voice}`)
  // Garante 3-4 chips mesmo quando os condicionais não disparam.
  const extras = ['Como solto os agudos?', 'Um exercício de respiração', 'Por que minha voz quebra?']
  for (const e of extras) {
    if (chips.length >= 4) break
    if (!chips.includes(e)) chips.push(e)
  }
  return chips.slice(0, 4)
}

// ---------- Fallback local (prévia rule-based, grounded no feature-JSON) ----------
function topRegister(rt: { peito: number; mix: number; cabeca: number; falsete: number }): string | null {
  const map: [string, number][] = [
    ['peito', rt.peito],
    ['mix', rt.mix],
    ['cabeça', rt.cabeca],
    ['falsete', rt.falsete],
  ]
  map.sort((a, b) => b[1] - a[1])
  return map[0][1] > 40 ? map[0][0] : null
}

function firstMessage(last: SessionRecord | undefined, name: string): string {
  const oi = name ? `Oi, ${name.split(' ')[0]}!` : 'Oi!'
  if (!last) return `${oi} Eu sou a EVA, sua coach vocal. Assim que você treinar, eu analiso sua afinação (nota por nota, desvio em cents, estabilidade) e monto seu próximo passo. Bora começar por um aquecimento?`
  const hit = Math.round(last.notesHitPct)
  const dev = Math.round(last.avgCentsDev)
  const verdict = hit >= 75 ? 'Muito bom — afinação sólida.' : hit >= 50 ? 'Tá no caminho.' : 'Vamos com calma, o foco agora é chegar na nota e segurar.'
  let extra = ''
  const r = last.featureReport
  if (r) {
    const p = r.performance
    const bits: string[] = []
    if (p.vibrato.present) bits.push(`um vibrato de ${p.vibrato.rateHz} Hz (~${p.vibrato.extentCents}¢)`)
    const reg = topRegister(p.registerTime)
    if (reg) bits.push(`a maior parte cantada em ${reg}`)
    if (p.events.length > 0) bits.push(`${p.events.length} quebra${p.events.length > 1 ? 's' : ''} de registro`)
    if (bits.length) extra = ` Também notei ${bits.join(', ')}.`
  }
  return `${oi} Vi sua última sessão (**${last.label}**): você acertou **${hit}%** das notas, desvio médio de **${dev}¢**.${extra}\n\n${verdict} Quer que eu sugira o próximo exercício?`
}

function replyLocal(input: string, last: SessionRecord | undefined): string {
  const t = input.toLowerCase()
  if (/agud|alto|topo|nota alta/.test(t))
    return 'Pros agudos, nada de empurrar com a garganta. Faça sirenes leves cruzando sua passagem e deixe a laringe estável. Se travar sempre no mesmo ponto, esse é seu passaggio — a gente trabalha a transição pra head voice.'
  if (/grave|baixo/.test(t)) return 'No grave, relaxe a mandíbula e não pressione. O grave conectado vem do apoio, não da força. Vamos medir seu grave confortável no teste de range.'
  if (/respir|ar|fôlego|folego/.test(t)) return 'Respiração é a base: inspire pelo diafragma, sem levantar os ombros, e controle a saída de ar. Faça o exercício de respiração antes de cada treino — a afinação melhora junto.'
  if (/vibrato/.test(t)) {
    const v = last?.featureReport?.performance.vibrato
    if (v?.present) return `Na sua última sessão medi um vibrato de ${v.rateHz} Hz com extensão de ~${v.extentCents}¢. A faixa saudável costuma ser 5–7 Hz — o seu ${v.rateHz >= 5 && v.rateHz <= 7 ? 'está numa boa taxa' : 'pode ficar mais regular'}. Vibrato bom nasce de laringe estável + apoio.`
    return 'Vibrato é uma oscilação natural (5–7 Hz) que aparece com relaxamento e apoio, não forçando. Sustente notas longas e estáveis primeiro; o vibrato vem.'
  }
  if (/quebr|passag|registro|falsete|mix|peito|cabeça|cabeca/.test(t)) {
    const r = last?.featureReport
    if (r && r.performance.events.length > 0) {
      const e = r.performance.events[0]
      return `Detectei uma quebra na sua última sessão (${e.from ?? '?'} → ${e.to ?? '?'} perto de ${e.note ?? ''}). Isso é o passaggio — sirenes suaves cruzando essa região, sem forçar, ajudam a atravessar sem solavanco e a desenvolver o mix.`
    }
    return 'A "quebra" é a transição entre registros (peito → cabeça). Não é defeito — é onde a técnica entra. Sirenes suaves e o exercício de transição ajudam a atravessar sem solavanco.'
  }
  if (/desafin|afin|erro|errado/.test(t))
    return last
      ? `Na sua última sessão o desvio médio foi ${Math.round(last.avgCentsDev)}¢. O segredo é ouvir e ajustar DURANTE a nota, não depois. Treine com o feedback ligado e depois tente de olhos fechados.`
      : 'Menos de 5% das pessoas têm desafinação real de nascença. O resto é treino: a conexão ouvido-laringe melhora rápido com prática diária.'
  if (/oi|olá|ola|bom dia|boa tarde|boa noite|eva/.test(t)) return 'Oi! Pronta pra treinar. Me conta o que você quer melhorar — agudos, afinação, fôlego, ou a passagem entre registros?'
  return 'Escolhe um foco — agudos, afinação, respiração ou transição de registro — que eu te oriento com base no que o seu DSP mediu.'
}

// Resposta de fallback (evaLive=false) coerente com a intenção escolhida:
// 'analisar'/'plano'/'fraqueza' → panorama da sessão (firstMessage);
// 'musica'/'duvida' → resposta rule-based do texto digitado (replyLocal).
function localReplyForIntent(intent: EvaIntent, extra: string, last: SessionRecord | undefined, name: string): string {
  if (intent === 'musica' || intent === 'duvida') return replyLocal(extra, last)
  return firstMessage(last, name)
}

// ---------- Definição visual dos cards do seletor ----------
interface IntentCard {
  intent: EvaIntent
  icon: 'chart' | 'wave' | 'target' | 'spark' | 'flame'
  title: string
  sub: string
  needsReport?: boolean // desabilita/rotula "treine primeiro" sem lastReport
  asksText?: boolean // pede texto extra (música/dúvida) antes da 1ª chamada
  echo: string // bolha "me" mostrada ao iniciar (intenções sem texto extra)
  placeholder?: string // rótulo do composer quando asksText
}

const INTENT_CARDS: IntentCard[] = [
  { intent: 'analisar', icon: 'chart', title: 'Analisar minha última sessão', sub: 'Panorama da afinação e o próximo passo.', needsReport: true, echo: 'Analisar minha última sessão' },
  { intent: 'musica', icon: 'wave', title: 'Aprender uma música', sub: 'Tom sugerido, trechos difíceis e um plano.', asksText: true, echo: '', placeholder: 'Qual música você quer aprender?' },
  { intent: 'plano', icon: 'target', title: 'Montar meu plano', sub: 'Um roteiro de treino pros próximos dias.', echo: 'Montar meu plano de treino' },
  { intent: 'duvida', icon: 'spark', title: 'Tirar uma dúvida', sub: 'Pergunte qualquer coisa sobre técnica.', asksText: true, echo: '', placeholder: 'Qual sua dúvida?' },
  { intent: 'fraqueza', icon: 'flame', title: 'Meu ponto fraco', sub: 'O que atacar agora, com base nos dados.', needsReport: true, echo: 'Qual é o meu ponto mais fraco?' },
]

// ---------- Página ----------
export default function Coach() {
  const { profile, baseline, sessions } = useApp()
  const last = sessions[sessions.length - 1]
  const lastReport = last?.featureReport

  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaLive, setEvaLive] = useState<boolean | null>(null) // null=conectando (só após escolher)
  const [started, setStarted] = useState(false) // false = mostra o seletor de intenção
  const [intent, setIntent] = useState<EvaIntent | null>(null) // intenção que aguarda texto extra
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const contextRef = useRef(buildStudentContext(profile, baseline, lastReport))
  const historyRef = useRef<EvaMessage[]>([])
  const streamingRef = useRef(false)

  const suggestions = useRef(generateSuggestions(profile, baseline, lastReport)).current

  // Auto-scroll pro fim a cada mensagem/typing (só existe depois que a conversa começa).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, loading])

  // Recebe o texto acumulado: no 1º token cria a bolha (e some o "digitando"),
  // depois vai atualizando a última bolha da EVA.
  function onPartial(full: string) {
    if (!streamingRef.current) {
      streamingRef.current = true
      setLoading(false)
      setMsgs((m) => [...m, { from: 'eva', text: full }])
    } else {
      setMsgs((m) => {
        const c = [...m]
        c[c.length - 1] = { from: 'eva', text: full }
        return c
      })
    }
  }

  // Caminho único de streaming: recebe o histórico já montado (incl. a mensagem
  // do usuário) e o texto usado no fallback rule-based. Preserva evaLive/historyRef.
  // `firstReplyLocal` é a resposta local quando a EVA nem conecta na 1ª chamada.
  async function streamTurn(hist: EvaMessage[], fallbackText: string, firstReplyLocal?: string) {
    setLoading(true)
    streamingRef.current = false
    try {
      const reply = await askEvaStream(hist, onPartial)
      historyRef.current = [...hist, { role: 'assistant', content: reply }]
      setEvaLive(true)
    } catch {
      // Se já tinha começado a streamar, sobrescreve a bolha parcial pelo fallback.
      const text = firstReplyLocal ?? replyLocal(fallbackText, last)
      if (streamingRef.current) {
        setMsgs((m) => {
          const c = [...m]
          c[c.length - 1] = { from: 'eva', text }
          return c
        })
      } else {
        setMsgs((m) => [...m, { from: 'eva', text }])
      }
      // Só rebaixa pra "prévia" na 1ª chamada (quando ainda não sabíamos o status).
      if (firstReplyLocal !== undefined) setEvaLive(false)
    } finally {
      setLoading(false)
      streamingRef.current = false
    }
  }

  // Primeira chamada: dispara a conversa a partir da intenção escolhida.
  // NENHUM token é gasto antes daqui — só ao clicar/enviar no seletor.
  function startConversation(firstMsg: EvaMessage, echoText: string, chosen: EvaIntent, extra: string) {
    setStarted(true)
    setIntent(null)
    if (echoText) setMsgs([{ from: 'me', text: echoText }])
    const firstLocal = localReplyForIntent(chosen, extra, last, profile.name)
    void streamTurn([firstMsg], extra, firstLocal)
  }

  // Clique num card do seletor.
  function chooseIntent(card: IntentCard) {
    if (card.needsReport && !lastReport) return // desabilitado — treine primeiro
    if (card.asksText) {
      // Precisa de texto: revela o composer focado com placeholder específico.
      setIntent(card.intent)
      setStarted(true)
      requestAnimationFrame(() => taRef.current?.focus())
      return
    }
    const msg = intentMessage(card.intent, contextRef.current)
    startConversation(msg, card.echo, card.intent, '')
  }

  function growTextarea() {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 132) + 'px'
  }

  async function sendText(text: string) {
    const t = text.trim()
    if (!t || loading) return
    setInput('')
    requestAnimationFrame(growTextarea)

    // 1ª mensagem de uma intenção que pedia texto extra (música/dúvida).
    if (intent && msgs.length === 0) {
      const chosen = intent
      const firstMsg = intentMessage(chosen, contextRef.current, t)
      startConversation(firstMsg, t, chosen, t)
      return
    }

    // Mensagens seguintes: reutilizam o mesmo caminho de streaming.
    setMsgs((m) => [...m, { from: 'me', text: t }])
    if (evaLive) {
      const hist = [...historyRef.current, { role: 'user', content: t } as EvaMessage]
      void streamTurn(hist, t) // sem firstReplyLocal → mantém evaLive
    } else {
      // Modo prévia: resposta local com um pequeno atraso pra parecer natural.
      setLoading(true)
      setTimeout(() => {
        setMsgs((m) => [...m, { from: 'eva', text: replyLocal(t, last) }])
        setLoading(false)
      }, 420)
    }
  }

  // Chips aparecem só depois de a conversa começar, na abertura, e com EVA ao vivo.
  const showChips = started && msgs.length <= 1 && !loading && evaLive === true

  // Placeholder do composer muda quando estamos aguardando texto de uma intenção.
  const activeCard = intent ? INTENT_CARDS.find((c) => c.intent === intent) : null
  const composerPlaceholder = activeCard?.placeholder ?? 'Pergunte sobre afinação, agudos, respiração, registros…'

  const badge =
    evaLive === true
      ? { cls: 'badge badge--good', icon: 'spark' as const, label: 'EVA ao vivo' }
      : evaLive === false
        ? { cls: 'badge', icon: 'lock' as const, label: 'prévia (configure a EVA)' }
        : { cls: 'badge', icon: 'spark' as const, label: 'conectando…' }

  return (
    <div className="page">
      <div className="page-head">
        <div className="row gap-3">
          <span className="eva-avatar" style={{ width: 44, height: 44, borderRadius: 14 }}>
            <Icon name="spark" size={22} />
          </span>
          <div>
            <h1 className="page-title" style={{ fontSize: 26 }}>
              EVA
            </h1>
            <p className="page-sub" style={{ marginTop: 2 }}>
              Sua coach vocal de IA — entende o que o DSP mede e conversa.
            </p>
          </div>
        </div>
        {started && (
          <span className={badge.cls}>
            <Icon name={badge.icon} size={13} /> {badge.label}
          </span>
        )}
      </div>

      {/* Antes de escolher a intenção não falamos com a IA — só o seletor. */}
      {!started ? (
        <div className="card card--glow intent-panel reveal r0">
          <div className="intent-head">
            <h2 className="intent-title">Com o que a EVA te ajuda hoje?</h2>
            <p className="intent-sub">Escolha um foco — só aí a EVA começa a conversar com você.</p>
          </div>
          <div className="intent-grid">
            {INTENT_CARDS.map((card) => {
              const locked = !!card.needsReport && !lastReport
              return (
                <button key={card.intent} className={`intent-card${locked ? ' intent-card--locked' : ''}`} onClick={() => chooseIntent(card)} disabled={locked}>
                  <span className="intent-card-icon">
                    <Icon name={locked ? 'lock' : card.icon} size={20} />
                  </span>
                  <span className="intent-card-body">
                    <span className="intent-card-title">{card.title}</span>
                    <span className="intent-card-sub">{locked ? 'Treine primeiro para desbloquear' : card.sub}</span>
                  </span>
                  {!locked && (
                    <span className="intent-card-arrow">
                      <Icon name="chevron" size={16} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card card--glow chat reveal r0">
          <div className="chat-scroll" ref={scrollRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`msg msg--${m.from} reveal`}>
                {m.from === 'eva' && (
                  <span className="eva-avatar msg-av">
                    <Icon name="spark" size={15} />
                  </span>
                )}
                <div className="msg-bubble">{m.from === 'eva' ? <Markdown>{m.text}</Markdown> : m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg msg--eva reveal">
                <span className="eva-avatar msg-av">
                  <Icon name="spark" size={15} />
                </span>
                <div className="msg-bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {/* Composer aguardando texto de uma intenção (música/dúvida). */}
          {activeCard && msgs.length === 0 && (
            <div className="intent-prompt">
              <Icon name={activeCard.icon} size={14} /> {activeCard.placeholder}
            </div>
          )}

          {showChips && (
            <div className="chip-row">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => sendText(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input">
            <textarea
              ref={taRef}
              className="chat-textarea"
              rows={1}
              placeholder={composerPlaceholder}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                growTextarea()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendText(input)
                }
              }}
            />
            <button className="btn btn--primary btn--icon chat-send" onClick={() => sendText(input)} aria-label="Enviar" disabled={loading || !input.trim()}>
              <Icon name="send" />
            </button>
          </div>
        </div>
      )}

      <p className="hint" style={{ marginTop: 12 }}>
        {!started
          ? 'Nada é enviado à EVA até você escolher acima — sua voz fica no dispositivo e só as features numéricas do DSP viajam.'
          : evaLive
            ? 'EVA conectada ao EVA Hub. Recebe só as features numéricas do seu DSP — nunca o áudio — e faz o coaching real.'
            : 'Prévia com respostas locais. Configure a EVA (docs/eva-setup.md) para o coaching real via EVA Hub, mantendo sua voz no dispositivo.'}
      </p>
    </div>
  )
}
