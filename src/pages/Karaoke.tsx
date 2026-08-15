import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import {
  canHashLocally,
  formatDuration,
  loadKaraokeIndex,
  loadKaraokeTrack,
  sha256OfFile,
} from '../data/karaoke'
import { setKaraokeSession } from '../data/karaoke-session'
import { deviceKey, getCalibration, saveCalibration } from '../domain/karaoke/calibration-store'
import { runLatencyCalibration } from '../domain/karaoke/latency'
import type { KaraokeIndexEntry, KaraokeTrack } from '../domain/karaoke/track'
import '../styles/karaoke.css'

/** Diferença tolerada entre a duração do arquivo e a que a importação registrou (s).
 *  Encoders divergem em frações de segundo; alguns segundos já é outro arquivo. */
const DURATION_TOLERANCE_SEC = 2
/** Tempo máximo esperando o browser ler os metadados do arquivo (ms). */
const PROBE_TIMEOUT_MS = 8000

type FileState = 'idle' | 'checking' | 'ok' | 'unverified' | 'mismatch' | 'unplayable'

interface ProbeResult {
  ok: boolean
  durationSec: number
}

/** Confere se o browser realmente decodifica este arquivo, e por quanto tempo.
 *  Descobrir que o .flac não toca DEPOIS do ritual inteiro seria o pior momento. */
function probeAudio(url: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const el = new Audio()
    let settled = false
    const done = (ok: boolean, durationSec = 0) => {
      if (settled) return
      settled = true
      el.src = ''
      resolve({ ok, durationSec })
    }
    const timer = setTimeout(() => done(false), PROBE_TIMEOUT_MS)
    el.addEventListener('loadedmetadata', () => {
      clearTimeout(timer)
      done(Number.isFinite(el.duration), el.duration)
    })
    el.addEventListener('error', () => {
      clearTimeout(timer)
      done(false)
    })
    el.preload = 'metadata'
    el.src = url
  })
}

/** Taxa de amostragem do caminho de áudio, sem pedir microfone. Serve só para
 *  procurar uma calibração salva; quem grava a chave é a própria calibração. */
async function probeSampleRate(): Promise<number> {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return 0
  const ctx = new Ctor()
  const rate = ctx.sampleRate
  await ctx.close()
  return rate
}

// KARAOKÊ · PREPARO — quatro passos, nesta ordem, porque cada um invalida tudo o
// que vem depois se for pulado: faixa errada = melodia de referência errada;
// arquivo errado = tempos errados; sem latência = todo julgamento de tempo é
// chute; sem fone = o microfone ouve a cantora original e o app avalia ELA.
export default function Karaoke() {
  const navigate = useNavigate()

  const [tracks, setTracks] = useState<KaraokeIndexEntry[] | null>(null)
  const [track, setTrack] = useState<KaraokeTrack | null>(null)
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null)
  const [trackErr, setTrackErr] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [fileState, setFileState] = useState<FileState>('idle')
  const [durationWarn, setDurationWarn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sampleRate, setSampleRate] = useState(0)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [latencyStdev, setLatencyStdev] = useState(0)
  const [calibrating, setCalibrating] = useState(false)
  const [calibErr, setCalibErr] = useState<string | null>(null)
  const [calibSkipped, setCalibSkipped] = useState(false)

  const [headphones, setHeadphones] = useState(false)

  useEffect(() => {
    void loadKaraokeIndex().then(setTracks)
  }, [])

  // calibração salva deste aparelho: se existir, o passo 3 já nasce fechado
  useEffect(() => {
    void probeSampleRate().then((rate) => {
      setSampleRate(rate)
      if (!rate) return
      const saved = getCalibration(deviceKey(rate))
      if (saved?.ok) {
        setLatencyMs(saved.roundTripMs)
        setLatencyStdev(saved.stdevMs)
      }
    })
  }, [])

  const fileOk = fileState === 'ok' || fileState === 'unverified'
  const calibOk = latencyMs !== null || calibSkipped
  const steps = [track !== null, fileOk, calibOk, headphones]
  const doneCount = steps.filter(Boolean).length
  const currentStep = steps.indexOf(false)
  const ready = currentStep === -1

  const stateOf = (i: number): 'done' | 'now' | 'todo' =>
    steps[i] ? 'done' : i === currentStep ? 'now' : 'todo'

  const importCmd = useMemo(
    () => 'npm run import:song -- "C:\\caminho\\da\\musica.mp3" --title "Título" --artist "Artista"',
    [],
  )

  async function pickTrack(entry: KaraokeIndexEntry) {
    if (track?.id === entry.id) return
    setLoadingTrack(entry.id)
    setTrackErr(null)
    // faixa nova invalida o arquivo conferido para a anterior
    setFile(null)
    setFileState('idle')
    setDurationWarn(false)
    try {
      setTrack(await loadKaraokeTrack(entry.id))
    } catch (err) {
      setTrack(null)
      setTrackErr(err instanceof Error ? err.message : 'não consegui abrir essa faixa')
    } finally {
      setLoadingTrack(null)
    }
  }

  async function onPickFile(picked: File | undefined) {
    if (!picked || !track) return
    setFile(picked)
    setDurationWarn(false)
    setFileState('checking')

    let verified = true
    if (canHashLocally()) {
      const hash = await sha256OfFile(picked)
      if (hash !== track.audioSha256) {
        setFileState('mismatch')
        return
      }
    } else {
      // sem crypto.subtle (contexto não seguro) dá para seguir, mas o usuário
      // precisa saber que a garantia caiu — e não descobrir num relatório torto
      verified = false
    }

    const url = URL.createObjectURL(picked)
    const probe = await probeAudio(url)
    URL.revokeObjectURL(url)
    if (!probe.ok) {
      setFileState('unplayable')
      return
    }
    setDurationWarn(Math.abs(probe.durationSec - track.durationSec) > DURATION_TOLERANCE_SEC)
    setFileState(verified ? 'ok' : 'unverified')
  }

  async function calibrate() {
    setCalibrating(true)
    setCalibErr(null)
    try {
      const result = await runLatencyCalibration()
      if (!result.ok) {
        setCalibErr(
          result.detected === 0
            ? 'não ouvi nenhum clique. Suba o volume das caixas e tente num lugar mais silencioso.'
            : `as medições saíram inconsistentes (±${Math.round(result.stdevMs)} ms). Tente de novo sem ruído de fundo.`,
        )
        return
      }
      setLatencyMs(result.roundTripMs)
      setLatencyStdev(result.stdevMs)
      saveCalibration(deviceKey(result.sampleRate), result)
      if (!sampleRate) setSampleRate(result.sampleRate)
    } catch {
      setCalibErr('não consegui abrir o microfone. Confira a permissão do navegador.')
    } finally {
      setCalibrating(false)
    }
  }

  function start() {
    if (!track || !file) return
    setKaraokeSession({
      track,
      audioUrl: URL.createObjectURL(file),
      audioFileName: file.name,
      latencyMs: latencyMs ?? 0,
      hashVerified: fileState === 'ok',
    })
    navigate(`/karaoke/${track.id}`)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Karaokê</h1>
          <p className="page-sub">Cante por cima da gravação — e depois eu digo o que falhou</p>
        </div>
        <span className="badge">só no seu aparelho</span>
      </div>

      <div className="card card--glow reveal r0">
        <ol className="kk-ritual" style={{ ['--kk-progress' as string]: String(doneCount / steps.length) }}>
          {/* 1 · faixa */}
          <li className="kk-step" data-state={stateOf(0)}>
            <span className="kk-step-mark">{steps[0] ? <Icon name="check" size={15} /> : '1'}</span>
            <div className="kk-step-body">
              <h2 className="kk-step-title">A música</h2>
              <p className="kk-step-why">
                Escolha uma faixa já importada. A importação separa a voz da gravação e guarda a
                melodia dela — é contra essa melodia que a sua vai ser comparada.
              </p>
              {stateOf(0) !== 'todo' && (
                <div className="kk-step-do">
                  {tracks === null ? (
                    <p className="hint">Procurando faixas importadas…</p>
                  ) : tracks.length === 0 ? (
                    <div className="kk-empty">
                      <p className="hint" style={{ margin: 0 }}>
                        Nenhuma faixa importada ainda. Rode a importação uma vez por música, no
                        terminal do projeto:
                      </p>
                      <code className="kk-cmd">{importCmd}</code>
                    </div>
                  ) : (
                    <div className="kk-tracks">
                      {tracks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="kk-track"
                          aria-pressed={track?.id === t.id}
                          onClick={() => void pickTrack(t)}
                          disabled={loadingTrack !== null}
                        >
                          <span className="kk-track-title">{t.title}</span>
                          <span className="kk-track-meta">
                            {t.artist} · {formatDuration(t.durationSec)}
                            {loadingTrack === t.id ? ' · abrindo…' : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {trackErr && (
                    <p className="kk-fact" data-tone="bad">
                      {trackErr}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>

          {/* 2 · arquivo */}
          <li className="kk-step" data-state={stateOf(1)}>
            <span className="kk-step-mark">{steps[1] ? <Icon name="check" size={15} /> : '2'}</span>
            <div className="kk-step-body">
              <h2 className="kk-step-title">O arquivo de áudio</h2>
              <p className="kk-step-why">
                O áudio não fica guardado no app — escolha o mesmo arquivo que você importou. Eu
                confiro pela impressão digital dele: se for outro, os tempos não batem e o
                diagnóstico inteiro sai errado.
              </p>
              {stateOf(1) !== 'todo' && track && (
                <div className="kk-step-do">
                  <span className="kk-file">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.flac,.wav,.m4a,.ogg,.opus"
                      onChange={(e) => void onPickFile(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fileState === 'checking'}
                    >
                      <Icon name="music" size={15} />
                      {file ? 'Escolher outro' : 'Escolher arquivo'}
                    </button>
                  </span>
                  <p className="hint" style={{ marginTop: 8, fontSize: 12 }}>
                    Importado como <b>{track.audioFileName}</b>
                  </p>

                  {fileState === 'checking' && <p className="kk-fact">Conferindo {file?.name}…</p>}
                  {fileState === 'ok' && (
                    <p className="kk-fact" data-tone="ok">
                      <Icon name="check" size={15} /> É o mesmo arquivo da importação.
                    </p>
                  )}
                  {fileState === 'unverified' && (
                    <p className="kk-fact">
                      Não deu para conferir a impressão digital aqui (a página não está em contexto
                      seguro). Se este não for o arquivo importado, o relatório vai medir errado.
                    </p>
                  )}
                  {fileState === 'mismatch' && (
                    <p className="kk-fact" data-tone="bad">
                      Este não é o arquivo que gerou a faixa. Procure o <b>{track.audioFileName}</b>{' '}
                      original — outra versão, mesmo da mesma música, tem tempos diferentes.
                    </p>
                  )}
                  {fileState === 'unplayable' && (
                    <p className="kk-fact" data-tone="bad">
                      Este navegador não toca esse formato. Converta para MP3 ou WAV e importe de
                      novo a partir do arquivo convertido.
                    </p>
                  )}
                  {durationWarn && fileOk && (
                    <p className="kk-fact">
                      A duração não bate com a da importação — dá para cantar, mas confira se é a
                      mesma edição.
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>

          {/* 3 · latência */}
          <li className="kk-step" data-state={stateOf(2)}>
            <span className="kk-step-mark">{steps[2] ? <Icon name="check" size={15} /> : '3'}</span>
            <div className="kk-step-body">
              <h2 className="kk-step-title">O atraso do seu aparelho</h2>
              <p className="kk-step-why">
                Entre o som sair e a sua voz voltar pelo microfone passam algumas dezenas de
                milissegundos. Sem essa medida eu acusaria atraso seu que é do computador. Toco
                cinco cliques e escuto quando voltam — <b>agora pelas caixas</b>, com o fone fora,
                porque pelo fone nenhum clique chega ao microfone.
              </p>
              {stateOf(2) !== 'todo' && (
                <div className="kk-step-do">
                  <div className="controls">
                    <button className="btn btn--sm" onClick={() => void calibrate()} disabled={calibrating}>
                      <Icon name="gauge" size={15} />
                      {calibrating ? 'Medindo…' : latencyMs !== null ? 'Medir de novo' : 'Medir agora'}
                    </button>
                    {latencyMs === null && !calibrating && (
                      <button className="btn btn--sm btn--ghost" onClick={() => setCalibSkipped(true)}>
                        Seguir sem medir
                      </button>
                    )}
                  </div>
                  {latencyMs !== null && (
                    <p className="kk-fact" data-tone="ok">
                      <Icon name="check" size={15} /> Ida e volta de <b>{Math.round(latencyMs)} ms</b>{' '}
                      (±{Math.round(latencyStdev)} ms).
                    </p>
                  )}
                  {latencyMs === null && calibSkipped && (
                    <p className="kk-fact">
                      Seguindo sem medir: o relatório vai trazer afinação, mas nada sobre atraso ou
                      adiantamento.
                    </p>
                  )}
                  {calibErr && (
                    <p className="kk-fact" data-tone="bad">
                      {calibErr}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>

          {/* 4 · fone */}
          <li className="kk-step" data-state={stateOf(3)}>
            <span className="kk-step-mark">{steps[3] ? <Icon name="check" size={15} /> : '4'}</span>
            <div className="kk-step-body">
              <h2 className="kk-step-title">O fone de ouvido</h2>
              <p className="kk-step-why">
                Agora sim, ponha o fone. Se a música sair pelas caixas, o microfone capta a gravação
                junto com você — e eu acabaria medindo a voz da gravação, com nota alta e tudo. É o
                único passo que eu não consigo verificar sozinho.
              </p>
              {stateOf(3) !== 'todo' && (
                <div className="kk-step-do">
                  <button className="btn btn--sm" onClick={() => setHeadphones(true)}>
                    <Icon name="check" size={15} /> Estou de fone
                  </button>
                </div>
              )}
            </div>
          </li>
        </ol>

        <div className="kk-go">
          <button className="btn btn--primary" onClick={start} disabled={!ready}>
            <Icon name="mic" /> Cantar
          </button>
          {!ready && (
            <p className="hint">
              {steps.length - doneCount === 1
                ? 'Falta um passo.'
                : `Faltam ${steps.length - doneCount} passos.`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
