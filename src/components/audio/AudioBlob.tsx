import { useEffect, useRef } from 'react'
import { PitchEngine } from '../../audio/PitchEngine'
import { centsColor, COLORS } from '../../theme'

/**
 * Orbe de voz — a assinatura viva da marca ("a IA que respira").
 * Uma esfera luminosa, orgânica e SERENA que:
 *   • pulsa com a energia da voz (dynamics/rms) — cresce ao cantar;
 *   • muda de cor com a afinação (verde/âmbar/coral), com transição suave (lerp);
 *   • alisa a superfície quando a nota está firme (steadiness) e ondula mais quando
 *     instável — presença calma, não um blob tremido;
 *   • respira sozinha quando em silêncio.
 * Render premium: glow em camadas, corpo com luz vinda do topo-esquerda, brilho
 * especular de vidro e rim-light. Guarda de undefined pro backend analyser.
 */
export function AudioBlob({ engine, size = 200 }: { engine: PitchEngine; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const energyRef = useRef(0)
  const steadyRef = useRef(0)
  const centsRef = useRef<number | null>(null)

  useEffect(() => {
    return engine.subscribe((f) => {
      energyRef.current = f.dynamics ?? Math.min(1, f.rms * 9)
      steadyRef.current = f.steadiness ?? 0
      centsRef.current = f.freq != null && f.note != null ? f.note.cents : null
    })
  }, [engine])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const TAU = Math.PI * 2
    let raf = 0
    let t = 0
    let level = 0
    let steady = 0
    const rgb = hexToRgb(COLORS.gold) // cor corrente (faz lerp até a cor-alvo)

    const render = () => {
      t += 0.016
      const target = Math.min(1, energyRef.current)
      level += (target - level) * (target > level ? 0.26 : 0.05) // ataque rápido, decai lento
      steady += (steadyRef.current - steady) * 0.06

      const tgt = hexToRgb(centsRef.current != null ? centsColor(centsRef.current) : COLORS.gold)
      rgb[0] += (tgt[0] - rgb[0]) * 0.08
      rgb[1] += (tgt[1] - rgb[1]) * 0.08
      rgb[2] += (tgt[2] - rgb[2]) * 0.08
      const rgba = (a: number) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`

      const cx = size / 2
      const cy = size / 2
      const idle = (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.05 // respiração idle
      const R = size * 0.22 * (1 + idle + level * 0.55)

      ctx.clearRect(0, 0, size, size)

      // 1) glow externo em camadas (aura)
      const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.5)
      glow.addColorStop(0, rgba(0.2 + level * 0.28 + steady * 0.08))
      glow.addColorStop(0.5, rgba(0.07))
      glow.addColorStop(1, rgba(0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, size, size)

      // 2) corpo do orbe — silhueta suave (ondulação baixa, alisada pela firmeza)
      const amp = (0.03 + level * 0.055) * (1 - steady * 0.55)
      const path = new Path2D()
      const N = 220
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * TAU
        const wob =
          Math.sin(a * 2 + t * 0.8) * 0.5 + Math.sin(a * 3 - t * 0.6) * 0.3 + Math.sin(a * 5 + t * 0.45) * 0.2
        const rr = R * (1 + wob * amp)
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        if (i === 0) path.moveTo(x, y)
        else path.lineTo(x, y)
      }
      path.closePath()

      // preenchimento com luz vinda do topo-esquerda (dá volume)
      const lx = cx - R * 0.32
      const ly = cy - R * 0.4
      const fill = ctx.createRadialGradient(lx, ly, R * 0.08, cx, cy, R * 1.18)
      fill.addColorStop(0, rgba(0.98))
      fill.addColorStop(0.45, rgba(0.68))
      fill.addColorStop(0.8, rgba(0.3))
      fill.addColorStop(1, rgba(0.1))
      ctx.fillStyle = fill
      ctx.fill(path)

      // 3) brilho especular (vidro) — recortado no orbe
      ctx.save()
      ctx.clip(path)
      const spec = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 0.7)
      spec.addColorStop(0, `rgba(255,255,255,${0.3 + steady * 0.22})`)
      spec.addColorStop(0.4, 'rgba(255,255,255,0.05)')
      spec.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = spec
      ctx.fillRect(0, 0, size, size)
      ctx.restore()

      // 4) rim-light sutil
      ctx.strokeStyle = rgba(0.5 + steady * 0.3)
      ctx.lineWidth = 1.4
      ctx.stroke(path)

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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
