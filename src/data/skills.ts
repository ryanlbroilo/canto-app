import { Skill, SkillId } from './types'

// As 7 competências vocais que a plataforma treina e mede.
// Cada skill acumula XP das sessões cujos exercícios a desenvolvem (ver xp.ts).
// Paleta do estúdio noturno: dourado #e9b44c, menta #57d6a6, azul #7fb2ff,
// roxo #c48bff, coral #f26d5b, âmbar #f0b94a — cores distintas por skill.
export const SKILLS: Skill[] = [
  {
    id: 'afinacao',
    name: 'Afinação',
    icon: 'target',
    color: '#e9b44c',
    short: 'Acertar a nota no centro, com desvio mínimo em cents.',
  },
  {
    id: 'respiracao',
    name: 'Respiração',
    icon: 'lungs',
    color: '#57d6a6',
    short: 'Apoio e controle de ar — a base que ancora tudo.',
  },
  {
    id: 'passaggio',
    name: 'Passaggio',
    icon: 'bridge',
    color: '#7fb2ff',
    short: 'Cruzar a zona de passagem sem quebra entre registros.',
  },
  {
    id: 'vibrato',
    name: 'Vibrato',
    icon: 'wave',
    color: '#c48bff',
    short: 'Oscilação livre e regular do tom (o saudável fica em 5–7 Hz).',
  },
  {
    id: 'sustentacao',
    name: 'Sustentação',
    icon: 'music',
    color: '#f26d5b',
    short: 'Segurar a nota longa, estável e no centro.',
  },
  {
    id: 'ressonancia',
    name: 'Ressonância',
    icon: 'spark',
    color: '#f0b94a',
    short: 'Projeção e brilho — o som que preenche o espaço.',
  },
  {
    id: 'extensao',
    name: 'Extensão',
    icon: 'gauge',
    color: '#57d6a6',
    short: 'Ampliar o range com segurança, ganhando notas nas pontas.',
  },
]

export const SKILL_BY_ID: Record<SkillId, Skill> = SKILLS.reduce(
  (acc, s) => {
    acc[s.id] = s
    return acc
  },
  {} as Record<SkillId, Skill>,
)
