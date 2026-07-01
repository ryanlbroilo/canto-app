// AudioWorklet de CAPTURA — roda na thread de áudio (quantum de 128 amostras).
// Responsabilidade única: escrever o PCM de entrada no ring buffer (SAB).
// Nada de alocação no process(); nenhum DSP aqui (isso roda no Web Worker).
//
// Mantém o layout em sincronia com src/audio/ringbuffer.ts.
const CONTROL_LEN = 4
const CAPACITY = 8192

class CaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const sab = options.processorOptions.sab
    this.control = new Int32Array(sab, 0, CONTROL_LEN)
    this.audio = new Float32Array(sab, CONTROL_LEN * 4, CAPACITY)
  }

  process(inputs) {
    const input = inputs[0]
    if (input && input[0]) {
      const ch = input[0] // Float32Array(128)
      const n = ch.length
      const wc = Atomics.load(this.control, 0)
      const start = wc % CAPACITY
      if (start + n <= CAPACITY) {
        this.audio.set(ch, start)
      } else {
        const first = CAPACITY - start
        this.audio.set(ch.subarray(0, first), start)
        this.audio.set(ch.subarray(first), 0)
      }
      Atomics.store(this.control, 0, wc + n)
    }
    return true // mantém o processador vivo
  }
}

registerProcessor('capture-processor', CaptureProcessor)
