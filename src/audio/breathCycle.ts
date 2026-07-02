// Ciclo de respiração 4-4-6 (inspira 4s / segura 4s / solta 6s), com easing em
// seno (natural). Compartilhado entre o rótulo (HTML) e a cena 3D, ambos derivam
// do MESMO tempo de início → ficam em sincronia sem clock duplicado divergir.

export const BREATH_CYCLE = [
  { key: 'inspire', name: 'Inspire', dur: 4 },
  { key: 'hold', name: 'Segure', dur: 4 },
  { key: 'exhale', name: 'Solte', dur: 6 },
] as const

export const BREATH_CYCLE_LEN = BREATH_CYCLE.reduce((a, c) => a + c.dur, 0) // 14s

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2

export interface BreathState {
  /** 0 (expirado) .. 1 (inspirado no ápice) */
  breath: number
  key: string
  name: string
  /** segundos restantes na fase atual (arredondado p/ cima) */
  remain: number
}

/** Estado de respiração para um dado tempo decorrido (segundos). */
export function breathAt(elapsedSec: number): BreathState {
  const inCycle = ((elapsedSec % BREATH_CYCLE_LEN) + BREATH_CYCLE_LEN) % BREATH_CYCLE_LEN
  let acc = 0
  for (const c of BREATH_CYCLE) {
    if (inCycle < acc + c.dur) {
      const p = (inCycle - acc) / c.dur
      const breath = c.key === 'inspire' ? easeInOutSine(p) : c.key === 'hold' ? 1 : 1 - easeInOutSine(p)
      return { breath, key: c.key, name: c.name, remain: Math.ceil(acc + c.dur - inCycle) }
    }
    acc += c.dur
  }
  return { breath: 0, key: 'exhale', name: 'Solte', remain: 0 }
}
