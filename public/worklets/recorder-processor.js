// AudioWorklet GRAVADOR — usado pela calibração de latência (src/domain/karaoke/latency.ts)
// e por qualquer outro uso avulso que precise de alguns segundos de PCM cru do mic.
//
// Diferente do capture-processor.js (que escreve num ring de 8192 amostras em
// SharedArrayBuffer, lido pela thread de áudio em tempo real), este entrega o áudio
// por postMessage. Dois motivos para não reusar o outro:
// - 8192 amostras a 48 kHz são ~170 ms. Uma calibração grava ~3,5 s; o ring viraria
//   várias vezes por segundo e o consumidor teria que correr atrás sem nunca poder
//   parar para processar.
// - SAB exige cross-origin isolation, que nem sempre está disponível (é por isso que
//   o próprio PitchEngine já tem fallback de AnalyserNode quando falta). postMessage
//   funciona em qualquer contexto, ao custo de uma cópia por bloco — aceitável aqui
//   porque isto roda só durante a calibração, não em toda sessão de canto.
//
// Acumula em blocos de 4096 amostras antes de postar: a 128 amostras por quantum
// (o tamanho fixo do process()), postar a cada quantum seria ~375 mensagens/s por
// nada — 4096 dá ~11-12 mensagens/s a 48 kHz, granularidade de sobra para 2 ms de
// resolução de envelope depois.
const BLOCK_SIZE = 4096

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(BLOCK_SIZE)
    this.writeIdx = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (input && input[0]) {
      const ch = input[0] // Float32Array(128), buffer da thread de áudio — reaproveitado a cada quantum
      for (let i = 0; i < ch.length; i++) {
        this.buffer[this.writeIdx++] = ch[i]
        if (this.writeIdx === BLOCK_SIZE) {
          // cópia explícita: postar this.buffer direto entregaria uma referência
          // que este mesmo processo começa a sobrescrever no quantum seguinte
          this.port.postMessage(this.buffer.slice())
          this.writeIdx = 0
        }
      }
    }
    return true // mantém o processador vivo
  }
}

registerProcessor('recorder-processor', RecorderProcessor)
