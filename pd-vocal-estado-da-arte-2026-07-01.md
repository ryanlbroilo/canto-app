# Continuação da Pesquisa Acadêmica & P&D — Estado da Arte em 01/07/2026
### Documento vivo nº 3 · Complementa `fundamentacao-academica-vocal.md` e `PRD-plataforma-vocal-eva.md`

> **O que é isto.** Uma varredura de P&D feita em 01/07/2026 (12 frentes técnicas, jurídicas e de mercado, com verificação adversarial das afirmações de maior risco) para responder a uma pergunta só: *hoje, com a tecnologia que existe, como este produto faz diferença real no Brasil e no mundo — e o que muda no plano web → Play Store/App Store?*
>
> **Como ler.** As duas conclusões mais importantes primeiro: (1) a arquitetura central dos seus dois docs — **DSP client-side mede, LLM interpreta, áudio nunca sai do navegador** — envelheceu *bem*: continua correta e agora está mais barata, mais viável e juridicamente mais forte do que quando foi escrita. (2) Mas três premissas precisam de correção cirúrgica: o **detector de pitch pode nascer neural** (não só autocorrelação); o **"diagnóstico de registro" precisa ser reposicionado** (é detecção de evento + estimativa de zona, não laudo clínico); e o **feedback em tempo real contínuo pode atrapalhar a transferência** se não for desmamado. Tudo abaixo se conecta a estas três coisas.

---

## 0. TL;DR executivo — o que mudou e o que fazer

| # | Achado de 2025-2026 | Impacto no produto |
|---|---|---|
| 1 | **F0 neural leve roda no navegador HOJE** (SwiftF0, MIT, WASM+ONNX, provado client-side; PESTO como evolução, 10 oitavas, causal ~5ms) | O MVP não precisa começar só com YIN/autocorrelação. Comece **híbrido**: DSP barato + modelo neural leve em ONNX. |
| 2 | **Separação de fonte em tempo real no browser continua inviável** (SOTA streaming ~5,5 dB vocais, só GPU); o bloqueio jurídico (licenciar masters) é *maior* que o técnico | **SIP segue fase 3**, agora com prova empírica. Não bloquear nada nisto. |
| 3 | **Conversão de voz ("cante como X") NÃO está resolvida** (SVCC 2025: MOS 3,7, estilo 70%) e o cerco jurídico ao deepfake vocal explodiu (ELVIS Act, NO FAKES, EU AI Act Art. 50, PL 2338) | Feature de "ouça-se com a técnica X" = experimento rotulado, opt-in, nunca core. **Proibir clonar terceiros por design.** |
| 4 | **Ninguém no mundo faz diagnóstico de registro ao vivo** — whitespace confirmado — MAS o rótulo fisiológico *não é mensurável* só do mic | Reposicionar o moat: **detecção de passaggio/quebra + estimativa de zona**, não "laudo peito/mix/cabeça". |
| 5 | **WebGPU ficou estável no Safari 26 (iOS, set/2025)** + iOS 26 transforma qualquer site em web app | O maior risco do caminho mobile/PWA **caiu**. PWA-first ficou mais forte. |
| 6 | **Feedback contínuo pode prejudicar a transferência** (guidance hypothesis) — mas a evidência é *contestada* | Projetar **fading** do feedback e medir "afinar sem a tela" como KPI. Não é bug do DSP, é design do currículo. |
| 7 | **Pix Automático operante** (jun/2025) + economia de loja virada (CADE/Apple BR: 0/15/25%; Google ~20%) | Cobrar por **checkout web próprio**; Pix como método primário. Destrava classes C/D/E (gospel/sertanejo). |
| 8 | **Ameaça latente real: Moises/Music AI** (brasileira, US$40M, 70M usuários, DSP de ponta) | O fosso não é DSP puro (eles ganham). É **pedagogia + dados de aprendizado + PT/BR + diagnóstico de registro**. |
| 9 | **Escada de financiamento não-dilutivo existe e é acessível a fundador solo em SP** | Aplicar **hoje** a créditos de IA (Anthropic ~US$25k, sem VC); **FAPESP PIPE Fase 1 não exige CNPJ** para submeter. |

**A frase-síntese:** os concorrentes têm distribuição e catálogo; você tem a chance de ter **o único coach que mede durante a nota, explica o porquê, estima o registro e fala português nativo com repertório brasileiro** — e de fazer isso com áudio que nunca sai do dispositivo, o que virou simultaneamente diferencial de produto, de marketing e de compliance.

---

## 1. Camada 1 (DSP) — o que mudou na detecção de pitch

O `PRD` (seção 3) manda "começar com autocorrelação/YIN/McLeod e evoluir para CREPE". **Isso está desatualizado em uma direção boa:** a safra 2025 de modelos neurais *ultraleves* já roda no navegador, então dá para nascer melhor.

**O novo estado da arte de F0 (2025):**
- **SwiftF0** (arXiv:2508.18440, ago/2025, MIT, ~96k params) — CNN 2D sobre STFT, **demo pública rodando 100% client-side em WebAssembly + ONNX** ("your audio stays private"). ~42× mais rápido que CREPE em CPU, e **+12 pontos de robustez a ruído** (91,8% vs 79% do CREPE/pYIN a 10 dB SNR). É o candidato mais seguro para o MVP: roda até sem WebGPU, cobre iPhone/Android modestos. *Ressalvas verificadas:* teto de ~2094 Hz (C7 — testar com soprano/gospel feminino) e resolução de ~33 cents/bin (**exige interpolação parabólica** do pico para entregar "cents finos", que é o que o produto vende).
- **PESTO** (TISMIR/ISMIR 2025, arXiv:2508.01488, 130k params) — melhor combinação precisão+faixa+latência: **97,7% RPA em canto, >10 oitavas, inferência causal streamable com lag reduzível a ~5ms**. É o Nº1 como *evolução plugável* para cobrir toda a tessitura (agudos de soprano/tenor, graves). *Correção da pesquisa:* já **tem export ONNX oficial** (`realtime.export_onnx`) — falta só um port pré-pronto para browser, que é trabalho de engenharia, não bloqueio.
- **FCPE / RMVPE** — fortes em robustez, mas nasceram para o pipeline RVC em **GPU/servidor**; não há prova de tempo real no browser. Reserve-os para **análise server-side offline** de alta fidelidade (relatório pós-sessão, geração de currículo pela EVA), fora do loop de 60fps.
- **DSP clássico (YIN/MPM)** continua útil, mas confirma-se que **erra oitava exatamente nos extremos** (agudos/falsete/graves) — que é onde o produto se diferencia. Libs maduras existem (`pitchy`, `pitchlite`, `pitchfinder`).

**Decisão de produto (atualiza PRD §3):**
> Rode **DSP (MPM/YIN em WASM) e um modelo neural leve (SwiftF0-ONNX) em paralelo**. Use a concordância entre os dois como sinal de confiança e para **vetar octave errors** — barato e robusto de imediato. Abstraia o detector atrás de uma interface única `{f0Hz, cents, confidence, voiced}` para trocar SwiftF0 → PESTO na v2 sem tocar no resto. Implemente interpolação parabólica para cents sub-bin desde o dia 1.

---

## 2. O moat, honesto — diagnóstico de registro reposicionado

Esta é a correção mais importante do documento, porque afeta o que você **promete**.

**A boa notícia (confirmada em múltiplas fontes):** *nenhum* app no mundo — Yousician, Singing Carrots, SingSharp, Vanido, Smule, SingSage — classifica registro **ao vivo, durante a nota**. O whitespace é real.

**A ressalva científica (também confirmada):** o padrão-ouro de registro (mecanismos laríngeos M0–M3 de Roubeau, Henrich & Castellengo, 2009) é **fisiológico** — medido por eletroglotografia (EGG), não por microfone. Inferir "isto é peito / isto é mix" só do áudio é **inferência estatística, não medição**. E os proxies acústicos diretos são fracos:
- **Closed/Open Quotient via inverse filtering** tem erro alto e degrada justamente em pitch alto (o passaggio) → **não** exibir "CQ estimado" como número.
- A relação **H1–H2 ↔ open quotient** é "não especialmente forte" (r≈0,5) → usar como *feature de classificador*, nunca como medida absoluta.
- Modelos que atingem 94–96% (AVRA 2025; voice2mode/HuBERT 2026) são **offline, gênero único, rótulos perceptuais (não EGG), e pesados demais para o browser**.

**O que É robusto, barato e roda a 60fps no AudioWorklet:** o **EVENTO de transição**. Na quebra chest→head você mede, sem modelo pesado:
1. **descontinuidade de F0** (salto) — já computado pela Camada 1;
2. **queda súbita de RMS/amplitude**;
3. **mudança de spectral tilt/centroid** (M2/falsete tem tilt mais íngreme);
4. **re-tuning de formante** — F2 migrando de H4 para H3 (Elbarougy 2019), reduzindo H4 e elevando H3.

**Decisão de produto (atualiza PRD §5.2 e §6, e Fundamentação §3b):**
> O moat do MVP é **"detecção de passaggio/quebra em tempo real + coaching do porquê pela EVA"** e **"estimativa de zona de registro"** — *não* "diagnóstico de mecanismo laríngeo". No copy da EVA, fale em zonas funcionais estimadas ("isso soou como cabeça/falsete"), com linguagem de estimativa. **Calibre por usuário**: colete um glissando ascendente/descendente no onboarding para localizar o passaggio individual (M1/M2 se sobrepõem ~1 oitava — o ponto é pessoal). Para a *classificação* de zona, use features handcrafted leves (tilt, H1–H2, centroide, singer's formant, F0 relativo ao range) num classificador pequeno exportado para ONNX/WASM — **nunca** rode HuBERT no cliente. O ativo defensável de longo prazo é um **dataset PT-BR proprietário** (pop/sertanejo/gospel, ambos os sexos), idealmente com subconjunto validado por professor/EGG.

---

## 3. A arquitetura viável hoje (o pipeline concreto)

A pesquisa de "ML de áudio no browser" convergiu num padrão canônico. Adote-o como especificação da Camada 1:

```
mic → getUserMedia
    → AudioWorklet (thread de áudio, quantum de 128 samples/~2,7ms)
         • tudo pré-alocado no construtor; NUNCA alocar dentro de process()
         • DSP barato aqui: RMS, F0 (MPM), cents, onset, spectral tilt
    → SharedArrayBuffer (ring buffer lock-free com Atomics)   ← exige headers COOP/COEP
    → Web Worker de inferência (ONNX Runtime Web)
         • modelo neural de F0 (SwiftF0) via WebGPU, fallback WASM+SIMD
         • warm-up (inferência dummy) no splash para evitar cold-start de shader (1–10s)
    → main thread: SÓ features numéricas → gráfico 60fps + feature-JSON para a EVA
```

**Pontos que, se ignorados, forçam retrabalho (todos verificados):**
- **`onnxruntime-web` (WebGPU + fallback WASM) é a camada de inferência padrão.** **WebNN não está pronto** (Candidate Recommendation jan/2026, sem Safari/Firefox) — não depender dele antes de ~2027.
- **`SharedArrayBuffer` exige cross-origin isolation** (`COOP: same-origin` + `COEP: require-corp`). Isso restringe embeds de terceiros — hospede áudio de repertório *same-origin*. Configure isso na infra (Vercel/Cloudflare/Nginx) **desde o início**.
- **iOS Safari:** `AudioContext` inicia **suspenso** → `resume()` só dentro de um gesto ("Começar treino"). **Não hardcode sample rate** — leia `audioContext.sampleRate` e adapte a matemática de F0 (o quirk 44,1 vs 48 kHz causa drift). AudioWorklet é nativo no Safari desde 2021 (o alerta "Safari usa ScriptProcessorNode" era do polyfill, não do WebKit atual).
- **Reuso web↔mobile:** escreva o **núcleo de DSP uma vez em Rust** → compila para **WASM+SIMD** (web, hoje) e para **lib nativa iOS/Android via UniFFI** (amanhã), alimentado por Oboe/AVAudioEngine. A migração mobile vira "trocar a camada de I/O", não reescrever a matemática. Existem templates prontos (`Tehnix/template-mobile-wasm`).

---

## 4. Ciência vocal — correções de design que mudam o currículo

Esta camada não estava nos dois docs (que são de *sinal/ML*), e é onde estão as correções pedagógicas mais valiosas.

**(a) Feedback contínuo pode prejudicar a transferência — projete FADING.** A literatura de aprendizado motor (guidance hypothesis) mostra que feedback aumentado em *toda* tentativa melhora a performance *durante* a prática mas pode degradar a **retenção e a transferência** (cantar sem a tela) por criar dependência. *Verificação importante:* a evidência é **contestada** — a meta-análise mais recente (2022, N=2228) não achou o efeito, e tarefas *complexas* (cantar afinado é complexa) podem tolerar/beneficiar-se de feedback frequente. **Conclusão calibrada:** trate o "modo desmame" como **hipótese prudente de design, não dogma**. Fase 1: VFB rico durante a nota. Fase 2: feedback intermitente/pós-nota (KR resumido). Fase 3: drills "de olhos fechados". E **meça a transferência** (acurácia em cents *com-tela* vs *sem-tela*) como o KPI de progresso real — isso combate a "armadilha do placar" e vira prova de eficácia própria.

**(b) Alerta de fadiga: NÃO diagnostique lesão pelo microfone.** Jitter/shimmer isolados são **pouco confiáveis** (confundidos por SPL, sexo, ambiente). **CPP/CPPS** é o marcador acústico mais robusto — mas nenhum marcador único autoriza um alerta clínico. O primeiro wearable de fadiga vocal (Northwestern, 2023) *abandonou o microfone* em favor de vibração da pele. **Decisão:** use CPP/CPPS + **tendências intra-sessão do próprio usuário** (mais quebras, F0 flat, queda de estabilidade) como sinal de *cansaço relativo*, enquadrado como **bem-estar/pedagogia** ("percebi mais instabilidade, que tal uma pausa?"), **nunca** como diagnóstico médico. Isso é também blindagem jurídica.

**(c) Amusia real é ~1,5%; "não sei cantar" é majoritariamente treinável.** Confirmado: amusia congênita ≈1,5% (16.625 adultos), mas ~85–90% dos amadores cantam afinado quando medidos em lab — a barreira dominante é **motora não-treinada + baixa autoeficácia**, não biologia. Feature acionável: um **teste rápido de percepção de pitch** no onboarding separa o raro caso de amusia (expectativa/abordagem diferente) do poor-pitch treinável, e vira a mensagem anti-"sou desafinado". "Canto é habilidade treinável" é copy **e** verdade científica.

**(d) SOVT (lip trill, canudo) — ótima prática, evidência formal fraca.** Mecanismo sólido (Titze), mas meta-análise de qualidade "muito baixa". **Não** alegar "cientificamente comprovado que protege a voz"; enquadrar como "boa prática com forte base fisiológica". Bônus técnico: durante SOVT o sinal é quase-periódico e estável — **ótimo como sonda de baseline diário** do DSP.

---

## 5. Camada 2 (EVA/LLM) — a arquitetura está certa; o risco é sycophancy

A pesquisa confirma que a arquitetura dos seus docs está **alinhada ao SOTA**, não contra ele. Mas três coisas viram requisito:

- **"Áudio nunca sai do navegador" continua correto por número, não só princípio.** Tokens de áudio custam ~10–20× o texto equivalente e são cobrados por minuto. Enviar só o **feature-JSON** reduz o payload a centenas de tokens e habilita modelos baratíssimos (Gemini Flash-Lite/GPT-Nano ~US$0,10/MTok, Claude Haiku ~US$0,25/MTok). Áudio-LLMs (Qwen3-Omni, GPT-Audio) ficaram ótimos, mas **não medem cents/registro melhor que o DSP dedicado** e custam muito mais.
- **Sycophancy é o risco Nº1 de um coach.** LLMs tendem a bajular/concordar (SycEval: 58% de comportamento sycophantico, 14,7% "regressivo" que leva a resposta errada; piora com contexto de conversa e RLHF). Um coach que valida um agudo estourado destrói a proposta de valor. **Mitigação:** tratar o feature-JSON como **ground truth inviolável** — regra dura no prompt ("se |cents| > 15, você DEVE apontar o desvio antes de qualquer elogio") — e manter um **mini-benchmark interno de sycophancy** (casos com erro objetivo conhecido) rodado a cada troca de modelo/prompt. *Ressalva:* nenhuma técnica elimina sycophancy; medir empiricamente, não presumir resolvido.
- **LLM interpreta mal série numérica crua.** Nunca passe arrays de F0 amostra a amostra; passe **resumo semântico por nota/frase** ("nota-alvo E4, média 12 cents flat, vibrato 5,2 Hz, quebra no onset"). A camada de *feature summarization* entre DSP e LLM é onde está o ouro.
- **Dois loops separados.** LOOP RÁPIDO (60fps, 100% DSP, sem LLM): barra de afinação, alerta de quebra. LOOP LENTO (por frase/exercício): feature-JSON → LLM de texto barato → coaching verbal + ajuste de currículo. **Nunca uma chamada de API por nota** (latência 200–500ms mata o "durante a nota"). Vender "IA que fala durante a nota" seria enganoso; venda "medição em tempo real + coach que explica logo em seguida".
- **On-device como v2:** WebLLM/WebGPU roda SLMs (0,5–3B) no próprio browser (Phi-3.5 mini ~71 tok/s), abrindo coaching local barato/privado — mas com cold-start no mobile. Comece com API de texto barata; trate WebLLM como otimização, não bloqueador.
- **Grounding pedagógico via RAG** sobre base curada de técnica vocal BR (registro, exercícios, repertório). **Não fine-tunar a EVA para imitar o aluno** (Student Data Paradox piora alucinação); manter o modelo de aluno como *estado estruturado* injetado no contexto.
- **O gap do survey UNICAMP:** ele vai até ~2022 e **não menciona LLMs**. O produto vive exatamente no gap — ASA robusto no browser **+** camada LLM pedagógica que o survey nem imaginava. Kumar et al. (fev/2026, arXiv:2602.06917) detectam erros de canto com DL mas param no diagnóstico; a EVA adiciona a *explicação* e o currículo. Monitore esse dataset professor-aluno.

---

## 6. Mercado — sim, há quem pague (Brasil e mundo)

**Infraestrutura pronta e favorável:** 84% da população online, **60% acessam só por smartphone (86% nas classes D/E)**, 68% já mantêm assinatura digital, faixa de gasto dominante R$51–200/mês. **Implicação dura para a Camada 1:** o DSP *precisa* rodar bem em **Chrome/Safari mobile de aparelho barato** — senão o TAM real (gospel/sertanejo popular) fica inacessível. Teste `getUserMedia` + AudioWorklet em Android de entrada **desde o MVP**.

**O grande destravamento comercial:** o **Pix Automático** (operante jun/2025, obrigatório out/2025) habilita cobrança recorrente **sem cartão** — abre as classes C/D/E. Gateways prontos: **AbacatePay** (R$0,80/Pix, sem mensalidade, integração rápida — bom p/ MVP), Asaas, Vindi. *Ressalva:* adoção de consumidor ainda modesta no 1º ano; é habilitador promissor, não disrupção consolidada. Use Pix como primário, cartão como fallback.

**Beachhead = Gospel.** 47,4 milhões de evangélicos (Censo 2022), ~140 mil templos, música gospel ~20% da receita fonográfica, ouvintes no Spotify +46% em 2024, e literatura (CEFAC/SciELO) medindo desvantagem vocal em cantores de igreja — público grande, motivado (canta semanalmente em público), com repertório identificável e **aquisição orgânica de CAC baixíssimo** via ministérios de louvor. **Segundo vetor = Sertanejo** (gênero nº1 em streaming há 7 anos) + pagode/MPB/pop — repertório-âncora que nenhum app global entrega.

**Preço:** **R$19–39/mês** (anual R$149–299), freemium com limite diário (modelo Vanido: 3 exercícios/dia grátis funciona). Narrativa: "menos que uma aula avulsa de R$50–150, ilimitado no mês". **Modele churn conservador (6–10%/mês no ano 1)** — retenção é o make-or-break; instrumente ganho perceptível rápido (progresso em cents nas primeiras sessões).

**Concorrência (verificada):**
- **Singing Carrots** — o mais próximo: web-first, privacy-first, lançou coach com LLM em nov/2025 e **publicou métricas reais** (1.382 usuários, +6,1 p.p. de pitch em 4 semanas, 2,95× mais prática com coach). Mas **EN-only e sem diagnóstico de registro**. É o benchmark direto a bater; espelhe as métricas deles como seus KPIs.
- **SingSage** — posicionamento quase **idêntico** ("coach IA grátis, no navegador, áudio nunca sai do dispositivo"). Sinal de que a janela de pioneirismo está fechando. Diferencie por PT/BR + profundidade da EVA + registro, **não** por "grátis no navegador".
- **Moises / Music AI** — **a ameaça latente máxima**: brasileira, US$40M Série A (jan/2025), 70M usuários, DSP/separação de ponta. Se entrarem em coaching vocal em PT, chegam com 100× seu capital. **Mitigação:** não competir em DSP puro; fossar em **pedagogia + dados de aprendizado proprietários + diagnóstico de registro + repertório BR**. Considerar integração/parceria em vez de guerra frontal.
- **Riyaz (Índia)** — o análogo geográfico: localização de repertório/idioma É fosso (domina canto clássico indiano), **mas monetização é o gargalo** (~17% de conversão). Lição: repertório BR é fosso, porém planeje monetização cedo, preço em BRL agressivo, tier grátis forte.

**Confirmação central:** o quadrilátero **durante-a-nota + explica-o-porquê + diagnóstico de registro + PT-nativo/repertório-BR** segue **100% desocupado** em 01/07/2026.

---

## 7. Jurídico — atualizado, e a favor da sua arquitetura

**Repertório / áudio de referência (ordem de viabilidade, atualizada):**
1. **MVP:** músicas originais / domínio público / Creative Commons + **backing tracks e melodia-guia PRÓPRIOS** (a "master" é sua). Zero licenciamento externo.
2. **Escala:** hits BR via **licença de COMPOSIÇÃO** direta com editoras (mecânica/print/sync) **+ registro de execução pública no ECAD** — replica o modelo Smule/Yousician (master re-gravada própria). *Atenção:* no Brasil são **dois custos** — ECAD cobre execução pública (devida **mesmo sem lucro**, STJ), mas **melodia-guia/MIDI/arranjo/cifra são reprodução/derivação** e exigem autorização do titular à parte. Não raspar Cifra Club/Genius.
3. **SIP com gravação comercial (o "sonho"):** exige separar vocal de master alheio → **licença de master + mecânica + sync + ECAD**. O fato de a separação rodar no navegador **não** elimina isso. É o topo da montanha, e o bloqueio é jurídico antes de técnico.
4. **Nunca:** ripar/derivar áudio de **Spotify** (Policy 15/mai/2025 proíbe expressamente treinar/ingerir conteúdo em IA/ML; Web API travado em fev/2026 — Premium obrigatório, 5 test users) ou **YouTube** (proíbe separar/isolar o componente de áudio; IFrame só como player intocado).

**Biometria de voz — aqui está o ativo:** sob LGPD, voz *usada para identificar unicamente* é dado sensível. **Mas extrair pitch/cents/jitter para coaching NÃO é biometria identificadora** — o gatilho é o *propósito de identificar*, não o som. Sob BIPA (EUA), "biometric identifier must identify" (Zellmer v. Meta, 9º Circ., 2024). **Portanto:** desenhe o DSP para **nunca gerar/armazenar um voiceprint reutilizável**; documente isso na política de privacidade e no registro de tratamento. **"Áudio nunca sai do navegador" é o maior escudo jurídico do produto** (minimiza LGPD, enfraquece BIPA, evita categoria de risco do EU AI Act) — transforme-o em pilar de marca. Colete consentimento específico e destacado para o microfone. E **mantenha a EVA como coach técnico-vocal** — não inferir estado emocional do aluno (EU AI Act Art. 5 proíbe reconhecimento de emoção em educação; multa até €35M/7%). Se algum dia gerar áudio sintético, **rotule como IA** (obrigatório na UE desde ago/2026; PL 2338/Selo de Conteúdo Sintético no BR).

---

## 8. Caminho web → Play Store / App Store

A estratégia dos docs ("web-first, PWA depois") está **certa e ficou mais forte** em 2025-2026:

- **PWA instalável primeiro.** `getUserMedia` + AudioWorklet funcionam em PWA no iOS (Home Screen) e **iOS 26 abre qualquer site como web app**; Safari 18.4 trouxe Screen Wake Lock (mantém a tela ligada durante o exercício, mãos livres). **Não** empacote cedo num WebView Capacitor "burro" no iOS — herda as mesmas limitações do WebKit **sem ganhar latência** e adiciona armadilhas de permissão de mic.
- **Latência:** Web Audio é *suficiente* para feedback de pitch (o gargalo é o **input** mic→análise, e o bloco de 128 samples é ótimo), mas **não iguala** as stacks nativas (Android Oboe/AAudio, iOS AVAudioEngine). Gatilho objetivo para ir ao nativo: **só** quando medições reais em aparelhos BR de entrada mostrarem latência de input inaceitável, **ou** quando push/retenção justificar. Aí troca-se **só a camada de captura**, reusando o core Rust.
- **Economia de loja virou (favorece cobrar fora da loja):** acordo **CADE/Apple no Brasil (dez/2025)** — 0% (só texto informando alternativa), 15% (link/botão externo), 25% (pagamento terceiro no app); **Google Play caiu para ~20%** pós-Epic. **Monetize por checkout WEB próprio** (Stripe/cartão/Pix) enquanto for web — evita 100% da comissão. Modele o pricing assumindo pagamento externo como base; IAP 30% só como fallback.
- **Enquadramento de loja:** posicione como **treino/educação/performance vocal, NÃO diagnóstico médico** (evita o trilho regulatório de app de saúde). "Áudio processado localmente, nunca sai do device" simplifica o Data Safety (Google) e o App Privacy (Apple), já que áudio bruto não é coletado.

---

## 9. Financiamento — a escada não-dilutiva para um fundador solo em SP

Ordem ótima de acessibilidade (preserva equity; grants primeiro aumentam valuation e reduzem diluição depois):

1. **HOJE, sem burocracia:** créditos de IA/cloud self-serve. **Anthropic Startup Program** (~US$25k em Claude, aplicação direta, ~2 semanas, **sem exigir VC**, Brasil elegível). **Microsoft for Startups Founders Hub** (US$25k Azure+OpenAI, self-serve, escala a US$150k). Como o DSP é client-side, o custo de nuvem do produto é **quase só LLM** — esses créditos o zeram na validação.
2. **Âncora — FAPESP PIPE Fase 1** (até **R$300k / 9 meses**, fluxo contínuo). **Ponto-chave verificado: NÃO exige empresa constituída para submeter** — abre-se o CNPJ só após a recomendação. Perfeito para fundador solo em SP. O DSP (F0 ~60fps, jitter/shimmer/vibrato, detecção de registro) é "inovação técnico-científica" verificável. **A UNICAMP (autores do survey base) fica em SP** — carta de parceria/aval acadêmico reforça o mérito. Fase 2 vai a ~R$1,5M/24 meses (com ~R$250k para desenvolvimento comercial = go-to-market web→mobile).
3. **Degrau 2 (pós-CNPJ) — FINEP Tecnova** (até ~R$702k em SP via FAPESP; nova rodada nacional R$360M, submissão até ago/2026). Não-dilutivo.
4. **Aceleração/impacto:** **BNDES Garagem** (módulo Criação aceita fundador **sem CNPJ**; enquadrar como negócio de impacto educacional — Enimpacto); **Google for Startups Accelerator Brazil / AI Academy** (10 semanas, foco IA, destrava tier de créditos AI-First até US$350k) como marco de 6–12 meses pós-MVP.
5. **Só depois — dilutivo:** Anjos do Brasil (vertical EdTech), Bossa Invest (tese IA+EdTech, cheques R$500k–R$5M). Posicionar como **EdTech de IA com DSP proprietário defensável**, não como musictech de catálogo.
- **Fora do plano de curto prazo:** Lei do Bem (exige Lucro Real + lucro fiscal — inviável pré-receita).

---

## 10. Roadmap revisado + "coisas absurdas que vale a pena aprender"

**Ajustes à ordem de build do PRD (§12):**
- **Fase 1 (pipeline de áudio):** já inclua o **híbrido DSP+SwiftF0-ONNX** e a infra **COOP/COEP** desde o setup. Escreva o núcleo em **Rust→WASM**.
- **Fase 2 (range/onboarding):** adicione o **teste de percepção de pitch** (amusia vs poor-pitch) e a **calibração de passaggio por glissando**.
- **Fase 4 (EVA):** formalize o **feature-JSON**, as **regras anti-sycophancy** e o **mini-benchmark** interno.
- **Todas as fases:** instrumente a **métrica de transferência** (com-tela vs sem-tela) como KPI, e o **modo fading** no currículo.
- **Fase 6 (moat):** o diagnóstico de registro entra como **detecção de evento + estimativa de zona** (não laudo), com dataset PT-BR sendo construído em paralelo.

**O que aprender (você disse que topa o absurdo — aqui está a lista, em ordem de alavancagem):**
1. **Web Audio API + AudioWorklet + ring buffer lock-free** (SharedArrayBuffer/Atomics) — é o coração do "durante a nota".
2. **Rust + wasm-bindgen + SIMD** — o núcleo de DSP escrito uma vez, roda web e mobile.
3. **ONNX Runtime Web (WebGPU/WASM)** — como rodar SwiftF0/PESTO no browser.
4. **DSP de voz:** STFT, autocorrelação/MPM, formantes (F1/F2), spectral tilt, CPP/CPPS — a base do pitch e do registro.
5. **Escrita de projeto FAPESP PIPE** — é uma habilidade, e vale R$300k não-diluídos.
6. **Prompt engineering com grounding + avaliação de sycophancy** — para a EVA não bajular.
7. **LGPD na prática (privacy-by-design) + licenciamento musical BR (ECAD/editoras)** — o suficiente para não pisar em mina.

**Os 3 riscos técnicos maiores (monitorar):** (1) latência real de F0 no mobile barato; (2) confiabilidade do diagnóstico de registro fora de estúdio; (3) robustez a ruído ambiente doméstico. Os dois primeiros já estavam nos docs; o terceiro é reforçado pela nova pesquisa.

---

## 11. Tradução para decisões de produto (estende Fundamentação §8)

| Achado 2025-2026 (verificado) | Decisão de produto |
|---|---|
| SwiftF0 roda F0 neural client-side no browser | MVP começa **híbrido DSP+neural**, não só autocorrelação |
| Separação real-time no browser inviável (~5,5 dB, GPU) + master exige licença | SIP segue **fase 3**; foco total na voz do próprio usuário |
| SVC não resolvido (MOS 3,7) + regime anti-deepfake duro | "Cante como X" = **proibido**; "ouça-se com técnica X" = experimento rotulado |
| Registro fisiológico não é mensurável só do mic | Vender **detecção de passaggio + zona estimada**, não laudo |
| WebGPU estável no Safari 26 + iOS 26 web apps | Caminho **PWA-first** de-riscado; nativo só por gatilho objetivo |
| Feedback contínuo pode prejudicar transferência (contestado) | **Fading** + medir "afinar sem a tela" como KPI |
| Sycophancy é risco Nº1 do coach | Feature-JSON como **ground truth**; regra dura + benchmark interno |
| Áudio ao LLM custa 10–20× o texto | Manter **só features numéricas** ao LLM; áudio no navegador |
| 60% dos brasileiros só têm smartphone | DSP tem que rodar em **mobile barato** desde o MVP |
| Pix Automático + economia de loja virada | Cobrar por **checkout web**; Pix primário; classes C/D/E acessíveis |
| Gospel: 47,4M evangélicos, CAC orgânico baixo | **Gospel como beachhead**; sertanejo/pagode em seguida |
| Moises/Music AI = ameaça de DSP + capital | Fossar em **pedagogia + dados + PT/BR**, não em DSP puro |
| "Áudio nunca sai do navegador" | Pilar de **compliance E marketing** (LGPD/BIPA/AI Act) |
| PIPE Fase 1 não exige CNPJ; créditos de IA sem VC | Escada **não-dilutiva** começa hoje; UNICAMP em SP como aliada |

---

## 12. Bibliografia nova (2024-2026) — para adicionar ao acervo

**Detecção de pitch (substituem a escolha de algoritmo do PRD):**
- Nieradzik, L. (2025). *SwiftF0: Fast and Accurate Monophonic Pitch Detection.* arXiv:2508.18440. (MIT; demo WASM+ONNX client-side.)
- Riou, A. et al. (2025). *PESTO: Real-Time Pitch Estimation with Self-supervised Transposition-equivariant Objective.* TISMIR / arXiv:2508.01488.
- *FCPE: A Fast Context-based Pitch Estimation Model* (2025). arXiv:2509.15140. · *Improving Neural Pitch Estimation with SWIPE Kernels* (2025). arXiv:2507.11233.

**Separação de fonte (contexto do SIP):**
- Mel-Band / BS-RoFormer (2023-2024). arXiv:2310.01809, 2409.04702. · *RT-STT: Real-Time Low-latency MSS* (2025). arXiv:2511.13146. · `sevagh/free-music-demixer` (Demucs+WASM, client-side offline).

**Conversão / síntese de voz cantada:**
- *Singing Voice Conversion Challenge 2025 — Extensive Analysis* (2025). arXiv:2509.15629. · *Serenade: Singing Style Conversion via Audio Infilling* (2025). arXiv:2503.12388. · Seed-VC (2024). arXiv:2411.09943 (licença GPL-3.0 — validar).

**Diagnóstico de registro (o moat):**
- Roubeau, Henrich & Castellengo (2009). *Laryngeal Vibratory Mechanisms.* J. Voice 23(4). · Kim & Botha (2025). *ML Approaches to Vocal Register Classification (AVRA).* arXiv:2505.11378. · *voice2mode: Phonation Mode Classification using SSL* (2026). arXiv:2602.13928. · Elbarougy (2019). *Acoustic Analysis for Chest-to-Head Register Transition.* IJCA.

**Browser ML / arquitetura:**
- WebKit blog (2025). *Features in Safari 26.0* (WebGPU estável). · *Audio Worklet Design Pattern* (Chrome for Developers). · ONNX Runtime Web docs · W3C WebNN — Candidate Recommendation (2026).

**Ciência vocal / pedagogia (2020-2026):**
- Lã & Fiuza (2022). *Real-time VFB in Singing Pedagogy.* Applied Sciences 12(21). · Winstein et al. (1994) + meta-análise 2022 (guidance hypothesis, contestada). · Kaneko et al. (2021). *SOVTEs Meta-analysis.* J. Voice (evidência muito baixa). · Peretz & Vuvan (2017) + Pfordresher & Demorest (2021, acurácia de canto). · Northwestern (2023). *Wearable for vocal fatigue* (vibração, não mic).

**LLM como coach:**
- dos Santos & Masiero (2026). *A Survey on 30+ Years of ASA and SIP.* arXiv:2601.12153 (cobre só até ~2022; sem LLMs). · Kumar et al. (2026). *Automatic Detection of Singing Mistakes.* arXiv:2602.06917. · SycEval / ELEPHANT (2025) — benchmarks de sycophancy. · MIT Media Lab (2025). *Making Sense of Sensors* (LLM + séries temporais). · WebLLM (2024). arXiv:2412.15803.

**Jurídico / mercado / financiamento (fontes primárias):**
- Spotify Developer Policy (15/mai/2025) · YouTube API Developer Policies · ECAD Serviços Digitais + STJ REsp 2.098.063 · Zellmer v. Meta (9º Circ., 2024, BIPA) · EU AI Act Art. 5 e Art. 50 · PL 2338/2023 · Censo 2022 (IBGE) · Pix Automático (Bacen) · Acordo CADE/Apple (dez/2025) · FAPESP PIPE (fapesp.br/pipe) · Anthropic Startup Program.

---

*Documento vivo nº 3. Próximas atualizações prioritárias: (1) benchmark real de latência de F0 em Android BR de entrada; (2) protótipo do detector de passaggio (evento) e sua acurácia fora de estúdio; (3) validação do teto de C7 do SwiftF0 com vozes femininas/gospel; (4) resultado da aplicação aos créditos de IA e ao PIPE. Corrigir aqui conforme o build revelar as restrições reais.*
