import { TrackLevel } from './types'

// Espinhas CURADAS por nível — a sequência ordenada de exercícios que forma o
// "caminho" guiado (estilo Duolingo) de cada trilha. Curadas por um painel
// pedagógico (workflow canto-curadoria-trilhas: 3 filosofias — bel canto,
// gospel aplicado e engajamento Duolingo — → juiz → crítica adversarial) sobre
// a biblioteca de ~300. Ordem = jornada do aluno; arco aquecimento→técnica→
// aplicação de louvor, rampa de dificuldade sensata, variedade de kinds.
//
// Fonte da verdade dos IDS: exercise-library.ts. curatedTrackIds() valida cada
// id contra a biblioteca do nível; se este mapa esvaziar/quebrar, cai no
// heurístico (exercises.ts → heuristicTrackIds). Regenerar via o workflow.
export const CURATED_SPINES: Record<TrackLevel, string[]> = {
  // INICIANTE — O aluno comeca no chao absoluto: sente o ar descer no diafragma antes de emitir qualquer som, depois acorda a voz com dois SOVTs (lip trill e humming) que protegem a laringe e ja t
  // 13 nós · dif 1-1-1-1-1-1-1-1-2-2-2-1-2 · kinds {"breathing":1,"siren":3,"sustain":3,"scale":4,"interval":2} · skills 6/7 (respiracao,ressonancia,passaggio,afinacao,sustentacao,extensao) · crítica: ok
  iniciante: [
    'diafragmatica-4s-consciencia', // Diafragma 4s consciente · breathing d1
    'lip-trill-sirene-livre-suave', // Lip trill livre suave · siren d1
    'humming-mmm-quinta-basica', // Humming na quinta · siren d1
    'onset-consciente-uma-nota-do-apoio-ini', // Achar o som limpo · sustain d1
    'nota-reta-media-5s', // Nota reta na média · sustain d1
    'escala-maior-3-notas-legato-mah', // Maior de 3 notas (mah) · scale d1
    'terca-maior-legato-ini', // Terça maior ligada · interval d1
    'sirene-labial-cruza-passaggio-iniciante', // Sirene de lip trill pela quebra · siren d1
    'escala-maior-5-notas-legato-o', // Maior de 5 notas (ó) · scale d2
    'quinta-justa-legato-ini', // Quinta justa ligada · interval d2
    'giro-pentatonico-curto-iniciante', // Virada pentatônica curta · scale d2
    'louvor-frase-abertura-maior', // Frase de abertura · scale d1
    'sustain-amem-tonica', // Amém sustentado · sustain d2
  ],

  // INTERMEDIARIO — O nivel abre com dois aquecimentos SOVT/mascara de baixo atrito (sirene que planta vibrato + 'gee' na mascara) que despertam laringe, ressonancia e afinacao sem cobrar apoio pleno.
  // 13 nós · dif 2-3-3-3-3-3-3-3-3-5-3-3-4 · kinds {"siren":3,"scale":5,"breathing":1,"sustain":4} · skills 7/7 (vibrato,sustentacao,ressonancia,afinacao,respiracao,passaggio,extensao) · crítica: revised
  intermediario: [
    'vibrato-achar-descida-sirene', // Sirene com vibrato ao pousar · siren d2
    'escala-maior-gee-ressonancia', // Maior com 'gee' na máscara · scale d3
    'box-6-6-6-6-intermediario', // Caixa 6-6-6-6 · breathing d3
    'onset-equilibrado-uma-nota-ar-som-int', // Onset equilibrado · sustain d3
    'lip-trill-passaggio-oitava', // Lip trill cruzando o passaggio · siren d3
    'ng-onda-passaggio', // 'Ng' ondulado no passaggio · siren d3
    'melisma-pentatonico-gospel-intermediario', // Melisma pentatônico gospel · scale d3
    'vibrato-messa-di-voce-intermediario', // Cresce e diminui com vibrato · sustain d3
    'escala-mix-fim-peito-inicio-cabeca-intermediario', // Ponte peito-cabeça · scale d3
    'sustain-passaggio-controle-8s', // Sustentar no passaggio · sustain d5
    'frase-adoracao-melisma-curto', // Adoração com melisma · scale d3
    'refrao-pentatonico-maior', // Refrão pentatônico · scale d3
    'sustain-climax-oitava-crescendo', // Clímax na oitava · sustain d4
  ],

  // AVANCADO — A jornada abre com aquecimento minimo mas amplo — um SOVT de canudo que varre todo o range com economia e um salto ligado alem da oitava — acordando a voz inteira sem fadiga nem ex
  // 13 nós · dif 5-5-5-5-4-5-5-5-5-5-5-5-5 · kinds {"siren":2,"interval":5,"scale":3,"sustain":3} · skills 6/7 (extensao,sustentacao,passaggio,afinacao,respiracao,vibrato) · crítica: ok
  avancado: [
    'canudo-range-total-economia', // Canudo range total · siren d5
    'nona-legato-adv', // Nona ligada · interval d5
    'coup-glotte-controlado-clarim-avc', // Coup de glotte controlado · interval d5
    'escala-cromatica-lenta-quebra-avancado', // Aproximação cromática da quebra · scale d5
    'vibrato-taxa-controlada-5hz-media', // Vibrato na taxa certa · sustain d4
    'messa-di-voce-agudo-passaggio-avancado', // Messa di voce acima da quebra · sustain d5
    'sirene-decima-segunda-alta-avancado', // Sirene na quebra superior · siren d5
    'vibrato-passaggio-estavel-agudo', // Vibrato cruzando o passaggio · sustain d5
    'arpejo-dominante-agil-adv', // Arpejo dominante ágil · interval d5
    'salto-oitava-meia-decimo-quinto-avancado', // Salto de oitava e meia · interval d5
    'melisma-gospel-longo-avancado', // Melisma gospel longo · scale d5
    'salto-decima-arpejo-adv', // Arpejo com salto de décima · interval d5
    'frase-louvor-climax-sustentado-avancado', // Clímax de louvor sustentado · scale d5
  ],
}
