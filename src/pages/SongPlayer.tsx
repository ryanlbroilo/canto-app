import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import {
  getSong,
  songDurationSec,
  songLyrics,
  songSessionId,
  songTranspose,
  timedNotes,
} from '../data/songs'
import { finalizeHarmony, scoreNote } from '../data/harmonyScore'
import { TonePlayer } from '../audio/TonePlayer'
import { addSession, newId } from '../data/store'
import { SessionAggregator } from '../audio/session'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { centsZone } from '../theme'
import { Icon } from '../components/ui/Icon'
import { ShareButton } from '../components/ShareButton'
import { FeatureReport } from '../data/types'
import '../styles/musicas.css'
import '../styles/ministerio.css'

const LEAD_IN = 2 // segundos de contagem antes da música começar
const TAIL = 1 // segundos após a última nota antes de finalizar

interface SongResult {
  score: number
  hits: number
  total: number
  avgDev: number
  report?: FeatureReport
}

// SONG PLAYER — canta uma música. Dois modos: APRENDER (o app toca a melodia de
// referência, sem nota) e CANTAR (score-following leve: corre a melodia no relógio
// e compara o pitch do cantor com a nota-alvo, pontuando por nota). Reusa a
// PitchEngine, o TonePlayer e o scoring de encaixe da harmonia.
export default function SongPlayer() {
  const { id } = useParams()
  const { engine, baseline, reload, micStatus, profile } = useApp()
  const navigate = useNavigate()
  const song = id ? getSong(id) : undefined

  const shift = useMemo(() => (song ? songTranspose(song, baseline) : 0), [song, baseline])
  const notes = useMemo(() => (song ? timedNotes(song, shift) : []), [song, shift])
  const duration = song ? songDurationSec(song) : 0

  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready')
  const [mode, setMode] = useState<'learn' | 'sing'>('sing')
  const [activeIdx, setActiveIdx] = useState(-1)
  const [countIn, setCountIn] = useState(0)
  const [result, setResult] = useState<SongResult | null>(null)

  const toneRef = useRef<TonePlayer | null>(null)
  const modeRef = useRef<'learn' | 'sing'>('sing')
  const runStartRef = useRef(0)
  const activeIdxRef = useRef(-1)
  const lastGuidedRef = useRef(-1)
  const startedRef = useRef(false) // a música (pós-contagem) já começou?
  const lastCountRef = useRef(-1) // evita setState de contagem a cada frame
  const samplesByNote = useRef<Map<number, number[]>>(new Map())
  const steadyByNote = useRef<Map<number, number[]>>(new Map())
  const agg = useRef(new SessionAggregator())

  const wrapRef = useRef<HTMLDivElement>(null)
  const sungRef = useRef<HTMLSpanElement>(null)
  const centsRef = useRef<HTMLSpanElement>(null)
  const needleRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // pitch ao vivo (só chega frame no modo cantar, onde o mic está ligado)
  useEffect(() => {
    if (phase !== 'run') return
    const unsub = engine.subscribe((f) => {
      if (!startedRef.current) return // ignora frames da contagem (não poluem o report)
      const idx = activeIdxRef.current
      agg.current.push(f, idx >= 0 ? notes[idx].midi : undefined)
      const wrap = wrapRef.current
      if (f.freq != null && f.note != null && idx >= 0) {
        const cents = Math.round((freqToMidiFloat(f.freq) - notes[idx].midi) * 100)
        if (!samplesByNote.current.has(idx)) samplesByNote.current.set(idx, [])
        samplesByNote.current.get(idx)!.push(cents)
        if (f.steadiness != null) {
          if (!steadyByNote.current.has(idx)) steadyByNote.current.set(idx, [])
          steadyByNote.current.get(idx)!.push(f.steadiness)
        }
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

  // relógio: contagem → corre a melodia → finaliza
  useEffect(() => {
    if (phase !== 'run') return
    let raf = 0
    const tick = () => {
      const elapsed = (performance.now() - runStartRef.current) / 1000 - LEAD_IN
      if (elapsed < 0) {
        const c = Math.max(1, Math.ceil(-elapsed))
        if (lastCountRef.current !== c) {
          lastCountRef.current = c
          setCountIn(c)
        }
      } else {
        // a música começou de fato: alinha o agregador AQUI (exclui a contagem)
        if (!startedRef.current) {
          startedRef.current = true
          if (lastCountRef.current !== 0) {
            lastCountRef.current = 0
            setCountIn(0)
          }
          if (modeRef.current === 'sing') agg.current.start({ type: 'song', targetNotes: notes.map((x) => midiLabel(x.midi)) })
        }
        let idx = -1
        for (const nt of notes) {
          if (elapsed >= nt.startSec && elapsed < nt.endSec) {
            idx = nt.index
            break
          }
        }
        if (idx !== activeIdxRef.current) {
          activeIdxRef.current = idx
          setActiveIdx(idx)
        }
        if (barRef.current) barRef.current.style.width = `${Math.max(0, Math.min(100, (elapsed / duration) * 100))}%`
        // guia toca cada nota uma vez (só no modo aprender)
        if (modeRef.current === 'learn' && idx >= 0 && lastGuidedRef.current !== idx) {
          lastGuidedRef.current = idx
          toneRef.current?.playNote(notes[idx].midi, { level: 0.16 })
        }
        if (elapsed >= duration + TAIL) {
          finishAll()
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(
    () => () => {
      engine.stop()
      toneRef.current?.dispose()
    },
    [engine],
  )

  // Aba pro fundo durante o run: o RAF pausa e o cronômetro congela, o que
  // pontuaria notas puladas como erradas. Aborta pro ready (sem gravar sessão).
  useEffect(() => {
    if (phase !== 'run') return
    const onHide = () => {
      if (document.hidden) {
        engine.stop()
        toneRef.current?.stop()
        setActiveIdx(-1)
        setPhase('ready')
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [phase, engine])

  async function start(m: 'learn' | 'sing') {
    if (!song) return
    modeRef.current = m
    setMode(m)
    activeIdxRef.current = -1
    lastGuidedRef.current = -1
    startedRef.current = false
    lastCountRef.current = -1
    samplesByNote.current = new Map()
    steadyByNote.current = new Map()
    setActiveIdx(-1)
    setResult(null)
    setCountIn(LEAD_IN)
    if (!toneRef.current) toneRef.current = new TonePlayer()
    await toneRef.current.resume()
    if (m === 'sing') {
      await engine.start()
      if (engine.status !== 'running') return
    }
    runStartRef.current = performance.now()
    setPhase('run')
  }

  function finishAll() {
    if (modeRef.current === 'sing' && song) {
      const noteScores = notes.map((nt) => scoreNote(samplesByNote.current.get(nt.index) ?? [], steadyByNote.current.get(nt.index) ?? []))
      const res = finalizeHarmony(noteScores)
      engine.stop()
      toneRef.current?.stop()
      const report = agg.current.voicedCount >= 20 ? agg.current.finalize(newId()) : undefined
      addSession({
        id: report?.sessionId ?? newId(),
        dateISO: new Date().toISOString(),
        kind: 'exercise',
        exerciseId: songSessionId(song.id),
        label: `Música · ${song.title}`,
        durationSec: Math.round(duration),
        notesHitPct: res.notesHitPct,
        avgCentsDev: res.avgCentsDev,
        featureReport: report,
      })
      reload()
      setResult({ score: res.score, hits: res.hits, total: notes.length, avgDev: res.avgCentsDev, report })
    } else {
      toneRef.current?.stop()
    }
    setActiveIdx(-1)
    setPhase('done')
  }

  function exitRun() {
    engine.stop()
    toneRef.current?.stop()
    setPhase('ready')
  }

  if (!song) {
    return (
      <div className="page">
        <p className="hint">Música não encontrada. <Link to="/musicas" style={{ color: 'var(--gold-2)' }}>Voltar ao catálogo</Link></p>
      </div>
    )
  }

  // ---- Resultado ----
  if (phase === 'done') {
    if (mode === 'learn') {
      return (
        <div className="page">
          <div className="page-head"><div><h1 className="page-title">Melodia aprendida</h1><p className="page-sub">{song.title}</p></div></div>
          <div className="card card--glow">
            <div className="player">
              <div className="eva-avatar" style={{ width: 64, height: 64 }}><Icon name="check" size={30} /></div>
              <p className="hint center" style={{ maxWidth: '42ch' }}>Você ouviu a melodia inteira. Agora experimente cantar — eu comparo sua voz nota a nota.</p>
              <div className="controls" style={{ justifyContent: 'center' }}>
                <button className="btn btn--primary" onClick={() => start('sing')}><Icon name="mic" /> Cantar agora</button>
                <button className="btn" onClick={() => navigate('/musicas')}>Catálogo</button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    const r = result
    const good = (r?.score ?? 0) >= 75
    return (
      <div className="page">
        <div className="page-head"><div><h1 className="page-title">Música concluída</h1><p className="page-sub">{song.title}</p></div></div>
        <div className="card card--glow">
          <div className="player">
            <div className="score-big">{r?.score ?? 0}%</div>
            <p className="hint center" style={{ maxWidth: '44ch' }}>{good ? 'Mandou bem — sua voz seguiu a melodia com firmeza. 👏' : 'Boa! Continue treinando os trechos mais difíceis — a afinação melhora rápido.'}</p>
            <div className="harm-metrics">
              <div className="harm-metric"><b>{r?.hits ?? 0}/{r?.total ?? notes.length}</b><span>notas afinadas</span></div>
              <div className="harm-metric"><b>{Math.round(r?.avgDev ?? 0)}¢</b><span>desvio médio</span></div>
            </div>
            <div className="controls" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary" onClick={() => start('sing')}><Icon name="play" /> Cantar de novo</button>
              <ShareButton
                data={{
                  eyebrow: 'cantei no Canto',
                  big: `${r?.score ?? 0}%`,
                  bigLabel: 'de afinação',
                  title: song.title,
                  name: profile.name || undefined,
                  stats: [
                    { label: 'notas afinadas', value: `${r?.hits ?? 0}/${r?.total ?? notes.length}` },
                    { label: 'desvio', value: `${Math.round(r?.avgDev ?? 0)}¢` },
                    { label: 'música', value: song.composer },
                  ],
                }}
                filename="canto-musica.png"
              />
              <button className="btn" onClick={() => navigate('/musicas')}>Catálogo</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Rodando ----
  if (phase === 'run') {
    const active = activeIdx >= 0 ? notes[activeIdx] : undefined
    return (
      <div className="page">
        <div className="page-head">
          <div><h1 className="page-title">{song.title}</h1><p className="page-sub">{mode === 'learn' ? 'Aprendendo a melodia' : 'Cantando'} · {song.bpm} BPM</p></div>
          <span className="badge badge--gold"><Icon name="music" size={13} /> {mode === 'learn' ? 'guia' : 'pontuado'}</span>
        </div>

        <div className="card card--glow">
          <div className="player">
            {countIn > 0 ? (
              <div className="song-count">{countIn}</div>
            ) : (
              <>
                <div className="display" ref={wrapRef} data-state="silent">
                  <div className="display-sub">{active ? 'nota' : '♪'}</div>
                  <div className="display-note" style={{ color: 'var(--gold-2)' }}>{active ? midiLabel(active.midi) : '—'}</div>
                  {mode === 'sing' && (
                    <>
                      <div className="range-live-cap">você: <span ref={sungRef}>—</span> · <span className="mono" ref={centsRef}>—</span></div>
                      <div className="cents-track">
                        <span className="cents-tick cents-tick--left">-50</span>
                        <span className="cents-center" />
                        <span className="cents-tick cents-tick--right">+50</span>
                        <div className="cents-needle" ref={needleRef} style={{ left: '50%' }} />
                      </div>
                    </>
                  )}
                </div>

                <div className="song-lyrics">
                  {notes.map((nt) => (
                    <span key={nt.index} className="song-syl" data-state={nt.index === activeIdx ? 'now' : nt.index < activeIdx ? 'done' : 'todo'}>{nt.lyric}</span>
                  ))}
                </div>
              </>
            )}

            <div className="bar" style={{ width: '100%', maxWidth: 460 }}>
              <div className="bar-fill" ref={barRef} style={{ width: '0%' }} />
            </div>
            <button className="btn btn--ghost" onClick={exitRun}>Sair</button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Pronto (escolha do modo) ----
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/musicas" className="btn btn--sm btn--ghost" style={{ marginBottom: 10 }}>← Catálogo</Link>
          <h1 className="page-title">{song.title}</h1>
          <p className="page-sub">{song.composer} · {song.keyLabel} · {song.bpm} BPM</p>
        </div>
        <span className="badge">{song.source === 'autoral' ? 'autoral' : 'domínio público'}</span>
      </div>

      <div className="card card--glow reveal r0">
        <div className="player">
          <p className="song-lyrics-preview">{songLyrics(song)}</p>
          <p className="hint center" style={{ maxWidth: '46ch', fontSize: 12 }}>{song.sourceNote}. Use fones pra referência não vazar no microfone.</p>

          <div className="controls" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => start('learn')} disabled={micStatus === 'starting'}><Icon name="play" /> Aprender a melodia</button>
            <button className="btn btn--primary" onClick={() => start('sing')} disabled={micStatus === 'starting'}><Icon name="mic" /> {micStatus === 'starting' ? 'Liberando…' : 'Cantar'}</button>
          </div>
          {micStatus === 'error' && (
            <p className="hint center" style={{ color: 'var(--off)', maxWidth: '44ch' }}>Não consegui acessar o microfone. Verifique a permissão do navegador e tente de novo.</p>
          )}
        </div>
      </div>
    </div>
  )
}
