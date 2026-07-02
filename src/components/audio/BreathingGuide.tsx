import { useEffect, useRef, useState } from 'react'

// Guia de respiração — uma figura HUMANA serena respirando (não um diagrama).
// Uma silhueta (cabeça, ombros, peito, barriga) com uma LUZ interna que sobe e
// enche no inspire; a barriga expande pra fora (respiração diafragmática) e o
// corpo sobe de leve. Órgãos viram brilho, não anatomia clínica.
// 60fps via rAF escrevendo a CSS var --b (0..1) com easing suave por fase; o SVG
// lê --b nos transforms (GPU). Rótulo/contagem só re-renderizam na virada.

const CYCLE = [
  { key: 'inspire', name: 'Inspire', dur: 4 },
  { key: 'hold', name: 'Segure', dur: 4 },
  { key: 'exhale', name: 'Solte', dur: 6 },
] as const
const CYCLE_LEN = CYCLE.reduce((a, c) => a + c.dur, 0) // 14s

// Seno suave (natural): inspira e solta com a mesma curva orgânica.
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2

function breathAt(inCycle: number): { breath: number; key: string; name: string; remain: number } {
  let acc = 0
  for (const c of CYCLE) {
    if (inCycle < acc + c.dur) {
      const p = (inCycle - acc) / c.dur
      const breath = c.key === 'inspire' ? easeInOutSine(p) : c.key === 'hold' ? 1 : 1 - easeInOutSine(p)
      return { breath, key: c.key, name: c.name, remain: Math.ceil(acc + c.dur - inCycle) }
    }
    acc += c.dur
  }
  return { breath: 0, key: 'exhale', name: 'Solte', remain: 0 }
}

export function BreathingGuide({ startedAt, running }: { startedAt: number; running: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState({ name: 'Inspire', remain: 4 })

  useEffect(() => {
    if (!running) return
    let raf = 0
    let lastKey = ''
    const loop = () => {
      const el = (performance.now() - startedAt) / 1000
      const b = breathAt(el % CYCLE_LEN)
      const root = rootRef.current
      if (root) {
        root.style.setProperty('--b', b.breath.toFixed(4))
        if (b.key !== lastKey) {
          lastKey = b.key
          root.setAttribute('data-phase', b.key)
        }
      }
      setLabel((prev) => (prev.name === b.name && prev.remain === b.remain ? prev : { name: b.name, remain: b.remain }))
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [startedAt, running])

  return (
    <div className="breath-guide" ref={rootRef} data-phase="inspire" style={{ ['--b' as string]: 0 } as React.CSSProperties}>
      <svg viewBox="0 0 240 300" className="breath-svg" aria-hidden="true">
        <defs>
          <radialGradient id="bdAura" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="rgba(233,180,76,0.28)" />
            <stop offset="60%" stopColor="rgba(233,180,76,0.08)" />
            <stop offset="100%" stopColor="rgba(233,180,76,0)" />
          </radialGradient>
          <linearGradient id="bdSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(240,201,138,0.26)" />
            <stop offset="100%" stopColor="rgba(233,180,76,0.12)" />
          </linearGradient>
          <radialGradient id="bdBreath" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(143,233,198,0.95)" />
            <stop offset="55%" stopColor="rgba(87,214,166,0.45)" />
            <stop offset="100%" stopColor="rgba(87,214,166,0)" />
          </radialGradient>
        </defs>

        {/* aura que respira */}
        <ellipse className="bd-aura" cx="120" cy="150" rx="98" ry="120" fill="url(#bdAura)" />

        {/* fluxo de ar (entra no inspire, sai no solte) */}
        <g className="bd-flow" stroke="rgba(143,233,198,0.9)" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M120 12 C 114 26 126 34 120 50" strokeDasharray="5 9" />
          <path d="M107 18 C 103 30 111 38 107 52" strokeDasharray="4 10" opacity="0.65" />
          <path d="M133 18 C 137 30 129 38 133 52" strokeDasharray="4 10" opacity="0.65" />
        </g>

        {/* o corpo — sobe de leve no inspire */}
        <g className="bd-body">
          {/* luz da respiração dentro do tronco (sobe e enche) */}
          <ellipse className="bd-breath" cx="120" cy="176" rx="46" ry="58" fill="url(#bdBreath)" />

          {/* cabeça + pescoço */}
          <ellipse cx="120" cy="50" rx="25" ry="29" fill="url(#bdSkin)" stroke="rgba(233,180,76,0.55)" strokeWidth="1.6" />
          <path d="M107 74 C 112 84 128 84 133 74 L 135 92 L 105 92 Z" fill="url(#bdSkin)" stroke="rgba(233,180,76,0.4)" strokeWidth="1.4" strokeLinejoin="round" />

          {/* tronco superior (ombros + peito) — abre discretamente */}
          <path
            className="bd-chest"
            d="M106 90 C 88 92 74 104 66 126 C 60 148 62 172 68 196 L 172 196 C 178 172 180 148 174 126 C 166 104 152 92 134 90 Z"
            fill="url(#bdSkin)"
            stroke="rgba(233,180,76,0.5)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* barriga — expande pra fora no inspire (a dica: barriga sai) */}
          <path
            className="bd-belly"
            d="M68 196 C 66 222 70 250 78 284 L 162 284 C 170 250 174 222 172 196 Z"
            fill="url(#bdSkin)"
            stroke="rgba(233,180,76,0.5)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className="breath-label">
        <span className="breath-phase">{label.name}</span>
        <span className="breath-count">{label.remain}s</span>
      </div>
    </div>
  )
}
