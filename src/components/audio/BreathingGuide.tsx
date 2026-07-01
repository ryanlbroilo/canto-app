import { useEffect, useRef, useState } from 'react'

// Guia de respiração ANATÔMICO — o corpo respirando de verdade.
// Um torso estilizado (cabeça, ombros, tórax, barriga) onde:
//   • os PULMÕES enchem de baixo pra cima no inspire;
//   • o DIAFRAGMA desce e achata (o gesto real da respiração diafragmática);
//   • a BARRIGA expande pra fora (a dica técnica: barriga sai, ombros parados);
//   • o AR flui pra dentro/fora conforme a fase.
// Movimento contínuo a 60fps: um rAF calcula o valor de respiração `--b` (0..1)
// com easing por fase e escreve numa CSS var; o SVG lê `--b` via calc() nos
// transforms (GPU, sem transição brigando com o rAF). Rótulo/contagem em estado
// React, atualizados só na virada (não a cada frame).

const CYCLE = [
  { key: 'inspire', name: 'Inspire', dur: 4 },
  { key: 'hold', name: 'Segure', dur: 4 },
  { key: 'exhale', name: 'Solte', dur: 6 },
] as const
const CYCLE_LEN = CYCLE.reduce((a, c) => a + c.dur, 0) // 14s

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2

function breathAt(inCycle: number): { breath: number; key: string; name: string; remain: number } {
  let acc = 0
  for (const c of CYCLE) {
    if (inCycle < acc + c.dur) {
      const p = (inCycle - acc) / c.dur
      const breath = c.key === 'inspire' ? easeOutCubic(p) : c.key === 'hold' ? 1 : 1 - easeInOutSine(p)
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
      <svg viewBox="0 0 220 300" className="breath-svg" aria-hidden="true">
        <defs>
          <radialGradient id="bgAura" cx="50%" cy="46%" r="60%">
            <stop offset="0%" stopColor="rgba(233,180,76,0.34)" />
            <stop offset="55%" stopColor="rgba(233,180,76,0.10)" />
            <stop offset="100%" stopColor="rgba(233,180,76,0)" />
          </radialGradient>
          <linearGradient id="bgLung" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#57d6a6" />
            <stop offset="100%" stopColor="#8fe9c6" />
          </linearGradient>
          <linearGradient id="bgBelly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(233,180,76,0.05)" />
            <stop offset="100%" stopColor="rgba(233,180,76,0.22)" />
          </linearGradient>
        </defs>

        {/* aura que respira */}
        <ellipse className="bg-aura" cx="110" cy="140" rx="96" ry="120" fill="url(#bgAura)" />

        {/* fluxo de ar (entra no inspire, sai no solte) */}
        <g className="bg-flow" stroke="#8fe9c6" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M110 8 C 104 24 116 34 110 52" strokeDasharray="5 9" />
          <path d="M96 14 C 92 28 100 38 96 54" strokeDasharray="4 10" opacity="0.7" />
          <path d="M124 14 C 128 28 120 38 124 54" strokeDasharray="4 10" opacity="0.7" />
        </g>

        {/* cabeça + pescoço (contexto de corpo, estático) */}
        <g className="bg-frame" fill="none" stroke="rgba(233,180,76,0.55)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="110" cy="40" r="17" />
          <path d="M100 55 L98 66 M120 55 L122 66" />
          {/* tórax (estático) */}
          <path d="M74 74 C74 66 146 66 146 74 C152 96 152 122 148 150 L72 150 C68 122 68 96 74 74 Z" />
        </g>

        {/* barriga — expande pra fora no inspire (barriga sai) */}
        <path
          className="bg-belly-fill"
          d="M72 150 L148 150 C154 178 150 202 136 220 L84 220 C70 202 66 178 72 150 Z"
          fill="url(#bgBelly)"
        />
        <path
          className="bg-belly"
          d="M72 150 L148 150 C154 178 150 202 136 220 L84 220 C70 202 66 178 72 150 Z"
          fill="none"
          stroke="rgba(233,180,76,0.6)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* pulmões: contorno + enchimento que sobe com --b */}
        <g className="bg-lungs">
          <path className="bg-lung-out" d="M104 78 C104 74 94 72 88 78 C78 88 76 112 80 132 C82 142 98 144 102 134 C106 124 106 96 104 78 Z" fill="none" stroke="rgba(143,233,198,0.5)" strokeWidth="1.6" />
          <path className="bg-lung-out" d="M116 78 C116 74 126 72 132 78 C142 88 144 112 140 132 C138 142 122 144 118 134 C114 124 114 96 116 78 Z" fill="none" stroke="rgba(143,233,198,0.5)" strokeWidth="1.6" />
          <g className="bg-lung-fill">
            <path d="M104 78 C104 74 94 72 88 78 C78 88 76 112 80 132 C82 142 98 144 102 134 C106 124 106 96 104 78 Z" fill="url(#bgLung)" />
            <path d="M116 78 C116 74 126 72 132 78 C142 88 144 112 140 132 C138 142 122 144 118 134 C114 124 114 96 116 78 Z" fill="url(#bgLung)" />
          </g>
          {/* traqueia */}
          <path d="M110 58 L110 80" stroke="rgba(143,233,198,0.5)" strokeWidth="1.6" fill="none" />
        </g>

        {/* DIAFRAGMA — a estrela: desce e achata no inspire */}
        <path className="bg-diaphragm" d="M70 146 Q110 128 150 146" fill="none" stroke="#e9b44c" strokeWidth="3.4" strokeLinecap="round" />
        <path className="bg-diaphragm bg-diaphragm-ghost" d="M70 146 Q110 128 150 146" fill="none" stroke="rgba(233,180,76,0.25)" strokeWidth="8" strokeLinecap="round" />
      </svg>

      <div className="breath-label">
        <span className="breath-phase">{label.name}</span>
        <span className="breath-count">{label.remain}s</span>
      </div>
    </div>
  )
}
