// Ring buffer lock-free sobre SharedArrayBuffer, para passar PCM do AudioWorklet
// (produtor, thread de áudio) para o Web Worker de DSP (consumidor) sem
// postMessage por frame.
//
// Layout do SAB:
//   [ Int32Array(CONTROL_LEN) | Float32Array(CAPACITY) ]
//   control[0] = writeCount absoluto (nº total de amostras já escritas)
//
// Sincronização: o produtor escreve as amostras e depois Atomics.store no
// writeCount; o consumidor faz Atomics.load do writeCount e então lê as amostras
// até esse ponto — a store/load do inteiro cria a barreira happens-before.
// Single-producer / single-consumer; CAPACITY >> WINDOW garante que o produtor
// nunca "lapa" a janela que o consumidor está copiando.

export const RING = {
  CONTROL_LEN: 4, // slots Int32 (0 = writeCount)
  CAPACITY: 8192, // amostras de áudio (potência de 2)
  WINDOW: 2048, // janela de análise
} as const

export function createRingSAB(): SharedArrayBuffer {
  return new SharedArrayBuffer(RING.CONTROL_LEN * 4 + RING.CAPACITY * 4)
}

export function ringViews(sab: SharedArrayBuffer) {
  const control = new Int32Array(sab, 0, RING.CONTROL_LEN)
  const audio = new Float32Array(sab, RING.CONTROL_LEN * 4, RING.CAPACITY)
  return { control, audio }
}
