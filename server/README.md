# Canto — Backend

Backend multi-tenant do Canto: **NestJS + Prisma (Postgres) + BullMQ (Redis)**, com worker de fila dedicado, tudo em Docker.

## Subir tudo (Docker)

```bash
cd server
cp .env.example .env         # ajuste segredos (JWT_*) para produção
docker compose up -d --build
```

Sobe 4 serviços: `postgres`, `redis`, `api` (aplica migrations e serve em `:3333`) e `worker` (consome a fila `sessions`). Health: `GET http://localhost:3333/api/health`.

> Se a porta 5432 estiver ocupada, defina `POSTGRES_PORT=5433` no `.env` (o mapeamento do host muda; dentro da rede do compose continua 5432).

## Endpoints principais

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | público | cria um tenant + usuário OWNER, retorna tokens |
| POST | `/api/auth/login` | público | `{ tenantSlug, email, password }` → tokens |
| POST | `/api/auth/refresh` | público | rotaciona o refresh token |
| POST | `/api/auth/logout` | público | revoga um refresh token |
| GET | `/api/auth/me` | Bearer | identidade atual |
| POST | `/api/sessions` | Bearer | sincroniza uma sessão (idempotente por `clientId`) e enfileira o processamento |
| GET | `/api/sessions` | Bearer | lista as sessões do usuário (isoladas por tenant) |
| GET | `/api/sessions/stats` | Bearer | contagem + XP total + acerto médio |
| GET | `/api/health` | público | status de Postgres + Redis |

Autenticação: `Authorization: Bearer <accessToken>`. Access token expira em 15m (config), refresh em 7 dias com rotação.

## Multi-tenancy

Isolamento **row-level**: todo dado de domínio carrega `tenantId`, extraído do JWT e aplicado em todas as queries. O mesmo e-mail pode existir em tenants diferentes (login é escopado por `tenantSlug`).

## Fila operacional

Ao criar uma sessão, a API enfileira `process-session` na fila `sessions` (Redis/BullMQ). O **worker** (container separado, `node dist/worker`) calcula o XP, marca `processedAt` e grava um `JobRun` para observabilidade. Retry exponencial (3 tentativas).

## Desenvolvimento (fora do Docker)

```bash
docker compose up -d postgres redis   # só a infra
npm install
npx prisma migrate dev                # cria/aplica migrations
npm run start:dev                      # API com watch
npm run start:worker:dev               # worker com watch (outro terminal)
```

`npm run prisma:seed` cria um tenant `demo` (`demo@canto.app` / `canto1234`).

## Parar

```bash
docker compose down          # para os containers (mantém o volume do Postgres)
docker compose down -v       # + apaga os dados
```
