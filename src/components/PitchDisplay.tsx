import { useEffect, useRef } from 'react'
import { PitchEngine, PitchFrame } from '../audio/PitchEngine'
import { freqToMidiFloat, midiLabel } from '../audio/notes'
import { centsZone } from '../theme'

/**
 * Leitura grande: nota cantada + desvio em cents + agulha.
 * Atualiza o DOM imperativamente (refs) a cada frame para não re-renderizar o
 * React a 60fps. A cor/zona é comunicada via data-state (ver CSS).
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
      if (!wrap || !note || !sub || !cents || !needle) return

      if (f.freq == null || f.note == null) {
        wrap.dataset.state = 'silent'
        note.textContent = '—'
        sub.textContent = 'cante uma nota'
        cents.textContent = ''
        needle.style.left = '50%'
        return
      }

      const tgt = targetRef.current
      let centsValue: number
      if (tgt != null) {
        centsValue = Math.round((freqToMidiFloat(f.freq) - tgt) * 100)
        note.textContent = `${f.note.name}${f.note.octave}`
        sub.textContent = `alvo ${midiLabel(tgt)}`
      } else {
        centsValue = f.note.cents
        note.textContent = `${f.note.name}${f.note.octave}`
        sub.textContent = 'afinador'
      }

      wrap.dataset.state = centsZone(centsValue)
      cents.textContent = `${centsValue > 0 ? '+' : ''}${centsValue}¢`
      const clamped = Math.max(-50, Math.min(50, centsValue))
      needle.style.left = `${clamped + 50}%`
    })
    return unsub
  }, [engine])

  return (
    <div className="display" ref={wrapRef} data-state="silent">
      <div className="display-note" ref={noteRef}>
        —
      </div>
      <div className="display-sub" ref={subRef}>
        cante uma nota
      </div>
      <div className="cents-track">
        <span className="cents-tick cents-tick--left">-50</span>
        <span className="cents-center" />
        <span className="cents-tick cents-tick--right">+50</span>
        <div className="cents-needle" ref={needleRef} style={{ left: '50%' }} />
      </div>
      <div className="display-cents" ref={centsRef} />
    </div>
  )
}
