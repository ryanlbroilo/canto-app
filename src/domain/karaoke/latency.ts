// Calibração de latência de round-trip (saída → alto-falante/fone → mic → entrada).
//
// Sem isto, todo veredito de TEMPO no karaokê é ficção: latência de saída + entrada
// soma 40-200 ms dependendo do dispositivo, e o app vai dizer "você atrasa sempre"
// quando na verdade está medindo o driver de áudio do Windows. Ver §3.2 do plano.
//
// Funções PURAS primeiro (testáveis sem browser, scripts/test-latency.ts). A
// orquestração de browser (getUserMedia, AudioContext, worklet) vem depois, separada
// de propósito — é a parte que não dá pra testar em Node.

import { median } from './stats'

/** Janela padrão do envelope RMS (ms). 2 ms dá resolução de sobra pra achar um pico
 * de clique de 5 ms sem borrar demais o sinal. */
export const DEFAULT_ENVELOPE_WINDOW_MS = 2
/** Janela de busca padrão por clique, a partir do instante agendado (ms). Cobre
 * folgadamente os 40-200 ms de latência típica sem invadir a janela do próximo
 * clique (os cliques são espaçados em 500 ms). */
export const DEFAULT_SEARCH_MS = 500
/** Pico precisa se destacar da mediana da própria janela de busca por este fator
 * pra contar como clique detectado, e não como ruído de fundo. */
export const MIN_PEAK_TO_MEDIAN = 4

/** Nº de amostras por janela do envelope, arredondado. Extraído à parte porque
 * envelopeRateHz e rmsEnvelope precisam da MESMA conta — calculá-la duas vezes
 * seria uma divergência de arredondamento esperando pra acontecer. */
export function envelopeWindowSamples(sampleRate: number, windowMs = DEFAULT_ENVELOPE_WINDOW_MS): number {
  return Math.max(1, Math.round((windowMs / 1000) * sampleRate))
}

/** Taxa (Hz) do envelope que rmsEnvelope produz com esta janela. Não é exatamente
 * 1000/windowMs porque envelopeWindowSamples arredonda para um nº inteiro de
 * amostras — quem consome o envelope tem que usar ESTA função, não a conta ingênua. */
export function envelopeRateHz(sampleRate: number, windowMs = DEFAULT_ENVELOPE_WINDOW_MS): number {
  return sampleRate / envelopeWindowSamples(sampleRate, windowMs)
}

/**
 * Envelope RMS em janelas fixas, sem sobreposição.
 *
 * Descarta o resto no fim (samples.length não múltiplo de windowSamples) — perder
 * até ~2 ms de cauda não importa aqui, e evitar janela parcial evita um RMS
 * artificialmente baixo no último ponto.
 */
export function rmsEnvelope(
  samples: Float32Array,
  sampleRate: number,
  windowMs = DEFAULT_ENVELOPE_WINDOW_MS,
): Float32Array {
  const win = envelopeWindowSamples(sampleRate, windowMs)
  const n = Math.floor(samples.length / win)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let sumSq = 0
    const base = i * win
    for (let j = 0; j < win; j++) {
      const v = samples[base + j]
      sumSq += v * v
    }
    out[i] = Math.sqrt(sumSq / win)
  }
  return out
}

/**
 * Para cada clique esperado (em segundos, relativo ao início da gravação), procura
 * o pico do envelope na janela [t, t + searchMs] e devolve o atraso em ms — ou
 * `null` se nada na janela se destacar o bastante do ruído de fundo dela mesma.
 *
 * Busca só PRA FRENTE de propósito: round-trip é sempre >= 0 (o clique não pode ser
 * ouvido antes de ter sido tocado), e limitar a janela ao intervalo entre cliques
 * evita que o próximo clique vaze pra dentro da busca do anterior.
 */
export function findClickDelaysMs(
  env: Float32Array,
  envRate: number,
  expectedSec: number[],
  searchMs = DEFAULT_SEARCH_MS,
): (number | null)[] {
  return expectedSec.map((t) => {
    const startIdx = Math.max(0, Math.round(t * envRate))
    const endIdx = Math.min(env.length - 1, Math.round((t + searchMs / 1000) * envRate))
    if (startIdx > endIdx) return null // clique fora do que foi gravado

    let peakIdx = startIdx
    let peakVal = env[startIdx]
    const windowVals: number[] = []
    for (let i = startIdx; i <= endIdx; i++) {
      const v = env[i]
      windowVals.push(v)
      if (v > peakVal) {
        peakVal = v
        peakIdx = i
      }
    }

    const baseline = median(windowVals)
    // guarda contra falso positivo: numa janela de silêncio puro, QUALQUER amostra
    // é "o pico" — sem essa comparação com a própria mediana local, silêncio viraria
    // clique detectado com atraso aleatório
    if (!(peakVal > baseline * MIN_PEAK_TO_MEDIAN)) return null

    return (peakIdx / envRate - t) * 1000
  })
}

export interface CalibrationResult {
  roundTripMs: number
  stdevMs: number
  detected: number
  ok: boolean
}

/** Desvio-padrão mínimo aceito pra considerar a calibração confiável (ms). Acima
 * disso, os cliques concordam mal demais entre si — a mediana existiria, mas
 * mentiria sobre a latência real. */
const MAX_STDEV_MS = 15
/** Mínimo de cliques detectados pra confiar na mediana. */
const MIN_DETECTED = 3

/**
 * Resume os atrasos individuais numa única latência de round-trip.
 *
 * Mediana (não média) porque um clique mal detectado tende a errar MUITO, não
 * pouco — média deixaria um outlier arrastar o resultado, mediana ignora.
 */
export function summarizeDelays(delays: (number | null)[]): CalibrationResult {
  const found = delays.filter((d): d is number => d !== null)
  if (found.length === 0) {
    // sem nenhum clique detectado não há o que resumir — 0 aqui é "não sei", não
    // "latência zero"; é `ok: false` que carrega esse recado adiante
    return { roundTripMs: 0, stdevMs: 0, detected: 0, ok: false }
  }
  const roundTripMs = median(found)
  const mean = found.reduce((a, b) => a + b, 0) / found.length
  const variance = found.reduce((a, b) => a + (b - mean) ** 2, 0) / found.length
  const stdevMs = Math.sqrt(variance)
  const detected = found.length
  return { roundTripMs, stdevMs, detected, ok: detected >= MIN_DETECTED && stdevMs <= MAX_STDEV_MS }
}

// ---------------------------------------------------------------------------
// Orquestração de browser — nada abaixo daqui é testável em Node. Usa as MESMAS
// constraints de getUserMedia do PitchEngine (echoCancellation/noiseSuppression/
// autoGainControl desligados): aqui isso importa até mais, porque o AEC do browser
// poderia "reconhecer" e cancelar o próprio clique de calibração do sinal captado,
// o que inutilizaria a medição inteira.
// ---------------------------------------------------------------------------

const CLICK_COUNT = 5
const CLICK_INTERVAL_SEC = 0.5
const LEAD_IN_SEC = 0.5
/** Duração de cada clique de calibração (s). Curto — só precisa de uma borda nítida. */
const CLICK_BURST_SEC = 0.005
const RECORDER_WORKLET_URL = '/worklets/recorder-processor.js'

/**
 * Roda o ritual de calibração: 5 cliques de ruído branco tocados pelo alto-falante/
 * fone, gravados simultaneamente pelo mic, correlacionados contra os instantes
 * agendados.
 *
 * Ruído (banda larga), não tom: a correlação de um transiente de banda larga tem
 * pico muito mais nítido que a de um tom puro, que se autocorrelaciona ao longo de
 * vários períodos e borra o pico.
 */
export async function runLatencyCalibration(): Promise<CalibrationResult & { sampleRate: number }> {
  let stream: MediaStream | null = null
  let ctx: AudioContext | null = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    })
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
    await ctx.resume()

    const source = ctx.createMediaStreamSource(stream)
    await ctx.audioWorklet.addModule(RECORDER_WORKLET_URL)
    const node = new AudioWorkletNode(ctx, 'recorder-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    })
    // saída silenciosa: o worklet precisa estar no grafo (senão o browser não
    // chama process()), mas não deve ecoar o próprio mic no alto-falante
    const silentGain = ctx.createGain()
    silentGain.gain.value = 0
    source.connect(node)
    node.connect(silentGain)
    silentGain.connect(ctx.destination)

    const chunks: Float32Array[] = []
    node.port.onmessage = (e: MessageEvent) => {
      chunks.push(e.data as Float32Array)
    }

    // instante de referência da gravação: assume-se que a amostra 0 do primeiro
    // chunk corresponde a AGORA. Na prática o worklet só começa a processar no
    // próximo quantum (128 amostras, <3 ms a 48 kHz) — erro sistemático pequeno e
    // constante, dentro da margem de ±5 ms que a calibração já tolera
    const recordStartSec = ctx.currentTime
    const expectedSec: number[] = []
    for (let i = 0; i < CLICK_COUNT; i++) {
      const t = LEAD_IN_SEC + i * CLICK_INTERVAL_SEC
      expectedSec.push(t)
      scheduleClick(ctx, recordStartSec + t)
    }

    const totalSec = LEAD_IN_SEC + CLICK_COUNT * CLICK_INTERVAL_SEC + CLICK_INTERVAL_SEC
    await sleep(totalSec * 1000)

    const samples = concatFloat32(chunks)
    const env = rmsEnvelope(samples, ctx.sampleRate)
    const envRate = envelopeRateHz(ctx.sampleRate)
    const delays = findClickDelaysMs(env, envRate, expectedSec)
    // devolve o sampleRate MEDIDO junto: é ele que identifica o caminho de áudio na
    // chave de armazenamento. Sondar a taxa por fora, num AudioContext diferente,
    // arriscaria salvar a medição sob a chave de outro caminho.
    return { ...summarizeDelays(delays), sampleRate: ctx.sampleRate }
  } finally {
    // libera tudo mesmo em erro — deixar o mic aberto depois de uma calibração que
    // falhou é o tipo de vazamento que só aparece bem depois, como ícone de mic
    // ligado sem motivo
    stream?.getTracks().forEach((track) => track.stop())
    if (ctx && ctx.state !== 'closed') await ctx.close()
  }
}

/** Agenda um clique: ruído branco com decaimento exponencial, tocado no instante
 * absoluto `atSec` do relógio do AudioContext. */
function scheduleClick(ctx: AudioContext, atSec: number): void {
  const sr = ctx.sampleRate
  const n = Math.max(1, Math.round(CLICK_BURST_SEC * sr))
  const buf = ctx.createBuffer(1, n, sr)
  const data = buf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    const decay = Math.exp(-6 * (i / n)) // decaimento rápido: mantém o clique curto e a borda nítida
    data[i] = (Math.random() * 2 - 1) * decay
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.start(atSec)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Concatena os chunks gravados na ordem de chegada. */
function concatFloat32(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Float32Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}
