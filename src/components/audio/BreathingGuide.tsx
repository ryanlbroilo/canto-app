import { Component, lazy, ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { breathAt } from '../../audio/breathCycle'

// A cena 3D é pesada (three.js) → carrega sob demanda. O bundle principal não cresce.
const Body3D = lazy(() => import('./Body3D'))

// Se o WebGL/3D falhar (contexto perdido, GPU bloqueada), o exercício NÃO pode quebrar:
// caímos num círculo que respira via CSS (dirigido pela mesma var --b).
class Body3DBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Guia de respiração — corpo 3D REAL (Three.js) num palco de estúdio, dentro de um
// fluxo guiado. Um rAF escreve a CSS var --b (0..1, ciclo 4-4-6 em seno) pro
// backdrop/anel; a cena 3D lê o mesmo tempo por conta própria (via startedAt) →
// sincronizados. Rótulo/contagem só re-renderizam na virada de estado.
export function BreathingGuide({ startedAt, running }: { startedAt: number; running: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState({ name: 'Inspire', remain: 4 })

  useEffect(() => {
    if (!running) return
    let raf = 0
    let lastKey = ''
    const loop = () => {
      const el = (performance.now() - startedAt) / 1000
      const b = breathAt(el)
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
      <div className="breath-stage">
        <div className="breath-stage-glow" />
        <Body3DBoundary fallback={<div className="breath-fallback" />}>
          <Suspense fallback={<div className="breath-fallback" />}>
            <Body3D startedAt={startedAt} />
          </Suspense>
        </Body3DBoundary>
      </div>
      <div className="breath-label">
        <span className="breath-phase">{label.name}</span>
        <span className="breath-count">{label.remain}s</span>
      </div>
    </div>
  )
}
