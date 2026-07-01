import { Exercise, TrackLevel } from './types'

// Biblioteca de exercícios em fases progressivas (PRD §5.1.3), agora com
// nível de trilha, skills desenvolvidas e XP base para a camada de gamificação.
// pattern = offsets em semitons a partir da tônica (transposta pro range do usuário).
// XP base por nível: iniciante ~15, intermediario ~25, avancado ~40.
// kind fica restrito a 'breathing'|'siren'|'scale'|'interval'|'sustain' — o player
// só sabe renderizar esses.
export const EXERCISES: Exercise[] = [
  // ============================ INICIANTE ============================
  // ---------- Aquecimento ----------
  {
    id: 'respiracao',
    name: 'Respiração diafragmática',
    phase: 'aquecimento',
    focus: 'Apoio e controle de ar',
    durationMin: 2,
    kind: 'breathing',
    level: 'iniciante',
    skills: ['respiracao'],
    xp: 15,
    difficulty: 1,
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
    level: 'iniciante',
    skills: ['passaggio', 'extensao'],
    xp: 15,
    difficulty: 2,
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
    level: 'iniciante',
    skills: ['ressonancia', 'afinacao'],
    xp: 15,
    difficulty: 1,
    description:
      'Cantarole (mmm) uma escala de 5 notas subindo e descendo. O "mmm" fecha o trato vocal e amplifica a ressonância nasal — sinta a vibração nos lábios enquanto mantém cada nota no centro.',
  },
  // ---------- Técnica ----------
  {
    id: 'escala-3-notas',
    name: 'Escala de 3 notas',
    phase: 'tecnica',
    focus: 'Primeiros passos na afinação',
    durationMin: 3,
    kind: 'scale',
    pattern: [0, 2, 4, 2, 0],
    holdSec: 1.5,
    level: 'iniciante',
    skills: ['afinacao'],
    xp: 15,
    difficulty: 1,
    description:
      'Do-ré-mi e volta, devagar. A escala mais curta possível para você acertar o alvo sem pressa e sentir onde a nota "encaixa" na zona verde.',
  },
  {
    id: 'sustain-curto',
    name: 'Nota longa curta (4s)',
    phase: 'tecnica',
    focus: 'Introdução à estabilidade',
    durationMin: 2,
    kind: 'sustain',
    pattern: [0],
    holdSec: 4,
    level: 'iniciante',
    skills: ['sustentacao'],
    xp: 18,
    difficulty: 2,
    description:
      'Segure uma única nota confortável por 4 segundos, sem tremer nem cair. Comece o ar constante e observe a linha ficar reta — é o alicerce da messa di voce.',
  },
  // ---------- Aplicação ----------
  {
    id: 'frase-simples',
    name: 'Frase de 4 notas',
    phase: 'aplicacao',
    focus: 'Primeira melodia',
    durationMin: 3,
    kind: 'scale',
    pattern: [0, 2, 4, 0],
    holdSec: 1.3,
    level: 'iniciante',
    skills: ['afinacao', 'ressonancia'],
    xp: 18,
    difficulty: 2,
    description:
      'Uma frase curtinha para juntar afinação e som cheio numa mini-melodia. É o primeiro passo de sair dos exercícios secos rumo à música.',
  },

  // ========================== INTERMEDIÁRIO ==========================
  // ---------- Aquecimento ----------
  {
    id: 'sirene-oitava',
    name: 'Sirene de uma oitava',
    phase: 'aquecimento',
    focus: 'Aquecer o range com controle',
    durationMin: 3,
    kind: 'siren',
    level: 'intermediario',
    skills: ['passaggio', 'extensao'],
    xp: 22,
    difficulty: 3,
    description:
      'Sirene contínua cobrindo uma oitava inteira, ida e volta. Mais amplitude que a sirene básica: mantenha o fluxo de ar parelho ao cruzar a mudança de registro.',
  },
  // ---------- Técnica ----------
  {
    id: 'escala-maior',
    name: 'Escala maior (dó-ré-mi)',
    phase: 'tecnica',
    focus: 'Precisão de afinação',
    durationMin: 4,
    kind: 'scale',
    pattern: [0, 2, 4, 5, 7, 5, 4, 2, 0],
    holdSec: 1.3,
    level: 'intermediario',
    skills: ['afinacao'],
    xp: 25,
    difficulty: 3,
    description:
      'A escala clássica de cinco graus subindo e descendo. Acerte cada grau dentro da zona verde e sustente no centro — a régua da sua afinação.',
  },
  {
    id: 'quinta-justa',
    name: 'Salto de quinta justa',
    phase: 'tecnica',
    focus: 'Precisão em intervalos',
    durationMin: 3,
    kind: 'interval',
    pattern: [0, 7, 0, 7, 0],
    holdSec: 1.3,
    level: 'intermediario',
    skills: ['afinacao', 'extensao'],
    xp: 25,
    difficulty: 3,
    description:
      'Pule direto para a quinta e volte. O intervalo de quinta é onde o ouvido mais escorrega — treine chegar cravado no alvo sem tatear até a nota.',
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
    level: 'intermediario',
    skills: ['afinacao', 'extensao'],
    xp: 25,
    difficulty: 3,
    description:
      'Saltos de terça, quinta e oitava do acorde maior. Treina precisão nos intervalos grandes, onde é fácil "escorregar" ou chegar por baixo.',
  },
  {
    id: 'oitava',
    name: 'Salto de oitava',
    phase: 'tecnica',
    focus: 'Ampliar o range com precisão',
    durationMin: 3,
    kind: 'interval',
    pattern: [0, 12, 0, 12, 0],
    holdSec: 1.3,
    level: 'intermediario',
    skills: ['extensao', 'passaggio'],
    xp: 28,
    difficulty: 4,
    description:
      'A mesma nota uma oitava acima, ida e volta. Salto largo que costuma cruzar o passaggio: ajuste a ressonância no agudo em vez de "empurrar" com força.',
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
    level: 'intermediario',
    skills: ['sustentacao', 'vibrato'],
    xp: 28,
    difficulty: 4,
    description:
      'Sustente uma nota longa e estável e faça a messa di voce: cresça e diminua o volume sem desafinar. Perto do fim, deixe o vibrato aparecer natural.',
  },
  {
    id: 'transicao',
    name: 'Transição de registro',
    phase: 'tecnica',
    focus: 'Passaggio suave',
    durationMin: 4,
    kind: 'siren',
    level: 'intermediario',
    skills: ['passaggio'],
    xp: 28,
    difficulty: 4,
    description:
      'Sirenes largas cruzando a sua zona de passagem. Objetivo: atravessar sem "quebra", conectando peito e cabeça num fio só de som.',
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
    level: 'intermediario',
    skills: ['afinacao', 'ressonancia'],
    xp: 25,
    difficulty: 3,
    description:
      'Uma pequena frase para aplicar o que treinou em contexto melódico, no caminho para cantar músicas de verdade.',
  },

  // ============================ AVANÇADO ============================
  // ---------- Aquecimento ----------
  {
    id: 'sirene-ampla',
    name: 'Sirene ampla (range total)',
    phase: 'aquecimento',
    focus: 'Aquecer as pontas do range',
    durationMin: 4,
    kind: 'siren',
    level: 'avancado',
    skills: ['passaggio', 'extensao'],
    xp: 38,
    difficulty: 4,
    description:
      'Sirene do fundo do peito ao topo do falsete, sem cortes. Varre todo o seu range aquecendo as pontas e alisando cada transição num gesto só.',
  },
  // ---------- Técnica ----------
  {
    id: 'arpejo-estendido',
    name: 'Arpejo estendido (1-3-5-8-5-3-1)',
    phase: 'tecnica',
    focus: 'Saltos amplos e retorno',
    durationMin: 4,
    kind: 'interval',
    pattern: [0, 4, 7, 12, 7, 4, 0],
    holdSec: 0.9,
    level: 'avancado',
    skills: ['afinacao', 'extensao', 'passaggio'],
    xp: 40,
    difficulty: 5,
    description:
      'O arpejo completo, subindo à oitava e descendo pelo mesmo caminho, em ritmo mais ágil. Cada nota precisa cravar mesmo com pouco tempo de apoio.',
  },
  {
    id: 'agilidade-rapida',
    name: 'Agilidade rápida',
    phase: 'tecnica',
    focus: 'Coloratura e leveza',
    durationMin: 4,
    kind: 'scale',
    pattern: [0, 2, 4, 5, 7, 5, 4, 2, 0],
    holdSec: 0.5,
    level: 'avancado',
    skills: ['afinacao', 'respiracao'],
    xp: 40,
    difficulty: 5,
    description:
      'A escala em velocidade: cada nota dura meio segundo. Treina agilidade e leveza — o apoio segura o ar constante enquanto a laringe fica solta e rápida.',
  },
  {
    id: 'staccato',
    name: 'Staccato (arpejo destacado)',
    phase: 'tecnica',
    focus: 'Ataque limpo e apoio',
    durationMin: 3,
    kind: 'interval',
    pattern: [0, 4, 7, 12, 7, 4, 0],
    holdSec: 0.4,
    level: 'avancado',
    skills: ['respiracao', 'afinacao'],
    xp: 40,
    difficulty: 5,
    description:
      'Notas curtas e destacadas do arpejo, cada ataque nascendo limpo do apoio (não da garganta). Silêncio entre elas: pense em "ha-ha-ha" apoiado no diafragma.',
  },
  {
    id: 'messa-di-voce-longa',
    name: 'Messa di voce longa (12s)',
    phase: 'tecnica',
    focus: 'Controle dinâmico extremo',
    durationMin: 3,
    kind: 'sustain',
    pattern: [0],
    holdSec: 12,
    level: 'avancado',
    skills: ['sustentacao', 'vibrato', 'respiracao'],
    xp: 42,
    difficulty: 5,
    description:
      'A nota longa levada ao limite: 12 segundos crescendo do pianíssimo ao forte e voltando, com vibrato regular e afinação intocada. O teste supremo do apoio.',
  },
  // ---------- Aplicação ----------
  {
    id: 'frase-avancada',
    name: 'Frase avançada com dinâmica',
    phase: 'aplicacao',
    focus: 'Expressão e passaggio na música',
    durationMin: 5,
    kind: 'scale',
    pattern: [0, 4, 7, 12, 11, 9, 7, 5, 4, 0],
    holdSec: 1.0,
    level: 'avancado',
    skills: ['afinacao', 'ressonancia', 'passaggio'],
    xp: 42,
    difficulty: 5,
    description:
      'Uma frase que sobe à oitava e desce cromaticamente, cruzando o passaggio dentro da música. Junta afinação, ressonância e transição num trecho expressivo.',
  },
]

export const PHASES: { key: Exercise['phase']; label: string; hint: string }[] = [
  { key: 'aquecimento', label: 'Aquecimento', hint: 'Sempre comece por aqui — canto não dói.' },
  { key: 'tecnica', label: 'Técnica', hint: 'Precisão, saltos, estabilidade e passaggio.' },
  { key: 'aplicacao', label: 'Aplicação', hint: 'Levar a técnica para a música.' },
]

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id)

export const exercisesByLevel = (level: TrackLevel): Exercise[] =>
  EXERCISES.filter((e) => e.level === level)
