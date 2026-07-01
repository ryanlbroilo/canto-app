import { LearningTrack, TrackLevel } from './types'

// Trilhas de aprendizado: um currículo ORDENADO por nível, seguindo o arco
// aquecimento → técnica → aplicação dentro de cada nível (estilo Duolingo).
// O roteador adaptativo (adaptive.ts) usa nextInTrack para sugerir o próximo
// passo quando o cantor está indo bem.
export const TRACKS: LearningTrack[] = [
  {
    id: 'trilha-iniciante',
    level: 'iniciante',
    name: 'Primeiros sons',
    hint: 'Respirar, achar a nota e segurar. A fundação de tudo.',
    exerciseIds: [
      'respiracao',
      'sirene',
      'humming',
      'escala-3-notas',
      'sustain-curto',
      'frase-simples',
    ],
  },
  {
    id: 'trilha-intermediario',
    level: 'intermediario',
    name: 'Ganhando controle',
    hint: 'Saltos precisos, notas longas e o passaggio começando a alisar.',
    exerciseIds: [
      'sirene-oitava',
      'escala-maior',
      'quinta-justa',
      'arpejo',
      'oitava',
      'sustentacao',
      'transicao',
      'frase-melodica',
    ],
  },
  {
    id: 'trilha-avancado',
    level: 'avancado',
    name: 'Domínio expressivo',
    hint: 'Agilidade, dinâmica extrema e o range inteiro conectado.',
    exerciseIds: [
      'sirene-ampla',
      'arpejo-estendido',
      'agilidade-rapida',
      'staccato',
      'messa-di-voce-longa',
      'frase-avancada',
    ],
  },
]

export const trackForLevel = (level: TrackLevel): LearningTrack =>
  TRACKS.find((t) => t.level === level) ?? TRACKS[0]

/**
 * Primeiro exercício da trilha do nível que ainda não foi "dominado".
 * completedIds = ids que o cantor já dominou (ex.: bestScore ≥ 90).
 * Retorna null se toda a trilha do nível já foi dominada.
 */
export function nextInTrack(level: TrackLevel, completedIds: Set<string>): string | null {
  const track = trackForLevel(level)
  for (const id of track.exerciseIds) {
    if (!completedIds.has(id)) return id
  }
  return null
}
