import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { setProfile, setSeenOnboarding } from '../data/store'
import { RangeTestFlow } from './RangeTest'
import { Icon } from '../components/ui/Icon'

type Step = 'welcome' | 'range' | 'goal' | 'done'
const ORDER: Step[] = ['welcome', 'range', 'goal', 'done']

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
            <span className="brand-mark" style={{ width: 46, height: 46 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#241a08" strokeWidth="2.1" strokeLinecap="round">
                <path d="M2 12h3l2-7 3.5 15 3.5-19 3 15 2-4h3" />
              </svg>
            </span>
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
            <button className="btn btn--primary btn--block" onClick={() => setStep('range')}>
              Continuar
            </button>
          </div>
        )}

        {step === 'range' && (
          <div className="stack gap-2">
            <span className="card-title">Passo 1 · sua voz</span>
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
            <div className="eva-avatar" style={{ width: 64, height: 64 }}>
              <Icon name="check" size={30} />
            </div>
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
