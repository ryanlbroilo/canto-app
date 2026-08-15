// IMPORTADOR DE MÚSICA para o modo karaokê.
//
//   npm run import:song -- "D:/musicas/minha-musica.mp3" --title "Título" --artist "Artista"
//
// Pipeline: demucs isola a voz → SwiftF0 (o MESMO model.onnx que o app roda no seu
// microfone) estima o F0 da voz isolada → o contorno vira notas → sai um .canto.json
// que o player consome.
//
// Roda na SUA máquina, uma vez por música. Nada sobe para servidor nenhum: a
// invariante do app ("o áudio não sai do cliente") continua de pé porque não existe
// cliente nem servidor aqui — existe você e um terminal.

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import * as ort from 'onnxruntime-node'

import { Resampler16k } from '../src/audio/resample'
import { freqToMidiFloat } from '../src/audio/notes'
import {
  SWIFTF0_CONF_OFFLINE,
  SWIFTF0_INPUT,
  SWIFTF0_OUT_CONF,
  SWIFTF0_OUT_PITCH,
  SWIFTF0_RATE,
  absPeak,
  decodeFrames,
  framesPerSecond,
  normalizeBy,
} from '../src/audio/swiftf0-core'
import { contourToNotes } from '../src/domain/karaoke/segment'
import { computeDemand } from '../src/domain/karaoke/demand'
import {
  KARAOKE_INDEX_FILE,
  KARAOKE_SCHEMA,
  type KaraokeIndex,
  type KaraokeIndexEntry,
  type KaraokeTrack,
} from '../src/domain/karaoke/track'
import { decodeWav } from './lib/wav'

const IMPORTER_VERSION = '1.0.0'
const SEPARATOR = 'htdemucs'
const MODEL_PATH = 'public/model.onnx'
const CACHE_DIR = '.cache/karaoke'
const DEFAULT_OUT = 'public/karaoke'

/** Bloco de inferência (s) e margem descartada nas emendas (s). */
const BLOCK_SEC = 20
const EDGE_SEC = 0.5

interface Args {
  input: string
  title?: string
  artist?: string
  out: string
  force: boolean
}

function parseArgs(argv: string[]): Args {
  const rest = argv.slice(2)
  const input = rest.find((a) => !a.startsWith('--'))
  if (!input) {
    console.error(
      [
        '',
        'uso: npm run import:song -- <arquivo de áudio> [opções]',
        '',
        '  --title  "T"    título (padrão: nome do arquivo)',
        '  --artist "A"    artista',
        '  --out    <dir>  destino do .canto.json (padrão: public/karaoke)',
        '  --force         reimporta mesmo com cache de separação disponível',
        '',
      ].join('\n'),
    )
    process.exit(1)
  }
  const flag = (name: string): string | undefined => {
    const i = rest.indexOf(`--${name}`)
    return i >= 0 ? rest[i + 1] : undefined
  }
  return {
    input: resolve(input),
    title: flag('title'),
    artist: flag('artist'),
    out: resolve(flag('out') ?? DEFAULT_OUT),
    force: rest.includes('--force'),
  }
}

const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function run(cmd: string, args: string[]): Promise<number> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
    p.on('error', rej)
    p.on('close', (code) => res(code ?? 1))
  })
}

/**
 * Chama o demucs pelo console script e, se ele não existir, por `python -m demucs`.
 *
 * O `pip install` põe o executável em `Scripts/` (Windows) ou `bin/` (Unix), e essa
 * pasta frequentemente não está no PATH do shell — sobretudo no Windows, e sobretudo
 * na mesma sessão em que o pacote acabou de ser instalado. O fallback por módulo só
 * depende do Python estar no PATH, o que é bem mais provável.
 */
async function runDemucs(args: string[]): Promise<number> {
  const direct = await run('demucs', args)
  if (direct === 0) return 0
  console.log('  · `demucs` indisponível no PATH; tentando `python -m demucs`…')
  return run('python', ['-m', 'demucs', ...args])
}

/** Separa a voz com demucs, cacheando por hash do arquivo de entrada. */
async function separateVocals(input: string, hash: string, force: boolean): Promise<string> {
  const outDir = join(CACHE_DIR, hash.slice(0, 12))
  const stem = basename(input, extname(input))
  const expected = join(outDir, SEPARATOR, stem, 'vocals.wav')

  if (!force && existsSync(expected)) {
    console.log(`  · separação em cache: ${expected}`)
    return expected
  }

  mkdirSync(outDir, { recursive: true })
  console.log(`  · separando voz com ${SEPARATOR} (demora ~1–3× a duração da música)…`)
  const code = await runDemucs(['--two-stems=vocals', '-n', SEPARATOR, '-o', outDir, input])
  if (code !== 0) {
    console.error(
      [
        '',
        'demucs falhou, pelo console script e por `python -m demucs`.',
        '',
        '  pip install -U demucs',
        '',
        'Requer Python 3.8+. Na primeira execução ele baixa o modelo (~300 MB) e a',
        'importação do torch demora bem mais que nas seguintes.',
        '',
      ].join('\n'),
    )
    process.exit(1)
  }
  if (existsSync(expected)) return expected

  // o demucs normaliza o nome da pasta; procura o vocals.wav que ele de fato criou
  const root = join(outDir, SEPARATOR)
  for (const dir of existsSync(root) ? readdirSync(root) : []) {
    const candidate = join(root, dir, 'vocals.wav')
    if (existsSync(candidate)) return candidate
  }
  console.error(`não encontrei vocals.wav em ${root}`)
  process.exit(1)
}

/** Roda o modelo num buffer @16 kHz e devolve os tensores crus. */
async function infer(
  session: ort.InferenceSession,
  audio: Float32Array,
): Promise<{ pitch: Float32Array; conf: Float32Array }> {
  const input = new ort.Tensor('float32', audio, [1, audio.length])
  const out = await session.run({ [SWIFTF0_INPUT]: input })
  return {
    pitch: out[SWIFTF0_OUT_PITCH].data as Float32Array,
    conf: out[SWIFTF0_OUT_CONF].data as Float32Array,
  }
}

/**
 * Mede o ATRASO do modelo com um sinal de verdade conhecida.
 *
 * O modelo tem uma STFT interna: o frame k não corresponde a k/fps, mas a k/fps mais
 * meia janela. Ignorar isso desloca TODAS as notas da referência pelo mesmo tanto —
 * um erro constante de dezenas de ms que apareceria no relatório como "você atrasa
 * sempre". Usa o CENTRO da região detectada contra o centro do tom real: a rampa de
 * confiança é aproximadamente simétrica na entrada e na saída, então o centro isola o
 * atraso puro melhor que o ataque.
 */
async function measureFrameOffset(
  session: ort.InferenceSession,
  fps: number,
): Promise<{ offsetSec: number; ok: boolean }> {
  const pad = SWIFTF0_RATE
  const tone = SWIFTF0_RATE
  const buf = new Float32Array(pad * 2 + tone)
  for (let i = 0; i < tone; i++) {
    buf[pad + i] = 0.4 * Math.sin((2 * Math.PI * 220 * i) / SWIFTF0_RATE)
  }
  const { pitch, conf } = await infer(session, buf)
  const frames = decodeFrames(pitch, conf, SWIFTF0_CONF_OFFLINE)
  const voiced: number[] = []
  frames.forEach((f, i) => {
    if (f.valid) voiced.push(i)
  })
  if (voiced.length < 3) return { offsetSec: 0, ok: false }
  const centerIdx = (voiced[0] + voiced[voiced.length - 1]) / 2
  const trueCenter = (pad + tone / 2) / SWIFTF0_RATE
  return { offsetSec: centerIdx / fps - trueCenter, ok: true }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv)
  if (!existsSync(args.input)) {
    console.error(`arquivo não encontrado: ${args.input}`)
    process.exit(1)
  }
  if (!existsSync(MODEL_PATH)) {
    console.error(`modelo não encontrado em ${MODEL_PATH}`)
    process.exit(1)
  }

  const title = args.title ?? basename(args.input, extname(args.input))
  const artist = args.artist ?? 'desconhecido'
  console.log(`\nimportando: ${title}${artist !== 'desconhecido' ? ` — ${artist}` : ''}\n`)

  const hash = sha256(args.input)
  const vocalsPath = await separateVocals(args.input, hash, args.force)

  console.log('  · decodificando voz isolada…')
  const wav = decodeWav(readFileSync(vocalsPath))
  const durationSec = wav.samples.length / wav.sampleRate

  console.log(`  · reamostrando ${wav.sampleRate} Hz → ${SWIFTF0_RATE} Hz…`)
  const audio = new Resampler16k(wav.sampleRate).process(wav.samples)

  // Normalização GLOBAL (e não por bloco): offline dá para conhecer o pico do arquivo
  // inteiro, e assim o gate de confiança significa a mesma coisa do começo ao fim da
  // música. Por bloco, um refrão alto e um verso sussurrado seriam normalizados de
  // formas diferentes e a cobertura variaria sem motivo musical.
  const peak = absPeak(audio)
  const normed = normalizeBy(audio, peak)

  console.log('  · carregando SwiftF0 (mesmo model.onnx do app)…')
  const session = await ort.InferenceSession.create(MODEL_PATH)

  // fps real do modelo, medido — não presumido
  const probeLen = Math.min(normed.length, SWIFTF0_RATE * 5)
  const probe = await infer(session, normed.subarray(0, probeLen))
  const fps = framesPerSecond(probe.pitch.length, probeLen)
  if (!fps) {
    console.error('não consegui derivar a taxa de frames do modelo')
    process.exit(1)
  }

  const { offsetSec, ok } = await measureFrameOffset(session, fps)
  console.log(
    `  · modelo: ${fps.toFixed(2)} fps, atraso ${(offsetSec * 1000).toFixed(1)} ms` +
      (ok ? '' : ' (não medido — self-test falhou)'),
  )

  const totalFrames = Math.ceil(durationSec * fps)
  const midi: (number | null)[] = new Array(totalFrames).fill(null)
  const confArr: number[] = new Array(totalFrames).fill(0)

  const block = BLOCK_SEC * SWIFTF0_RATE
  const edge = EDGE_SEC * SWIFTF0_RATE
  const step = block - 2 * edge
  let done = 0

  for (let start = 0; start < normed.length; start += step) {
    const end = Math.min(normed.length, start + block)
    const atStart = start === 0
    const atEnd = end >= normed.length

    const { pitch, conf } = await infer(session, normed.subarray(start, end))
    const frames = decodeFrames(pitch, conf, SWIFTF0_CONF_OFFLINE)
    const blockSec = (end - start) / SWIFTF0_RATE

    for (let f = 0; f < frames.length; f++) {
      const tLocal = f / fps
      // descarta as bordas das emendas: o primeiro e o último frame de cada bloco
      // veem uma janela truncada e mentem
      if (!atStart && tLocal < EDGE_SEC) continue
      if (!atEnd && tLocal > blockSec - EDGE_SEC) continue

      const tGlobal = start / SWIFTF0_RATE + tLocal - offsetSec
      const idx = Math.round(tGlobal * fps)
      if (idx < 0 || idx >= totalFrames) continue

      const fr = frames[f]
      confArr[idx] = fr.conf
      midi[idx] = fr.valid ? freqToMidiFloat(fr.f0) : null
    }

    done = end
    process.stdout.write(`\r  · estimando F0: ${((done / normed.length) * 100).toFixed(0)}%   `)
    if (atEnd) break
  }
  process.stdout.write('\n')

  const { notes, phrases } = contourToNotes(midi, fps)
  const demand = computeDemand(notes, phrases, midi, fps)
  const voicedFrames = midi.reduce<number>((a, v) => a + (v !== null ? 1 : 0), 0)
  const coveragePct = totalFrames ? voicedFrames / totalFrames : 0

  const id = slugify(`${artist}-${title}`)
  const track: KaraokeTrack = {
    schema: KARAOKE_SCHEMA,
    id,
    title,
    artist,
    audioSha256: hash,
    audioFileName: basename(args.input),
    durationSec: +durationSec.toFixed(3),
    importer: { model: 'swiftf0', version: IMPORTER_VERSION, separator: SEPARATOR },
    refContour: {
      fps: +fps.toFixed(4),
      // arredonda para encolher o JSON; 3 casas em MIDI = 1,2 cents, bem abaixo do
      // que o detector distingue, então não se perde nada de real
      midi: midi.map((v) => (v === null ? null : +v.toFixed(3))),
      conf: confArr.map((c) => +c.toFixed(2)),
    },
    notes,
    phrases,
    demand,
    coveragePct: +coveragePct.toFixed(4),
  }

  mkdirSync(args.out, { recursive: true })
  const outPath = join(args.out, `${id}.canto.json`)
  writeFileSync(outPath, JSON.stringify(track))
  writeIndex(args.out, track)

  const mins = Math.floor(durationSec / 60)
  const secs = Math.round(durationSec % 60)
  console.log('')
  console.log(`  duração      ${mins}:${String(secs).padStart(2, '0')}`)
  console.log(`  notas        ${notes.length} em ${phrases.length} frases`)
  console.log(
    `  extensão     ${demand.raw.rangeSemitones} semitons (MIDI ${demand.raw.loMidi}–${demand.raw.hiMidi})`,
  )
  console.log(`  cobertura    ${(coveragePct * 100).toFixed(0)}% dos frames com voz detectada`)
  if (coveragePct < 0.25) {
    console.log('               ⚠ cobertura baixa — a voz pode estar enterrada na mixagem')
  }
  console.log('')
  console.log(`  → ${outPath}`)
  console.log('')
}

/**
 * Regrava o índice que o app lê para montar a lista de faixas.
 *
 * Reconstrói a entrada desta faixa e preserva as demais. Uma entrada órfã (o
 * `.canto.json` foi apagado à mão) é descartada aqui em vez de virar um item que
 * falha só quando o usuário clica nele.
 */
function writeIndex(outDir: string, track: KaraokeTrack): void {
  const indexPath = join(outDir, KARAOKE_INDEX_FILE)
  let tracks: KaraokeIndexEntry[] = []
  if (existsSync(indexPath)) {
    try {
      const parsed = JSON.parse(readFileSync(indexPath, 'utf8')) as Partial<KaraokeIndex>
      if (Array.isArray(parsed.tracks)) tracks = parsed.tracks
    } catch {
      // índice corrompido: reconstruir a partir do que existe no disco é melhor do
      // que abortar uma importação que já custou minutos de separação
      tracks = []
    }
  }
  tracks = tracks.filter((t) => t.id !== track.id && existsSync(join(outDir, `${t.id}.canto.json`)))
  tracks.push({
    id: track.id,
    title: track.title,
    artist: track.artist,
    durationSec: track.durationSec,
    audioFileName: track.audioFileName,
    audioSha256: track.audioSha256,
    coveragePct: track.coveragePct,
    importedAt: new Date().toISOString(),
  })
  tracks.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  const index: KaraokeIndex = { schema: KARAOKE_SCHEMA, tracks }
  writeFileSync(indexPath, JSON.stringify(index, null, 2))
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack : String(err))
  process.exit(1)
})
