import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/eva-moments.css'
import { useApp } from '../app/AppContext'
import { Eva } from './ui/Eva'
import { checkLevelUp, checkStreakLost } from '../domain/eva-moments'

// Momentos de evento da EVA no topo do Dashboard: subir de nível (comemora) e
// perder a ofensiva (acolhe, sem drama). Detecta uma vez no mount (useState init).
export function EvaMoments() {
  const { gamification, streak } = useApp()
  const [levelUp] = useState(() => checkLevelUp(gamification.level))
  const [streakLost] = useState(() => checkStreakLost(streak.current))
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (levelUp != null) {
    return (
      <div className="eva-moment eva-moment--up reveal">
        <Eva mood="levelup" size={72} />
        <div className="eva-moment-body">
          <strong className="eva-moment-title">Nível {levelUp}! 🎉</strong>
          <p className="eva-moment-sub">Você subiu de nível cantando — isso é progresso de verdade. Segue firme!</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setDismissed(true)}>
          Continuar
        </button>
      </div>
    )
  }

  if (streakLost) {
    return (
      <div className="eva-moment eva-moment--sad reveal">
        <Eva mood="sad" size={64} />
        <div className="eva-moment-body">
          <strong className="eva-moment-title">Sua ofensiva zerou</strong>
          <p className="eva-moment-sub">Sem drama — todo mundo perde um dia. O que conta é voltar. Bora recomeçar hoje?</p>
        </div>
        <Link to="/exercicios" className="btn btn--primary btn--sm" onClick={() => setDismissed(true)}>
          Treinar agora
        </Link>
      </div>
    )
  }

  return null
}
