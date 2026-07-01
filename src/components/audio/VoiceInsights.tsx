import { useEffect, useRef } from 'react'
import { PitchEngine, PitchFrame } from '../../audio/PitchEngine'
import { RegisterZone } from '../../audio/register'
import { analyzeVibratoFromF0 } from '../../audio/vibrato'

// Painel de diagnóstico ao vivo: zona de registro estimada (peito/mix/cabeça/
// falsete), alerta de quebra, e vibrato em tempo real (janela rolante). É o
// "moat" ficando visível. Rótulo "estimado" — honestidade: registro é inferência.
//
// O vibrato agora ganha uma MINI-ONDA SVG que oscila na taxa detectada, além do
// "5.2 Hz" textual: a onda anima seu ciclo pela duração real do período (1/rateHz),
// então você VÊ a velocidade do vibrato, não só lê.
const ZONES: { key: RegisterZone; label: string; color: string }[] = [
  { key: 'peito', label: 'Peito', color: '#e9b44c' },
  { key: 'mix', label: 'Mix', color: '#57d6a6' },
  { key: 'cabeça', label: 'Cabeça', color: '#7fb2ff' },
  { key: 'falsete', label: 'Falsete', color: '#c48bff' },
]
const WINDOW_MS = 1300

export function VoiceInsights({ engine }: { engine: PitchEngine }) {
  const zoneRefs = useRef<Partial<Record<RegisterZone, HTMLDivElement>>>({})
  const flashRef = useRef<HTMLDivElement>(null)
  const vibRef = useRef<HTMLDivElement>(null)
  const vibValRef = useRef<HTMLSpanElement>(null)
  const waveRef = useRef<SVGElement>(null) // <svg> da mini-onda de vibrato
  const buf = useRef<{ t: number; f0: number }[]>([])
  const nFrames = useRef(0)

  useEffect(() => {
    return engine.subscribe((f: PitchFrame) => {
      const voiced = f.freq != null
      const reg = f.register

      for (const z of ZONES) {
        const el = zoneRefs.current[z.key]
        if (!el) continue
        const active = voiced && reg?.zone === z.key
        el.dataset.active = active ? '1' : '0'
        el.style.opacity = active ? '1' : voiced ? '0.42' : '0.22'
      }

      if (reg?.event === 'quebra' && flashRef.current) {
        const el = flashRef.current as HTMLDivElement & { _t?: number }
        el.dataset.on = '1'
        window.clearTimeout(el._t)
        el._t = window.setTimeout(() => (el.dataset.on = '0'), 1000)
      }

      // vibrato ao vivo (janela rolante)
      const now = performance.now()
      if (voiced && f.freq) buf.current.push({ t: now, f0: f.freq })
      else buf.current.length = 0
      while (buf.current.length && now - buf.current[0].t > WINDOW_MS) buf.current.shift()

      nFrames.current++
      if (nFrames.current % 6 === 0 && vibRef.current && vibValRef.current) {
        let txt = ''
        let rate = 0
        const b = buf.current
        if (b.length > 24) {
          const fps = (b.length - 1) / ((b[b.length - 1].t - b[0].t) / 1000)
          const v = analyzeVibratoFromF0(
            b.map((x) => x.f0),
            fps,
          )
          if (v.present) {
            txt = `${v.rateHz} Hz`
            rate = v.rateHz
          }
        }
        vibRef.current.dataset.on = txt ? '1' : '0'
        vibValRef.current.textContent = txt || '—'
        // Casa a animação da onda com a taxa detectada: um ciclo = 1/rateHz.
        if (waveRef.current) {
          if (rate > 0) {
            waveRef.current.style.setProperty('--vib-dur', `${(1 / rate).toFixed(3)}s`)
          }
        }
      }
    })
  }, [engine])

  return (
    <div className="insights">
      <div className="reg-head">
        <span className="reg-title">
          Registro <em>estimado</em>
        </span>
        <div className="vib" ref={vibRef} data-on="0">
          {/* mini-onda: oscila na taxa do vibrato (var --vib-dur) */}
          <svg
            className="vib-wave"
            ref={waveRef as React.RefObject<SVGSVGElement>}
            viewBox="0 0 48 20"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ ['--vib-dur' as string]: '0.18s' }}
          >
            <path className="vib-wave-path" d="M0 10 Q 6 2 12 10 T 24 10 T 36 10 T 48 10" fill="none" />
          </svg>
          <span className="vib-val mono" ref={vibValRef}>
            —
          </span>
          <span className="vib-lbl">vibrato</span>
        </div>
      </div>
      <div className="reg-zones">
        {ZONES.map((z) => (
          <div
            key={z.key}
            className="reg-zone"
            ref={(el) => {
              if (el) zoneRefs.current[z.key] = el
            }}
            data-active="0"
            style={{ ['--zc']: z.color } as React.CSSProperties}
          >
            {z.label}
          </div>
        ))}
      </div>
      <div className="reg-flash" ref={flashRef} data-on="0">
        ⚡ quebra de registro detectada
      </div>
    </div>
  )
}
