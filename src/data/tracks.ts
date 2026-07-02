import { LearningTrack, TrackLevel } from './types'
import { levelExerciseIds } from './curriculum'

// Trilhas de aprendizado (uma por nível/"seção"). O caminho de cada nível é o
// CURRÍCULO completo por unidades (curriculum.ts): dezenas de unidades temáticas
// cobrindo os ~300 exercícios — não mais uma espinha curta. `exerciseIds` é o
// path plano ordenado (usado pelo roteador adaptativo nextInTrack).
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
  exerciseIds: levelExerciseIds(m.level),
}))

export const trackForLevel = (level: TrackLevel): LearningTrack =>
  TRACKS.find((t) => t.level === level) ?? TRACKS[0]

/**
 * Primeiro exercício da trilha do nível que ainda não foi "dominado".
 * completedIds = ids que o cantor já dominou (ex.: bestScore ≥ 90).
 * Retorna null se todo o caminho do nível já foi dominado.
 */
export function nextInTrack(level: TrackLevel, completedIds: Set<string>): string | null {
  const track = trackForLevel(level)
  for (const id of track.exerciseIds) {
    if (!completedIds.has(id)) return id
  }
  return null
}
