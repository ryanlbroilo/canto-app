# Sistema de Design e Experiência do Canto

> **Documento mestre de design & experiência.** Fonte única de verdade para a identidade visual, a personalidade da marca, a EVA (coach de IA), a trilha gamificada, o onboarding, o feedback em tempo real e a voz de escrita do Canto — o app de treino vocal com IA para cantores gospel/worship brasileiros.
>
> **Público-alvo (beachhead):** cantores e cantoras de igreja/worship no Brasil, muitos deles adultos que se acham "desafinados", em Android mid-range. **Fundador solo.** Cada decisão aqui foi escrita para ser implementável por uma pessoa só.
>
> **Tese central:** o Canto usa o *motor de engajamento* do Duolingo (ofensiva, companheira sempre presente, prática diária curta, celebração calorosa) e o *fosso de credibilidade* do Coursera (domínio real de técnica, prova verificável de habilidade, autoridade real, sistema visual calmo e confiável) — mas inverte a linguagem visual de ambos para soar mais quente, mais soulful e mais crível. **Divertido como o Duolingo, sério como o Coursera, quente como nenhum dos dois.**
>
> **Frase-guia da marca:** *"Encontre sua voz. No seu canto."* — "canto" = tanto o ato de cantar quanto um cantinho quente e acolhedor. Essa dupla acepção é a marca inteira.

---

## Sumário

1. [Princípios de Design](#1-princípios-de-design)
2. [Posicionamento de Marca e Personalidade](#2-posicionamento-de-marca-e-personalidade)
3. [Sistema Visual](#3-sistema-visual)
4. [EVA — A Coach de IA](#4-eva--a-coach-de-ia)
5. [A Trilha Gamificada (o "Caminho")](#5-a-trilha-gamificada-o-caminho)
6. [Onboarding e a Primeira Sessão](#6-onboarding-e-a-primeira-sessão)
7. [Feedback em Tempo Real (DSP + Visualizador 3D)](#7-feedback-em-tempo-real-dsp--visualizador-3d)
8. [Inventário de Componentes](#8-inventário-de-componentes)
9. [Antipadrões a Evitar](#9-antipadrões-a-evitar)
10. [Voz e Tom de Escrita](#10-voz-e-tom-de-escrita)

---

## 1. Princípios de Design

Sete princípios opinativos. Cada um carrega o *porquê* — ligado ao público (cantor de igreja inseguro, adulto, "desafinado", Android mid-range) e à ciência de aprendizagem e retenção. Quando dois princípios entrarem em conflito, a ordem abaixo é a ordem de prioridade.

### P1 — Segurança psicológica antes de qualquer coisa
**O que:** a primeira emoção do usuário nunca pode ser vergonha. Nenhum estado de erro é vermelho-buzina, nenhuma cópia é clínica ("desafinado", "errado", "não te ouvimos"). Correção sempre vem embrulhada em encorajamento + próxima micro-ação.

**Por quê:** o público do Canto carrega uma ferida específica — a crença de que "não sabe cantar". Cantar é mais exposto e vulnerável do que tocar em palavras de vocabulário. A Teoria da Autodeterminação (Deci & Ryan) mostra que a motivação intrínseca depende de **competência percebida**; um beginner humilhado no minuto 1 sai e não volta. A pesquisa de UX de apps de canto confirma: cópia dura ("We can't hear you clearly") é apontada por revisores como desencorajadora justamente para os iniciantes que você mais quer reter. Reframing de feedback de "Incorrect. Try again." para "Almost there! Here's a tip…" gerou ~37% de aumento de engajamento (dado Coursera).

### P2 — Tempo-até-valor abaixo de ~5 minutos, com um "aha" real de voz
**O que:** a primeira sessão TEM que terminar com o usuário tendo **cantado** e **visto/ouvido** um resultado concreto da análise (afinação, um número, uma dica específica da EVA). Nunca atrás de tutorial, cadastro ou config.

**Por quê:** benchmark Amplitude/Reforge: correlação de **69%** entre ativação forte em 7 dias e retenção forte em 3 meses; produtos que entregam o "aha" em <5min têm **40% mais** retenção em 30 dias do que os que levam 15+min. O "aha" do Canto é irreplicável pelos concorrentes de karaokê: o motor Rust/DSP realmente *ouve* a frequência fundamental (F0) e mostra cents-off honestos. Esse é o momento mágico — entregue-o cedo, sem fricção.

### P3 — O caminho é o lar; a próxima ação é sempre óbvia
**O que:** a home *é* a trilha. Uma única jornada guiada de nós (respiração → afinação → extensão → música), com um CTA claro de "Continuar" e sem paralisia de escolha. Nós acendem de cinza para cor conforme se progride.

**Por quê:** remove carga cognitiva e torna o progresso legível a cada frame. É o padrão "home-as-the-path" do Duolingo (mecânica central do loop) e do Vanido (eixo vertical que ganha cor). Casa perfeitamente com o nome/tese do Canto ("seu canto", a trilha como coração viciante). Progressive disclosure (NN/G): mostre o próximo passo, esconda o resto até ser necessário.

### P4 — Feedback de foco externo, no momento, sem criar dependência
**O que:** o feedback visual/sonoro em tempo real aponta para um alvo *externo* ("mire a fita", "encoste no tom") e não para o corpo do usuário de forma consciente demais. Frequência de feedback diminui conforme a competência cresce (fading). Distinguir KP (feedback de *processo*: "levanta o palato") de KR (feedback de *resultado*: "você segurou a nota").

**Por quê:** ciência de aprendizagem motora. Foco atencional **externo** (mirar um alvo no ambiente) produz melhor performance e retenção do que foco **interno** (pensar no próprio corpo) — literatura de Wulf. Feedback constante demais (100%) cria *dependência do feedback*: o aluno performa bem com o app ligado e mal sem ele. O regime correto é **fading** — feedback rico no início, progressivamente mais espaçado (feedback resumido, a cada N tentativas, ou só quando sai da faixa) conforme o cantor internaliza. Isso é o oposto do vício de dopamina barata: constrói habilidade real (o fosso Coursera).

### P5 — Domínio real, com portões — não só ofensiva
**O que:** separar **modo prática** (ilimitado, perdoador, feedback DSP contínuo) de um **teste de maestria** ("Aferição") que precisa ser passado para desbloquear a próxima técnica ou ganhar um selo. A prática é infinita e sem punição; o portão é honesto e significa algo.

**Por quê:** é o eixo de credibilidade que a gamificação pura não tem. O Coursera mostra que certificados valem porque são *ganhos* ao passar um limiar, e que **integrar um item avaliado já na primeira semana aumenta significativamente a conclusão** — um desafio real cedo estabelece expectativas realistas e melhora retenção. Os limiares de estrela do Canto se ligam à *precisão de pitch real medida pelo DSP*, não a troféu de participação. Recompensa honesta = confiança de longo prazo.

### P6 — Aversão à perda deliberada, nunca empilhada
**O que:** usar aversão à perda **só** onde ela é mais benigna e motivadora — a ofensiva (streak) — e sempre com guardrails humanos (streak freeze automático, reparo no mesmo dia, marcos em camadas). Não empilhar perda em toda parte (vidas que bloqueiam, vaga de liga que cai, moeda que evapora) até a prática virar estresse.

**Por quê:** cada mecânica do Duolingo tem um componente de perda, e funciona — mas beira o dark pattern e usuários/reguladores empurram de volta. A motivação intrínseca (ouvir a própria voz melhorar) é um driver de retenção mais saudável que o Duolingo não tem e o Canto tem de graça. Perder uma ofensiva deve ser *recuperável*; nunca catastrófico. (Ver [§9](#9-antipadrões-a-evitar).)

### P7 — Legibilidade sempre vence o floreio; o 3D serve à verdade
**O que:** existe sempre uma **camada 2D de verdade** (o "note highway" / piano-roll) que responde a cada frame "estou afinado agora? subir ou descer?". O visualizador 3D é uma *pele expressiva* ligada aos mesmos dados de pitch/tempo, com toggle para a versão plana. Movimento de câmera ou profundidade jamais podem obscurecer se o usuário está agudo ou grave.

**Por quê:** nenhum dos líderes de mercado (Yousician, Simply Sing, Singscope) usa 3D — todos vencem em vistas planas, legíveis, de alto contraste. Cantores precisam de leitura pré-atentiva e inequívoca de "alvo vs. eu, dentro/fora, cima/baixo". O 3D é ativo de marca genuíno para o Canto, mas é *aditivo*. Isso também serve a acessibilidade (WCAG AA): pitch nunca depende só de cor.

---

## 2. Posicionamento de Marca e Personalidade

### 2.1 A posição em uma frase
> **O Canto é o Duolingo do canto com a alma de um hinário e o ouvido de um coach de verdade** — um cantinho quente onde qualquer pessoa que se acha desafinada encontra a própria voz, um dia de cada vez.

### 2.2 O nome como marca inteira
"Canto" tem dupla acepção em português: **cantar** e **um cantinho aconchegante**. Essa é a marca toda. O Duolingo é um pássaro; o Coursera é um campus. O Canto é *casa* — pertencimento, um lugar seguro para errar. Sistema de tagline:

- **Principal:** *Encontre sua voz. No seu canto.*
- **Curta (ícone/splash):** *Seu canto pra encontrar a voz.*
- **EVA/onboarding:** *Vem pro seu canto. A gente aquece a voz junto.*

### 2.3 As duas naturezas: divertido como Duolingo E crível como Coursera
O Canto opera em dois eixos complementares — não é escolha entre eles.

| Eixo | O que herda | Como se manifesta no Canto |
|---|---|---|
| **Motor (Duolingo)** | Loop diário de engajamento | Ofensiva com freeze, EVA sempre presente, sessões curtas (3–5 min), trilha como home, celebração de micro-vitórias, XP, metas semanais |
| **Fosso (Coursera)** | Arquitetura de credibilidade | Modo prática vs. Aferição com portão, prova de habilidade compartilhável (antes/depois), vocabulário real de canto (apoio, passaggio), autoridade real (coaches/ministros parceiros), sistema visual calmo e de alta confiança, acessibilidade como padrão |

A síntese: **o motor te faz voltar amanhã; o fosso faz valer a pena.** Duolingo puro vicia mas não ensina profundo; Coursera puro ensina mas é frio e passivo. O Canto é o híbrido — e a cola entre os dois é o **calor** (o eixo que nenhum dos dois tem).

### 2.4 Personalidade da marca (arquétipos)
- **A Mentora acolhedora** (não a professora que corrige): paciente, presente, acredita em você antes de você acreditar.
- **A artesã de som** (não a máquina de pontos): trata voz como ofício belo, não como jogo de acertar/errar.
- **A anfitriã do seu canto** (não o coach de gritaria): calor brasileiro, "bora?", "respira", "sem pressa".

Traços: **calorosa, soulful, crível, paciente, celebradora, brasileira, inclusiva.** Nunca: infantil, hype, culpada, corporativa, pregadora.

### 2.5 O que adotamos, adaptamos e evitamos — Duolingo e Coursera

#### Do Duolingo

| Verdicto | Elemento | Decisão para o Canto |
|---|---|---|
| **ADOTAR** | Ofensiva + Streak Freeze (aversão à perda como hábito diário) | Mecânica de maior alavancagem. Freeze users: 17,19 vs 11,62 dias on-streak após D7; 7-day streak = 3,6x mais chance de ficar. Manter a chama, freeze automático, reparo fácil. Enquadrar a unidade diária como "cantar/treinar hoje". |
| **ADOTAR** | Trilha / caminho como home | Já é o "trilha" do Canto. Um CTA "Continuar", progressão nó a nó por habilidade. |
| **ADOTAR** | Conquistas: Recordes Pessoais (vitória imediata) + Selos (marco longo) | Day-1 achievement completers retêm 33,42% vs 20,36%. Dar uma vitória desbloqueável na 1ª sessão ("Primeira nota afinada") + Selos de longo prazo (30 dias, música inteira). |
| **ADOTAR** | Dificuldade adaptativa (análogo ao Birdbrain) | O DSP+LLM do Canto *ouve de verdade* — adapta pitch-alvo, intervalos, tempo e sustentação ao vivo à extensão e precisão medidas. É onde o Canto **supera** o Duolingo. |
| **ADOTAR** | Motion celebratório + botões 3D táteis; feedback de sucesso | Micro-animações baratas e de alto impacto, atreladas ao sinal DSP real ("segurou a nota → glow no instante que o pitch travou"). |
| **ADOTAR** | Voz & tom: expressiva, brincalhona, acolhedora — frases curtas, celebra pequeno, nunca acadêmica | Elemento de custo zero mais transferível. (Ver [§10](#10-voz-e-tom-de-escrita).) |
| **ADAPTAR** | Cor-herói única e confiante | Copiar a *estratégia* (uma cor ousada usada com liberdade em CTAs, estados corretos, ícone), **jamais o verde**. Cor do Canto = âmbar-dourado/brasa/ameixa (ver [§3](#3-sistema-visual)). |
| **ADAPTAR** | Sistema de duas fontes (display + corpo) | Adotar a *estrutura* de dois papéis com fontes livres — mas rejeitar o rounded-sans do Duolingo. Canto = serifa editorial + sans humanista. |
| **ADAPTAR** | XP + ligas semanais | Adotar XP como moeda universal de "você fez algo". Ligas: **opt-in, cohort de encorajamento (grupo de louvor/canto), amigos**, nunca ranking global cutthroat — cantar é vulnerável demais. |
| **ADAPTAR** | Vidas (hearts) + economia de gemas | **Nunca** um muro "acabaram suas vidas, pare de praticar" — você QUER mais reps. Adaptar para moeda mole ("palmas"/"notas") que compra freeze, dicas da EVA e cosméticos, sem bloquear prática. |
| **ADAPTAR** | Mascote residente | Manter o padrão "companheira sempre presente" (EVA), rejeitar a forma animal-cartoon. EVA = ser-de-som luminoso, coach vocal caloroso. |
| **EVITAR** | Persona pública "unhinged/passivo-agressiva" ("You made Duo sad", memes de ameaça) | É jogada de marketing/TikTok para Gen-Z, off-brand para worship e adultos vulneráveis. Lembretes do Canto = calorosos ("A EVA tá aqui quando você puder"). Nada de culpa/vergonha. |
| **NOTA** | Aversão à perda em *tudo* | Usar deliberadamente só na ofensiva; não empilhar. |
| **NOTA** | CURR como métrica-norte | Instrumentar e otimizar retorno D1/D7/D30 desde o lançamento, atribuindo o lift de cada feature — não perseguir instalações. |

#### Do Coursera

| Verdicto | Elemento | Decisão para o Canto |
|---|---|---|
| **ADOTAR** | Front-load de uma vitória *real* (item avaliado na semana 1) | Além do streak-bait: dar um marco vocal *pontuado* real nas primeiras sessões (gravação avaliada de uma passagem). |
| **ADOTAR** | Portão de maestria (prática ungraded vs. Aferição graded) | Prática ilimitada e perdoadora; Aferição gateia a progressão de técnica. Eixo de credibilidade que a ofensiva não tem. |
| **ADOTAR** | Fotografia documental de gente real | Cantores reais, equipes de louvor reais, rostos mid-practice — não mascote-cartoon em telas de marketing/social. No beachhead gospel, dobra como credibilidade de comunidade. |
| **ADOTAR** | Acessibilidade como programa (WCAG AA, legendas, sinais não dependentes de cor) | Contraste AA (disciplina o sistema de cor), legenda/transcrição de fala da EVA, feedback DSP com pista não-cor (altura, glow, posição). Sinal de confiança para compradores institucionais (igreja/escola). |
| **ADOTAR** | Voz & tom: claro, direto, encorajador — feedback nunca cru | Nunca "errado/desafinado" seco — sempre "quase — passou um tiquinho do tom, respira e vem de novo". Encorajador + específico + acionável. |
| **ADOTAR** | Consistência estrita = confiança | Um rulebook de marca de 1 página, e segurar a linha. Barato e crível para fundador solo. |
| **ADAPTAR** | Paleta mínima (poucas cores = confiança) | Adotar a *disciplina* (uma primária confiante + neutros), trocar o hex: cobalto corporativo → hues quentes e musicais. |
| **ADAPTAR** | Uma sans amigável-mas-séria em todo lugar | Adotar a *estratégia* de fontes livres consistentes; escolher Fraunces (display) + Figtree (corpo), com racional Noto para diacríticos/legendas multilíngues. |
| **ADAPTAR** | Credenciais verificáveis | Sem universidade, mas emitir prova-de-habilidade compartilhável e verificável (página "alcançou técnica X" ou gravação antes/depois com link único) que um líder de louvor reconheça. |
| **ADAPTAR** | Confiança emprestada de parceiros nomeados | Análogo: parceria com ministérios de louvor, coaches e artistas gospel reconhecidos. O aval de um líder respeitado é o "logo da Universidade de Michigan" do Canto. |
| **ADAPTAR** | Cadência de vídeo (3–6 min, <10) | Vídeo passivo não é o meio, mas o *chunking* transfere: micro-explicação da EVA curta → sing-back imediato. |
| **ADAPTAR** | Bloco de prática de 8–10 min | O núcleo do Canto É prática. Estruturar blocos rumo a ~8–10 min de canto ativo — mas respeitar **fadiga vocal** (voz cansa mais rápido que teclado): micro-sessões de 3–5 min como default. |
| **EVITAR** | Secura, distância acadêmica, passividade de vídeo longo, cobalto institucional | O Canto nunca pode soar como catálogo de curso. Credibilidade vem do calor + ofício, não de parecer universidade. |

### 2.6 Como o Canto se diferencia de ambos (o território que só é dele)
- **Contra o Duolingo:** calor soulful em vez de fofura brincalhona; serifa editorial em vez de rounded-sans; ser-de-som luminoso em vez de coruja-cartoon; âmbar/brasa/ameixa em papel creme em vez de verde-limão em branco frio; ensina técnica real em vez de só viciar.
- **Contra o Coursera:** pessoal e voice-native em vez de institucional e frio; loop diário caloroso em vez de vídeo passivo; motivação intrínseca (ouvir a voz melhorar) em vez de credencial distante.
- **O que é só do Canto:** a metáfora de *lar/canto* (pertencimento), o motor DSP que **realmente ouve**, a EVA que *respira com você*, e a ressonância espiritual carregada só por cor e luz (dourado = glória, ameixa = realeza/sacerdócio, motivo aurora/candelabro) — **sem nenhum ícone religioso literal**, para acolher o secular e soar como casa para o worship.

---

## 3. Sistema Visual

Direção líder: **"Brasa & Papel"** (editorial quente) como sistema de uso diário; **"Amanhecer"** (luminoso/cinematográfico) para herói/onboarding/dark; **"Louvor Moderno"** reservado como registro de campanha/jovem. Todas as fontes são SIL OFL / livres para uso comercial.

> **Decisão de fundo (2026-07-09, do fundador):** o app **não** é âmbar por toda parte — âmbar como *superfície* cansa a vista. O **fundo é neutro e alternável pelo usuário**: **branco** no claro, **cinza escuro** no escuro (o usuário escolhe). O **âmbar é o alicerce e o diferencial da marca, aplicado como ACENTO** — CTAs, conquista/XP, glow da EVA, estado de afinação — nunca como parede. A cor de marca *aparece*; o resto *respira* em neutro.

### 3.1 Paleta — Tema Claro (fundo branco)

| Token | Nome | Hex | Uso |
|---|---|---|---|
| `--bg` | Branco | `#FFFFFF` | **Fundo base no claro** — neutro, escolha do usuário. |
| `--surface` | Nuvem | `#F5F4F2` | Superfície/cards (cinza quase-branco com whisper de calor — **não** creme). |
| `--border` | Névoa | `#E6E4E0` | Bordas, divisores. |
| `--text` | Carvão quente | `#211E1B` | Texto principal. |
| `--muted` | Pedra | `#6E6258` | Texto secundário/muted. |
| `--cor-dourado` | Dourado / Âmbar-Ouro | `#F2A83B` | **Acento primário / alicerce de marca**: luz, glória, conquista, XP. |
| `--cor-brasa` | Brasa / Ember | `#E4572E` | **CTA primário**, energia, ação ("Continuar", "Cantar"). |
| `--cor-manto` | Ameixa-Real | `#7A3E93` | EVA, profundidade, premium. |
| `--cor-sereno` | Teal-Afinado | `#1F8A76` | **"Você está afinado"** — sucesso calmo. (Não é verde-Duolingo.) |
| `--cor-rust` | Ferrugem | `#C4462C` | Off-pitch gentil — **nunca** vermelho-buzina. |

### 3.2 Paleta — Tema Escuro (fundo cinza escuro)
Cinza escuro **neutro** (com um whisper de calor pra não ser cinza-morto), **não** ameixa — o fundo é escolha do usuário. O âmbar vira **luminoso** sobre o cinza; a parede não é tingida de cor.

| Token | Nome | Hex | Uso |
|---|---|---|---|
| `--bg` | Cinza escuro | `#17161A` | **Fundo base no escuro** — neutro, escolha do usuário. |
| `--surface` | Grafite | `#211F24` | Superfície/cards no escuro. |
| `--border` | Sombra | `#312E38` | Bordas, divisores. |
| `--text` | Branco quente | `#F3F1EE` | Texto no escuro. |
| `--muted` | Cinza névoa | `#A29CA8` | Texto secundário/muted. |
| `--cor-dourado` / `--cor-brasa` / `--cor-sereno` / `--cor-manto` | (mesmos, luminosos) | `#F2A83B` / `#E4572E` / `#1F8A76` / `#8E4585` | Acentos agora com **glow** sobre o cinza. |

### 3.3 Gradiente-assinatura "Amanhecer"
`--grad-amanhecer: linear-gradient(135deg, #7A3E93 0%, #E4572E 55%, #F2A83B 100%)` — ameixa → brasa → dourado. Aurora / luz que rompe / luz de louvor. Usar em: onboarding, telas-herói, marcos de ofensiva, glow da EVA. Motivo espiritual não-literal (luz), nunca um símbolo religioso.

### 3.4 Semântica de cor (mapeamento de estados)
Reatribuição deliberada vs. Duolingo — o Canto **não** usa verde para "correto".

| Estado | Cor | Racional |
|---|---|---|
| Afinado / em tom | Teal Sereno `#1F8A76` (+ pista não-cor: anel de shimmer, snap de posição) | Teal lê como calmo/espiritual; libera o dourado para recompensa. |
| Nota acertada / conquista / XP | Glow Dourado `#F2A83B` | Ouro = glória/luz no código worship; reservado para *recompensa*. |
| Levemente fora ("firma e vem") | Rust `#C4462C` (suave, com dica acionável) | "Lean-in and steady", nunca punitivo. |
| Erro de sistema (mic, ruído) | Pedra/neutro + cópia de ajuda | Culpa o ambiente, nunca a voz. |
| Premium / EVA | Ameixa `#7A3E93` / Plum-glow `#8E4585` | Realeza/sacerdócio; profundidade. |

**Regra de acessibilidade (WCAG AA):** todo estado de pitch tem uma pista **além da cor** (altura de preenchimento, glow, posição, ícone), porque vermelho/verde é o pior par para daltônicos e o Canto atende compradores institucionais.

### 3.5 Tipografia
Par anti-Duolingo e anti-Coursera. Ambas SIL OFL, Google Fonts, cobrem diacríticos PT-BR completos.

| Papel | Fonte | Config | Uso |
|---|---|---|---|
| **Display / títulos** | **Fraunces** (variável) | High optical size, low "wonk", mid "soft" | Headlines, momentos de celebração, herói. Serifa editorial quente = alma + credibilidade (like a beautifully set hinário). |
| **UI / corpo** | **Figtree** | Sentence case | Subtítulos, corpo, labels, botões. Sans humanista quente, amigável sem a frieza geométrica da Inter nem o bubbly da Nunito. |
| **Alt display (jovem)** | **Bricolage Grotesque** | — | Só no registro de campanha "Louvor Moderno". |
| **Labels de nota (C4/D4)** | Figtree ou mono geométrica de alta legibilidade | Tabular | Grid de semitons — precisa ler num relance. |
| **Fallbacks** | Inter (corpo), Georgia/serif (display) | — | — |

**Regra:** não misturar Fraunces e Figtree na mesma frase/linha. Fraunces carrega emoção; Figtree carrega informação.

Escala tipográfica sugerida (rem, base 16px):

| Nível | Tamanho | Fonte | Peso |
|---|---|---|---|
| Display XL (herói) | 2.5–3rem | Fraunces | 500–600 |
| H1 | 2rem | Fraunces | 500 |
| H2 | 1.5rem | Fraunces | 500 |
| H3 | 1.25rem | Figtree | 600 |
| Corpo | 1rem | Figtree | 400 |
| Corpo pequeno | 0.875rem | Figtree | 400 |
| Caption/label | 0.75rem | Figtree | 500 |

### 3.6 Escala de espaçamento
Grid de **8pt**. Tokens: `4, 8, 12, 16, 24, 32, 48, 64`. Padding generoso de card = **24px**. Respiro é parte da identidade "papel/hinário" — não aperte.

### 3.7 Cantos e sombras
- **Raio de canto:** 16–20px (retângulos suaves, **não** pills completas — geometria mais madura que o Duolingo). Chips/tags menores: 12px. Elementos totalmente redondos só para avatar da EVA e o "flame" de ofensiva.
- **Sombras:** suaves e quentes (nunca preto puro). No claro: `0 2px 8px rgba(43,35,32,.08)`. Botão 3D tátil: borda-de-baixo sólida de 3–4px em tom mais escuro da própria cor (ex.: CTA brasa `#E4572E` com base `#C4462C`), com press-down que "afunda" a borda — herda o affordance do Duolingo mas em tom brasa, não verde.
- No escuro: sombras viram glows sutis (ex.: `0 0 24px rgba(142,69,133,.25)` para elementos da EVA).

### 3.8 Iconografia e ilustração
- **Ícones:** stroke geométrico arredondado, 2px, cantos suaves. Coerentes com Figtree. Preferir metáfora de som/voz/luz (ondas, chama, respiração, microfone amigável) a ícones genéricos.
- **Ilustração:** abstrata e luminosa (ondas de som, luz de aurora, brasa), **não** personagens-cartoon detalhados. Em superfícies de marketing/social, **fotografia documental** de cantores reais (Coursera) supera ilustração.
- **Nada de clichê churchy:** sem cruzes, pombas, vitrais literais. A espiritualidade vem da cor e da luz.

### 3.9 Princípios de movimento/animação
Micro-recompensas mantidas, mas geometria e motion "crescidos" — **instrumento e santuário, não caça-níquel**.

- **EVA respira:** ciclo de ~4s (0,25Hz) em idle — pulso suave de escala/glow. "Respira com você."
- **Celebração:** glow quente + escala gentil **1.0 → 1.06**, sem explosão de confete. "In tune" = anel de shimmer teal suave.
- **Correção:** resolve **devagar e firme**, nunca flash vermelho. Rust que se acalma para sereno conforme o pitch entra.
- **Botão 3D:** press-down tátil (afunda a borda de baixo), o único gesto "springy" permitido, e ainda contido.
- **Transições de tela:** 200–300ms, ease-out. Nada de bounce exagerado.
- **Respeitar `prefers-reduced-motion`:** desligar pulsos/parallax, manter só cross-fades.
- **Performance Android mid-range:** animações via CSS transform/opacity (compostas na GPU); o visualizador 3D com budget de frame e fallback 2D (ver [§7](#7-feedback-em-tempo-real-dsp--visualizador-3d)).

---

## 4. EVA — A Coach de IA

EVA é a companheira sempre presente do Canto — o análogo do Duo, mas invertido em forma e alma. Ela é o rosto do calor que diferencia o Canto de Duolingo e Coursera. **Foco absoluto: segurança psicológica de adultos que se acham "desafinados".**

### 4.1 Significado do nome
"EVA" lê como nome feminino brasileiro caloroso (Ela/she) e evoca **sopro** (breath) — fundamento tanto da técnica vocal (apoio, respiração diafragmática) quanto de um undertone espiritual suave (sopro/espírito) que o cantor de worship sente, mas que nunca exclui ninguém secular. Ela *respira com você*.

### 4.2 Aparência (design de personagem)
**Não é um animal-cartoon.** EVA é um **ser-de-som luminoso**:

- Uma chama/brasa suave e arredondada de luz âmbar-dourada com **núcleo de ameixa** (`#7A3E93`).
- Seu **corpo É uma fita de onda sonora contínua** — uma única ribbon de waveform.
- Feições mínimas — **dois olhos suaves e uma boca gentil** — que só emergem quando necessário (elogio, apoio, escuta). A maior parte do tempo, sua expressão *é o corpo-onda ondulando em tempo real à voz do usuário*.
- **Estados de cor:** glow **teal** (`#1F8A76`) quando você está afinado; pulso **dourado** (`#F2A83B`) quando acerta a nota; **respiração** de idle (pulso 4s/0,25Hz) quando espera.

Racional: revisão PRISMA (2025) achou que avatares cartoon de **baixo realismo** batem os de realismo médio em confiabilidade E atratividade; formas abstratas simples (cf. as shapes do Slack) sobrevivem a mais contextos que personagens detalhados. Uma forma abstrata luminosa também não tem gênero/etnia/idade fixos — acolhe todo mundo, e nunca cai no "uncanny valley".

### 4.3 Comportamento
- **Idle:** respira (4s), presente mas quieta. Nunca implora atenção.
- **Escutando:** o corpo-onda se anima ao vivo com a voz. Isto por si só é feedback — o usuário *vê* a EVA ouvindo.
- **Afinado:** glow teal, onda serena. **Nota acertada:** pulso dourado + escala 1.06.
- **Fora do tom:** EVA "lean in" para firmar — nunca recua, nunca faz careta de erro. Cor rust suave que resolve para sereno conforme o pitch entra.
- **Correção (KP):** oferece a próxima micro-ação, não um veredito.
- **Fading do feedback:** conforme o cantor melhora numa habilidade, EVA fala **menos e mais espaçado** (a cada N tentativas, ou só quando sai da faixa), para construir independência e não dependência (P4). Ela comemora que você "já não precisa tanto dela".
- **Nunca:** streak-cop naggadora, culpa, ironia, ameaça. EVA é paciente, encorajadora, genuinamente escutando.

### 4.4 Tom de voz e microcopy (PT-BR)
Warm "você", chama pelo nome, calor brasileiro. Vocabulário real de coach vocal (apoio, afinação, passaggio, respiração) = credibilidade que é o fosso vs. gamificação pura. Gospel-aware **só quando o usuário opta**, nunca por padrão, nunca denominacional, nunca com culpa.

**Elogio (nota acertada / micro-vitória):**
- "Isso! Segurou a nota certinho — sentiu o apoio?"
- "Ó a afinação! Tá bonito demais."
- "Você travou nesse tom. Foi você que fez isso."

**Correção (levemente fora — o estado rust):**
- "Passou um tiquinho do tom. Respira fundo e vem de novo, sem pressa."
- "Quase lá — tá um cadinho abaixo. Levanta o palato e tenta de novo comigo."
- "Escorregou no finalzinho. Normal. Bora refazer só esse pedaço?"

**Erro de sistema (mic/ruído — nunca culpa a voz):**
- "Tô com dificuldade de te ouvir. Que tal um cantinho mais silencioso?"
- "O microfone tá baixinho. Chega um pouquinho mais perto que eu te acompanho."
- (Bluetooth detectado) "Fone sem fio às vezes atrasa o som. Se puder, usa o do celular que fica mais preciso."

**Retomada de ofensiva (streak em risco / freeze usado):**
- "Sua ofensiva de 6 dias tá te esperando. Um exercício rapidinho e ela continua."
- (freeze automático usado) "Ontem foi corrido, né? Usei seu protetor de ofensiva. Sua sequência tá salva — bora hoje?"
- (reparo no mesmo dia) "Faltou ontem, mas dá pra recuperar hoje. Vem que a gente conserta juntos."

**Boas-vindas / aquecimento:**
- "Oi, {nome}. Bora aquecer a voz? Começa devagar comigo."
- "Vem pro seu canto. Cinco minutinhos e a gente já sente diferença."

**Marco / progresso:**
- "Três dias seguidos cantando. Tá construindo algo bonito."
- "Lembra do primeiro dia? Sua extensão já subiu duas notas. Isso é trabalho seu."

**Opt-in gospel (só se o usuário escolheu):**
- "Quer ensaiar aquele louvor pro domingo? Escolhe a música."

**EVITAR sempre:** "desafinado", "errado", "você falhou", clichês churchy, culpa, hype "streak or die", frieza corporativa.

### 4.5 Segurança psicológica — regras duras
1. Nenhum estado de erro usa vermelho-buzina ou som de "buzzer".
2. Toda correção vem com a **próxima micro-ação** ("respira", "levanta o palato", "um tiquinho mais grave") — nunca só o diagnóstico (a falha do Vanido).
3. Leituras de baixa confiança do motor pedem para **mudar de ambiente**, nunca culpam a voz.
4. No onboarding, **zero** estados de falha — só descoberta e encorajamento.
5. EVA celebra o *esforço e o retorno*, não só a perfeição.

---

## 5. A Trilha Gamificada (o "Caminho")

A home **é** a trilha. Cada mecânica abaixo vem com evidência ou princípio, e é desenhada para evitar dark patterns (P6, [§9](#9-antipadrões-a-evitar)).

### 5.1 Estrutura da jornada
Trilha **vertical** de nós que acendem de cinza para cor conforme se progride (padrão Vanido + Duolingo). Sequência de habilidades por camada:

1. **Respiração & Apoio** (fundação — o que separa canto de fala)
2. **Afinação** (encoste no tom, sustente, intervalos)
3. **Extensão** (expandir grave/agudo com segurança)
4. **Música** (aplicar tudo numa música real — o payoff)

Cada camada tem nós (exercícios). Um **CTA único "Continuar"** sempre aponta o próximo nó. Sem paralisia de escolha (P3). O primeiro nó é alcançável **em uma sessão** — o usuário vê um nó acender já no dia 1.

### 5.2 Anatomia da sessão/lição
- **Duração default:** 3–5 min de canto ativo (respeita fadiga vocal; ativação baixa para caber num dia corrido). Blocos podem chegar a ~8–10 min para usuários engajados (sweet spot Coursera), mas nunca forçado.
- **Formato:** micro-explicação curta da EVA (análogo aos 3–6 min de vídeo Coursera, mas em segundos) → **sing-back imediato** com feedback DSP em tempo real → celebração.
- **Prática vs. Aferição:** dentro de uma habilidade, os nós de prática são ilimitados e perdoadores. Ao final da habilidade, uma **Aferição** (portão de maestria) precisa ser passada — limiar de precisão de pitch real medido pelo DSP — para desbloquear a próxima. (P5; evidência Coursera: item avaliado cedo ↑ conclusão.)

### 5.3 XP, ofensiva e metas

| Mecânica | Design | Evidência / princípio |
|---|---|---|
| **XP** | Moeda universal de "você fez algo". Ganho por exercício; limiares de **estrela** ligados à precisão real do DSP (recompensa honesta, não troféu de participação). | Yousician: "o jogo É a lição"; ligas com XP ↑ ~40% engajamento. |
| **Ofensiva (streak)** | Espinha da home. Chama visível + calendário de dias completos. Unidade = "cantar hoje". | Freeze users 17,19 vs 11,62 dias pós-D7; 7-day streak 3,6x mais retenção; >50% do DAU do Duolingo tem streak 7+. |
| **Protetor de ofensiva (freeze)** | **Automático** (deploy sem ação do usuário) + **reparo no mesmo dia** fácil. Distribuído por recompensa, não vendido como muro. | Freeze corta churn ~21% de at-risk; "empty-handedness is rare". Redesenho do streak animation sozinho moveu D7 +1,7%. |
| **Marcos em camadas** | 3 / 7 / 30 / 100 / 365 dias — recompensa todo nível de compromisso, não só o herói de 365. | Coursera/Duolingo: tiers recompensam profundidades diferentes; conquistas mais difíceis ↑ retenção (32% → 74%). |
| **Meta da semana** | Anel semanal auto-escolhido (o Canto já tem base). Ligada ao horário de prática escolhido pelo usuário. | Personalização ↑ opt-in de lembrete (87%+); meta própria = autonomia (SDT). |
| **Conquistas** | Recordes Pessoais (vitória imediata: "Primeira nota afinada" no dia 1) + Selos (longo: "Música inteira", "30 dias"). | Day-1 completers retêm 33,42% vs 20,36%. |
| **Ligas / desafios** | **Opt-in**, skill-matched, enquadradas como **grupo de canto/louvor de encorajamento** ou amigos — nunca ranking global cutthroat. Enviar streak + celebração primeiro; liga é experimento gated e A/B testado. | Ligas ↑ 17% tempo de aprendizado, mas competição desmotiva usuários ansiosos — e cantar é exposto. Efeito é population-dependent. |
| **Economia mole** | "Palmas"/"notas" ganhas compram freeze, dicas da EVA, cosméticos. **Nunca bloqueiam prática.** | Muro de vidas pay-to-continue é risco: você QUER mais reps de um beginner nervoso. |

### 5.4 Amarrar a MÚSICA no caminho
O diferencial emocional: **música de verdade no path**, não só drills.

- **Auto-transposição para a extensão do usuário** (perfil de voz do onboarding): nenhuma música fica alta/baixa demais. Alto valor no beachhead gospel — transpor louvores para o tom do cantor (Simply Sing/Vocaberry).
- **Nós de música** aparecem ao final de cada camada de habilidade como *payoff*: você aprendeu apoio+afinação → agora canta um trecho de uma música real com aquilo.
- **Modo louvor (opt-in):** "Quer ensaiar aquele louvor pro domingo? Escolhe a música." — conteúdo autoral + domínio público + catálogo CCLI (gospel-nativo), respeitando licenciamento.
- **Antes/depois compartilhável:** ao dominar uma música, gerar uma gravação com link verificável (análogo à credencial Coursera) que um líder de louvor reconheça.

### 5.5 Guardrails contra dark patterns (resumo)
- Ofensiva sempre **recuperável** (freeze + reparo); perder nunca é catastrófico.
- Sem muro de vidas; prática nunca é bloqueada.
- Ligas **opt-in**, nunca forçadas; competição é experimento, não default.
- Aversão à perda **só na ofensiva**, não empilhada (P6).
- Métrica-norte = **CURR / retorno D1/D7/D30**, não instalações nem vaidade.

---

## 6. Onboarding e a Primeira Sessão

Objetivo único: **o usuário canta e vê/ouve um resultado real da EVA em <5 min, sem cadastro, sem tutorial, sem config** (P2). Meta de retenção: D1 ~21%, D7 ~12%, D14 ~9% (top performers); a ativação de 7 dias correlaciona 69% com retenção de 3 meses.

### 6.1 Fluxo (wizard curto, uma coisa por tela)
Progressive disclosure / wizard (NN/G) — uma pergunta por tela, smart defaults, o **primeiro canto acontece DENTRO do wizard** para o setup já produzir o "aha".

1. **Boas-vindas (1 tela, gradiente Amanhecer):** "Encontre sua voz. No seu canto." EVA se apresenta em uma linha. Botão grande "Bora começar". **Sem carrossel de 5 telas** (carrosséis forçados reduzem usabilidade — NN/G).
2. **Prime do microfone (pré-prompt custom, ANTES do dialog do SO):** tela amigável explicando valor: *"O Canto escuta sua voz pra EVA te guiar na afinação em tempo real. Nada é gravado nem enviado."* → só então dispara `getUserMedia`. Pedir no load da página faz a maioria recusar; primar depois de explicar valor eleva o aceite.
3. **Teste de extensão vocal (o primeiro canto = o aha):** EVA pede "hum sua nota mais grave... agora alcança a mais aguda". O motor DSP mede ao vivo e mostra a extensão na tela. **A primeira ação do usuário é cantar**, e o app já personaliza. Zero estados de falha aqui — só descoberta ("Olha só sua extensão! Dá pra cantar um monte de coisa com isso.").
4. **Primeiro exercício guiado (in-context, sem tutorial separado):** um exercício curto de afinação com o note highway + feedback DSP em tempo real. Dicas aparecem *no contexto* da ação ("sing this note" → cursor ao vivo), não num overlay antes (NN/G: "pull" help, não "push").
5. **A primeira vitória avaliada + conquista dia-1:** ao final, um resultado concreto — precisão, uma dica específica, e a conquista desbloqueada "Primeira nota afinada". (Coursera: item avaliado cedo ↑ conclusão; Duolingo: conquista dia-1 ↑ retenção para 33%.)
6. **Prompt de cadastro no pico emocional:** SÓ AGORA, para **salvar o progresso** — "Quer guardar sua evolução? Cria seu canto em 10 segundos." Converte na emoção do "aha", evita o account-wall pré-valor que mata D1. Menos campos, smart defaults, verificação de email deferida.
7. **Prompt de notificação (depois do valor, personalizado):** "Quer que a EVA te lembre de treinar amanhã? Que horas costuma sobrar um tempinho?" → escolhe horário → só então dispara o prompt nativo do SO. 87%+ optam quando a tela é personalizada; opted-in têm ~88% mais interação após 90 dias.

### 6.2 Empty states e estados de carregamento (NN/G)
- **Nunca uma tela em branco.** Enquanto o DSP processa, mostrar progresso explícito ("Escutando sua voz...") — nunca deixar o usuário achar que travou.
- **Trilha vazia:** diz o que vai aparecer, ensina uma coisa, e mostra um botão grande "Comece seu primeiro exercício".
- Todo empty state: (1) comunica status, (2) ensina uma dica, (3) oferece uma ação direta.

### 6.3 O que medir
- **Value achievement rate:** % que chega ao primeiro take analisado (não só passos completados).
- **D1 / D7 / D30 return-rate** como KPI primário desde o lançamento.
- Atribuir o lift de retenção de cada feature de gamificação (jeito Duolingo).

---

## 7. Feedback em Tempo Real (DSP + Visualizador 3D)

O motor Rust/WASM (F0 real, baixa latência) é o fosso técnico sobre os concorrentes de karaokê que "fingem" pitch medindo volume/ritmo. Mas ele precisa ser embrulhado em enquadramento perdoador **e** aplicar a ciência de feedback para construir habilidade, não dependência.

### 7.1 A camada 2D de verdade (default, sempre presente)
- **Note highway** horizontal (linhagem Rock Band): a melodia-alvo rola da direita para uma linha "agora" fixa; letra fica parada; o pitch cantado renderiza como cursor/blob ao vivo que você alinha à fita-alvo. Mostra **referência E sua voz** simultaneamente ("Chase the Notes" do Yousician). É a forma mais legível de "estou afinado agora, e o que vem".
- **Modo scope/análise** (para cantores sérios): piano-roll/grid de semitons — gridlines horizontais = semitons rotulados por nome+oitava (C4, D4), verticais = tempo; a curva de pitch ao vivo revela **vibrato e drift** (Singscope). Toggle ao lado da trilha gamificada.
- **Código de estado:** teal Sereno = afinado, rust = fora, dourado = nota travada — **sempre com pista não-cor** (altura de preenchimento, glow, snap de posição) para daltônicos e AA.

### 7.2 O visualizador 3D (pele expressiva, aditiva)
- É a *skin* sobre os **mesmos dados de pitch/tempo** do 2D — o corpo-onda da EVA e a luz de aurora reagindo à voz.
- **Nunca substitui** a leitura 2D. Toggle para o highway plano sempre disponível (P7).
- Movimento de câmera/profundidade **jamais** pode obscurecer se o usuário está agudo ou grave.
- **Budget de Android mid-range:** frame budget rígido, fallback 2D automático em devices fracos, animação composta na GPU.

### 7.3 Ciência de feedback aplicada (para não criar dependência)
Este é o cerne do P4 — o que separa o Canto de um karaokê viciante.

| Princípio | Regra de implementação |
|---|---|
| **Foco externo** | O feedback aponta para um alvo externo ("mire a fita", "encoste no tom"), não para o corpo de forma obsessiva. Melhor performance e retenção que foco interno (Wulf). |
| **KR vs KP** | **KR** (resultado: "você segurou a nota", ao final) e **KP** (processo: "levanta o palato", durante) são distintos. Iniciante recebe mais KP acionável; conforme melhora, muda para KR resumido. |
| **Frequência decrescente (fading)** | Feedback rico no início; conforme a competência cresce numa habilidade, **espaçar** o feedback (resumido, a cada N tentativas, ou só quando sai da faixa). Constrói independência — o cantor performa bem *sem* o app ligado. |
| **Feedback resumido / faixa de banda** | Não apitar a cada cent de desvio. Só sinalizar quando sai de uma **faixa de tolerância** (evita over-correction e reduz ansiedade). Amber "close, adjust" entre afinado e fora, para não pular binário verde/vermelho. |
| **Latência percebida** | Renderizar o cursor de pitch **direto do motor DSP na thread de áudio-in**, sem round-trip com a backing track — sente instantâneo mesmo que o áudio-out atrase. Oferecer calibração de latência única; detectar Bluetooth e suavizar scoring. |
| **AudioWorklet, não ScriptProcessorNode** | Bridge do Rust/WASM na thread de áudio real-time; todo trabalho por bloco de 128 frames (@48kHz) cabe em ~2,7ms. Não gatear o feedback visual em sincronia perfeita de áudio. |
| **Honestidade + generosidade** | Pontuar F0 real (o diferencial), mas **nunca punir o usuário por o app ter ouvido mal** — validar o motor duro em mic de celular ruidoso; leitura ruim vira "vamos pra um lugar mais quieto", não "sua voz falhou". |

### 7.4 Regra de ouro do feedback
Nunca detectar sem prescrever. "Flat by 30 cents" sozinho é a falha do Vanido. Sempre: **estado + porquê + próxima micro-ação** ("passou um tiquinho — foi o apoio, respira fundo e vem de novo"). Detecção sem prescrição é frustração conhecida a bater, não a copiar.

---

## 8. Inventário de Componentes

Componentes de UI centrais a construir (fundador solo — priorizar os marcados **[MVP]**).

**Núcleo de feedback / prática**
- **[MVP]** `NoteHighway` — pista horizontal de pitch (alvo + voz ao vivo + letra parada).
- **[MVP]** `PitchCursor` — cursor/blob ao vivo dirigido pela thread DSP.
- `PitchScope` — modo piano-roll/grid de semitons (vibrato/drift), toggle.
- `Visualizer3D` — pele expressiva sobre os dados de pitch, com fallback 2D.
- **[MVP]** `FeedbackBanner` — estado + porquê + micro-ação (KP/KR), com fading.
- `LatencyCalibrator` — calibração única + detecção de Bluetooth.
- `MicPrimer` — pré-prompt custom de permissão de microfone.

**EVA**
- **[MVP]** `EvaAvatar` — ser-de-som (waveform ribbon) com estados (idle/respira, escuta, afinado, acerto, correção).
- **[MVP]** `EvaSpeech` — bolha de microcopy da EVA (elogio/correção/erro/retomada).

**Trilha & progressão**
- **[MVP]** `TrilhaPath` — trilha vertical de nós, cinza→cor.
- **[MVP]** `LessonNode` — nó de exercício (locked/available/complete).
- `AfericaoGate` — portão de maestria (prática vs. graded).
- **[MVP]** `ContinuarCTA` — botão 3D único de próxima ação.
- `MusicNode` — nó de música com auto-transposição.

**Gamificação**
- **[MVP]** `StreakFlame` — chama + calendário de dias.
- **[MVP]** `StreakFreezeCard` — protetor automático + reparo mesmo-dia.
- **[MVP]** `XPCounter` / `StarRating` — XP e estrelas ligadas à precisão DSP.
- `WeeklyGoalRing` — anel de meta semanal.
- `AchievementToast` — Recordes Pessoais + Selos.
- `LeagueBoard` — ligas opt-in, skill-matched (fase posterior, A/B).
- `SoftCurrencyWallet` — "palmas/notas".

**Onboarding**
- **[MVP]** `OnboardingWizard` — wizard uma-pergunta-por-tela.
- **[MVP]** `RangeTest` — teste de extensão vocal (primeiro canto = aha).
- `NotifPrimer` — prompt de notificação personalizado pós-valor.

**Sistema / base**
- **[MVP]** `Button` (variantes: brasa/CTA, dourado, ghost; press-down 3D).
- **[MVP]** `Card` (raio 16–20px, padding 24, sombra quente).
- **[MVP]** `EmptyState` — status + dica + ação (nunca em branco).
- **[MVP]** `LoadingState` — progresso explícito ("Escutando sua voz...").
- `ThemeToggle` — claro (Papel) / escuro (Vigília).
- `Toast` / `Modal` / `Chip` / `ProgressBar` / `Tabs`.
- **[MVP]** Tokens de design (cores, tipo, espaço, raio, sombra) como CSS vars.

**Prova & credibilidade (fase Coursera)**
- `BeforeAfterShare` — gravação antes/depois com link verificável.
- `SkillBadge` — selo de técnica dominada, compartilhável.
- `PartnerStrip` — faixa de autoridade (coaches/ministérios parceiros).

---

## 9. Antipadrões a Evitar

### 9.1 Dark patterns de engajamento
- **Muro de vidas pay-to-continue:** cortar um beginner nervoso no meio da prática é desmotivador e você QUER mais reps. **Nunca bloquear prática.**
- **Perda catastrófica de ofensiva:** streak que se perde de forma irrecuperável cruza para manipulação. Sempre freeze + reparo.
- **Aversão à perda empilhada:** perda em vidas + liga + moeda + streak ao mesmo tempo vira estresse. Só na ofensiva.
- **Confirmshaming / culpa:** "Tem certeza que quer desistir da sua voz?" — proibido. Sem shaming copy.
- **Bombardeio de notificação:** cap de frequência, "proteger o canal". Um lembrete diário no horário escolhido pelo usuário, desligável em um toque.
- **Persona "unhinged" de guilt-trip:** o Duo passivo-agressivo é jogada de TikTok, off-brand para worship/adultos vulneráveis. Lembretes calorosos, nunca ameaçadores.
- **Ligas forçadas/global cutthroat:** cantar é exposto; ranking global desmotiva ansiosos. Opt-in, encorajamento, cohort.
- **Trap opt-outs:** cancelar/desligar sempre em um clique.

### 9.2 Feedback nocivo
- **Cópia clínica/negativa:** "desafinado", "errado", "We can't hear you clearly" — desencoraja exatamente quem você quer reter.
- **Vermelho-buzina / som de erro:** nenhum estado de falha é buzina; rust suave que resolve para sereno.
- **Detectar sem prescrever:** a falha do Vanido. Sempre estado + porquê + micro-ação.
- **Culpar a voz por erro de sistema:** leitura ruim de mic/ruído vira "vamos pra um lugar mais quieto", nunca "sua voz falhou".
- **Scoring que premia volume/ritmo em vez de pitch real:** o oposto do fosso do Canto. Pontuar F0 honesto.
- **Feedback 100% constante:** cria dependência do app. Aplicar fading.

### 9.3 Ruído visual
- **Carrossel de onboarding de 5 telas:** reduz usabilidade; substituir por wizard + primeiro canto.
- **Tela em branco durante DSP:** sempre progresso explícito.
- **3D que obscurece a leitura de pitch:** legibilidade vence floreio; camada 2D de verdade sempre.
- **Arco-íris de cores de gamificação:** disciplina de paleta = confiança (Coursera). Poucas cores.
- **Confete/bounce de caça-níquel:** geometria crescida, glow quente + escala 1.06, sem explosão.
- **Verde-Duolingo ou cobalto-Coursera:** nenhum dos dois. Âmbar/brasa/ameixa em papel/vigília.
- **Clichê churchy:** sem cruzes/pombas/vitrais. Espiritualidade só por cor e luz.
- **Misturar Fraunces e Figtree na mesma linha:** proibido.

---

## 10. Voz e Tom de Escrita

### 10.1 Os quatro pilares (adaptados do Duolingo, calibrados para o Canto)
1. **Calorosa** — "você", chama pelo nome, calor brasileiro ("Bora?", "Respira", "Sem pressa").
2. **Crível** — vocabulário real de coach vocal (apoio, afinação, passaggio, respiração, palato). Essa competência técnica é o fosso vs. gamificação pura.
3. **Celebradora** — comemora micro-progresso, frases curtas, nunca acadêmica.
4. **Inclusiva** — gospel-aware **só quando o usuário opta**, nunca por padrão, nunca denominacional, nunca pregadora/com culpa.

### 10.2 Regra de feedback (o sweet spot Coursera×Duolingo)
Nunca "errado/desafinado" seco. Sempre **encorajador + específico + acionável**: "quase — você ficou um tiquinho abaixo nessa nota, tenta levantar o palato". Reframing assim gerou ~37% de lift de engajamento (dado Coursera). Este é o lever de retenção mais barato do produto.

### 10.3 Guia rápido de estilo
- Frases **curtas** e conversacionais. Uma ideia por linha.
- **Sentence case** no corpo (Figtree). Fraunces carrega os momentos de emoção.
- Números concretos quando encorajam ("sua extensão subiu duas notas"), nunca quando julgam.
- Chamar de "seu canto", "sua voz", "sua ofensiva" — linguagem de posse e pertencimento.
- Emojis: com muita parcimônia (chama de ofensiva, nota musical). Nunca poluir.

### 10.4 Faça / Não faça

| Faça | Não faça |
|---|---|
| "Isso! Segurou a nota — sentiu o apoio?" | "Correto." / "Nota acertada. +10 XP." (seco) |
| "Passou um tiquinho do tom, respira e vem de novo." | "Errado. Você está desafinado." |
| "Tô com dificuldade de te ouvir. Um cantinho mais quieto?" | "Não conseguimos ouvir sua voz claramente." |
| "Sua ofensiva de 6 dias tá te esperando." | "Você vai perder tudo! Não decepcione a EVA." |
| "Quer ensaiar aquele louvor pro domingo?" (opt-in) | "Cante para o Senhor agora!" (pregador, por padrão) |
| "Três dias seguidos. Tá construindo algo bonito." | "Streak or die. Não quebre a corrente." |

### 10.5 Registro por contexto
- **Onboarding / herói:** Fraunces, emocional, aurora — "Encontre sua voz. No seu canto."
- **UI diária / prática:** Figtree, prática, quente — "Bora aquecer? Cinco minutinhos."
- **Marketing / social (Louvor Moderno):** mais confiante e urbano, fotografia documental de cantores reais, ainda sem culpa nem clichê.

---

*Documento vivo. Mantido curto e estrito de propósito (disciplina Coursera): um sistema pequeno e bem sustentado bate um rico e inconsistente — e é o que um fundador solo consegue segurar. Métrica-norte de tudo aqui: retorno D1/D7/D30. Se uma decisão de design não serve à segurança psicológica do cantor inseguro ou ao seu retorno amanhã, ela não entra.*
