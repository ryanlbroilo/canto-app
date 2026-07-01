import '../styles/range.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { PitchEngine } from '../audio/PitchEngine'
import { freqToMidiFloat, midiLabel, midiToName } from '../audio/notes'
import { estimateVoiceType, VOICE_TYPE_RANGES } from '../audio/voiceType'
import { VocalBaseline } from '../data/types'
import { saveBaseline, getRangeDelta, RangeDelta } from '../data/store'
import { Icon } from '../components/ui/Icon'

// Fluxo enriquecido: grave → agudo → (tessitura opcional) → (passaggio opcional) → resultado.
type Step = 'intro' | 'low' | 'high' | 'tessitura' | 'passaggio' | 'done'
const MIN_SAMPLES = 30
const WINDOW = 90
// Passaggio: nº mínimo de amostras da sirene antes de aceitar a captura da quebra.
const SIREN_MIN_SAMPLES = 40

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

/** Desvio-padrão amostral (em semitons) — mede oscilação da nota sustentada. */
function stdev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = arr.reduce((a, b) => a + b, 0) / arr.length
  const v = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / (arr.length - 1)
  return Math.sqrt(v)
}

/**
 * Converte o desvio-padrão (semitons) de uma captura sustentada em um score de
 * firmeza 0..100. ~0 semitom → 100 (rocha); ~1 semitom de oscilação → ~0.
 * Curva suave para não punir o micro-vibrato natural.
 */
function steadinessScore(sd: number): number {
  const s = Math.max(0, 1 - sd / 1.0)
  return Math.round(s * s * 100) // quadrático: penaliza mais a oscilação alta
}

/** Zonas de registro estimadas a partir do passaggio, para colorir o mapa. */
const ZONE_COLORS = {
  peito: '#e9b44c',
  mix: '#57d6a6',
  cabeça: '#7fb2ff',
  falsete: '#c48bff',
} as const

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
  const [high, setHigh] = useState<number | null>(null)
  const [includesFalsetto, setIncludesFalsetto] = useState(false)
  const [canCapture, setCanCapture] = useState(false)
  // Firmeza da captura corrente (0..100) + rótulo; alimentada durante grave/agudo/tessitura.
  const [steady, setSteady] = useState<number | null>(null)
  // Firmeza acumulada dos extremos (média grave+agudo) → stabilityScore do baseline.
  const stabScoresRef = useRef<number[]>([])
  // Tessitura confortável capturada (faixa sustentada).
  const [tessLow, setTessLow] = useState<number | null>(null)
  const [tessHigh, setTessHigh] = useState<number | null>(null)
  // Passaggio detectado via evento de quebra durante a sirene (MIDI).
  const [passaggio, setPassaggio] = useState<number | null>(null)
  const [sirenReady, setSirenReady] = useState(false)
  const [result, setResult] = useState<VocalBaseline | null>(null)
  const [delta, setDelta] = useState<RangeDelta | null>(null)

  const samplesRef = useRef<number[]>([])
  // Para a tessitura guardamos o range percorrido (min/max sustentado), não só a mediana.
  const tessMinRef = useRef<number>(Infinity)
  const tessMaxRef = useRef<number>(-Infinity)
  // Passaggio: nota MIDI no frame em que register.event === 'quebra' (a última é a melhor aposta).
  const breakMidiRef = useRef<number | null>(null)
  const sirenCountRef = useRef(0)
  const liveRef = useRef<HTMLDivElement>(null)
  const canCaptureRef = useRef(false)

  // ---- Captura sustentada (grave / agudo / tessitura) ----
  useEffect(() => {
    if (step !== 'low' && step !== 'high' && step !== 'tessitura') return
    samplesRef.current = []
    tessMinRef.current = Infinity
    tessMaxRef.current = -Infinity
    setCanCapture(false)
    setSteady(null)
    canCaptureRef.current = false
    const unsub = engine.subscribe((f) => {
      const live = liveRef.current
      if (f.freq != null && f.note != null) {
        const midiF = freqToMidiFloat(f.freq)
        const arr = samplesRef.current
        arr.push(midiF)
        if (arr.length > WINDOW) arr.shift()
        // tessitura: acompanha os extremos percorridos enquanto sustenta a faixa
        if (step === 'tessitura') {
          if (midiF < tessMinRef.current) tessMinRef.current = midiF
          if (midiF > tessMaxRef.current) tessMaxRef.current = midiF
        }
        if (live) {
          live.textContent = `${f.note.name}${f.note.octave}`
          live.dataset.on = '1'
        }
        // firmeza ao vivo: desvio-padrão da janela recente
        if (arr.length >= MIN_SAMPLES) {
          setSteady(steadinessScore(stdev(arr)))
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

  // ---- Micro-teste de passaggio: escuta eventos de quebra durante a sirene ----
  useEffect(() => {
    if (step !== 'passaggio') return
    breakMidiRef.current = null
    sirenCountRef.current = 0
    setSirenReady(false)
    setPassaggio(null)
    const unsub = engine.subscribe((f) => {
      const live = liveRef.current
      if (f.freq != null && f.note != null) {
        sirenCountRef.current++
        if (live) {
          live.textContent = `${f.note.name}${f.note.octave}`
          live.dataset.on = '1'
        }
        // Registra a nota onde o motor sinalizou quebra de registro.
        if (f.register?.event === 'quebra') {
          breakMidiRef.current = Math.round(freqToMidiFloat(f.freq))
          setPassaggio(breakMidiRef.current)
        }
        if (sirenCountRef.current >= SIREN_MIN_SAMPLES && !sirenReady) setSirenReady(true)
      } else if (live) {
        live.textContent = '—'
        live.dataset.on = '0'
      }
    })
    return unsub
  }, [engine, step, sirenReady])

  useEffect(() => () => engine.stop(), [engine])

  async function begin() {
    await engine.start()
    if (engine.status === 'running') setStep('low')
  }

  function capture() {
    const arr = samplesRef.current.filter((v) => Number.isFinite(v))
    if (arr.length < MIN_SAMPLES) return
    const m = Math.round(median(arr))
    const sd = stdev(arr)
    stabScoresRef.current.push(steadinessScore(sd))
    if (step === 'low') {
      setLow(m)
      setStep('high')
    } else if (step === 'high') {
      setHigh(m)
      setStep('tessitura') // passo opcional a seguir
    }
  }

  /** Captura a faixa confortável percorrida (tessitura) e avança para o passaggio. */
  function captureTessitura() {
    const lo = tessMinRef.current
    const hi = tessMaxRef.current
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi - lo >= 1) {
      setTessLow(Math.round(lo))
      setTessHigh(Math.round(hi))
    }
    setStep('passaggio')
  }

  /** Finaliza montando o baseline com todos os campos (opcionais quando ausentes). */
  function finish() {
    if (low == null || high == null) return
    const [lo, hi] = low <= high ? [low, high] : [high, low]
    // Firmeza global = média das capturas de extremos (0..100).
    const scores = stabScoresRef.current
    const stabilityScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined
    // Tessitura só se coerente e dentro da extensão.
    let tLo = tessLow != null ? Math.max(lo, tessLow) : undefined
    let tHi = tessHigh != null ? Math.min(hi, tessHigh) : undefined
    if (tLo != null && tHi != null && tHi - tLo < 1) {
      tLo = undefined
      tHi = undefined
    }
    // Passaggio só se dentro da extensão medida.
    const pass = passaggio != null && passaggio > lo && passaggio < hi ? passaggio : undefined
    const b: VocalBaseline = {
      lowMidi: lo,
      highMidi: hi,
      voiceType: estimateVoiceType(lo, hi, tLo, tHi),
      includesFalsetto,
      measuredAt: new Date().toISOString(),
      ...(tLo != null && tHi != null ? { tessituraLowMidi: tLo, tessituraHighMidi: tHi } : {}),
      ...(pass != null ? { passaggioMidi: pass } : {}),
      ...(stabilityScore != null ? { stabilityScore } : {}),
    }
    setDelta(getRangeDelta(b)) // compara com o teste anterior ANTES de salvar
    saveBaseline(b)
    engine.stop()
    setResult(b)
    setStep('done')
  }

  // -------------------- INTRO --------------------
  if (step === 'intro') {
    return (
      <div className="card card--glow stack gap-3">
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Teste de extensão vocal
        </h2>
        <p className="hint">
          Vamos medir sua nota mais grave e mais aguda, sua faixa confortável e onde sua voz vira. Ambiente silencioso, de fones se puder.{' '}
          <strong>Não force</strong> — canto não dói.
        </p>
        <ul className="range-tips">
          <li>Aqueça a voz antes (uma sirene leve já ajuda).</li>
          <li>
            Use <strong>voz plena</strong> (conectada), não falsete solto.
          </li>
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

  // -------------------- GRAVE / AGUDA --------------------
  if (step === 'low' || step === 'high') {
    const isLow = step === 'low'
    return (
      <div className="card card--glow stack gap-3">
        <span className="card-title">Passo {isLow ? '1' : '2'} de 4</span>
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Sua nota mais {isLow ? 'GRAVE' : 'AGUDA'}
        </h2>
        <p className="hint">
          {isLow
            ? 'Desça confortavelmente e sustente a nota mais baixa que sair limpa.'
            : 'Suba confortavelmente e sustente a nota mais alta em voz plena.'}
        </p>
        <div className="range-live">
          <div className="range-live-note" ref={liveRef} data-on="0">
            —
          </div>
          <div className="range-live-cap">{canCapture ? 'segurando… pode capturar' : 'sustente com firmeza'}</div>
        </div>
        <SteadinessMeter score={steady} active={canCapture} />
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
            {isLow ? 'Capturar grave' : 'Capturar aguda'}
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // -------------------- TESSITURA (opcional) --------------------
  if (step === 'tessitura') {
    return (
      <div className="card card--glow stack gap-3">
        <span className="card-title">Passo 3 de 4 · opcional</span>
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Sua faixa confortável
        </h2>
        <p className="hint">
          Cante uma frase ou vocalize <strong>de baixo pra cima e de volta</strong>, na região onde você canta sem esforço. Vamos marcar essa
          zona confortável (tessitura).
        </p>
        <div className="range-live">
          <div className="range-live-note" ref={liveRef} data-on="0">
            —
          </div>
          <div className="range-live-cap">passeie pela sua zona confortável</div>
        </div>
        <SteadinessMeter score={steady} active={canCapture} label="qualidade do sinal" />
        <div className="controls">
          <button className="btn btn--primary" onClick={captureTessitura} disabled={!canCapture}>
            <Icon name="check" /> Marcar faixa confortável
          </button>
          <button className="btn btn--ghost" onClick={() => setStep('passaggio')}>
            Pular este passo
          </button>
        </div>
      </div>
    )
  }

  // -------------------- PASSAGGIO via sirene (opcional) --------------------
  if (step === 'passaggio') {
    return (
      <div className="card card--glow stack gap-3">
        <span className="card-title">Passo 4 de 4 · opcional</span>
        <h2 className="page-title" style={{ fontSize: 24 }}>
          Onde sua voz vira
        </h2>
        <p className="hint">
          Faça uma <strong>sirene</strong> (glissando) lenta do grave ao agudo, num “uuu”. Vamos tentar detectar o ponto onde a voz muda de
          registro (o <strong>passaggio</strong>). É uma estimativa.
        </p>
        <div className="range-live">
          <div className="range-live-note" ref={liveRef} data-on="0">
            —
          </div>
          <div className="range-live-cap">
            {passaggio != null ? `quebra detectada perto de ${midiLabel(passaggio)}` : sirenReady ? 'suba e desça algumas vezes' : 'comece a sirene…'}
          </div>
        </div>
        {passaggio != null && (
          <p className="hint">
            <Icon name="bridge" /> Passaggio estimado: <strong>{midiLabel(passaggio)}</strong>
          </p>
        )}
        <div className="controls">
          <button className="btn btn--primary" onClick={finish}>
            <Icon name="check" /> Finalizar teste
          </button>
          <button className="btn btn--ghost" onClick={finish}>
            {passaggio != null ? 'Usar e finalizar' : 'Finalizar sem passaggio'}
          </button>
        </div>
      </div>
    )
  }

  // -------------------- RESULTADO --------------------
  const b = result!
  return <RangeResult baseline={b} delta={delta} onDone={() => onDone(b)} />
}

// ============================================================
//  Componentes de apresentação do resultado
// ============================================================

/** Barra de firmeza (0..100) com rótulo vivo durante a captura. */
function SteadinessMeter({ score, active, label = 'firmeza' }: { score: number | null; active: boolean; label?: string }) {
  if (score == null) return null
  const firm = score >= 70
  const tone = firm ? 'ok' : score >= 40 ? 'mid' : 'low'
  return (
    <div className="rng-steady" data-active={active ? '1' : '0'}>
      <div className="rng-steady-head">
        <span className="rng-steady-label">{label}</span>
        <span className={`rng-steady-verdict rng-steady-verdict--${tone}`}>
          {firm ? 'nota firme ✓' : score >= 40 ? 'quase lá' : 'oscila — tente de novo'}
        </span>
      </div>
      <div className="rng-steady-track">
        <div className={`rng-steady-fill rng-steady-fill--${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

/**
 * Mapa visual do range: barra grave→agudo com faixas de registro estimadas a
 * partir do passaggio, tessitura destacada, marca do passaggio e banda de
 * referência do tipo vocal. Tudo em MIDI, escala compartilhada.
 */
function RangeMap({ b }: { b: VocalBaseline }) {
  const ref = VOICE_TYPE_RANGES[b.voiceType]
  // Domínio da escala: envolve extensão do usuário E a banda de referência, com folga.
  const lo = Math.min(b.lowMidi, ref?.lowMidi ?? b.lowMidi) - 2
  const hi = Math.max(b.highMidi, ref?.highMidi ?? b.highMidi) + 2
  const span = Math.max(1, hi - lo)
  const pct = (m: number) => ((m - lo) / span) * 100

  // Passaggio para dividir registros. Se não medido, estima ~55% da extensão.
  const passaggio = b.passaggioMidi ?? Math.round(b.lowMidi + 0.55 * (b.highMidi - b.lowMidi))
  // Falsete começa acima da tessitura confortável (se houver), senão a ~85% do topo.
  const falsetteStart = b.includesFalsetto ? (b.tessituraHighMidi ?? Math.round(b.lowMidi + 0.85 * (b.highMidi - b.lowMidi))) : b.highMidi
  // Faixas de registro dentro da extensão do usuário: peito → mix → cabeça → (falsete).
  const mixStart = Math.round(passaggio - (b.highMidi - b.lowMidi) * 0.06)
  const segs: { from: number; to: number; zone: keyof typeof ZONE_COLORS }[] = [
    { from: b.lowMidi, to: mixStart, zone: 'peito' },
    { from: mixStart, to: passaggio, zone: 'mix' },
    { from: passaggio, to: falsetteStart, zone: 'cabeça' },
  ]
  if (falsetteStart < b.highMidi) segs.push({ from: falsetteStart, to: b.highMidi, zone: 'falsete' })

  // Marcadores de oitava (C) para leitura da escala.
  const ticks: number[] = []
  for (let m = Math.ceil(lo); m <= hi; m++) if (m % 12 === 0) ticks.push(m) // Cs

  return (
    <div className="rng-map">
      {/* Banda de referência do tipo vocal */}
      {ref && (
        <div className="rng-map-refrow">
          <span className="rng-map-reflabel">típico {b.voiceType}</span>
          <div className="rng-map-refband" style={{ left: `${pct(ref.lowMidi)}%`, width: `${pct(ref.highMidi) - pct(ref.lowMidi)}%` }} />
        </div>
      )}

      {/* Barra principal com faixas de registro */}
      <div className="rng-map-bar">
        {segs.map((s, i) => (
          <div
            key={i}
            className="rng-map-seg"
            title={s.zone}
            style={{
              left: `${pct(s.from)}%`,
              width: `${Math.max(0, pct(s.to) - pct(s.from))}%`,
              background: ZONE_COLORS[s.zone],
            }}
          />
        ))}

        {/* Tessitura confortável destacada */}
        {b.tessituraLowMidi != null && b.tessituraHighMidi != null && (
          <div
            className="rng-map-tess"
            title="faixa confortável"
            style={{ left: `${pct(b.tessituraLowMidi)}%`, width: `${pct(b.tessituraHighMidi) - pct(b.tessituraLowMidi)}%` }}
          />
        )}

        {/* Marca do passaggio */}
        {b.passaggioMidi != null && (
          <div className="rng-map-pass" style={{ left: `${pct(b.passaggioMidi)}%` }} title={`passaggio ~${midiLabel(b.passaggioMidi)}`}>
            <span className="rng-map-pass-flag">{midiLabel(b.passaggioMidi)}</span>
          </div>
        )}

        {/* Extremos rotulados */}
        <span className="rng-map-end rng-map-end--lo" style={{ left: `${pct(b.lowMidi)}%` }}>
          {midiLabel(b.lowMidi)}
        </span>
        <span className="rng-map-end rng-map-end--hi" style={{ left: `${pct(b.highMidi)}%` }}>
          {midiLabel(b.highMidi)}
        </span>

        {/* Ticks de oitava */}
        {ticks.map((m) => (
          <span key={m} className="rng-map-tick" style={{ left: `${pct(m)}%` }}>
            {midiToName(m).name}
            {midiToName(m).octave}
          </span>
        ))}
      </div>

      {/* Legenda das zonas presentes */}
      <div className="rng-map-legend">
        {segs.map((s) => s.zone).filter((z, i, a) => a.indexOf(z) === i).map((z) => (
          <span key={z} className="rng-map-key">
            <i style={{ background: ZONE_COLORS[z] }} /> {z}
          </span>
        ))}
        {b.tessituraLowMidi != null && (
          <span className="rng-map-key">
            <i className="rng-map-key--tess" /> confortável
          </span>
        )}
      </div>
    </div>
  )
}

/** Cartão de resultado: números, deltas com o teste anterior e o mapa. */
function RangeResult({ baseline: b, delta, onDone }: { baseline: VocalBaseline; delta: RangeDelta | null; onDone: () => void }) {
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
        <strong>{semitones}</strong> semitons · <strong>{(semitones / 12).toFixed(1)}</strong> oitavas · tipo aproximado{' '}
        <strong>{b.voiceType}</strong>
        {b.includesFalsetto && ' · topo c/ falsete'}
      </p>

      {/* Chips extras quando medidos */}
      <div className="rng-chips">
        {b.tessituraLowMidi != null && b.tessituraHighMidi != null && (
          <span className="rng-chip">
            <Icon name="target" /> confortável {midiLabel(b.tessituraLowMidi)}–{midiLabel(b.tessituraHighMidi)}
          </span>
        )}
        {b.passaggioMidi != null && (
          <span className="rng-chip">
            <Icon name="bridge" /> passaggio ~{midiLabel(b.passaggioMidi)}
          </span>
        )}
        {b.stabilityScore != null && (
          <span className="rng-chip">
            <Icon name="spark" /> firmeza {b.stabilityScore}/100
          </span>
        )}
      </div>

      {/* Mapa visual */}
      <RangeMap b={b} />

      {/* Histórico / deltas */}
      <DeltaBanner b={b} delta={delta} semitones={semitones} />

      <div className="controls" style={{ justifyContent: 'center' }}>
        <button className="btn btn--primary" onClick={onDone}>
          <Icon name="check" /> Concluir
        </button>
      </div>
    </div>
  )
}

/** Banner de evolução vs teste anterior — celebra o primeiro teste com elegância. */
function DeltaBanner({ b, delta, semitones }: { b: VocalBaseline; delta: RangeDelta | null; semitones: number }) {
  if (!delta) {
    return (
      <div className="rng-delta rng-delta--first">
        <Icon name="star" />
        <span>
          Primeiro teste registrado! Guardamos <strong>{(semitones / 12).toFixed(1)} oitavas</strong> como sua linha de base — refaça em
          algumas semanas pra ver a evolução.
        </span>
      </div>
    )
  }
  const gains: string[] = []
  if (delta.highSemis > 0) gains.push(`+${delta.highSemis} no agudo`)
  if (delta.lowSemis > 0) gains.push(`+${delta.lowSemis} no grave`)
  const anyGain = gains.length > 0
  const dayTxt = delta.days === 0 ? 'hoje mesmo' : delta.days === 1 ? 'desde ontem' : `em ${delta.days} dias`
  return (
    <div className={`rng-delta ${anyGain ? 'rng-delta--up' : delta.totalSemis < 0 ? 'rng-delta--down' : ''}`}>
      <Icon name={anyGain ? 'flame' : 'chart'} />
      <span>
        {anyGain ? (
          <>
            Você ganhou <strong>{gains.join(' e ')}</strong> {dayTxt}!
          </>
        ) : delta.totalSemis < 0 ? (
          <>
            Um pouco abaixo do último teste ({delta.totalSemis} semitom{Math.abs(delta.totalSemis) > 1 ? 's' : ''}) — dias ruins acontecem,
            siga treinando.
          </>
        ) : (
          <>Extensão estável vs o último teste ({dayTxt}). Consistência também é evolução.</>
        )}{' '}
        Agora: <strong>{semitones}</strong> semitons.
      </span>
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
