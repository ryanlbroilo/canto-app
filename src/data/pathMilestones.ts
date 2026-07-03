// MARCOS DO CAMINHO — o que faz o Canto passar do Duolingo: o caminho não é só
// drills, ele DESEMBOCA em música de verdade. Entre as unidades, marcos de
// recompensa levam a cantar uma música (S6) ou achar sua voz na harmonia (S4).
// "Respire → ache a nota → cante um louvor de verdade."
//
// Curadoria (não automático): cada marco é casado à dificuldade do ponto do
// caminho — nada de pedir música difícil a um iniciante. ref = songId (kind
// 'song') ou id do drill de harmonia (kind 'harmony').

import { TrackLevel } from './types'

export type MilestoneKind = 'song' | 'harmony'

export interface PathMilestone {
  id: string
  level: TrackLevel
  /** aparece no caminho DEPOIS da unidade com este índice (1-based) */
  afterUnitIndex: number
  kind: MilestoneKind
  /** songId (music) ou id do drill de harmonia */
  ref: string
  title: string
  blurb: string
}

export const PATH_MILESTONES: PathMilestone[] = [
  // ---- Iniciante (respirar, achar a nota, segurar) ----
  {
    id: 'ini-harm-unison',
    level: 'iniciante',
    afterUnitIndex: 4,
    kind: 'harmony',
    ref: 'unison',
    title: 'Ache sua nota',
    blurb: 'Primeira harmonia: cante a MESMA nota de uma referência e sinta o unísono travar.',
  },
  {
    id: 'ini-song-escada',
    level: 'iniciante',
    afterUnitIndex: 9,
    kind: 'song',
    ref: 'escada-louvor',
    title: 'Sua primeira música',
    blurb: 'Você já respira e afina — hora de cantar uma melodia inteira, nota a nota.',
  },
  {
    id: 'ini-song-coracao',
    level: 'iniciante',
    afterUnitIndex: 16,
    kind: 'song',
    ref: 'coracao-grato',
    title: 'Louvor de fim de nível',
    blurb: 'Fechou o nível iniciante: cante "Coração Grato" e comemore o quanto sua voz cresceu.',
  },

  // ---- Intermediário (saltos, notas longas, passaggio) ----
  {
    id: 'int-harm-fifth',
    level: 'intermediario',
    afterUnitIndex: 6,
    kind: 'harmony',
    ref: 'fifth-up',
    title: 'Sua segunda voz',
    blurb: 'A quinta acima — o intervalo mais estável do louvor. Cante por cima da referência.',
  },
  {
    id: 'int-song-alegria',
    level: 'intermediario',
    afterUnitIndex: 14,
    kind: 'song',
    ref: 'alegria',
    title: 'Um clássico de verdade',
    blurb: 'Cante "Alegria" (Ode à Alegria) — melodia que o mundo inteiro conhece, na sua voz.',
  },
  {
    id: 'int-harm-third',
    level: 'intermediario',
    afterUnitIndex: 25,
    kind: 'harmony',
    ref: 'third-maj',
    title: 'A cor do louvor',
    blurb: 'A terça maior — a voz 2 que dá brilho ao acorde. Fecha o nível intermediário.',
  },

  // ---- Avançado (agilidade, dinâmica, range inteiro) ----
  {
    id: 'adv-song-tuagraca',
    level: 'avancado',
    afterUnitIndex: 5,
    kind: 'song',
    ref: 'tua-graca',
    title: 'Range inteiro na música',
    blurb: 'Cante "Tua Graça" — uma melodia que abre a extensão que você conquistou.',
  },
  {
    id: 'adv-harm-triad',
    level: 'avancado',
    afterUnitIndex: 10,
    kind: 'harmony',
    ref: 'third-over-fifth',
    title: 'Complete o acorde',
    blurb: 'Entre na terça sobre tônica e quinta e sustente o acorde maior inteiro.',
  },
  {
    id: 'adv-harm-bass',
    level: 'avancado',
    afterUnitIndex: 16,
    kind: 'harmony',
    ref: 'bass-root',
    title: 'A fundação',
    blurb: 'O baixo — a base grave do acorde. O último marco: você segura a harmonia por baixo.',
  },
]

export const milestonesAfter = (level: TrackLevel, unitIndex: number): PathMilestone[] =>
  PATH_MILESTONES.filter((m) => m.level === level && m.afterUnitIndex === unitIndex)

/** Destino de navegação de um marco. */
export const milestoneHref = (m: PathMilestone): string =>
  m.kind === 'song' ? `/musicas/${m.ref}` : `/harmonia?ex=${encodeURIComponent(m.ref)}`
