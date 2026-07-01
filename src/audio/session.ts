// Agregador de sessão — transforma a timeline de PitchFrames no feature-JSON
// (contrato DSP→EVA, PRD §4.2). Roda na main thread conforme os frames chegam.
//
// Calcula: desvio médio de cents, % de acerto, estabilidade (jitter/shimmer/clarity
// como proxies frame-a-frame), vibrato (rate/extent via autocorrelação da curva de
// cents), tempo em cada registro, e eventos de quebra. Tudo em números — a EVA
// nunca vê áudio.

import { PitchFrame } from './PitchEngine'
import { freqToMidiFloat } from './notes'
import { analyzeVibratoFromF0 } from './vibrato'
import { FeatureEvent, FeatureReport } from '../data/types'

interface Sample {
  t: number
  f0: number
  cents: number
  rms: number
  clarity: number
  zone: string | null
  note: string
}

const HIT_TOLERANCE = 35 // cents
const GAP_MS = 60 // pares além disto são considerados descontínuos (não contam p/ jitter)

export class SessionAggregator {
  private startT = 0
  private samples: Sample[] = []
  private allFrames = 0
  private voicedFrames = 0
  private events: FeatureEvent[] = []
  private lastZone: string | null = null
  private exercise?: { type: string; targetNotes?: string[] }

  start(exercise?: { type: string; targetNotes?: string[] }) {
    this.startT = performance.now()
    this.samples = []
    this.allFrames = 0
    this.voicedFrames = 0
    this.events = []
    this.lastZone = null
    this.exercise = exercise
  }

  /** tSec explícito é opcional (usado em testes); senão usa o relógio interno. */
  push(f: PitchFrame, targetMidi?: number, tSecOverride?: number) {
    this.allFrames++
    const t = tSecOverride ?? (performance.now() - this.startT) / 1000
    if (f.freq != null && f.note) {
      this.voicedFrames++
      const cents = targetMidi != null ? Math.round((freqToMidiFloat(f.freq) - targetMidi) * 100) : f.note.cents
      const zone = f.register?.zone ?? null
      const note = `${f.note.name}${f.note.octave}`
      this.samples.push({ t, f0: f.freq, cents, rms: f.rms, clarity: f.clarity, zone, note })
      if (f.register?.event === 'quebra') {
        this.events.push({ t, type: 'register_break', from: this.lastZone ?? undefined, to: zone ?? undefined, note })
      }
      if (zone) this.lastZone = zone
    }
  }

  get frameCount() {
    return this.allFrames
  }
  get voicedCount() {
    return this.voicedFrames
  }

  finalize(sessionId: string): FeatureReport {
    const s = this.samples
    const durationSec = Math.max((performance.now() - this.startT) / 1000, s.length ? s[s.length - 1].t : 0)
    const voicedPct = this.allFrames > 0 ? (this.voicedFrames / this.allFrames) * 100 : 0

    // desvio médio + % acerto
    let absSum = 0
    let hits = 0
    for (const x of s) {
      absSum += Math.abs(x.cents)
      if (Math.abs(x.cents) <= HIT_TOLERANCE) hits++
    }
    const avgCentsDeviation = s.length ? absSum / s.length : 0
    const notesHitPct = s.length ? (hits / s.length) * 100 : 0

    // estabilidade (proxies frame-a-frame em pares temporalmente próximos)
    let jSum = 0
    let jN = 0
    let shSum = 0
    let shN = 0
    let clSum = 0
    for (let i = 0; i < s.length; i++) {
      clSum += s[i].clarity
      if (i > 0) {
        const dtMs = (s[i].t - s[i - 1].t) * 1000
        if (dtMs > 0 && dtMs < GAP_MS) {
          if (s[i - 1].f0 > 0) {
            jSum += Math.abs(s[i].f0 - s[i - 1].f0) / s[i - 1].f0
            jN++
          }
          if (s[i - 1].rms > 1e-6) {
            shSum += Math.abs(s[i].rms - s[i - 1].rms) / s[i - 1].rms
            shN++
          }
        }
      }
    }
    const stability = {
      jitter: jN ? +(jSum / jN).toFixed(4) : 0,
      shimmer: shN ? +(shSum / shN).toFixed(4) : 0,
      clarity: s.length ? +(clSum / s.length).toFixed(3) : 0,
    }

    // vibrato (na maior sequência contígua)
    const vibrato = this.detectVibrato()

    // tempo em cada registro
    const counts: Record<string, number> = { peito: 0, mix: 0, cabeça: 0, falsete: 0 }
    let zoned = 0
    for (const x of s) {
      if (x.zone && counts[x.zone] !== undefined) {
        counts[x.zone]++
        zoned++
      }
    }
    const pct = (c: number) => (zoned ? +((c / zoned) * 100).toFixed(1) : 0)
    const registerTime = {
      peito: pct(counts['peito']),
      mix: pct(counts['mix']),
      cabeca: pct(counts['cabeça']),
      falsete: pct(counts['falsete']),
    }

    // timeline downsampled (~1 ponto/100ms, teto de 160)
    const pitchTimeline = this.downsampleTimeline(160, 0.1)

    return {
      sessionId,
      durationSec: +durationSec.toFixed(1),
      exercise: this.exercise,
      performance: {
        pitchTimeline,
        avgCentsDeviation: +avgCentsDeviation.toFixed(1),
        notesHitPct: +notesHitPct.toFixed(1),
        voicedPct: +voicedPct.toFixed(1),
        stability,
        vibrato,
        events: this.events,
        registerTime,
      },
    }
  }

  private downsampleTimeline(maxPoints: number, minDtSec: number) {
    const out: { t: number; note: string; centsOff: number }[] = []
    let lastT = -Infinity
    for (const x of this.samples) {
      if (x.t - lastT >= minDtSec) {
        out.push({ t: +x.t.toFixed(2), note: x.note, centsOff: x.cents })
        lastT = x.t
      }
    }
    if (out.length > maxPoints) {
      const step = out.length / maxPoints
      const thinned: typeof out = []
      for (let i = 0; i < maxPoints; i++) thinned.push(out[Math.floor(i * step)])
      return thinned
    }
    return out
  }

  private detectVibrato(): { present: boolean; rateHz: number; extentCents: number } {
    // maior sequência contígua (dt < GAP)
    let bestStart = 0
    let bestLen = 0
    let curStart = 0
    for (let i = 1; i <= this.samples.length; i++) {
      const cont = i < this.samples.length && (this.samples[i].t - this.samples[i - 1].t) * 1000 < GAP_MS
      if (!cont) {
        const len = i - curStart
        if (len > bestLen) {
          bestLen = len
          bestStart = curStart
        }
        curStart = i
      }
    }
    const run = this.samples.slice(bestStart, bestStart + bestLen)
    if (run.length < 20) return { present: false, rateHz: 0, extentCents: 0 }
    const fps = (run.length - 1) / (run[run.length - 1].t - run[0].t)
    return analyzeVibratoFromF0(
      run.map((r) => r.f0),
      fps,
    )
  }
}
