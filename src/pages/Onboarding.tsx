import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/onboarding.css'
import { useApp } from '../app/AppContext'
import { setProfile, setSeenOnboarding, unlockAchievement } from '../data/store'
import { RangeTestFlow } from './RangeTest'
import { Icon } from '../components/ui/Icon'
import { Eva } from '../components/ui/Eva'
import type { PitchEngine } from '../audio/PitchEngine'
import { FirstInTuneDetector } from '../domain/onboarding/firstInTune'

type Step = 'welcome' | 'nota' | 'range' | 'goal' | 'done'
const ORDER: Step[] = ['welcome', 'nota', 'range', 'goal', 'done']

export default function Onboarding() {
  const { engine, reload } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')

  function finish() {
    setProfile({ name: name.trim(), goal: goal.trim() })
    setSeenOnboarding()
    reload()
    navigate('/', { replace: true })
  }

  return (
    <div className="onb">
      <div className="onb-card card card--glow reveal r0">
        {step === 'welcome' && (
          <div className="stack gap-3">
            <Eva mood="hello" size={84} />
            <h1 className="page-title">
              Bem-vindo ao <span style={{ fontStyle: 'italic', color: 'var(--gold-2)' }}>Canto</span>
            </h1>
            <p className="hint">
              O primeiro coach vocal de IA que <strong>entende sua voz</strong> — feedback de afinação em tempo real, direto no navegador. Sua voz nunca sai do dispositivo.
            </p>
            <label className="field" style={{ marginTop: 4 }}>
              <span className="field-label">Como te chamo?</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoFocus />
            </label>
            <button className="btn btn--primary btn--block" onClick={() => setStep('nota')}>
              Continuar
            </button>
          </div>
        )}

        {step === 'nota' && (
          <MasteryNoteStep
            engine={engine}
            name={name}
            onDone={() => setStep('range')}
            onSkip={() => setStep('range')}
          />
        )}

        {step === 'range' && (
          <div className="stack gap-2">
            <span className="card-title">Sua voz</span>
            <RangeTestFlow
              engine={engine}
              onDone={() => {
                reload()
                setStep('goal')
              }}
              onCancel={() => setStep('goal')}
            />
          </div>
        )}

        {step === 'goal' && (
          <div className="stack gap-3">
            <span className="brand-mark" style={{ width: 44, height: 44 }}>
              <Icon name="target" size={22} />
            </span>
            <h1 className="page-title">Qual é o seu objetivo?</h1>
            <p className="hint">Isso ajuda a EVA a montar seu plano. Pode mudar depois.</p>
            <textarea
              className="textarea"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex.: cantar louvores no tom, soltar os agudos, afinar sem apoio, cantar aquela música…"
              autoFocus
            />
            <div className="row gap-2">
              <button className="btn btn--primary grow" onClick={() => setStep('done')}>
                Continuar
              </button>
              <button className="btn btn--ghost" onClick={() => setStep('done')}>
                Pular
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="stack gap-3 center">
            <Eva mood="celebrate" size={84} />
            <h1 className="page-title">Tudo pronto{name ? `, ${name.split(' ')[0]}` : ''}! 🎉</h1>
            <p className="hint">Seu ponto de partida está salvo. Bora treinar — começa pelo aquecimento e mantém a ofensiva viva.</p>
            <button className="btn btn--primary btn--block" onClick={finish}>
              Ir para o app
            </button>
          </div>
        )}

        <div className="onb-dots">
          {ORDER.map((s) => (
            <span key={s} className="onb-dot" data-on={s === step} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Passo da vitória de maestria (A3): o usuário canta uma nota e o motor "trava" a
// afinação. Consumidor puro dos frames — não altera o motor. Zero tela de falha.
function MasteryNoteStep({
  engine,
  name,
  onDone,
  onSkip,
}: {
  engine: PitchEngine
  name: string
  onDone: () => void
  onSkip: () => void
}) {
  const [phase, setPhase] = useState<'primer' | 'listening' | 'won'>('primer')
  const [wonNote, setWonNote] = useState<string | null>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const detectorRef = useRef(new FirstInTuneDetector(700))

  // Escuta os frames enquanto ouve; o detector sinaliza a primeira nota afinada.
  useEffect(() => {
    if (phase !== 'listening') return
    detectorRef.current.reset()
    const unsub = engine.subscribe((f) => {
      const { inTune, note } = FirstInTuneDetector.cue(f)
      const el = cueRef.current
      if (el) {
        el.textContent = note ?? '—'
        el.dataset.intune = inTune ? '1' : '0'
      }
      const won = detectorRef.current.feed(f)
      if (won) {
        setWonNote(won)
        setPhase('won')
        unlockAchievement('primeira-nota-afinada')
        engine.stop()
      }
    })
    return unsub
  }, [engine, phase])

  // Para o microfone ao sair do passo (some pro range, que reinicia sozinho).
  useEffect(() => () => engine.stop(), [engine])

  async function start() {
    await engine.start()
    if (engine.status === 'running') setPhase('listening')
  }

  if (phase === 'primer') {
    return (
      <div className="stack gap-3">
        <Eva mood="hello" size={76} />
        <h1 className="page-title">Cante uma nota comigo{name ? `, ${name.split(' ')[0]}` : ''}</h1>
        <p className="hint">
          Solte um <strong>“ahh”</strong> confortável e segure. Eu te escuto em tempo real — <strong>nada é gravado</strong>, tudo acontece no
          seu aparelho. E pode confiar: afinar é habilidade treinável para quase todo mundo.
        </p>
        <button className="btn btn--primary btn--block" onClick={start} disabled={engine.status === 'starting'}>
          <Icon name="mic" /> {engine.status === 'starting' ? 'Liberando microfone…' : 'Tô pronto — cantar'}
        </button>
        <button className="btn btn--ghost btn--block" onClick={onSkip}>
          Agora não, seguir
        </button>
        {engine.status === 'error' && <p className="hint hint--error">Não consegui o microfone — você pode seguir e cantar depois.</p>}
      </div>
    )
  }

  if (phase === 'listening') {
    return (
      <div className="stack gap-3 center">
        <h1 className="page-title">Segura a nota…</h1>
        <Eva mood="listening" size={72} />
        <p className="hint">Mantenha o som firme por um instante. Quando ficar afinado, o círculo acende em verde-água.</p>
        <div className="onb-note-cue" ref={cueRef} data-intune="0">
          —
        </div>
        <p className="hint">Fora do tom? Sem problema — sobe ou desce devagar até acender.</p>
        <button className="btn btn--ghost" onClick={onSkip}>
          Seguir sem isso
        </button>
      </div>
    )
  }

  // phase === 'won'
  return (
    <div className="stack gap-3 center">
      <Eva mood="celebrate" size={92} />
      <h1 className="page-title">Isso! 🎉</h1>
      <p className="hint">
        Você segurou <strong>{wonNote}</strong> afinada — <strong>foi você que fez isso</strong>. Essa é a base de tudo; agora é só treinar.
      </p>
      <div className="onb-achv">
        <Icon name="star" size={16} /> Conquista: <strong>Primeira nota afinada</strong>
      </div>
      <button className="btn btn--primary btn--block" onClick={onDone}>
        Continuar
      </button>
    </div>
  )
}
