# Plano de Execução — Fase AGORA (reestruturação web)

> **Objetivo desta fase.** Fundação (design system) + maior alavanca de retenção (vitória no dia‑1) + matar os dark patterns acidentais. Deriva de [backlog-features.md](backlog-features.md) §2 e [plano-reestruturacao-web.md](plano-reestruturacao-web.md).
>
> **Regra de ouro:** o motor de áudio (`src/audio/*`, `dsp/`, `src/wasm/`) **não se toca** nesta fase — ele é preservado. Tudo aqui envolve UI, dados, auth e a camada de política que fica *em volta* do motor.
>
> **[RN‑safe]** = feito com lógica separada da renderização, pra sobreviver à migração React Native.
>
> **Antes de cada tarefa eu leio os arquivos-alvo reais** (a auditoria é confiável mas os detalhes finos confirmo no código na hora de editar).

---

## Ordem proposta (respeitando dependências)

| # | Tarefa | Tipo | Depende de | Por que nessa posição |
|---|---|---|---|---|
| **1** | **A1** — Design system (tokens + tema neutro) | 🔵 refactor | — | Portão de dependência de toda a nova UI |
| **2** | **A7** — Higiene do estado de gamificação | 🟢 quick | — | Base limpa antes de mexer em streak/XP |
| **3** | **A5** — XP com fonte única | 🟢 quick | A7 | Correção rápida de integridade |
| **4** | **A4** — Persistir retenção no backend | 🔵 refactor | A7 | Mata o dark pattern "reinstalar apaga ofensiva" |
| **5** | **A6** — EVA no repo + guarda MPA no CI | 🟢 quick | — | Independente; protege a voz da marca |
| **6** | **A2** — Auth de consumidor sem fricção | 🔵 refactor | — | Pré‑requisito do onboarding |
| **7** | **A3** — Onboarding com vitória de maestria em ~60s | 🟣 feature | A1, A2 | A maior alavanca de retenção; precisa da UI e do auth prontos |

---

## A1 — Design system: fonte única de tokens + tema claro/escuro neutro  🔵 [RN‑safe]
**Origem:** decisão de fundo (§3 do design — fundo **neutro alternável**, âmbar como **acento**); tipografia Fraunces + Figtree; acessibilidade AA; PR1 (separar design da render).
**Estado atual (auditoria):** tokens em `src/styles/tokens.css`; mapa `COLORS` em `src/theme.ts` para canvas — **fonte dupla sincronizada à mão**; Fraunces já é o display; **Bricolage Grotesque** no lugar de Figtree; brasa errada (`#c65d3b`), âmbar (`#e9b44c`) usado como **primário**; ~26 hex hardcoded; ~222 `style={{}}` inline em ~30 telas; `prefers-reduced-motion` respeitado.
**Passos:**
1. Criar `src/design/tokens.ts` como **fonte única** (objeto TS: paleta light/dark, tipo, espaço, raio, sombra, motion). TS puro → reusa no RN.
2. Derivar `tokens.css` dele (`:root`, `:root[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`) com **grounds neutros** — claro `#FFFFFF`/superfície `#F5F4F2`, escuro `#17161A`/superfície `#211F24`.
3. Fazer `theme.ts` (canvas) derivar do **mesmo** objeto, eliminando a fonte dupla.
4. Rebaixar âmbar de primário a **acento** (`#F2A83B`); corrigir brasa→`#E4572E`; adicionar ameixa `#7A3E93` e teal `#1F8A76`; semântica: afinado=teal, acerto=dourado, off‑pitch=rust `#C4462C`.
5. Trocar Bricolage→**Figtree** (corpo); manter Fraunces (display).
6. Implementar `ThemeToggle` (seta `data-theme`, persiste em storage, respeita o sistema por padrão).
7. Varredura priorizada: substituir os hex de cor de marca hardcoded e os `style` inline de cor/tema pelas tokens (não migrar as 222 de uma vez — cor/tema primeiro).
**Pronto quando:** o app renderiza em **claro e escuro neutros**, âmbar só como acento, Figtree no corpo, o toggle funciona e persiste, e `tokens.css` + `theme.ts` derivam de `tokens.ts`.

## A7 — Higiene do estado de gamificação  🟢
**Origem:** robustez/consistência (pré‑requisito pra confiar nos sinais que alimentam EVA e celebração).
**Estado:** `getStreak()` chama `reconcileStreak()` que **escreve** no localStorage (getter que muta); `Dashboard.tsx` lê `getFreezeState()` **fora** do `AppContext`.
**Passos:** mover a reconciliação de streak pra um ponto explícito (hidratação no boot/`AppContext`), deixando os getters **puros**; expor freeze pelo `AppContext`.
**Pronto quando:** nenhum getter muta storage; streak e freeze vêm do contexto e não divergem.

## A5 — XP com fonte única de verdade  🟢
**Origem:** integridade (fosso Coursera: consistência = confiança); recompensa como **informação de competência** honesta.
**Estado:** `src/data/xp.ts` `xpForSession()` (cliente) diverge de `server/.../session.processor.ts` `computeXp()` (servidor omite o bônus +6 e usa outra fórmula de precisão) → **leaderboard mostra XP diferente do dashboard**.
**Passos:** definir **uma** spec de XP; servidor autoritativo pro que é exibido entre usuários (ou módulo compartilhado); alinhar fórmula + bônus; teste comparando as duas em casos.
**Pronto quando:** o XP exibido bate em dashboard e leaderboard.

## A4 — Persistir estado de retenção no backend  🔵 [RN‑safe]
**Origem:** P6 (aversão à perda nunca catastrófica; streak recuperável); teste do arrependimento (Eyal). Hoje o produto viola isso **por acidente**.
**Estado:** streak (UTC‑correto), freeze (cap 2, auto‑consumo), meta da semana, lembrete — computados corretos **mas só em localStorage**; não entram no `UserStatePayload`/`UserState` (Prisma).
**Passos:** adicionar campos (colunas/JSON) no `UserState`; migração Prisma; incluir no payload de sync (`sync.ts`/`api.ts`); hidratação **"server wins"**.
**Pronto quando:** reinstalar / trocar de navegador **mantém** ofensiva, freeze e meta.

## A6 — EVA no repo + guarda MPA‑safe no CI  🟢 [RN‑safe]
**Origem:** P1 (segurança psicológica; nunca "desafinado"); *feedback no nível do eu machuca* (Kluger & DeNisi); a voz MPA‑aware é o diferencial mais barato.
**Estado:** persona MPA‑aware **mora fora do repo** (`docs/eva-setup.md`, colada num SaaS externo), não versionada nem testada; três vozes que podem divergir (LLM externo, fallback do `Coach.tsx`, `diagnose()` em `src/data/coaching.ts`); `eva-setup.md` estale (cita o proxy Vite antigo, não o controller `/eva/chat`).
**Passos:** trazer o system prompt pro repo (`src/domain/eva-voice/prompt.ts`); **teste/lint de CI** que garante que nenhuma voz emite "desafinado/errado/você falhou"; corrigir o doc estale. (Unificar as 3 vozes = PRÓXIMO/C7.)
**Pronto quando:** prompt versionado no repo e o CI **quebra** se aparecer uma palavra proibida.

## A2 — Auth de consumidor sem fricção (e‑mail, sem slug)  🔵 [RN‑safe]
**Origem:** P2 (tempo‑até‑valor < 5 min); onboarding §6 (sem cadastro antes do aha); autonomia da SDT.
**Estado:** auth de produção real (argon2, JWT + refresh rotativo, verify/reset), cliente HTTP tipado, multi‑tenant; **login exige o slug do tenant** (só vive no localStorage → **quebra login cross‑device** e mata o onboarding rápido).
**Passos:** provisionar **tenant pessoal automático** no cadastro; login resolvido **só por e‑mail** (backend); remover a exigência de slug no front; manter o convite B2B2C como fluxo separado.
**Pronto quando:** cadastro/login só com e‑mail+senha, funcionando em outro navegador sem digitar slug; o convite B2B continua funcionando.

## A3 — Onboarding com vitória de maestria nos primeiros ~60s  🟣 [RN‑safe]
**Origem:** Bandura (experiência de maestria = fonte nº1 de autoeficácia; "vitória inegável nos primeiros 60s"); P2; Duolingo (conquista dia‑1 → retenção 33% vs 20%).
**Estado:** `RangeTest.tsx` + `src/audio/voiceType.ts` medem extensão ao vivo; motor emite F0/cents honestos; conquista `primeira-sessao` dispara por **participação** (registrar sessão), não por competência.
**Passos (wizard, uma coisa por tela):** boas‑vindas (1 tela) → **MicPrimer** custom antes do `getUserMedia` → **RangeTest = primeiro canto = aha** → 1º exercício guiado in‑context → **detector de "primeira nota afinada" no motor** (nota sustentada na faixa ~0,8s) → conquista de **competência** + EVA narrando → cadastro no pico emocional → NotifPrimer. **Zero estados de falha**; desmontar o mito do talento (a EVA nunca rotula "desafinado").
**Depende de:** A1 (UI/tokens) + A2 (auth sem fricção).
**Pronto quando:** um cadastro novo **canta e vê um resultado real em < 60s**, com uma conquista de competência e **zero telas de falha**.

---

## Decisões abertas (pra você bater o martelo)
1. **Pipeline de tokens:** objeto TS como fonte + `tokens.css`/`theme.ts` derivados **por um script** de build, ou espelhados **à mão** (mais simples, menos mágica)? *(recomendo: script simples de geração — uma fonte, zero drift.)*
2. **A2 e A4 tocam o backend** (`server/` NestJS + Prisma). Confirmo que posso mexer no backend nesta fase? *(sem isso, A4 não fecha e o onboarding cross‑device continua quebrado.)*
3. **Ritmo:** eu executo **tarefa por tarefa com checkpoint** (você revê cada uma antes da próxima) ou **a Fase AGORA inteira** e você revê no fim? *(recomendo checkpoint em A1, A4 e A3 — os de maior impacto — e correr os quick‑wins.)*
4. **Escopo dos `style` inline:** migrar só cor/tema agora (recomendado) ou varrer as ~222 de uma vez? *(recomendo incremental; varredura total é dívida separada.)*

## Como eu verifico cada tarefa
Rodo o dev server via preview, exercito o fluxo real (alternar tema, cadastrar em janela limpa, cantar no RangeTest, reinstalar‑simulado limpando storage) e mostro a evidência — nada de "confia que funciona".
