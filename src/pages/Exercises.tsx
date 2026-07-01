import { Link } from 'react-router-dom'
import { EXERCISES, PHASES } from '../data/exercises'
import { Exercise, ExerciseKind } from '../data/types'
import { Icon, IconName } from '../components/ui/Icon'

const KIND_ICON: Record<ExerciseKind, IconName> = {
  breathing: 'lungs',
  siren: 'wave',
  scale: 'target',
  interval: 'target',
  sustain: 'gauge',
}

export default function Exercises() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="page-sub">Rotina em fases progressivas. Sempre comece pelo aquecimento — cada exercício dá feedback de afinação em tempo real.</p>
        </div>
      </div>

      {PHASES.map((phase, i) => {
        const items = EXERCISES.filter((e) => e.phase === phase.key)
        return (
          <div key={phase.key} className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="phase-head">
              <span className="phase-num">{i + 1}</span>
              <div>
                <div className="phase-title">{phase.label}</div>
                <div className="ex-meta">{phase.hint}</div>
              </div>
            </div>
            <div className="stack gap-2">
              {items.map((ex) => (
                <ExRow key={ex.id} ex={ex} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ExRow({ ex }: { ex: Exercise }) {
  return (
    <Link to={`/exercicios/${ex.id}`} className="card ex-card">
      <span className="ex-icon">
        <Icon name={KIND_ICON[ex.kind]} size={22} />
      </span>
      <div className="grow">
        <div className="ex-name">{ex.name}</div>
        <div className="ex-meta">
          {ex.durationMin} min · {ex.focus}
        </div>
      </div>
      <span className="badge">{ex.kind === 'breathing' ? 'respiração' : ex.kind === 'siren' ? 'sirene' : 'afinação'}</span>
      <span className="ex-go">
        <Icon name="chevron" size={18} />
      </span>
    </Link>
  )
}
