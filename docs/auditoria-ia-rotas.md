# Auditoria — Shell, Roteamento e Arquitetura de Informação (Canto Web)

Mapa do app web atual (React 18 + Vite + TypeScript). Cada afirmação está
ancorada em um arquivo real de `src/`. Escopo: casca (shell), rotas, telas,
navegação, a trilha de aprendizado e o estado/contexto — seguido das lacunas
frente à visão de produto.

## Bootstrap / entrada

O ponto de entrada é `src/main.tsx`. Ele monta a árvore inteira sem
`React.StrictMode` (para não duplicar `getUserMedia`/`AudioContext`) e mantém o
root do React 18 em singleton no `window` (`__cantoRoot`) por causa do HMR. A
hierarquia de providers é: `<ErrorBoundary>` (`src/app/ErrorBoundary.tsx`) →
`<BrowserRouter>` → `<AuthProvider>` (`src/app/AuthContext.tsx`) →
`<AppProvider>` (`src/app/AppContext.tsx`) → `<Routes>`. Um Service Worker
(`public/sw.js`) é registrado só em produção.

- `AuthProvider` guarda `status: 'loading' | 'anon' | 'authed'`, valida o token
  em `/me` na abertura e, após login, hidrata perfil/range/settings/conquistas e
  sessões do backend (`afterAuth` → `fetchUserState`/`fetchServerSessions`).
- `AppProvider` expõe o motor de pitch (`usePitchEngine`), o `micStatus`, e todo
  o estado do usuário lido do store local (`baseline`, `profile`, `settings`,
  `streak`, `sessions`, `gamification`) com uma função `reload()`.
- `RequireAuth` (em `main.tsx`) é o portão: em `status === 'anon'` redireciona
  para `/bem-vindo`.

## Rotas

Todas declaradas em `src/main.tsx`. As rotas privadas ficam sob um layout
`<AppShell />` (com sidebar + topbar); as públicas e o onboarding ficam fora dele.

| Path | Componente | Acesso |
|---|---|---|
| `/bem-vindo` | `pages/Landing` | público |
| `/auth` | `pages/Auth` | público |
| `/verificar` | `pages/VerifyEmail` | público |
| `/recuperar` | `pages/ResetRequest` | público |
| `/redefinir` | `pages/ResetPassword` | público |
| `/privacidade` | `pages/Privacy` | público |
| `/onboarding` | `pages/Onboarding` | autenticado, **sem** shell |
| `/` | `pages/Dashboard` | autenticado, dentro do shell |
| `/praticar` | `pages/Practice` | shell |
| `/range` | `pages/RangeTest` | shell |
| `/exercicios` | `pages/Exercises` | shell |
| `/exercicios/:id` | `pages/ExercisePlayer` | shell |
| `/revisao/unidade/:unitId` | `pages/ReviewRunner` (`mode="unit"`) | shell |
| `/revisao/espacada` | `pages/ReviewRunner` (`mode="spaced"`) | shell |
| `/saude` | `pages/SaudeVocal` | shell |
| `/planos` | `pages/Planos` | shell |
| `/aquecimento` | `pages/ReviewRunner` (`mode="warmup"`) | shell |
| `/desaquecimento` | `pages/ReviewRunner` (`mode="cooldown"`) | shell |
| `/harmonia` | `pages/HarmonyTrainer` | shell |
| `/musicas` | `pages/Musicas` | shell |
| `/musicas/:id` | `pages/SongPlayer` | shell |
| `/ministerio` | `pages/Ministerio` | shell |
| `/comunidade` | `pages/Comunidade` | shell |
| `/progresso` | `pages/Progress` | shell |
| `/time` | `pages/Team` | shell |
| `/eva` | `pages/Coach` | shell |
| `/config` | `pages/Settings` | shell |
| `*` | `Navigate → /` | shell |

Observação: um mesmo componente (`ReviewRunner`) serve quatro rotas via prop
`mode` — as duas revisões e as duas rotinas de saúde (aquecimento/desaquecimento).

## Páginas / telas

- **Landing** (`/bem-vindo`): página pública de aquisição, CTAs para
  criar conta / entrar. Reusa o design system.
- **Auth / VerifyEmail / ResetRequest / ResetPassword / Privacy**: fluxo de
  conta de produção (login/cadastro, verificação de e-mail, reset de senha, LGPD).
- **Onboarding** (`/onboarding`): 4 passos — `welcome` (nome) → `range`
  (embute `RangeTestFlow`) → `goal` (objetivo em texto livre) → `done`. Ao
  concluir grava perfil, marca `seenOnboarding` e navega para `/`.
- **Dashboard** (`/`): a "home" — um painel de estúdio com hero de XP/nível,
  card "Próximo passo" adaptativo, uma janela da trilha, competências,
  conquistas, missão do dia, semana/ofensiva, range e cards de EVA/harmonia.
- **Practice** (`/praticar`): prática livre com afinador em tempo real
  (`PitchGraph`, `PitchDisplay`, `VoiceInsights`, `AudioBlob`), nota-alvo
  opcional e resumo de sessão (`SessionSummary`). Grava sessão `kind:'practice'`.
- **RangeTest** (`/range`): teste de extensão vocal em passos grave → agudo →
  tessitura (opcional) → passaggio (opcional) → resultado com mapa de registros.
  O `RangeTestFlow` é reusado pelo onboarding.
- **Exercises** (`/exercicios`): o **verdadeiro caminho** — alterna entre
  "Caminho" (unidades do currículo com nós, marcos de música/harmonia, nós de
  revisão e o card da EVA) e "Biblioteca" (catálogo filtrável dos ~300
  exercícios).
- **ExercisePlayer** (`/exercicios/:id`): roda um exercício individual
  (respiração / sirene / sequência), calcula pontuação e, ao final, mostra
  diagnóstico da EVA (`diagnose`) + próximo passo adaptativo (`NextExercise`).
- **ReviewRunner**: fila de exercícios para revisão de unidade, revisão
  espaçada, aquecimento e desaquecimento — reusa `ExerciseRunner`.
- **HarmonyTrainer** (`/harmonia`), **Musicas** (`/musicas`) + **SongPlayer**
  (`/musicas/:id`): "cantar de verdade" — achar sua voz na harmonia e cantar
  melodias (modo aprender/pontuar). São os destinos dos marcos da trilha.
- **SaudeVocal** (`/saude`): sinal vocal do dia, carga da semana e atalhos para
  aquecer/desaquecer.
- **Progress** (`/progresso`): evolução real (competências, tendências, XP).
- **Coach** (`/eva`): chat da EVA — seletor de intenção → streaming via backend
  (`data/eva.ts`), com fallback local ("prévia") quando o EVA Hub não está
  configurado.
- **Comunidade** (`/comunidade`), **Team** (`/time`), **Ministerio**
  (`/ministerio`): camada social/B2B2C — liga semanal por XP, convites de time,
  ensaio do ministério (naipes, prontidão). `Ministerio`/`Team` são gated por
  entitlement (`useEntitlement('team_admin')`).
- **Planos** (`/planos`), **Settings** (`/config`): billing e preferências.

## Navegação / layout

O shell é `src/app/AppShell.tsx`: uma `Sidebar` fixa + uma coluna `main` com
`TopBar` e um `<Outlet />` rolável. O menu mobile é um drawer controlado por
`menuOpen` (com `scrim`), fechado a cada troca de rota. O `AppShell` também
força o onboarding no primeiro acesso (`!baseline && !hasSeenOnboarding()`).

A `Sidebar` (`src/app/Sidebar.tsx`) é a navegação primária: um link "Início" (`/`)
solto no topo, depois dois grupos — **Treino** (`/praticar`, `/exercicios`,
`/harmonia`, `/musicas`, `/range`, `/saude`) e **Acompanhamento** (`/progresso`,
`/comunidade`, `/ministerio`, `/time`, `/eva`) — e um rodapé com Configurações,
nível/XP e ofensiva. Não há **tab bar inferior**; toda a locomoção passa pela
sidebar/drawer. A `TopBar` (`src/app/TopBar.tsx`) mostra um título derivado de um
mapa `TITLES` incompleto (só cobre algumas rotas; o resto cai em `'Canto'`), o
pill de microfone ao vivo e o avatar.

## A trilha hoje

Há **duas superfícies de trilha**, e a home não é a trilha.

1. **Modelo de dados** (`src/data/`): o "caminho" longo estilo Duolingo é o
   currículo — `curriculum.ts` + `curriculum-data.ts` definem unidades temáticas
   por nível; `tracks.ts` monta três `TRACKS` (iniciante/intermediário/avançado),
   cada `exerciseIds` sendo o path plano do nível (`levelExerciseIds`).
   `pathMilestones.ts` insere marcos de recompensa (cantar uma música ou achar a
   voz na harmonia) entre unidades — o diferencial de "desembocar em música de
   verdade". `exercise-library.ts`/`exercises.ts` guardam os ~300 exercícios.
2. **A trilha renderizada** vive em `pages/Exercises.tsx` (aba "Caminho"): resumo
   com anel de progresso, abas por nível, unidades em sequência (`UnitBlock`),
   nós (`StopNode` com estados locked/next/practiced/mastered ≥ 90), nós de
   revisão (`ReviewNode` → troféu), marcos (`MilestoneNode`) e um card da EVA
   (`EvaCoachCard`) na unidade ativa. O nó ativo faz `scrollIntoView` — "caminho
   como home", mas dentro de `/exercicios`, não em `/`.
3. **A home** (`pages/Dashboard.tsx`) mostra apenas uma **janela de 5 nós**
   (`STEP_WINDOW`) ao redor do próximo passo (mini-caminho serpenteado) e um link
   "ver o caminho completo" para `/exercicios`. O coração da home é o card
   "Próximo passo", alimentado por `gamification.recommendation` (roteador
   adaptativo `data/adaptive.ts`).

Fluxo até praticar: `/` (Dashboard) → botão "Começar"/"Treinar agora" ou nó da
janela → `/exercicios/:id` (ExercisePlayer) → o exercício roda, grava a sessão
(`addSession`), mostra diagnóstico + "próximo passo" → o loop recomeça. Ou o
usuário entra por `/exercicios` (caminho completo) e escolhe um nó. Um "nó" = uma
sessão = um exercício atômico; não existe uma "lição" composta que encadeia
aquecimento → drills → aplicação como um único fluxo diário — o único
encadeamento real é o `ReviewRunner` (revisões e rotinas de saúde).

## Estado / contexto

- **`AuthContext`**: identidade/sessão da conta e hidratação pós-login.
- **`AppContext`**: motor de áudio + estado do usuário (perfil, baseline,
  settings, streak, sessions, gamification) via `reload()`.
- **`data/store.ts`**: fonte de verdade local (localStorage, chaves `canto.*`),
  com sync opcional para o backend (`syncStateNow`/`hydrateUserState`). Deriva
  streak das sessões (`computeStreak`), protetor de ofensiva (`reconcileStreak`),
  meta semanal (`weeklyGoal`), revisões concluídas, naipe do ministério e
  gamificação (`getGamification` → `computeGamification`).
- **Navegação de progresso**: não há um "contexto de navegação" dedicado — o
  progresso é derivado das sessões; o "próximo passo" é o `recommendation` do
  `computeGamification`/`recommendNext`, consumido igualmente pelo Dashboard, pelo
  Exercises e pelo Result do player. A rota ativa vem só do `react-router`.

## Lacunas vs. visão

1. **Trilha-como-home não existe de fato.** A home (`/`, `Dashboard.tsx`) é um
   painel de estúdio; a trilha real está em `/exercicios` (`Exercises.tsx`). São
   duas superfícies com lógica duplicada de "próximo nó"/janela. A visão pede que
   a home **seja** o caminho vertical rolável; hoje ela é um dashboard com uma
   prévia de 5 nós e um link para o caminho completo.

2. **Sem "vitória de maestria" nos primeiros ~60s.** O onboarding
   (`Onboarding.tsx`) leva o usuário direto ao **teste de range** (grave → agudo →
   tessitura → passaggio), que é medição sustentada de vários minutos, não um
   "acertei a nota!" celebrado em segundos. O passo `done` promete "começa pelo
   aquecimento" mas **deposita o usuário no Dashboard**, sem forçar um primeiro
   exercício com feedback verde imediato. Falta o micro-momento de acerto.

3. **Não há estrutura de "lição/sessão" composta.** Cada nó é um exercício
   isolado (`ExercisePlayer`). Só o `ReviewRunner` encadeia uma fila. A visão de
   sessão diária (aquecimento → técnica → aplicação → desaquecimento como um fluxo
   único, com progresso dentro da sessão) não está modelada para o treino normal —
   o usuário monta a própria sequência clicando nó a nó.

4. **EVA é destino/estático, não presença contínua.** A EVA aparece como card no
   Dashboard, card no caminho (`EvaCoachCard`) e página de chat (`/eva`,
   `Coach.tsx`) — reativa (diagnostica a última sessão) e gated pelo backend
   (cai em "prévia" local sem o EVA Hub). Não é uma companheira que acompanha
   cada passo em tempo real, nem introduz/fecha cada nó. A visão de EVA onipresente
   ainda não está na casca.

5. **Exposição gradual (sozinho → gravar → compartilhar → grupo) incompleta.**
   "Sozinho" existe (Practice/Exercises). **Gravar não existe**: nenhuma captura
   ou playback da própria voz — por design a voz nunca sai do device e só features
   numéricas são guardadas (`FeatureReport`). "Compartilhar" é apenas um card de
   números/branding (`share/shareCard.ts`, `ShareButton`), nunca o áudio. "Grupo"
   existe como ranking/ministério (`Comunidade`, `Team`, `Ministerio`), mas
   desconectado — não há uma escada progressiva que leve do canto privado a expor
   uma tomada e depois cantar com/para o grupo. O caminho social é lateral (itens
   de menu), não um degrau da jornada.

Lacunas menores de IA/roteamento: sem tab bar mobile (só drawer); `TITLES` da
TopBar cobre poucas rotas; taxonomia "Treino vs Acompanhamento" espalha destinos
horizontalmente em vez de afunilar para o caminho; e a duplicação Dashboard-janela
vs Exercises-caminho tende a confundir "onde eu continuo?".
