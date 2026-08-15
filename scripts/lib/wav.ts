// Leitor de WAV mínimo, sem dependência — só o que o demucs escreve.
//
// Existe para não arrastar ffmpeg/decoder para dentro do projeto por causa de um
// formato de 44 bytes de cabeçalho. Percorre os chunks (o demucs às vezes emite
// LIST/fact entre fmt e data) e cobre PCM 16/24/32 bits e float32, que é o conjunto
// que o htdemucs produz com e sem --float32.

export interface DecodedWav {
  sampleRate: number
  channels: number
  /** mono já rebatido (média dos canais), float32 em -1..1 */
  samples: Float32Array
}

const FMT_PCM = 1
const FMT_FLOAT = 3
const FMT_EXTENSIBLE = 0xfffe

export function decodeWav(buf: Buffer): DecodedWav {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('não é um arquivo WAV RIFF válido')
  }

  let format = 0
  let channels = 0
  let sampleRate = 0
  let bits = 0
  let dataStart = -1
  let dataLen = 0

  let p = 12
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4)
    const size = buf.readUInt32LE(p + 4)
    const body = p + 8
    if (id === 'fmt ') {
      format = buf.readUInt16LE(body)
      channels = buf.readUInt16LE(body + 2)
      sampleRate = buf.readUInt32LE(body + 4)
      bits = buf.readUInt16LE(body + 14)
      if (format === FMT_EXTENSIBLE && size >= 40) {
        // o formato real vive nos 2 primeiros bytes do GUID do SubFormat
        format = buf.readUInt16LE(body + 24)
      }
    } else if (id === 'data') {
      dataStart = body
      dataLen = Math.min(size, buf.length - body)
    }
    p = body + size + (size % 2) // chunks são alinhados em 2 bytes
  }

  if (dataStart < 0) throw new Error('WAV sem chunk "data"')
  if (!channels || !sampleRate) throw new Error('WAV sem chunk "fmt " utilizável')

  const bytesPerSample = bits >> 3
  const frameCount = Math.floor(dataLen / (bytesPerSample * channels))
  const out = new Float32Array(frameCount)

  const readOne = (off: number): number => {
    if (format === FMT_FLOAT) {
      return bits === 64 ? buf.readDoubleLE(off) : buf.readFloatLE(off)
    }
    if (format !== FMT_PCM) throw new Error(`formato WAV não suportado: ${format}`)
    switch (bits) {
      case 8:
        return (buf.readUInt8(off) - 128) / 128
      case 16:
        return buf.readInt16LE(off) / 32768
      case 24: {
        const v = buf.readUInt8(off) | (buf.readUInt8(off + 1) << 8) | (buf.readInt8(off + 2) << 16)
        return v / 8388608
      }
      case 32:
        return buf.readInt32LE(off) / 2147483648
      default:
        throw new Error(`profundidade de bits não suportada: ${bits}`)
    }
  }

  for (let i = 0; i < frameCount; i++) {
    const base = dataStart + i * bytesPerSample * channels
    let acc = 0
    for (let c = 0; c < channels; c++) acc += readOne(base + c * bytesPerSample)
    out[i] = acc / channels
  }

  return { sampleRate, channels, samples: out }
}
