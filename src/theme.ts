// Cores por precisão de afinação (usadas nos canvas, onde não dá para ler CSS vars).
// Devem espelhar os tokens em styles/tokens.css.
export const COLORS = {
  good: '#57d6a6', // no tom (≤10¢)
  close: '#f0b94a', // perto (≤25¢)
  off: '#f26d5b', // fora
  dim: '#726750', // neutro
  gold: '#e9b44c',
} as const

export function centsZone(cents: number): 'good' | 'close' | 'off' {
  const a = Math.abs(cents)
  return a <= 10 ? 'good' : a <= 25 ? 'close' : 'off'
}

export function centsColor(cents: number): string {
  return COLORS[centsZone(cents)]
}
