import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { getExercise } from '../data/exercises'
import { getUnit } from '../data/curriculum'
import { unitReviewQueue, spacedReviewQueue } from '../data/review'
import { warmupQueue, cooldownQueue } from '../data/vocalHealth'
import { addSession, markReviewDone, newId } from '../data/store'
import { FeatureReport } from '../data/types'
import { ExerciseRunner } from './ExercisePlayer'
import { Icon, IconName } from '../components/ui/Icon'

export type RunnerMode = 'unit' | 'spaced' | 'warmup' | 'cooldown'

// Runner genérico de FILA de exercícios: revisões (unidade/espaçada) e rotinas
// de saúde vocal (aquecimento/desaquecimento). Reusa o ExerciseRunner.
export default function ReviewRunner({ mode }: { mode: RunnerMode }) {
  const { unitId } = useParams()
  const { engine, baseline, gamification, sessions, reload } = useApp()
  const navigate = useNavigate()
  const done = gamification.exercisesDone

  const unit = mode === 'unit' && unitId ? getUnit(unitId) : undefined
  const isRoutine = mode === 'warmup' || mode === 'cooldown'
  const backTo = isRoutine ? '/saude' : '/exercicios'

  // Fila FIXADA na montagem — não re-embaralha conforme as pontuações mudam.
  const queue = useMemo(() => {
    const ids =
      mode === 'unit' ? (unit ? unitReviewQueue(unit, done) : [])
      : mode === 'spaced' ? spacedReviewQueue(sessions, done)
      : mode === 'warmup' ? warmupQueue()
      : cooldownQueue()
    return ids.map((id) => getExercise(id)).filter((e): e is NonNullable<typeof e> => Boolean(e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'run' | 'done'>('run')
  const scores = useRef<number[]>([])

  const CFG: Record<RunnerMode, { title: string; badge: string; badgeIcon: IconName; doneTitle: string; doneMsg: string; doneIcon: IconName }> = {
    unit: { title: `Revisão · ${unit?.title ?? ''}`, badge: 'revisão', badgeIcon: 'trophy', doneTitle: 'Revisão concluída', doneMsg: 'Troféu da unidade conquistado! Revisar o que você já viu fixa a técnica de verdade.', doneIcon: 'trophy' },
    spaced: { title: 'Revisão do dia', badge: 'revisão', badgeIcon: 'trophy', doneTitle: 'Revisão concluída', doneMsg: 'Revisão do dia feita! Voltar ao que aprendeu antes é o segredo da retenção.', doneIcon: 'trophy' },
    warmup: { title: 'Aquecimento vocal', badge: 'aquecimento', badgeIcon: 'lungs', doneTitle: 'Voz aquecida', doneMsg: 'Prontinho — laringe solta e ar fluindo. Agora sua voz está pronta pra cantar com segurança.', doneIcon: 'check' },
    cooldown: { title: 'Desaquecimento', badge: 'desaquecimento', badgeIcon: 'lungs', doneTitle: 'Voz relaxada', doneMsg: 'Desaquecida. Desaquecer depois de cantar tira a tensão e cuida das suas pregas vocais. Bom descanso.', doneIcon: 'check' },
  }
  const cfg = CFG[mode]
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

  // ---- Nada na fila ----
  if (queue.length === 0) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <Link to={backTo} className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Voltar</Link>
            <h1 className="page-title">{cfg.title}</h1>
          </div>
        </div>
        <div className="card cat-empty">
          <Icon name="target" size={22} />
          <p>
            {mode === 'spaced'
              ? 'Ainda não há o que revisar. Pratique alguns exercícios — a revisão espaçada traz de volta o que você aprendeu em dias anteriores.'
              : isRoutine
                ? 'Não consegui montar a rotina agora. Tente pelos exercícios.'
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
            <h1 className="page-title">{cfg.doneTitle}</h1>
            <p className="page-sub">{cfg.title}</p>
          </div>
        </div>
        <div className="card card--glow">
          <div className="player">
            <div className="eva-avatar" style={{ width: 64, height: 64 }}>
              <Icon name={cfg.doneIcon} size={30} />
            </div>
            {!isRoutine && <div className="score-big">{avg}%</div>}
            <p className="hint center" style={{ maxWidth: '42ch' }}>{cfg.doneMsg}</p>
            <div className="controls" style={{ justifyContent: 'center' }}>
              <button className="btn btn--primary" onClick={() => navigate(isRoutine ? '/exercicios' : '/exercicios')}>
                <Icon name="route" /> {isRoutine ? 'Ir cantar' : 'Voltar ao caminho'}
              </button>
              <button className="btn" onClick={() => navigate(isRoutine ? '/saude' : '/progresso')}>
                {isRoutine ? 'Saúde vocal' : 'Ver progresso'}
              </button>
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
          <Link to={backTo} className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Voltar</Link>
          <h1 className="page-title">{cfg.title}</h1>
          <p className="page-sub">{isRoutine ? 'Passo' : 'Exercício'} {i + 1} de {queue.length} · {ex.name}</p>
        </div>
        <span className="badge badge--gold">
          <Icon name={cfg.badgeIcon} size={13} /> {cfg.badge}
        </span>
      </div>

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
          onExit={() => navigate(backTo)}
          review={{ index: i, total: queue.length, onNext: next }}
        />
      </div>
    </div>
  )
}
