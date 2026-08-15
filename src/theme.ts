// Cores por precisão de afinação usadas nos CANVAS (onde não dá para ler CSS var
// por elemento). Fonte única de verdade: os tokens de styles/tokens.css.
// refreshCanvasColors() relê os valores computados do tema ativo — chamada no boot
// e a cada troca de tema (ver app/theme-mode.ts), então o canvas acompanha o tema.

export type CanvasColors = {
  good: string
  close: string
  off: string
  dim: string
  gold: string
}

const FALLBACK: CanvasColors = {
  good: '#1f8a76', // afinado (teal)
  close: '#d98a2a', // perto (âmbar)
  off: '#c4462c', // fora (ferrugem)
  dim: '#9a9182', // neutro
  gold: '#f2a83b', // marca
}

// Objeto mutável: consumidores leem COLORS.good etc. e refletem o tema após refresh.
export const COLORS: CanvasColors = { ...FALLBACK }

export function refreshCanvasColors(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const cs = getComputedStyle(document.documentElement)
  const read = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb
  COLORS.good = read('--good', FALLBACK.good)
  COLORS.close = read('--close', FALLBACK.close)
  COLORS.off = read('--off', FALLBACK.off)
  COLORS.dim = read('--faint', FALLBACK.dim)
  COLORS.gold = read('--gold', FALLBACK.gold)
}

export function centsZone(cents: number): 'good' | 'close' | 'off' {
  const a = Math.abs(cents)
  return a <= 10 ? 'good' : a <= 25 ? 'close' : 'off'
}

export function centsColor(cents: number): string {
  return COLORS[centsZone(cents)]
}
