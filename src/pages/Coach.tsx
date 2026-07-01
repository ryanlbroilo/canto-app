import { useEffect, useRef, useState } from 'react'
import { useApp } from '../app/AppContext'
import { Icon } from '../components/ui/Icon'
import { Markdown } from '../components/ui/Markdown'
import { SessionRecord } from '../data/types'
import { askEvaStream, buildStudentContext, openingUserMessage, EvaMessage } from '../data/eva'

interface Msg {
  from: 'eva' | 'me'
  text: string
}

const SUGGESTIONS = ['Analise minha última sessão', 'Como solto os agudos?', 'Por que minha voz quebra?', 'Um exercício de respiração']

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

// ---------- Página ----------
export default function Coach() {
  const { profile, baseline, sessions } = useApp()
  const last = sessions[sessions.length - 1]
  const lastReport = last?.featureReport

  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaLive, setEvaLive] = useState<boolean | null>(null) // null=conectando
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const contextRef = useRef(buildStudentContext(profile, baseline, lastReport))
  const historyRef = useRef<EvaMessage[]>([])
  const bootRef = useRef(false)
  const streamingRef = useRef(false)

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

  useEffect(() => {
    if (bootRef.current) return
    bootRef.current = true
    ;(async () => {
      const opener = openingUserMessage(contextRef.current)
      setLoading(true)
      streamingRef.current = false
      try {
        const reply = await askEvaStream([opener], onPartial)
        historyRef.current = [opener, { role: 'assistant', content: reply }]
        setEvaLive(true)
      } catch {
        setMsgs([{ from: 'eva', text: firstMessage(last, profile.name) }])
        setEvaLive(false)
      } finally {
        setLoading(false)
        streamingRef.current = false
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, loading])

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
    setMsgs((m) => [...m, { from: 'me', text: t }])

    if (evaLive) {
      const userMsg: EvaMessage = { role: 'user', content: t }
      const hist = [...historyRef.current, userMsg]
      setLoading(true)
      streamingRef.current = false
      try {
        const reply = await askEvaStream(hist, onPartial)
        historyRef.current = [...hist, { role: 'assistant', content: reply }]
      } catch {
        if (streamingRef.current) {
          setMsgs((m) => {
            const c = [...m]
            c[c.length - 1] = { from: 'eva', text: replyLocal(t, last) }
            return c
          })
        } else {
          setMsgs((m) => [...m, { from: 'eva', text: replyLocal(t, last) }])
        }
      } finally {
        setLoading(false)
        streamingRef.current = false
      }
    } else {
      setLoading(true)
      setTimeout(() => {
        setMsgs((m) => [...m, { from: 'eva', text: replyLocal(t, last) }])
        setLoading(false)
      }, 420)
    }
  }

  const showChips = msgs.length <= 1 && !loading && evaLive !== null

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
        <span className={badge.cls}>
          <Icon name={badge.icon} size={13} /> {badge.label}
        </span>
      </div>

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

        {showChips && (
          <div className="chip-row">
            {SUGGESTIONS.map((s) => (
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
            placeholder="Pergunte sobre afinação, agudos, respiração, registros…"
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

      <p className="hint" style={{ marginTop: 12 }}>
        {evaLive
          ? 'EVA conectada ao EVA Hub. Recebe só as features numéricas do seu DSP — nunca o áudio — e faz o coaching real.'
          : 'Prévia com respostas locais. Configure a EVA (docs/eva-setup.md) para o coaching real via EVA Hub, mantendo sua voz no dispositivo.'}
      </p>
    </div>
  )
}
