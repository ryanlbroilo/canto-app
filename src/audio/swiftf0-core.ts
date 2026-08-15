// NÚCLEO COMPARTILHADO do SwiftF0 — a matemática que precisa ser IDÊNTICA nos dois
// lados da comparação do karaokê.
//
// Por que este arquivo existe: o app estima o F0 da SUA voz no navegador
// (swiftf0-worker.ts, onnxruntime-web) e a CLI de importação estima o F0 da voz da
// GRAVAÇÃO no Node (scripts/import-song.ts, onnxruntime-node). O relatório subtrai
// um do outro. Se os dois lados divergirem em pré-processamento, gate ou constantes,
// o viés sistemático do detector vira "erro do cantor" no diagnóstico — e você vai
// treinar para corrigir um bug. Então: mesma normalização, mesmo gate, mesmas
// constantes, um arquivo só. Nada aqui pode importar `onnxruntime-*` nem tocar em
// DOM/Node — é TS puro, justamente para poder viver nos dois runtimes.
//
// Contrato do modelo (public/model.onnx, verificado nas fontes primárias):
//   entrada: 'input_audio' float32 [1, N] — waveform CRU mono @16 kHz (STFT interna)
//   saídas:  'pitch_hz' [1, n_frames] (Hz) e 'confidence' [1, n_frames] (0..1)

/** Taxa exigida pelo modelo. Alimentar em outra taxa desloca o pitch. */
export const SWIFTF0_RATE = 16000

/** Limites de F0 do modelo (Hz). Fora disto a saída não é confiável. */
export const SWIFTF0_FMIN = 46.875
export const SWIFTF0_FMAX = 2093.75

/**
 * Gate de confiança para uso AO VIVO (tempo real). Alto de propósito: na captação
 * o custo de um frame errado é a agulha pulando na cara do cantor.
 */
export const SWIFTF0_CONF_LIVE = 0.9

/**
 * Gate de confiança para uso OFFLINE (referência importada). Mais baixo porque o
 * pós-processamento offline (mediana, remoção de ilhas, preenchimento de gaps)
 * limpa o que o gate ao vivo teria de rejeitar na hora. Frames entre este valor e
 * o gate ao vivo entram no contorno mas são marcados de confiança baixa, e as notas
 * cuja referência ficar fraca são descartadas da pontuação (não viram erro seu).
 */
export const SWIFTF0_CONF_OFFLINE = 0.5

/** Nome do tensor de entrada e das duas saídas — iguais nos dois runtimes. */
export const SWIFTF0_INPUT = 'input_audio'
export const SWIFTF0_OUT_PITCH = 'pitch_hz'
export const SWIFTF0_OUT_CONF = 'confidence'

export interface SwiftF0Frame {
  /** Hz cru devolvido pelo modelo (pode estar fora da faixa útil) */
  f0: number
  /** confiança 0..1 */
  conf: number
  /** true quando f0 está na faixa do modelo E conf passou do gate pedido */
  valid: boolean
}

/**
 * Normalização por pico — o ÚNICO pré-processamento antes do tensor.
 *
 * Atenção ao escopo: ao vivo isto roda por chunk (o worker não pode conhecer o pico
 * futuro), e na CLI roda uma vez sobre o arquivo inteiro. A divergência é deliberada
 * e inofensiva para pitch (o modelo é praticamente invariante a ganho), mas afeta a
 * `confidence`. Por isso os dois lados têm gates separados (LIVE vs OFFLINE) em vez
 * de fingir que o número significa a mesma coisa nos dois contextos.
 */
export function peakNorm(x: Float32Array): Float32Array {
  let max = 0
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i])
    if (a > max) max = a
  }
  if (max <= 0) return x
  const y = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) y[i] = x[i] / max
  return y
}

/** Normaliza por um pico JÁ CONHECIDO (uso offline: pico global do arquivo). */
export function normalizeBy(x: Float32Array, peak: number): Float32Array {
  if (peak <= 0) return x
  const y = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) y[i] = x[i] / peak
  return y
}

/** Pico absoluto de um buffer (para normalização global na CLI). */
export function absPeak(x: Float32Array): number {
  let max = 0
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i])
    if (a > max) max = a
  }
  return max
}

/**
 * Aplica o gate de validade aos tensores crus. É AQUI que "frame utilizável" é
 * definido — os dois runtimes chamam esta função para que a definição não se
 * bifurque.
 */
export function decodeFrames(
  pitch: ArrayLike<number>,
  conf: ArrayLike<number>,
  confThreshold: number,
): SwiftF0Frame[] {
  const n = Math.min(pitch.length, conf.length)
  const out: SwiftF0Frame[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const f0 = pitch[i]
    const c = conf[i]
    out[i] = {
      f0,
      conf: c,
      valid: c >= confThreshold && f0 >= SWIFTF0_FMIN && f0 <= SWIFTF0_FMAX,
    }
  }
  return out
}

/**
 * Frame vozeado mais recente — o que o uso ao vivo quer (a estimativa mais próxima
 * do "agora"). Sem nenhum válido, devolve o de maior confiança apenas para
 * diagnóstico, com valid=false para o chamador saber que não deve confiar.
 */
export function latestVoiced(frames: SwiftF0Frame[]): SwiftF0Frame {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i].valid) return frames[i]
  }
  let best: SwiftF0Frame = { f0: 0, conf: 0, valid: false }
  for (const f of frames) if (f.conf > best.conf) best = { ...f, valid: false }
  return best
}

/**
 * Taxa de frames REAL, derivada empiricamente do que o modelo devolveu.
 *
 * Deliberadamente não hardcoda o hop: se o modelo em public/ for trocado por uma
 * variante com hop diferente, hardcode viraria um deslocamento silencioso de tempo
 * na música inteira — o tipo de bug que só aparece como "eu atraso sempre".
 */
export function framesPerSecond(nFrames: number, nSamples: number, rate = SWIFTF0_RATE): number {
  if (nFrames <= 1 || nSamples <= 0) return 0
  return nFrames / (nSamples / rate)
}
