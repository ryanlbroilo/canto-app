# Backlog de Features e Plano de Ação Faseado — Reestruturação Web do Canto

> **O que é este documento.** O backlog priorizado e o plano de execução da reestruturação do app web do Canto, derivado de (a) a pesquisa de design/experiência e pedagogia (`docs/design/canto-design-experiencia.md`, `docs/pesquisa/pedagogia-canto.md`, `docs/pesquisa/pedagogia-motivacao.md`) e (b) a auditoria do código atual (motor DSP, gamificação, EVA, design/UI, auth/backend).
>
> **Para quem.** Fundador solo, Windows, sem Mac. Cada item foi dimensionado para uma pessoa executar.
>
> **Métrica-norte de tudo aqui:** retorno **D1 / D7 / D30** (CURR). Se uma feature não serve à segurança psicológica do cantor inseguro (P1) ou ao retorno amanhã (P2), ela desce na fila.
>
> **Princípio de sequência (inegociável):** *tokens de design antes dos componentes; motor preservado antes da nova UI.* O motor DSP é a parte mais madura e o diferencial técnico — ele é **preservado e endurecido**, nunca reescrito às pressas por causa de UI.
>
> **Nota de arquitetura.** Existe uma decisão registrada de migrar o shell para React Native (`docs/arquitetura/plano-react-native.md`), mantendo o Capacitor como ponte no go-live (`docs/arquitetura/decisao-mobile.md`). Este backlog é da **reestruturação web**, mas cada item marcado **[RN-safe]** já é executado de forma a sobreviver à migração (lógica separada de render, adaptador de storage, interface de transporte de áudio), pagando duas dívidas de uma vez.

---

## Sumário

1. [Como ler o backlog](#1-como-ler-o-backlog)
2. [Backlog priorizado — AGORA](#2-backlog-priorizado--agora)
3. [Backlog priorizado — PRÓXIMO](#3-backlog-priorizado--próximo)
4. [Backlog priorizado — DEPOIS](#4-backlog-priorizado--depois)
5. [Quick-wins vs. refactors estruturais](#5-quick-wins-vs-refactors-estruturais)
6. [Plano de ação faseado (marcos)](#6-plano-de-ação-faseado-marcos)
7. [Grafo de dependências](#7-grafo-de-dependências)
8. [Riscos e antipadrões a vigiar](#8-riscos-e-antipadrões-a-vigiar)

---

## 1. Como ler o backlog

Cada item traz:

- **Origem** — o princípio de pesquisa que o justifica (com a sigla do doc de design, ex. **P2**, ou o achado pedagógico, ex. *hipótese da orientação*).
- **Existe** — o que a auditoria confirmou que já está pronto no código.
- **Falta** — a lacuna concreta a fechar.
- **Tipo** — 🟢 quick-win (dias) · 🔵 refactor estrutural (semanas) · 🟣 feature nova.
- **[RN-safe]** quando o item deve ser feito com separação lógica/render para reuso no React Native.

As três faixas são **AGORA** (fundação + maior alavancagem de retenção + destrava o resto), **PRÓXIMO** (o fosso: maestria, fading, SOVT, EVA presente) e **DEPOIS** (diferenciais de longo prazo + quitação de dívida técnica).

---

## 2. Backlog priorizado — AGORA

> Foco: destravar toda a reestruturação (tokens), matar dark patterns acidentais, e entregar a **vitória de maestria no dia-1** — a maior alavanca de retenção que hoje simplesmente não existe.

### A1 — Sistema de design: fonte única de tokens + tema claro/escuro neutro 🔵 [RN-safe]
- **Origem:** decisão de fundo do §3 (fundo **neutro alternável**, âmbar como **acento**, não parede); tipografia Fraunces + **Figtree** (§3.5); acessibilidade AA (§3.4). É o **portão de dependência** de toda a nova UI.
- **Existe:** camada real de tokens em `src/styles/tokens.css` (cor, raio, sombra, tipo, espaço, motion); Fraunces já é o display; `prefers-reduced-motion` respeitado; mapa `COLORS` em `src/theme.ts` para canvas.
- **Falta:** (1) unificar a **dupla fonte de verdade** de cor (`tokens.css` ↔ `theme.ts` — hoje sincronizadas à mão) num objeto de tokens único de onde ambos derivam; (2) segundo tema (`[data-theme]` + `prefers-color-scheme`) com **grounds neutros** (branco / cinza escuro), demovendo o âmbar `#e9b44c`→`#F2A83B` de primário a acento; (3) trocar Bricolage Grotesque por **Figtree**; (4) adicionar os acentos ausentes **ameixa `#7A3E93`** e **teal `#1F8A76`** e corrigir a brasa (`#c65d3b`→`#E4572E`); (5) `ThemeToggle`.
- **Tipo:** 🔵 — bloqueia A-nível de UI; fazer primeiro.

### A2 — Auth de consumidor sem fricção (e-mail, sem slug de tenant) 🔵 [RN-safe]
- **Origem:** **P2** (tempo-até-valor < 5 min) e onboarding §6 (sem cadastro antes do "aha"); pesquisa de motivação: MPA + autonomia — nada de cerimônia B2B para um cantor solo.
- **Existe:** auth de produção real (argon2, JWT + refresh rotativo, verify/reset), cliente HTTP tipado com refresh automático, multi-tenant.
- **Falta:** o login exige digitar o **identificador do tenant (slug)** — muro B2B que mata o onboarding rápido **e quebra login cross-device** (o slug só vive no localStorage). Provisionar um **tenant pessoal automático** no cadastro e login **só por e-mail**; manter o fluxo de convite B2B2C como caminho separado.
- **Tipo:** 🔵 (backend + front), mas pré-requisito do onboarding de 60s.

### A3 — Onboarding com vitória de maestria nos primeiros 60s 🟣 [RN-safe]
- **Origem:** **Bandura** (experiência de maestria é a fonte nº1 de autoeficácia; "engenheirar uma vitória inegável nos primeiros 60s"); **P2**; Duolingo (conquista dia-1 → retenção 33% vs 20%); a primeira sessão **não pode** terminar em fracasso.
- **Existe:** `RangeTest` + `voiceType` medem extensão ao vivo; motor emite F0/cents honestos; conquista `primeira-sessao` existe.
- **Falta:** um **detector de primeira-vitória no motor** (ex.: primeira nota sustentada dentro da faixa por ~0,8s → dispara celebração) e uma conquista "Primeira nota afinada" ligada a competência real, **zero estados de falha** no wizard, EVA narrando o momento. Hoje a `primeira-sessao` dispara só por registrar sessão (participação), não por competência.
- **Tipo:** 🟣 — a maior alavanca de retenção do backlog.

### A4 — Persistir estado de retenção no backend (ofensiva, freeze, meta, lembrete) 🔵 [RN-safe]
- **Origem:** **P6** (aversão à perda nunca catastrófica; streak sempre recuperável); "streak perdoador" da SDT; teste do arrependimento de Eyal. Hoje o produto viola isso **por acidente**.
- **Existe:** streak UTC-correto, freeze (protetor de ofensiva, cap 2, auto-consumo), meta da semana, tudo computado corretamente — **mas só em localStorage**.
- **Falta:** `streak`, `freeze`, `weeklyGoal`, `reminder` **não** entram no `UserStatePayload`/`UserState` (Prisma). Reinstalar, limpar dados ou trocar de aparelho **apaga a ofensiva** — dark pattern acidental. Adicionar colunas/JSON no `UserState`, incluir no payload de sync, "server wins" na hidratação.
- **Tipo:** 🔵 (schema + sync).

### A5 — Corrigir XP com fonte dupla de verdade (servidor autoritativo) 🟢
- **Origem:** integridade/confiança (fosso Coursera: consistência = confiança); recompensa como **informação de competência** honesta (Deci/Koestner/Ryan).
- **Existe:** `src/data/xp.ts` `xpForSession()` (cliente) e `server/.../session.processor.ts` `computeXp()` (servidor) — **divergem** (servidor omite o bônus +6 de registro limpo e usa outra fórmula de precisão).
- **Falta:** o **leaderboard de equipe mostra XP diferente** do dashboard do próprio usuário. Definir **uma spec única** de XP (servidor autoritativo para o que é exibido entre usuários) ou compartilhar o módulo.
- **Tipo:** 🟢 quick-win de correção.

### A6 — Trazer a persona da EVA para o repo + guarda MPA-safe testável 🟢 [RN-safe]
- **Origem:** **P1** (segurança psicológica; nunca "desafinado"); *feedback no nível do eu machuca* (Kluger & DeNisi); a voz MPA-aware é o diferencial mais barato do produto (§10.2, ~37% de lift).
- **Existe:** persona genuinamente MPA-aware e quente — **mas mora fora do repo** (`docs/eva-setup.md`, colada num SaaS externo), não versionada, não testada; três vozes paralelas (LLM externo, fallback do `Coach.tsx`, `diagnose()`) que podem divergir.
- **Falta:** trazer o system prompt para o repo como artefato versionado; um **teste/lint de CI** que garanta que nenhuma das vozes emite "desafinado/errado/você falhou"; corrigir o `docs/eva-setup.md` estale (ainda cita o proxy Vite antigo em vez do controller NestJS `/eva/chat`).
- **Tipo:** 🟢 (a unificação completa das 3 vozes é PRÓXIMO — ver C7).

### A7 — Higiene de estado de gamificação (getters sem efeito colateral, freeze via contexto) 🟢
- **Origem:** robustez/consistência (pré-requisito para confiar nos sinais de competência que alimentam EVA e celebração).
- **Existe:** `getStreak()` chama `reconcileStreak()` que **escreve** no localStorage (um getter que muta estado persistido); `Dashboard.tsx` lê `getFreezeState()` direto, fora do `AppContext`.
- **Falta:** mover a reconciliação para um ponto explícito (não em leitura), e expor freeze pelo `AppContext` para não divergir do streak.
- **Tipo:** 🟢 quick-win.

**Definição de pronto do AGORA:** app renderiza em **claro e escuro neutros** com âmbar só como acento e Figtree no corpo; um cadastro novo por e-mail chega a **cantar e ver um resultado real em < 60s** com uma conquista de competência e **zero telas de falha**; ofensiva/freeze/meta **sobrevivem a reinstalar** (verificável trocando de navegador); XP do dashboard == XP do leaderboard; CI **falha** se qualquer voz da EVA disser "desafinado".

---

## 3. Backlog priorizado — PRÓXIMO

> Foco: o **fosso** — o que separa o Canto de um karaokê viciante. Fading, portão de maestria, SOVT como espinha, e a EVA deixando de ser destino para virar presença.

### B1 — Camada de política de feedback com fading no motor 🔵 [RN-safe]
- **Origem:** **P4** + *hipótese da orientação* (Salmoni/Schmidt/Walter 1984) + FIT (Kluger & DeNisi: >1/3 dos feedbacks pioram): feedback 100% constante cria **dependência**; a métrica de sucesso é **retenção sem ajuda**, não acurácia na sessão. Achado central e hoje **totalmente ausente**.
- **Existe:** motor emite `smoothedFreq/note/cents` **sempre**; `ExercisePlayer` mostra agulha ao vivo o exercício inteiro; `settings.fadingFeedback` existe (default true) mas **nada o honra**.
- **Falta:** uma **camada de política de feedback** no `PitchEngine` (atenua/suprime cents ao vivo conforme a maestria sobe; **feedback de banda** — só sinaliza fora de ~25 cents; rep final "só de ouvido" com auto-estimar-então-revelar) que os consumidores respeitem. Ligar a política ao sinal de competência por exercício.
- **Tipo:** 🔵 — o diferencial pedagógico nº1.

### B2 — Portão de maestria "Aferição" medido pelo DSP 🟣 [RN-safe]
- **Origem:** **P5** (domínio real com portões; item avaliado cedo ↑ conclusão — Coursera); *aprendizagem para maestria* + *portão por nó + loop corretivo* (Rosenshine/Kulik); recompensa honesta = confiança de longo prazo.
- **Existe:** `SessionAggregator` produz a matéria-prima (hit%, cents, jitter/shimmer, voiced%, registro); `Exercises.tsx` tem maestria **cosmética** (score ≥90 vira dourado, mas **não trava nada** — nós "locked" ainda abrem); `review.ts` já tem fila de revisão.
- **Falta:** um **módulo de portão pass/fail** definido pelo DSP; progressão **realmente travada** até passar; estado de posição na trilha como entidade **sincronizada no servidor** (hoje `reviewsDone` é local-only e nunca sincroniza); EVA **narrando** o "você passou". O `AfericaoGate` do doc de design está por construir.
- **Tipo:** 🟣 (motor + dados + UI + EVA).

### B3 — Análise específica de SOVT + ritual de aquecimento diário 🟣 [RN-safe]
- **Origem:** **SOVT é a técnica mais bem embasada da ciência vocal** (Titze; Kapsner-Smith 2015) — deve ser a **espinha dorsal do aquecimento** e escudo de responsabilidade (saúde vocal); B=MAP de Fogg (primeira ação diária minúscula: aquecimento 30s).
- **Existe:** exercício "Siren" menciona lip-trill só na cópia; o motor trata straw/lip-trill como pitch monofônico genérico.
- **Falta:** detecção de **flutter do lip-trill**, estabilidade/soprosidade da fonação em canudo, scoring apropriado a SOVT; e um **ritual SOVT-primeiro** como entrada da sessão diária, recompensado no loop de gamificação (hoje nada premia o aquecimento como hábito).
- **Tipo:** 🟣 (motor + trilha).

### B4 — EVA sempre presente, renderizada como waveform luminosa âmbar 🔵 [RN-safe]
- **Origem:** §4 (EVA = ser-de-som luminoso, corpo = fita de onda; companheira **sempre presente**, não destino); pertencimento da SDT; PRISMA 2025 (avatar abstrato de baixo realismo > realismo médio).
- **Existe:** o orbe luminoso real (`AudioBlob.tsx`) já pulsa com energia e muda cor por afinação — mas **não está ligado à identidade da EVA** e defaulta para dourado/verde; a "cara" da EVA hoje é um ícone-spark verde estático (`.eva-avatar`); EVA vive só na rota `/eva`.
- **Falta:** vincular `AudioBlob` à identidade da EVA no token âmbar `#F2A83B` (núcleo ameixa `#7A3E93`), com estados idle-respira/escuta/afinado(teal)/acerto(dourado); **tecer a EVA na trilha-como-lar** e no pós-exercício, não só num chat separado.
- **Tipo:** 🔵.

### B5 — A trilha como o lar (não um card entre vários) 🔵
- **Origem:** **P3** (o caminho é o lar; próxima ação sempre óbvia; padrão home-as-the-path do Duolingo/Vanido); reduz carga cognitiva.
- **Existe:** o sistema de nós serpentina já existe (`.dsh-mp-node`/`.dsh-step` em `dashboard.css`) com estados done/next/locked e pulse-no-next — a primitiva mais vision-crítica **já prototipada**.
- **Falta:** promovê-la de **um card entre XP-hero/missões/conquistas** para **a home**, com um único CTA "Continuar" apontando o próximo nó. Depende de B2 (portão) para os nós travarem de verdade.
- **Tipo:** 🔵 (reorganização de layout + estado de posição).

### B6 — Adaptador de storage + interface PitchSource (portabilidade) 🔵 [RN-safe]
- **Origem:** princípio de arquitetura "reusar a lógica" (`plano-react-native.md` §3): a lógica sobrevive à migração, só a cola de plataforma reescreve.
- **Existe:** lógica já framework-agnóstica (`api.ts`, `sync.ts`, `xp.ts`, `gamification.ts`, `perception/register/session/notes/vibrato`), motor com fronteira engine/UI limpa (nenhum arquivo de `src/audio` importa React).
- **Falta:** `store.ts` **hardcoda `localStorage`** em todos os getters/setters — o maior bloqueador de portabilidade (RN não tem localStorage). Extrair uma **interface de storage** (localStorage na web, AsyncStorage/MMKV no RN). E extrair uma **interface `PitchSource`** para que perception/register/session fiquem acima de uma camada de captura trocável (web AudioWorklet ↔ nativo).
- **Tipo:** 🔵 refactor de fundação para RN.

### B7 — Unificar as 3 vozes da EVA num módulo de coaching in-repo 🔵 [RN-safe]
- **Origem:** garantir **uma** personalidade MPA-safe testável (P1); reuso RN; hoje a voz pode divergir em 3 lugares.
- **Existe:** `coaching.ts` `diagnose()` (puro, pedagogicamente sólido: força-antes-de-correção, KP/KR, SOVT como cue) e `eva.ts` (transporte/contexto) já são reusáveis; o fallback de `Coach.tsx` **duplica** a lógica de diagnóstico em vez de reusar `diagnose()`.
- **Falta:** colapsar prompt-LLM + fallback local + `diagnose()` numa camada de voz única, in-repo e coberta por teste; extrair a lógica de streaming/sessão de `Coach.tsx` (~405 linhas) para um hook reusável.
- **Tipo:** 🔵 (segue A6).

### B8 — Re-skin dos componentes sobre os novos tokens + des-inline 🔵
- **Origem:** §3 (botões táteis pressed-key; disciplina de paleta = confiança); manutenibilidade/tema.
- **Existe:** inventário de componentes class-based razoavelmente completo (btn/card/badge/chip/stat/input/segmented/bar/toggle/skeleton).
- **Falta:** **222 usos de `style={{}}`** em 30 tsx e **26 hex hardcoded** em 7 tsx que **ignoram os tokens** e quebrariam a troca de tema; botões flat → táteis (borda-de-baixo 3–4px, press-down); mover CSS de página dos `.tsx` para ordem de import explícita.
- **Tipo:** 🔵 (só faz sentido **depois** de A1).

### B9 — Celebração de conquista + loop de recompensa ligado à EVA 🟢
- **Origem:** "enviar streak + celebração primeiro" (§5.3); recompensa como **informação de competência** e **elogio verbal específico** (a recompensa mais segura — Deci/Koestner/Ryan); Tiny Habits (celebrar imediatamente — Fogg).
- **Existe:** `UnlockedAchievement` guarda timestamp `at` para um cue "novo!" — mas **nenhum toast/celebração** o mostra; a meta semanal completa mostra só um check.
- **Falta:** `AchievementToast`; celebração calorosa **narrada pela EVA** ao fechar streak/salvar com freeze/bater meta/desbloquear conquista, ligando os sinais de gamificação à mensageria da EVA.
- **Tipo:** 🟢 quick-win (componente + cópia).

### B10 — Ligar o lembrete diário (settings + entrega) 🟣
- **Origem:** §5.3 (meta ligada ao horário escolhido; personalização ↑ opt-in 87%); `NotifPrimer` pós-valor (§6.1 passo 7).
- **Existe:** `getReminder/setReminder/ReminderPref` em `store.ts` — **código morto**: nenhum componente lê/escreve, `sw.js` não tem push/notification/periodicSync.
- **Falta:** UI em Settings (enabled/hora), o `NotifPrimer` personalizado pós-valor, e a **entrega** (Web Push VAPID + backend, ou local/periodicSync no `sw.js`). *Nota: no PWA a entrega é frágil — a UI + agendamento local entram aqui; Web Push completo pode escorregar para DEPOIS.*
- **Tipo:** 🟣.

**Definição de pronto do PRÓXIMO:** o feedback de pitch **desvanece** conforme a maestria (verificável: a agulha some numa rep final e o usuário se auto-avalia antes de ver); passar de habilidade **exige** uma Aferição medida pelo DSP e o gate **sincroniza** entre dispositivos; um aquecimento **SOVT** abre a sessão diária e conta no loop; a EVA aparece como **waveform âmbar** na home e narra o progresso; `store.ts` e a captura de áudio estão atrás de **interfaces trocáveis**.

---

## 4. Backlog priorizado — DEPOIS

> Foco: diferenciais de longo prazo (exposição gradual, prova compartilhável, revisão espaçada) e quitação da dívida técnica do motor. Nada aqui bloqueia retenção D1/D7 imediata.

### C1 — Escada de exposição gradual anti-ansiedade (sozinho → gravar → compartilhar → grupo) 🟣 [RN-safe]
- **Origem:** **MPA/Kenny** — exposição gradual da TCC é o tratamento mais suportado; "manter o erro privado e reversível"; provavelmente o **maior diferencial** para adultos envergonhados.
- **Existe:** a fundação de privacidade já encaixa (áudio nunca persiste, só números viajam); mas **nada** modela o estágio de exposição.
- **Falta:** modelo de dados de estágio de exposição; conquistas privadas-por-padrão e reversíveis; gravação privada → compartilhar trecho com EVA/amigo → grupo pequeno; EVA fazendo reestruturação cognitiva e *reappraisal* de arousal. **Sem ranking público entre estranhos.**
- **Tipo:** 🟣 (dados + UI + EVA).

### C2 — Prova de habilidade compartilhável (antes/depois verificável) 🟣
- **Origem:** fosso Coursera (credencial verificável); modelos vicários "gente como eu" (Bandura); §5.4.
- **Existe:** sessões guardam métricas; nada gera artefato compartilhável.
- **Falta:** `BeforeAfterShare` (gravação antes/depois com link verificável que um líder de louvor reconheça) + `SkillBadge`. Respeitar licenciamento de música.
- **Tipo:** 🟣.

### C3 — Trilha espaçamento-nativa + auto-estimar-então-revelar 🔵
- **Origem:** **espaçamento + prática de recuperação** (as duas de maior utilidade — Dunlosky); *auto-estimar-então-revelar* fortalece detecção de erro (Guadagnoli & Kohl).
- **Existe:** `review.ts` (fila de revisão espaçada) já existe.
- **Falta:** tornar a trilha espaçamento-nativa (limitar material novo/dia, reapresentar em ~1/3/7/16 dias); drills de chame-e-responda onde a referência **some**; a interação-assinatura "como você acha que ficou?" antes do DSP revelar.
- **Tipo:** 🔵.

### C4 — Nós de música com auto-transposição 🟣
- **Origem:** §5.4 (música de verdade no path é o diferencial emocional; auto-transpor para a extensão do usuário); autonomia da SDT (escolher repertório).
- **Existe:** perfil de voz/extensão do onboarding; `TonePlayer`.
- **Falta:** `MusicNode` com auto-transposição para a faixa do cantor; modo louvor opt-in; catálogo respeitando licenciamento (autoral + domínio público + CCLI).
- **Tipo:** 🟣.

### C5 — Quitar a dívida técnica do motor DSP 🔵 [RN-safe]
- **Origem:** robustez/segurança do diferencial técnico; pré-requisito de confiança para o fading (B1) e a Aferição (B2) dependerem de timing preciso.
- **Existe:** pipeline off-main-thread textbook, dois backends atrás de uma interface, veto neural, core Rust disciplinado.
- **Falta (dívidas da auditoria):** MPM implementado **duas vezes** (Rust + TS) sem fonte única; layout do ring-buffer **triplicado** e `capture-processor.js` **hardcoda** CAPACITY/CONTROL_LEN; polling `setTimeout(8ms)` em vez de `Atomics.wait/notify`; **sem detecção de overrun** no ring; corridas de `stop()` (singleton parado por 3 cleanups); dois limiares de confiança neural sem constante compartilhada; gating fixo (`CLARITY_MIN/RMS_MIN`) apesar de existir noise-floor adaptativo; **zero testes unitários** nos módulos TS destinados ao RN; timestamps mistos (`performance.now()` vs `AudioContext.currentTime`); docs estale (README diz 5 features, `analyze()` retorna 6).
- **Tipo:** 🔵 (fazer uma dívida por vez entre features; priorizar testes dos módulos que migram para RN).

### C6 — Ligas opt-in de encorajamento (A/B gated) 🟣
- **Origem:** §5.3 + antipadrões §9.1: ligas ↑ engajamento **mas** competição desmotiva ansiosos e cantar é exposto — **opt-in, skill-matched, cohort (grupo de louvor)**, nunca ranking global; enviar streak + celebração primeiro.
- **Existe:** leaderboard de equipe/ministério (`tenant.service.ts`) — hoje é XP ranking **sem opt-out**.
- **Falta:** tornar a comparação **auto-referencial por padrão** ("sua voz mês passado vs. agora") e as ligas um experimento **opt-in** gated e A/B testado.
- **Tipo:** 🟣.

### C7 — E-mail de produção + enforcement de verificação 🟢
- **Origem:** go-live/confiança; hoje a cópia "confirmar libera recuperação" é aspiracional.
- **Existe:** fluxo de verify/reset com mailer dev/SMTP; front consome o token.
- **Falta:** `EMAIL_PROVIDER=dev` (só loga) — configurar SMTP real; `emailVerified` é **cosmético** (nada gateia). Decidir o que verificação libera.
- **Tipo:** 🟢 (config) + pequena regra de guarda. *Depende de infra do fundador (SMTP/domínio).*

**Definição de pronto do DEPOIS:** existe uma **escada de exposição** com erro privado-e-reversível e sem ranking forçado; o usuário gera um **antes/depois compartilhável**; a trilha reapresenta material em intervalos crescentes; o motor tem **fonte única** de MPM e de layout de ring, testes nos módulos RN, e sem corridas de `stop()`.

---

## 5. Quick-wins vs. refactors estruturais

Separação explícita para o fundador solo escolher lotes por energia/tempo disponível.

### 🟢 Quick-wins (dias, baixo risco, alto ROI)
| # | Item | Faixa |
|---|---|---|
| A5 | Unificar spec de XP (servidor autoritativo) | AGORA |
| A6 | Persona EVA in-repo + teste "nunca desafinado" + corrigir `eva-setup.md` estale | AGORA |
| A7 | Getter de streak sem efeito colateral; freeze via `AppContext` | AGORA |
| B9 | `AchievementToast` + celebração narrada pela EVA | PRÓXIMO |
| — | Adicionar tokens ameixa/teal e corrigir hex da brasa (subitem de A1) | AGORA |
| — | `chat.dto.ts`: parar de aceitar `role:'system'` do cliente | PRÓXIMO |
| — | Corrigir README do wasm (5→6 features) e path `model.onnx` hardcoded | DEPOIS |
| C7 | Ligar SMTP de produção (config) | DEPOIS |

### 🔵 Refactors estruturais (semanas, carregam dependências)
| # | Item | Por que é estrutural |
|---|---|---|
| A1 | Tokens únicos + tema claro/escuro neutro + Figtree | **Portão** de toda a nova UI |
| A2 | Auth por e-mail (sem slug) | backend + front + hidratação |
| A4 | Persistir retenção no backend | schema Prisma + sync |
| B1 | Camada de fading no motor | novo contrato motor↔consumidores |
| B2 | Aferição (portão medido) | motor + dados sincronizados + UI + EVA |
| B6 | Adaptador de storage + `PitchSource` | fundação de portabilidade RN |
| B7 | Unificar vozes da EVA | colapsar 3 fontes em 1 |
| B8 | Re-skin + des-inline (222 styles / 26 hex) | só após A1 |
| C5 | Dívida do motor (MPM único, ring único, testes) | segurança do diferencial |

### 🟣 Features novas maiores
A3 (onboarding 60s), B3 (SOVT), B4 (EVA presente), B5 (trilha-lar), B10 (lembrete), C1 (exposição), C2 (prova), C4 (música), C6 (ligas).

---

## 6. Plano de ação faseado (marcos)

Marcos de ~2 semanas para dev solo (some folga). **Cada marco entrega algo publicável e nenhum quebra o motor.** A ordem respeita: *tokens antes de componentes; motor preservado antes de nova UI; dados/portabilidade antes do que depende deles.*

### Marco 0 — Integridade & fundação de dados (quick-wins)
**Itens:** A5, A7, A6 (parcial: persona in-repo + teste), subitens de tokens (ameixa/teal/brasa), `chat.dto.ts`.
**Por quê primeiro:** correções baratas que destravam confiança nos sinais de competência (que EVA e celebração vão consumir) e plantam a guarda MPA-safe antes de mexer na EVA.
**Pronto quando:** XP do dashboard == leaderboard; nenhum getter muta estado em leitura; CI falha se a EVA disser "desafinado"; tokens de acento completos existem.

### Marco 1 — Sistema de design (o portão)
**Itens:** A1 completo (fonte única de tokens, tema claro/escuro neutro, Figtree, `ThemeToggle`).
**Dependência:** nada — mas **bloqueia** B8.
**Pronto quando:** o app inteiro renderiza em claro e escuro **neutros**, âmbar só como acento, Figtree no corpo, alternável pelo usuário; a dupla fonte de cor virou uma só.

### Marco 2 — Onboarding de 60s + auth sem fricção
**Itens:** A2 (e-mail, sem slug), A3 (vitória de maestria 60s + conquista de competência + EVA narrando), A4 (persistir retenção no backend).
**Dependência:** A2 antes de A3 (cadastro no pico emocional); A4 garante que a ofensiva ganha não evapora.
**Pronto quando:** cadastro novo canta e vê resultado real **< 60s**, zero falha; ofensiva/freeze/meta **sobrevivem a reinstalar**.

### Marco 3 — Motor: fading + SOVT + portabilidade
**Itens:** B1 (fading), B3 (SOVT + ritual), B6 (storage adapter + `PitchSource`), início de C5 (testes dos módulos que migram).
**Dependência:** **motor preservado** — endurecer antes de novas superfícies dependerem dele. B1 e B2 dependem de sinais de competência confiáveis.
**Pronto quando:** o feedback desvanece por maestria e por banda; a rep final é "só de ouvido" com auto-estimar-então-revelar; um aquecimento SOVT abre a sessão; `store.ts` e captura estão atrás de interfaces.

### Marco 4 — Maestria + trilha-lar + EVA presente
**Itens:** B2 (Aferição medida + gate sincronizado), B5 (trilha como home + CTA Continuar), B4 (EVA waveform âmbar tecida na home), B9 (celebração narrada), B7 (unificar vozes), B8 (re-skin sobre tokens).
**Dependência:** B2 depende de B1 (fading) e de A4 (estado sincronizado); B5 depende de B2 (nós travam de verdade); B8 depende de M1 (tokens).
**Pronto quando:** progredir **exige** passar uma Aferição medida pelo DSP, sincronizada entre dispositivos; a trilha É a home; a EVA aparece como waveform âmbar e narra marcos; nenhum componente usa hex/inline fora dos tokens.

### Marco 5 — Diferenciais de longo prazo + dívida do motor
**Itens:** C1 (exposição gradual), C3 (espaçamento-nativo + auto-estimar), B10 (lembrete), C5 (resto: MPM único, ring único, corridas de stop), C2 (antes/depois), depois C4/C6/C7 conforme tração.
**Pronto quando:** existe escada de exposição privada-e-reversível; a trilha reapresenta material espaçado; o motor tem fonte única de MPM/ring e testes; existe prova compartilhável.

> **Faixa paralela (RN, fora deste backlog web):** conforme `plano-react-native.md`, o spike de áudio nativo no Android barato e a migração de shell rodam **em paralelo** e se beneficiam de todo item **[RN-safe]** feito aqui (adaptador de storage, `PitchSource`, lógica separada de render, testes do motor). Não misturar com o caminho crítico de retenção web.

---

## 7. Grafo de dependências

```
A1 (tokens/tema) ─────────────────────────► B8 (re-skin componentes)
A2 (auth e-mail) ──► A3 (onboarding 60s)
A4 (persistir retenção) ──────────────────► B2 (Aferição sincronizada)
A5/A6/A7 (integridade + guarda EVA) ──────► B9 (celebração) / B7 (vozes EVA)
B1 (fading) ──────────────────────────────► B2 (Aferição depende de competência confiável)
B2 (portão) ──────────────────────────────► B5 (trilha-lar: nós travam)
B6 (storage/PitchSource) ─────────────────► faixa RN [RN-safe]
C5 (dívida motor) reforça B1/B2 (timing preciso)
```

Regras de ouro do grafo:
- **Tokens (A1) antes de re-skin (B8).**
- **Motor endurecido/fading (B1, C5) antes das superfícies que dependem de competência confiável (B2, B5).**
- **Auth sem fricção (A2) antes do onboarding de 60s (A3).**
- **Persistir retenção (A4) antes de gate sincronizado (B2).**

---

## 8. Riscos e antipadrões a vigiar

- **Recompensa que corrói motivação (superjustificação — Deci/Koestner/Ryan):** XP/badges devem sinalizar **maestria/identidade**, nunca virar o motivo de cantar. Vigiar em B9/C6.
- **Ilusão de fluência (Bjork/Kornell):** não otimizar para acurácia **dentro da sessão**; pontuar desempenho **não-assistido, espaçado, atrasado**. Vigiar em B2/C3.
- **Dependência de feedback (hipótese da orientação):** a linha de pitch sempre-ligada é o antipadrão-mor; B1 existe justamente para matá-lo.
- **Dark pattern acidental de streak:** A4 é o conserto — enquanto retenção for local-only, o produto viola P6 sem querer.
- **Rotular "desafinado":** guardado por CI (A6). Tom-surdo real ~1,5%; a barreira é motivacional, não capacidade.
- **Ranking forçado:** manter comparação auto-referencial por padrão (C6); ligas são opt-in e A/B, nunca default.
- **Efeito-novidade da gamificação (~semana 4 — Rodrigues 2022):** não front-carregar todas as recompensas; escalonar conteúdo para segurar as semanas 6+.
- **Over-intercalar/multi-medidor para novato:** uma deixa focal por vez (carga cognitiva); intercalação moderada no início.
- **Prometer "10.000 horas"/QI:** honestidade de marketing é fosso no beachhead gospel — prescrever prática deliberada, não horas mágicas.

---

*Documento vivo, mantido curto e estrito de propósito (disciplina Coursera). Cada item aqui aponta para um princípio de pesquisa e uma lacuna verificada na auditoria. Se um item não serve à segurança psicológica do cantor inseguro (P1) ou ao retorno D1/D7/D30 (P2), ele não sobe na fila.*
