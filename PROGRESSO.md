# Canto — Progresso & Handoff (jul/2026)

> Documento de continuidade. Snapshot do que foi construído, como rodar, o que
> falta e por onde seguir. Escrito para uma próxima sessão pegar tudo do zero.
> Branch: `main`. Evoris Labs · fundador solo (Ryan), SP.

---

## 1. O que é o Canto

Plataforma **web** de treino vocal — "o Duolingo do canto". O **DSP roda no
navegador** (o áudio NUNCA sai do dispositivo — privacidade é moat) e um coach
de IA (**EVA**) interpreta só os **números** do DSP (feature-JSON: afinação em
cents, vibrato, quebras de registro/passaggio, estabilidade, tempo em cada
registro). **Beachhead: gospel/louvor no Brasil.** Ambição: melhor app de vocal
coach do mundo, com pedagogia **baseada em evidência**.

**Stack:** React 18 + Vite 6 + TypeScript (SPA, react-router v6) · motor DSP
Rust→WASM + F0 neural (SwiftF0/ONNX) + AudioWorklet · backend **NestJS 10 +
Prisma + PostgreSQL + Redis/BullMQ + worker**, tudo em Docker, multi-tenant.

---

## 2. Estado atual (o que está PRONTO)

### Produto (frontend)
- **Biblioteca de 301 exercícios** (`src/data/exercise-library.ts`, gerada por
  workflow + validada) — antes eram ~20. Catálogo filtrável (nível/fase/tipo/
  competência) na página Exercícios.
- **Caminho estilo Duolingo** (`src/data/curriculum-data.ts`): **57 unidades
  temáticas, 301 nós** (iniciante 16 / intermediário 25 / avançado 16), cada
  nível é uma "seção", cada unidade tem cabeçalho + nós serpenteados + **troféu
  de revisão**. A Biblioteca virou o "practice hub".
- **Revisão executável + repetição espaçada** (`src/data/review.ts`,
  `src/pages/ReviewRunner.tsx`): troféu de unidade roda uma fila dos exercícios
  mais fracos; card "Revisão do dia" (`spacedReviewQueue`) traz de volta o
  aprendido em dias anteriores. O `ReviewRunner` é genérico (modos unit/spaced/
  warmup/cooldown).
- **EVA que explica** (`src/data/coaching.ts`): motor **determinístico** de
  diagnóstico — para cada exercício, o **quê** (com números) → **porquê** (causa
  técnica) → **como** (dica acionável), priorizado, com pontos fortes primeiro.
  Renderiza na tela de resultado acima dos números. Resolve a queixa nº1 do
  mercado ("detecta pitch, não ensina").
- **Saúde vocal** (`src/data/vocalHealth.ts`, `src/pages/SaudeVocal.tsx`, rota
  `/saude`): carga de fonação do dia, dias consecutivos, sinal gentil (clareza/
  jitter/shimmer), gráfico de 7 dias, rotinas de **aquecimento/desaquecimento**
  (`/aquecimento`, `/desaquecimento`), higiene por evidência, disclaimer
  não-médico (rouquidão >2 semanas → fono).
- **Roteador adaptativo (EVA)** (`src/data/adaptive.ts`): decide o próximo
  exercício por skill/kind/nível (não por id fixo); prioriza progressão e usa
  revisão espaçada como manutenção; cita a unidade nos motivos.
- **Gamificação** (`src/data/gamification.ts`, `xp.ts`, `skills.ts`,
  `achievements.ts`): XP/níveis, 7 skills, conquistas, streak.
- **Assinatura/Planos** (`src/pages/Planos.tsx`, rota `/planos`): comparativo,
  ciclo mensal/anual, B2C (Free/Pro) + B2B2C (Igreja/Professor), CTA de trial,
  "Minha assinatura" + portal. Fonte dos planos: `src/data/plans.ts`.
- **Times/B2B2C** (`src/pages/Team.tsx`, rota `/time`): líder gera link de
  convite, gerencia membros, vê detalhe de cada um (nível/XP/skills/foco/sessões).
- Superfícies: Dashboard, Praticar, Meu range, Progresso, EVA Coach, Config,
  Onboarding, Auth.

### Backend (NestJS, `/server`, multi-tenant por `tenantId`)
- **Auth JWT** (argon2, refresh rotacionado sha256, access 15m + refresh 7d),
  guard global + RolesGuard. Registro cria tenant; login por `tenantSlug`.
- **Sync completo** do estado do usuário (`/api/state`) + sessões
  (`/api/sessions`, fila BullMQ + worker calcula XP) + convites (`/api/invites`)
  + membros (`/api/tenant/members`).
- **EVA em produção** (`server/src/eva/`): `/api/eva/chat` autenticado +
  rate-limited, guarda a `EVA_HUB_KEY` server-side, repassa o SSE. (Antes o proxy
  só existia no dev-server do Vite → em produção dava 404.)
- **Billing Stripe** (`server/src/billing/`): `/api/billing/state|checkout|
  portal|webhook`, model Prisma `Subscription` (1:1 Tenant). **Testado:** state
  free, checkout 501 sem chave (graceful), 401 sem auth.
- **Hardening**: helmet, `@nestjs/throttler` (120/min global, 10/min auth,
  20/min EVA, health isento), CORS por lista, filtro global de exceções.
- Docker: `server/docker-compose.yml` (postgres:16, redis:7, api, worker).

---

## 3. Como rodar

```bash
# Backend (Docker) — postgres:5434, redis:6379, api:3333
cd server
docker compose up -d --build          # sobe tudo + aplica migrações

# Frontend (dev)
cd ..
npm run dev                            # Vite em http://localhost:5173

# Health do backend
curl http://localhost:3333/api/health
```

- Conta de teste (dev): tenant `canto-dev-qa`, `qa+ex@canto.app` / `senhaForte123`.
- `VITE_API_URL` (front) default `http://localhost:3333/api`.
- **Segredos** ficam em `server/.env` (gitignored) e `.env` na raiz (chave EVA).
  NUNCA commitar `.env`. Ver §6.

---

## 4. Mapa dos arquivos-chave

**Camada de dados (front, `src/data/`)**
- `exercise-library.ts` — 301 exercícios (GERADO, regenerar via workflow).
- `exercises.ts` — `EXERCISES`, `getExercise`, `pickExercise`, `PHASES`.
- `curriculum-data.ts` (GERADO) + `curriculum.ts` — unidades do path.
- `tracks.ts` — path plano por nível (deriva do currículo).
- `review.ts` — filas de revisão de unidade + espaçada.
- `vocalHealth.ts` — saúde vocal (sinal, carga, warmup/cooldown).
- `coaching.ts` — diagnóstico "EVA que explica".
- `adaptive.ts` — roteador (recommendNext).
- `gamification.ts` / `xp.ts` / `skills.ts` / `achievements.ts`.
- `plans.ts` — planos + entitlements. `billing.ts` — cliente Stripe.
- `store.ts` (localStorage + sync) · `sync.ts` · `api.ts` (HTTP + refresh) ·
  `eva.ts` (cliente EVA).

**Backend (`server/src/`)**
- `auth/`, `state/`, `sessions/`, `invites/`, `tenant/`, `eva/`, `billing/`,
  `health/`, `queue/` (worker), `common/` (guards/decorators/filters).
- `prisma/schema.prisma` — Tenant, User, UserState, Invite, VocalSession,
  RefreshToken, JobRun, **Subscription**.

**Páginas (`src/pages/`)**: Dashboard, Practice, RangeTest, Exercises,
ExercisePlayer, ReviewRunner, SaudeVocal, Progress, Team, Coach, Settings,
Planos, Onboarding, Auth.

---

## 5. O que FALTA (roadmap 1-a-1, sprints S1–S9)

Fila do usuário (fazer uma a uma). Feitas: **S1, S2, S3, S4**.

| # | Sprint | Status |
|---|--------|--------|
| S1 | 🫁 Saúde vocal | ✅ feito |
| S2 | 💳 Transações & assinatura (Stripe) | ✅ feito (falta ativar chaves — ver abaixo) |
| S3 | 🎯 EVA que explica | ✅ feito |
| S4 | ⛪ Ferramentas de ministério de louvor | ✅ feito — ver §5.1 |
| S5 | 🔥 Comunidade | ✅ feito — ver §5.2 |
| S6 | 🎼 Músicas autorais | ✅ feito — ver §5.3 |
| S7 | 🎵 Cantar música real (score-following) | ✅ feito — ver §5.5 |
| S8 | 🚀 Deploy de produção | ⬜ hospedagem, domínio, TLS, e-mail (verificação/reset), LGPD |
| S9 | 🎓 Validação acadêmica | ⬜ parceria USP/CEV (Behlau) — validar o currículo |

### 5.1 — S4: Ferramentas de ministério de louvor (feito)

O moat gospel + o motor B2B2C. Três frentes, todas device-local no que toca o áudio:

- **Treinador de harmonia/encaixe** (`/harmonia`, moat) — o cantor sustenta a SUA
  voz (terça/quinta/oitava/baixo) contra um **drone de referência** e o app mede
  afinação do INTERVALO (cents contra o alvo, não a nota mais próxima) + o
  "encaixe"/blend (firmeza). 10 drills numa progressão (unísono → oitava → quinta
  → terças → completar o acorde → baixo). Reusa a `PitchEngine` (pitch ao vivo) +
  um `TonePlayer` novo (WebAudio, AudioContext próprio; a saída da PitchEngine é
  muda). Sessões gravadas como `kind:'exercise'`, `exerciseId:'harmony:<id>'` —
  **inerte pro currículo** (nenhum resolve em `getExercise` → não polui maestria/
  revisão espaçada; XP cai em prática livre → afinação+sustentação).
  - `src/data/harmony.ts` — vozes do louvor (WORSHIP_PARTS/VOICE_PARTS), 10
    `HARMONY_EXERCISES`, `rootFor/targetMidiFor/droneMidisFor` (transpõe pro range,
    com headroom pro baixo negativo). `src/data/harmonyScore.ts` — accuracy+blend.
  - `src/audio/TonePlayer.ts` — drone (triangular + passa-baixa 1.8 kHz, ataque
    suave). `src/pages/HarmonyTrainer.tsx` — runner (espelha o Sequence).
- **Ensaio do ministério + naipes + prontidão** (`/ministerio`, plano Igreja) —
  o líder monta um plano compartilhado (aquecimento + set de harmonia), atribui
  **naipes** (voz de cada membro) e vê o **quadro de prontidão pro culto**
  (aqueceu hoje? praticou a harmonia nos últimos 7 dias?). Membro vê o plano
  read-only, escolhe seu naipe e dispara cada item. `src/pages/Ministerio.tsx`.
- **Gating** — `src/hooks/useEntitlement.ts` (novo; lê billing/`can()`): a
  SUPERFÍCIE `/ministerio` é gated por `team_admin` (plano Igreja); as AÇÕES de
  edição por role (OWNER/ADMIN). O treinador `/harmonia` fica aberto (funil).
  Sidebar mostra cadeado no item Ministério quando sem plano; Dashboard tem card
  de harmonia (todos) + link do ministério (só Igreja).

**Backend** (`server/src/ministry/`, migração `20260703103710_ministry`, aditiva):
modelos `MinistryPlan` (1/tenant, 2 colunas Json warmup+harmonySet) e
`MinistryMember` (naipe, enum `VoicePart` MAIÚSCULO). Endpoints tenant-scoped:
`GET/PUT /api/ministry/plan`, `GET /api/ministry/members`, `PUT /api/ministry/
parts/me`, `PUT /api/ministry/members/:id/part`, `GET /api/ministry/readiness`
(mutações + prontidão só líder). O `api.ts` do front recebe uma lista PLANA de
itens (o serviço mescla/separa as 2 colunas) e mapeia o case do naipe
(`partToApi`/`partFromApi`, a única fronteira lower↔UPPER). **Backend-opcional:**
se `/api/ministry/*` cai, o front degrada (cache local + treino de harmonia segue).

**Verificado** (typecheck front+back; backend end-to-end autenticado: plano CRUD,
naipe, prontidão; front via `preview_eval`: `harmony:*` inerte, transposição no
range, scoring, round-trip de case, `clearUserData`; painel de líder renderiza e
carrega do backend; `TonePlayer` lifecycle num AudioContext real). **Nota dev:**
o tenant de QA (`canto-dev-qa`) recebeu uma assinatura `igreja` ativa no banco só
pra destravar o painel na verificação — não afeta prod (o webhook Stripe é a
verdade).

### 5.2 — S5: Comunidade (feito)

O loop de retenção + aquisição orgânica. Reaproveita o roster/naipes do S4.

- **Liga do ministério + streak social** (`/comunidade`) — ranking do time por **XP
  da semana** (liga estilo Duolingo, reseta na semana ISO) + o quadro de
  **ofensivas** (quem está "em chamas" e quem está "em risco hoje"). Solo (tenant
  de 1) vê CTA de convidar o time. `src/pages/Comunidade.tsx`.
- **Compartilhável (UGC) device-local** — o áudio nunca sai do device (moat); o
  que se compartilha é o **resultado em números**, como um card de imagem gerado
  na hora (SVG→canvas→PNG, sem libs) + Web Share (mobile) / download (desktop).
  `src/share/shareCard.ts` + `src/components/ShareButton.tsx`. Ligado no resultado
  do treino de harmonia ("meu encaixe") e na Comunidade ("minha semana").
- **Backend** — `GET /api/tenant/leaderboard` (tenant-scoped, aberto a qualquer
  membro): agrega XP da semana + XP total + ofensiva (das datas de sessão) + naipe
  por membro. **Sem migração** (reusa `VocalSession` + `MinistryMember`). Datas em
  UTC (consistente com o streak do front). `server/src/tenant/tenant.service.ts`.
- Entradas: nav "Comunidade" (Acompanhamento) + link "ver a liga" no card da
  semana do Dashboard.

**Verificado**: typecheck front+back; leaderboard end-to-end autenticado; card
UGC gera PNG real no browser (SVG bem-formado, nomes escapados); página renderiza;
review adversarial.

### 5.3 — S6: Músicas autorais (feito)

O catálogo de músicas + o degrau pro S7. **Frontend-only** (conteúdo estático,
como a exercise-library — sem backend, sem migração).

- **Catálogo** (`/musicas`, `src/pages/Musicas.tsx`) — músicas navegáveis com
  filtro (todas/autorais/domínio público), dificuldade e tags. `src/data/songs.ts`
  = modelo `Song`/`SongNote` (melodia beat-based + letra sílaba-a-sílaba + licença)
  + 4 seeds: 3 autorais worship + "Alegria" (Ode à Alegria/Beethoven, domínio
  público, letra autoral). **Licenciamento seguro** (§7): só autoral + domínio
  público; nada de obra protegida antes de CCLI. Melodias corretas por construção.
- **Player** (`/musicas/:id`, `src/pages/SongPlayer.tsx`) — dois modos:
  **Aprender** (o app toca a melodia de referência com o `TonePlayer` do S4, sem
  nota — não precisa de mic) e **Cantar** (score-following leve: contagem 3-2-1,
  corre a melodia no relógio, compara o pitch com a nota-alvo e pontua por nota via
  o `harmonyScore` do S4; agulha de cents + letra em karaokê + progresso). Sessão
  gravada como `song:*` (inerte pro currículo). Transpõe pro range do cantor.
  Resultado com o `ShareButton` do S5 ("cantei no Canto"). Guia opcional no modo
  cantar (padrão OFF pra não vazar no mic).
- Entradas: nav "Músicas" (Treino) + card no Dashboard.

**Verificado**: typecheck; `song:*` inerte; transposição no range (baseline
estreito + null) com timing monotônico; catálogo e tela do player renderizam;
scoring reusado do S4. **Nota**: o loop do relógio (RAF) NÃO roda no preview
headless (aba oculta → `requestAnimationFrame` pausado) — vale pra todos os
runners (Sequence/Harmonia/Música); funciona no browser visível. Review adversarial.

### 5.4 — Caminho estilo Duolingo "e mais" (bônus, pós-S6)

Rodada de UX pra tornar o caminho de aprendizado o coração viciante do app — e
**passar o Duolingo** onde ele é raso. Tese: engajamento do Duolingo + profundidade
real (a EVA que explica) + **música de verdade**. O caminho já existia forte em
`/exercicios` (aba "Caminho": seções, unidades, path serpenteado, coroas, troféus,
revisão espaçada); estas 3 jogadas foram por cima:

1. **Música tecida no caminho** (`src/data/pathMilestones.ts`, `Exercises.tsx`) —
   9 marcos de recompensa (3/nível) entre unidades levam a **cantar uma música**
   (S6) ou **achar a voz na harmonia** (S4), casados à dificuldade. Brilham quando
   a unidade anterior é dominada. É o clímax que idioma nenhum entrega.
2. **Caminho-como-home + nó ativo** (redesign 2022 do Duolingo) — abrir
   `/exercicios` rola até o nó ativo (`scrollIntoView`) com bolha **"COMEÇAR"**
   pulsando; a "Sua trilha" do Dashboard virou um **mini-caminho serpenteado**
   (não a escada horizontal) com o nó ativo em "Continuar".
3. **EVA companheira** — card da EVA na unidade ativa com **coaching real da última
   sessão** (`coaching.diagnose`: o quê + a dica), não filler de mascote; e o
   cabeçalho da unidade abre um **guidebook** com as competências que ela treina.

Também: **fix** do bug visual da "Sua trilha" (a escada empilhava os 86 nós do
nível inteiro — agora janela de nós). Tudo verificado por medição de layout
(redimensionando o viewport pra furar o preview headless de aba oculta).

### 5.5 — S7: Cantar música real / score-following (feito)

A killer feature — aprofundou o `SongPlayer` do S6 num score-follower de verdade
(estilo Yousician/Rocksmith). **Frontend-only.**

- **Relógio de áudio** — o timing agora ancora em `TonePlayer.now()`
  (`AudioContext.currentTime`), não `performance.now()`: mesmo clock do som, mais
  estável e sincronizado com a guia/acompanhamento (mais preciso que RAF).
- **Piano-roll rolando** (`src/audio/songRoll.ts`, canvas no `SongPlayer`) — a
  melodia rola como blocos posicionados por TEMPO × PITCH, com um playhead fixo;
  a **curva de pitch do cantor** aparece por cima ao vivo; cada nota **acende
  verde/vermelho** ao passar pelo playhead (feedback em tempo real). Função de
  desenho pura (testada com ctx-mock: sem erro, save/restore balanceado).
- **Scoring com timing/cobertura** — além da afinação (cents), pontua *quanto* da
  nota você cantou (`coverage`), então entrar no tempo certo e sustentar conta.
  Notas finalizadas em tempo real (colorir o roll) + agregadas no fim.
- Preserva as correções do review do S6 (contagem alinha o agregador, aborta em
  background, sem guia-no-cantar, `durationSec` sem a contagem, `song:*` inerte).

**Verificado**: typecheck; `drawSongRoll`/`rollPitchRange` (matemática + robustez
via ctx-mock); relógio de áudio ancora o run (contagem via `tone.now()`); ready +
learn-run sem erro. **Nota**: o preview headless (aba oculta) não roda RAF nem
mic, então a partitura rolando + a curva ao vivo só aparecem no browser real.
Review adversarial.

### Para ATIVAR os pagamentos (S2) — só o fundador pode
1. No dashboard do Stripe, criar **6 preços** (Pro / Igreja / Professor × mensal/anual).
2. Em `server/.env`:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO_MONTHLY=price_...      STRIPE_PRICE_PRO_YEARLY=price_...
   STRIPE_PRICE_IGREJA_MONTHLY=price_...   STRIPE_PRICE_IGREJA_YEARLY=price_...
   STRIPE_PRICE_PROFESSOR_MONTHLY=price_... STRIPE_PRICE_PROFESSOR_YEARLY=price_...
   ```
3. Webhook do Stripe → `https://<host>/api/billing/webhook`.
4. `docker compose up -d --build api`. O fluxo real liga sozinho.

### Para ATIVAR a EVA (LLM) — só o fundador pode
Em `server/.env`: `EVA_HUB_KEY=evh_live_...` e `EVA_ASSISTANT_ID=asst_...` →
`docker compose up -d --build api`. Sem elas, a EVA cai na prévia rule-based.

### Preços definidos (estratégia)
Pro R$ 19,90/mês ou **R$ 179/ano** · Igreja R$ 149/mês (até 30) · Professor
R$ 49/mês (até 15). Anual é o padrão (retém 92% vs 68% mensal).

---

## 6. Gotchas & notas de ambiente

- **NUNCA commitar `.env`** (raiz tem chave EVA live; `server/.env` tem segredos/
  DB). Antes de `git add`, checar. Padrão gitignore já cobre.
- **`$` em mensagem de commit via Bash trava o shell** (quoting) → usar `-m`
  simples sem `$`, ou PowerShell.
- **Bash instável nesta máquina** (comandos completam mas estouram o timeout do
  tool; tsx/node às vezes auto-backgrounding). Verificar lógica via
  `preview_eval` (import dinâmico do módulo do dev server — canal separado);
  usar **PowerShell** para Docker/npm/git/prisma (mais estável no Windows).
- **Docker Desktop pode cair** (fechado pelo SO/idle). Reabrir:
  `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"`, esperar o
  engine, depois `docker compose up -d`.
- **`preview_screenshot` quebrado** a sessão toda (timeout) — verificar via
  `preview_eval`/DOM/computed-styles/`preview_inspect`, não por screenshot.
- Postgres host-mapeado em **5434** (5432/5433 estavam ocupadas). Migração local:
  `DATABASE_URL=postgresql://canto:canto@localhost:5434/canto?schema=public npx prisma migrate dev`.
- Arquivos avulsos `ss1.json`/`ss2.json` na raiz = lixo (respostas de rate-limit
  da Semantic Scholar de um workflow de pesquisa). **Podem ser apagados** — não
  são dados do projeto.

---

## 7. Estratégia & pesquisa (verificadas, com fontes)

Rodadas grandes de pesquisa multi-agente com fontes citadas. Conclusões-chave:

- **Cunha defensável:** ninguém junta as 4 peças do Canto (privacidade local +
  pedagogia-evidência + B2B2C igreja + gospel/PT). No Brasil, **zero
  concorrentes** de coaching vocal por IA (só cursos em vídeo). Queixa nº1 do
  mercado: "detecta pitch, não ensina" → a EVA-que-explica ataca isso.
- **Mercado BR:** 47,4M evangélicos, 109k igrejas, gospel = 20% do mercado
  (R$ 2 bi/ano). Pix Automático (jan/2026) liga recorrência.
- **MRR 12 meses (cenários):** conservador ~R$ 3,8k · base ~R$ 10k · otimista
  ~R$ 25k. Alavanca = B2B2C (1 igreja ≈ 10 individuais). Gargalo = **retenção**.
- **Licenciamento de música (S6):** o mito "cifras pega tudo sem direito" é
  falso (Cifra Club cumpre via ECAD; Ultimate Guitar licencia). Caminho seguro =
  **autoral + domínio público (Harpa Cristã) + CCLI** (600k+ músicas de louvor,
  ~US$84-108/ano, gospel-nativo) → ECAD → majors. Transcrever melodia é obra
  derivada (precisa licença); device-local do Canto baixa o risco.

**Artifacts (documentos visuais publicados):**
- Estratégia "Duolingo do canto": https://claude.ai/code/artifact/c5fdfbcb-fe37-452c-a82c-1684607f4d88
- Deep-research de mercado (anterior): https://claude.ai/code/artifact/9d6b9efd-c2e5-49bb-962a-e0678bd4da33

**Memória persistente** (carrega automática nas sessões): `MEMORY.md` +
`projeto-canto-vocal`, `estrategia-mercado-2026-07`, `licenciamento-musica-canto`,
`backend-infra-canto`, `sprint-edutech-motor-2026-07`, `engenharia-dsp-rust-wasm`,
`canto-github-repo`.

---

## 8. Commits desta fase (mais recentes primeiro)

```
03b5da3 feat(billing): S2 parte 2 - backend Stripe (checkout, webhook, portal) + Subscription
d66e25c feat(billing): S2 parte 1 - planos, tela de assinatura e cliente Stripe
74b359e feat(saude): sprint Saúde Vocal — carga/descanso, sinal e rotinas
445b8e5 feat(eva): diagnóstico que explica — o quê/por quê/como pós-exercício
9618c28 feat(saas): EVA no NestJS (prod) + hardening do backend
1ee4f47 fix(eva): progressão tem prioridade sobre revisão espaçada
e58ea31 feat(revisao): revisão de unidade executável, repetição espaçada e EVA por unidades
31723b1 feat(caminho): trilha estilo Duolingo — 57 unidades, 301 nós no path
164592e feat(trilhas): rebalanceio pedagógico das espinhas curadas (13/nível)
d5b7d79 feat(exercicios): biblioteca de 301 exercícios + catálogo filtrado
c0048bf feat(time): acompanhamento completo — detalhe do membro
a40e602 feat(saas): sistema de convites/times (B2B2C)
a43d711 feat(saas): sync completo do estado do usuário
```

---

## 9. Go-live + Mobile — FEITO nesta fase (S8)

O wrapper de produção que faltava agora existe e foi **verificado ponta a ponta**
(backend real rodando + curl + preview do front). Resumo do que entrou:

### Autenticação de produção (GL-1)
- **Verificação de e-mail** e **reset de senha** completos. Tabela única
  `AuthToken` (enum `EMAIL_VERIFICATION` | `PASSWORD_RESET`), guarda só o **hash
  sha256** do token; o cru só vive no link do e-mail. Consumo **atômico**
  (`updateMany where usedAt:null`) — sem replay. Reset **revoga todas as sessões**.
  Request-reset **não vaza** existência de conta. Rotas novas: `verify-email`,
  `resend-verification` (throttle 3/min), `request-reset`, `reset-password`.
- **Mailer plugável** (`server/src/mail/`): `EMAIL_PROVIDER=dev` **loga** o link no
  console; `=smtp` envia via nodemailer. O mailer **nunca derruba** o cadastro
  (try/catch + degradação). Links apontam pra `${APP_URL}/verificar|redefinir`.
- Front: páginas `/verificar`, `/recuperar`, `/redefinir` + banner "confirme seu
  e-mail" com reenvio nas Configurações. `AuthUserInfo.emailVerified` no cliente.

### LGPD (GL-2)
- **Exportar** (`GET /me/export`) e **excluir conta** (`DELETE /me`) — verificado
  que o export **não vaza** passwordHash/segredos Stripe e é escopado por usuário/
  tenant. Delete em transação: OWNER sozinho apaga o tenant (cascata); OWNER com
  membros → 409; membro apaga o próprio usuário.
- **Consentimento** no cadastro (checkbox obrigatório → `consentAt` no banco,
  confirmado no export). **Política de Privacidade** pública em `/privacidade`.

### Higiene de produção (GL-3)
- **ErrorBoundary** (fallback recuperável, sem tela branca). Root em **singleton**
  (mata o warning de `createRoot` no HMR). Service worker só em produção.

### Mobile (MOB-1/MOB-2) — "iniciar o app"
- **PWA instalável**: `manifest.webmanifest` + `public/sw.js` (cache de app-shell
  conservador — **nunca** cacheia `/api` nem quebra áudio/wasm) + ícones PNG reais
  (192/512/maskable, gerados proceduralmente: anel dourado = o "o" de Cant**o**).
- **Decisão RN vs Flutter → Capacitor** (`capacitor.config.ts`, `MOBILE.md`).
  Motivo decisivo: o motor DSP (Rust/WASM + AudioWorklet + ONNX) roda no WebView
  **sem reescrever nada**; RN/Flutter exigiriam reescrever o núcleo de áudio.
  Mesmo `dist/` → app de loja. Scripts `cap:sync|cap:android|cap:ios`.
- **Safe-area insets** (notch) no shell — polimento mobile-web.

### ⚠️ O que o FUNDADOR precisa prover pro go-live real (nada disso é código)
1. **Domínio + TLS** (ex.: `app.canto…` + `api.canto…`), atrás de HTTPS.
2. **SMTP** de verdade: criar conta (Resend/SendGrid/SES/Mailgun), pôr
   `EMAIL_PROVIDER=smtp` + `SMTP_*` no `server/.env`. Sem isso, e-mails só logam.
3. **`APP_URL`** = URL pública do front (entra nos links de e-mail) e **`CORS_ORIGIN`**
   = domínio do front (hoje `*`). **Trocar os `JWT_*_SECRET`** por segredos fortes.
4. **Caixa `privacidade@canto.app`** (ou trocar o contato em `src/pages/Privacy.tsx`).
5. **Stripe** e **EVA Hub**: ativar chaves reais (ver §"ATIVAR" respectivas) — sem
   elas o app segue no free + coach rule-based.
6. **Lojas** (quando publicar): conta Apple Developer (US$99/ano) + Google Play
   (US$25). `npx cap add android|ios`, permissão de microfone (ver `MOBILE.md`),
   build com `VITE_API_URL` de produção.

## 10. Próximo passo sugerido

Com o go-live pronto no código, o caminho crítico é **infra do fundador** (itens 1–4
acima) para abrir ao público — nenhuma linha de código bloqueia mais. Depois:
**landing page** de aquisição (POL-1, ainda pendente) e/ou **S9** (validação
acadêmica USP/CEV). Aprofundar score-following quando voltar às músicas: melodias
completas, onset fino, acompanhamento tocando junto, catálogo maior (CCLI ao ligar
licenciamento). Verificar via `preview_eval` + PowerShell p/ Docker.
