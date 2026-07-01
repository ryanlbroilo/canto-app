import { Exercise } from './types'

// Biblioteca de exercícios em fases progressivas (PRD §5.1.3).
// pattern = offsets em semitons a partir da tônica (transposta pro range do usuário).
export const EXERCISES: Exercise[] = [
  // ---------- Aquecimento ----------
  {
    id: 'respiracao',
    name: 'Respiração diafragmática',
    phase: 'aquecimento',
    focus: 'Apoio e controle de ar',
    durationMin: 2,
    kind: 'breathing',
    description:
      'Inspire pelo diafragma, segure e solte de forma controlada. Base de todo o resto — respiração ancora a afinação e a sustentação.',
  },
  {
    id: 'sirene',
    name: 'Sirene / lip trill',
    phase: 'aquecimento',
    focus: 'Conectar registros (SOVT)',
    durationMin: 3,
    kind: 'siren',
    description:
      'Deslize suave do grave ao agudo e volte, em lip trill ou "ng". Exercício semi-ocluído (Titze) que aquece e suaviza a passagem entre registros.',
  },
  {
    id: 'humming',
    name: 'Humming em 5 notas',
    phase: 'aquecimento',
    focus: 'Ressonância e afinação',
    durationMin: 3,
    kind: 'scale',
    pattern: [0, 2, 4, 2, 0],
    holdSec: 1.6,
    description: 'Cantarole (mmm) uma escala de 5 notas subindo e descendo. Foco em manter cada nota estável e no centro.',
  },
  // ---------- Técnica ----------
  {
    id: 'escala-maior',
    name: 'Escala maior (do-ré-mi)',
    phase: 'tecnica',
    focus: 'Precisão de afinação',
    durationMin: 4,
    kind: 'scale',
    pattern: [0, 2, 4, 5, 7, 5, 4, 2, 0],
    holdSec: 1.3,
    description: 'A escala clássica subindo e descendo. Acerte cada grau dentro da zona verde e sustente no centro.',
  },
  {
    id: 'arpejo',
    name: 'Arpejo (1-3-5-8)',
    phase: 'tecnica',
    focus: 'Saltos e agilidade',
    durationMin: 4,
    kind: 'interval',
    pattern: [0, 4, 7, 12, 7, 4, 0],
    holdSec: 1.2,
    description: 'Saltos de terça, quinta e oitava. Treina precisão nos intervalos maiores, onde é fácil "escorregar".',
  },
  {
    id: 'sustentacao',
    name: 'Sustentação (messa di voce)',
    phase: 'tecnica',
    focus: 'Estabilidade e controle',
    durationMin: 3,
    kind: 'sustain',
    pattern: [0],
    holdSec: 8,
    description: 'Sustente uma nota longa, estável e no centro. Cresça e diminua o volume sem desafinar.',
  },
  {
    id: 'transicao',
    name: 'Transição de registro',
    phase: 'tecnica',
    focus: 'Passaggio suave',
    durationMin: 4,
    kind: 'siren',
    description:
      'Sirenes largas cruzando a sua zona de passagem. Objetivo: atravessar sem "quebra", conectando peito e cabeça.',
  },
  // ---------- Aplicação ----------
  {
    id: 'frase-melodica',
    name: 'Frase melódica',
    phase: 'aplicacao',
    focus: 'Aplicar em música',
    durationMin: 5,
    kind: 'scale',
    pattern: [0, 2, 4, 7, 4, 5, 2, 0],
    holdSec: 1.1,
    description: 'Uma pequena frase para aplicar o que treinou em contexto melódico, no caminho para cantar músicas.',
  },
]

export const PHASES: { key: Exercise['phase']; label: string; hint: string }[] = [
  { key: 'aquecimento', label: 'Aquecimento', hint: 'Sempre comece por aqui — canto não dói.' },
  { key: 'tecnica', label: 'Técnica', hint: 'Precisão, saltos, estabilidade e passaggio.' },
  { key: 'aplicacao', label: 'Aplicação', hint: 'Levar a técnica para a música.' },
]

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id)
