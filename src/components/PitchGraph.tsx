import { useEffect, useRef } from 'react'
import { PitchEngine, PitchFrame } from '../audio/PitchEngine'
import { freqToMidiFloat, midiToName } from '../audio/notes'
import { centsColor, COLORS } from '../theme'

// Faixa de pitch visível no gráfico (MIDI). G2..G5 cobre a maior parte das vozes.
const MIN_MIDI = 43 // G2
const MAX_MIDI = 79 // G5
const MAX_POINTS = 260 // ~4-5s de histórico a 60fps

interface Point {
  midiF: number | null
  cents: number
}

/**
 * Piano-roll horizontal: histórico de pitch rolando da direita para a esquerda.
 * Cada ponto é colorido pela precisão (verde/amarelo/vermelho). Se há alvo,
 * desenha a linha-alvo e a faixa de ±10 cents (a "zona verde").
 * Desenha imperativamente a cada frame — sem estado React.
 */
export function PitchGraph({ engine, target }: { engine: PitchEngine; target: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<Point[]>([])
  const targetRef = useRef(target)
  targetRef.current = target

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const yFor = (midi: number, h: number) => h - ((midi - MIN_MIDI) / (MAX_MIDI - MIN_MIDI)) * h

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Grade de semitons (C em destaque).
      for (let m = MIN_MIDI; m <= MAX_MIDI; m++) {
        const y = yFor(m, h)
        const isC = (((m % 12) + 12) % 12) === 0
        ctx.strokeStyle = isC ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.035)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
        if (isC) {
          const { name, octave } = midiToName(m)
          ctx.fillStyle = 'rgba(255,255,255,0.28)'
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
          ctx.fillText(`${name}${octave}`, 6, y - 4)
        }
      }

      // Alvo + zona de ±10 cents.
      const tgt = targetRef.current
      if (tgt != null && tgt >= MIN_MIDI && tgt <= MAX_MIDI) {
        const topY = yFor(tgt + 0.1, h) // +10 cents
        const botY = yFor(tgt - 0.1, h) // -10 cents
        ctx.fillStyle = 'rgba(52,224,161,0.12)'
        ctx.fillRect(0, topY, w, botY - topY)
        const yT = yFor(tgt, h)
        ctx.strokeStyle = 'rgba(52,224,161,0.55)'
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(0, yT)
        ctx.lineTo(w, yT)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Traço do histórico (pontos), do mais antigo (esq.) ao mais novo (dir.).
      const hist = historyRef.current
      const n = hist.length
      const step = w / (MAX_POINTS - 1)
      for (let idx = 0; idx < n; idx++) {
        const p = hist[idx]
        if (p.midiF == null) continue
        if (p.midiF < MIN_MIDI || p.midiF > MAX_MIDI) continue
        const x = w - (n - 1 - idx) * step
        const y = yFor(p.midiF, h)
        ctx.fillStyle = centsColor(p.cents)
        ctx.beginPath()
        ctx.arc(x, y, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const unsub = engine.subscribe((f: PitchFrame) => {
      const hist = historyRef.current
      let midiF: number | null = null
      let cents = 0
      if (f.freq != null && f.note != null) {
        midiF = freqToMidiFloat(f.freq)
        const tgt = targetRef.current
        cents = tgt != null ? Math.round((midiF - tgt) * 100) : f.note.cents
      }
      hist.push({ midiF, cents })
      if (hist.length > MAX_POINTS) hist.shift()
      draw()
    })

    // Primeiro desenho (grade) mesmo sem frames.
    draw()
    return unsub
  }, [engine])

  return (
    <div className="graph">
      <canvas ref={canvasRef} className="graph-canvas" />
      <div className="graph-legend">
        <span style={{ color: COLORS.good }}>● no alvo</span>
        <span style={{ color: COLORS.close }}>● perto</span>
        <span style={{ color: COLORS.off }}>● fora</span>
      </div>
    </div>
  )
}
