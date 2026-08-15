// Estatística mínima compartilhada pelo domínio do karaokê.
//
// Existe para haver UMA mediana no projeto. Ela aparece em três contextos que não se
// conhecem — segmentação de notas, perfil de exigência e calibração de latência — e
// em todos pelo mesmo motivo: os dados têm outlier (glitch de oitava do detector,
// clique não detectado, nota fora da frase) e média deixaria o outlier arrastar o
// resultado. Duplicar a função convidaria as três cópias a divergirem em silêncio.

/** Mediana de um vetor. Não muta a entrada; devolve NaN para vetor vazio. */
export function median(xs: number[]): number {
  if (xs.length === 0) return NaN
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
