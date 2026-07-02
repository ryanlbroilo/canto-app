import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { getExercise } from '../data/exercises'
import { getUnit } from '../data/curriculum'
import { unitReviewQueue, spacedReviewQueue } from '../data/review'
import { addSession, markReviewDone, newId } from '../data/store'
import { FeatureReport } from '../data/types'
import { ExerciseRunner } from './ExercisePlayer'
import { Icon } from '../components/ui/Icon'

// Review runner: roda uma FILA de exercícios em sequência (o "review runner"
// genérico). Duas entradas: revisão de UNIDADE (troféu) e revisão ESPAÇADA.
export default function ReviewRunner({ mode }: { mode: 'unit' | 'spaced' }) {
  const { unitId } = useParams()
  const { engine, baseline, gamification, sessions, reload } = useApp()
  const navigate = useNavigate()
  const done = gamification.exercisesDone

  const unit = mode === 'unit' && unitId ? getUnit(unitId) : undefined

  // Fila FIXADA na montagem — não re-embaralha conforme as pontuações mudam.
  const queue = useMemo(() => {
    const ids = mode === 'unit' ? (unit ? unitReviewQueue(unit, done) : []) : spacedReviewQueue(sessions, done)
    return ids.map((id) => getExercise(id)).filter((e): e is NonNullable<typeof e> => Boolean(e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'run' | 'done'>('run')
  const scores = useRef<number[]>([])

  const title = mode === 'unit' ? `Revisão · ${unit?.title ?? ''}` : 'Revisão do dia'
  const ex = queue[i]

  function itemFinish(hit: number, dev: number, sec: number, report?: FeatureReport) {
    if (ex) {
      addSession({
        id: report?.sessionId ?? newId(),
        dateISO: new Date().toISOString(),
        kind: 'exercise',
        exerciseId: ex.id,
        label: ex.name,
        durationSec: sec,
        notesHitPct: hit,
        avgCentsDev: dev,
        featureReport: report,
      })
      scores.current.push(hit)
      reload()
    }
  }

  function next() {
    if (i + 1 >= queue.length) {
      if (mode === 'unit' && unit) markReviewDone(unit.id)
      setPhase('done')
      reload()
      return
    }
    setI((n) => n + 1)
  }

  // ---- Nada para revisar ----
  if (queue.length === 0) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <Link to="/exercicios" className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Exercícios</Link>
            <h1 className="page-title">{title}</h1>
          </div>
        </div>
        <div className="card cat-empty">
          <Icon name="target" size={22} />
          <p>
            {mode === 'spaced'
              ? 'Ainda não há o que revisar. Pratique alguns exercícios — a revisão espaçada traz de volta o que você aprendeu em dias anteriores.'
              : 'Esta unidade ainda não tem exercícios para revisar.'}
          </p>
        </div>
      </div>
    )
  }

  // ---- Resumo final ----
  if (phase === 'done') {
    const avg = scores.current.length ? Math.round(scores.current.reduce((a, b) => a + b, 0) / scores.current.length) : 0
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Revisão concluída</h1>
            <p className="page-sub">{title}</p>
          </div>
        </div>
        <div className="card card--glow">
          <div className="player">
            <div className="eva-avatar" style={{ width: 64, height: 64 }}>
              <Icon name="trophy" size={30} />
            </div>
            <div className="score-big">{avg}%</div>
            <p className="hint center" style={{ maxWidth: '42ch' }}>
              {mode === 'unit'
                ? 'Troféu da unidade conquistado! Revisar o que você já viu fixa a técnica de verdade.'
                : 'Revisão do dia feita! Voltar ao que aprendeu antes é o segredo da retenção de longo prazo.'}
            </p>
            <div className="controls" style={{ justifyContent: 'center' }}>
              <button className="btn btn--primary" onClick={() => navigate('/exercicios')}>
                <Icon name="route" /> Voltar ao caminho
              </button>
              <button className="btn" onClick={() => navigate('/progresso')}>Ver progresso</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Rodando a fila ----
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/exercicios" className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Exercícios</Link>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">Exercício {i + 1} de {queue.length} · {ex.name}</p>
        </div>
        <span className="badge badge--gold">
          <Icon name="trophy" size={13} /> revisão
        </span>
      </div>

      {/* trilha de progresso da fila */}
      <div className="rev-track" aria-hidden="true">
        {queue.map((q, qi) => (
          <span key={q.id} className="rev-dot" data-state={qi < i ? 'done' : qi === i ? 'now' : 'todo'} />
        ))}
      </div>

      <div className="card card--glow">
        <ExerciseRunner
          key={ex.id}
          ex={ex}
          engine={engine}
          baseline={baseline}
          onFinish={itemFinish}
          onExit={() => navigate('/exercicios')}
          review={{ index: i, total: queue.length, onNext: next }}
        />
      </div>
    </div>
  )
}
