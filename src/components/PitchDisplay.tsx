import { useEffect, useRef } from 'react'
import { PitchEngine, PitchFrame } from '../audio/PitchEngine'
import { freqToMidiFloat, freqToNote, midiLabel } from '../audio/notes'
import { centsZone } from '../theme'

/**
 * Leitura grande: nota cantada + desvio em cents + agulha VIVA.
 * Atualiza o DOM imperativamente (refs) a cada frame para não re-renderizar o
 * React a 60fps. A cor/zona é comunicada via data-state (ver CSS).
 *
 * Sinais perceptuais consumidos (todos OPCIONAIS — guarda de undefined pro
 * backend analyser, que não os fornece):
 *   • smoothedFreq → posição da agulha e nota exibida (suave, sem tremor).
 *   • locked/lockMs → celebração da trava de afinador (anel pulsante, "na mira").
 *   • dynamics (0..1) → energia visual (brilho/escala da nota).
 *   • steadiness (0..1) → anel de firmeza ao redor da nota.
 *   • noteState → toque no ataque (onset) vs sustentação.
 *
 * - Sem alvo (target=null): modo AFINADOR — cents em relação à nota mais próxima.
 * - Com alvo: cents em relação à NOTA-ALVO (praticar acertar uma nota específica).
 */
export function PitchDisplay({ engine, target }: { engine: PitchEngine; target: number | null }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const centsRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef<HTMLDivElement>(null) // anel/rótulo de trava
  const steadyRef = useRef<HTMLDivElement>(null) // arco de firmeza

  // target via ref para o callback sempre ver o valor atual sem re-inscrever.
  const targetRef = useRef(target)
  targetRef.current = target

  useEffect(() => {
    const unsub = engine.subscribe((f: PitchFrame) => {
      const wrap = wrapRef.current
      const note = noteRef.current
      const sub = subRef.current
      const cents = centsRef.current
      const needle = needleRef.current
      const lock = lockRef.current
      const steady = steadyRef.current
      if (!wrap || !note || !sub || !cents || !needle) return

      // Frequência de referência para posicionar a agulha: preferimos o F0
      // suavizado (perceptual) → agulha sem tremor. Fallback: freq cru.
      const displayFreq = f.smoothedFreq ?? f.freq ?? null

      if (displayFreq == null || f.freq == null) {
        wrap.dataset.state = 'silent'
        wrap.dataset.note = 'silent'
        wrap.dataset.locked = '0'
        note.textContent = '—'
        sub.textContent = 'cante uma nota'
        cents.textContent = ''
        needle.style.left = '50%'
        needle.style.setProperty('--dyn', '0')
        if (lock) lock.dataset.on = '0'
        if (steady) steady.style.setProperty('--steady', '0')
        return
      }

      // A nota exibida é derivada do F0 suavizado (mais estável). Se não houver
      // smoothedFreq, usamos o note já pronto do frame (backend analyser).
      const shown = f.smoothedFreq != null ? freqToNote(f.smoothedFreq) : f.note!
      const tgt = targetRef.current
      let centsValue: number
      if (tgt != null) {
        centsValue = Math.round((freqToMidiFloat(displayFreq) - tgt) * 100)
        note.textContent = `${shown.name}${shown.octave}`
        sub.textContent = `alvo ${midiLabel(tgt)}`
      } else {
        centsValue = f.smoothedFreq != null ? shown.cents : f.note!.cents
        note.textContent = `${shown.name}${shown.octave}`
        sub.textContent = 'afinador'
      }

      wrap.dataset.state = centsZone(centsValue)
      // noteState (opcional) dá o toque de ataque/sustentação — sem ele fica 'sustain'.
      wrap.dataset.note = f.noteState ?? 'sustain'
      cents.textContent = `${centsValue > 0 ? '+' : ''}${centsValue}¢`
      const clamped = Math.max(-50, Math.min(50, centsValue))
      needle.style.left = `${clamped + 50}%`

      // dynamics (0..1) → energia visual (brilho/escala). Fallback: proxy do RMS.
      const dyn = f.dynamics ?? Math.min(1, f.rms * 9)
      needle.style.setProperty('--dyn', dyn.toFixed(3))

      // steadiness (0..1) → arco de firmeza; sem o sinal, arco fica neutro.
      if (steady) steady.style.setProperty('--steady', (f.steadiness ?? 0).toFixed(3))

      // TRAVA DE AFINADOR: celebra afinado+sustentado. Intensidade cresce com lockMs.
      if (lock) {
        if (f.locked) {
          lock.dataset.on = '1'
          wrap.dataset.locked = '1'
          // 0..1 conforme a trava amadurece (satura em ~1.2s).
          const grip = Math.min(1, (f.lockMs ?? 0) / 1200)
          lock.style.setProperty('--grip', grip.toFixed(3))
        } else {
          lock.dataset.on = '0'
          wrap.dataset.locked = '0'
          lock.style.setProperty('--grip', '0')
        }
      }
    })
    return unsub
  }, [engine])

  return (
    <div className="display display--live" ref={wrapRef} data-state="silent" data-note="silent" data-locked="0">
      {/* arco de firmeza (steadiness) atrás da nota */}
      <div className="steady-ring" ref={steadyRef} style={{ ['--steady' as string]: 0 }} />
      <div className="display-note" ref={noteRef}>
        —
      </div>
      {/* anel + micro-rótulo da trava de afinador */}
      <div className="lock-badge" ref={lockRef} data-on="0" style={{ ['--grip' as string]: 0 }}>
        <span className="lock-ring" />
        <span className="lock-label">na mira 🎯</span>
      </div>
      <div className="display-sub" ref={subRef}>
        cante uma nota
      </div>
      <div className="cents-track">
        <span className="cents-tick cents-tick--left">-50</span>
        <span className="cents-center" />
        <span className="cents-tick cents-tick--right">+50</span>
        <div className="cents-needle" ref={needleRef} style={{ left: '50%', ['--dyn' as string]: 0 }} />
      </div>
      <div className="display-cents" ref={centsRef} />
    </div>
  )
}
