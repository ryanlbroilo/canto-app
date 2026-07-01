// Estimativa APROXIMADA de tipo vocal a partir da extensão medida.
// Ressalva científica (ver fundamentação): classificação vocal real depende de
// tessitura + timbre + passaggio, não só dos extremos. Isto é um chute inicial
// útil para o onboarding, sempre rotulado como "aproximado".

/**
 * Faixa MIDI típica (extremos usuais) por classificação, para a banda de
 * referência do mapa de range. Valores clássicos aproximados (A2≈45 … C6≈84).
 */
export const VOICE_TYPE_RANGES: Record<string, { lowMidi: number; highMidi: number }> = {
  Baixo: { lowMidi: 40, highMidi: 60 }, // E2–C4
  Barítono: { lowMidi: 43, highMidi: 64 }, // G2–E4
  Tenor: { lowMidi: 48, highMidi: 69 }, // C3–A4
  Contralto: { lowMidi: 53, highMidi: 74 }, // F3–D5
  'Mezzo-soprano': { lowMidi: 57, highMidi: 79 }, // A3–G5
  Soprano: { lowMidi: 60, highMidi: 84 }, // C4–C6
}

/** Estima o tipo vocal pela nota mais grave (proxy simples — mantido p/ retrocompat). */
function typeFromLow(lowMidi: number): string {
  if (lowMidi <= 40) return 'Baixo' // E2 e abaixo
  if (lowMidi <= 45) return 'Barítono' // F2–A2
  if (lowMidi <= 49) return 'Tenor' // A#2–C#3
  if (lowMidi <= 54) return 'Contralto' // D3–F#3
  if (lowMidi <= 58) return 'Mezzo-soprano' // G3–A#3
  return 'Soprano' // B3+
}

/**
 * Estima o tipo vocal considerando grave E agudo (e tessitura confortável quando
 * disponível). O grave dá o "chão" (proxy principal, como antes); o centro da
 * tessitura/extensão desempata entre vizinhos — vozes com o mesmo grave mas topo
 * muito mais alto tendem à classificação mais aguda. Continua APROXIMADO.
 *
 * `tessituraLowMidi`/`tessituraHighMidi` são opcionais: se presentes, o centro
 * usado é o da zona confortável (mais fiel que os extremos absolutos).
 */
export function estimateVoiceType(
  lowMidi: number,
  highMidi: number,
  tessituraLowMidi?: number,
  tessituraHighMidi?: number,
): string {
  const base = typeFromLow(lowMidi)
  // Centro representativo: prioriza a tessitura confortável quando informada.
  const cLo = tessituraLowMidi ?? lowMidi
  const cHi = tessituraHighMidi ?? highMidi
  const center = (cLo + cHi) / 2

  // Centro típico de cada classe (ponto médio das faixas de referência).
  const order = ['Baixo', 'Barítono', 'Tenor', 'Contralto', 'Mezzo-soprano', 'Soprano']
  const centers: Record<string, number> = {}
  for (const t of order) {
    const r = VOICE_TYPE_RANGES[t]
    centers[t] = (r.lowMidi + r.highMidi) / 2
  }

  // A partir do candidato "pelo grave", só permitimos subir/descer UM degrau se o
  // centro real estiver claramente mais próximo do vizinho (>2 semitons de folga).
  // Assim highMidi/tessitura refinam sem sobrescrever o chão fisiológico do grave.
  const idx = order.indexOf(base)
  let best = base
  let bestDist = Math.abs(center - centers[base])
  for (const cand of [order[idx - 1], order[idx + 1]]) {
    if (!cand) continue
    const d = Math.abs(center - centers[cand])
    if (d + 2 < bestDist) {
      best = cand
      bestDist = d
    }
  }
  return best
}
