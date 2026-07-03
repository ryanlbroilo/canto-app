import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import {
  HARMONY_EXERCISES,
  HarmonyExercise,
  getHarmonyExercise,
  harmonySessionId,
  targetMidiFor,
  droneMidisFor,
  worshipPart,
  WorshipPartId,
} from '../data/harmony'
import { scoreNote, finalizeHarmony, NoteScore } from '../data/harmonyScore'
import { TonePlayer } from '../audio/TonePlayer'
import { addSession, newId } from '../data/store'
import { SessionAggregator } from '../audio/session'
import { SessionSummary } from '../components/audio/SessionSummary'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { centsZone } from '../theme'
import { Icon } from '../components/ui/Icon'
import { ShareButton } from '../components/ShareButton'
import { ShareCardData } from '../share/shareCard'
import { FeatureReport } from '../data/types'
import '../styles/ministerio.css'

// TREINADOR DE HARMONIA — o cantor sustenta a SUA nota (terça, quinta, oitava…)
// contra um drone de referência tocado pelo TonePlayer. Mede afinação do
// INTERVALO (cents contra o alvo, não a nota mais próxima) + encaixe (firmeza).
// Espelha o Sequence do ExercisePlayer (fases ready→run→done, subscribe + RAF).

const PART_FILTERS: { id: 'todos' | WorshipPartId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'melodia', label: 'Base' },
  { id: 'voz2', label: 'Voz 2' },
  { id: 'voz3', label: 'Voz 3' },
  { id: 'baixo', label: 'Baixo' },
]

interface RunResult {
  score: number
  hits: number
  total: number
  avgDev: number
  report?: FeatureReport
}

export default function HarmonyTrainer() {
  const { engine, baseline, reload, micStatus, profile } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const preId = params.get('ex')
  const [exId, setExId] = useState(preId && getHarmonyExercise(preId) ? preId : HARMONY_EXERCISES[0].id)
  const [filter, setFilter] = useState<'todos' | WorshipPartId>('todos')
  const ex = getHarmonyExercise(exId) ?? HARMONY_EXERCISES[0]
  const part = worshipPart(ex.part)

  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready')
  const [rep, setRep] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)

  // refs de execução (evitam re-render por frame)
  const toneRef = useRef<TonePlayer | null>(null)
  const targetRef = useRef(0)
  const droneRef = useRef<number[]>([])
  const repRef = useRef(0)
  repRef.current = rep
  const samplesRef = useRef<number[]>([]) // cents da rep atual
  const steadyRef = useRef<number[]>([]) // firmeza (0..1) da rep atual
  const notesRef = useRef<NoteScore[]>([])
  const repStartRef = useRef(0)
  const runStartRef = useRef(0)
  const agg = useRef(new SessionAggregator())

  // refs de display ao vivo
  const wrapRef = useRef<HTMLDivElement>(null)
  const sungRef = useRef<HTMLSpanElement>(null)
  const centsRef = useRef<HTMLSpanElement>(null)
  const needleRef = useRef<HTMLDivElement>(null)
  const holdBarRef = useRef<HTMLDivElement>(null)
  const blendBarRef = useRef<HTMLDivElement>(null)

  // pitch ao vivo → display + acumulação
  useEffect(() => {
    if (phase !== 'run') return
    const unsub = engine.subscribe((f) => {
      const wrap = wrapRef.current
      if (f.freq != null && f.note != null) {
        const midi = freqToMidiFloat(f.freq)
        // Guarda de vazamento: se o sinal está muito baixo E perto de uma nota do
        // drone, provavelmente é o alto-falante vazando — descarta o frame por
        // completo (não entra no score NEM no featureReport).
        const nearDrone = droneRef.current.some((d) => Math.abs((midi - d) * 100) < 60)
        const quiet = f.dynamics != null && f.dynamics < 0.1
        if (nearDrone && quiet) return
        agg.current.push(f, targetRef.current)
        const cents = Math.round((midi - targetRef.current) * 100)
        samplesRef.current.push(cents)
        if (f.steadiness != null) steadyRef.current.push(f.steadiness)
        if (sungRef.current) sungRef.current.textContent = `${f.note.name}${f.note.octave}`
        if (centsRef.current) centsRef.current.textContent = `${cents > 0 ? '+' : ''}${cents}¢`
        if (needleRef.current) needleRef.current.style.left = `${Math.max(-50, Math.min(50, cents)) + 50}%`
        if (blendBarRef.current && f.steadiness != null) blendBarRef.current.style.width = `${Math.round(f.steadiness * 100)}%`
        if (wrap) wrap.dataset.state = centsZone(cents)
      } else {
        agg.current.push(f, targetRef.current)
        if (sungRef.current) sungRef.current.textContent = '—'
        if (wrap) wrap.dataset.state = 'silent'
      }
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // relógio: avança as repetições da nota-alvo
  useEffect(() => {
    if (phase !== 'run') return
    const holdMs = ex.holdSec * 1000
    let raf = 0
    const tick = () => {
      const el = performance.now() - repStartRef.current
      if (holdBarRef.current) holdBarRef.current.style.width = `${Math.min(100, (el / holdMs) * 100)}%`
      if (el >= holdMs) {
        finalizeRep()
        if (repRef.current + 1 >= ex.reps) {
          finishAll()
          return
        }
        setRep((r) => r + 1)
        samplesRef.current = []
        steadyRef.current = []
        repStartRef.current = performance.now()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // limpeza dura ao desmontar: solta mic e drone
  useEffect(() => () => {
    engine.stop()
    toneRef.current?.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine])

  function finalizeRep() {
    notesRef.current.push(scoreNote(samplesRef.current, steadyRef.current))
  }

  async function start() {
    targetRef.current = targetMidiFor(ex, baseline)
    droneRef.current = droneMidisFor(ex, baseline)
    notesRef.current = []
    samplesRef.current = []
    steadyRef.current = []
    setRep(0)
    setResult(null)
    agg.current.start({ type: 'harmony', targetNotes: [midiLabel(targetRef.current)] })
    if (!toneRef.current) toneRef.current = new TonePlayer()
    await toneRef.current.resume()
    await engine.start()
    if (engine.status !== 'running') return
    toneRef.current.playChord(droneRef.current)
    repStartRef.current = performance.now()
    runStartRef.current = performance.now()
    setPhase('run')
  }

  function finishAll() {
    const res = finalizeHarmony(notesRef.current)
    engine.stop()
    toneRef.current?.stop()
    const report = agg.current.voicedCount >= 20 ? agg.current.finalize(newId()) : undefined
    addSession({
      id: report?.sessionId ?? newId(),
      dateISO: new Date().toISOString(),
      kind: 'exercise',
      exerciseId: harmonySessionId(ex.id),
      label: `Harmonia · ${ex.name}`,
      durationSec: Math.round((performance.now() - runStartRef.current) / 1000),
      notesHitPct: res.notesHitPct,
      avgCentsDev: res.avgCentsDev,
      featureReport: report,
    })
    reload()
    setResult({ score: res.score, hits: res.hits, total: ex.reps, avgDev: res.avgCentsDev, report })
    setPhase('done')
  }

  function stopAudio() {
    engine.stop()
    toneRef.current?.stop()
  }

  // ---- Resultado ----
  if (phase === 'done' && result) {
    const good = result.score >= 75
    const ok = result.score >= 50
    const headline = good
      ? 'Encaixe firme — sua voz travou na harmonia. 👏'
      : ok
        ? 'Quase lá: o intervalo apareceu, agora é firmar e sustentar.'
        : 'A base está aí. Ouça o drone, ache sua nota e segure com calma.'
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Encaixe concluído</h1>
            <p className="page-sub">{ex.name} · {part.name}</p>
          </div>
        </div>
        <div className="card card--glow">
          <div className="player">
            <div className="score-big">{result.score}%</div>
            <p className="hint center" style={{ maxWidth: '44ch' }}>{headline}</p>
            <div className="harm-metrics">
              <div className="harm-metric">
                <b>{result.hits}/{result.total}</b>
                <span>notas encaixadas</span>
              </div>
              <div className="harm-metric">
                <b>{Math.round(result.avgDev)}¢</b>
                <span>desvio do intervalo</span>
              </div>
            </div>
            {result.report && (
              <div style={{ width: '100%', maxWidth: 520 }}>
                <SessionSummary report={result.report} />
              </div>
            )}
            <div className="controls" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary" onClick={() => setPhase('ready')}>
                <Icon name="play" /> Treinar de novo
              </button>
              <ShareButton
                data={{
                  eyebrow: 'meu encaixe',
                  big: `${result.score}%`,
                  bigLabel: 'de encaixe',
                  title: `${ex.name} · ${part.name}`,
                  name: profile.name || undefined,
                  stats: [
                    { label: 'notas encaixadas', value: `${result.hits}/${result.total}` },
                    { label: 'desvio', value: `${Math.round(result.avgDev)}¢` },
                    { label: 'voz', value: part.name },
                  ],
                }}
                filename="canto-encaixe.png"
              />
              <button className="btn" onClick={() => navigate('/ministerio')}>
                Ir ao ministério
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Rodando ----
  if (phase === 'run') {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">{ex.name}</h1>
            <p className="page-sub">{part.name} · repetição {rep + 1} de {ex.reps}</p>
          </div>
          <span className="badge badge--gold"><Icon name="music" size={13} /> encaixe</span>
        </div>

        <div className="rev-track" aria-hidden="true">
          {Array.from({ length: ex.reps }).map((_, qi) => (
            <span key={qi} className="rev-dot" data-state={qi < rep ? 'done' : qi === rep ? 'now' : 'todo'} />
          ))}
        </div>

        <div className="card card--glow">
          <div className="player">
            <div className="harm-drone">
              <Icon name="wave" size={14} /> drone: {droneRef.current.map(midiLabel).join(' · ')}
            </div>
            <div className="display" ref={wrapRef} data-state="silent">
              <div className="display-sub">sua nota ({part.subtitle})</div>
              <div className="display-note" style={{ color: 'var(--gold-2)' }}>{midiLabel(targetRef.current)}</div>
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

            <div className="harm-hold">
              <span className="harm-hold-cap">sustente</span>
              <div className="bar" style={{ width: 220 }}>
                <div className="bar-fill" ref={holdBarRef} style={{ width: '0%' }} />
              </div>
            </div>

            <div className="harm-blend">
              <span className="harm-blend-cap"><Icon name="spark" size={12} /> encaixe</span>
              <div className="bar bar--blend" style={{ width: 220 }}>
                <div className="bar-fill" ref={blendBarRef} style={{ width: '0%', background: 'linear-gradient(90deg, var(--gold-deep), var(--good))' }} />
              </div>
            </div>

            <button className="btn btn--ghost" onClick={() => { stopAudio(); setPhase('ready') }}>Sair</button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Seleção (ready) ----
  const list = filter === 'todos' ? HARMONY_EXERCISES : HARMONY_EXERCISES.filter((e) => e.part === filter)
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/ministerio" className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Ministério</Link>
          <h1 className="page-title">Achar sua voz na harmonia</h1>
          <p className="page-sub">Cante a sua nota contra a referência e sinta o encaixe travar. Use fones para o drone não vazar no microfone.</p>
        </div>
      </div>

      <div className="card reveal r0">
        <div className="segmented" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
          {PART_FILTERS.map((p) => (
            <button key={p.id} data-active={filter === p.id} onClick={() => setFilter(p.id)}>{p.label}</button>
          ))}
        </div>

        <div className="harm-picker">
          {list.map((e) => (
            <button key={e.id} className="harm-card" data-active={e.id === exId} onClick={() => setExId(e.id)}>
              <span className="harm-card-top">
                <span className="harm-card-name">{e.name}</span>
                <span className="harm-card-diff">{'●'.repeat(e.difficulty)}<span className="faint">{'●'.repeat(5 - e.difficulty)}</span></span>
              </span>
              <span className="harm-card-part">{worshipPart(e.part).name} · {worshipPart(e.part).subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card card--glow reveal r1" style={{ marginTop: 18 }}>
        <div className="player">
          <span className="badge badge--gold"><Icon name="music" size={13} /> {part.name}</span>
          <p className="hint center" style={{ maxWidth: '48ch' }}>{ex.cue}</p>
          <button className="btn btn--primary" onClick={start} disabled={micStatus === 'starting'}>
            <Icon name="mic" /> {micStatus === 'starting' ? 'Liberando…' : 'Começar'}
          </button>
          {micStatus === 'error' && (
            <p className="hint center" style={{ color: 'var(--off)', maxWidth: '44ch' }}>
              Não consegui acessar o microfone. Verifique a permissão do navegador e tente de novo.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
