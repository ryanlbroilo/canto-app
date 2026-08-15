# Decisão de arquitetura mobile — Capacitor vs. React Native vs. Nativo

> Documento de decisão para o Canto (treino vocal com feedback de afinação em tempo real).
> Base: análise adversarial com 4 agentes de evidência, 3 agentes de debate (um defendendo cada opção) e 1 agente de veredito.
> Data: 2026-07-09.

---

## 1. Recomendação (TL;DR)

**Fique no Capacitor para o go-live. NÃO faça um rewrite big-bang para React Native nem para nativo agora.** A decisão certa não é "trocar de framework" — é uma decisão de **subsistema de áudio**. Publique o app Capacitor que já está pronto, rode um *spike* em Android barato de verdade para resolver o cross-origin isolation e medir o comportamento real e, **se e somente se** o motor dentro da WebView se mostrar insuficiente, conserte de forma cirúrgica com um **plugin nativo de áudio** (Capacitor plugin) que chama o seu núcleo Rust existente numa thread real-time (Oboe/AVAudioEngine) — preservando toda a UI já publicada, as ~870 linhas de IP de análise vocal em TypeScript e o código único em TS.

**Confiança do veredito: alta.**

---

## 2. O contexto e a provocação dos amigos

Os amigos desenvolvedores do fundador afirmaram: **"Capacitor é uma burrada em escala — bugs, problemas em produção, UX não fluida."**

**Onde eles estão certos (honestamente):** a crítica é *direcionalmente correta* sobre **áudio em tempo real dentro de uma WebView**. A análise confirmou, olhando o próprio código-fonte, um problema real:

- Todo o motor premium (Rust→WASM + ONNX neural-F0) está **condicionado** a `crossOriginIsolated && SharedArrayBuffer` (`PitchEngine.ts:174`).
- No WKWebView do Capacitor, servido de `capacitor://localhost` sem os headers COOP/COEP, `crossOriginIsolated` é **falso por padrão** (issue upstream não resolvida [#6182](https://github.com/ionic-team/capacitor/issues/6182)), e o Android WebView **efetivamente não consegue** ser cross-origin-isolated.
- Quando o *gate* falha, o `PitchEngine` cai **silenciosamente** no `detectPitchMPM` em TypeScript puro, na main thread (`startAnalyser`). Ou seja: **num build Capacitor cru, o núcleo Rust e o ONNX podem simplesmente não rodar** — o comentário em `capacitor.config.ts` de que o motor "roda na WebView exatamente como na web" é otimista demais.
- Somam-se bugs documentados de ciclo de vida: iOS WKWebView suspende o `AudioContext` ao ir para background (WebKit 237878), *crackle* na rotação de tela, e AEC/AGC do `getUserMedia` que o iOS pode se recusar a desligar (WebKit 179411) — o que **corrompe o feedback de afinação** de um app de canto.

**Onde a crítica é incompleta para ESTE projeto:** o remédio que ela implica ("reescreve nativo") **colide de frente com as restrições vinculantes do fundador**: solo, **sem Mac**, precisa lançar agora, e o requisito de latência sub-30ms **ainda não foi provado como necessidade do produto**. Além disso, a crítica trata o problema como se fosse do framework inteiro, quando na verdade:

- **Áudio e UI são separáveis.** A crítica morde forte no caminho de áudio real-time e quase nada numa UI de trilha gamificada + chat da EVA — que apps híbridos entregam bem.
- A fraqueza específica e correta que eles apontam **pode ser removida com um plugin nativo de áudio, sem abandonar o app já publicado**.
- **"Em escala"** é um problema que se *conquista o direito de ter*. O risco dominante de um fundador solo no go-live é **não lançar / não achar PMF**, não "escala".

**Ressalva importante de evidência:** o agente de evidência que deveria montar o caso técnico *pró-Capacitor em escala* (`evidence:capacitor-at-scale`) **falhou e está ausente** da análise. Portanto, o caso técnico a favor do Capacitor está **sub-evidenciado** nesta análise — motivo a mais para validá-lo com o *spike* rápido (Seção 6) antes de confiar nele cegamente.

---

## 3. As três opções, lado a lado

| Critério | **Capacitor (WebView)** | **React Native** | **Nativo (Swift + Kotlin)** |
|---|---|---|---|
| **Qualidade de UX** | Boa para UI/trilha/EVA; risco de jank do compositor WebView sob carga térmica em Android barato | Uma UI JS só, com threads nativas de áudio/render; fluidez melhor que WebView | Melhor fluidez possível, mas construída **duas vezes** (SwiftUI + Compose) |
| **Latência de áudio** | AudioWorklet em thread dedicada, mas *scheduling* menos determinístico; **sem benchmark round-trip publicado** neste stack | Thread nativa (Oboe/AAudio + AVAudioEngine) via `react-native-audio-api`; **sem** o gate do WebView | Menor latência: iOS Core Audio ~1,3–1,5 ms/buffer (64 frames/48 kHz), single-digit-ms round trip; Android Oboe ~20 ms |
| **Núcleo Rust/DSP** | Reutilizado **como está** (WASM), *desde que* o cross-origin isolation seja resolvido; senão degrada para TS-MPM | Recompila ~1:1 para lib nativa (`.a`/`.so`) via uniffi/FFI; descarta só ~4 linhas de glue wasm-bindgen | Recompila ~1:1 para nativo; ~95% de `dsp/src/lib.rs` intacto; chamado direto do callback real-time via C FFI |
| **Modelo ONNX (F0)** | `onnxruntime-web`; acoplado ao MESMO gate do WASM (vivem/morrem juntos no device) | `onnxruntime-react-native` / `react-native-nitro-onnxruntime`, mesmo `model.onnx`, com CoreML/NNAPI/XNNPACK | `onnxruntime-mobile` com CoreML (iOS) / NNAPI (Android); risco de fallback silencioso para CPU se houver op não suportada |
| **Visualizador 3D** | three.js/R3F reutilizado; precisa mover para OffscreenCanvas + Worker para não travar a UI de afinação | `react-three-fiber` roda "out-of-the-box" em `react-native-wgpu` (**experimental**); Skia estável p/ 2D. Caminho estável (expo-gl) tem *version mismatch* que quebra em devices reais | Metal/SceneKit (iOS) + OpenGL/Vulkan (Android), **reescrito duas vezes** |
| **Esforço/tempo (fundador solo)** | **Semanas** — a paridade já existe (app S8 já publicado); só falta o *spike* de isolation (3–7 dias) | **2–4 meses** de rewrite greenfield da camada de captura/transporte/worker/3D | **6–10 meses**, tudo acima do núcleo Rust construído em dobro |
| **Problema do "sem Mac"** | **Corta A FAVOR:** o motor de áudio fica em código web debugável em qualquer lugar; CI faz build/assina/publica iOS sem Mac | iOS ainda exige driver de áudio nativo + audio-session, **não step-debugável remotamente**; + aposta em 3 deps v0.x | **Pior caso:** o caminho de áudio real-time (xruns, buffers, interrupções AVAudioSession) é *exatamente* o que a CI na nuvem não step-debuga — e é a única razão de ir nativo |

---

## 4. O que sobrevive vs. o que se reescreve

Fiel ao veredito e à evidência de portabilidade do núcleo Rust (`evidence:rust-core-portability`):

### Sobrevive (quase tudo — e este é o ponto central)
- **O app web inteiro já publicado**, 100% inalterado: UI React, trilha gamificada, integração EVA, auth de produção + LGPD, ofensivas/streaks, canal PWA.
- **Todas as ~870 linhas de IP de análise vocal em TypeScript** permanecem como JS na WebView: `register.ts` (169), `perception.ts` (316), `vibrato.ts` (55), `mpm.ts` (97), `resample.ts` (69), `voiceType.ts` (73), etc. São pós-processamento por frame (~60–344 Hz), **não** o hot loop de 128 amostras — JS dá conta.
- **A matemática DSP em Rust** (`dsp/src/lib.rs`): ~95% inalterado, **recompilado** para nativo, não reescrito. `Cargo.toml` já declara `crate-type = ["cdylib","rlib"]`, então a lib nativa é *um target de distância*. As funções `fft()`, `spectral_features()`, `h1_minus_h2()`, `reverse_bits()` não têm nenhum atributo wasm-bindgen e são 100% portáveis.
- **`model.onnx`** — inalterado em todas as opções; só muda o *binding* de runtime.
- **Um único codebase TypeScript.**

### Reescreve / é novo (apenas as partes limitadas, e só quando um estágio exigir)
- **Núcleo Rust — troca de FFI (barato, 1–3 dias):** as ~4 linhas específicas de browser (`use wasm_bindgen::prelude::*` + 4 atributos `#[wasm_bindgen]`) são trocadas por glue **uniffi/cbindgen** (C ABI). A superfície pública `Analyzer::new(sample_rate, size)` + `analyze(&[f32]) -> Vec<f32>` é diretamente suportada pelo uniffi.
- **Estágio-1 — shim de COI:** handler nativo pequeno por plataforma — `WKURLSchemeHandler` injetando COOP/COEP no iOS; `WebViewAssetLoader` ou servidor HTTP local no Android. Nenhuma lógica de app tocada.
- **Estágio-2 — plugin nativo de áudio (só se a WebView for inadequada):** callback Oboe/AAudio (Android) + render callback AVAudioEngine (iOS), cada um chamando o núcleo Rust via C FFI (`process()` real-time-safe), com ONNX via `onnxruntime-mobile` (NNAPI/CoreML). **Substitui exatamente o glue que sempre foi descartável:** `capture-processor.js` (AudioWorklet), o ring buffer `SharedArrayBuffer` (`ringbuffer.ts`), e a fiação `dsp-worker`/`swiftf0-worker` — **~600 linhas de transporte, não de IP.**

### Bibliotecas concretas citadas pelos agentes
- **Núcleo Rust → nativo:** `uniffi-rs` (Mozilla, uso em produção no Firefox), `cargo-ndk`, `cargo-lipo`/xcframework, `cargo swift`. Para RN especificamente: **`uniffi-bindgen-react-native`** (Mozilla+Filament, "early release").
- **Áudio nativo:** **Oboe/AAudio** (Android, wrap sobre AAudio em API 27+, fallback OpenSL ES) e **AVAudioEngine / RemoteIO AURenderCallback** (iOS).
- **Áudio em RN:** **`react-native-audio-api`** (Software Mansion, v0.13.1, usado em produção no Odisei Play, <10 ms). **Cuidado:** o path de AudioWorklet em JS tem orçamento duro de ~2,9 ms/128 amostras — DSP pesado vai para Rust/nativo, não para o worklet JS.
- **ONNX:** `onnxruntime-web` (atual) → `onnxruntime-react-native` / **`react-native-nitro-onnxruntime`** (v0.1.1, ~4 estrelas) / `onnxruntime-mobile`.
- **3D em RN:** **`react-native-wgpu`** (WebGPU via Dawn, experimental) + TSL; `react-native-skia` (estável) para o 2D (waveform/pitch-trail).

> **Insight estrutural do veredito:** o path nativo-plugin-sob-Capacitor **é** a arquitetura "thread nativa de áudio + JS como controle" que o campo RN defende — realizada **sem** o rewrite de framework, **sem** a aposta em graphics/onnx v0.x, **sem** reconstruir a UI e **sem** re-portar as ~870 linhas de IP TS para Swift+Kotlin. Ele domina o RN nos eixos de UI/3D/shell e empata no áudio, com risco total menor.

---

## 5. O veredito, com critérios de decisão

Reproduzidos fielmente do agente de veredito — "se X for verdade, escolha Y":

1. **Se** um *spike* em 2–3 aparelhos Android sub-US$150 reais (Infinix / Samsung série A) mostrar que o path worklet+WASM+ONNX de fato **executa** dentro da WebView depois de injetar o isolation COOP/COEP, **E** latência/glitches ficarem aceitáveis em 5 min de canto sustentado + 3D com *thermal throttling* →
   **então:** publique o app Capacitor atual como v1 nas duas lojas; adie **todo** trabalho de áudio nativo. A crítica dos amigos é não-vinculante por ora.

2. **Se** o cross-origin isolation não puder ser tornado confiável nas WebViews, **OU** houver glitches/underruns sob carga térmica no Android barato, **OU** a telemetria mostrar uma fração grande de usuários reais silenciosamente presa no fallback TS-MPM →
   **então:** mantenha a UI Capacitor, mas mova **apenas** o áudio real-time para um plugin nativo (Rust-nativo via C FFI + Oboe/AAudio no Android, AVAudioEngine no iOS + `onnxruntime-mobile`). **Não** troque de framework.

3. **Se** mesmo COM o plugin nativo de áudio, o feedback visual (3D/pitch-trail) na WebView ainda não conseguir "soar colado" à voz porque o **próprio compositor da WebView** injeta lag/jank perceptível sob carga →
   **então:** uma **única** migração para React Native (thread nativa de áudio + render em thread nativa, uma UI JS que porta do app web publicado) — ainda evitando o imposto 2x do full native.

4. **Se** surgir um requisito de produto **medido e provado** de latência monitorada sub-30ms ou controle de audio-session de primeira classe, **E** o fundador for adquirir um Mac (real ou alugado) para debug interativo de áudio, **E** o Canto tiver tração para financiar 6–10 meses →
   **então:** só então o full native (Swift+Kotlin) é defensável — e só depois de migrar antes as ~870 linhas de IP TS para dentro do crate Rust, para que a superfície write-once real-time seja a maioria, não ~10%.

5. **Se** o fundador **não** for obter um Mac (nem alugado) sob nenhuma circunstância →
   **então:** fique no Capacitor e use o path do plugin nativo de áudio; tanto o full-native quanto a metade iOS de áudio do RN ficam perigosos de debugar às cegas, e o plugin é uma superfície iOS-nativa muito menor que um app inteiro.

---

## 6. Plano faseado pro fundador solo

O veredito é explícito: **incremental vence big-bang em todos os degraus** — todo estágio publica ou reduz risco, nenhum estágio descarta o app já publicado, e você nunca fica sem um build publicável nas lojas.

- **Estágio 0 — Instrumente primeiro (esta semana, horas).** `PitchEngine.ts:188` já loga o backend (worklet vs analyser) + `crossOriginIsolated` + `sampleRate`. Ligue isso à sua analytics e adicione uma estimativa grosseira de round-trip mic→feature, reportada de aparelhos reais. Isso transforma **todo o debate de especulação em dado**: você vai *saber* que fração dos usuários reais está silenciosamente no fallback TS-MPM. Movimento mais barato e de maior alavancagem.

- **Estágio 1 — O *spike* da realidade em Android barato (1–2 semanas). ESTE É O PORTÃO DE DECISÃO.** Compre 2–3 aparelhos sub-US$150 genuínos (Infinix / Samsung série A = o hardware real do beachhead gospel, **não** o seu Pixel/iPhone). Resolva o cross-origin isolation nas duas WebViews (`WKURLSchemeHandler` injetando COOP/COEP no iOS; `WebViewAssetLoader` ou servidor HTTP local no Android) para que o path premium worklet+WASM+ONNX execute. Meça: o motor completo roda? latência e jitter round-trip? glitches em 5 min de canto sustentado + 3D + throttle térmico? Valide também os bugs conhecidos de WebView: suspensão do `AudioContext` em background (WebKit 237878 — adicione *resume* explícito no foreground) e se o AGC-off do `getUserMedia` (já setado em `PitchEngine.ts:166`) **de fato** teve efeito no device. **Rode num aparelho barato de verdade antes de confiar em qualquer escolha.**

- **Estágio 2 — Ramifique conforme o spike (condicional).**
  - Se o motor WebView roda e sente bem no Android barato → **publique como v1 nas duas lojas agora**; você entregou o diferenciador num codebase só.
  - Se o COI funciona mas o áudio está marginal/glitchy sob carga → construa o **plugin nativo de áudio** (Rust-nativo + Oboe/AVAudioEngine + `onnxruntime-mobile`), mantendo toda a UI WebView. Orce ~3–6 semanas; a metade iOS é a parte difícil, então **alugue um Mac mini / MacinCloud especificamente para o debug de áudio (~US$20–60/mês)** — o único lugar onde a CI remota é substituto ruim.

- **Estágio 3 — Seguro barato pro futuro (oportunista, não-bloqueante).** Independentemente do Estágio 2, migre **incrementalmente** a IP vocal TS (register/perception/vibrato) **para dentro do crate Rust**. Isso cresce a superfície write-once real-time de ~10% para maioria, barateia qualquer passo nativo futuro e melhora o próprio motor web. Faça uma função por vez entre features, nunca como projeto bloqueante.

- **Estágio 4 — Só com requisito provado (horizonte >12 meses).** Se o dado (não a intuição) mostrar que sub-30ms monitorado ou controle de audio-session é requisito *sentido* central que WebView+plugin ainda não atende, **E** houver tração pra financiar, **E** um Mac em mãos, avalie **uma única** migração para React Native. Full native (Swift+Kotlin) fica como último recurso — sua duplicação 2x + o debug sem-Mac do seu próprio diferenciador é o pior encaixe para um fundador solo.

**Sobre a realidade de "sem Mac" e cloud-build:** você **pode** buildar, assinar e publicar iOS sem Mac — problema resolvido (Xcode Cloud dá 25 h grátis/mês com a conta Apple de US$99/ano; GitHub Actions macOS runners a ~US$0,062/min pós-corte de jan/2026; Codemagic; Expo EAS). O que a CI na nuvem **não** dá é o *loop interativo de step-debug do caminho de áudio real-time* (xruns, tuning de buffer, interrupções AVAudioSession) — e é justamente aí que os bugs de áudio nativo vivem. Por isso o híbrido (plugin nativo de áudio sob Capacitor) minimiza a superfície iOS-nativa que precisa de Mac, e o aluguel pontual de Mac só entra no Estágio 2 se o plugin for acionado.

---

## 7. Riscos e a razão mais forte de estar errado

**A razão mais forte do veredito estar errado (nas palavras do próprio agente de veredito):**

> A recomendação aposta que o **áudio** pode ser isolado atrás de um plugin nativo enquanto a **UI** fica na WebView. Se o feedback de canto em tempo real só "soa colado" à voz quando **tanto o áudio QUANTO a renderização** rodam em threads nativas — isto é, se o próprio compositor da WebView injeta lag/jank perceptível no pitch-trail e no 3D sob carga térmica em Android sub-US$150 — então a **UI WebView é a restrição vinculante**, o híbrido plugin-sob-Capacitor vira o **pior dos dois mundos** (dor de integração nativa + jank de WebView), e uma migração limpa e única para React Native (que o defensor de RN argumenta, e que é genuinamente ~metade do custo do full native com uma UI só) teria sido a melhor jogada, sequenciada mais cedo. O *spike* do Estágio 1 e a telemetria do Estágio 0 são desenhados para pegar exatamente isso antes de sobre-investir — mas se esse for o mundo verdadeiro, o veredito subavaliou o RN.

**Risco secundário:** o ecossistema RN de 2026 pode amadurecer mais rápido do que o veredito credita, decaindo o risco de dependência v0.x no qual ele se apoia bastante, e deslocando a matemática do RN para mais favorável do que foi pontuado.

**Ressalva honesta de evidência (crítica):** o agente de evidência `evidence:capacitor-at-scale` **falhou e não completou**. Portanto, **o caso técnico pró-Capacitor está sub-evidenciado** nesta análise — a defesa do Capacitor se apoia mais em reuso/custo e em achar as falhas dos outros do que em evidência positiva de que ele aguenta o tranco em escala. **Isso deve ser validado com o spike do Estágio 1 antes de decidir contra as alternativas.** Não trate a recomendação como confirmada até o motor completo ter rodado num Android barato real.

**Outros riscos herdados dos agentes:**
- **Gate silencioso (o dealbreaker do Capacitor):** se o workaround de header-injection não funcionar num Android médio real, ou se o áudio na WebView der glitch sob throttling e a qualidade do fallback TS-MPM for inadequada, o Capacitor perde o exato diferenciador que foi escolhido para preservar.
- **Android barato é o risco real, não o iOS:** os relatos de glitch/underrun concentram-se em Android budget — o hardware do beachhead. Testar só no Pixel/iPhone engana.
- **Fallback de EP no ONNX nativo:** CoreML/NNAPI podem cair silenciosamente para CPU (às vezes mais lento que o CPU otimizado do ORT) se o modelo F0 tiver um op não suportado — exige verificação por modelo.
- **Fronteira C-FFI:** as garantias do Rust somem no C ABI; um bug no contrato `ptr/frames` do callback é crash/UB instantâneo, sem borrow-checker, e precisa ser alloc- e lock-free.
- **Deps v0.x do RN:** `uniffi-bindgen-react-native` ("early release"), `react-native-nitro-onnxruntime` (v0.1.1), `react-native-wgpu` (experimental) — ser o early bug-reporter de três libs jovens ao mesmo tempo, no path que É o produto.
- **Latência é hipótese, não fato:** não há benchmark round-trip mic→DSP→F0→UI publicado para nenhum dos stacks neste modelo exato. Valide sub-30ms end-to-end num Android sub-US$150 com o seu F0 real **antes** de comprometer meses.

---

## 8. Referências

Agregadas das citações/`source_urls` dos agentes de evidência e debate.

### Áudio nativo e latência
- Low latency audio — Oboe | Android Developers — https://developer.android.com/games/sdk/oboe/low-latency-audio
- google/oboe (GitHub) — https://github.com/google/oboe
- Android NDK — Audio guides — https://developer.android.com/ndk/guides/audio
- AVAudioEngine & render callback — Apple Developer Forums — https://developer.apple.com/forums/thread/22530
- Low latency host code for AU v3 (RemoteIO) — Apple Developer Forums — https://developer.apple.com/forums/thread/65675
- Round Trip Audio Latency Meter for iOS — onyx3 — https://onyx3.com/LatencyMeter/

### Núcleo Rust → nativo (uniffi / FFI)
- mozilla/uniffi-rs (GitHub) — https://github.com/mozilla/uniffi-rs
- Introducing UniFFI for React Native — Mozilla Hacks — https://hacks.mozilla.org/2024/12/introducing-uniffi-for-react-native-rust-powered-turbo-modules/
- jhugman/uniffi-bindgen-react-native (GitHub) — https://github.com/jhugman/uniffi-bindgen-react-native
- Android Oboe with Rust and React Native — Suyash Singh — https://suyashsingh.in/blog/android-oboe-with-rust-and-react-native
- Multiplatform with Rust on iOS — mobilesystemdesign — https://mobilesystemdesign.substack.com/p/multiplatform-with-rust-on-ios-2c4
- Building an iOS App with Rust Using UniFFI (DEV) — https://dev.to/almaju/building-an-ios-app-with-rust-using-uniffi-200a
- Bridge Android & Rust using uniffi-bindgen (Medium) — https://medium.com/@alfauzansepta/bridge-android-rust-using-uniffi-ee2ade3b7abe
- Diamond in the Rust: sharing code across mobile — LY Corp techblog — https://techblog.lycorp.co.jp/en/20241002a
- Building Audio Apps with Rust — ADC 2024 — https://conference.audio.dev/session/2024/building-audio-apps-with-rust-an-overview-of-tools-and-techniques/
- lib.rs — multimedia/audio — https://lib.rs/multimedia/audio

### React Native — áudio, ONNX, gráficos
- react-native-audio-api (GitHub) — https://github.com/software-mansion/react-native-audio-api
- react-native-audio-api (docs) — https://docs.swmansion.com/react-native-audio-api/
- react-native-audio-api (npm) — https://www.npmjs.com/package/react-native-audio-api
- react-native-audio-api — Worklets introduction — https://docs.swmansion.com/react-native-audio-api/docs/worklets/worklets-introduction/
- From files to buffers: real-time audio pipelines in RN — Callstack — https://www.callstack.com/blog/from-files-to-buffers-building-real-time-audio-pipelines-in-react-native
- react-native-nitro-onnxruntime (GitHub) — https://github.com/ronickg/react-native-nitro-onnxruntime
- WebGPU + Skia web graphics — Shopify Engineering — https://shopify.engineering/webgpu-skia-web-graphics
- react-native-skia — https://shopify.github.io/react-native-skia/
- react-three-fiber — discussion #3406 — https://github.com/pmndrs/react-three-fiber/discussions/3406
- react-three-fiber — installation — https://r3f.docs.pmnd.rs/getting-started/installation
- react-three-fiber — issue #3354 (expo-gl version mismatch) — https://github.com/pmndrs/react-three-fiber/issues/3354
- Áudio-visualizer com RN Audio API + Skia (YouTube) — https://www.youtube.com/watch?v=gmW8KeMKXok

### ONNX Runtime (mobile / RN)
- ONNX Runtime — React Native getting started — https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html
- onnxruntime-react-native (npm) — https://www.npmjs.com/package/onnxruntime-react-native
- ONNX Runtime — NNAPI Execution Provider — https://onnxruntime.ai/docs/execution-providers/NNAPI-ExecutionProvider.html
- onnxruntime — issue #22346 (ops não suportadas forçam fallback CPU) — https://github.com/microsoft/onnxruntime/issues/22346
- ONNX Runtime — Inference — https://onnxruntime.ai/inference
- StreamVC (arXiv) — inferência de áudio on-device em tempo real — https://arxiv.org/pdf/2401.03078
- On-device AI 2026: sub-20ms — Aleph Zero Labs — https://www.alephzerolabs.com/blog/on-device-ai-2026-sub-20ms/

### WebView / cross-origin isolation (a falha real do Capacitor)
- Capacitor issue #6182 — SharedArrayBuffer/COOP-COEP no WKWebView — https://github.com/ionic-team/capacitor/issues/6182
- whatwg/html issue #6060 — Android WebView e crossOriginIsolated — https://github.com/whatwg/html/issues/6060
- Android — WebViewAssetLoader — https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
- getUserMedia em Capacitor WKWebView — Ionic Forum — https://forum.ionicframework.com/t/use-getusermedia-in-capacitor/218807
- Processar áudio do microfone com AudioWorklet — web.dev — https://web.dev/patterns/media/microphone-process

### Build iOS sem Mac
- 25 horas de Xcode Cloud incluídas — Apple — https://developer.apple.com/news/?id=ik9z4ll6
- GitHub Actions runner pricing — https://docs.github.com/en/billing/reference/actions-runner-pricing
- How to Build an iOS App Without a Mac in 2026 — Code2Native — https://code2native.com/blog/build-ios-app-without-mac-2026
- How to Build and Deploy iOS Apps Without a Mac — Capawesome — https://capawesome.io/blog/how-to-build-and-deploy-ios-apps-without-a-mac/

> Nota: o WebKit 237878 (suspensão de `AudioContext` em background) e o WebKit 179411 (AEC/AGC não desligável no iOS) são referidos pelos agentes como bugs documentados do WebKit, sem URL específica no journal.
