// TONE PLAYER — drone de referência para o treinador de harmonia. É a ÚNICA
// parte do app que produz som (a PitchEngine só escuta; sua saída é muda). Usa
// um AudioContext PRÓPRIO, independente da captura de microfone — os dois
// coexistem sem problema (osciladores comuns não exigem cross-origin isolation,
// isso é só para SharedArrayBuffer/AudioWorklet).
//
// Timbre suave (triangular + passa-baixa) e nível baixo de propósito: (1) é
// agradável de sustentar contra, (2) minimiza o vazamento pelo alto-falante ser
// captado como se fosse a voz do cantor. Ainda assim, recomendamos fones.

import { midiToFreq } from './notes'

interface PlayOpts {
  /** nível 0..1 do acorde inteiro (default 0.14 — baixo de propósito) */
  level?: number
  /** ataque suave em segundos (default 0.25) */
  attack?: number
}

export class TonePlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private voices: OscillatorNode[] = []

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.filter = this.ctx.createBiquadFilter()
      this.filter.type = 'lowpass'
      this.filter.frequency.value = 1800 // corta o brilho áspero, deixa um "órgão" macio
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.filter.connect(this.master)
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  /** Deve ser chamado a partir de um gesto do usuário (política de autoplay). */
  async resume(): Promise<void> {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
  }

  /** Toca um acorde sustentado (uma ou mais notas MIDI). Substitui o acorde atual. */
  playChord(midis: number[], opts: PlayOpts = {}): void {
    const ctx = this.ensure()
    const master = this.master!
    const level = opts.level ?? 0.14
    const attack = opts.attack ?? 0.25
    this.stopVoices()
    const now = ctx.currentTime
    for (const m of midis) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = midiToFreq(m)
      osc.connect(this.filter!)
      osc.start()
      this.voices.push(osc)
    }
    // envelope de ataque suave no master (evita clique)
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now)
    master.gain.linearRampToValueAtTime(level, now + attack)
  }

  playNote(midi: number, opts: PlayOpts = {}): void {
    this.playChord([midi], opts)
  }

  /** Silencia com release suave e para os osciladores. */
  stop(release = 0.2): void {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + release)
    const voices = this.voices
    this.voices = []
    for (const v of voices) {
      try {
        v.stop(now + release + 0.02)
      } catch {
        /* já parado */
      }
    }
  }

  private stopVoices(): void {
    for (const v of this.voices) {
      try {
        v.stop()
      } catch {
        /* noop */
      }
    }
    this.voices = []
  }

  /** Libera o AudioContext (chamar ao desmontar a tela). */
  dispose(): void {
    this.stopVoices()
    try {
      void this.ctx?.close()
    } catch {
      /* noop */
    }
    this.ctx = null
    this.master = null
    this.filter = null
  }
}
