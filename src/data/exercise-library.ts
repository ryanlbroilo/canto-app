// GERADO automaticamente (workflow canto-300-exercicios + validação).
// 301 exercícios. Não editar à mão — regenerar via o workflow se precisar.
import { Exercise } from './types'

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    "id": "diafragmatica-4s-consciencia",
    "name": "Diafragma 4s consciente",
    "phase": "aquecimento",
    "focus": "consciência do movimento baixo",
    "description": "Mão na barriga, inspire pelo nariz em 4s expandindo o abdômen (não o peito) e solte devagar. Objetivo é sentir onde o ar entra, sem tensão nos ombros.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao"
    ],
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "box-breathing-4-4-4-4",
    "name": "Respiração em caixa 4-4-4-4",
    "phase": "aquecimento",
    "focus": "ancorar o pulso interno",
    "description": "Inspire 4s, segure 4s, expire 4s, segure 4s vazio. O ciclo simétrico acalma o sistema e cria um pulso interno estável para o apoio.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao"
    ],
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "lip-trill-sirene-livre-suave",
    "name": "Lip trill livre suave",
    "phase": "aquecimento",
    "focus": "acordar a voz sem esforço",
    "description": "Faça vibrar os lábios ('brrr') e deslize a voz livremente pra cima e pra baixo dentro de meia oitava confortável. A oclusão dos lábios reduz a pressão nas pregas e desperta o fluxo de ar sem forçar.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "humming-mmm-quinta-basica",
    "name": "Humming na quinta",
    "phase": "aquecimento",
    "focus": "ressonância nasal e fluxo",
    "description": "Com boca fechada ('mmm'), suba e desça uma quinta em glissando ligado, sentindo o zumbido nos lábios e no nariz. O 'mmm' ancora a ressonância na máscara e mantém o esforço mínimo.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "canudo-straw-aquecimento",
    "name": "Canudo (straw) aquecer",
    "phase": "aquecimento",
    "focus": "máxima economia de ar",
    "description": "Cantarole através de um canudo fino e faça uma sirene suave dentro de uma oitava, sentindo a resistência na ponta. A straw phonation (Titze) equilibra pressão e ideal pra aquecer sem cansar.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "sustentacao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "mmm-sirene-livre-grave",
    "name": "Humming grave livre",
    "phase": "aquecimento",
    "focus": "assentar a voz no grave",
    "description": "Com 'mmm', faça uma sirene livre concentrada na parte mais grave confortável, deixando o som escorregar sem meta de nota. Trabalha o registro grave relaxado e a ressonância de peito leve.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "sustentacao"
    ],
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "escala-maior-3-notas-legato-mah",
    "name": "Maior de 3 notas (mah)",
    "phase": "aquecimento",
    "focus": "encaixar tônica-2ª-3ª na zona verde",
    "description": "Cante do-re-mi-re-do na vogal 'mah', bem devagar e ligado, sentindo cada grau assentar afinado antes de subir. Objetivo: fixar os três primeiros degraus da escala maior no centro da nota.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "escala-maior-3-notas-legato-a",
    "name": "Maior curta na vogal 'a'",
    "phase": "aquecimento",
    "focus": "vogal aberta e afinação básica",
    "description": "Suba e desça do-re-mi na vogal aberta 'a', mantendo o som cheio e a boca relaxada. Foque em ouvir se o mi (3ª maior) não fica baixo demais.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 1.5,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "terca-maior-legato-ini",
    "name": "Terça maior ligada",
    "phase": "aquecimento",
    "focus": "escutar a terça maior",
    "description": "Cante do fundamental à terça maior e volte, ligando as notas sem quebrar o som. Ouça o brilho da terça e evite deixá-la baixa (é o intervalo onde o iniciante mais desafina).",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "terca-menor-legato-ini",
    "name": "Terça menor ligada",
    "phase": "aquecimento",
    "focus": "colorir a terça menor",
    "description": "Suba do fundamental à terça menor e desça em legato, sentindo o tom mais fechado que a terça maior. Compare mentalmente com a versão maior para firmar a afinação de cada uma.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      3,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "giro-curto-ah-iniciante",
    "name": "Giro curto no 'ah'",
    "phase": "aquecimento",
    "focus": "primeiro giro leve da laringe",
    "description": "Cante o pequeno giro [0,2,0] na vogal 'ah' em duplas, sem forçar a velocidade, sentindo a laringe se mover leve enquanto o apoio segura o ar constante. É o primeiro passo pra agilidade sem tensão.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "nota-reta-curta-grave-4s",
    "name": "Nota reta no grave",
    "phase": "aquecimento",
    "focus": "linha estável sem tremer",
    "description": "Sustente uma nota confortável no grave por 4 segundos com volume constante e sem oscilar. O objetivo é sentir o fluxo de ar contínuo e a laringe estável antes de qualquer dinâmica.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 4,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "nota-reta-media-5s",
    "name": "Nota reta na média",
    "phase": "aquecimento",
    "focus": "estabilidade no centro da voz",
    "description": "Segure uma nota na região média por 5 segundos, mantendo a mesma intensidade do início ao fim. Vigie qualquer tremor: a linha deve ser lisa como uma corda esticada.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "nota-reta-vogal-a-4s",
    "name": "Reta na vogal 'A'",
    "phase": "aquecimento",
    "focus": "vogal aberta estável",
    "description": "Sustente 4 segundos na vogal 'a' (como em 'casa'), boca relaxada e queixo solto. Ouça se a vogal permanece igual do começo ao fim, sem escurecer nem estreitar.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 4,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "humming-mmm-mascara-medio",
    "name": "Humming na Máscara",
    "phase": "aquecimento",
    "focus": "achar a vibração no rosto",
    "description": "Cante um 'mmm' fechado subindo e descendo [0,2,4,2,0] e sinta a coceira vibrar nos lábios, nariz e maçãs do rosto. Se não formigar, aproxime o som da frente da boca sem apertar.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "humming-nnn-foco-nasal",
    "name": "Zumbido em 'nnn'",
    "phase": "aquecimento",
    "focus": "foco nasal com a língua",
    "description": "Sustente um 'nnn' com a ponta da língua atrás dos dentes de cima em [0,2,4,2,0] e perceba a vibração migrar mais pra dentro do nariz que no 'mmm'. Mantenha o queixo solto.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "sustain-mmm-nota-longa",
    "name": "Sustentar o 'mmm'",
    "phase": "aquecimento",
    "focus": "segurar a vibração parada",
    "description": "Segure um 'mmm' bem confortável numa nota só por vários segundos e concentre toda a atenção em manter o formigamento estável nos lábios. Assim que a vibração some, você perdeu a máscara.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "sirene-labial-cruza-passaggio-iniciante",
    "name": "Sirene de lip trill pela quebra",
    "phase": "aquecimento",
    "focus": "cruzar o passaggio protegido por SOVT",
    "description": "Faça lip trill (trrr dos lábios) deslizando de baixo até uma oitava acima, atravessando a zona de quebra sem parar o borbulho. A pressão de volta do SOVT alisa a costura entre peito e cabeça pra você.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "respiracao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "sirene-ng-subida-suave-iniciante",
    "name": "Sirene em NG subindo",
    "phase": "aquecimento",
    "focus": "entrar na cabeça sem empurrar",
    "description": "Deslize um 'nnng' (língua no céu da boca) subindo devagar até a oitava — subir empurra menos que descer. Sinta o som migrar pra máscara conforme atravessa a passagem, sem apertar a garganta.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      12
    ],
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "onset-suave-ha-nota-fixa-ini",
    "name": "Onset suave 'ha' numa nota",
    "phase": "aquecimento",
    "focus": "onset aspirado sem apertar",
    "description": "Cante 'ha-ha-ha' na mesma nota com um leve 'h' antes de cada som, deixando o ar passar primeiro e a nota nascer suave. A garganta fica solta: pense em suspirar, não em empurrar.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "pattern": [
      0,
      0,
      0
    ],
    "holdSec": 0.8,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "onset-consciente-uma-nota-do-apoio-ini",
    "name": "Achar o som limpo",
    "phase": "aquecimento",
    "focus": "onset equilibrado do apoio",
    "description": "Sustente uma única nota confortável em 'a', buscando o instante em que o som começa limpo, sem clique e sem sopro. Deixe a nota nascer do apoio do diafragma, não da garganta.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "respiracao",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 1,
    "durationMin": 2,
    "xp": 16
  },
  {
    "id": "sibilante-s-fluxo-constante",
    "name": "'Sss' de fluxo constante",
    "phase": "aquecimento",
    "focus": "appoggio e dosagem do ar",
    "description": "Inspire baixo e solte um 'sss' o mais uniforme e longo possível, sem deixar o som fraquejar no fim. Meça o tempo a cada dia para ver o fôlego crescer.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "f-sh-pressao-subglotica",
    "name": "'Fff' e 'shh' de pressão",
    "phase": "aquecimento",
    "focus": "calibrar pressão sem fonação",
    "description": "Alterne 'fff' e 'shh' contínuos sentindo a resistência do ar contra os dentes e lábios. Calibra a pressão subglótica sem envolver as pregas vocais.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao"
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "inalacao-silenciosa-recuperacao",
    "name": "Inalação silenciosa + frase",
    "phase": "aquecimento",
    "focus": "tomada rápida de ar de frase",
    "description": "Puxe um ar rápido e totalmente silencioso pela boca e solte uma expiração longa e controlada. Simula a respiração de recuperação entre frases cantadas.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao"
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "costal-vs-diafragmatica",
    "name": "Costal x diafragmática",
    "phase": "aquecimento",
    "focus": "mapear expansão do tronco",
    "description": "Uma mão nas costelas laterais, outra na barriga: perceba as costelas abrirem para os lados sem levantar os ombros. Constrói consciência da respiração de 360 graus.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao"
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "canudo-mental-dosar-ar",
    "name": "Sopro no canudo",
    "phase": "aquecimento",
    "focus": "dosar o ar num fio fino",
    "description": "Imagine soprar por um canudo bem fino e mantenha o filete de ar constante por toda a expiração. Ensina a economizar e distribuir o ar ao longo da frase.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "staccato-ar-ha-ha",
    "name": "Staccato de ar 'hã-hã'",
    "phase": "aquecimento",
    "focus": "ativar o apoio em pulsos",
    "description": "Solte pequenos jatos 'hã-hã-hã' sentindo a barriga saltar a cada pulso, sem cantar. Ativa o apoio abdominal de forma rítmica e reflexa.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "ng-oitava-ida-volta",
    "name": "'Ng' na oitava",
    "phase": "aquecimento",
    "focus": "conectar grave e agudo leve",
    "description": "Use o som 'ng' (como no fim de 'sing') e deslize uma oitava subindo e voltando, sem interromper o som. O 'ng' fecha o trato atrás e suaviza a passagem entre as notas.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "vvv-fluxo-continuo",
    "name": "'Vvv' fluxo contínuo",
    "phase": "aquecimento",
    "focus": "economia de ar",
    "description": "Sustente um 'vvv' contínuo e faça uma sirene suave dentro de uma oitava, mantendo o mesmo volume o tempo todo. A fricção do 'vvv' cria contrapressão e ensina a gastar menos ar.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "zzz-sirene-onda-simples",
    "name": "'Zzz' em onda",
    "phase": "aquecimento",
    "focus": "estabilidade do fluxo",
    "description": "Com um 'zzz' bem apoiado, faça uma onda subindo à quinta, indo à oitava e voltando, sem quebrar o som. A oclusão do 'zzz' estabiliza a coluna de ar e evita picos de pressão.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0,
      7,
      12,
      7,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "lip-trill-onda-multipla",
    "name": "Lip trill em ondas",
    "phase": "aquecimento",
    "focus": "relaxar e fluir",
    "description": "Faça vibrar os lábios e desenhe várias ondulações curtas (sobe à quarta, volta, sobe à quinta, volta) mantendo tudo leve. As ondas curtas soltam a laringe sem exigir extensão.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "respiracao"
    ],
    "pattern": [
      0,
      5,
      0,
      7,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "tongue-trill-rrr-quinta",
    "name": "'Rrr' vibrado na quinta",
    "phase": "aquecimento",
    "focus": "soltar a língua e a laringe",
    "description": "Vibre a língua ('rrr') e deslize uma quinta subindo e voltando, mantendo o vibrado constante. O trill de língua libera tensão na base da língua enquanto aquece o fluxo.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "vvv-quinta-crescente",
    "name": "'Vvv' quinta crescente",
    "phase": "aquecimento",
    "focus": "controle do início do fluxo",
    "description": "Comece um 'vvv' bem suave, cresça de volume ao subir a quinta e reduza ao voltar (mini messa di voce). Ensina a modular o ar com a oclusão ajudando a controlar a pressão.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-5-notas-legato-o",
    "name": "Maior de 5 notas (ó)",
    "phase": "aquecimento",
    "focus": "pentacorde maior ligado",
    "description": "Cante do-re-mi-fa-sol e volte, na vogal 'ó', costurando as notas sem degraus. O foco é a afinação limpa da subida até a 5ª e a descida controlada.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-5-notas-nay",
    "name": "Maior de 5 notas (nay)",
    "phase": "aquecimento",
    "focus": "máscara e afinação no pentacorde",
    "description": "Use a sílaba 'nay' para levar o som à máscara enquanto sobe e desce o pentacorde maior. A ressonância nasal ajuda a manter cada grau brilhante e afinado.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-5-notas-lenta-u",
    "name": "Maior de 5 notas lenta (u)",
    "phase": "aquecimento",
    "focus": "vogal fechada e centro da nota",
    "description": "Cante o pentacorde maior bem devagar na vogal 'u', que fecha o som e revela desvios de afinação. Corrija cada nota para o centro antes de passar à próxima.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.6,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-menor-natural-5-notas-a",
    "name": "Menor natural de 5 notas",
    "phase": "aquecimento",
    "focus": "ouvir a 3ª menor",
    "description": "Cante do-re-mib-fa-sol e volte na vogal 'a', prestando atenção à 3ª menor (mib) que precisa soar baixa mas afinada. Compare mentalmente com a 3ª maior para não subir demais.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-cromatica-4-notas-lenta",
    "name": "Cromática curta (meio-tom)",
    "phase": "aquecimento",
    "focus": "afinar o meio-tom",
    "description": "Suba do-do#-re-re# e volte, bem devagar na vogal 'a', ouvindo cada meio-tom encaixar sem escorregar. Objetivo: educar o ouvido para intervalos pequenos.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      1,
      2,
      3,
      2,
      1,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-3-notas-staccato",
    "name": "Maior 3 notas staccato",
    "phase": "aquecimento",
    "focus": "onset limpo em graus curtos",
    "description": "Cante do-re-mi-re-do em staccato leve na sílaba 'ga', com ataque limpo e nota afinada em cada toque. Foque em acertar a altura já no início de cada som.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "escala-maior-5-notas-mi",
    "name": "Maior 5 notas (i) brilho",
    "phase": "aquecimento",
    "focus": "vogal 'i' e ressonância aguda",
    "description": "Suba e desça o pentacorde maior na vogal 'i', que traz brilho e ajuda a projetar. Cuide para o 'i' não estreitar a garganta nem puxar a afinação pra cima.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-descendente-suave",
    "name": "Maior descendente suave",
    "phase": "aquecimento",
    "focus": "controle na descida",
    "description": "Comece na 5ª e desça sol-fa-mi-re-do na vogal 'ó', segurando a afinação para não despencar. Descidas tendem a ficar baixas — mantenha o apoio até a tônica.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-maior-5-notas-mah-media",
    "name": "Maior 5 notas (mah) média",
    "phase": "aquecimento",
    "focus": "consistência de timbre",
    "description": "Cante o pentacorde maior na sílaba 'mah' com andamento moderado, buscando o mesmo timbre em todos os graus. A consoante 'm' ancora a ressonância antes de cada vogal.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "quinta-justa-legato-ini",
    "name": "Quinta justa ligada",
    "phase": "aquecimento",
    "focus": "apoiar o salto de quinta",
    "description": "Cante fundamental e quinta em legato, mantendo o apoio respiratório constante para a nota de cima não afinar por baixo. A quinta é o esqueleto do arpejo, então firme bem esse intervalo.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "turn-simples-ee-iniciante",
    "name": "Ornamento simples no 'ee'",
    "phase": "aquecimento",
    "focus": "turn de vizinhança superior e inferior",
    "description": "Faça o turn [0,2,0,-1,0] no 'ee' devagar, contornando a nota central pela vizinha de cima e a de baixo. O foco é articular cada nota limpa, não correr — a velocidade vem depois.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      0,
      -1,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "escala-quatro-graus-ah-iniciante",
    "name": "Escala de quatro graus",
    "phase": "aquecimento",
    "focus": "corrida curta subindo e descendo",
    "description": "Suba e desça a escalinha [0,2,4,2,0] no 'ah', pensando as notas em duplas ligadas. Mantenha o ar parelho do começo ao fim pra não pesar na descida.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "arpejo-lento-triade-iniciante",
    "name": "Arpejo leve da tríade",
    "phase": "aquecimento",
    "focus": "salto ágil sem escorregar",
    "description": "Cante o arpejo [0,4,7,4,0] no 'ah' de forma ágil mas controlada, tocando cada nota do acorde sem arrastar entre elas. Trabalha o salto limpo que prepara as tercinas mais rápidas.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "giro-pentatonico-curto-iniciante",
    "name": "Virada pentatônica curta",
    "phase": "aquecimento",
    "focus": "primeira levada gospel de melisma",
    "description": "Faça a virada [0,3,5,3,0] no 'ah' com sabor de louvor, deslizando pela pentatônica sem pressa. É o embrião das viradas gospel que vão aparecer na aplicação.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      3,
      5,
      3,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "nota-reta-vogal-e-5s",
    "name": "Reta na vogal 'É'",
    "phase": "aquecimento",
    "focus": "vogal frontal sem apertar",
    "description": "Segure 5 segundos na vogal 'é' (como em 'pé'), sentindo o som ir pra frente na máscara sem tensionar a garganta. Mantenha a afinação parada, sem escorregar.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "nota-reta-vogal-o-5s",
    "name": "Reta na vogal 'Ó'",
    "phase": "aquecimento",
    "focus": "vogal arredondada estável",
    "description": "Sustente 5 segundos na vogal 'ó' (como em 'avó'), lábios levemente arredondados e som encorpado. Evite deixar a nota cair de afinação conforme o ar diminui.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "nota-reta-vogal-i-4s",
    "name": "Reta na vogal 'I'",
    "phase": "aquecimento",
    "focus": "vogal fechada com espaço",
    "description": "Segure 4 segundos na vogal 'i' (como em 'vi'), mantendo espaço interno mesmo com a boca mais fechada. A ideia é o brilho da vogal sem apertar a laringe.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 4,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "ng-foco-nasal-medio",
    "name": "Som de 'ng'",
    "phase": "aquecimento",
    "focus": "achar o ponto do 'ng'",
    "description": "Faça o 'ng' de 'tango' (língua no céu da boca, som saindo pelo nariz) em [0,2,4,2,0] e note como o som fica todo concentrado no alto, atrás do nariz. É a base pra colocar a voz na máscara.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "mi-vogal-mesma-nota",
    "name": "'Mi' na mesma nota",
    "phase": "aquecimento",
    "focus": "consoante nasal puxando a vogal",
    "description": "Repita 'mi-mi-mi' numa nota só, deixando o 'm' jogar o som pra frente antes de abrir no 'i'. A meta é a vogal herdar o mesmo brilho do zumbido inicial.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "humming-mmm-escala-descendente",
    "name": "Humming descendo",
    "phase": "aquecimento",
    "focus": "manter máscara descendo",
    "description": "Comece no alto e desça [4,2,0] em 'mmm', mantendo o formigamento na frente do rosto mesmo quando a nota grave puxa a voz pra dentro. O grave tende a apagar a máscara, então insista.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "ressonancia"
    ],
    "pattern": [
      4,
      2,
      0
    ],
    "holdSec": 0.8,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "vvv-vibracao-labios",
    "name": "Sirene em 'vvv'",
    "phase": "aquecimento",
    "focus": "vibração contínua nos dentes",
    "description": "Deslize numa sirene suave cantando 'vvv' e sinta a vibração no lábio de baixo contra os dentes de cima. O deslize contínuo mostra a voz se movendo sem quebrar a ressonância.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "nnn-vogal-ma-me-mi",
    "name": "'Ni-ne-na' colado",
    "phase": "aquecimento",
    "focus": "transição nasal para vogal",
    "description": "Numa nota só, faça 'ni-ne-na' deixando o 'n' colocar cada vogal no mesmo lugar do nariz. Se a vogal 'cai' pra garganta, volte pro 'n' e recoloque.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-vvv-atravessa-quebra-iniciante",
    "name": "Escala em VVV pela zona de mudança",
    "phase": "aquecimento",
    "focus": "sentir a transição num vocalize fechado",
    "description": "Cante 'vvv' numa escala de cinco notas que começa no fim do peito e termina já na região de mix. O SOVT segura a pressão pra você não gritar ao entrar no agudo.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "sirene-descendente-entra-peito-iniciante",
    "name": "Sirene descendo pro peito",
    "phase": "aquecimento",
    "focus": "descer sem despencar no peito",
    "description": "Comece numa nota confortável de cabeça e escorregue uma oitava pra baixo em lip trill, freando a descida pra não 'cair' bruscamente no peito. Controlar a chegada evita o degrau entre os registros.",
    "kind": "siren",
    "level": "iniciante",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      12,
      0
    ],
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "onset-ha-vogais-ae-i-o-ini",
    "name": "'Ha' em vogais diferentes",
    "phase": "aquecimento",
    "focus": "onset suave por vogal",
    "description": "Repita o onset aspirado alternando as vogais 'ha, hê, hi, hó, hu' numa nota só, mantendo a mesma soltura em todas. Observe qual vogal aperta mais e relaxe nela.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      0,
      0,
      0,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "onset-legato-escala-suave-ini",
    "name": "Onset legato na escala",
    "phase": "aquecimento",
    "focus": "um ataque, som conectado",
    "description": "Comece a escala com um único onset limpo em 'a' e ligue todas as notas sem novos ataques, como uma linha contínua. O objetivo é atacar bem uma vez e sustentar o fluxo.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "coup-glotte-suave-clareza-ini",
    "name": "Coup de glotte suave",
    "phase": "aquecimento",
    "focus": "ataque claro sem dureza",
    "description": "Ataque a nota com um onset firme e definido em 'a', sentindo o som começar exatamente no tempo, sem sopro antes. Firme não é apertado: se doer ou 'clicar' duro, alivie a pressão.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      0,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "messa-di-voce-sopro",
    "name": "Messa di voce no sopro",
    "phase": "aquecimento",
    "focus": "crescer e diminuir a pressão",
    "description": "Num 'fff' contínuo, aumente aos poucos a intensidade do ar e depois reduza suavemente até quase nada. Treina o controle gradual da pressão, base da messa di voce cantada.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 3,
    "durationMin": 2,
    "xp": 20
  },
  {
    "id": "sibilante-longa-teste-folego",
    "name": "'Sss' longo — teste de fôlego",
    "phase": "aquecimento",
    "focus": "medir a resistência do ar",
    "description": "Solte um 'sss' o mais longo que conseguir mantendo o volume estável até o fim, sem colapsar o tronco. Use como termômetro semanal da sua capacidade.",
    "kind": "breathing",
    "level": "iniciante",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 3,
    "durationMin": 2,
    "xp": 20
  },
  {
    "id": "quarta-justa-ini",
    "name": "Quarta justa",
    "phase": "tecnica",
    "focus": "estabilidade da quarta",
    "description": "Salte do fundamental à quarta justa e retorne, sem escorregar até a terça no caminho. Pense a quarta como um degrau firme e aberto, chegando direto na nota-alvo.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      5,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "quinta-ida-volta-ini",
    "name": "Quinta ida e volta",
    "phase": "tecnica",
    "focus": "consolidar a quinta",
    "description": "Alterne fundamental e quinta duas vezes, mantendo a mesma altura da nota alta nas repetições. Serve para gravar a distância da quinta no ouvido antes dos arpejos completos.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      7,
      0,
      7,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "tercas-encadeadas-ini",
    "name": "Terças em degraus",
    "phase": "tecnica",
    "focus": "empilhar terças",
    "description": "Suba por terças encadeadas (fundamental, terça, quinta) como uma escadinha e desça pelo mesmo caminho. Cada nota apoia a próxima, treinando o ouvido para o arpejo maior.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 1,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "terca-descendente-ini",
    "name": "Terça descendente",
    "phase": "tecnica",
    "focus": "descer sem despencar",
    "description": "Comece na terça e desça ao fundamental, controlando para a nota grave não cair abaixo do tom. Descidas relaxam a laringe, mas não deixe o apoio afrouxar junto.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      4,
      0,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "quinta-quarta-alternadas-ini",
    "name": "Quinta e quarta alternadas",
    "phase": "tecnica",
    "focus": "contrastar dois saltos",
    "description": "Cante fundamental-quinta e depois fundamental-quarta, sentindo a diferença de um semitom no topo. Alternar os dois saltos afina o senso de distância intervalar.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      7,
      0,
      5,
      0
    ],
    "holdSec": 1,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "crescendo-suave-grave-6s",
    "name": "Crescendo suave no grave",
    "phase": "tecnica",
    "focus": "crescer volume afinado",
    "description": "Comece a nota bem piano e cresça gradualmente até um volume médio ao longo de 6 segundos, sem deixar a afinação subir junto com o volume. O apoio empurra o ar de forma progressiva.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "escala-menor-natural-completa-o",
    "name": "Menor natural completa (ó)",
    "phase": "tecnica",
    "focus": "escala menor de 8 graus",
    "description": "Percorra a escala menor natural inteira, subindo e descendo na vogal 'ó', mantendo cada grau afinado. Foque no 3º e no 6º graus abaixados, que dão a cor menor.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      8,
      10,
      12,
      10,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 20
  },
  {
    "id": "escala-maior-9-notas-oitava-iniciante",
    "name": "Maior à oitava (guiada)",
    "phase": "tecnica",
    "focus": "primeira oitava afinada",
    "description": "Suba a escala maior completa até a oitava e volte, na vogal 'a', devagar e apoiado. Objetivo: fechar a oitava sem que a nota alta fique baixa nem apertada.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 20
  },
  {
    "id": "decrescendo-suave-media-6s",
    "name": "Decrescendo suave na média",
    "phase": "tecnica",
    "focus": "diminuir sem perder o apoio",
    "description": "Inicie a nota num volume médio e vá diminuindo suavemente até quase silêncio em 6 segundos, mantendo o apoio ativo justamente quando o som afina. O erro comum é desligar o suporte no fim.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 20
  },
  {
    "id": "louvor-frase-abertura-maior",
    "name": "Frase de abertura",
    "phase": "aplicacao",
    "focus": "Melodia simples em modo maior",
    "description": "Cante uma frase curta de louvor em vogal aberta (á), subindo e resolvendo na tônica. Primeiro contato com fazer música: mantenha cada nota centrada e o ar fluindo.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "frase-gratidao-descendente",
    "name": "Frase de gratidão",
    "phase": "aplicacao",
    "focus": "Contorno descendente contemplativo",
    "description": "Uma frase que desce do sol à tônica, gesto de entrega e gratidão. Deixe o ar sustentar cada nota enquanto o desenho desce sem pressa.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 1,
    "durationMin": 3,
    "xp": 16
  },
  {
    "id": "pentatonica-maior-5-notas-iniciante",
    "name": "Pentatônica maior fácil",
    "phase": "aplicacao",
    "focus": "cor gospel sem semitons",
    "description": "Cante a pentatônica maior (do-re-mi-sol-la) e volte na vogal 'a' — sem meio-tons, ela soa fácil e alegre. Ótima para pegar o sabor de louvor mantendo a afinação segura.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      7,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "arpejo-maior-simples-ini",
    "name": "Arpejo maior simples",
    "phase": "aplicacao",
    "focus": "tríade maior cantada",
    "description": "Cante o arpejo maior fundamental-terça-quinta-terça-fundamental de forma ligada e sorridente. É a base harmônica de quase todo louvor alegre, então deixe cada nota clara.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 1,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "arpejo-menor-simples-ini",
    "name": "Arpejo menor simples",
    "phase": "aplicacao",
    "focus": "tríade menor cantada",
    "description": "Cante fundamental-terça menor-quinta e volte, mantendo o clima mais introspectivo do modo menor. Útil para louvores de adoração mais contemplativos.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      3,
      7,
      3,
      0
    ],
    "holdSec": 1,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "giro-louvor-basico",
    "name": "Giro de louvor",
    "phase": "aplicacao",
    "focus": "Giro melódico de adoração",
    "description": "Um giro clássico de louvor (dó-mi-sol-mi-fá-mi-dó) em vogal 'ô'. Sinta o desenho subir ao sol e voltar com doçura, sem forçar.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      5,
      4,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "pentatonica-maior-suave",
    "name": "Passeio pentatônico",
    "phase": "aplicacao",
    "focus": "Sabor pentatônico maior",
    "description": "Passeie pela pentatônica maior (dó-ré-mi-sol) em 'lá', o vocabulário mais comum do gospel. Cada grau deve soar limpo e conectado ao próximo.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "salto-quinta-louvor",
    "name": "Salto à quinta",
    "phase": "aplicacao",
    "focus": "Levada com salto de quinta",
    "description": "Salte da tônica direto à quinta e resolva descendo, um gesto celebrativo comum em refrões. Prepare o ar antes do salto para acertar o sol no centro.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "sustain-amem-tonica",
    "name": "Amém sustentado",
    "phase": "aplicacao",
    "focus": "Sustentar a tônica com apoio",
    "description": "Sustente a tônica em 'ámen' por vários segundos, como o fim de um louvor. Mantenha o volume estável e a nota firme do começo ao fim do ar.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 2,
    "durationMin": 2,
    "xp": 18
  },
  {
    "id": "frase-alegre-terca",
    "name": "Frase alegre em terças",
    "phase": "aplicacao",
    "focus": "Movimento por terças",
    "description": "Uma frase celebrativa que salta em terças (dó-mi-fá-mi-dó) em 'iê'. As terças dão o balanço característico do louvor animado — mantenha o ritmo leve.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      5,
      4,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "ponte-subida-simples",
    "name": "Pontinha de subida",
    "phase": "aplicacao",
    "focus": "Frase-ponte que sobe",
    "description": "Uma frase que sobe grau a grau até a quinta, preparando um clímax. Deixe cada nota apoiar a próxima como degraus até o topo.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "pentatonica-menor-intro",
    "name": "Cor menor de louvor",
    "phase": "aplicacao",
    "focus": "Sabor pentatônico menor",
    "description": "Um contorno em pentatônica menor (dó-mib-fá-sol) em 'ô', trazendo a cor mais introspectiva da adoração. Sinta a terça menor sem deixá-la baixa demais.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      3,
      5,
      3,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "levada-celebrativa-curta",
    "name": "Levada celebrativa",
    "phase": "aplicacao",
    "focus": "Levada rítmica com saltos",
    "description": "Uma levada animada que pula entre tônica, quinta e terça (dó-sol-mi-dó). Marque cada salto com energia mas sem endurecer a garganta.",
    "kind": "interval",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 18
  },
  {
    "id": "frase-resolucao-setima",
    "name": "Resolução na sétima",
    "phase": "aplicacao",
    "focus": "Sensível resolvendo na tônica",
    "description": "Frase que toca a sétima maior e resolve na oitava, o gesto de 'chegar em casa'. Cante o si bem próximo do dó de cima para sentir a resolução puxar.",
    "kind": "scale",
    "level": "iniciante",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      11,
      12
    ],
    "holdSec": 1.4,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 20
  },
  {
    "id": "sustain-clamor-quinta",
    "name": "Clamor na quinta",
    "phase": "aplicacao",
    "focus": "Sustentar a quinta no clímax",
    "description": "Suba à quinta e sustente-a em 'ah', segurando o momento de clamor. Chegue no sol com apoio firme e mantenha o volume constante enquanto o ar dura.",
    "kind": "sustain",
    "level": "iniciante",
    "skills": [
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      7
    ],
    "holdSec": 5,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 20
  },
  {
    "id": "vibrato-trilo-lento-precursor",
    "name": "Trilo lento (precursor)",
    "phase": "aquecimento",
    "focus": "oscilação motora entre dois graus",
    "description": "Alterne devagar entre a tônica e o tom acima (dó–ré–dó–ré–dó) com legato ligado — é o gesto motor que antecede o vibrato: sinta a pulsação regular antes de estreitá-la em oscilação fina.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      0,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 2,
    "durationMin": 3,
    "xp": 28
  },
  {
    "id": "vibrato-achar-descida-sirene",
    "name": "Sirene com vibrato ao pousar",
    "phase": "aquecimento",
    "focus": "encontrar o vibrato ao estabilizar",
    "description": "Deslize em sirene descendente do agudo ao médio e, ao pousar na nota final, deixe a voz relaxar até o vibrato surgir — a sirene solta a laringe e prepara a oscilação natural.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "sustentacao"
    ],
    "pattern": [
      12,
      0
    ],
    "difficulty": 2,
    "durationMin": 2,
    "xp": 28
  },
  {
    "id": "escala-maior-gee-ressonancia",
    "name": "Maior com 'gee' na máscara",
    "phase": "aquecimento",
    "focus": "colocação alta e brilho",
    "description": "Cante o pentacorde maior na sílaba 'gui' (gee), que joga o som pra frente e pra máscara. Trabalha ressonância brilhante mantendo cada grau afinado.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "sexta-maior-legato-int",
    "name": "Sexta maior ligada",
    "phase": "aquecimento",
    "focus": "abrir a sexta",
    "description": "Salte do fundamental à sexta maior em legato, um intervalo largo e caloroso muito usado em melodias gospel. Mire a nota alta desde já, sem subir por raspão.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      9,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 30
  },
  {
    "id": "setima-menor-int",
    "name": "Sétima menor",
    "phase": "aquecimento",
    "focus": "tensão da sétima",
    "description": "Cante fundamental e sétima menor, sentindo a tensão que pede resolução — a cor do acorde dominante. Não deixe a nota alta cair, pois a sétima tende a afinar por baixo.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      10,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 30
  },
  {
    "id": "setima-maior-int",
    "name": "Sétima maior",
    "phase": "aquecimento",
    "focus": "precisão da sétima maior",
    "description": "Salte à sétima maior, o intervalo mais próximo da oitava e o mais fácil de errar por meio-tom. Ancore a nota-alvo ouvindo a oitava mentalmente e afine um semitom abaixo dela.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      11,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 2,
    "xp": 32
  },
  {
    "id": "box-6-6-6-6-intermediario",
    "name": "Caixa 6-6-6-6",
    "phase": "tecnica",
    "focus": "ciclo simétrico mais longo",
    "description": "Estenda o box breathing para 6s em cada fase, mantendo o tronco expandido durante a retenção. O ciclo maior aumenta a resistência e a estabilidade do apoio.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "retencao-crescente-4-6-8",
    "name": "Retenção crescente 4-6-8",
    "phase": "tecnica",
    "focus": "tolerância à retenção",
    "description": "Inspire em 4s e segure primeiro 4s, depois 6s, depois 8s em ciclos sucessivos, expirando sempre controlado. Amplia gradualmente o controle da glote fechada e do apoio.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao"
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "s-com-acentos-ritmicos",
    "name": "'Sss' com acentos",
    "phase": "tecnica",
    "focus": "apoio pulsado dentro do fluxo",
    "description": "Mantenha um 'sss' contínuo e insira acentos de pressão a cada 2s empurrando com o abdômen, sem cortar o som. Coordena o fluxo constante com impulsos de apoio.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "staccato-ar-serie-longa",
    "name": "Staccato de ar — série",
    "phase": "tecnica",
    "focus": "resistência do apoio pulsado",
    "description": "Faça séries de 8 pulsos 'hã' rápidos, respire e repita por vários ciclos sem perder a nitidez do salto abdominal. Desenvolve resistência do apoio em modo staccato.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "lip-trill-passaggio-oitava",
    "name": "Lip trill cruzando o passaggio",
    "phase": "tecnica",
    "focus": "suavizar a quebra",
    "description": "Faça vibrar os lábios e deslize uma oitava atravessando deliberadamente sua zona de quebra, sem deixar o som 'pular'. O lip trill mascara o passaggio e treina uma transição contínua de peito pra mista.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "ng-onda-passaggio",
    "name": "'Ng' ondulado no passaggio",
    "phase": "tecnica",
    "focus": "amaciar a zona de transição",
    "description": "Com 'ng', desenhe uma onda que sobe à oitava, recua à quinta e volta ao topo antes de descer, insistindo na região da quebra. O ir e voltar no passaggio ensina o ajuste fino entre registros.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      7,
      12,
      0
    ],
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "vvv-descendente-ascendente",
    "name": "'Vvv' de cima pra baixo",
    "phase": "tecnica",
    "focus": "controlar a descida do agudo",
    "description": "Comece no agudo confortável com 'vvv', desça uma oitava e volte, controlando o afinamento do som na descida. Descer atravessando o passaggio treina a soltura sem 'sentar' na voz de peito.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      12,
      0,
      12
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "tongue-trill-oitava-conexao",
    "name": "'Rrr' oitava conectada",
    "phase": "tecnica",
    "focus": "conectar registros com fluxo",
    "description": "Vibre a língua e faça uma sirene de oitava ida e volta, mantendo o vibrado igual do grave ao agudo. Se o 'rrr' vacilar na quebra, é ali que a conexão precisa de trabalho.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "canudo-sirene-passaggio",
    "name": "Canudo cruzando quebra",
    "phase": "tecnica",
    "focus": "economia atravessando o passaggio",
    "description": "Pelo canudo, deslize devagar uma oitava e meia atravessando a quebra, sentindo a resistência estabilizar a pressão. A straw phonation facilita passar pela zona difícil gastando pouco ar.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0,
      12,
      7,
      12,
      0
    ],
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "zzz-ondas-multiplas-medio",
    "name": "'Zzz' múltiplas ondas",
    "phase": "tecnica",
    "focus": "agilidade e continuidade",
    "description": "Com 'zzz', faça várias ondas seguidas (sobe à quinta, volta, sobe à sétima, volta) percorrendo a zona média-alta sem cortar o som. Treina a mobilidade da voz mantendo a oclusão e o fluxo estáveis.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      5,
      0,
      7,
      0
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "lip-trill-glissando-ligado",
    "name": "Lip trill glissando ligado",
    "phase": "tecnica",
    "focus": "desenhar um arpejo em glissando",
    "description": "Faça vibrar os lábios subindo em glissando ligado tocando as notas do arpejo maior até a oitava e voltando, sem articular cada grau. Une a sensação de escala com a suavidade da sirene.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "ng-sirene-livre-passaggio",
    "name": "'Ng' sirene livre",
    "phase": "tecnica",
    "focus": "explorar a quebra sem meta",
    "description": "Com 'ng', faça uma sirene livre subindo e descendo pela zona de quebra, sem pattern, procurando o ponto exato onde a voz muda. Explorar livremente ajuda a mapear e amaciar o próprio passaggio.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "escala-maior-5-notas-legato-avancado-i",
    "name": "Maior 5 notas ágil (i)",
    "phase": "tecnica",
    "focus": "agilidade mantendo afinação",
    "description": "Cante o pentacorde maior mais rápido na vogal 'i', ligando as notas sem borrar a afinação. Trabalha agilidade leve sem perder o centro de cada grau.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "escala-maior-oitava-completa-media",
    "name": "Maior à oitava média",
    "phase": "tecnica",
    "focus": "oitava fluida",
    "description": "Percorra a escala maior completa até a oitava e volte na vogal 'a', em andamento moderado e ligado. Foque na afinação da sensível (7ª maior) resolvendo na tônica alta.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.8,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-maior-vogais-mistas",
    "name": "Maior com vogais mistas",
    "phase": "tecnica",
    "focus": "modificação vocálica afinada",
    "description": "Suba o pentacorde maior mudando de vogal a cada grau (a-e-i-o-u) sem alterar a afinação. Trabalha equalizar as vogais mantendo o centro da nota estável.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-menor-natural-legato-u",
    "name": "Menor natural legato (u)",
    "phase": "tecnica",
    "focus": "cor menor em vogal fechada",
    "description": "Cante a menor natural de oito graus na vogal 'u', bem ligada, ouvindo com clareza os graus abaixados. A vogal fechada revela qualquer desvio nos meios-tons da escala.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      8,
      10,
      12,
      10,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-maior-legato-descendente-oitava",
    "name": "Maior descendente da oitava",
    "phase": "tecnica",
    "focus": "descer oitava sem cair",
    "description": "Comece na oitava e desça a escala maior inteira até a tônica na vogal 'ó', segurando o apoio para não achatar. Descidas longas são o maior teste contra a afinação baixa.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "quinta-descendente-int",
    "name": "Quinta descendente",
    "phase": "tecnica",
    "focus": "descer a quinta com apoio",
    "description": "Comece na quinta e desça ao fundamental, sustentando o apoio para a nota grave não perder corpo. Descer intervalos largos treina o freio respiratório.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      7,
      0,
      7,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 30
  },
  {
    "id": "arpejo-descendente-int",
    "name": "Arpejo descendente",
    "phase": "tecnica",
    "focus": "tríade de cima para baixo",
    "description": "Comece na oitava e desça pelo arpejo maior até o fundamental, controlando cada degrau na descida. Descidas expõem afinação preguiçosa, então mire cada nota.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      12,
      7,
      4,
      0
    ],
    "holdSec": 1,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "terca-staccato-int",
    "name": "Terças em staccato",
    "phase": "tecnica",
    "focus": "ataque limpo na terça",
    "description": "Ataque fundamental e terça em staccato, com onset suave e claro (sem raspar nem aspirar). O staccato limpa a coordenação da glote e a precisão do salto curto.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      0,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 30
  },
  {
    "id": "quinta-staccato-int",
    "name": "Quintas em staccato",
    "phase": "tecnica",
    "focus": "agilidade na quinta",
    "description": "Dispare fundamental e quinta em ataques curtos e precisos, cada nota com início limpo. Trabalha a leveza da glote sem empurrar o ar de forma aspirada.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      7,
      0,
      7,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 2,
    "xp": 30
  },
  {
    "id": "escala-corrida-oito-graus-intermediario",
    "name": "Escala corrida de oitava",
    "phase": "tecnica",
    "focus": "corrida diatônica sobe-desce rápida",
    "description": "Corra a escala [0,2,4,5,7,5,4,2,0] no 'ah' pensando em quatro duplas rápidas, mantendo a laringe solta e o apoio firme por baixo. O objetivo é agilidade parelha, não afinação lenta nota a nota.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "turn-duplo-ee-intermediario",
    "name": "Turn duplo no 'ee'",
    "phase": "tecnica",
    "focus": "ornamento com dois contornos seguidos",
    "description": "Encadeie dois turns [0,1,0,2,0] no 'ee' em quiálteras sugeridas, alternando o semitom de baixo e o tom de cima ao redor da nota. Treina a agilidade fina de vizinhança com a vogal mais estreita.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      1,
      0,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "melisma-gira-nota-intermediario",
    "name": "Melisma girando na nota",
    "phase": "tecnica",
    "focus": "grupo que gira em torno de um centro",
    "description": "Cante o grupo [0,2,3,2,0,2,4,2,0] no 'ah', deixando a melodia girar em torno da tônica como um redemoinho de melisma. Pense em tercinas soltas e não deixe o ar cair no meio do giro.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      3,
      2,
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "tercina-arpejo-ah-intermediario",
    "name": "Tercina de arpejo",
    "phase": "tecnica",
    "focus": "arpejo em grupos de três rápido",
    "description": "Cante [0,4,7,4,0,4,7,4,0] no 'ah' agrupando em tercinas, tocando as notas do acorde num vaivém ágil. Trabalha o salto rápido do arpejo com o apoio segurando o ar por baixo.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "melisma-pentatonico-gospel-intermediario",
    "name": "Melisma pentatônico gospel",
    "phase": "tecnica",
    "focus": "virada pentatônica com balanço de louvor",
    "description": "Cante a virada [0,2,4,7,4,2,0] no 'ah' com o balanço de louvor, subindo e descendo pela pentatônica maior de forma fluida. Prepara diretamente o vocabulário melódico da fase de aplicação.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "terca-repetida-agil-intermediario",
    "name": "Terças em vaivém ágil",
    "phase": "tecnica",
    "focus": "saltos de terça encadeados rápido",
    "description": "Cante [0,2,4,2,5,4,2,0] no 'ee' deixando as terças balançarem em duplas rápidas, cada salto limpo e sem escorregão. A vogal estreita ajuda a manter a laringe leve e ágil.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "turn-descendente-ah-intermediario",
    "name": "Ornamento descendente",
    "phase": "tecnica",
    "focus": "turn resolvendo pra baixo",
    "description": "Cante [0,2,0,-1,0,-1,-3] no 'ah', fazendo o ornamento girar e depois descer resolvendo pra baixo em passos leves. Treina a agilidade que desce sem pesar nem perder afinação.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      0,
      -1,
      0,
      -1,
      -3
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "melisma-misto-graus-saltos-intermediario",
    "name": "Melisma de graus e saltos",
    "phase": "tecnica",
    "focus": "mistura de passo e salto no mesmo giro",
    "description": "Cante [0,2,4,7,5,4,2,0] no 'ah' misturando o degrau da escala com o salto pra sétima e a volta suave. Treina a laringe a alternar movimento por graus e por salto sem travar.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "messa-di-voce-media-8s",
    "name": "Messa di voce na média",
    "phase": "tecnica",
    "focus": "crescer e diminuir sem desafinar",
    "description": "Faça a messa di voce completa em 8 segundos: comece piano, cresça até o forte no meio e volte ao piano, tudo sem mover a afinação. É o exercício-mãe do controle dinâmico.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "messa-di-voce-vogal-a-8s",
    "name": "Messa di voce em 'A'",
    "phase": "tecnica",
    "focus": "dinâmica em vogal aberta",
    "description": "Aplique a curva crescer-diminuir sobre a vogal 'a' em 8 segundos, cuidando pra vogal não estreitar quando o som cresce. A cor do 'a' deve permanecer constante em todas as intensidades.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "sustain-vibrato-natural-8s",
    "name": "Reta que solta vibrato",
    "phase": "tecnica",
    "focus": "deixar o vibrato aparecer",
    "description": "Comece a nota reta e, na segunda metade dos 8 segundos, relaxe e deixe o vibrato aparecer naturalmente, sem forçar oscilação. O vibrato saudável nasce do relaxamento, não do balanço proposital.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "vibrato"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "mi-me-ma-mo-mu-escala",
    "name": "'Mi-me-ma-mo-mu'",
    "phase": "tecnica",
    "focus": "manter foco trocando vogal",
    "description": "Suba [0,2,4,5,7] cantando 'mi-me-ma-mo-mu', uma vogal por grau, mantendo todas no mesmo ponto de ressonância que o 'mi' te deu. As vogais mais abertas ('a','o') tendem a escapar — traga de volta pra frente.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "ee-ah-formante-medio",
    "name": "'Ii' vira 'ah'",
    "phase": "tecnica",
    "focus": "sentir mudança de formante",
    "description": "Numa nota confortável, alterne devagar 'iiii-aaaa' e sinta o som mudar de lugar: o 'i' fica brilhante e à frente, o 'a' abre e desce. É a percepção pura de formante sem mexer na altura.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "ng-para-ah-abertura",
    "name": "'Ng' abre em 'ah'",
    "phase": "tecnica",
    "focus": "levar o foco nasal pra vogal",
    "description": "Segure o 'ng' pra travar o foco lá em cima e então abra lentamente pra 'ah' tentando não perder aquele ponto alto. A vogal fica mais rica quando herda a ressonância do 'ng'.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "nay-nay-twang-medio",
    "name": "'Nay-nay' brilhante",
    "phase": "tecnica",
    "focus": "twang controlado pra projeção",
    "description": "Cante 'nay-nay-nay' bem à frente e meio 'nasalado' em [0,2,4,2,0], buscando um brilho estridente que corta sem gritar. Esse twang é o que faz a voz projetar sem forçar.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "zzz-vibracao-migra",
    "name": "Sirene em 'zzz'",
    "phase": "tecnica",
    "focus": "vibração que migra ao subir",
    "description": "Numa sirene ampla em 'zzz', preste atenção na vibração migrar da boca pro rosto conforme sobe. O 'z' mantém a pressão de ar constante e revela onde o som se coloca em cada altura.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "mi-me-ma-terca-arpejo",
    "name": "Vogais no arpejo",
    "phase": "tecnica",
    "focus": "foco fixo mudando de grau",
    "description": "Faça [0,4,7,4,0] com 'mi-me-ma-me-mi', trocando a vogal a cada salto sem deixar o ponto de ressonância mudar de lugar. Saltos maiores testam se a máscara aguenta a mudança de nota.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "sustain-oo-arredondado",
    "name": "'Uu' redondo longo",
    "phase": "tecnica",
    "focus": "vogal fechada arredondada",
    "description": "Sustente um 'uu' bem redondo e escuro numa nota média, sentindo o espaço atrás abrir enquanto os lábios afunilam à frente. É a vogal que ensina a cavar ressonância sem perder foco.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 7,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "mmm-para-ah-onset-suave",
    "name": "'Mmm' abre em 'ah'",
    "phase": "tecnica",
    "focus": "onset suave pela nasal",
    "description": "Comece no 'mmm' e abra pra 'ah' sem nenhum clique na garganta, deixando a nasal preparar um começo de som macio. Ótimo pra quem 'ataca' a nota com aperto.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-vogais-ee-ah-oo",
    "name": "'Ii-ah-uu' na escala",
    "phase": "tecnica",
    "focus": "percorrer formantes na escala",
    "description": "Suba [0,2,4,5,7] cantando 'ii-ii-ah-uu-uu' e sinta o som viajar do brilho ('i') pra abertura ('a') e pro arredondado ('u'). Treina consciência de formante em movimento.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-oito-graus-cruza-mix-intermediario",
    "name": "Escala de oito graus pelo mix",
    "phase": "tecnica",
    "focus": "subir a escala inteira mantendo a cor",
    "description": "Suba a escala maior completa até a oitava numa vogal 'u' arredondada, atravessando o passaggio no meio do caminho. Mantenha a mesma cor da primeira à última nota pra ninguém ouvir onde o registro mudou.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "salto-oitava-forca-transicao-intermediario",
    "name": "Salto de oitava na quebra",
    "phase": "tecnica",
    "focus": "forçar a passagem num pulo direto",
    "description": "Salte direto uma oitava e volte, na vogal 'a', centrando o pulo em cima da zona de quebra. Ajuste a ressonância no topo (bocejo interno) em vez de aumentar o ar, pra não estourar a nota alta.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-descendente-costura-intermediario",
    "name": "Escala descendo alisando a costura",
    "phase": "tecnica",
    "focus": "descer da cabeça ao peito sem degrau",
    "description": "Desça a escala maior da oitava até a tônica, passando pelo mix com atenção redobrada no ponto de virada. Segure a leveza da cabeça o máximo possível antes de deixar o peito entrar, pra alisar a costura.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "salto-sexta-mix-consciente-intermediario",
    "name": "Salto de sexta pro mix",
    "phase": "tecnica",
    "focus": "aterrissar no mix com controle",
    "description": "Pule uma sexta maior e volte, na vogal 'ê', mirando o topo bem no início da região de cabeça. Chegue no agudo afinando o ar e estreitando a vogal, não empurrando — é o mix consciente.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      9,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "salto-quinta-textura-aberta-intermediario",
    "name": "Salto de quinta em vogal aberta",
    "phase": "tecnica",
    "focus": "desafiar o mix com vogal aberta",
    "description": "Pule uma quinta justa e retorne na vogal 'a' bem aberta, centrado logo abaixo da quebra pra puxar a nota alta pra dentro do mix. A vogal aberta desafia mais que o SOVT — segure a cor.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "escala-mix-fim-peito-inicio-cabeca-intermediario",
    "name": "Ponte peito-cabeça",
    "phase": "tecnica",
    "focus": "unir fim do peito ao início da cabeça",
    "description": "Cante um trecho de seis notas que sai do topo do peito e chega no pé da cabeça, na vogal 'u', mantendo exatamente a mesma cor nas duas pontas. É o exercício central do mix: costurar os dois registros num timbre só.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      3,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "onset-equilibrado-uma-nota-ar-som-int",
    "name": "Onset equilibrado",
    "phase": "tecnica",
    "focus": "ar e som juntos no tempo",
    "description": "Numa nota sustentada em 'a', ataque com ar e som chegando ao mesmo tempo: nem soprado ('h') nem estalado (glotal). Sinta a nota brotar do apoio abdominal, redonda desde o primeiro instante.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "staccato-arpejo-ataque-limpo-int",
    "name": "Staccato de arpejo",
    "phase": "tecnica",
    "focus": "cada ataque cravado e limpo",
    "description": "Cante o arpejo em staccato curto em 'a', cravando cada nota com um ataque limpo e silêncio nítido entre elas. O impulso vem do apoio ('hã' seco), não de empurrar a garganta.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "staccato-nota-repetida-so-ataque-int",
    "name": "Staccato na mesma nota",
    "phase": "tecnica",
    "focus": "só o ataque, sem melodia",
    "description": "Repita a mesma nota em staccato curto e seco, isolando o gesto do ataque para que ele fique idêntico toda vez. Deixe silêncio real entre cada 'ha' apoiado, sem arrastar o som.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      0,
      0,
      0,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "escala-legato-para-comparar-int",
    "name": "Escala legato (par A)",
    "phase": "tecnica",
    "focus": "linha ligada, um só ataque",
    "description": "Cante a escala toda em legato com um único onset equilibrado no início, sem novos ataques no meio. Guarde a sensação da linha lisa para comparar com a versão staccato.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "escala-staccato-para-comparar-int",
    "name": "Escala staccato (par B)",
    "phase": "tecnica",
    "focus": "reataque limpo em cada grau",
    "description": "Cante a mesma escala em staccato curto, reatacando cada grau com clareza e silêncio entre as notas. Compare com a versão legato: o apoio é o mesmo, muda só a articulação.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "onset-terca-repetida-articulado-int",
    "name": "Ataque na terça",
    "phase": "tecnica",
    "focus": "onset limpo trocando de altura",
    "description": "Ataque separadamente a tônica e a terça, reatacando cada uma com onset equilibrado e afinação certeira já no primeiro instante. O desafio é manter o ataque igual mesmo mudando de nota.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      0,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "onset-vogais-escuras-claras-int",
    "name": "Onset em vogais contrastantes",
    "phase": "tecnica",
    "focus": "ataque igual em 'u' e 'i'",
    "description": "Reataque a mesma nota alternando vogal escura e clara ('u, i, u, i, u'), buscando o mesmo tipo de onset limpo em ambas. Evite que o 'i' aperte e o 'u' fique soprado.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      0,
      0,
      0,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "vibrato-natural-nascendo-media",
    "name": "Vibrato que nasce sozinho",
    "phase": "tecnica",
    "focus": "deixar o vibrato aparecer no fim",
    "description": "Sustente uma nota média em vogal 'a', firme e reta no começo, e no último terço afrouxe a laringe e o queixo deixando o vibrato APARECER sozinho — não force a oscilação, ela nasce do relaxamento apoiado.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "vibrato-liga-desliga-media",
    "name": "Reto, vibrato, reto",
    "phase": "tecnica",
    "focus": "ligar e desligar o vibrato",
    "description": "Na mesma nota média, cante em três partes: som reto, depois solte o vibrato, depois volte ao reto — treina o controle consciente de ligar e desligar a oscilação sem mudar a afinação central.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "vibrato-messa-di-voce-intermediario",
    "name": "Cresce e diminui com vibrato",
    "phase": "tecnica",
    "focus": "dinâmica junto do vibrato",
    "description": "Numa nota média sustentada, faça messa di voce (piano→forte→piano) mantendo o vibrato presente do início ao fim — combine o crescendo do ar com a oscilação sem deixá-la sumir no piano.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "vibrato-escala-cada-nota-media",
    "name": "Vibrato em cada degrau",
    "phase": "tecnica",
    "focus": "vibrato consistente na escala",
    "description": "Suba a escala maior de cinco notas segurando cada grau tempo suficiente para o vibrato aparecer em todas — o desafio é manter a mesma qualidade de oscilação subindo de altura.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "vibrato",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.4,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "appoggio-costelas-abertas",
    "name": "Appoggio — costelas abertas",
    "phase": "tecnica",
    "focus": "suspender a descida das costelas",
    "description": "Inspire abrindo as costelas e, ao expirar num 'fff', resista à tendência delas de fecharem rápido, mantendo a expansão. Este é o cerne do appoggio da escola italiana.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "messa-di-voce-sopro-longa",
    "name": "Messa di voce — sopro longo",
    "phase": "tecnica",
    "focus": "controle fino cresc./dim.",
    "description": "Num 'fff' de fôlego inteiro, cresça a pressão até a metade e diminua até o fim numa curva suave e simétrica. Refina o controle contínuo da pressão do ar.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "inalacao-rapida-expiracao-frase",
    "name": "Ar rápido, frase longa",
    "phase": "tecnica",
    "focus": "recarga veloz entre frases",
    "description": "Alterne uma tomada de ar silenciosa em menos de 1s com uma expiração longa em 'shh' de 12s ou mais. Treina a recarga veloz típica de trechos sem pausa.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "suspensao-diafragmatica-cheia",
    "name": "Suspensão de ar cheio",
    "phase": "tecnica",
    "focus": "segurar sem travar a glote",
    "description": "Inspire ao máximo e suspenda o ar 6s mantendo a garganta aberta e relaxada, depois solte lento num 'sss'. Diferencia suspensão apoiada de aperto de glote.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "respiracao-360-resistida",
    "name": "Respiração 360 resistida",
    "phase": "tecnica",
    "focus": "apoio de tronco inteiro",
    "description": "Inspire expandindo barriga, costelas e lombar ao mesmo tempo e expire num 'fff' de 10s mantendo toda a cintura ativa. Integra o apoio em todo o cinturão abdominal.",
    "kind": "breathing",
    "level": "intermediario",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "humming-oitava-e-meia",
    "name": "Humming oitava e meia",
    "phase": "tecnica",
    "focus": "ampliar a extensão com controle",
    "description": "Com 'mmm', deslize uma oitava e meia subindo e voltando, mantendo o zumbido na máscara mesmo no topo. Amplia a extensão sem perder a ressonância frontal ao cruzar a quebra.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "extensao",
      "ressonancia"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "vvv-onda-longa-conexao",
    "name": "'Vvv' onda longa",
    "phase": "tecnica",
    "focus": "conexão suave em curva longa",
    "description": "Com 'vvv', trace uma curva longa que sobe à oitava, recua à quinta e sobe de novo antes de descer, tudo num só fôlego contínuo. A curva longa exige distribuir o ar e emendar os registros sem costura.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0,
      12,
      7,
      12,
      0
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "tongue-trill-arpejo-descendente",
    "name": "'Rrr' arpejo descendente",
    "phase": "tecnica",
    "focus": "descer o arpejo em glissando",
    "description": "Vibre a língua começando na oitava, desça em glissando ligado pelo arpejo até a tônica e suba de volta, sem cortar. Trabalha o controle da descida atravessando registros com o trill soltando a laringe.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      12,
      7,
      4,
      0,
      4,
      7,
      12
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "canudo-messa-di-voce-media",
    "name": "Canudo messa di voce",
    "phase": "tecnica",
    "focus": "cresce e diminui no glissando",
    "description": "Pelo canudo, suba uma quinta crescendo o volume e volte diminuindo (messa di voce em sirene). A resistência do canudo dá controle fino sobre a dinâmica enquanto a voz desliza.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      7,
      0
    ],
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "escala-menor-harmonica-completa",
    "name": "Menor harmônica",
    "phase": "tecnica",
    "focus": "7ª maior e 2ª aumentada",
    "description": "Cante a escala menor harmônica subindo e descendo na vogal 'ó', com atenção especial ao salto de 2ª aumentada entre o 6º (lab) e o 7º (si) graus. Esse intervalo exótico é o teste de afinação do exercício.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      8,
      11,
      12,
      11,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-cromatica-descendente-fina",
    "name": "Cromática descendente",
    "phase": "tecnica",
    "focus": "afinação fina descendo",
    "description": "Desça oito meios-tons cromáticos e volte na vogal 'a', controlando cada semitom para não achatar. Descidas cromáticas expõem tendência a cair — segure o apoio.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      -1,
      -2,
      -3,
      -4,
      -3,
      -2,
      -1,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "escala-maior-messa-di-voce",
    "name": "Maior com messa di voce",
    "phase": "tecnica",
    "focus": "dinâmica por nota sem desafinar",
    "description": "No pentacorde maior, faça messa di voce em cada nota (cresce e diminui) mantendo a altura estável. O desafio é variar o volume sem deixar a afinação subir no forte nem cair no piano.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 2.2,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 32
  },
  {
    "id": "escala-menor-natural-oitava-nay",
    "name": "Menor natural à oitava (nay)",
    "phase": "tecnica",
    "focus": "máscara na escala menor",
    "description": "Cante a menor natural completa na sílaba 'nay', levando o som à máscara em toda a subida e descida. A ressonância nasal mantém os graus abaixados brilhantes e afinados.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      8,
      10,
      12,
      10,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-maior-staccato-agil",
    "name": "Maior staccato ágil",
    "phase": "tecnica",
    "focus": "onset preciso em velocidade",
    "description": "Cante o pentacorde maior em staccato rápido na sílaba 'ga', com ataque limpo e afinado em cada nota. Trabalha coordenação da glote com a altura exata, sem raspar.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "escala-cromatica-oitava-lenta",
    "name": "Cromática de oitava lenta",
    "phase": "tecnica",
    "focus": "12 meios-tons afinados",
    "description": "Suba os doze semitons cromáticos até a oitava, bem devagar na vogal 'a', garantindo que cada meio-tom seja exato. Exercício de precisão milimétrica de afinação.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
    ],
    "holdSec": 0.8,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-maior-nona-estendida",
    "name": "Maior estendida à 9ª",
    "phase": "tecnica",
    "focus": "passar da oitava afinado",
    "description": "Suba a escala maior até a 9ª (re acima da oitava) e volte na vogal 'a', mantendo o apoio na passagem da oitava. Objetivo: estender o alcance sem apertar a nota mais aguda.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      14,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-maior-3-notas-passaggio",
    "name": "Maior 3 notas na passagem",
    "phase": "tecnica",
    "focus": "afinar cruzando o registro",
    "description": "Cante do-re-mi-re-do em blocos curtos na vogal 'ó', posicionados na sua zona de passagem. Mantenha a afinação estável enquanto o registro muda de peito para misto.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-menor-melodica-simplificada",
    "name": "Menor melódica (subida)",
    "phase": "tecnica",
    "focus": "6ª e 7ª elevadas na subida",
    "description": "Suba a menor melódica com 6º e 7º graus elevados (do-re-mib-fa-sol-la-si-do) e desça como menor natural, na vogal 'a'. O contraste entre subida e descida testa muito a afinação.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      9,
      11,
      12,
      10,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "oitava-legato-int",
    "name": "Oitava ligada",
    "phase": "tecnica",
    "focus": "ligar a oitava",
    "description": "Cante fundamental e oitava em legato, mantendo a mesma vogal e ajustando a ressonância no agudo em vez de empurrar a garganta. A oitava atravessa o passaggio, então pense em espaço, não em força.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "oitava-ida-volta-int",
    "name": "Oitava ida e volta",
    "phase": "tecnica",
    "focus": "consolidar a oitava",
    "description": "Alterne fundamental e oitava duas vezes, buscando a mesma altura no topo em cada repetição. Repetir o salto grande estabiliza a passagem de registro sob controle.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      12,
      0,
      12,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-maior-oitava-int",
    "name": "Arpejo maior à oitava",
    "phase": "tecnica",
    "focus": "tríade completa até a oitava",
    "description": "Suba fundamental-terça-quinta-oitava e desça pelo mesmo caminho, ajustando a vogal ao passar do registro médio para o agudo. É o arpejo-mãe do canto ocidental.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-menor-oitava-int",
    "name": "Arpejo menor à oitava",
    "phase": "tecnica",
    "focus": "tríade menor até a oitava",
    "description": "Cante fundamental-terça menor-quinta-oitava e volte, mantendo o brilho no topo apesar do modo menor. Vigie a terça menor, que costuma subir demais em direção à maior.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      3,
      7,
      12,
      7,
      3,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-dominante-int",
    "name": "Arpejo com sétima dominante",
    "phase": "tecnica",
    "focus": "tétrade dominante",
    "description": "Cante fundamental-terça-quinta-sétima menor e volte, a espinha do acorde de resolução gospel. Mantenha a sétima estável para o acorde não perder a cor de dominante.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      10,
      7,
      4,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-maj7-int",
    "name": "Arpejo com sétima maior",
    "phase": "tecnica",
    "focus": "tétrade maj7",
    "description": "Suba fundamental-terça-quinta-sétima maior-oitava, o clima de acorde suspenso e adorativo. A sétima maior é delicada: afine-a colada à oitava, não abaixo dela.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      11,
      12
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "escala-sobe-por-graus-intermediario",
    "name": "Sequência que sobe por graus",
    "phase": "tecnica",
    "focus": "célula ágil que avança degrau a degrau",
    "description": "Repita a célula subindo por graus [0,2,4,2,4,5,7,5,7] no 'ah', deixando cada bloquinho empurrar o próximo pra cima. Mantenha o mesmo peso leve em todas as células conforme sobe.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      4,
      5,
      7,
      5,
      7
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "escala-corrida-nona-intermediario",
    "name": "Corrida até a nona",
    "phase": "tecnica",
    "focus": "escala longa que estende o giro pra cima",
    "description": "Corra [0,2,4,5,7,9,7,5,4,2,0] no 'ah' esticando o giro até a nona e voltando, pensando a subida em duplas velozes. Trabalha resistência de agilidade num arco mais longo que a oitava.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-setima-agil-intermediario",
    "name": "Arpejo da sétima ágil",
    "phase": "tecnica",
    "focus": "salto por quatro notas do acorde",
    "description": "Cante o arpejo [0,4,7,10,7,4,0] no 'ah' subindo até a sétima e voltando em tercinas rápidas. Cada salto precisa cair certeiro no acorde, com o apoio parelho por baixo dos intervalos maiores.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      10,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "messa-di-voce-media-10s",
    "name": "Messa di voce longa",
    "phase": "tecnica",
    "focus": "curva dinâmica ampla",
    "description": "Estenda a messa di voce para 10 segundos, dosando o ar pra não gastar tudo no crescendo e sobrar fôlego no decrescendo final. O controle está em administrar a reserva de ar.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "apoio-supremo-media-10s",
    "name": "Teste de apoio 10s",
    "phase": "tecnica",
    "focus": "nota reta longa sem tremer",
    "description": "Sustente uma nota média reta por 10 segundos inteiros, volume constante e linha perfeitamente lisa. É o teste puro de apoio e economia de ar, sem nenhuma dinâmica pra disfarçar.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "dupla-nota-ligada-quinta-5s",
    "name": "Duas notas ligadas (quinta)",
    "phase": "tecnica",
    "focus": "ligar sem cortar o ar",
    "description": "Sustente a tônica e suba de ligado para a quinta acima, segurando cada uma por 5 segundos numa só respiração. A passagem entre elas deve ser costurada, sem golpe nem quebra de fluxo.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      7
    ],
    "holdSec": 5,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "dupla-nota-messa-terca-6s",
    "name": "Messa dupla em terça",
    "phase": "tecnica",
    "focus": "dinâmica em duas notas",
    "description": "Ligue tônica e terça maior, aplicando uma pequena messa di voce em cada nota ao longo de 6 segundos por nota. Exige controlar dinâmica e mudança de altura ao mesmo tempo.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "vibrato",
      "afinacao"
    ],
    "pattern": [
      0,
      4
    ],
    "holdSec": 6,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 32
  },
  {
    "id": "sustain-aguda-messa-8s",
    "name": "Messa na região aguda",
    "phase": "tecnica",
    "focus": "dinâmica no alto sem apertar",
    "description": "Faça a messa di voce numa nota mais aguda, perto do teto confortável, em 8 segundos, sem deixar o som apertar ao crescer. No agudo, o crescendo tende a puxar tensão: mantenha o espaço.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "respiracao",
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "ee-ih-eh-modificacao-subindo",
    "name": "'Ii' abre subindo",
    "phase": "tecnica",
    "focus": "modificar vogal fechada no agudo",
    "description": "Suba [0,4,7,12] no 'i' e, conforme aperta lá em cima, deixe o 'i' relaxar pra um 'ih' quase 'é'. Se manter o 'i' fechado demais no agudo, a garganta trava — abrir a vogal é o alívio.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      12
    ],
    "holdSec": 0.6,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "vvv-ah-sirene-abre",
    "name": "'Vvv' abre em 'ah'",
    "phase": "tecnica",
    "focus": "da consoante à vogal na sirene",
    "description": "Numa sirene ascendente comece em 'vvv' e abra pra 'ah' no topo, mantendo a vibração dos lábios viva mesmo depois de abrir. A consoante segura o foco enquanto a voz sobe.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "pattern": [
      0,
      7,
      12,
      7,
      0
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "ng-nay-projecao-media",
    "name": "'Ng-nay' projetado",
    "phase": "tecnica",
    "focus": "do foco nasal ao twang",
    "description": "Prepare no 'ng' e solte em 'nay' brilhante na mesma nota, transformando o foco escondido numa projeção que corta. Une colocação nasal com twang de palco.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "pattern": [
      0
    ],
    "holdSec": 5,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "messa-di-voce-nota-pivo-intermediario",
    "name": "Messa di voce na nota-pivô",
    "phase": "tecnica",
    "focus": "crescer e diminuir na nota da quebra",
    "description": "Sustente exatamente a nota-pivô do passaggio e faça messa di voce: comece piano, cresça e volte ao piano sem deixar a voz quebrar na virada. Aprende a mudar de intensidade sem trocar de registro.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 6,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "sirene-larga-oitava-meia-intermediario",
    "name": "Sirene larga de oitava e meia",
    "phase": "tecnica",
    "focus": "varrer a extensão inteira pela quebra",
    "description": "Faça uma sirene contínua de uma oitava e meia em 'ui', varrendo peito, mix e cabeça sem interrupção. Deslizar devagar pela região de mudança treina o cérebro a não travar na virada.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      19,
      0
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "escala-nona-empurra-agudo-intermediario",
    "name": "Escala até a nona",
    "phase": "tecnica",
    "focus": "passar da oitava afinando o ar",
    "description": "Suba a escala além da oitava, chegando na nona, atravessando o passaggio antes do topo. No agudo, modifique a vogal pra 'ó' fechado e afine o fluxo de ar em vez de gritar pra alcançar a nota.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      14,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 32
  },
  {
    "id": "sirene-vogal-aberta-desafio-intermediario",
    "name": "Sirene em vogal aberta",
    "phase": "tecnica",
    "focus": "cruzar a quebra sem a proteção do SOVT",
    "description": "Faça a sirene de oitava na vogal aberta 'á', sem o apoio do lip trill, deslizando pela zona de mudança. Sem a proteção do SOVT você tem que arredondar a boca no agudo pra não apertar — é o teste do controle.",
    "kind": "siren",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "salto-sexta-menor-oito-semitons-intermediario",
    "name": "Salto de sexta menor",
    "phase": "tecnica",
    "focus": "transição num salto incômodo",
    "description": "Pule oito semitons (sexta menor) e volte, na vogal 'ê', centrado na quebra pra forçar a virada num intervalo que cai bem no passaggio. Ajuste a ressonância no topo mantendo o queixo solto.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      8,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "messa-di-voce-onset-niente-int",
    "name": "Messa di voce do silêncio",
    "phase": "tecnica",
    "focus": "onset a partir do niente",
    "description": "Faça a nota nascer do silêncio absoluto, quase inaudível, crescer até o forte e voltar a sumir, tudo na mesma vogal 'a'. O onset do niente exige apoio constante desde antes de o som existir.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "sustain-passaggio-controle-8s",
    "name": "Sustentar no passaggio",
    "phase": "tecnica",
    "focus": "segurar onde a voz quer quebrar",
    "description": "Escolha a nota exata da zona de passagem e sustente 8 segundos sem deixar a voz quebrar nem 'empurrar' pro peito. O controle está em manter a mistura estável justo no ponto frágil.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 34
  },
  {
    "id": "pentatonica-menor-gospel-la",
    "name": "Pentatônica menor gospel",
    "phase": "aplicacao",
    "focus": "sabor de louvor e blue notes",
    "description": "Cante a pentatônica menor (la-do-re-mi-sol) na vogal 'a', base de muitos riffs gospel e de soul. Mantenha a 3ª menor e a 7ª bem afinadas para o groove não perder o chão.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      3,
      5,
      7,
      10,
      7,
      5,
      3,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "arpejo-completo-cruza-registro-intermediario",
    "name": "Arpejo maior pela transição",
    "phase": "aplicacao",
    "focus": "arpejo cantável que cruza a quebra",
    "description": "Cante o arpejo maior subindo até a oitava e voltando, num 'ia' de louvor, cruzando o passaggio no salto da terça pra quinta. Mantenha o brilho da máscara do começo ao fim, como num final de refrão.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "frase-adoracao-melisma-curto",
    "name": "Adoração com melisma",
    "phase": "aplicacao",
    "focus": "Melisma curto de adoração",
    "description": "Uma frase de adoração com um melisma pentatônico menor (dó-mib-fá-mib-ré-dó) em 'ô'. Deslize as notas do melisma coladas, como um suspiro cantado.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      3,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "refrao-pentatonico-maior",
    "name": "Refrão pentatônico",
    "phase": "aplicacao",
    "focus": "Frase de refrão em pentatônica maior",
    "description": "Uma frase de refrão que percorre a pentatônica maior até a sexta e volta (dó-ré-mi-sol-lá-sol-mi-dó). Mantenha o brilho nas notas altas sem apertar.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "frase-entrega-menor-longa",
    "name": "Frase de entrega",
    "phase": "aplicacao",
    "focus": "Contorno menor de entrega",
    "description": "Uma frase longa em pentatônica menor que sobe à quinta e desce em melisma, gesto de entrega. Conduza o ar por toda a frase para não quebrar no fim.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      3,
      5,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "giro-louvor-ornamentado",
    "name": "Giro ornamentado",
    "phase": "aplicacao",
    "focus": "Giro com nota de passagem",
    "description": "Um giro de louvor mais elaborado, com nota de passagem (dó-ré-mi-sol-fá-mi-ré-dó). As passagens devem ligar-se legato, sem interromper o fluxo da frase.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "frase-contemplativa-messa",
    "name": "Frase contemplativa",
    "phase": "aplicacao",
    "focus": "Dinâmica messa di voce na frase",
    "description": "Uma frase contemplativa que cresce e diminui numa nota longa central (messa di voce) antes de resolver. Controle o volume como uma onda: cresça, encha e recolha.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 1.6,
    "difficulty": 3,
    "durationMin": 4,
    "xp": 30
  },
  {
    "id": "sustain-frase-entrega-final",
    "name": "Entrega no final",
    "phase": "aplicacao",
    "focus": "Frase que termina em sustentação",
    "description": "Uma frase de entrega que desce à terça e sustenta ali, fechando com serenidade. Chegue na nota final relaxado e segure-a com apoio até o ar acabar.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      4
    ],
    "holdSec": 5,
    "difficulty": 3,
    "durationMin": 3,
    "xp": 30
  },
  {
    "id": "pentatonica-maior-gospel-riff",
    "name": "Pentatônica maior com levada",
    "phase": "aplicacao",
    "focus": "riff de louvor afinado",
    "description": "Cante a pentatônica maior com balanço, tocando a 6ª (la) como cor e voltando à tônica — a levada de muitos corais gospel. Mantenha cada nota da penta afinada mesmo no groove.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      12,
      9,
      7,
      4,
      2,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "sexta-arpejo-int",
    "name": "Arpejo com sexta",
    "phase": "aplicacao",
    "focus": "cor da sexta no acorde",
    "description": "Cante fundamental-terça-quinta-sexta-quinta, a levada doce e cheia comum em pontes de louvor. A sexta acrescenta calor sem tensão, então deixe-a soar redonda.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      7,
      4,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "salto-quinta-terca-int",
    "name": "Salto quinta-terça",
    "phase": "aplicacao",
    "focus": "riff intervalar gospel",
    "description": "Alterne fundamental-quinta-terça-quinta num balanço de levada, cuidando para cada salto chegar afinado. É um desenho intervalar típico de riff gospel, sem citar nenhuma música.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      4,
      7,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "arpejo-maior-agil-int",
    "name": "Arpejo maior ágil",
    "phase": "aplicacao",
    "focus": "velocidade da tríade",
    "description": "Percorra o arpejo maior à oitava em ritmo mais rápido, mantendo cada nota afinada apesar da velocidade. Prepara para os melismas arpejados de improviso no louvor.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "ponte-climax-oitava",
    "name": "Ponte ao clímax",
    "phase": "aplicacao",
    "focus": "Ponte que sobe à oitava",
    "description": "Uma ponte que sobe da tônica até a oitava com crescendo, preparando o ápice do louvor. Ganhe volume aos poucos e sinta a passagem de registro no caminho.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      11,
      12
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "levada-gospel-saltos",
    "name": "Levada gospel",
    "phase": "aplicacao",
    "focus": "Levada com saltos amplos",
    "description": "Uma levada de banda gospel saltando entre tônica, quinta e quarta (dó-sol-fá-mi-dó-mi-sol). Deixe o ritmo balançar e acerte cada salto com o ar preparado.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      5,
      4,
      0,
      4,
      7
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "sustain-climax-oitava-crescendo",
    "name": "Clímax na oitava",
    "phase": "aplicacao",
    "focus": "Sustentar a oitava com crescendo",
    "description": "Alcance a oitava e sustente-a em 'ah' com um leve crescendo, o auge do louvor. Apoie forte no diafragma e mantenha a nota afinada mesmo no volume máximo.",
    "kind": "sustain",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "extensao"
    ],
    "pattern": [
      12
    ],
    "holdSec": 6,
    "difficulty": 4,
    "durationMin": 3,
    "xp": 32
  },
  {
    "id": "salto-oitava-louvor",
    "name": "Salto de oitava",
    "phase": "aplicacao",
    "focus": "Salto expressivo de oitava",
    "description": "Salte da tônica à oitava e resolva descendo pela pentatônica (dó-DÓ-lá-sol-mi-dó), gesto expressivo de refrão. Prepare o apoio antes do salto largo.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "extensao",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "ponte-passaggio-dinamica",
    "name": "Ponte pelo passaggio",
    "phase": "aplicacao",
    "focus": "Cruzar o passaggio na melodia",
    "description": "Uma frase que cruza a zona de passagem subindo à sétima e volta com dinâmica (dó-mi-sol-si-lá-sol-mi-dó). Modifique levemente a vogal ao passar pela quebra.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      11,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "melisma-adoracao-maior",
    "name": "Melisma de adoração",
    "phase": "aplicacao",
    "focus": "Melisma pentatônico maior",
    "description": "Uma frase de adoração com melisma pentatônico maior descendo do sol (sol-mi-ré-mi-dó) em 'ô'. Deslize as notas do melisma com agilidade e afinação precisa.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      2,
      4,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "levada-tercas-sextas",
    "name": "Levada de terças e sextas",
    "phase": "aplicacao",
    "focus": "Saltos de terça e sexta",
    "description": "Uma levada que alterna saltos de terça e sexta (dó-mi-lá-sol-mi-dó), típica de arranjos vocais gospel. Acerte a sexta com leveza, sem puxar do peito.",
    "kind": "interval",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "frase-celebracao-setima-maior",
    "name": "Celebração resoluta",
    "phase": "aplicacao",
    "focus": "Resolução festiva na sétima maior",
    "description": "Uma frase festiva que sobe pela pentatônica e resolve tocando a sétima maior antes da oitava (dó-mi-sol-lá-si-DÓ). Deixe o si 'puxar' o dó com brilho.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      11,
      12
    ],
    "holdSec": 1.2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "frase-jubilo-agil",
    "name": "Frase de júbilo",
    "phase": "aplicacao",
    "focus": "Agilidade em pentatônica maior",
    "description": "Uma frase ágil de júbilo que corre pela pentatônica maior ida e volta (dó-ré-mi-sol-lá-sol-mi-ré-dó). Mantenha a leveza e a articulação clara em andamento mais rápido.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      7,
      4,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "frase-clamor-crescente",
    "name": "Clamor crescente",
    "phase": "aplicacao",
    "focus": "Frase que cresce ao clímax",
    "description": "Uma frase de clamor que sobe grau a grau com crescendo até a oitava (dó-ré-mi-sol-lá-si-DÓ). Ganhe intensidade progressiva e chegue no topo com apoio firme.",
    "kind": "scale",
    "level": "intermediario",
    "skills": [
      "sustentacao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      11,
      12
    ],
    "holdSec": 1.1,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 32
  },
  {
    "id": "nona-legato-adv",
    "name": "Nona ligada",
    "phase": "aquecimento",
    "focus": "estender além da oitava",
    "description": "Salte do fundamental à nona (oitava mais um tom) em legato, expandindo a extensão sem estrangular o agudo. Mantenha a laringe estável e deixe a ressonância abrir espaço.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      14,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 5,
    "durationMin": 2,
    "xp": 48
  },
  {
    "id": "decima-maior-adv",
    "name": "Décima maior",
    "phase": "aquecimento",
    "focus": "salto de décima afinado",
    "description": "Cante fundamental e décima maior (terça acima da oitava), um salto largo que atravessa dois registros. Ajuste a modificação da vogal no agudo em vez de empurrar a garganta.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      16,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 5,
    "durationMin": 2,
    "xp": 48
  },
  {
    "id": "salto-oitava-descendente-controle-avancado",
    "name": "Oitava descendente controlada",
    "phase": "tecnica",
    "focus": "entrar no peito de cima com freio",
    "description": "Do alto da cabeça, salte uma oitava direto pra baixo e sustente, freando a chegada pra pousar no peito com controle em vez de despencar. Manter a leveza na descida evita o baque grave e mantém a linha limpa.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      12,
      0,
      12,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 46
  },
  {
    "id": "vibrato-extensao-estreito-amplo-media",
    "name": "Vibrato estreito e amplo",
    "phase": "tecnica",
    "focus": "modular a extensão da oscilação",
    "description": "Na mesma nota média, comece com vibrato estreito (oscilação pequena) e abra gradualmente para amplo, depois volte a estreitar — controle a EXTENSÃO da oscilação mantendo a afinação central estável.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 9,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "vibrato-taxa-controlada-5hz-media",
    "name": "Vibrato na taxa certa",
    "phase": "tecnica",
    "focus": "aproximar a taxa de ~5-6 Hz",
    "description": "Sustente uma nota média buscando um vibrato regular e apoiado, nem lento demais (bamboleio) nem rápido demais (tremor) — mire uma pulsação estável em torno de cinco a seis oscilações por segundo, sempre sobre o ar.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "vibrato-escala-taxa-variando-agudo",
    "name": "Escala variando a taxa",
    "phase": "tecnica",
    "focus": "controlar taxa nota a nota",
    "description": "Numa escala descendente, sustente cada nota alterando a taxa do vibrato entre lento e mais rápido de forma consciente — treina modular a velocidade da oscilação sob demanda em alturas diferentes.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "vibrato",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 2,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "oitava-staccato-adv",
    "name": "Oitavas em staccato",
    "phase": "tecnica",
    "focus": "ataque limpo na oitava",
    "description": "Dispare fundamental e oitava em staccato, com onset suave mesmo no agudo através do passaggio. Exige coordenação precisa de glote e apoio para não bater a nota alta.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      12,
      0,
      12,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 3,
    "xp": 48
  },
  {
    "id": "arpejo-oitava-nona-adv",
    "name": "Arpejo até a nona",
    "phase": "tecnica",
    "focus": "tríade estendida à nona",
    "description": "Suba fundamental-terça-quinta-oitava-nona e desça, sustentando o apoio no ponto mais agudo. Ajuste a ressonância no topo em vez de forçar, pois o salto cruza o segundo passaggio.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      14,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.7,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "arpejo-dominante-agil-adv",
    "name": "Arpejo dominante ágil",
    "phase": "tecnica",
    "focus": "tétrade rápida e afinada",
    "description": "Percorra fundamental-terça-quinta-sétima menor-oitava em velocidade, com cada nota nítida no melisma. Trabalha agilidade intervalar sobre o acorde de resolução gospel.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      10,
      12,
      10,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "zigzag-agilidade-adv",
    "name": "Saltos em zigue-zague",
    "phase": "tecnica",
    "focus": "agilidade entre saltos",
    "description": "Cante o desenho fundamental-quinta-segunda-sexta-terça-fundamental, alternando direções sem perder o centro tonal. Cada mudança de direção testa se o ouvido segura a referência.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      2,
      9,
      4,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 5,
    "durationMin": 3,
    "xp": 48
  },
  {
    "id": "zigzag-oitava-adv",
    "name": "Zigue-zague com oitava",
    "phase": "tecnica",
    "focus": "amplitude e agilidade",
    "description": "Salte fundamental-oitava-quinta-nona-sexta-fundamental, combinando amplitude e mudança de direção. Mantenha a laringe estável e ajuste vogais ao cruzar o registro agudo.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      7,
      14,
      9,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "sirene-decima-segunda-alta-avancado",
    "name": "Sirene na quebra superior",
    "phase": "tecnica",
    "focus": "cruzar o segundo passaggio (cabeça-falsete)",
    "description": "Faça a sirene de quinta+oitava (décima segunda) centrada bem no alto, cruzando a segunda passagem entre cabeça e falsete. Afine o ar e estreite a vogal pra manter o corpo do som sem virar sopro.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      7,
      19,
      7
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "salto-oitava-meia-decimo-quinto-avancado",
    "name": "Salto de oitava e meia",
    "phase": "tecnica",
    "focus": "forçar a transição num salto extremo",
    "description": "Salte quinze semitons (oitava mais uma quarta) e volte, na vogal 'a', atravessando peito, mix e cabeça de uma vez. Prepare a ressonância antes do pulo e chegue no topo com a vogal já modificada, sem gritar.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      0,
      15,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "messa-di-voce-agudo-passaggio-avancado",
    "name": "Messa di voce acima da quebra",
    "phase": "tecnica",
    "focus": "dinâmica na primeira nota de cabeça",
    "description": "Sustente a primeira nota logo acima do passaggio e faça messa di voce completa: do piano ao forte e de volta, sem deixar o mix escorregar pro peito nem estourar pro grito. Controle fino de pressão na costura.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "escala-cromatica-lenta-quebra-avancado",
    "name": "Aproximação cromática da quebra",
    "phase": "tecnica",
    "focus": "passar semitom a semitom pela virada",
    "description": "Suba cromaticamente entrando na zona de mudança nota por nota, na vogal 'u', ajustando micro-cores a cada semitom pra que a virada seja imperceptível. O detalhe de afinar cada passo elimina o degrau do registro.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      1,
      2,
      3,
      4,
      5,
      4,
      3,
      2,
      1,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "vibrato-passaggio-estavel-agudo",
    "name": "Vibrato cruzando o passaggio",
    "phase": "tecnica",
    "focus": "oscilação estável na zona de registro",
    "description": "Suba com vibrato até uma nota na região do passaggio e sustente-a mantendo a oscilação regular ao cruzar a mudança de registro — não deixe o vibrato travar nem acelerar na transição.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "vibrato",
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 7,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "vibrato-messa-di-voce-taxa-aguda",
    "name": "Clímax: dinâmica e taxa juntas",
    "phase": "tecnica",
    "focus": "dinâmica e controle de taxa no agudo",
    "description": "Numa nota aguda, faça messa di voce mantendo o vibrato constante e a taxa firme mesmo no forte do clímax — combine o crescendo com uma oscilação apoiada que não desanda em tremor ao encher o som.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "vibrato",
      "sustentacao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 9,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "vvv-sirene-livre-total",
    "name": "'Vvv' sirene total livre",
    "phase": "aplicacao",
    "focus": "fluxo econômico em todo o range",
    "description": "Com 'vvv', faça sirenes livres varrendo toda a extensão, sem pattern, mantendo o mesmo esforço mínimo do grave ao agudo. A oclusão sustenta a economia de ar mesmo nas notas altas de sustentação gospel.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "sustentacao"
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "humming-falsete-conexao",
    "name": "Humming conectando falsete",
    "phase": "aplicacao",
    "focus": "mistura suave até o falsete",
    "description": "Com 'mmm', faça sirenes que cruzam do peito à mista e ao falsete e voltam, mantendo o zumbido na máscara em todo o trajeto. Suaviza a passagem pro falsete preservando ressonância pra frases delicadas de louvor.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "passaggio",
      "extensao"
    ],
    "pattern": [
      12,
      0,
      12
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "ah-oh-arredonda-teto",
    "name": "'Ah' arredonda no teto",
    "phase": "aplicacao",
    "focus": "modificar vogal aberta no agudo",
    "description": "Suba [0,5,7,12] numa frase de louvor em 'ah' e, chegando no topo, arredonde pra 'oh' pra tirar a pressão do agudo. Assim o clímax da adoração soa cheio, não gritado.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "ressonancia",
      "passaggio"
    ],
    "pattern": [
      0,
      5,
      7,
      12
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 46
  },
  {
    "id": "staccato-arpejo-agil-cravado-avc",
    "name": "Staccato ágil de arpejo",
    "phase": "aplicacao",
    "focus": "ataques rápidos e precisos",
    "description": "Cante o arpejo estendido em staccato bem curto e ágil, cravando cada nota com precisão de afinação e silêncio limpo entre elas. Mantenha o corpo do apoio ativo enquanto a garganta permanece livre.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "respiracao",
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "onset-escala-staccato-veloz-avc",
    "name": "Escala staccato veloz",
    "phase": "aplicacao",
    "focus": "reataque limpo em velocidade",
    "description": "Percorra a escala em staccato rápido, reatacando cada grau com clareza mesmo em andamento ágil, ideal para levadas gospel de louvor animado. O silêncio entre notas define o brilho do ataque.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "vibrato-sirene-onda-controlada-agudo",
    "name": "Sirene com onda de vibrato",
    "phase": "aplicacao",
    "focus": "vibrato expressivo em levada gospel",
    "description": "Suba em sirene até o clímax agudo e sustente-o com um vibrato amplo e apoiado, deslizando de volta ao médio — a onda de oscilação no ápice dá o sabor de sustentação de louvor sem forçar a garganta.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "vibrato",
      "sustentacao",
      "extensao"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 4,
    "durationMin": 4,
    "xp": 46
  },
  {
    "id": "frase-adoracao-legato-longo",
    "name": "Adoração em legato",
    "phase": "aplicacao",
    "focus": "Legato longo e conectado",
    "description": "Uma frase contemplativa longa toda ligada em legato, subindo à sexta e descendo suave (dó-mi-sol-lá-sol-fá-mi-ré-dó). Nenhuma nota deve 'separar' da próxima — respire só no fim.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 4,
    "durationMin": 5,
    "xp": 46
  },
  {
    "id": "ciclos-longos-resistencia-avancado",
    "name": "Ciclos longos de resistência",
    "phase": "aplicacao",
    "focus": "fôlego para frases extensas",
    "description": "Encadeie inspirações profundas e expirações em 'sss' de 20s ou mais por vários ciclos, mantendo o volume até o último instante. Prepara o fôlego para frases longas de louvor sustentado.",
    "kind": "breathing",
    "level": "avancado",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "box-8-8-8-8-avancado",
    "name": "Caixa 8-8-8-8",
    "phase": "aplicacao",
    "focus": "controle sob ciclo longo",
    "description": "Sustente o box breathing em 8s por fase mantendo o tronco expandido e a mente calma nas retenções. Consolida um apoio estável mesmo sob demanda prolongada.",
    "kind": "breathing",
    "level": "avancado",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "apoio-clima-crescente-gospel",
    "name": "Apoio de clímax crescente",
    "phase": "aplicacao",
    "focus": "pressão para o auge da frase",
    "description": "Simule uma frase de louvor soprando 'fff' baixo e crescendo continuamente a pressão até um ápice sustentado, como no clímax de um refrão. Coordena o apoio com a curva emocional da frase.",
    "kind": "breathing",
    "level": "avancado",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "apoio-frase-melodica-mental",
    "name": "Apoio na frase mental",
    "phase": "aplicacao",
    "focus": "apoio↔desenho da melodia",
    "description": "Cante mentalmente uma frase de louvor enquanto sopra 'sss', variando a pressão conforme as subidas e sustentações imaginadas. Amarra o apoio ao desenho melódico real.",
    "kind": "breathing",
    "level": "avancado",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "staccato-legato-alternado-avancado",
    "name": "Staccato e legato do ar",
    "phase": "aplicacao",
    "focus": "trocar de textura de apoio",
    "description": "Alterne dentro de um fôlego: pulsos 'hã' em staccato e depois um 'sss' longo em legato, sem respirar entre eles. Treina a troca ágil de textura de apoio dentro de uma mesma frase.",
    "kind": "breathing",
    "level": "avancado",
    "skills": [
      "respiracao",
      "sustentacao"
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "lip-trill-range-total",
    "name": "Lip trill range total",
    "phase": "aplicacao",
    "focus": "varrer toda a extensão",
    "description": "Faça vibrar os lábios e deslize do grave mais baixo confortável até o topo do agudo em uma só sirene ampla, e volte. Varre o range inteiro num gesto só, testando a continuidade de ponta a ponta.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      12,
      7,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "ng-ate-falsete",
    "name": "'Ng' até o falsete",
    "phase": "aplicacao",
    "focus": "entrar no falsete sem quebra",
    "description": "Com 'ng', deslize uma sirene ampla que sobe além do passaggio até o falsete e retorna, sem 'estalo' na transição. Treina a entrada e saída suave do falsete, essencial pra platôs de louvor no clímax.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "canudo-range-total-economia",
    "name": "Canudo range total",
    "phase": "aplicacao",
    "focus": "economia máxima no range inteiro",
    "description": "Pelo canudo, deslize devagar do grave ao agudo extremo e volte, sentindo a straw phonation segurar a pressão nas notas mais altas. Prepara a voz pra clímax longos gastando o mínimo de ar.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "sustentacao"
    ],
    "pattern": [
      0,
      12,
      7,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "tongue-trill-ondas-agudas",
    "name": "'Rrr' ondas no agudo",
    "phase": "aplicacao",
    "focus": "agilidade no registro alto",
    "description": "Vibre a língua e faça ondas rápidas na região aguda (sobe à quinta, volta, sobe à oitava, volta) já acima do passaggio, sem perder o vibrado. Treina a mobilidade pra riffs e melismas de louvor no alto.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      7,
      0,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "lip-trill-climax-sustentado",
    "name": "Lip trill rumo ao clímax",
    "phase": "aplicacao",
    "focus": "subir e segurar o ápice",
    "description": "Faça vibrar os lábios subindo em glissando pelo arpejo até a oitava, segure brevemente o topo e desça, simulando a construção de um clímax de adoração. Une conexão de registros com preparo pra sustentar o ápice.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "zzz-varredura-descendente",
    "name": "'Zzz' varredura descendente",
    "phase": "aplicacao",
    "focus": "controlar a descida do topo",
    "description": "Com 'zzz', comece no agudo extremo, desça em varredura lenta por todo o range e suba de volta, controlando cada trecho da quebra. A oclusão segura a pressão pra descer do clímax sem 'sentar' a voz.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio"
    ],
    "pattern": [
      12,
      7,
      0,
      7,
      12
    ],
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "canudo-multiplas-ondas-total",
    "name": "Canudo ondas amplas",
    "phase": "aplicacao",
    "focus": "resistência em ondas de range total",
    "description": "Pelo canudo, faça ondas amplas percorrendo quase todo o range (sobe à quinta, volta, sobe à oitava e além, volta) num só fôlego. Trabalha fôlego, economia e continuidade para levadas longas de adoração.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "extensao",
      "sustentacao"
    ],
    "pattern": [
      0,
      7,
      0,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "escala-maior-oitava-agil-avancado",
    "name": "Maior à oitava ágil",
    "phase": "aplicacao",
    "focus": "agilidade limpa na oitava",
    "description": "Percorra a escala maior à oitava em andamento rápido na vogal 'a', ligando tudo sem borrar nenhum grau. O foco é agilidade com afinação impecável em cima e embaixo.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "ressonancia",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-cromatica-oitava-agil",
    "name": "Cromática ágil à oitava",
    "phase": "aplicacao",
    "focus": "12 meios-tons em velocidade",
    "description": "Suba e desça os doze semitons cromáticos rápido na vogal 'a', mantendo cada meio-tom exato mesmo em velocidade. Máximo teste de precisão e agilidade de afinação.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao"
    ],
    "pattern": [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      11,
      10,
      9,
      8,
      7,
      6,
      5,
      4,
      3,
      2,
      1,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-menor-harmonica-agil",
    "name": "Menor harmônica ágil",
    "phase": "aplicacao",
    "focus": "2ª aumentada em velocidade",
    "description": "Cante a menor harmônica rápido na vogal 'i', mantendo afinado o salto de 2ª aumentada entre o 6º e o 7º grau. A velocidade não pode borrar esse intervalo característico.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      3,
      5,
      7,
      8,
      11,
      12,
      11,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-maior-nona-messa-di-voce",
    "name": "Maior à 9ª com dinâmica",
    "phase": "aplicacao",
    "focus": "extensão, dinâmica e afinação",
    "description": "Suba a escala maior até a 9ª fazendo messa di voce na nota mais aguda antes de descer, tudo na vogal 'a'. Combina extensão, controle de dinâmica e afinação sob pressão.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao",
      "sustentacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      14,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "pentatonica-menor-melisma-gospel",
    "name": "Pentatônica menor em melisma",
    "phase": "aplicacao",
    "focus": "riff melismático de louvor",
    "description": "Percorra a pentatônica menor com idas e voltas rápidas, imitando um melisma gospel sobre a tônica. Cada nota do riff precisa cair afinada mesmo na correria.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      3,
      5,
      7,
      5,
      3,
      10,
      7,
      5,
      3,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-maior-passaggio-avancado",
    "name": "Maior cruzando o passaggio",
    "phase": "aplicacao",
    "focus": "escala inteira sobre a passagem",
    "description": "Cante a escala maior à oitava posicionada em cima da sua zona de passagem, na sílaba 'nay', mantendo timbre e afinação constantes. O desafio é atravessar o registro sem quebra nem desvio.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.6,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "escala-maior-vogais-mistas-agil",
    "name": "Maior à oitava com vogais",
    "phase": "aplicacao",
    "focus": "modificação vocálica em velocidade",
    "description": "Suba e desça a escala maior à oitava trocando de vogal a cada grau (a-e-i-o-u ciclando), em andamento rápido. Trabalha equalização vocálica e afinação simultâneas em alta demanda.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-menor-natural-agil-descendente",
    "name": "Menor natural ágil descendente",
    "phase": "aplicacao",
    "focus": "descida menor sem achatar",
    "description": "Desça a menor natural da oitava até a tônica em andamento rápido na vogal 'ó', segurando o apoio para não cair de afinação. Descidas ágeis em modo menor são traiçoeiras — mantenha o centro.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "sustentacao"
    ],
    "pattern": [
      12,
      10,
      8,
      7,
      5,
      3,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-maior-decima-extensao",
    "name": "Maior estendida à 10ª",
    "phase": "aplicacao",
    "focus": "alcance amplo afinado",
    "description": "Suba a escala maior até a 10ª (mi acima da oitava) e volte na vogal 'a', apoiando bem a passagem para o agudo. Estica a extensão exigindo que a nota mais alta permaneça afinada e livre.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "extensao",
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      14,
      16,
      14,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "arpejo-maj7-agil-adv",
    "name": "Arpejo maj7 ágil",
    "phase": "aplicacao",
    "focus": "melisma sobre maj7",
    "description": "Percorra fundamental-terça-quinta-sétima maior-oitava rápido e de volta, o clima suspenso de clímax adorativo. A sétima maior é traiçoeira em velocidade: afine-a colada à oitava.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      11,
      12,
      11,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "riff-melismatico-adv",
    "name": "Riff melismático gospel",
    "phase": "aplicacao",
    "focus": "virada intervalar de clímax",
    "description": "Cante fundamental-quinta-oitava-sexta-oitava-quinta num floreio de virada, o tipo de riff que enche o clímax de um louvor. Cada salto precisa cair afinado apesar da velocidade e da altura.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      7,
      12,
      9,
      12,
      7,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "salto-decima-arpejo-adv",
    "name": "Arpejo com salto de décima",
    "phase": "aplicacao",
    "focus": "clímax largo e sustentado",
    "description": "Suba fundamental-quinta-oitava-décima, sustente o topo e desça em arpejo, um gesto de clímax de louvor. Sustente a nota mais aguda com apoio e ressonância aberta, sem pressão de garganta.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0,
      7,
      12,
      16,
      12,
      7,
      0
    ],
    "holdSec": 0.9,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "coloratura-longa-ah-avancado",
    "name": "Coloratura longa no 'ah'",
    "phase": "aplicacao",
    "focus": "corrida diatônica extensa e veloz",
    "description": "Corra a coloratura [0,2,4,5,7,9,11,12,11,9,7,5,4,2,0] no 'ah' num só fôlego, mantendo o holdSec baixíssimo e o ar parelho da base ao topo. É a escala corrida completa da oitava com apoio que não deixa nenhuma nota afundar.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "melisma-gospel-longo-avancado",
    "name": "Melisma gospel longo",
    "phase": "aplicacao",
    "focus": "virada pentatônica extensa de louvor",
    "description": "Cante a virada longa [0,3,5,7,5,3,0,3,5,3,0] no 'ah' com o suingue de louvor, deixando a pentatônica girar e resolver como num clímax de adoração. Segure o ar parelho pra levada não perder o balanço no fim.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      3,
      5,
      7,
      5,
      3,
      0,
      3,
      5,
      3,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "tercina-arpejo-oitava-avancado",
    "name": "Tercinas de arpejo à oitava",
    "phase": "aplicacao",
    "focus": "arpejo em tercinas cobrindo a oitava",
    "description": "Cante [0,4,7,12,7,4,0,4,7,4,0] no 'ah' em tercinas velozes, tocando o arpejo até a oitava e voltando em ondas. Trabalha a coloratura de saltos amplos com holdSec baixo e apoio segurando o ar parelho.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "escala-sobe-graus-longa-avancado",
    "name": "Sequência longa por graus",
    "phase": "aplicacao",
    "focus": "células que sobem e voltam por toda a escala",
    "description": "Repita as células subindo [0,2,4,2,4,5,7,5,7,9,7,9] no 'ah' e depois desça pelo mesmo caminho, mantendo cada bloco no mesmo peso leve. Treina resistência de agilidade num arco longo sem perder a leveza da laringe.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      2,
      4,
      5,
      7,
      5,
      7,
      9,
      7,
      9
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "turn-encadeado-veloz-avancado",
    "name": "Turns encadeados velozes",
    "phase": "aplicacao",
    "focus": "vários ornamentos em cadeia rápida",
    "description": "Encadeie os turns [0,2,0,-1,0,2,4,2,0,-1,0] no 'ee' em quiálteras rápidas, girando ao redor de duas notas centrais sem parar. Coloratura fina de vizinhança que exige laringe solta e ar constante.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      0,
      -1,
      0,
      2,
      4,
      2,
      0,
      -1,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "melisma-pentatonico-climax-avancado",
    "name": "Melisma de clímax pentatônico",
    "phase": "aplicacao",
    "focus": "giro pentatônico subindo ao clímax",
    "description": "Cante [0,2,4,7,9,7,4,2,0,2,4,2,0] no 'ah' com o giro de louvor subindo até o clímax na nona e resolvendo de volta à tônica. Sabor gospel de virada rápida que sustenta o brilho no topo com apoio firme.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      2,
      4,
      7,
      9,
      7,
      4,
      2,
      0,
      2,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "arpejo-quinta-oitava-veloz-avancado",
    "name": "Saltos de quinta e oitava",
    "phase": "aplicacao",
    "focus": "coloratura de saltos amplos encadeados",
    "description": "Cante [0,7,12,7,0,4,7,4,0] no 'ah' encadeando salto de quinta, oitava e o arpejo de volta em tercinas rápidas. Cada intervalo largo tem que cair afinado com o ar parelho segurando os saltos.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      7,
      12,
      7,
      0,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "coloratura-mista-final-avancado",
    "name": "Coloratura mista final",
    "phase": "aplicacao",
    "focus": "corrida, salto e virada num só fôlego",
    "description": "Cante [0,4,5,7,9,7,5,4,2,4,7,4,0] no 'ah' juntando corrida diatônica, salto de arpejo e virada pentatônica num único fôlego de coloratura. É o exercício-síntese da categoria: laringe ágil, apoio parelho e nenhuma nota afundando até a resolução.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "respiracao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      5,
      7,
      9,
      7,
      5,
      4,
      2,
      4,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "messa-di-voce-completa-12s",
    "name": "Messa di voce máxima",
    "phase": "aplicacao",
    "focus": "curva dinâmica extrema longa",
    "description": "Execute a messa di voce completa em 12 segundos com amplitude dinâmica extrema, do pianíssimo ao fortíssimo e de volta, afinação absolutamente intocada. É o teste supremo de apoio e controle.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 12,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "diminuendo-forte-pianissimo-10s",
    "name": "Diminuendo ao pianíssimo",
    "phase": "aplicacao",
    "focus": "decrescendo puro extremo",
    "description": "Comece no forte pleno e reduza continuamente até o pianíssimo mais fino em 10 segundos, sem que a nota trema ou perca afinação no fio final. O apoio precisa segurar exatamente quando o som quase some.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "crescendo-niente-forte-10s",
    "name": "Crescendo do nada ao forte",
    "phase": "aplicacao",
    "focus": "crescendo puro do niente",
    "description": "Faça o inverso: comece no fio de voz quase inaudível e cresça de forma perfeitamente linear até o forte em 10 segundos, sem 'estourar' o começo. O onset deve nascer do silêncio, não de um ataque.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "filar-o-som-niente-12s",
    "name": "Filar o som (dal niente)",
    "phase": "aplicacao",
    "focus": "afinar do nada e voltar ao nada",
    "description": "Filando o som: emerja do silêncio total, sustente e afine 12 segundos, e desapareça de volta ao silêncio, sem nenhuma quebra perceptível na entrada nem na saída. É a arte italiana do 'filar' aplicada à afinação pura.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 12,
    "difficulty": 5,
    "durationMin": 6,
    "xp": 48
  },
  {
    "id": "sustain-vibrato-regular-aguda-10s",
    "name": "Vibrato regular no agudo",
    "phase": "aplicacao",
    "focus": "vibrato constante em nota alta",
    "description": "Sustente uma nota aguda por 10 segundos com vibrato regular e uniforme do início ao fim, sem acelerar nem alargar a oscilação. O vibrato deve ser a assinatura estável da nota, não um efeito instável.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "vibrato",
      "afinacao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "climax-louvor-sustentado-10s",
    "name": "Clímax de louvor sustentado",
    "phase": "aplicacao",
    "focus": "segurar a nota alta do clímax",
    "description": "Sustente a nota alta de clímax como no ápice de um louvor congregacional, 10 segundos crescendo até o forte pleno e liberando vibrato, sem apertar nem baixar a afinação. Simula aquele momento de entrega no ponto mais alto da canção.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "vibrato",
      "ressonancia"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "sustentacao-adoracao-messa-terca-8s",
    "name": "Adoração ligada em terça",
    "phase": "aplicacao",
    "focus": "dinâmica em frase de adoração",
    "description": "Ligue tônica e terça com messa di voce em cada nota, evocando a sustentação intimista de um momento de adoração, 8 segundos por nota numa só respiração. Trabalhe a entrega emocional sem perder o controle técnico da dinâmica.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "vibrato",
      "respiracao"
    ],
    "pattern": [
      0,
      4
    ],
    "holdSec": 8,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "messa-passaggio-avancado-10s",
    "name": "Messa no passaggio",
    "phase": "aplicacao",
    "focus": "dinâmica extrema na quebra",
    "description": "Aplique a messa di voce completa exatamente na nota de passagem em 10 segundos, controlando volume e mistura ao mesmo tempo no ponto mais instável da voz. É onde apoio, registro e dinâmica se testam juntos.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "passaggio",
      "respiracao"
    ],
    "pattern": [
      0
    ],
    "holdSec": 10,
    "difficulty": 5,
    "durationMin": 6,
    "xp": 48
  },
  {
    "id": "dupla-sustentacao-oitava-forte-6s",
    "name": "Oitava sustentada em clímax",
    "phase": "aplicacao",
    "focus": "ligar oitava sustentando o topo",
    "description": "Ligue a tônica à oitava acima e sustente o topo por 6 segundos em forte pleno com vibrato liberado, como a subida ao clímax de um refrão de louvor. A oitava deve chegar aberta e apoiada, sem gritar.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "extensao",
      "vibrato"
    ],
    "pattern": [
      0,
      12
    ],
    "holdSec": 6,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "nay-riff-gospel-agudo",
    "name": "Twang no riff gospel",
    "phase": "aplicacao",
    "focus": "projeção com melisma",
    "description": "Cante um riff ágil [0,4,7,5,4,2,0] em 'nay' mantendo o brilho do twang em cada nota do melisma. É o timbre que faz o adlib gospel cortar a banda sem microfone gritando.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "ressonancia",
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      4,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "sustain-climax-ah-oh-longo",
    "name": "Clímax sustentado",
    "phase": "aplicacao",
    "focus": "segurar nota alta modificando",
    "description": "Segure a nota alta do clímax começando em 'ah' e arredondando pra 'oh' conforme sustenta, distribuindo o ar pra não apertar. É a nota longa de entrega da adoração.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "ressonancia",
      "sustentacao",
      "passaggio"
    ],
    "pattern": [
      0
    ],
    "holdSec": 8,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "ee-ih-passaggio-cruzando",
    "name": "Vogal no passaggio",
    "phase": "aplicacao",
    "focus": "modificar cruzando a quebra",
    "description": "Suba uma frase [0,5,7,9,12] em 'ii' e vá abrindo pra 'ih'/'eh' exatamente na zona de quebra pra atravessar o passaggio liso. A vogal certa na hora certa é o que evita o 'gogó'.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      5,
      7,
      9,
      12
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "sirene-vvv-passaggio-completo",
    "name": "Sirene cruzando registro",
    "phase": "aplicacao",
    "focus": "vibração através do passaggio",
    "description": "Faça uma sirene longa em 'vvv' subindo uma oitava e meia, sentindo a vibração migrar e sem deixar a voz quebrar na passagem de registro. Suaviza a transição peito-cabeça pro louvor fluido.",
    "kind": "siren",
    "level": "avancado",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      12,
      19,
      12,
      0
    ],
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "frase-louvor-vogais-mascara",
    "name": "Frase de louvor na máscara",
    "phase": "aplicacao",
    "focus": "aplicar colocação na melodia",
    "description": "Cante uma frase melódica de adoração [0,2,4,5,7,5,4] em vogais abertas mantendo tudo à frente na máscara, modificando o topo pra não perder o brilho. Junta ressonância, modificação e emoção numa levada gospel.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "ressonancia",
      "passaggio",
      "afinacao"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      5,
      4
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 6,
    "xp": 48
  },
  {
    "id": "escala-decima-vogal-aberta-avancado",
    "name": "Escala até a décima aberta",
    "phase": "aplicacao",
    "focus": "subir alto em vogal aberta de clímax",
    "description": "Suba a escala até a décima na vogal aberta 'a', como num clímax de louvor, cruzando o passaggio antes do topo. Sustente a última nota afinando o ar e alargando a máscara — som de refrão que abre, não que grita.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      2,
      4,
      5,
      7,
      9,
      11,
      12,
      14,
      16,
      14,
      12,
      11,
      9,
      7,
      5,
      4,
      2,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 6,
    "xp": 48
  },
  {
    "id": "riff-gospel-cruza-mix-avancado",
    "name": "Levada gospel pelo mix",
    "phase": "aplicacao",
    "focus": "melisma que dança sobre a quebra",
    "description": "Cante um riff ágil que sobe e desce ao redor da nota-pivô, com sabor de virada gospel, mantendo o mix estável enquanto as notas dançam sobre o passaggio. A agilidade não pode fazer a voz quebrar na região de mudança.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      7,
      12,
      11,
      9,
      7,
      5,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "frase-louvor-climax-sustentado-avancado",
    "name": "Clímax de louvor sustentado",
    "phase": "aplicacao",
    "focus": "subir ao clímax e segurar acima da quebra",
    "description": "Suba uma frase melódica de louvor que culmina numa nota longa bem acima do passaggio e a sustente com brilho, como o auge de um final de ministração. Chegue no clímax com a vogal modificada e o ar afinado, sustentando sem gritar.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "sustentacao"
    ],
    "pattern": [
      0,
      4,
      7,
      9,
      12,
      14,
      12,
      12
    ],
    "holdSec": 0.9,
    "difficulty": 5,
    "durationMin": 6,
    "xp": 48
  },
  {
    "id": "coup-glotte-controlado-clarim-avc",
    "name": "Coup de glotte controlado",
    "phase": "aplicacao",
    "focus": "ataque cravado sem trauma",
    "description": "Ataque notas repetidas com coup de glotte firme e brilhante, como um clarim, sem nunca cair na dureza ou no aperto. Controle a pressão: potência vem do apoio, clareza vem do onset preciso.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "sustentacao",
      "respiracao"
    ],
    "pattern": [
      0,
      0,
      0,
      0,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "onset-climax-messa-oitava-avc",
    "name": "Ataque de clímax na oitava",
    "phase": "aplicacao",
    "focus": "onset firme no ápice sustentado",
    "description": "Salte à oitava e ataque a nota alta com onset equilibrado, sustentando-a como o clímax de um louvor sem forçar a garganta. Deixe o som crescer do apoio, brilhando sem aperto no ápice.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "respiracao",
      "afinacao"
    ],
    "pattern": [
      12
    ],
    "holdSec": 6,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "onset-arpejo-legato-staccato-alternado-avc",
    "name": "Legato e staccato no arpejo",
    "phase": "aplicacao",
    "focus": "trocar articulação no mesmo gesto",
    "description": "Suba o arpejo em legato ligado e desça em staccato cravado, dominando as duas articulações no mesmo exercício com onsets impecáveis. Serve para frases de louvor que alternam suavidade e ênfase.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "afinacao",
      "respiracao"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 0.5,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "frase-longa-climax-sustentado-maior",
    "name": "Clímax que se segura",
    "phase": "aplicacao",
    "focus": "Frase longa com ápice sustentado",
    "description": "Uma frase longa que sobe à oitava e segura o momento antes de resolver descendo em pentatônica (dó-mi-sol-DÓ...si-lá-sol-mi-dó). Reserve ar para sustentar o ápice antes da descida.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "extensao",
      "sustentacao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      11,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "melisma-agil-pentatonico-menor",
    "name": "Melisma ágil menor",
    "phase": "aplicacao",
    "focus": "Melisma pentatônico menor rápido",
    "description": "Uma frase de adoração com melisma pentatônico menor ágil (dó-mib-fá-solb-fá-mib-dó) em 'ô'. Corra as notas coladas e afinadas, controlando a agilidade pelo apoio, não pela garganta.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "ressonancia"
    ],
    "pattern": [
      0,
      3,
      5,
      6,
      5,
      3,
      0
    ],
    "holdSec": 1,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "frase-passaggio-modificacao-vogal",
    "name": "Passaggio com vogal",
    "phase": "aplicacao",
    "focus": "Modificação de vogal no agudo",
    "description": "Uma frase que cruza o passaggio até a oitava modificando a vogal ('á' vira 'ó') no topo (dó-mi-sol-si-DÓ-si-sol-mi-dó). A modificação abre espaço e evita o aperto na quebra.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "passaggio",
      "ressonancia",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      11,
      12,
      11,
      7,
      4,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "levada-gospel-saltos-amplos",
    "name": "Levada de saltos amplos",
    "phase": "aplicacao",
    "focus": "Saltos amplos rítmicos",
    "description": "Uma levada avançada com saltos amplos entre oitava, quinta e terça (dó-DÓ-sol-lá-sol-mi-dó). Cada salto exige apoio renovado; mantenha o balanço rítmico firme.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "extensao",
      "afinacao"
    ],
    "pattern": [
      0,
      12,
      7,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "sustain-climax-nona-crescendo",
    "name": "Ápice na nona",
    "phase": "aplicacao",
    "focus": "Sustentar acima da oitava",
    "description": "Alcance a nona (ré agudo) e sustente-a em 'ah' com crescendo, o auge extremo do louvor. Chegue com a vogal modificada e mantenha a afinação firme no limite do agudo.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "extensao"
    ],
    "pattern": [
      14
    ],
    "holdSec": 7,
    "difficulty": 5,
    "durationMin": 3,
    "xp": 48
  },
  {
    "id": "frase-dinamica-crescendo-diminuendo",
    "name": "Onda dinâmica",
    "phase": "aplicacao",
    "focus": "Crescendo ao clímax e resolução suave",
    "description": "Uma frase que cresce ao subir ao clímax na oitava e diminui ao resolver (dó-mi-sol-DÓ...sol-mi-dó). Trabalhe a dinâmica como um arco: forte no topo, doce na descida.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "extensao",
      "passaggio"
    ],
    "pattern": [
      0,
      4,
      7,
      12,
      7,
      4,
      0
    ],
    "holdSec": 1.3,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "melisma-riff-gospel-descendente",
    "name": "Riff descendente",
    "phase": "aplicacao",
    "focus": "Riff gospel descendente ágil",
    "description": "Um riff gospel que desce da oitava pela pentatônica com agilidade (DÓ-lá-sol-mi-ré-dó) em 'iê'. Articule cada nota do riff limpa e no tempo, sem borrar as alturas.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      12,
      9,
      7,
      4,
      2,
      0
    ],
    "holdSec": 1,
    "difficulty": 5,
    "durationMin": 4,
    "xp": 48
  },
  {
    "id": "frase-menor-climax-entrega",
    "name": "Entrega no clímax menor",
    "phase": "aplicacao",
    "focus": "Clímax menor sustentado",
    "description": "Uma frase em pentatônica menor que sobe à sétima menor no clímax e resolve descendo (dó-mib-fá-sol-sib-sol-fá-mib-dó). Segure o clímax com peso emocional e resolva com serenidade.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "afinacao",
      "passaggio"
    ],
    "pattern": [
      0,
      3,
      5,
      7,
      10,
      7,
      5,
      3,
      0
    ],
    "holdSec": 1.2,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "levada-jubilo-tercas-quintas",
    "name": "Júbilo em saltos",
    "phase": "aplicacao",
    "focus": "Levada ágil de terças e quintas",
    "description": "Uma levada jubilosa e rápida com terças e quintas encadeadas (dó-mi-sol-mi-fá-lá-sol-mi-dó). Mantenha a precisão dos saltos mesmo no andamento animado.",
    "kind": "interval",
    "level": "avancado",
    "skills": [
      "afinacao",
      "extensao"
    ],
    "pattern": [
      0,
      4,
      7,
      4,
      5,
      9,
      7,
      4,
      0
    ],
    "holdSec": 1,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "frase-ponte-climax-oitava-melisma",
    "name": "Ponte com melisma no topo",
    "phase": "aplicacao",
    "focus": "Ponte ao clímax com melisma agudo",
    "description": "Uma ponte que sobe ao clímax na oitava e ornamenta o topo com um melisma antes de resolver (dó-sol-si-DÓ-lá-si-sol-mi-dó). O melisma no agudo exige apoio extra e vogal aberta.",
    "kind": "scale",
    "level": "avancado",
    "skills": [
      "extensao",
      "passaggio",
      "ressonancia"
    ],
    "pattern": [
      0,
      7,
      11,
      12,
      9,
      11,
      7,
      4,
      0
    ],
    "holdSec": 1.1,
    "difficulty": 5,
    "durationMin": 5,
    "xp": 48
  },
  {
    "id": "sustain-messa-di-voce-avancado",
    "name": "Messa di voce no ápice",
    "phase": "aplicacao",
    "focus": "Messa di voce em nota aguda longa",
    "description": "Sustente a quinta aguda em 'ah' fazendo messa di voce completa: comece pianíssimo, cresça ao máximo e recolha ao silêncio. Domínio total do fluxo de ar do início ao fim.",
    "kind": "sustain",
    "level": "avancado",
    "skills": [
      "sustentacao",
      "ressonancia",
      "afinacao"
    ],
    "pattern": [
      7
    ],
    "holdSec": 8,
    "difficulty": 5,
    "durationMin": 3,
    "xp": 48
  }
]
