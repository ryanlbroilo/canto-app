import { useEffect, useRef, useState } from 'react'
import { useApp } from '../app/AppContext'
import { PitchDisplay } from '../components/PitchDisplay'
import { PitchGraph } from '../components/PitchGraph'
import { TargetPicker } from '../components/TargetPicker'
import { LevelMeter } from '../components/LevelMeter'
import { VoiceInsights } from '../components/audio/VoiceInsights'
import { SessionSummary } from '../components/audio/SessionSummary'
import { Icon } from '../components/ui/Icon'
import { addSession, newId } from '../data/store'
import { SessionAggregator } from '../audio/session'
import { FeatureReport } from '../data/types'

export default function Practice() {
  const { engine, micStatus, reload } = useApp()
  const [target, setTarget] = useState<number | null>(null)
  const [lastReport, setLastReport] = useState<FeatureReport | null>(null)
  const running = micStatus === 'running'

  const aggRef = useRef(new SessionAggregator())
  const activeRef = useRef(false)
  const targetRef = useRef<number | null>(null)
  targetRef.current = target

  // Acumula todos os frames no agregador → feature-JSON (contrato DSP→EVA).
  useEffect(() => {
    return engine.subscribe((f) => {
      if (activeRef.current) aggRef.current.push(f, targetRef.current ?? undefined)
    })
  }, [engine])

  useEffect(() => {
    return () => {
      finalize()
      engine.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function start() {
    aggRef.current.start()
    activeRef.current = true
    setLastReport(null)
    engine.start()
  }
  function stop() {
    finalize()
    engine.stop()
  }
  function finalize() {
    if (!activeRef.current) return
    activeRef.current = false
    const agg = aggRef.current
    if (agg.voicedCount < 30) return // curta/silenciosa demais para valer
    const report = agg.finalize(newId())
    if (report.durationSec < 15) return
    addSession({
      id: report.sessionId,
      dateISO: new Date().toISOString(),
      kind: 'practice',
      label: 'Prática livre',
      durationSec: Math.round(report.durationSec),
      notesHitPct: report.performance.notesHitPct,
      avgCentsDev: report.performance.avgCentsDeviation,
      featureReport: report,
    })
    setLastReport(report)
    reload()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Prática livre</h1>
          <p className="page-sub">Cante o que quiser e veja sua afinação em tempo real. Escolha uma nota-alvo para mirar uma altura específica.</p>
        </div>
      </div>

      <div className="card card--glow stack gap-3 reveal r0">
        <PitchDisplay engine={engine} target={target} />
        <PitchGraph engine={engine} target={target} />
        <VoiceInsights engine={engine} />
        <div className="controls">
          {!running ? (
            <button className="btn btn--primary" onClick={start} disabled={micStatus === 'starting'}>
              <Icon name="mic" /> {micStatus === 'starting' ? 'Liberando microfone…' : 'Começar'}
            </button>
          ) : (
            <button className="btn" onClick={stop}>
              Parar
            </button>
          )}
          <TargetPicker target={target} onChange={setTarget} />
          <LevelMeter engine={engine} />
        </div>
        {micStatus === 'error' && (
          <p className="hint hint--error">Não consegui acessar o microfone. Verifique a permissão do navegador (precisa de microfone e contexto seguro).</p>
        )}
        {running && (
          <p className="hint">
            {target == null ? 'Modo afinador: mostro a nota mais próxima e o desvio.' : 'Modo alvo: fique na zona verde e sustente no centro.'}{' '}
            <span className="live">● ao vivo · {Math.round(engine.sampleRate / 1000)} kHz</span>
          </p>
        )}
      </div>

      {!running && lastReport && (
        <div className="card stack gap-3 reveal r1">
          <div className="row gap-2" style={{ alignItems: 'center' }}>
            <span className="eva-avatar" style={{ width: 34, height: 34, borderRadius: 11 }}>
              <Icon name="check" size={17} />
            </span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Resumo da sessão</h2>
              <p className="hint" style={{ margin: 0 }}>
                As mesmas features que a EVA lê — {Math.round(lastReport.durationSec)}s cantados.
              </p>
            </div>
          </div>
          <SessionSummary report={lastReport} />
        </div>
      )}
    </div>
  )
}
