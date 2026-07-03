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

Fila do usuário (fazer uma a uma). Feitas: **S1, S2, S3**.

| # | Sprint | Status |
|---|--------|--------|
| S1 | 🫁 Saúde vocal | ✅ feito |
| S2 | 💳 Transações & assinatura (Stripe) | ✅ feito (falta ativar chaves — ver abaixo) |
| S3 | 🎯 EVA que explica | ✅ feito |
| **S4** | ⛪ **Ferramentas de ministério de louvor** | ⬜ **PRÓXIMA** — aquecimento em grupo, treino de harmonia/blend, painel do líder, plano Igreja. Moat gospel + motor B2B2C. |
| S5 | 🔥 Comunidade | ⬜ streak social, ligas por ministério, gravações compartilháveis (UGC) |
| S6 | 🎼 Músicas autorais | ⬜ catálogo de músicas próprias/louvor (ver §7 licenciamento) |
| S7 | 🎵 Cantar música real (score-following) | ⬜ feedback nota-a-nota — killer feature |
| S8 | 🚀 Deploy de produção | ⬜ hospedagem, domínio, TLS, e-mail (verificação/reset), LGPD |
| S9 | 🎓 Validação acadêmica | ⬜ parceria USP/CEV (Behlau) — validar o currículo |

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

## 9. Próximo passo sugerido

**S4 — Ferramentas de ministério de louvor.** É o moat gospel + o motor de
distribuição B2B2C (destrava o plano Igreja). Escopo provável: aquecimento em
grupo, treino de "achar sua voz na harmonia"/blend, trilhas de vocalista-guia vs.
back, e o painel do líder já existente (Team.tsx) evoluído para o ministério.
Verificar via `preview_eval` (Bash instável) e PowerShell para Docker.
