import { LearningTrack, TrackLevel } from './types'
import { curatedTrackIds } from './exercises'

// Trilhas de aprendizado: o "caminho" curado de cada nível, seguindo o arco
// aquecimento → técnica → aplicação (estilo Duolingo). Os ids são DERIVADOS da
// biblioteca completa (exercises.ts → curatedTrackIds), então a trilha continua
// enxuta mesmo com ~300 exercícios no catálogo. O roteador adaptativo
// (adaptive.ts) usa nextInTrack para sugerir o próximo passo.
const META: { id: string; level: TrackLevel; name: string; hint: string }[] = [
  {
    id: 'trilha-iniciante',
    level: 'iniciante',
    name: 'Primeiros sons',
    hint: 'Respirar, achar a nota e segurar. A fundação de tudo.',
  },
  {
    id: 'trilha-intermediario',
    level: 'intermediario',
    name: 'Ganhando controle',
    hint: 'Saltos precisos, notas longas e o passaggio começando a alisar.',
  },
  {
    id: 'trilha-avancado',
    level: 'avancado',
    name: 'Domínio expressivo',
    hint: 'Agilidade, dinâmica extrema e o range inteiro conectado.',
  },
]

export const TRACKS: LearningTrack[] = META.map((m) => ({
  ...m,
  exerciseIds: curatedTrackIds(m.level),
}))

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
