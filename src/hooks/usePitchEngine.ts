import { useEffect, useRef, useState } from 'react'
import { PitchEngine, EngineStatus } from '../audio/PitchEngine'

/**
 * Cria e gerencia o ciclo de vida de um PitchEngine.
 * Retorna a instância (estável) e o status reativo (para a UI).
 * O status é o único estado React aqui — os frames de ~60fps são consumidos
 * pelos componentes via engine.subscribe(), sem re-renderizar o React.
 */
export function usePitchEngine() {
  const engineRef = useRef<PitchEngine | null>(null)
  if (engineRef.current === null) engineRef.current = new PitchEngine()
  const engine = engineRef.current

  const [status, setStatus] = useState<EngineStatus>('idle')

  useEffect(() => {
    engine.onStatus = setStatus
    return () => {
      engine.onStatus = undefined
      engine.stop()
    }
  }, [engine])

  return { engine, status }
}
