import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { drawSongRoll, rollPitchRange, type NoteResult } from '../audio/songRoll'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { Icon } from '../components/ui/Icon'
import { formatDuration } from '../data/karaoke'
import { getKaraokeSession, setKaraokeRun, type KaraokeSession } from '../data/karaoke-session'
import { alignPhrases, rhythmicTendencyMs, type SungFrame } from '../domain/karaoke/align'
import { attributeRun, type Attribution, type Finding } from '../domain/karaoke/attribute'
import { measureRun, runCoverage, type SungNote } from '../domain/karaoke/measure'
import { estimateAllCapabilities } from '../domain/karaoke/capability'
import { judgeRun, type SkillVerdict, type Verdict } from '../domain/karaoke/verdict'
import { capabilityInputFromStore } from '../data/karaoke-capability'
import { currentTrackLevel, nextFromVerdict, type KaraokeNext } from '../data/karaoke-next'
import { getExercise } from '../data/exercises'
import { SKILLS } from '../data/skills'
import '../styles/karaoke.css'

const ROLL_H = 240
/** Rastro do cantor desenhado no rolo (s). O mesmo que o SongPlayer usa. */
const TRACE_SEC = 2.5

/** Nenhuma nota acende verde ou vermelho durante o canto — ver o comentário do run. */
const NO_LIVE_JUDGMENT: Map<number, NoteResult> = new Map()

interface RunSummary {
  scored: number
  total: number
  noVoice: number
  refWeak: number
  rhythm: { medianMs: number; phrases: number; reportable: boolean }
  attribution: Attribution
  verdict: Verdict
  next: KaraokeNext | null
}

/** No máximo três achados na tela (§5): uma lista de sete competências não é um
 *  diagnóstico, é um boletim — e ninguém corrige sete coisas na semana seguinte. */
const MAX_FINDINGS = 3

const skillName = (id: string): string => SKILLS.find((s) => s.id === id)?.name ?? id

/** Como o veredito de um achado se lê na tela, ao lado do nome do fundamento. */
function culpaLabel(v: SkillVerdict | undefined): { text: string; tone: string } | null {
  if (!v) return null
  if (v.culpa === 'musica') return { text: 'a música cobra mais do que você treinou', tone: 'musica' }
  if (v.culpa === 'voce') return { text: 'esta música não pedia tanto — o degrau é seu', tone: 'voce' }
  if (v.reason === 'sem-capacidade')
    return { text: 'ainda sem histórico seu aqui para comparar', tone: 'mudo' }
  if (v.reason === 'sem-eixo')
    return { text: 'depende do seu tipo vocal — não dá para culpar a música', tone: 'mudo' }
  if (v.reason === 'proximo') return { text: 'exigência e preparo empatados', tone: 'mudo' }
  return null
}

/** Frase da transposição. Só existe quando a música NÃO cabe. */
function shiftText(shift: number, residual: number): string {
  const dir = shift < 0 ? 'para baixo' : 'para cima'
  const n = Math.abs(shift)
  const base = `Transpor ${n} ${n === 1 ? 'semitom' : 'semitons'} ${dir}`
  return residual > 0
    ? `${base} é o melhor encaixe possível, mas ainda sobram ${residual} semitons fora: esta música é mais larga que a sua extensão medida.`
    : `${base} põe a música inteira dentro da sua extensão medida.`
}

// KARAOKÊ · PALCO — a música toca e o relógio dela manda em tudo. Durante o canto a
// tela mostra POUCO de propósito: o rolo diz ONDE você está, que é orientação, e
// nenhum número de acerto, que seria cobrança — julgar em tempo real piora quem
// canta. O diagnóstico vem depois, com a medição inteira na mão.
export default function KaraokePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { engine, micStatus, baseline } = useApp()

  // a sessão é volátil de propósito (o áudio nunca fica guardado): um F5 aqui
  // manda de volta para o preparo em vez de tocar sem referência conferida
  const sessionRef = useRef<KaraokeSession | null>(getKaraokeSession())
  const session = sessionRef.current
  const track = session?.track ?? null

  const [phase, setPhase] = useState<'ready' | 'run' | 'done'>('ready')
  const [paused, setPaused] = useState(false)
  const [startErr, setStartErr] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [elapsedLabel, setElapsedLabel] = useState('0:00')
  const [summary, setSummary] = useState<RunSummary | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const sungRef = useRef<SungFrame[]>([])
  const traceRef = useRef<{ t: number; midi: number }[]>([])
  const activeIdxRef = useRef(-1)
  const lastLabelRef = useRef('')
  const finishedRef = useRef(false)

  const pitchRange = useMemo(() => rollPitchRange(track?.notes ?? []), [track])
  const latencySec = (session?.latencyMs ?? 0) / 1000

  useEffect(() => {
    if (!session || (id && session.track.id !== id)) navigate('/karaoke', { replace: true })
  }, [session, id, navigate])

  // captura da voz: cada frame do microfone é carimbado no relógio da MÚSICA, já
  // descontado o atraso medido. É o ida-e-volta INTEIRO que sai daqui, não a
  // metade: o cantor ouviu o playback depois da latência de saída e a voz dele
  // chegou aqui depois da de entrada — as duas somam antes de qualquer julgamento.
  useEffect(() => {
    if (phase !== 'run') return
    return engine.subscribe((f) => {
      const el = audioRef.current
      if (!el || el.paused) return
      const t = el.currentTime - latencySec
      if (t < 0) return
      const midi = f.freq != null ? freqToMidiFloat(f.freq) : null
      sungRef.current.push({
        t,
        midi,
        clarity: f.clarity,
        dynamics: f.dynamics,
        steadiness: f.steadiness,
        h1h2: f.h1h2,
        centroid: f.centroid,
      })
      if (midi != null) {
        traceRef.current.push({ t, midi })
        while (traceRef.current.length && traceRef.current[0].t < t - TRACE_SEC) traceRef.current.shift()
      }
    })
  }, [phase, engine, latencySec])

  // desenho: puro reflexo do relógio do <audio>. Se o rAF for estrangulado (aba ao
  // fundo), só o desenho para — a medição continua correta porque não depende dele.
  useEffect(() => {
    if (phase !== 'run' || !track) return
    const dpr = window.devicePixelRatio || 1
    let raf = 0
    const tick = () => {
      const el = audioRef.current
      if (el) {
        const elapsed = el.currentTime
        let idx = -1
        for (const nt of track.notes) {
          if (elapsed >= nt.startSec && elapsed < nt.endSec) {
            idx = nt.index
            break
          }
        }
        if (idx !== activeIdxRef.current) {
          activeIdxRef.current = idx
          setActiveIdx(idx)
        }
        const label = formatDuration(elapsed)
        if (label !== lastLabelRef.current) {
          lastLabelRef.current = label
          setElapsedLabel(label)
        }
        const cv = canvasRef.current
        if (cv) {
          const cssW = cv.clientWidth || 600
          const need = Math.round(cssW * dpr)
          if (cv.width !== need) {
            cv.width = need
            cv.height = Math.round(ROLL_H * dpr)
          }
          const c2d = cv.getContext('2d')
          if (c2d)
            drawSongRoll(c2d, {
              width: cssW,
              height: ROLL_H,
              dpr,
              notes: track.notes,
              elapsed,
              sungTrace: traceRef.current,
              results: NO_LIVE_JUDGMENT,
              pitchLo: pitchRange.lo,
              pitchHi: pitchRange.hi,
            })
        }
        if (barRef.current) {
          const pct = track.durationSec ? (elapsed / track.durationSec) * 100 : 0
          barRef.current.style.width = `${Math.max(0, Math.min(100, pct))}%`
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, track, pitchRange])

  // aba ao fundo: o browser pode suspender o contexto de áudio do microfone, e aí a
  // voz some sem aviso. Pausar e deixar o cantor retomar é mais honesto do que
  // seguir gravando silêncio e reportá-lo como notas não cantadas.
  useEffect(() => {
    if (phase !== 'run') return
    const onHide = () => {
      if (document.hidden) {
        audioRef.current?.pause()
        setPaused(true)
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [phase])

  useEffect(
    () => () => {
      engine.stop()
      audioRef.current?.pause()
    },
    [engine],
  )

  async function start() {
    const el = audioRef.current
    if (!el || !track) return
    setStartErr(null)
    sungRef.current = []
    traceRef.current = []
    activeIdxRef.current = -1
    finishedRef.current = false
    setActiveIdx(-1)
    setSummary(null)
    await engine.start()
    if (engine.status !== 'running') {
      setStartErr('Não consegui abrir o microfone. Confira a permissão do navegador.')
      return
    }
    try {
      el.currentTime = 0
      await el.play()
    } catch {
      engine.stop()
      setStartErr('O navegador bloqueou a reprodução. Toque no botão de novo.')
      return
    }
    setPaused(false)
    setPhase('run')
  }

  async function resume() {
    try {
      await audioRef.current?.play()
      setPaused(false)
    } catch {
      setStartErr('Não consegui retomar a reprodução.')
    }
  }

  function finish() {
    if (finishedRef.current || !track || !session) return
    finishedRef.current = true
    engine.stop()
    audioRef.current?.pause()

    const sung = sungRef.current
    const alignments = alignPhrases(track.refContour, track.phrases, sung)
    const notes: SungNote[] = measureRun(track, sung, alignments)
    const cov = runCoverage(notes)
    // a extensão já medida do cantor entra como FREIO: nota dentro do alcance
    // conhecido dele nunca vira achado de extensão. Sem baseline, a regra continua
    // valendo — só fica mais frouxa, nunca mais severa.
    const range = baseline ? { lo: baseline.lowMidi, hi: baseline.highMidi } : null
    const attribution = attributeRun(notes, range)

    // O VEREDITO. A atribuição diz o que falhou; sozinha, ela sempre soa como
    // acusação. Só depois de pesar a exigência da música contra o que o cantor já
    // demonstrou aguentar é que existe conclusão — e, se a música nem cabe na voz,
    // a conclusão é transpor, não treinar.
    const capabilities = estimateAllCapabilities(
      SKILLS.map((s) => s.id),
      capabilityInputFromStore(),
    )
    const singer = baseline ? { lowMidi: baseline.lowMidi, highMidi: baseline.highMidi } : null
    const verdict = judgeRun(attribution.findings, track.demand, capabilities, singer)
    const next = nextFromVerdict(verdict, attribution.findings, currentTrackLevel())

    setKaraokeRun({
      trackId: track.id,
      notes,
      alignments,
      attribution,
      verdict,
      next,
      latencyMs: session.latencyMs,
      hashVerified: session.hashVerified,
    })
    setSummary({
      scored: cov.scored,
      total: cov.total,
      noVoice: cov.noVoice,
      refWeak: cov.refWeak,
      rhythm: rhythmicTendencyMs(alignments),
      attribution,
      verdict,
      next,
    })
    setPhase('done')
  }

  function abort() {
    engine.stop()
    audioRef.current?.pause()
    setPhase('ready')
  }

  if (!session || !track) return null

  const active = activeIdx >= 0 ? track.notes[activeIdx] : undefined

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{track.title}</h1>
          <p className="page-sub">
            {track.artist} · {formatDuration(track.durationSec)} · {track.notes.length} notas
          </p>
        </div>
        {session.latencyMs > 0 ? (
          <span className="badge">atraso {Math.round(session.latencyMs)} ms</span>
        ) : (
          <span className="badge">sem calibração</span>
        )}
      </div>

      <audio ref={audioRef} src={session.audioUrl} preload="auto" onEnded={finish} />

      {phase === 'ready' && (
        <div className="card card--glow reveal r0">
          <div className="player">
            <p className="hint center" style={{ maxWidth: '46ch' }}>
              A música toca do começo ao fim. Durante o canto eu não mostro acerto nem erro — o rolo
              serve só para você se localizar. O que eu medi aparece quando acabar.
            </p>
            <div className="controls" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn--primary"
                onClick={() => void start()}
                disabled={micStatus === 'starting'}
              >
                <Icon name="mic" /> {micStatus === 'starting' ? 'Liberando…' : 'Começar'}
              </button>
              <button className="btn" onClick={() => navigate('/karaoke')}>
                Trocar de música
              </button>
            </div>
            {startErr && (
              <p className="kk-fact" data-tone="bad">
                {startErr}
              </p>
            )}
          </div>
        </div>
      )}

      {phase === 'run' && (
        <div className="card card--glow">
          <div className="kk-stage">
            <div style={{ textAlign: 'center' }}>
              <div className="kk-target" data-idle={active === undefined}>
                {active ? midiLabel(active.midi) : '·'}
              </div>
              <p className="kk-target-sub">nota da melodia</p>
            </div>

            <div className="kk-roll-wrap">
              <canvas ref={canvasRef} className="kk-roll" style={{ height: ROLL_H }} />
            </div>

            <div className="kk-time">
              <span>{elapsedLabel}</span>
              <span className="kk-time-track">
                <span className="kk-time-fill" ref={barRef} style={{ width: '0%' }} />
              </span>
              <span>{formatDuration(track.durationSec)}</span>
            </div>

            <div className="controls">
              {paused && (
                <button className="btn btn--primary btn--sm" onClick={() => void resume()}>
                  <Icon name="play" size={15} /> Retomar
                </button>
              )}
              <button className="btn btn--ghost btn--sm" onClick={abort}>
                Parar
              </button>
            </div>
            {paused && (
              <p className="hint center" style={{ maxWidth: '40ch' }}>
                Pausei quando a aba saiu da frente — o microfone pode ter parado junto. O trecho
                pausado vai contar como não cantado.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && summary && (
        <div className="card card--glow reveal r0">
          {/* O encaixe vem ANTES das medições quando a música não cabe: ele invalida a
              leitura de todas elas, e enterrá-lo no fim seria deixar o cantor ler cinco
              parágrafos de defeito antes de descobrir que bastava mudar de tom. */}
          {summary.verdict.fit.status === 'nao-cabe' && (
            <div className="kk-verdict" data-tone="musica">
              <p className="kk-verdict-head">Esta música está fora da sua extensão medida.</p>
              <p className="kk-verdict-body">
                {summary.verdict.fit.overHigh > 0 && (
                  <>
                    O agudo dela passa <b>{summary.verdict.fit.overHigh}</b>{' '}
                    {summary.verdict.fit.overHigh === 1 ? 'semitom' : 'semitons'} do seu.{' '}
                  </>
                )}
                {summary.verdict.fit.overLow > 0 && (
                  <>
                    O grave desce <b>{summary.verdict.fit.overLow}</b>{' '}
                    {summary.verdict.fit.overLow === 1 ? 'semitom' : 'semitons'} abaixo do seu.{' '}
                  </>
                )}
                {shiftText(summary.verdict.fit.suggestShift, summary.verdict.fit.residual)}
              </p>
              <p className="kk-verdict-body">
                Enquanto ela estiver aí, não julgo fundamento nenhum: espremido no teto da
                própria extensão, qualquer um desafina, perde ar e aperta o som. O que está
                medido abaixo continua valendo como medição — só não vira diagnóstico.
              </p>
            </div>
          )}
          {summary.verdict.fit.status === 'no-limite' && (
            <div className="kk-verdict" data-tone="limite">
              <p className="kk-verdict-head">Você cantou encostado no seu agudo.</p>
              <p className="kk-verdict-body">
                A música cabe, mas por pouco: o topo dela fica a menos de dois semitons do
                agudo que você mediu no teste. Isso não invalida nada abaixo — só explica
                por que o esforço pareceu maior do que o de costume.
              </p>
            </div>
          )}

          <h2 className="page-title" style={{ fontSize: 22, margin: '0 0 14px' }}>
            O que deu para medir
          </h2>
          <dl className="kk-measures">
            <div className="kk-measure">
              <dt>notas medidas</dt>
              <dd>
                {summary.scored}/{summary.total}
              </dd>
            </div>
            <div className="kk-measure">
              <dt>sem voz sua</dt>
              <dd>{summary.noVoice}</dd>
            </div>
            <div className="kk-measure">
              <dt>referência fraca</dt>
              <dd>{summary.refWeak}</dd>
            </div>
            <div className="kk-measure">
              <dt>tempo</dt>
              <dd>
                {summary.rhythm.reportable
                  ? `${summary.rhythm.medianMs > 0 ? '+' : ''}${Math.round(summary.rhythm.medianMs)} ms`
                  : '—'}
              </dd>
            </div>
          </dl>

          <p className="kk-note">
            {summary.refWeak > 0 && (
              <>
                <b>{summary.refWeak}</b> notas ficaram de fora porque a separação de voz não deixou
                referência confiável nelas — isso é limitação da importação, não erro seu.{' '}
              </>
            )}
            {summary.rhythm.reportable
              ? `Nas ${summary.rhythm.phrases} frases confiáveis você entrou, na mediana, ${Math.abs(Math.round(summary.rhythm.medianMs))} ms ${summary.rhythm.medianMs >= 0 ? 'depois' : 'antes'} da gravação.`
              : 'Não houve frases confiáveis suficientes para falar de tempo — preciso de pelo menos cinco.'}
          </p>
          {summary.attribution.findings.length > 0 ? (
            <>
              <h3 className="kk-sub">Onde o erro se concentrou</h3>
              <ul className="kk-findings">
                {summary.attribution.findings.slice(0, MAX_FINDINGS).map((f: Finding) => {
                  const culpa = culpaLabel(
                    summary.verdict.skills.find((v) => v.skill === f.skill),
                  )
                  return (
                    <li key={f.skill} className="kk-finding">
                      <p className="kk-finding-head">
                        <b>{skillName(f.skill)}</b> · {f.condition}
                      </p>
                      <p className="kk-finding-ev">{f.evidence}</p>
                      {culpa && (
                        <p className="kk-finding-culpa" data-tone={culpa.tone}>
                          {culpa.text}
                        </p>
                      )}
                      <p className="kk-finding-n">
                        {f.n} notas · {Math.round(f.coverage * 100)}% da música
                      </p>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <p className="kk-note">
              Nenhum achado passou na guarda — seu erro não se concentrou em condição nenhuma
              desta música.{' '}
              {summary.attribution.weak.length > 0 &&
                'Houve sinais fracos, mas nenhum com amostra e efeito suficientes para eu apontar o dedo.'}
            </p>
          )}

          {summary.attribution.signals.length > 0 && (
            <ul className="kk-signals">
              {summary.attribution.signals.map((s) => (
                <li key={s.kind}>{s.text}</li>
              ))}
            </ul>
          )}

          {summary.next ? (
            <div className="kk-next">
              <p className="kk-next-label">{summary.next.stepBack ? 'Volte um degrau' : 'Próximo passo'}</p>
              <p className="kk-next-title">
                {getExercise(summary.next.recommendation.exerciseId)?.name ??
                  summary.next.recommendation.exerciseId}
              </p>
              <p className="kk-next-why">{summary.next.recommendation.reason}</p>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => navigate(`/exercicios/${summary.next?.recommendation.exerciseId}`)}
              >
                <Icon name="play" size={15} /> Fazer agora
              </button>
            </div>
          ) : (
            <p className="kk-note">
              {summary.verdict.fit.status === 'nao-cabe'
                ? 'Não vou te dar exercício por causa desta corrida: o que resolve aqui é o tom, não o treino.'
                : 'Nada nesta corrida sustenta uma tarefa. Não é elogio nem repreensão — é que os achados ficaram sem lado, e mandar treinar mesmo assim seria transformar “não sei” em dever de casa.'}
            </p>
          )}

          <div className="controls" style={{ marginTop: 18 }}>
            <button className="btn btn--primary" onClick={() => setPhase('ready')}>
              <Icon name="play" /> Cantar de novo
            </button>
            <button className="btn" onClick={() => navigate('/karaoke')}>
              Trocar de música
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
