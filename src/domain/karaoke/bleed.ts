// Detector de VAZAMENTO do playback no microfone.
//
// Existe porque, com a música saindo pelo alto-falante em vez de fone, o mic capta
// o disco junto com (ou em vez d)a voz do cantor — e o F0 detecta a gravação
// original, não quem está cantando. Nesse cenário todo o diagnóstico do karaokê
// vira ficção: "sua afinação está perfeita" pode só significar que o app mediu a
// cantora original. Fone de ouvido é o gate contra isso; este detector é o
// cinto-de-segurança pro caso de vazamento acústico mesmo com fone (mal encaixado,
// volume muito alto) ou de o usuário ignorar o aviso.
//
// Método: se o envelope de energia do mic anda junto com o envelope do playback,
// é sinal de que o mic está ouvindo o playback. Correlação de Pearson entre os dois
// envelopes é barata, não depende de F0 (funciona mesmo sem voz nenhuma) e não
// precisa dos sinais alinhados amostra a amostra — só dos dois envelopes na mesma
// taxa.

/** Taxa do envelope acumulado (Hz). 50 Hz é fino o bastante pra pegar picos de
 * frase/consoante sem gerar ruído por-amostra que uma janela menor traria. */
const ENVELOPE_RATE_HZ = 50
/** Pontos mínimos antes de emitir qualquer veredito. Abaixo disso ainda não deu
 * tempo de saber — ver o comentário em `result()`. */
const MIN_POINTS = 100
/** Correlação acima disso é vazamento; ver comentário em `result()` sobre por que
 * 0.6 e não algo mais perto de 1. */
const BLEED_CORRELATION_THRESHOLD = 0.6

export class BleedDetector {
  private readonly windowSamples: number

  private micEnv: number[] = []
  private micSumSq = 0
  private micCount = 0

  private playbackEnv: number[] = []
  private playbackSumSq = 0
  private playbackCount = 0

  constructor(sampleRate: number) {
    this.windowSamples = Math.max(1, Math.round(sampleRate / ENVELOPE_RATE_HZ))
  }

  /** Acumula um chunk do mic no envelope RMS. Chunks não precisam ser múltiplos da
   * janela — o resto fica pendurado até o próximo push, sem perder amostra. */
  pushMic(chunk: Float32Array): void {
    this.push(chunk, 'mic')
  }

  pushPlayback(chunk: Float32Array): void {
    this.push(chunk, 'playback')
  }

  private push(chunk: Float32Array, which: 'mic' | 'playback'): void {
    for (let i = 0; i < chunk.length; i++) {
      const v = chunk[i]
      if (which === 'mic') {
        this.micSumSq += v * v
        this.micCount++
        if (this.micCount === this.windowSamples) {
          this.micEnv.push(Math.sqrt(this.micSumSq / this.windowSamples))
          this.micSumSq = 0
          this.micCount = 0
        }
      } else {
        this.playbackSumSq += v * v
        this.playbackCount++
        if (this.playbackCount === this.windowSamples) {
          this.playbackEnv.push(Math.sqrt(this.playbackSumSq / this.windowSamples))
          this.playbackSumSq = 0
          this.playbackCount = 0
        }
      }
    }
  }

  /**
   * Correlação de Pearson entre os dois envelopes, alinhados pelo menor
   * comprimento (do início — mic e playback são empurrados em tempo real, então
   * na prática andam quase juntos) e com as médias removidas.
   *
   * Com menos de MIN_POINTS pontos devolve `bleeding: false`, mas isso é "ainda não
   * sei", não "está limpo" — nunca reporte ausência de vazamento com base em pouca
   * amostra, ou o gate vira teatro nos primeiros segundos de qualquer sessão.
   */
  result(): { correlation: number; bleeding: boolean; points: number } {
    const n = Math.min(this.micEnv.length, this.playbackEnv.length)
    if (n < MIN_POINTS) {
      return { correlation: 0, bleeding: false, points: n }
    }

    const mic = this.micEnv.slice(0, n)
    const pb = this.playbackEnv.slice(0, n)
    const meanMic = mic.reduce((a, b) => a + b, 0) / n
    const meanPb = pb.reduce((a, b) => a + b, 0) / n

    let num = 0
    let denMic = 0
    let denPb = 0
    for (let i = 0; i < n; i++) {
      const dm = mic[i] - meanMic
      const dp = pb[i] - meanPb
      num += dm * dp
      denMic += dm * dm
      denPb += dp * dp
    }
    const denom = Math.sqrt(denMic * denPb)
    // denom 0 = um dos dois é totalmente plano (ex.: playback mudo) — sem
    // variância não há correlação que calcular, e "0" é mais honesto que NaN
    const correlation = denom > 0 ? num / denom : 0

    return {
      correlation,
      bleeding: correlation > BLEED_CORRELATION_THRESHOLD,
      points: n,
    }
  }

  reset(): void {
    this.micEnv = []
    this.micSumSq = 0
    this.micCount = 0
    this.playbackEnv = []
    this.playbackSumSq = 0
    this.playbackCount = 0
  }
}
