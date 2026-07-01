import { useEffect, useRef } from 'react'
import { PitchEngine } from '../audio/PitchEngine'

/** Barra fina de volume (RMS), atualizada imperativamente. Indica "estou te ouvindo". */
export function LevelMeter({ engine }: { engine: PitchEngine }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return engine.subscribe((f) => {
      const bar = barRef.current
      if (!bar) return
      // RMS típico de voz fica bem abaixo de 1; escalamos para dar range visual.
      const pct = Math.min(100, Math.round(f.rms * 320))
      bar.style.width = `${pct}%`
    })
  }, [engine])

  return (
    <div className="level" title="Nível do microfone">
      <div className="level-bar" ref={barRef} />
    </div>
  )
}
