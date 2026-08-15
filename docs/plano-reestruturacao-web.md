# Plano de Reestruturação do App Web do Canto

> **Blueprint de tech lead.** Transforma a pesquisa (design/experiência, pedagogia do canto, psicologia da motivação) e as decisões de arquitetura mobile num plano concreto para **reconstruir a arquitetura de UI e o design** do Canto **por cima do motor de DSP que já funciona** — sem quebrá-lo.
>
> **Data:** 2026-07-09 · **Executor:** fundador solo (React, Windows, sem Mac) · **Beachhead:** cantores gospel/worship no Brasil, adultos que se acham "desafinados", Android mid/low-range.
>
> **Regra de ouro deste documento:** o motor de áudio (`src/audio/*` + `dsp/` + `src/wasm/`) é o ativo mais maduro e o diferencial competitivo. Ele **não se reescreve**; ele se **destrava, se estende e se reusa**. Tudo que for reestruturado gira em torno de preservá-lo intacto e prepará-lo para o futuro app React Native (RN), sem bloquear o web hoje.

---

## Sumário

1. [Princípios da reestruturação](#1-princípios-da-reestruturação)
2. [Nova arquitetura de IA/UI](#2-nova-arquitetura-de-iaui)
3. [Nova estrutura de pastas/camadas](#3-nova-estrutura-de-pastascamadas)
4. [Aplicação do sistema de design](#4-aplicação-do-sistema-de-design)
5. [Estratégia de migração/refactor incremental](#5-estratégia-de-migraçãorefactor-incremental)
6. [O que NÃO quebrar — o motor de áudio](#6-o-que-não-quebrar--o-motor-de-áudio)
7. [Roadmap sequenciado (dev solo)](#7-roadmap-sequenciado-dev-solo)

---

## 1. Princípios da reestruturação

Sete princípios inegociáveis. Cada um carrega o *porquê* ligado à pesquisa. Quando dois conflitarem, a ordem abaixo é a prioridade.

### PR1 — Separar domínio / lógica / estado / motor-de-áudio da renderização
**O quê:** toda regra de negócio, estado, análise vocal e orquestração de áudio vive em módulos **TS puros, sem `import React`**. As telas (`.tsx`) só consomem esses módulos via hooks finos e escrevem no DOM/canvas. A renderização é a única camada descartável.

**Por quê:** é a decisão que já tornou o motor de áudio portável e é a mesma que vai baratear o app RN. O `plano-react-native.md` é explícito: `src/data/*`, `src/audio/perception|register|vibrato|notes|session|*` são **TS puro → copiam direto**; só a camada de render (`div`/CSS → `View`/StyleSheet, React Router → React Navigation) se reescreve. Hoje isso já é verdade no motor (nenhum arquivo de `src/audio` importa React) — a reestruturação **estende essa disciplina para o resto do app**, onde ela ainda falha (222 usos de `style={{}}` inline em 30 telas, 26 hex hardcoded, lógica misturada em componentes de ~400 linhas como `Coach.tsx`).

**Regra concreta:** nenhuma tela nova pode conter fórmula de negócio, cor hex ou chamada de storage direta. Se precisar, extrai para `src/domain/*`, `src/design/*` ou um hook.

### PR2 — Segurança psicológica antes de tudo (o primeiro sentimento nunca é vergonha)
**O quê:** nenhum estado de erro é vermelho-buzina; nenhuma cópia é clínica ("desafinado", "errado", "não te ouvimos"). Toda correção vem embrulhada em encorajamento + a **próxima micro-ação**.

**Por quê:** o público carrega a ferida de "não sei cantar". SDT (Deci & Ryan) mostra que motivação intrínseca depende de **competência percebida**; um iniciante humilhado no minuto 1 não volta. `pedagogia-motivacao.md` (§5, MPA/Kenny) e `pedagogia-canto.md` (§6, Kluger & DeNisi: ~1/3 dos feedbacks *pioram* o desempenho quando desviam a atenção para o "eu") tornam isso uma restrição de engenharia, não estética. O reframing "Incorrect" → "Almost there, here's a tip" rendeu ~37% de engajamento (Coursera).

### PR3 — O caminho é o lar; a próxima ação é sempre óbvia
**O quê:** a home **é** a trilha. Uma jornada guiada de nós (respiração → afinação → extensão → música) com um CTA único "Continuar". Sem paralisia de escolha.

**Por quê:** P3 do `canto-design-experiencia.md` + progressive disclosure (NN/G). Hoje o app tem 20+ rotas planas num sidebar (`main.tsx`), com a trilha sendo *um card entre muitos* no Dashboard. A reestruturação promove a trilha a espinha de navegação e esconde o resto atrás dela.

### PR4 — Feedback em tempo real que DESVANECE (fading), nunca cria dependência
**O quê:** o feedback de pitch é rico no início e **espaça conforme a maestria cresce** (resumido → só quando sai da faixa → rep final sem feedback). Distingue KP (processo) de KR (resultado).

**Por quê:** é a conclusão #1 da `pedagogia-canto.md`: a hipótese da orientação (Salmoni/Schmidt/Walter 1984) e a FIT preveem que uma linha de pitch sempre-ligada vira muleta — o cantor terceiriza a detecção de erro para a tela e desaba sem o app. **A métrica de sucesso é retenção sem ajuda**, não acurácia na sessão. Hoje o feedback é 100% always-on (a auditoria confirma: "FADING FEEDBACK IS ABSENT — core vision miss"). Este é o maior buraco entre código e visão, e a reestruturação o trata como uma **política de feedback de primeira classe** no motor (ver §2.5 e §6).

### PR5 — Domínio real com portões (Aferição), não só ofensiva
**O quê:** separar **modo prática** (ilimitado, perdoador, feedback contínuo) de um **teste de maestria ("Aferição")** medido pelo DSP, que precisa ser passado para desbloquear a próxima técnica.

**Por quê:** P5 do design + `pedagogia-canto.md` §5 (maestria por unidade; item avaliado cedo ↑ conclusão). Hoje o "portão" é cosmético (anel dourado em `score>=90`, nós "locked" que abrem mesmo assim). A reestruturação transforma isso num módulo real de gate (`src/domain/mastery`) alimentado pelos números que o `SessionAggregator` já produz.

### PR6 — Vitória de maestria nos primeiros ~60s; tempo-até-valor < 5min
**O quê:** o onboarding TEM que terminar com o usuário tendo **cantado** e visto/ouvido um resultado real da EVA, sem cadastro/tutorial/config antes.

**Por quê:** Bandura (autoeficácia; `pedagogia-motivacao.md` §3: "engenheirar uma vitória de maestria nos primeiros 60 segundos") + benchmark de ativação (69% de correlação ativação-7d ↔ retenção-3m). Hoje o onboarding é um form de nome/range/goal e a primeira conquista dispara só por *registrar uma sessão* — não por um momento de competência garantido.

### PR7 — Legibilidade vence floreio; uma deixa focal por vez
**O quê:** existe sempre a **camada 2D de verdade** (note highway/scope) que responde a cada frame "estou afinado? subir ou descer?". O 3D é pele aditiva sobre os mesmos dados, com toggle. UI mostra **uma deixa por vez** (pitch OU sopro OU vogal).

**Por quê:** P7 do design + carga cognitiva (Sweller; `pedagogia-canto.md` §c: "UI de uma deixa por vez"). Nenhum líder de mercado usa 3D; todos vencem em vistas planas de alto contraste. Acessibilidade AA: pitch nunca depende só de cor.

---

## 2. Nova arquitetura de IA/UI

A UI se reorganiza em torno de **um loop**: trilha (home) → sessão/lição → feedback com fading → celebração/EVA → volta à trilha com um nó aceso. Abaixo, cada peça.

### 2.1 Trilha-como-home
- **Uma rota raiz (`/`) = a trilha vertical.** Nós acendem de cinza para cor conforme se progride (padrão Vanido+Duolingo). Camadas: **Respiração & Apoio → Afinação → Extensão → Música** (`canto-design-experiencia.md` §5.1).
- **CTA único "Continuar"** (`ContinuarCTA`, botão brasa 3D) sempre aponta o próximo nó — sem paralisia (PR3).
- **Estado de trilha vira entidade sincronizada** (`src/domain/path`), não inferência client-side de sessões cruas. A auditoria de backend aponta que hoje "a trilha não é a home na camada de dados" — sem posição autoritativa de passo atual. Reestruturar exige uma `pathPosition`/`currentStep` persistida (ver §5) para a trilha ser o lar cross-device.
- **O que já existe e se preserva:** o sistema de nós serpentinos (`.dsh-mp-node`/`.dsh-step` em `dashboard.css`, `src/pages/Exercises.tsx`) — o primitivo mais vision-crítico já está prototipado. Refatora-se, não se reinventa.

### 2.2 Estrutura de sessão/lição
Anatomia de cada nó (`canto-design-experiencia.md` §5.2 + `pedagogia-canto.md` §a/§b):

1. **Micro-explicação da EVA** (segundos, não vídeo) — modelagem antes da tentativa (Rosenshine; exemplo trabalhado para novatos).
2. **SOVT como abertura ritual** — canudo/lip-trill/humming é a técnica mais embasada da ciência vocal (Titze; Kapsner-Smith 2015) e deve ser a **espinha do aquecimento diário**. Hoje "SOVT não é o backbone da retenção" (auditorias de gamificação e EVA). Ver §6 para o gap de análise SOVT no motor.
3. **Sing-back imediato** com feedback DSP em tempo real (a máquina de flow: metas claras + feedback imediato já vêm de graça — `pedagogia-motivacao.md` §4).
4. **Auto-estimar-então-revelar** (interação-assinatura): a EVA pergunta "como você acha que ficou — alto, baixo ou no ponto?" **antes** do DSP revelar o contorno (Guadagnoli & Kohl 2001; constrói o ouvido interno).
5. **Aferição** ao final da habilidade — portão de maestria medido pelo DSP (PR5).
6. **Celebração competência-informativa** — glow + escala 1.06, sem confete; EVA narra o *porquê* ("segurou a nota — foi o apoio").

**Duração default:** 3–5 min de canto ativo (respeita fadiga vocal), até ~8–10 min para engajados. **Espaçamento-nativa:** limitar material novo/dia, reapresentar exercícios em intervalos crescentes (~1,3,7,16 dias). O `src/data/review.ts` (spaced review) já é a base disso.

### 2.3 Onboarding com vitória de maestria em ~60s
Fluxo (wizard, uma coisa por tela; `canto-design-experiencia.md` §6):

1. **Boas-vindas** (1 tela, gradiente Amanhecer) — sem carrossel de 5 telas.
2. **MicPrimer** (pré-prompt custom ANTES do `getUserMedia`): "O Canto escuta sua voz pra EVA te guiar. Nada é gravado nem enviado."
3. **RangeTest = o primeiro canto = o aha:** o motor DSP mede a extensão ao vivo (`src/pages/RangeTest.tsx`, `src/audio/voiceType.ts` já existem). Zero estados de falha.
4. **Primeiro exercício guiado in-context** — note highway + feedback DSP, dicas no contexto (pull, não push).
5. **Primeira vitória avaliada + conquista dia-1** ("Primeira nota afinada") — um sucesso audível e inegável (Bandura).
6. **Prompt de cadastro no pico emocional** — só agora, para *salvar* o progresso. Reestruturação de auth: **email-only, tenant pessoal auto-provisionado, sem pedir slug de "organização"** (a auditoria de auth aponta o slug como muro B2B que mata o aha e quebra login cross-device).
7. **NotifPrimer personalizado** ("Que horas costuma sobrar um tempinho?").

**Desmontar o mito do talento** com dado no onboarding: afinação é treinável para ~98,5% (amusia real ~1,5%). A EVA **jamais** rotula "desafinado".

### 2.4 Presença da EVA (ever-present, luminosa)
- **EVA deixa de ser destino** (rota `/eva` + card passivo) e vira **companheira tecida na trilha**: micro-explicações nos nós, celebração narrada, retomada de ofensiva, correção com micro-ação. A auditoria: "EVA é um DESTINO, não ever-present".
- **Render = waveform luminosa âmbar**, não a spark verde estática (`.eva-avatar → var(--good)`). O orb `AudioBlob.tsx` já reage ao DSP via `engine.subscribe` — reconecta-se à identidade da EVA no token âmbar `#F2A83B`/núcleo ameixa `#7A3E93`, com estados: idle respira (4s/0,25Hz), escuta (corpo-onda ao vivo), afinado (glow teal), acerto (pulso dourado), correção (rust que resolve para sereno).
- **Uma voz, testável, no repo.** Hoje há três vozes que derivam: prompt LLM externo (`docs/eva-setup.md`), fallback local (`Coach.tsx`), e `diagnose()` (`src/data/coaching.ts`). Reestruturação: colapsar num **módulo único `src/domain/eva-voice`** (in-repo, com testes que assertam "nunca diz desafinado"), com o LLM como camada opcional por cima. `src/data/eva.ts` (transporte + `buildStudentContext` que omite o pitchTimeline) e `coaching.ts` (diagnose puro) já são framework-agnósticos e se preservam.
- **Privacidade preservada como está:** só feature-JSON viaja, nunca áudio. É o diferencial e está honrado end-to-end — não tocar.

### 2.5 UX de feedback em tempo real com FADING
O cerne do PR4. Hoje o motor emite `smoothedFreq/note/cents` todo frame e o `ExercisePlayer` mostra agulha o exercício inteiro. A reestruturação insere uma **camada de política de feedback** entre o motor e a UI:

| Regra | Implementação | Fonte |
|---|---|---|
| **Desvanecer** ao longo da aquisição | Nova `FeedbackPolicy` (`src/domain/feedback-policy`) que recebe a maestria do exercício e retorna intensidade: rico → sumário → só-fora-da-faixa → rep sem feedback | Salmoni et al. 1984 |
| **Feedback de banda** | Só sinalizar desvio > tolerância (~25 cents), não uma linha nervosa | `pedagogia-canto.md` §c |
| **KR vs KP** | KP (processo) durante para novatos; KR (resultado) resumido ao final conforme melhora | Salmoni; Wisniewski 2019 |
| **Foco externo** | O cursor/fita é o alvo externo ("mire a fita"), nunca anatomia | Wulf/Chua 2021 |
| **Latência percebida** | Renderizar o cursor direto dos frames do motor (já é imperativo, ~60fps sem re-render React) | `canto-design-experiencia.md` §7.3 |
| **Detecção sem prescrição = proibido** | Sempre estado + porquê + micro-ação | Regra de ouro §7.4 |

**Onde plugar:** a `FeedbackPolicy` é um objeto TS puro que os consumidores (`NoteHighway`, `PitchCursor`, `EvaSpeech`) honram. Ela lê a maestria por-exercício (de `src/domain/mastery`) e atenua/suprime o cents ao vivo. Não toca o motor DSP — envolve a saída dele. Isso mantém o motor intacto (§6) e ainda entrega o anti-dependência que a visão exige.

### 2.6 Camada 2D de verdade + 3D aditivo
- **2D default sempre presente:** `NoteHighway` (alvo + voz ao vivo + letra parada) e `PitchScope` (piano-roll/grid de semitons para vibrato/drift). Hoje `PitchDisplay.tsx`/`PitchGraph.tsx` existem como always-on — refatoram-se para honrar a `FeedbackPolicy`.
- **3D como pele:** `Body3D.tsx`/`AudioBlob.tsx` sobre os mesmos dados, com toggle e fallback 2D (budget de frame Android). Nunca obscurece agudo/grave (PR7).

---

## 3. Nova estrutura de pastas/camadas

Quatro camadas com fronteiras duras. **`engine` e `domain` nunca importam `ui` nem React.** `design` é dados (tokens) + componentes de apresentação puros. `ui` é a única camada descartável na migração RN.

```
src/
├── engine/           ← MOTOR DE ÁUDIO/DSP — preservar intacto (só re-fiar transporte no RN)
│   ├── PitchEngine.ts        (orquestrador; lógica portável, transporte web-only)
│   ├── perception.ts  register.ts  vibrato.ts  notes.ts  voiceType.ts
│   ├── session.ts  breathCycle.ts  songRoll.ts  resample.ts  mpm.ts
│   ├── TonePlayer.ts
│   ├── transport/            ← a "cola de browser" (descartável no RN)
│   │   ├── ringbuffer.ts  dsp-worker.ts  swiftf0-worker.ts
│   │   └── (public/worklets/capture-processor.js, src/wasm/*)
│   └── policy/               ← NOVO
│       └── FeedbackPolicy.ts (fading; envolve a saída, não o motor)
│
├── domain/           ← REGRA DE NEGÓCIO — TS puro, sem React, RN-reusável
│   ├── path/          (posição na trilha, currentStep — NOVO, sincronizado)
│   ├── mastery/       (Aferição: gate pass/fail do DSP — NOVO)
│   ├── gamification/  (xp.ts gamification.ts achievements.ts review.ts)
│   ├── curriculum/    (curriculum*.ts exercises.ts exercise-library.ts tracks.ts skills.ts songs.ts pathMilestones.ts harmony*.ts adaptive.ts)
│   ├── eva-voice/     (coaching.ts + fallback unificado + testes "nunca desafinado" — NOVO/consolidado)
│   ├── retention/     (streak, freeze, weeklyGoal, reminder — extrair de store.ts)
│   ├── storage/       (StorageAdapter: localStorage web / AsyncStorage RN — NOVO)
│   ├── net/           (api.ts sync.ts billing.ts eva.ts)
│   ├── health/        (vocalHealth.ts)
│   └── types.ts
│
├── design/           ← SISTEMA DE DESIGN (dados + apresentação pura)
│   ├── tokens/        (tokens.ts: fonte única — CSS vars + JS map derivados daqui)
│   ├── theme/         (ThemeProvider, data-theme, claro/escuro — NOVO)
│   └── components/    (Button, Card, Chip, EmptyState, LoadingState, StreakFlame, XPCounter, EvaAvatar, NoteHighway, PitchCursor, TrilhaPath, LessonNode, ContinuarCTA…)
│
├── ui/               ← TELAS (única camada reescrita no RN: div/CSS→View/StyleSheet)
│   ├── shell/         (AppShell, Sidebar→BottomNav, TopBar, Auth*, Error)
│   ├── home/          (Trilha — era Dashboard/Exercises)
│   ├── session/       (SessionPlayer — era ExercisePlayer/Practice/ReviewRunner)
│   ├── onboarding/    (OnboardingWizard, RangeTest)
│   ├── eva/           (chat opcional; a presença principal é embutida)
│   └── … (Progress, Planos, Musicas, Ministerio, Comunidade, Saude, Settings)
│
├── hooks/            ← seams finos React (usePitchEngine, useEntitlement, useTheme)
└── app/              ← composição (providers, router)
```

### Mapeamento contra os arquivos reais de hoje

| Camada nova | Arquivos de hoje | Ação |
|---|---|---|
| `engine/` | `src/audio/*` inteiro, `src/wasm/*`, `dsp/`, `public/worklets/*` | **Mover, não reescrever.** Só mudar imports. Isola `transport/` para marcar o que o RN descarta. |
| `engine/policy/` | — | **Criar** `FeedbackPolicy` (o fading que falta). |
| `domain/` | `src/data/*` quase inteiro | **Mover.** É TS puro; `plano-react-native.md` confirma "copia direto". |
| `domain/path` + `domain/mastery` | — (hoje inferido de sessões cruas + `reviewsDone` local) | **Criar.** Entidades sincronizadas (§5). |
| `domain/storage` | `store.ts` (hard-coded `window.localStorage`) | **Extrair `StorageAdapter`.** É "o maior bloqueador de portabilidade RN" (auditoria auth). |
| `domain/eva-voice` | `coaching.ts` + fallback duplicado em `Coach.tsx` + `docs/eva-setup.md` | **Consolidar** três vozes numa, com testes. |
| `design/tokens` | `src/styles/tokens.css` + `src/theme.ts` (COLORS duplicado) | **Unificar numa fonte única** (§4). |
| `design/components` | `src/styles/components.css` (classes) + `src/components/*` | **Refatorar/re-skin.** Primitivos existem (btn/card/badge/chip/bar/toggle). |
| `ui/` | `src/pages/*`, `src/app/AppShell|Sidebar|TopBar` | **Manter lógica, reescrever render** na migração RN. No web, limpar inline styles/hex. |
| `hooks/` | `usePitchEngine.ts`, `useEntitlement.ts` | **Manter.** São os seams RN (≈25 linhas). |

> **Nota de pragmatismo (dev solo):** não é preciso um big-bang de mover 90 arquivos num commit. Renomear `src/audio → src/engine` e `src/data → src/domain` são dois commits mecânicos de baixo risco (só imports). As subpastas (`path`, `mastery`, `policy`, `storage`, `eva-voice`) nascem *quando a feature correspondente for construída*, não antes.

---

## 4. Aplicação do sistema de design

O app hoje é um **tema escuro único** ("Estúdio noturno") âmbar-por-toda-parte — o quase-inverso da visão (neutro + âmbar-acento). A reestruturação inverte isso.

### 4.1 Fonte única de tokens (mata a duplicação)
Hoje a cor vive em **dois lugares que precisam ser sincronizados à mão**: `src/styles/tokens.css` (CSS vars) e `src/theme.ts` (JS `COLORS`, "devem espelhar os tokens"). Criar `src/design/tokens/tokens.ts` como **fonte única**; dele derivam (a) as CSS custom properties e (b) o objeto JS que o canvas lê. No RN não há CSS — só o objeto JS sobrevive, então a fonte precisa ser JS/TS. Isso é PR1 aplicado ao design.

### 4.2 Neutros + âmbar-acento (a decisão de fundo do fundador)
O âmbar é **acento e alicerce de marca**, nunca parede (`canto-design-experiencia.md` §3, decisão 2026-07-09). Substituir o `:root` espresso por tokens neutros alternáveis:

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#17161A` | Fundo base (neutro, escolha do usuário) |
| `--surface` | `#F5F4F2` | `#211F24` | Cards |
| `--border` | `#E6E4E0` | `#312E38` | Bordas |
| `--text` | `#211E1B` | `#F3F1EE` | Texto |
| `--muted` | `#6E6258` | `#A29CA8` | Secundário |
| `--cor-dourado` | `#F2A83B` | `#F2A83B` (glow) | Acento/XP/conquista/glow EVA |
| `--cor-brasa` | `#E4572E` | `#E4572E` | CTA primário ("Continuar", "Cantar") |
| `--cor-manto` | `#7A3E93` | `#8E4585` | EVA/premium |
| `--cor-sereno` | `#1F8A76` | `#1F8A76` | "Afinado" (não verde-Duolingo) |
| `--cor-rust` | `#C4462C` | `#C4462C` | Off-pitch gentil (nunca vermelho-buzina) |

Semântica de estado (§3.4): afinado = teal + **pista não-cor** (shimmer/snap), nota acertada = glow dourado, levemente fora = rust suave com dica, erro de sistema = neutro que culpa o ambiente. **Toda pista de pitch tem sinal além da cor** (WCAG AA; daltônicos; comprador institucional).

### 4.3 Tipografia: Fraunces + Figtree
- **Fraunces** (display) já está correto e wired em `h1-h4`/`.page-title` — preservar.
- **Trocar Bricolage Grotesque → Figtree** (UI/corpo) em `tokens` + `index.html`. Bricolage fica só no registro de campanha "Louvor Moderno".
- Regra: nunca misturar Fraunces e Figtree na mesma linha. Fraunces carrega emoção; Figtree carrega informação.
- **Empacotar as fontes localmente** (self-host) em vez de Google Fonts render-blocking — necessário para offline/CSP e alinha com o futuro RN.

### 4.4 Tema claro/escuro alternável
Hoje **não existe** `@media (prefers-color-scheme)`, `[data-theme]`, nem toggle — só um `:root`. Construir:
1. Segundo bloco de tokens (escuro) + `:root[data-theme="dark"]`/`light` + `@media (prefers-color-scheme)` como default.
2. `ThemeProvider` (`src/design/theme`) que estampa `data-theme` na raiz e persiste a escolha (via `StorageAdapter`).
3. `ThemeToggle` componente. No RN, o mesmo provider entrega o objeto de tokens por Context — a lógica sobrevive, só o mecanismo (data-attribute vs Context) troca.

### 4.5 Componentes a construir/refatorar
**Refatorar (existem, re-skin):** `Button` (adicionar press-down 3D tátil: borda-de-baixo sólida 3–4px que afunda — herda o affordance do Duolingo em brasa, não verde), `Card` (raio 16–20px, padding 24, sombra quente), `Chip`, `bar`, `toggle`, `StreakFlame`, `XPCounter`, os nós de trilha (`.dsh-mp-node`).

**Construir [MVP]** (do inventário §8 do design): `NoteHighway`, `PitchCursor`, `FeedbackBanner` (com fading), `EvaAvatar` (waveform, estados), `EvaSpeech`, `TrilhaPath`, `LessonNode`, `ContinuarCTA`, `AfericaoGate`, `EmptyState` (status+dica+ação, nunca em branco), `LoadingState` ("Escutando sua voz..."), `ThemeToggle`.

**Higiene que destrava o re-tema:** eliminar os **26 hex hardcoded** (Sidebar, Onboarding, VoiceInsights, Progress, SessionSummary, Body3D, RangeTest) e os **222 `style={{}}` inline** (Dashboard, Ministerio, ExercisePlayer, Settings, Progress) — eles não seguem troca de tema e são o que quebra qualquer re-skin. Trocar por tokens/classes é pré-requisito, não polish.

### 4.6 Movimento (Android mid-range)
Animações via `transform`/`opacity` (compostas na GPU); EVA respira 4s; celebração glow + escala 1.06 (sem confete/bounce); transições 200–300ms ease-out; respeitar `prefers-reduced-motion` (já respeitado em `base.css` — preservar). Nada de arco-íris de gamificação: disciplina de paleta = confiança (Coursera).

---

## 5. Estratégia de migração/refactor incremental

**Filosofia: incremental, nunca big-bang.** Cada passo entrega algo rodando; o app web nunca fica quebrado; a ordem protege o motor. Três baldes:

### 5.1 PRESERVAR INTACTO (não tocar a lógica)
- **Todo o motor de áudio/DSP:** `src/audio/*`, `dsp/src/lib.rs`, `src/wasm/*`, `public/worklets/*`. Só **mover de pasta** (`src/audio → src/engine`, ajustando imports) — zero mudança de comportamento. Ver §6.
- **A privacidade da EVA:** `buildStudentContext` (omite pitchTimeline), "só métricas viajam". Não tocar.
- **Auth de produção:** argon2, JWT + refresh rotativo, verificação/reset, throttling (`server/src/auth/*`, `src/data/api.ts`). Sólido; preservar. (Ajuste pontual: remover o **muro do slug de tenant** no login/registro consumer — §2.3.)
- **A matemática Rust e o `model.onnx`:** são o ativo "write-once" para o RN. Intocados.
- **`prefers-reduced-motion`** global em `base.css`.

### 5.2 REFATORAR (mesma lógica, nova forma)
- **Renomear camadas** `src/audio→engine`, `src/data→domain` (2 commits mecânicos).
- **Extrair `StorageAdapter`** de `store.ts` (localStorage → interface; destrava RN e é pré-requisito de qualquer sync novo).
- **Unificar tokens** (`tokens.css` + `theme.ts` → `design/tokens/tokens.ts`).
- **Consolidar as 3 vozes da EVA** em `domain/eva-voice` com testes.
- **Limpar inline styles/hex** tela a tela (viabiliza tema).
- **Promover a trilha a home**; rebaixar o resto do sidebar para navegação secundária.
- **Corrigir a fonte única de XP:** hoje o cliente (`src/data/xp.ts`) e o servidor (`session.processor.ts`) divergem (o servidor omite o bônus de registro limpo), então o leaderboard não bate com o dashboard. O servidor deve ser autoridade (ou compartilhar spec) para qualquer coisa exibida entre usuários.

### 5.3 CONSTRUIR/REESCREVER (o que falta vs. visão)
- **`FeedbackPolicy`** (fading) — o maior gap; envolve a saída do motor.
- **`domain/mastery`** (Aferição real, gate que trava progressão) — usa números que `SessionAggregator` já produz.
- **`domain/path`** (posição na trilha sincronizada) — hoje inexistente na camada de dados.
- **Onboarding com vitória em 60s** — reescrever `Onboarding.tsx`.
- **EVA ever-present + waveform** — reconectar `AudioBlob` à identidade EVA; tecer na trilha.
- **Tema claro/escuro + toggle.**
- **Persistir retenção server-side** (streak/freeze/weeklyGoal/reminder hoje são localStorage-only → reinstalar apaga a ofensiva, um dark pattern acidental que a visão SDT rejeita). Adicionar colunas/JSON em `UserState` + campos no `UserStatePayload`.
- **Lembrete diário de verdade** (hoje é dead code: `getReminder/setReminder` existem mas ninguém lê; `sw.js` não tem push). Precisa de fluxo de permissão + UI em Settings + Web Push/periodicSync.

### 5.4 Sequência que mantém tudo verde
Cada balde acima é aplicável **por fatia vertical** (uma habilidade da trilha por vez), não por camada horizontal completa. Ex.: reestruturar a habilidade "Afinação" ponta-a-ponta (trilha → sessão → fading → Aferição → EVA) prova o padrão antes de replicar. Isso espelha o "incremental vence big-bang" do `decisao-mobile.md` §6.

---

## 6. O que NÃO quebrar — o motor de áudio

> **Destaque.** O motor de áudio é o diferencial competitivo e a parte mais bem-arquitetada do app. Qualquer reestruturação que o degrade é um retrocesso, não progresso. Regras duras:

1. **A fronteira motor/UI é sagrada e já está certa.** Nenhum arquivo de `src/audio` importa React; `PitchEngine` é classe pura; `usePitchEngine` é o seam de ~25 linhas; componentes consomem via `engine.subscribe()` escrevendo em canvas/DOM (zero re-render React a ~60fps). **Toda UI nova consome o motor por esse mesmo contrato** — nunca puxando frames para o estado React.

2. **O fading envolve, não invade.** A `FeedbackPolicy` fica *entre* o motor e a UI. O motor continua emitindo `PitchFrame` completo; a política decide o que a UI mostra. **Não** adicionar lógica de maestria/fading dentro de `PitchEngine.ts`, `perception.ts` ou do WASM.

3. **Pipeline off-main-thread preservado:** AudioWorklet (captura) → ring lock-free SAB (Atomics) → worker WASM (MPM) + worker ONNX (SwiftF0, veto de oitava) → `PitchEngine` (reconciliação + perception + register) → `subscribe`. Não mover DSP para a main thread nem para o estado React.

4. **Cross-origin isolation intocado:** COOP/COEP em `vite.config.ts` (necessário para SAB/AudioWorklet), stripping do wasm morto do ORT, `/ort/*` raw. Mexer aqui quebra o motor premium silenciosamente (cai no fallback TS-MPM).

5. **Extensões do motor são aditivas, atrás do contrato existente:**
   - **Análise SOVT** (flutter de lip-trill, estabilidade de canudo) — hoje ausente; SOVT é tratado como pitch monofônico genérico. Adicionar como *novas features* no pipeline, não substituindo o F0.
   - **Módulo de Aferição** — consome o `FeatureReport` que `session.ts` já produz; não altera o motor.
   - **Stream para a waveform da EVA** — deriva de sinais que o motor já expõe (dynamics/steadiness/smoothedFreq/snr).

6. **Ao mover `src/audio → src/engine`:** só imports mudam. Rodar o self-test 220Hz (já existe nos workers) e o smoke test do WASM (`dsp/test-wasm`) depois de cada commit de movimentação. Idealmente, adicionar testes unitários aos módulos puros (`perception/register/session/mpm/vibrato`) **antes** de refatorar — hoje eles não têm rede de segurança, e são exatamente os destinados ao reuso RN.

7. **Preparar o reuso RN sem reescrever agora:** isolar o transporte web-only (`ringbuffer.ts`, `dsp-worker.ts`, `swiftf0-worker.ts`, `capture-processor.js`) numa subpasta `engine/transport/` e definir uma interface `PitchSource` transport-agnóstica, para que `perception/register/session` sentem sobre uma captura trocável (web hoje, nativa depois). Isso é o que o `plano-react-native.md` §3 recomenda e barateia a Fase 1 do RN — **sem** tocar a matemática.

**Dívidas do motor a corrigir com cuidado (não urgentes, mas reais):** MPM implementado em dois lugares (Rust + `mpm.ts`) sem fonte única; layout do ring duplicado em 3 lugares (um hardcoded em `capture-processor.js`); `engine.stop()` com race entre `ExercisePlayer`/runners/`usePitchEngine` no singleton do `AppContext` (a reestruturação da sessão deve centralizar o ciclo de vida do engine num só dono). Corrigir estas ao tocar as áreas adjacentes, com testes primeiro.

---

## 7. Roadmap sequenciado (dev solo)

Ordem que maximiza valor e minimiza risco ao motor. Cada onda entrega algo publicável.

- **Onda 0 — Fundação (baixo risco, mecânico):** renomear `audio→engine` e `data→domain`; extrair `StorageAdapter`; unificar tokens numa fonte única; adicionar testes unitários aos módulos puros do motor. *Nada muda para o usuário; tudo fica mais reusável.*

- **Onda 1 — Sistema de design neutro + tema:** tokens claro/escuro, Figtree, `ThemeProvider`+toggle, refatorar `Button`/`Card` (press-down 3D), limpar inline styles/hex. *O app muda de cara sem mudar de comportamento.*

- **Onda 2 — Trilha-como-home + sessão:** promover trilha a `/`; `ContinuarCTA`; reestruturar `ExercisePlayer/Practice/ReviewRunner` num `SessionPlayer` com a anatomia §2.2; centralizar o ciclo de vida do engine.

- **Onda 3 — Feedback com FADING + Aferição:** `FeedbackPolicy`, `domain/mastery`, `AfericaoGate`, auto-estimar-então-revelar. *O anti-dependência que é o coração pedagógico.*

- **Onda 4 — EVA ever-present + onboarding 60s:** consolidar `eva-voice`, waveform luminosa, tecer EVA na trilha, reescrever onboarding (email-only, vitória em 60s), MicPrimer.

- **Onda 5 — Retenção durável:** persistir streak/freeze/weeklyGoal server-side; lembrete diário real; corrigir fonte única de XP; SOVT como ritual diário.

- **Onda 6 — Preparo RN:** isolar `engine/transport/`, definir `PitchSource`. *Ponte para o `plano-react-native.md` sem começar o RN ainda.*

> **Métrica-norte de tudo:** retorno D1/D7/D30 e **retenção sem ajuda** (cantar afinado com o feedback OFF, dias depois) — não acurácia dentro da sessão. Se uma decisão não serve à segurança psicológica do cantor inseguro ou ao retorno amanhã, ela não entra.
