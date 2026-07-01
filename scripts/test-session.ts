// Teste do agregador de sessão (feature-JSON) com frames sintéticos.
import { SessionAggregator } from '../src/audio/session'
import { freqToNote } from '../src/audio/notes'

function frame(f0: number, rms: number, zone: string | null, event: 'quebra' | null): any {
  return {
    time: 0,
    freq: f0 > 0 ? f0 : null,
    note: f0 > 0 ? freqToNote(f0) : null,
    clarity: 0.95,
    rms,
    centroid: 400,
    tilt: -6,
    h1h2: 2,
    register: { zone, confidence: 0.8, event },
  }
}

const agg = new SessionAggregator()
agg.start({ type: 'sustain', targetNotes: ['A3'] })

const fps = 150
const dur = 2.0
const N = Math.floor(fps * dur)
const base = 220 // A3
for (let i = 0; i < N; i++) {
  const t = i / fps
  const cents = 30 * Math.sin(2 * Math.PI * 5.5 * t) // vibrato 5.5Hz, ±30¢
  let f0 = base * Math.pow(2, cents / 1200)
  f0 *= 1 + (Math.random() - 0.5) * 0.002 // jitter leve
  const rms = 0.1 * (1 + (Math.random() - 0.5) * 0.02) // shimmer leve
  const event = i === Math.floor(N / 2) ? 'quebra' : null
  const zone = t < dur / 2 ? 'peito' : 'cabeça'
  agg.push(frame(f0, rms, zone, event as 'quebra' | null), 57, t) // alvo A3 (midi 57)
}

const rep = agg.finalize('test-1')
const p = rep.performance
console.log('vibrato:      ', JSON.stringify(p.vibrato), '  [espera ~5.5Hz, ~30¢]')
console.log('stability:    ', JSON.stringify(p.stability))
console.log('registerTime: ', JSON.stringify(p.registerTime), '  [espera ~50/50 peito/cabeca]')
console.log('events:       ', p.events.length, JSON.stringify(p.events[0] || null))
console.log('avgCentsDev:  ', p.avgCentsDeviation, '· hit%:', p.notesHitPct, '· voiced%:', p.voicedPct)
console.log('timeline pts: ', p.pitchTimeline.length, '· duração:', rep.durationSec + 's')

const ok = p.vibrato.present && Math.abs(p.vibrato.rateHz - 5.5) < 1.2 && Math.abs(p.vibrato.extentCents - 30) < 10 && p.events.length === 1
console.log('\n' + (ok ? '✓ agregador OK' : '✗ verificar'))
