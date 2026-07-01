import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { getExercise } from '../data/exercises'
import { addSession, newId } from '../data/store'
import { PitchEngine } from '../audio/PitchEngine'
import { PitchGraph } from '../components/PitchGraph'
import { Exercise, FeatureReport, VocalBaseline } from '../data/types'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { centsZone } from '../theme'
import { Icon } from '../components/ui/Icon'
import { SessionAggregator } from '../audio/session'
import { VoiceInsights } from '../components/audio/VoiceInsights'
import { SessionSummary } from '../components/audio/SessionSummary'

export default function ExercisePlayer() {
  const { id } = useParams()
  const { engine, baseline, reload } = useApp()
  const navigate = useNavigate()
  const ex = id ? getExercise(id) : undefined

  useEffect(() => () => engine.stop(), [engine])

  function finish(notesHitPct: number, avgCentsDev: number, durationSec: number, report?: FeatureReport) {
    if (!ex) return
    addSession({
      id: report?.sessionId ?? newId(),
      dateISO: new Date().toISOString(),
      kind: 'exercise',
      exerciseId: ex.id,
      label: ex.name,
      durationSec,
      notesHitPct,
      avgCentsDev,
      featureReport: report,
    })
    reload()
  }

  if (!ex) {
    return (
      <div className="page">
        <p className="hint">
          Exercício não encontrado. <Link to="/exercicios" style={{ color: 'var(--gold-2)' }}>Voltar</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/exercicios" className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>
            ← Exercícios
          </Link>
          <h1 className="page-title">{ex.name}</h1>
          <p className="page-sub">{ex.description}</p>
        </div>
        <span className="badge badge--gold">
          {ex.durationMin} min · {ex.focus}
        </span>
      </div>

      <div className="card card--glow">
        {ex.kind === 'breathing' ? (
          <Breathing ex={ex} onFinish={finish} onExit={() => navigate('/exercicios')} />
        ) : ex.kind === 'siren' ? (
          <Siren engine={engine} ex={ex} onFinish={finish} onExit={() => navigate('/exercicios')} />
        ) : (
          <Sequence engine={engine} ex={ex} baseline={baseline} onFinish={finish} onExit={() => navigate('/exercicios')} />
        )}
      </div>
    </div>
  )
}

/* ---------------- Respiração ---------------- */
function Breathing({ ex, onFinish, onExit }: { ex: Exercise; onFinish: (h: number, d: number, s: number, report?: FeatureReport) => void; onExit: () => void }) {
  const CYCLE = [
    { name: 'Inspire', dur: 4, scale: 1.3 },
    { name: 'Segure', dur: 4, scale: 1.3 },
    { name: 'Solte', dur: 6, scale: 1 },
  ]
  const total = ex.durationMin * 60
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [clock, setClock] = useState(0)
  const startRef = useRef(0)

  useEffect(() => {
    if (!started || done) return
    const t = setInterval(() => {
      const el = (performance.now() - startRef.current) / 1000
      setClock(el)
      if (el >= total) {
        setDone(true)
        onFinish(100, 0, Math.round(el))
      }
    }, 100)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, done])

  const cycleLen = CYCLE.reduce((a, c) => a + c.dur, 0)
  const inCycle = clock % cycleLen
  let acc = 0
  let phase = CYCLE[0]
  for (const c of CYCLE) {
    if (inCycle < acc + c.dur) {
      phase = c
      break
    }
    acc += c.dur
  }

  if (done) {
    return <Result title="Respiração concluída" score={null} note="Respiração é a base de tudo — apoio e afinação mais estáveis. 👏" onRepeat={() => { setStarted(false); setDone(false); setClock(0) }} onExit={onExit} />
  }

  return (
    <div className="player">
      {!started ? (
        <>
          <p className="hint center" style={{ maxWidth: '44ch' }}>
            Siga o ritmo do círculo: inspire pelo diafragma (4s), segure (4s), solte devagar (6s). Repita até o fim.
          </p>
          <button className="btn btn--primary" onClick={() => { startRef.current = performance.now(); setStarted(true) }}>
            <Icon name="play" /> Começar
          </button>
        </>
      ) : (
        <>
          <div className="player-step">{Math.max(0, Math.ceil(total - clock))}s restantes</div>
          <div className="breath-orb" style={{ transform: `scale(${phase.scale})` }}>
            {phase.name}
          </div>
          <button className="btn btn--ghost" onClick={onExit}>
            Sair
          </button>
        </>
      )}
    </div>
  )
}

/* ---------------- Sirene ---------------- */
function Siren({ engine, ex, onFinish, onExit }: { engine: PitchEngine; ex: Exercise; onFinish: (h: number, d: number, s: number, report?: FeatureReport) => void; onExit: () => void }) {
  const total = ex.durationMin * 60
  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready')
  const [clock, setClock] = useState(0)
  const acc = useRef({ start: 0, voiced: 0, centsSum: 0, lo: 200, hi: 0 })
  const agg = useRef(new SessionAggregator())
  const reportRef = useRef<FeatureReport | null>(null)

  useEffect(() => {
    if (phase !== 'run') return
    const unsub = engine.subscribe((f) => {
      agg.current.push(f)
      if (f.freq != null && f.note != null) {
        const a = acc.current
        a.voiced++
        a.centsSum += Math.abs(f.note.cents)
        const m = freqToMidiFloat(f.freq)
        a.lo = Math.min(a.lo, m)
        a.hi = Math.max(a.hi, m)
      }
    })
    const t = setInterval(() => {
      const el = (performance.now() - acc.current.start) / 1000
      setClock(el)
      if (el >= total) done()
    }, 150)
    return () => {
      unsub()
      clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => () => engine.stop(), [engine])

  async function start() {
    acc.current = { start: performance.now(), voiced: 0, centsSum: 0, lo: 200, hi: 0 }
    agg.current.start({ type: 'siren' })
    await engine.start()
    if (engine.status === 'running') setPhase('run')
  }
  function done() {
    const a = acc.current
    engine.stop()
    const report = agg.current.voicedCount >= 30 ? agg.current.finalize(newId()) : undefined
    reportRef.current = report ?? null
    setPhase('done')
    onFinish(100, a.voiced ? a.centsSum / a.voiced : 0, Math.round((performance.now() - a.start) / 1000), report)
  }

  if (phase === 'done') {
    const a = acc.current
    const semis = a.hi > a.lo ? Math.round(a.hi - a.lo) : 0
    return (
      <Result
        title="Sirene concluída"
        score={null}
        note={`Você percorreu cerca de ${semis} semitons. Sirenes suaves conectam os registros — ótimo aquecimento.`}
        report={reportRef.current ?? undefined}
        onRepeat={() => setPhase('ready')}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="player" style={{ width: '100%' }}>
      {phase === 'ready' ? (
        <>
          <p className="hint center" style={{ maxWidth: '46ch' }}>
            Deslize suave do grave ao agudo e volte, em lip trill ou "ng". Sem forçar — o objetivo é atravessar a passagem sem quebra.
          </p>
          <button className="btn btn--primary" onClick={start} disabled={engine.status === 'starting'}>
            <Icon name="mic" /> {engine.status === 'starting' ? 'Liberando…' : 'Começar'}
          </button>
        </>
      ) : (
        <div className="stack gap-3" style={{ width: '100%' }}>
          <div className="row spread">
            <span className="player-step">{Math.max(0, Math.ceil(total - clock))}s restantes</span>
            <span className="live">● ao vivo</span>
          </div>
          <PitchGraph engine={engine} target={null} />
          <VoiceInsights engine={engine} />
          <div className="controls">
            <button className="btn" onClick={done}>
              Concluir
            </button>
            <button className="btn btn--ghost" onClick={onExit}>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Sequência (escala / arpejo / sustentação) ---------------- */
function Sequence({
  engine,
  ex,
  baseline,
  onFinish,
  onExit,
}: {
  engine: PitchEngine
  ex: Exercise
  baseline: VocalBaseline | null
  onFinish: (h: number, d: number, s: number, report?: FeatureReport) => void
  onExit: () => void
}) {
  const pattern = ex.pattern ?? [0]
  const holdSec = ex.holdSec ?? 2
  const seq = useMemo(() => {
    const maxOff = Math.max(...pattern)
    let tonic = 57 // A3 padrão
    if (baseline) {
      const mid = Math.round((baseline.lowMidi + baseline.highMidi) / 2) - Math.round(maxOff / 2)
      tonic = Math.max(baseline.lowMidi, Math.min(mid, baseline.highMidi - maxOff))
    }
    return pattern.map((o) => tonic + o)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id])

  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready')
  const [idx, setIdx] = useState(0)
  const idxRef = useRef(0)
  idxRef.current = idx
  const samplesRef = useRef<number[]>([])
  const resultsRef = useRef<{ dev: number; hit: boolean }[]>([])
  const noteStartRef = useRef(0)
  const runStartRef = useRef(0)
  const [result, setResult] = useState<{ score: number; avgDev: number; report?: FeatureReport } | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const sungRef = useRef<HTMLSpanElement>(null)
  const centsRef = useRef<HTMLSpanElement>(null)
  const needleRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const agg = useRef(new SessionAggregator())

  // pitch -> live display + acumulação
  useEffect(() => {
    if (phase !== 'run') return
    const unsub = engine.subscribe((f) => {
      agg.current.push(f, seq[idxRef.current])
      const wrap = wrapRef.current
      if (f.freq != null && f.note != null) {
        const cents = Math.round((freqToMidiFloat(f.freq) - seq[idxRef.current]) * 100)
        samplesRef.current.push(cents)
        if (sungRef.current) sungRef.current.textContent = `${f.note.name}${f.note.octave}`
        if (centsRef.current) centsRef.current.textContent = `${cents > 0 ? '+' : ''}${cents}¢`
        if (needleRef.current) needleRef.current.style.left = `${Math.max(-50, Math.min(50, cents)) + 50}%`
        if (wrap) wrap.dataset.state = centsZone(cents)
      } else {
        if (sungRef.current) sungRef.current.textContent = '—'
        if (wrap) wrap.dataset.state = 'silent'
      }
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // relógio: avança as notas
  useEffect(() => {
    if (phase !== 'run') return
    let raf = 0
    const tick = () => {
      const el = performance.now() - noteStartRef.current
      if (barRef.current) barRef.current.style.width = `${Math.min(100, (el / (holdSec * 1000)) * 100)}%`
      if (el >= holdSec * 1000) {
        finalizeNote()
        if (idxRef.current + 1 >= seq.length) {
          finishAll()
          return
        }
        setIdx((i) => i + 1)
        samplesRef.current = []
        noteStartRef.current = performance.now()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => () => engine.stop(), [engine])

  function finalizeNote() {
    const s = samplesRef.current
    if (s.length < 8) {
      resultsRef.current.push({ dev: 999, hit: false })
      return
    }
    const meanDev = s.reduce((a, c) => a + Math.abs(c), 0) / s.length
    resultsRef.current.push({ dev: meanDev, hit: meanDev <= 35 })
  }
  async function start() {
    resultsRef.current = []
    samplesRef.current = []
    setIdx(0)
    agg.current.start({ type: ex.kind, targetNotes: seq.map(midiLabel) })
    await engine.start()
    if (engine.status !== 'running') return
    noteStartRef.current = performance.now()
    runStartRef.current = performance.now()
    setPhase('run')
  }
  function finishAll() {
    const res = resultsRef.current
    const hits = res.filter((r) => r.hit).length
    const finite = res.filter((r) => r.dev < 200)
    const avgDev = finite.length ? finite.reduce((a, c) => a + c.dev, 0) / finite.length : 0
    const score = (hits / seq.length) * 100
    engine.stop()
    const report = agg.current.voicedCount >= 20 ? agg.current.finalize(newId()) : undefined
    setResult({ score, avgDev, report })
    setPhase('done')
    onFinish(score, avgDev, Math.round((performance.now() - runStartRef.current) / 1000), report)
  }

  if (phase === 'ready') {
    return (
      <div className="player">
        <p className="hint center" style={{ maxWidth: '46ch' }}>
          Vou tocar {seq.length} notas de {midiLabel(seq[0])} a {midiLabel(Math.max(...seq))}. Acerte cada uma dentro da zona verde e sustente até a barra encher.
        </p>
        <button className="btn btn--primary" onClick={start} disabled={engine.status === 'starting'}>
          <Icon name="mic" /> {engine.status === 'starting' ? 'Liberando…' : 'Começar'}
        </button>
      </div>
    )
  }

  if (phase === 'done' && result) {
    return (
      <Result
        title="Exercício concluído"
        score={Math.round(result.score)}
        note={`Desvio médio de ${Math.round(result.avgDev)}¢. ${result.score >= 70 ? 'Afinação sólida — pode subir a dificuldade.' : 'Foque em chegar na nota e segurar no centro.'}`}
        report={result.report}
        onRepeat={() => { setResult(null); setPhase('ready') }}
        onExit={onExit}
      />
    )
  }

  // run
  return (
    <div className="player">
      <div className="player-step">
        Nota {idx + 1} de {seq.length}
      </div>
      <div className="display" ref={wrapRef} data-state="silent">
        <div className="display-sub">alvo</div>
        <div className="display-note" style={{ color: 'var(--gold-2)' }}>
          {midiLabel(seq[idx])}
        </div>
        <div className="range-live-cap">
          você: <span ref={sungRef}>—</span> · <span className="mono" ref={centsRef}>—</span>
        </div>
        <div className="cents-track">
          <span className="cents-tick cents-tick--left">-50</span>
          <span className="cents-center" />
          <span className="cents-tick cents-tick--right">+50</span>
          <div className="cents-needle" ref={needleRef} style={{ left: '50%' }} />
        </div>
      </div>
      <div className="bar" style={{ width: 220 }}>
        <div className="bar-fill" ref={barRef} style={{ width: '0%' }} />
      </div>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <VoiceInsights engine={engine} />
      </div>
      <button className="btn btn--ghost" onClick={() => { engine.stop(); onExit() }}>
        Sair
      </button>
    </div>
  )
}

/* ---------------- Resultado ---------------- */
function Result({
  title,
  score,
  note,
  report,
  onRepeat,
  onExit,
}: {
  title: string
  score: number | null
  note: string
  report?: FeatureReport
  onRepeat: () => void
  onExit: () => void
}) {
  return (
    <div className="player">
      <div className="player-step">{title}</div>
      {score != null && <div className="score-big">{score}%</div>}
      {score == null && (
        <div className="eva-avatar" style={{ width: 64, height: 64 }}>
          <Icon name="check" size={30} />
        </div>
      )}
      <p className="hint center" style={{ maxWidth: '42ch' }}>
        {note}
      </p>
      {report && (
        <div style={{ width: '100%', maxWidth: 520 }}>
          <SessionSummary report={report} />
        </div>
      )}
      <div className="controls" style={{ justifyContent: 'center' }}>
        <button className="btn btn--primary" onClick={onRepeat}>
          Repetir
        </button>
        <button className="btn" onClick={onExit}>
          Voltar aos exercícios
        </button>
      </div>
    </div>
  )
}
