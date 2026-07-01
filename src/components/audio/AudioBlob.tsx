import { useEffect, useRef } from 'react'
import { PitchEngine } from '../../audio/PitchEngine'
import { centsColor, COLORS } from '../../theme'

/**
 * Blob de voz reativo — a assinatura da marca ("a IA que respira").
 * Um orbe orgânico que pulsa com a energia do microfone e muda de cor com a
 * precisão de afinação. Anima sozinho (respiração idle) mesmo sem áudio.
 *
 * Consome os sinais perceptuais quando disponíveis (guarda de undefined pro
 * backend analyser):
 *   • dynamics (0..1) → energia/escala do pulso (loudness perceptual suave).
 *     Fallback: proxy do RMS (comportamento anterior).
 *   • steadiness (0..1) → estabiliza a superfície: quanto mais firme a nota,
 *     menos "wobble" caótico → orbe sereno em vez de tremido.
 */
export function AudioBlob({ engine, size = 200 }: { engine: PitchEngine; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const energyRef = useRef(0) // dynamics (ou proxy do rms)
  const steadyRef = useRef(0) // steadiness (0..1)
  const centsRef = useRef<number | null>(null)

  useEffect(() => {
    const unsub = engine.subscribe((f) => {
      // dynamics é perceptual e já normalizado; sem ele, proxy do RMS.
      energyRef.current = f.dynamics ?? Math.min(1, f.rms * 9)
      steadyRef.current = f.steadiness ?? 0
      centsRef.current = f.freq != null && f.note != null ? f.note.cents : null
    })
    return unsub
  }, [engine])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let raf = 0
    let t = 0
    let level = 0
    let steady = 0

    const render = () => {
      t += 0.016
      // suavização do nível (ataque rápido, decaimento lento)
      const target = Math.min(1, energyRef.current)
      level += (target - level) * (target > level ? 0.35 : 0.06)
      // suavização da firmeza (mais lenta — evita saltos)
      steady += (steadyRef.current - steady) * 0.08

      const cx = size / 2
      const cy = size / 2
      const base = size * 0.26
      const breath = Math.sin(t * 1.2) * 0.03 + 0.03
      const r = base * (1 + breath + level * 0.5)

      const color = centsRef.current != null ? centsColor(centsRef.current) : COLORS.gold

      ctx.clearRect(0, 0, size, size)

      // glow externo (respira mais forte com energia; ganha um brilho extra
      // quando a nota está firme = presença serena)
      const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2)
      glow.addColorStop(0, hexA(color, 0.32 + level * 0.25 + steady * 0.12))
      glow.addColorStop(1, hexA(color, 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2)
      ctx.fill()

      // blob orgânico (raio modulado por senos). Firmeza REDUZ o wobble → quando
      // a nota assenta, o orbe fica liso e centrado; instável, ele "respira" mais.
      const wobK = 1 - steady * 0.6
      ctx.beginPath()
      const N = 90
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2
        const wob =
          (Math.sin(a * 3 + t * 1.6) * 0.06 +
            Math.sin(a * 5 - t * 1.1) * 0.04 +
            Math.sin(a * 2 + t * 0.7) * 0.05) *
          wobK
        const rr = r * (1 + wob * (0.6 + level))
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      const fill = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 1.3)
      fill.addColorStop(0, hexA(color, 0.95))
      fill.addColorStop(0.6, hexA(color, 0.5))
      fill.addColorStop(1, hexA(color, 0.18))
      ctx.fillStyle = fill
      ctx.fill()

      raf = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(raf)
  }, [engine, size])

  return (
    <div className="blob" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="blob-canvas" style={{ width: size, height: size }} />
    </div>
  )
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
