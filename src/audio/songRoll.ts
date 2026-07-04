// PIANO-ROLL do score-following (S7) — desenha a melodia rolando: blocos de nota
// posicionados por TEMPO (x) × PITCH (y), um playhead fixo, e a curva de pitch do
// cantor ao vivo por cima. As notas acendem verde (acertou) / vermelho (errou)
// quando passam pelo playhead. Puro: recebe um CanvasRenderingContext2D + dados,
// sem estado próprio. O SongPlayer chama a cada frame do relógio de áudio.

import { TimedNote } from '../data/songs'

export interface NoteResult {
  hit: boolean
  score: number
}

export interface SongRollParams {
  /** dimensões em CSS px */
  width: number
  height: number
  /** device pixel ratio (nitidez) */
  dpr: number
  notes: TimedNote[]
  /** tempo atual da música (s); a melodia rola em relação a ele */
  elapsed: number
  /** pontos recentes de pitch cantado: t (s da música) × midi */
  sungTrace: { t: number; midi: number }[]
  /** resultados finalizados por índice de nota (colore hit/miss) */
  results: Map<number, NoteResult>
  pitchLo: number
  pitchHi: number
}

// O canvas não enxerga as CSS vars — cores inline espelhando os tokens.
const COL = {
  bg: 'rgba(255,255,255,0.02)',
  noteUpcoming: 'rgba(233,180,76,0.26)',
  noteUpcomingBorder: 'rgba(233,180,76,0.5)',
  noteActive: '#f3cd73',
  noteHit: '#57d6a6',
  noteMiss: '#f26d5b',
  trace: '#7fb2ff',
  sungDot: '#eaf2ff',
  lyric: 'rgba(245,237,221,0.7)',
  playhead: '#f3cd73',
}

const PX_PER_SEC = 96
const PLAYHEAD_FRAC = 0.28
const NOTE_H = 15

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Faixa de pitch [lo, hi] pra exibir a melodia (com folga de 3 semitons). */
export function rollPitchRange(notes: TimedNote[]): { lo: number; hi: number } {
  if (!notes.length) return { lo: 55, hi: 67 }
  let lo = Infinity
  let hi = -Infinity
  for (const n of notes) {
    lo = Math.min(lo, n.midi)
    hi = Math.max(hi, n.midi)
  }
  return { lo: lo - 3, hi: hi + 3 }
}

export function drawSongRoll(ctx: CanvasRenderingContext2D, p: SongRollParams): void {
  const { width: W, height: H, dpr } = p
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = COL.bg
  roundRect(ctx, 0, 0, W, H, 12)
  ctx.fill()

  const playheadX = W * PLAYHEAD_FRAC
  const timeToX = (t: number): number => playheadX + (t - p.elapsed) * PX_PER_SEC
  const span = Math.max(1, p.pitchHi - p.pitchLo)
  const padY = 20
  const usableH = Math.max(1, H - padY * 2)
  const midiToY = (m: number): number => H - padY - ((m - p.pitchLo) / span) * usableH

  // ---- notas ----
  for (const nt of p.notes) {
    const x1 = timeToX(nt.startSec)
    const x2 = timeToX(nt.endSec)
    if (x2 < -8 || x1 > W + 8) continue
    const y = midiToY(nt.midi)
    const w = Math.max(6, x2 - x1)
    const res = p.results.get(nt.index)
    const isActive = p.elapsed >= nt.startSec && p.elapsed < nt.endSec
    let fill = COL.noteUpcoming
    let border: string | null = COL.noteUpcomingBorder
    if (res) {
      fill = res.hit ? COL.noteHit : COL.noteMiss
      border = null
    } else if (isActive) {
      fill = COL.noteActive
      border = null
    }
    ctx.fillStyle = fill
    roundRect(ctx, x1, y - NOTE_H / 2, w, NOTE_H, 6)
    ctx.fill()
    if (border) {
      ctx.strokeStyle = border
      ctx.lineWidth = 1
      ctx.stroke()
    }
    if (w > 18 && nt.lyric) {
      ctx.fillStyle = COL.lyric
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(nt.lyric, x1 + w / 2, y - NOTE_H / 2 - 9)
    }
  }

  // ---- curva de pitch do cantor ----
  if (p.sungTrace.length > 1) {
    ctx.strokeStyle = COL.trace
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    let started = false
    for (const pt of p.sungTrace) {
      const x = timeToX(pt.t)
      if (x < -4 || x > W + 4) continue
      const y = midiToY(pt.midi)
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  // ---- dot do pitch atual, no playhead ----
  const last = p.sungTrace[p.sungTrace.length - 1]
  if (last && Math.abs(last.t - p.elapsed) < 0.18) {
    const y = midiToY(last.midi)
    ctx.save()
    ctx.shadowColor = COL.trace
    ctx.shadowBlur = 12
    ctx.fillStyle = COL.sungDot
    ctx.beginPath()
    ctx.arc(playheadX, y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // ---- playhead ----
  ctx.strokeStyle = COL.playhead
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.75
  ctx.beginPath()
  ctx.moveTo(playheadX, 6)
  ctx.lineTo(playheadX, H - 6)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.restore()
}
