# PRD + Brief de Execução — Plataforma de Treino Vocal com IA
### Codinome de trabalho: `[NOME_PLATAFORMA]` · Persona coach: EVA Vocal Coach (nova persona no EVA Hub)

> **Como usar este documento:** este é o brief-mestre para o Claude Code. Leia inteiro antes de escrever qualquer linha. Ele define visão, arquitetura, o que é MVP vs. futuro, e — o mais importante — a arquitetura de IA correta (DSP no cliente + LLM para coaching), que é o ponto onde a maioria dos concorrentes erra. Trate a Fase 0 (setup) e a Fase 1 (pipeline de áudio) como fundação inegociável: sem elas nada funciona.

---

## 0. TL;DR do produto

Uma plataforma web de treino vocal que faz o que os concorrentes não fazem: **feedback em tempo real durante a nota** (não depois), **um coach de IA que explica o porquê e remonta o plano** (não só um placar de pontos), e **diagnóstico de registro vocal** (peito / mix / cabeça / falsete e a transição entre eles). Nativa em português, com olho no mercado brasileiro (pop, rock, sertanejo, MPB, gospel) e arquitetura pronta para escalar globalmente.

O diferencial central não é o placar (qualquer um copia) — é a **camada de interpretação inteligente**: o DSP mede, a persona EVA entende e conversa.

---

## 1. Contexto e posicionamento

### 1.1 O problema (validado em pesquisa de campo)
Os apps atuais (Vanido, Yousician, Singing Carrots, SingSharp, Simply Sing, Smule) sofrem de gaps consistentes:

1. **Feedback tardio.** Mostram o resultado *depois* que o usuário errou a nota, quando já não dá pra corrigir. Erro fatal de UX de aprendizado.
2. **Placar, não professor.** Pontuam (%, estrelas, cores) mas não explicam o *porquê* nem *o que fazer a seguir*.
3. **Zero diagnóstico de registro.** Medem pitch, não mecanismo vocal. Ninguém diz "isso foi falsete, você tem um buraco no passaggio".
4. **Detecção falha nos extremos** (acima de ~C5 e nos graves), e vibrato/notas curtas confundem os algoritmos.
5. **Fragmentação.** O usuário precisa de 3-4 apps (range, warm-up, karaokê, teoria).
6. **Genérico ao objetivo.** Ninguém faz engenharia reversa de "quero cantar a música X" até um plano.
7. **Buraco Brasil.** No BR só existe vídeo-aula gravada (sem tech de tempo real). Apps com tech são gringos, sem PT nativo nem repertório BR. Gospel e sertanejo são mercados enormes e desatendidos por tech.

### 1.2 Posicionamento
> "O primeiro coach vocal de IA que **entende sua voz** — não só te dá nota. Em português, do seu jeito, do zero ao palco."

Não competimos em tamanho de catálogo de música licenciada (guerra cara e perdida contra Yousician). Competimos em **inteligência do feedback + tempo real + contexto brasileiro**.

### 1.3 Público-alvo (em ordem)
1. **Autodidata adulto** que quer aprender canto sozinho, com disciplina, e se frustra com apps que só dão placar. (Persona primária — é o próprio fundador.)
2. **Cantor amador travado** que "canta bem sozinho mas trava com técnica" e não sabe por quê.
3. **Mercado gospel/sertanejo BR** (fase 2 de go-to-market — repertório e linguagem específicos).

---

## 2. O diferencial técnico central: arquitetura de IA correta

**LEIA ISTO COM ATENÇÃO. Aqui é onde o projeto ganha ou morre.**

A análise de pitch, afinação, estabilidade e registro **NÃO é feita por LLM**. É **DSP (processamento de sinal)** rodando **no navegador (client-side)**. A LLM (persona EVA) entra **depois**, como camada de interpretação e coaching.

### 2.1 Divisão de responsabilidades

**CAMADA 1 — DSP no cliente (mede):**
- Captura de microfone via `getUserMedia` (Web Audio API).
- Detecção de pitch (F0) em tempo real a ~60 FPS (16.7ms por frame).
- Cálculo de: nota cantada, desvio em cents da nota-alvo, estabilidade (jitter/shimmer), on/off pitch em tempo real.
- Detecção de eventos: quebras de registro, "cracks", início/fim de nota, vibrato.
- Roda 100% local. **Áudio nunca sai do navegador.** (Privacidade + latência + custo zero de transporte.)

**CAMADA 2 — EVA Coach / LLM (entende e conversa):**
- Recebe **features numéricas** extraídas pelo DSP (NÃO o áudio bruto): timeline de F0, cents de desvio, notas-alvo vs. cantadas, eventos de quebra, tempo gasto em cada registro, métricas de estabilidade, histórico do usuário.
- Interpreta e traduz em coaching acionável: "você quebrou no F4 porque não transicionou pra head voice — faz esse exercício de sirene".
- Gera e adapta o currículo/rotina com base no diagnóstico e no objetivo do usuário.
- Conversa, motiva, explica o "porquê" (o que placar nenhum faz).
- Detecta sinais de fadiga/abuso vocal e recomenda descanso.

**REGRA DE OURO:** nunca mandar áudio bruto pra LLM pedindo "isso tá afinado?". Isso é caro, lento e ruim. A LLM só vê os números que o DSP produziu.

### 2.2 Onde a EVA vive
A persona EVA Coach é uma **nova persona registrada no EVA Hub** (`evahub.com.br`), reaproveitando a infra de IA já existente (abstração de LLM, roteamento de modelo, billing, auth). O front consome a EVA via API do Hub. O backend próprio da plataforma cuida de dados de progresso, exercícios e áudio de referência.

---

## 3. Stack técnica

Coerente com o ecossistema já em uso (React/Vite, .NET, PostgreSQL, EVA Hub):

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS (design system próprio — ver seção 9)
- Canvas API para visualização de pitch em tempo real (piano roll / notas caindo)
- Web Audio API + **AudioWorklet** (NÃO ScriptProcessorNode, que é deprecated) para captura e processamento fora da main thread

**DSP / detecção de pitch (client-side)**
- Começar com **autocorrelação / YIN / McLeod (MPM)** — MPM é bom para voz monofônica. Referências prontas: `cwilso/PitchDetect`, `pitchlite` (WASM de MPM/YIN), `sevagh/pitch-detection`.
- Compilar o hot path para **WebAssembly** (Rust ou C++) rodando dentro do AudioWorklet, para 60 FPS estável em dispositivos fracos (~8x mais rápido que JS puro).
- **Evolução futura:** CREPE (deep learning via TensorFlow.js) para precisão nos extremos (>C5 e graves), onde autocorrelação sofre. Deixar arquitetura plugável para trocar de algoritmo.

**Backend próprio**
- .NET (Kestrel) OU Node — escolher pela familiaridade. Responsabilidade: dados de usuário, progresso, exercícios, biblioteca de músicas/MIDI, orquestração de sessão.
- Consome EVA Hub para a camada de IA (persona coach).

**Dados**
- PostgreSQL (progresso, sessões, currículo, histórico de range)
- Object storage (MinIO / S3-compatible) só se for guardar gravações que o USUÁRIO optar por salvar — nunca por padrão.

**Infra**
- Docker, deploy no padrão já usado (VPS + Caddy, ou o que estiver em produção no EVA Hub).

---

## 4. A persona EVA Vocal Coach

### 4.1 Comportamento (base do system prompt da persona)
A EVA Coach deve ser:
- **Analítica e sincera.** Se o take foi ruim, diz que foi ruim — mas sempre com o próximo passo. Nunca elogio vazio (elogio genérico é pior que nada, trava o aluno no erro).
- **Explicativa.** Todo feedback vem com o *porquê* fisiológico e o *o que fazer*.
- **Adaptativa.** Lê o histórico e ajusta. Se o F4 travou 3 sessões seguidas, muda a abordagem.
- **Cuidadosa com saúde vocal.** Detecta sinais de strain (queda de estabilidade, esforço nos agudos) e manda descansar. "Canto não dói."
- **Motivadora sem ser bajuladora.** Cria vínculo e celebra progresso real, mas não infla ego.
- **Em português brasileiro natural**, com opção de outros idiomas no futuro.

### 4.2 Input que a EVA recebe (contrato de dados DSP → LLM)
```json
{
  "session_id": "...",
  "user": { "range_baseline": {"low": "C#3", "high": "F4"}, "voice_type": "baritone", "goal": "Shrike - Hozier (G2-C5)", "known_break": "F4" },
  "exercise": { "type": "lip_trill_siren", "target_notes": ["C3","...","G4"] },
  "performance": {
    "pitch_timeline": [{"t": 0.0, "f0_hz": 138.6, "note": "C#3", "cents_off": -12}, "..."],
    "avg_cents_deviation": 18,
    "notes_hit_pct": 74,
    "stability": { "jitter": 0.03, "shimmer": 0.05 },
    "events": [
      {"t": 4.2, "type": "register_break", "from": "chest", "to": "falsetto", "note": "F4"},
      {"t": 6.1, "type": "pitch_crack", "note": "F#4"}
    ],
    "register_time": { "chest_pct": 68, "mix_pct": 4, "head_pct": 0, "falsetto_pct": 28 }
  }
}
```
A EVA transforma isso em: diagnóstico em linguagem humana + próximo exercício + ajuste no plano. **Ela nunca vê o áudio.**

### 4.3 Output da EVA
- Diagnóstico curto e acionável da sessão.
- Ajuste do plano (próxima sessão / próxima semana).
- Resposta a perguntas do usuário em chat ("por que minha voz quebra no F4?").

---

## 5. Features — MVP vs. Futuro

### 5.1 MVP (o que faz o produto existir e provar valor)
Priorizado. Não construir V2 antes de MVP fechado.

1. **Onboarding + teste de range.** Detecta nota mais grave e mais aguda, salva baseline, identifica tipo vocal aproximado. (Cuidado: distinguir range conectado de falsete — ver seção 6.)
2. **Pipeline de pitch em tempo real.** Canvas com feedback ao vivo: nota-alvo + nota cantada + desvio, com cor mudando *durante* a nota (verde no alvo, amarelo/vermelho fora). **Este é o coração — feedback DURANTE, não depois.**
3. **Rotina diária de exercícios** (respiração guiada, lip trills/sirene, exercícios de transição, head voice, mix, aplicação em música). Estruturada em fases progressivas.
4. **Análise pós-sessão pela EVA.** Recebe os features, cospe diagnóstico + próximo passo.
5. **Medidor de range com histórico.** Gráfico de evolução ao longo do tempo.
6. **Tracker de consistência** (streak / hábito). Retenção é o problema real: o melhor app é o que você abre todo dia.
7. **Chat com a EVA Coach.** Perguntas sobre técnica, o plano, dúvidas.

### 5.2 V2 (diferenciais que viram moat)
- **Diagnóstico de registro** (peito/mix/cabeça/falsete + detecção de passaggio). O grande diferencial. É P&D — analisar formantes e razão harmônica, não só F0. Tratar como projeto contínuo.
- **Engenharia reversa de música-objetivo.** Usuário diz "quero cantar X", sistema analisa o range/demandas da música e monta trilha até lá.
- **Modo música/karaokê** com pitch display (notas caindo estilo ref. Rockstar) e transposição automática pra range do usuário.
- **Repertório BR** (pop, rock, sertanejo, MPB, gospel) — via MIDI/melodia, evitando licenciamento caro no começo (foco em melodia-guia, não master licenciado).
- **Detecção de vibrato e agilidade** (melismas, runs).
- **Cooldown inteligente** e monitoramento de fadiga vocal ao longo da sessão.

### 5.3 Fora de escopo (não fazer)
- Rede social de canto (é o jogo da Smule, não o nosso).
- Catálogo gigante de músicas licenciadas (guerra cara).
- App nativo mobile no começo (web-first; PWA depois).

---

## 6. Armadilhas técnicas conhecidas (resolver desde o design)

1. **Falsete vs. voz conectada no teste de range.** O detector pega qualquer som — falsete infla o topo, vocal fry infla o grave. O teste precisa distinguir (ou ao menos sinalizar) range *conectado* vs. *bruto*. Não registrar falsete solto como se fosse o teto real.
2. **Latência.** O feedback tem que ser *durante* a nota. AudioWorklet + WASM, não main thread. Medir latência real e manter abaixo do perceptível.
3. **Detecção nos extremos.** Autocorrelação sofre acima de C5 e nos graves. Ter fallback (CREPE) planejado na arquitetura.
4. **Ruído ambiente.** Pitch detection sofre com ruído de fundo. Ter gate de ruído e orientar o usuário (ambiente silencioso, fones).
5. **Timbre e vibrato.** Vibrato largo confunde o algoritmo (lê como pitch instável). Tratar vibrato como feature, não como erro.
6. **Calibração por dispositivo.** Mic de notebook ≠ mic de celular ≠ interface de áudio. Calibrar sensibilidade no onboarding.

---

## 7. Modelo de dados (esboço)

```
users
  id, name, email (via EVA Hub auth), voice_type, created_at

vocal_range_history
  id, user_id, measured_at, low_note, high_note, connected_low, connected_high, context (aquecido/frio, etc.)

exercises
  id, slug, type, name_pt, description_pt, target_pattern (MIDI/notas), difficulty, phase, focus_area

practice_sessions
  id, user_id, started_at, duration_sec, exercises_completed (jsonb),
  performance_metrics (jsonb: cents_avg, notes_hit_pct, stability, events, register_time),
  eva_diagnosis (text), eva_next_steps (jsonb)

user_curriculum
  id, user_id, current_phase, goal_song, plan (jsonb), adapted_at

streaks
  user_id, current_streak, longest_streak, last_completed_date, total_sessions
```

---

## 8. Fluxos principais

### 8.1 Onboarding
1. Boas-vindas + permissão de microfone + calibração (sensibilidade, ambiente).
2. Teste de range guiado (grave → agudo), distinguindo conectado de bruto.
3. Objetivo: "por que você quer cantar?" + música-alvo opcional.
4. EVA gera o plano inicial (fases progressivas) com base no diagnóstico.

### 8.2 Sessão de treino diária
1. Aquecimento obrigatório (respiração + sirene) — sem pular.
2. Exercícios do dia com pitch display em tempo real.
3. DSP acumula features durante a sessão.
4. Ao final, EVA recebe os features e devolve diagnóstico + próximo passo.
5. Streak atualiza. Cooldown.

### 8.3 Análise + chat
- Usuário vê o diagnóstico da sessão e pode perguntar à EVA sobre qualquer ponto.
- EVA responde no contexto do histórico do usuário.

---

## 9. Design system / direção visual

**Referências fornecidas:** landing editorial P&B (estilo Smule "Alone, it's music"), app com gradiente/glassmorphism e blob de áudio orgânico (estilo "Voice Coach" roxo-rosa), e display de karaokê dark com notas caindo (estilo Rockstar).

**Direção recomendada — não copiar nenhuma das três, sintetizar:**
- **Dashboard/app:** base escura, profunda, com **gradientes vivos e orgânicos** (o blob de áudio como assinatura visual — ele *reage* à voz em tempo real, virando a identidade do produto). Glassmorphism com moderação, só onde agrega. Tipografia moderna e confiante.
- **Visualização de pitch:** o momento-herói. Piano roll / notas caindo com o traço da voz do usuário sobreposto ao alvo, cor mudando em tempo real. É o que as pessoas vão printar e compartilhar — capricha.
- **Landing:** editorial, um pouco mais clean/contrastada que o app, com um hero que mostra o produto *funcionando* (o blob reagindo, o pitch display ao vivo) em vez de só texto. Copy em PT, direta, sobre o problema real ("cansou de app que só te dá nota?").
- **Assinatura da marca:** o blob de áudio reativo. É orgânico, vivo, "IA que respira" — casa com o posicionamento de coach que entende, não máquina que julga.
- Acessibilidade: contraste, foco de teclado visível, reduced-motion respeitado.

Antes de codar UI, ler o skill de frontend-design e derivar um sistema de tokens (paleta 4-6 cores, par tipográfico display+corpo, layout) específico deste brief.

---

## 10. Monetização (pensando em vendável)

- **Freemium.** Grátis: teste de range, warm-up básico, N exercícios/dia (o Vanido faz 3/dia grátis e funciona). Retenção via hábito.
- **Assinatura (Pro):** currículo completo, análise EVA ilimitada, diagnóstico de registro, música-objetivo, chat ilimitado. Preço ancorado no mercado BR (concorrentes de vídeo-aula BR cobram ~R$29/mês parcelado; apps gringos €15-30/mês).
- **Gateway:** reaproveitar o que o grupo já usa (Abacate Pay, etc.).
- **Ângulo B2B futuro:** licenciar para escolas de canto / igrejas (gospel) como ferramenta de acompanhamento entre aulas.

---

## 11. Go-to-market Brasil

- **Fase 1:** autodidatas e amadores travados (pop/rock) — o público do fundador, canal orgânico.
- **Fase 2:** gospel e sertanejo (repertório + linguagem específicos, mercados enormes e sem tech de tempo real hoje).
- **Diferencial de comunicação:** "em português, entende sua voz, feedback na hora" contra apps gringos que só dão placar e cursos BR que são vídeo gravado.

---

## 12. Milestones de build (ordem sugerida)

**Fase 0 — Setup**
Repo, stack, integração com EVA Hub (auth + persona), esqueleto de dados, deploy pipeline.

**Fase 1 — Pipeline de áudio (fundação inegociável)**
Captura de mic, AudioWorklet, detecção de pitch em tempo real, canvas de visualização com feedback DURANTE a nota. Sem isso, nada existe.

**Fase 2 — Teste de range + onboarding**
Medição de range (conectado vs. bruto), calibração, baseline salvo.

**Fase 3 — Exercícios + rotina diária**
Biblioteca de exercícios, fases progressivas, pitch display nos exercícios.

**Fase 4 — Integração EVA (coaching)**
Contrato DSP → LLM, análise pós-sessão, diagnóstico + próximo passo, chat.

**Fase 5 — Tracker + histórico + polish**
Streak, histórico de range, evolução, refino de UX/design.

**Fase 6+ — Moat (V2)**
Diagnóstico de registro, música-objetivo, modo karaokê, repertório BR.

---

## 13. Critérios de qualidade (o fundador é exigente — não relaxar)

- Feedback de pitch **imperceptivelmente rápido** (durante a nota, não depois). Se latência for perceptível, não está pronto.
- EVA **nunca** dá elogio vazio nem feedback genérico. Sempre porquê + próximo passo.
- Detecção robusta em ambiente doméstico real (não só em estúdio silencioso).
- Nada de áudio saindo do navegador sem o usuário pedir. Privacidade por padrão.
- UI que a pessoa *quer* abrir todo dia. Retenção é o KPI que importa mais que qualquer feature.

---

*Documento vivo. Ajustar conforme o build revela restrições reais (especialmente latência de DSP e precisão de detecção de registro, os dois maiores riscos técnicos).*
