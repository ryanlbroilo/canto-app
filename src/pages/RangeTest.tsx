import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { PitchEngine } from '../audio/PitchEngine'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { estimateVoiceType } from '../audio/voiceType'
import { VocalBaseline } from '../data/types'
import { saveBaseline } from '../data/store'
import { Icon } from '../components/ui/Icon'

type Step = 'intro' | 'low' | 'high' | 'done'
const MIN_SAMPLES = 30
const WINDOW = 90

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

/** Fluxo do teste de range (reutilizável — página e onboarding). */
export function RangeTestFlow({
  engine,
  onDone,
  onCancel,
}: {
  engine: PitchEngine
  onDone: (b: VocalBaseline) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<Step>('intro')
  const [low, setLow] = useState<number | null>(null)
  const [includesFalsetto, setIncludesFalsetto] = useState(false)
  const [canCapture, setCanCapture] = useState(false)
  const [result, setResult] = useState<VocalBaseline | null>(null)
  const samplesRef = useRef<number[]>([])
  const liveRef = useRef<HTMLDivElement>(null)
  const canCaptureRef = useRef(false)

  useEffect(() => {
    if (step !== 'low' && step !== 'high') return
    samplesRef.current = []
    setCanCapture(false)
    canCaptureRef.current = false
    const unsub = engine.subscribe((f) => {
      const live = liveRef.current
      if (f.freq != null && f.note != null) {
        const arr = samplesRef.current
        arr.push(freqToMidiFloat(f.freq))
        if (arr.length > WINDOW) arr.shift()
        if (live) {
          live.textContent = `${f.note.name}${f.note.octave}`
          live.dataset.on = '1'
        }
      } else if (live) {
        live.textContent = '—'
        live.dataset.on = '0'
      }
      const enough = samplesRef.current.length >= MIN_SAMPLES
      if (enough !== canCaptureRef.current) {
        canCaptureRef.current = enough
        setCanCapture(enough)
      }
    })
    return unsub
  }, [engine, step])

  useEffect(() => () => engine.stop(), [engine])

  async function begin() {
    await engine.start()
    if (engine.status === 'running') setStep('low')
  }
  function capture() {
    const arr = samplesRef.current.filter((v) => Number.isFinite(v))
    if (arr.length < MIN_SAMPLES) return
    const m = Math.round(median(arr))
    if (step === 'low') {
      setLow(m)
      setStep('high')
    } else if (step === 'high' && low != null) {
      const [lo, hi] = low <= m ? [low, m] : [m, low]
      const b: VocalBaseline = {
        lowMidi: lo,
        highMidi: hi,
        voiceType: estimateVoiceType(lo, hi),
        includesFalsetto,
        measuredAt: new Date().toISOString(),
      }
      saveBaseline(b)
      engine.stop()
      setResult(b)
      setStep('done')
    }
  }

  if (step === 'intro') {
    return (
      <div className="card card--glow stack gap-3">
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Teste de extensão vocal
        </h2>
        <p className="hint">
          Vamos medir sua nota mais grave e mais aguda. Ambiente silencioso, de fones se puder. <strong>Não force</strong> — canto não dói.
        </p>
        <ul className="range-tips">
          <li>Aqueça a voz antes (uma sirene leve já ajuda).</li>
          <li>Use <strong>voz plena</strong> (conectada), não falsete solto.</li>
          <li>Sustente cada nota por ~2 segundos antes de capturar.</li>
        </ul>
        <div className="controls">
          <button className="btn btn--primary" onClick={begin} disabled={engine.status === 'starting'}>
            <Icon name="mic" /> {engine.status === 'starting' ? 'Liberando microfone…' : 'Começar teste'}
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Voltar
          </button>
        </div>
        {engine.status === 'error' && <p className="hint hint--error">Não consegui acessar o microfone. Verifique a permissão.</p>}
      </div>
    )
  }

  if (step === 'low' || step === 'high') {
    const isLow = step === 'low'
    return (
      <div className="card card--glow stack gap-3">
        <span className="card-title">Passo {isLow ? '1' : '2'} de 2</span>
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Sua nota mais {isLow ? 'GRAVE' : 'AGUDA'}
        </h2>
        <p className="hint">
          {isLow ? 'Desça confortavelmente e sustente a nota mais baixa que sair limpa.' : 'Suba confortavelmente e sustente a nota mais alta em voz plena.'}
        </p>
        <div className="range-live">
          <div className="range-live-note" ref={liveRef} data-on="0">
            —
          </div>
          <div className="range-live-cap">{canCapture ? 'segurando… pode capturar' : 'sustente com firmeza'}</div>
        </div>
        {!isLow && low != null && (
          <p className="hint">
            Grave capturado: <strong>{midiLabel(low)}</strong>
          </p>
        )}
        {!isLow && (
          <label className="check">
            <input type="checkbox" checked={includesFalsetto} onChange={(e) => setIncludesFalsetto(e.target.checked)} />
            <span>Usei falsete para alcançar o topo</span>
          </label>
        )}
        <div className="controls">
          <button className="btn btn--primary" onClick={capture} disabled={!canCapture}>
            {isLow ? 'Capturar grave' : 'Capturar aguda e finalizar'}
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  const b = result!
  const semitones = b.highMidi - b.lowMidi
  return (
    <div className="card card--glow stack gap-3 center">
      <span className="card-title">Seu range</span>
      <div className="row gap-2" style={{ justifyContent: 'center' }}>
        <span className="range-note">{midiLabel(b.lowMidi)}</span>
        <span className="range-arrow">→</span>
        <span className="range-note">{midiLabel(b.highMidi)}</span>
      </div>
      <p className="hint">
        <strong>{semitones}</strong> semitons · <strong>{(semitones / 12).toFixed(1)}</strong> oitavas · tipo aproximado <strong>{b.voiceType}</strong>
        {b.includesFalsetto && ' · topo c/ falsete'}
      </p>
      <div className="controls" style={{ justifyContent: 'center' }}>
        <button className="btn btn--primary" onClick={() => onDone(b)}>
          <Icon name="check" /> Concluir
        </button>
      </div>
    </div>
  )
}

export default function RangeTestPage() {
  const { engine, reload } = useApp()
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meu range</h1>
          <p className="page-sub">Meça sua extensão vocal e acompanhe a evolução ao longo do tempo.</p>
        </div>
      </div>
      <RangeTestFlow
        engine={engine}
        onDone={() => {
          reload()
          navigate('/')
        }}
        onCancel={() => navigate('/')}
      />
    </div>
  )
}
