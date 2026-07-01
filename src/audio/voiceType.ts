// Estimativa APROXIMADA de tipo vocal a partir da extensão medida.
// Ressalva científica (ver fundamentação): classificação vocal real depende de
// tessitura + timbre + passaggio, não só dos extremos. Isto é um chute inicial
// útil para o onboarding, sempre rotulado como "aproximado".

/** Estima o tipo vocal pela nota mais grave (proxy simples). */
export function estimateVoiceType(lowMidi: number, _highMidi: number): string {
  if (lowMidi <= 40) return 'Baixo' // E2 e abaixo
  if (lowMidi <= 45) return 'Barítono' // F2–A2
  if (lowMidi <= 49) return 'Tenor' // A#2–C#3
  if (lowMidi <= 54) return 'Contralto' // D3–F#3
  if (lowMidi <= 58) return 'Mezzo-soprano' // G3–A#3
  return 'Soprano' // B3+
}
