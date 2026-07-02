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

    // Partículas de luz que orbitam a superfície (posições estáveis, deterministas).
    const PARTS = Array.from({ length: 7 }, (_, i) => ({
      base: (i / 7) * TAU + i * 1.3,
      rad: 0.62 + ((i * 37) % 40) / 100, // 0.62..1.0 do raio
      speed: 0.12 + ((i * 13) % 20) / 100, // rad/s
      size: 1.6 + ((i * 7) % 20) / 10,
      phase: i * 1.7,
    }))

    const blobPath = (R: number, amp: number, cx: number, cy: number): Path2D => {
      const p = new Path2D()
      const N = 220
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * TAU
        const wob =
          Math.sin(a * 2 + t * 0.8) * 0.5 + Math.sin(a * 3 - t * 0.6) * 0.3 + Math.sin(a * 5 + t * 0.45) * 0.2
        const rr = R * (1 + wob * amp)
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        if (i === 0) p.moveTo(x, y)
        else p.lineTo(x, y)
      }
      p.closePath()
      return p
    }

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
      const R = size * 0.2 * (1 + idle + level * 0.6)

      ctx.clearRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'lighter' // camadas de luz somam (glow real)

      // 1) glow externo em camadas (aura)
      const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.6)
      glow.addColorStop(0, rgba(0.2 + level * 0.3 + steady * 0.08))
      glow.addColorStop(0.5, rgba(0.06))
      glow.addColorStop(1, rgba(0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, size, size)

      // 2) halo pulsante (anel que respira e fica mais forte com a energia)
      const haloR = R * (1.42 + idle * 2)
      ctx.beginPath()
      ctx.arc(cx, cy, haloR, 0, TAU)
      ctx.strokeStyle = rgba(0.1 + level * 0.22)
      ctx.lineWidth = 1.2 + level * 1.4
      ctx.stroke()

      // 3) corpo do orbe em CAMADAS (profundidade tipo metaball)
      const amp = (0.03 + level * 0.055) * (1 - steady * 0.55)
      const back = blobPath(R * 1.14, amp * 1.25, cx, cy)
      const backFill = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.3)
      backFill.addColorStop(0, rgba(0.22))
      backFill.addColorStop(1, rgba(0))
      ctx.fillStyle = backFill
      ctx.fill(back)

      const path = blobPath(R, amp, cx, cy)
      // luz que ORBITA devagar → brilho vivo, não estático
      const la = t * 0.35
      const lx = cx + Math.cos(la - 2.2) * R * 0.34
      const ly = cy + Math.sin(la - 2.2) * R * 0.4 - R * 0.12
      const fill = ctx.createRadialGradient(lx, ly, R * 0.06, cx, cy, R * 1.18)
      fill.addColorStop(0, rgba(0.98))
      fill.addColorStop(0.45, rgba(0.66))
      fill.addColorStop(0.8, rgba(0.28))
      fill.addColorStop(1, rgba(0.08))
      ctx.fillStyle = fill
      ctx.fill(path)

      // 4) núcleo quente (mais brilhante ao cantar firme)
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.7)
      core.addColorStop(0, `rgba(255,250,240,${0.18 + level * 0.4})`)
      core.addColorStop(1, 'rgba(255,250,240,0)')
      ctx.fillStyle = core
      ctx.fill(path)

      // 5) brilho especular (vidro) — recortado no orbe, acompanha a luz que orbita
      ctx.save()
      ctx.clip(path)
      const spec = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 0.7)
      spec.addColorStop(0, `rgba(255,255,255,${0.32 + steady * 0.24})`)
      spec.addColorStop(0.4, 'rgba(255,255,255,0.04)')
      spec.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = spec
      ctx.fillRect(0, 0, size, size)
      ctx.restore()

      // 6) partículas de luz orbitando (acendem com a energia)
      for (const p of PARTS) {
        const ang = p.base + t * p.speed
        const orb = R * p.rad * (1 + Math.sin(t * 0.7 + p.phase) * 0.05)
        const px = cx + Math.cos(ang) * orb
        const py = cy + Math.sin(ang) * orb
        const pr = p.size * (0.7 + level * 1.1)
        const pa = 0.12 + level * 0.55 + steady * 0.1
        const pg = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.4)
        pg.addColorStop(0, `rgba(255,252,244,${pa})`)
        pg.addColorStop(1, 'rgba(255,252,244,0)')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py, pr * 2.4, 0, TAU)
        ctx.fill()
      }

      // 7) rim-light sutil
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = rgba(0.42 + steady * 0.3)
      ctx.lineWidth = 1.3
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
