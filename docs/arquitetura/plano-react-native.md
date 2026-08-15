# Plano de Execução — Migração do Canto para React Native

> **Status:** decisão final, tomada. Este documento **não** compara alternativas nem
> reabre a escolha — ele descreve **como executar** a migração de Capacitor para
> React Native (RN), aceitando o atraso de lançamento que o fundador já assumiu.
>
> **Data:** 2026-07-09 · **Autor da execução:** fundador solo (Windows, sem Mac) ·
> **Beachhead:** cantores gospel/worship no Brasil, majoritariamente Android mid/low-range.

---

## Sumário

1. [Decisão e princípio](#1-decisão-e-princípio)
2. [Arquitetura-alvo](#2-arquitetura-alvo)
3. [O que sobrevive vs. o que reescreve](#3-o-que-sobrevive-vs-o-que-reescreve)
4. [Stack e libs (com versões)](#4-stack-e-libs-com-versões)
5. [Toolchain Rust → mobile](#5-toolchain-rust--mobile)
6. [Build/CI sem Mac](#6-buildci-sem-mac)
7. [Plano faseado por semanas (6–12) e critério de paridade](#7-plano-faseado-por-semanas-612-e-critério-de-paridade)
8. [Checklist da primeira semana](#8-checklist-da-primeira-semana)
9. [Riscos e mitigações](#9-riscos-e-mitigações)
10. [Referências](#10-referências)

---

## 1. Decisão e princípio

**React Native é a decisão final.** Migramos o shell do app (hoje React 18 + Vite
embrulhado em Capacitor/WebView) para React Native, preservando o que é IP e
descartando apenas a "cola" de plataforma (WASM + AudioWorklet + SharedArrayBuffer),
que sempre foi específica do browser.

**Princípio arquitetural único, inegociável — áudio _native-first_:**

> O DSP em tempo real (núcleo Rust) e a inferência de F0 neural (ONNX) rodam na
> **thread nativa de áudio/inferência**. O JavaScript **só controla** (start/stop,
> parâmetros, UI). Nenhuma amostra de áudio no caminho quente passa pelo runtime JS.

Por quê isto e não "o worklet JS do RN": o AudioWorklet em JS do `react-native-audio-api`
roda na thread de render de áudio, mas tem orçamento real-time duro de **~2,9 ms por
bloco de 128 amostras @44,1 kHz**; blocos maiores (256/512/1024) aliviam mas ainda são
para "cola leve por bloco", não para um laço DSP/neural pesado. O MPM + FFT + features
espectrais + veto neural do Canto **não cabem** nesse orçamento em JS num Android
barato. Logo: DSP fica no Rust nativo, chamado direto do callback de áudio nativo; o JS
recebe só o resultado (F0, clarity, features) via JSI.

Este princípio elimina de saída o defeito silencioso do Capacitor: no WebView, todo o
motor premium estava atrás do gate `crossOriginIsolated && SharedArrayBuffer`
(`src/audio/PitchEngine.ts:174`), que é **falso por padrão** no WKWebView (issue upstream
Capacitor #6182) e efetivamente inalcançável no Android WebView — fazendo o app cair no
fallback TS-MPM na main thread e **nunca rodar** nem o Rust nem o ONNX. Em RN não existe
esse gate: o Rust e o ONNX rodam em thread nativa, **toda vez**.

---

## 2. Arquitetura-alvo

Camadas, de cima (UI) para baixo (silício):

```
┌───────────────────────────────────────────────────────────────────────────┐
│  UI React Native (TypeScript/JSX)                                           │
│  • Trilha Duolingo, EVA (coach), auth/LGPD, streaks, telas de exercício     │
│  • React Navigation (ex-React Router) · Zustand/Context (estado)            │
│  • Camada perceptual em JS: perception / register / vibrato / notes         │
│    (pós-processamento a ~60–344 Hz — cabe em JS, NÃO é o laço de 128)       │
└───────────────┬─────────────────────────────────────┬───────────────────────┘
                │ JSI / Turbo Module (uniffi-RN)        │ JSI (Nitro / Turbo)
                │ controle + resultados (F0, features)  │ visualização
                ▼                                       ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│  MÓDULO NATIVO DE ÁUDIO (real-time)    │   │  VISUALIZADOR                    │
│  Android: Oboe/AAudio                  │   │  • react-native-wgpu (WebGPU/    │
│    LowLatency + Exclusive + 48kHz +    │   │    Dawn) → porta three.js/R3F    │
│    data callback + double buffer       │   │  • react-native-skia (2D trail,  │
│  iOS: AVAudioEngine / AudioUnit        │   │    agulha, medidores) — estável  │
│    RemoteIO (AURenderCallback)         │   └─────────────────────────────────┘
│                                        │
│  Dentro do callback (zero-alloc,       │
│  lock-free): buffer → Rust FFI         │
└───────┬──────────────────────┬─────────┘
        │ extern "C" (hot path) │ uniffi (setup/params, fora do RT)
        ▼                       ▼
┌───────────────────────────────┐    ┌────────────────────────────────────────┐
│  NÚCLEO RUST — dsp/ (crate)    │    │  ONNX NATIVO (F0 neural, SwiftF0)        │
│  Analyzer: MPM + FFT radix-2 + │    │  onnxruntime-react-native (oficial) ou   │
│  centroid/tilt/H1-H2           │    │  react-native-nitro-onnxruntime          │
│  process(ptr,frames)->features │    │  EP: NNAPI (Android) / CoreML (iOS) /    │
│  (o MESMO código do WASM)      │    │  XNNPACK · MESMO model.onnx              │
└───────────────────────────────┘    └────────────────────────────────────────┘
```

Regras de fronteira (as que evitam crash/UB e glitch):

- **Caminho quente (por bloco de áudio):** callback nativo → `extern "C" process(ptr,
  frames)` do Rust. Sem alocação, sem lock, sem I/O. Parâmetros mutáveis passam por
  `AtomicF32`/duplo-buffer, nunca por chamada bloqueante.
- **Caminho de controle (setup, mudar exercício, ler features agregadas):** bindings
  **uniffi** (TS ↔ Rust) gerados como Turbo Module. Uniffi **não** entra no callback.
- **Resultados para a UI:** F0/clarity/features saem do nativo para o JS via JSI
  (`ArrayBuffer` apontando para PCM/feature-vector em memória — zero-copy), a taxa de
  frame perceptual (~60 Hz), não a 344 Hz.
- **O visualizador** consome os mesmos frames de F0 no lado JS; renderização pesada vai
  para a UI thread (Skia/Reanimated worklets ou wgpu), **não** para a JS thread.

---

## 3. O que sobrevive vs. o que reescreve

Ligado aos arquivos reais do repositório. Contagem: núcleo Rust ~280 linhas; stack de
áudio TS ~2.400 linhas; a IP de análise vocal em TS ~840 linhas.

| Área | Arquivo(s) reais | Sobrevive? | O que acontece |
|---|---|---|---|
| **Matemática DSP** | `dsp/src/lib.rs` (Analyzer, MPM, FFT, centroid, tilt, H1-H2) | **~95% intacto** | Recompila para nativo (aarch64) em vez de wasm32. Trocam-se só ~4 linhas: `use wasm_bindgen::prelude::*` e os 4 `#[wasm_bindgen]`. `Cargo.toml` já declara `crate-type=["cdylib","rlib"]`. |
| **Assinatura pública do core** | `Analyzer::new(sr, size)` + `analyze(&[f32]) -> Vec<f32>` (retorna `[f0, clarity, rms, centroid, tilt, h1h2]`) | **Sim** | Formato que uniffi mapeia direto (slices, `Vec<f32>`). Ganha também um `extern "C"` fino para o hot path. |
| **Modelo neural F0** | `public/model.onnx` (SwiftF0: entrada `input_audio` f32 `[1,N]` @16k; saídas `pitch_hz`, `confidence`) | **Sim, inalterado** | Só troca o runtime: `onnxruntime-web` → `onnxruntime-react-native`. Mesmo I/O. |
| **Reamostragem 48k→16k** | `src/audio/resample.ts` (`Resampler16k`) | **Sim (JS)** | Roda no lado JS/controle ou migra pro Rust depois. Não é hot loop de 128. |
| **IP perceptual/vocal** | `src/audio/perception.ts` (316), `register.ts` (169), `vibrato.ts` (55), `notes.ts` (57), `voiceType.ts` (73), `breathCycle.ts` (37), `session.ts` (195), `songRoll.ts` (170) | **Sim, como JS** | É pós-processamento por frame (~60 Hz), não o laço de 128 amostras — cabe em JS. Copia quase 1:1 para o app RN. |
| **MPM em TS (fallback web)** | `src/audio/mpm.ts` (97) | **Descartável** | Existia como fallback sem isolamento. Em RN o MPM roda no Rust nativo sempre; pode manter como referência de teste. |
| **Orquestração do motor** | `src/audio/PitchEngine.ts` (294) | **Reescreve a fiação, mantém a lógica** | A reconciliação MPM×neural (veto de oitava, `frameFromFeatures`), gating (CLARITY_MIN/RMS_MIN), assinatura `subscribe/start/stop` — tudo **lógica portável**. O que muda: os dois `Worker` + `AudioWorkletNode` + SAB viram um módulo de áudio nativo + callbacks JSI. |
| **Captura / transporte** | `public/worklets/capture-processor.js` (37), `src/audio/ringbuffer.ts` (SAB, 29), `src/audio/dsp-worker.ts` (63), `src/audio/swiftf0-worker.ts` (118) | **Reescreve (era cola de browser)** | Substituídos por: mic nativo (Oboe/AVAudioEngine) → ring buffer nativo → Rust FFI + ORT nativo. É exatamente a parte "descartável por design". |
| **Player de tom (drone)** | `src/audio/TonePlayer.ts` (120, osciladores Web Audio) | **Porta direta** | `react-native-audio-api` implementa a Web Audio API (Oscillator/Gain/BiquadFilter) quase 1:1. |
| **Visualizador 3D** | `src/components/audio/Body3D.tsx`, `AudioBlob.tsx` (react-three-fiber/WebGL) | **Porta parcial** | Cenas three.js/R3F (r168+) rodam em `react-native-wgpu`. Ajuste de metro config + eventuais casos de borda. 2D (agulha/trail) migra para Skia. |
| **Hook de consumo** | `src/hooks/usePitchEngine.ts` | **Sim** | Mesma interface `subscribe`; só a criação do engine muda. |
| **Toda a UI / trilha / EVA / dados** | `src/pages/*` (Dashboard, Practice, Coach, ExercisePlayer, HarmonyTrainer, SongPlayer, Progress, Planos, etc.), `src/app/*` (AppShell, Sidebar, AuthContext), `src/data/*` (curriculum, tracks, exercises, gamification, adaptive, eva, coaching, harmony, billing…) | **Lógica sobrevive; render reescreve** | `src/data/*` é TS puro → copia direto. As telas: a **lógica/hooks/estado** transfere; o que reescreve é a **camada de render** (`div/css` → `View/StyleSheet`, React Router → React Navigation). É aqui que a fluência em React do time paga. |

**Resumo:** o que se joga fora é a **cola de plataforma** (WASM glue, AudioWorklet, SAB,
Web Workers, DOM/canvas). O que se mantém é a **matemática Rust**, o **modelo ONNX**, a
**IP vocal em TS**, toda a **lógica de negócio/dados** e a **lógica de UI** — só a camada
de render e de áudio é nova.

---

## 4. Stack e libs (com versões)

Versões verificadas em jul/2026 (ver §10). Tudo aqui é `0.x`/cutting-edge exceto ORT
oficial e Skia — trate como tal (ver §9).

| Papel | Lib | Versão (jul/2026) | Notas |
|---|---|---|---|
| **Motor de áudio** | `react-native-audio-api` (Software Mansion) | **0.13.x** (0.13.1, 01/07/2026) | Reimplementação nativa da Web Audio API para RN. iOS/Android/web. JS Audio Worklets V1 (0.9.0) e pipelines na audio-thread V2 (0.10.0). Produção: Odisei Play (<10 ms). Cobertura Web Audio ainda parcial (falta DynamicCompressor/MIDI). Serve para playback/mixagem/drone; o laço DSP pesado vai pro Rust nativo. |
| **Bridge Rust ↔ RN** | `uniffi-bindgen-react-native` (jhugman / Mozilla+Filament) | **0.31.0-2** (jul/2026) | Gera TS + JSI C++ + Turbo Module a partir do crate Rust. Versão espelha o `uniffi-rs`. Já suporta WASM; será renomeado `uniffi-bindgen-javascript`. "Early release" — docs finas. Use para o controle; o hot path usa `extern "C"` puro. |
| **ONNX (recomendado p/ v1)** | `onnxruntime-react-native` (Microsoft, oficial) | **1.24.x** (1.24.3) | Binding oficial do ORT Mobile. `.onnx`/`.ort`. EP: NNAPI (Android), CoreML (iOS), XNNPACK. Estável e mantido — **comece por aqui**. |
| **ONNX (upgrade de perf, opcional)** | `react-native-nitro-onnxruntime` (ronickg) | **0.1.x** | Nitro Modules, JSI zero-overhead, NNAPI(FP16)/CoreML/XNNPACK, inferência async. Mais rápido, porém v0.1 (~4 estrelas). Adote só se o ORT oficial não bater a latência-alvo, e atrás de um flag. |
| **3D / WebGPU** | `react-native-wgpu` (wcandillon, via Dawn) | **0.5.15** (renomeando p/ `react-native-webgpu`) | three.js **r168+** roda "out of the box" com ajuste no metro config (resolver three para o build WebGPU). Opcional: `react-native-webgpu-worklets` (Software Mansion Labs) roda three.js na UI thread via Reanimated worklets. Experimental. |
| **2D estável** | `react-native-skia` (Shopify) | GA (estável) | Waveform/agulha/pitch-trail/spectro a 60 fps. Pareia com `react-native-audio-api` (há tutorial oficial "Audio Visualizer com Audio API + Skia"). **Use para o 2D; reserve wgpu só para 3D real.** |
| **Navegação** | `@react-navigation/native` (+ stack/tabs) | 7.x | Substitui o React Router. |
| **Estado** | Zustand ou Context/reducer | — | Reaproveita o estado atual (`AppContext`, `AuthContext`). |
| **Runtime/CLI** | **Expo (dev client) + EAS Build** | SDK 5x (RN 0.7x) | Ver recomendação abaixo. |

### Escolha Expo (dev build/EAS) vs. RN CLI — recomendação

**Recomendação: Expo com _dev client_ + _config plugins_ + EAS Build.** Justificativa
para um dev solo, em React, no Windows, **sem Mac**:

- O maior atrito de RN sem Mac é a toolchain iOS local (Xcode/CocoaPods). O **EAS Build**
  roda os builds iOS em **VMs macOS na nuvem** — você dispara build iOS do Windows, sem
  Xcode local. Isto remove o bloqueio nº 1.
- **Módulos nativos custom (uniffi Turbo Module, áudio Oboe/AVAudioEngine, ORT, wgpu)
  funcionam no Expo** desde que você use **development build** (não Expo Go) + **config
  plugins**/`prebuild`. Ou seja: Expo aqui não é "managed sem código nativo" — é
  "managed + seu código nativo", com o EAS cuidando do build/assinatura.
- Você mantém `expo run:android` local no Windows (Android SDK só) para o loop rápido de
  Android — que é 90% do desenvolvimento até chegar em iOS.

**Quando o RN CLI puro faria sentido:** se algum dos plugins nativos (uniffi-RN, wgpu)
não tiver config plugin e o `prebuild` do Expo brigar com a integração. Mitigação: se
isso acontecer, `expo prebuild` "ejeta" para projetos `android/`+`ios/` nativos e você
segue no fluxo bare — sem reescrever app. **Comece Expo; só caia para bare se um plugin
nativo exigir.**

---

## 5. Toolchain Rust → mobile

O crate `dsp/` já é quase agnóstico de plataforma. O trabalho é: (a) adicionar targets,
(b) empacotar `.so` (Android) e `.xcframework` (iOS), (c) gerar bindings uniffi.

### 5.1 Preparar o crate

1. No `Cargo.toml`, garantir `crate-type = ["cdylib", "rlib", "staticlib"]` (já tem
   cdylib+rlib; `staticlib` ajuda no iOS `.a`).
2. Adicionar dependência `uniffi` e feature de scaffolding. Manter o `wasm-bindgen`
   atrás de `#[cfg(target_arch = "wasm32")]` para o build web continuar existindo (não
   quebre a web durante a migração).
3. Expor **duas superfícies**:
   - **Controle (uniffi):** o `Analyzer` (`new`, `analyze`) anotado para uniffi
     (proc-macro `#[uniffi::export]` ou UDL). Mapeia `Vec<f32>`/slice direto.
   - **Hot path (`extern "C"`):** uma função `#[no_mangle] pub extern "C" fn
     canto_process(analyzer: *mut Analyzer, ptr: *const f32, frames: usize, out:
     *mut f32)` — sem alocação, chamável do callback Oboe/AVAudioEngine.

### 5.2 Android (`.so` via cargo-ndk) — roda no Windows

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi \
                  x86_64-linux-android i686-linux-android
cargo install cargo-ndk
# com o Android NDK instalado (via Android Studio / sdkmanager):
cargo ndk -t arm64-v8a -t armeabi-v7a -t x86_64 \
  -o ./jniLibs build --release
# → gera libcanto_dsp.so por ABI em jniLibs/, consumível pelo módulo nativo Android
```

### 5.3 iOS (`.xcframework`) — precisa de macOS para linkar/assinar

```bash
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
# compilar as libs estáticas:
cargo build --release --target aarch64-apple-ios
cargo build --release --target aarch64-apple-ios-sim
# empacotar (feito na etapa macOS/CI):
xcodebuild -create-xcframework \
  -library target/aarch64-apple-ios/release/libcanto_dsp.a \
  -library target/aarch64-apple-ios-sim/release/libcanto_dsp.a \
  -output CantoDsp.xcframework
```

> **A compilação Rust roda no Windows**, mas o `-create-xcframework` e a linkagem/
> assinatura final usam o SDK Apple → esse passo vai para o **CI macOS** (EAS/Codemagic/
> GitHub Actions macOS). Alternativa que simplifica: **`cargo swift`** gera um Swift
> Package a partir do crate uniffi (roda também na etapa macOS). Deixe o iOS para a
> Fase 1+; o Android inteiro se resolve no Windows.

### 5.4 Bindings uniffi para RN

```bash
# instala o gerador (npm) e roda contra o crate:
npm i -D uniffi-bindgen-react-native
npx uniffi-bindgen-react-native generate    # gera TS + JSI C++ + Turbo Module
# resultado: um Turbo Module que expõe Analyzer.new()/analyze() ao TS.
```

O caminho concreto de referência (produção): RN → módulo nativo (Kotlin/Swift) →
bindings uniffi → Rust; o **áudio nunca toca o JS** — gerado no callback do Oboe/
AVAudioEngine, com `AtomicF32` para updates de parâmetro lock-free.

---

## 6. Build/CI sem Mac

O ciclo **build → assinar → publicar** iOS é problema resolvido sem Mac. O que **não**
se resolve remotamente é o **debug interativo do áudio nativo iOS** (xruns, tuning de
buffer, interrupções de AVAudioSession) — planeje isolar isso.

| Necessidade | Ferramenta | Detalhe/custo |
|---|---|---|
| **Conta Apple** (obrigatória) | Apple Developer Program | **US$ 99/ano**. Sem ela não há assinatura nem TestFlight. |
| **Build iOS na nuvem** | **EAS Build** (Expo) | VM macOS por build; dispara do Windows. Caminho principal recomendado. |
| **Alternativa de build** | **Codemagic** | Frota Mac gerenciada; bom p/ pipelines RN. |
| **Alternativa CI genérica** | **GitHub Actions** runners macOS | ~US$ 0,062/min (pós-jan/2026); pipeline iOS ~20 min ≈ US$ 1,24/run. Multiplicador 10× vs Linux — use com parcimônia. |
| **Alternativa Apple** | **Xcode Cloud** | 25 h/mês grátis com o Developer Program (~4 builds/dia num projeto pequeno). |
| **Distribuição beta iOS** | **TestFlight** | Sobe o `.ipa` do EAS; testa em device real de terceiros. |
| **Distribuição Android** | **Play Console** (internal testing) | Direto do Windows. |
| **Debug de ÁUDIO nativo iOS** | **Mac alugado** (MacinCloud) ou **Mac mini usado** | ~US$ 20–60/mês (nuvem) ou compra única. **Único ponto onde CI não substitui Mac.** |

**Como minimizar a dependência de Mac:**

1. **Ordem de plataforma:** faça **Android primeiro, ponta a ponta** (Windows resolve
   tudo: Rust, Oboe, ORT/NNAPI, wgpu). Só ataque iOS quando o pipeline de áudio já
   estiver provado no Android — assim o Mac só é preciso na **integração/tuning** iOS,
   não no desenvolvimento diário.
2. **Empurre a linkagem iOS para o CI:** a compilação Rust é no Windows; só o
   `create-xcframework`/assinatura roda na VM macOS do EAS. Você raramente abre o Mac.
3. **Reserve o Mac alugado por janelas curtas:** contrate MacinCloud só nas
   1–2 semanas de _hardening_ de áudio iOS (Fase 1 tardia/Fase 4), não o projeto todo.
4. **TestFlight como loop de QA iOS:** sem Mac local, valide comportamento de áudio iOS
   via builds TestFlight em device real (seu iPhone/emprestado), lendo logs, em vez de
   step-debug. Cobre a maioria dos casos; o Mac fica para os bugs cabeludos de xrun.

---

## 7. Plano faseado por semanas (6–12) e critério de paridade

**Filosofia: incremental, nunca big-bang.** Cada fase entrega algo rodando e nenhuma
descarta o app web (que continua no ar). **Não se porta a UI antes de bater o critério
de paridade de áudio.** Datas são de dev solo; some folga.

### Critério de paridade (o gate antes de portar a UI)

Medível, num **Android real sub-R$ 800** (Infinix/Samsung série A — o hardware do
beachhead), **não** no seu aparelho bom:

| Métrica | Alvo | Como medir |
|---|---|---|
| **Latência mic→F0→UI (round-trip)** | **< 30 ms percebido** (hipótese a validar, não fato) | Timestamp no callback nativo vs. frame entregue ao JS; validar "sensação de colado à voz". |
| **Precisão de F0** | **≤ 5–10 cents** de erro vs. web, no sweep E2–A5 | Reusar o self-test 220 Hz já existente (dsp-worker/swiftf0) + varredura de 10 notas. |
| **Estabilidade sob carga** | **Zero dropouts** em 5 min de canto sustentado + visualizador, **sob throttling térmico** | Sessão longa no aparelho barato quente. |
| **Concordância neural** | Veto de oitava MPM×SwiftF0 igual ao web | Comparar `frameFromFeatures` nas duas plataformas. |
| **Backend efetivo** | 100% dos frames no caminho nativo (nunca fallback) | Log de backend (como já existe em `PitchEngine.ts:188`). |

> Se a Fase 1 **não** bater esse critério no aparelho barato, **pare e conserte o áudio
> antes de investir na UI**. Este é o ponto de decisão que protege os meses seguintes.

### Fase 0 — Spike de áudio nativo tocando o Rust (Semana 1)

Objetivo: provar a espinha dorsal ponta a ponta, mínima. Ver o **Checklist da primeira
semana** (§8). Entregável: app RN no Android físico que (a) emite um tom via
`react-native-audio-api` e (b) chama uma função Rust hello-world via uniffi e mostra o
retorno. Sem UI, sem beleza.

### Fase 1 — Pipeline de pitch em tempo real com paridade (Semanas 2–5)

- Módulo de áudio nativo **Android** (Oboe/AAudio: LowLatency + Exclusive + 48 kHz +
  data callback + double buffer) capturando o mic com AGC/NS/AEC **desligados** (como
  em `PitchEngine.ts:165`).
- Callback nativo → ring buffer nativo → **`canto_process` (Rust FFI)** → features
  `[f0, clarity, rms, centroid, tilt, h1h2]`.
- **F0 neural** via `onnxruntime-react-native` com o **mesmo `model.onnx`**, EP NNAPI;
  reusar a reamostragem 48k→16k e o veto de oitava.
- Portar a **lógica de reconciliação/gating** de `PitchEngine.ts` (é TS portável) e a
  **camada perceptual** (`perception/register/vibrato/notes`) como JS.
- **Medir o critério de paridade** no aparelho barato. Iterar até bater.
- (Só depois) replicar o módulo de áudio em **iOS** (AVAudioEngine/RemoteIO) — aqui
  entra a janela de Mac alugado.

### Fase 2 — Visualizador (Semanas 6–7)

- **2D primeiro (estável):** agulha/pitch-trail/medidores em `react-native-skia`,
  alimentados pelos frames de F0. Cobre a maior parte do valor visual.
- **3D depois (experimental):** portar `Body3D.tsx`/`AudioBlob.tsx` (R3F) para
  `react-native-wgpu`; ajustar metro config; tratar casos de borda. Se wgpu travar,
  entrega-se v1 só com Skia 2D e o 3D fica para depois (não bloqueia lançamento).

### Fase 3 — UI / trilha / EVA (Semanas 8–10)

- Portar as telas: **lógica/hooks/estado transferem** (fluência React do time paga
  aqui); reescreve-se só a **render** (`div`→`View`, CSS→StyleSheet, React Router→
  React Navigation).
- `src/data/*` (curriculum, gamification, adaptive, eva, coaching, harmony, billing…) é
  **TS puro → copia direto**.
- EVA (coach) e auth/LGPD: a lógica sobrevive; refazer a superfície visual.

### Fase 4 — Polish + lojas (Semanas 11–12)

- QA térmico em 2–3 aparelhos baratos reais; ícones/splash; permissões (mic Info.plist
  / Android manifest); background-audio entitlements iOS.
- **TestFlight** (iOS) + **Play internal testing** (Android). Fechar assinatura no EAS +
  conta Apple. Listagens de loja. Submissão.

**Se o cronograma apertar:** corte o 3D wgpu (fica Skia 2D), adie iOS uma release
(lança Android primeiro — é o beachhead), mantenha ORT oficial (não o Nitro). O caminho
crítico é **Fase 1 no Android**; o resto é sequenciável.

---

## 8. Checklist da primeira semana

Passos acionáveis para começar já (foco: provar a espinha dorsal no Android, sem Mac):

- [ ] **Criar o app RN** com **Expo + dev client** (TypeScript) e rodar num **Android
      físico** via `expo run:android` (Android SDK no Windows) ou EAS dev build.
- [ ] **Adicionar `react-native-audio-api`** e provar que **um tom sai** (Oscillator →
      destination) no alto-falante do Android — valida o motor de áudio ponta a ponta.
- [ ] **Instalar a toolchain Rust mobile:** `rustup target add aarch64-linux-android …`;
      `cargo install cargo-ndk`; instalar o **Android NDK**; `npm i -D
      uniffi-bindgen-react-native`. (Anotar targets iOS para a Fase 1.)
- [ ] **Hello-world uniffi:** uma função Rust trivial (ex.: `fn echo_f32(x: f32) ->
      f32`), gerá-la como **Turbo Module** e **chamar do JS** vendo o retorno no device.
- [ ] **Cross-compilar o crate `dsp/` existente** para `aarch64-linux-android` com
      `cargo-ndk` — só provar que **compila e linka** (`.so` gerado), sem integrar ainda.
- [ ] **Expor o `Analyzer` via uniffi** e chamar `analyze()` a partir de um **buffer
      sintético de 220 Hz** no JS; conferir **f0 ≈ 220** (reusa a lógica do self-test que
      já existe no `dsp-worker`/`swiftf0-worker`).
- [ ] **Garantir 1–2 aparelhos Android sub-R$ 800** (Infinix/Samsung série A) para o QA
      real e medir a latência-base — o gate de paridade depende disso.
- [ ] **Configurar EAS Build + conta Apple Developer (US$ 99)** para destravar os builds
      iOS na nuvem quando a Fase 1 chegar ao iOS.

---

## 9. Riscos e mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| **Pilha de deps v0.x cutting-edge simultâneas** (`uniffi-bindgen-react-native` "early", `react-native-nitro-onnxruntime` v0.1, `react-native-wgpu` experimental) | Alta | **Fixar versões** exatas. Começar pelo **maduro**: ORT **oficial** (não Nitro), **Skia** 2D (não wgpu). Só adotar o cutting-edge atrás de flag depois que o núcleo estiver estável. Ser bom bug-reporter upstream. |
| **iOS é a metade difícil e sub-documentada** (a maioria dos exemplos RN low-latency é Android/Oboe) + **sem Mac** para step-debug do áudio | Alta | **Android primeiro** (prova tudo no Windows). Mac alugado só na janela de _hardening_ iOS. TestFlight como loop de QA. AVAudioSession + background-audio entitlements desde o início. |
| **Latência sub-30 ms é hipótese, não fato** para o **seu** modelo/aparelho | Alta | **Validar no gate de paridade (Fase 1)** num Android sub-R$ 800 real, com o F0 real, **antes** de portar a UI. Se não bater, considerar variante de modelo mais leve (SwiftF0 já é enxuto). |
| **Fallback silencioso de EP ONNX** (NNAPI/CoreML caindo para CPU, às vezes mais lento que o CPU do ORT) | Média | Verificar cobertura de operadores do SwiftF0; medir com/sem EP; se preciso, build custom do ORT ou aceitar CPU (modelo é pequeno). |
| **Segurança na fronteira FFI** (Rust perde garantias no C ABI; ponteiro/frames errado = UB/crash, sem borrow-checker) | Média | Contrato `process(ptr,frames,out)` minúsculo e testado com fuzz de tamanhos; callback **zero-alloc/lock-free**; nunca chamar uniffi no hot path. |
| **Caminho 3D bifurcado** (wgpu experimental vs. expo-gl frágil/desatualizado) | Média | Padrão = **Skia 2D estável**; wgpu só para 3D real e **não bloqueia lançamento**. Se wgpu não amadurecer, v1 sai só com 2D. |
| **Prebuild do Expo brigar com plugin nativo** (uniffi/wgpu sem config plugin) | Média | Escrever config plugin simples; se persistir, `expo prebuild` ejeta para bare RN **sem reescrever o app**. |
| **Orçamento do worklet JS (~2,9 ms/128)** se alguém puser DSP pesado no JS | Média | **Disciplina arquitetural:** DSP pesado **sempre** no Rust nativo; worklet JS só para cola leve. Revisar em code review. |
| **Superfície de manutenção do solo** (web + iOS + Android + cross-compile Rust) | Média | Uma UI RN (não duas como full-native). Manter a web viva durante a migração. CI automatizado (EAS) para não montar build à mão. |
| **`react-native-audio-api` com cobertura Web Audio parcial** (falta DynamicCompressor/MIDI) | Baixa | O `TonePlayer` usa só Oscillator/Gain/Biquad — coberto. Recursos ausentes não estão no caminho crítico. |

---

## 10. Referências

**Motor de áudio / worklets**
- react-native-audio-api (repo): https://github.com/software-mansion/react-native-audio-api
- react-native-audio-api (npm): https://www.npmjs.com/package/react-native-audio-api
- Docs (worklets, orçamento real-time): https://docs.swmansion.com/react-native-audio-api/docs/worklets/worklets-introduction/
- Anúncio 0.13: https://x.com/swmansion/status/2072700619555520800
- Pipelines de áudio real-time em RN (JSI zero-copy, Callstack): https://www.callstack.com/blog/from-files-to-buffers-building-real-time-audio-pipelines-in-react-native

**Rust ↔ RN (uniffi)**
- uniffi-bindgen-react-native (repo): https://github.com/jhugman/uniffi-bindgen-react-native
- Introdução Mozilla ("Rust-powered Turbo Modules"): https://hacks.mozilla.org/2024/12/introducing-uniffi-for-react-native-rust-powered-turbo-modules/
- uniffi-rs (base): https://github.com/mozilla/uniffi-rs
- Rust + Oboe + RN (exemplo de produção): https://suyashsingh.in/blog/android-oboe-with-rust-and-react-native
- Multiplatform com Rust no iOS (xcframework/targets): https://mobilesystemdesign.substack.com/p/multiplatform-with-rust-on-ios-2c4

**Áudio nativo (APIs)**
- Android Oboe (low latency, checklist 8 pontos, tabela de latência): https://developer.android.com/games/sdk/oboe/low-latency-audio
- google/oboe: https://github.com/google/oboe
- NDK audio guide: https://developer.android.com/ndk/guides/audio
- iOS AVAudioEngine / render callback (fórum Apple): https://developer.apple.com/forums/thread/22530
- iOS RemoteIO AudioUnit (low-latency host): https://developer.apple.com/forums/thread/65675

**ONNX**
- onnxruntime-react-native (npm, oficial): https://www.npmjs.com/package/onnxruntime-react-native
- ONNX Runtime — React Native (docs): https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html
- react-native-nitro-onnxruntime: https://github.com/ronickg/react-native-nitro-onnxruntime
- NNAPI EP (fallback de CPU): https://onnxruntime.ai/docs/execution-providers/NNAPI-ExecutionProvider.html

**3D / gráficos**
- react-native-webgpu (repo, via Dawn): https://github.com/wcandillon/react-native-webgpu
- react-native-wgpu (npm): https://www.npmjs.com/package/react-native-wgpu
- react-native-webgpu-worklets (three.js na UI thread): https://github.com/software-mansion-labs/react-native-webgpu-worklets
- WebGPU + Skia (Shopify Engineering): https://shopify.engineering/webgpu-skia-web-graphics
- react-native-skia: https://shopify.github.io/react-native-skia/

**Build/CI sem Mac**
- EAS Build (introdução): https://docs.expo.dev/build/introduction/
- EAS dev build: https://docs.expo.dev/develop/development-builds/create-a-build/
- Xcode Cloud 25 h grátis: https://developer.apple.com/news/?id=ik9z4ll6
- GitHub Actions macOS runner pricing: https://docs.github.com/en/billing/reference/actions-runner-pricing
- Build iOS sem Mac (2026): https://code2native.com/blog/build-ios-app-without-mac-2026

**Contexto (por que native-first / o gate do WebView)**
- Capacitor #6182 (COOP/COEP no WKWebView): https://github.com/ionic-team/capacitor/issues/6182
- whatwg/html #6060 (Android WebView e cross-origin isolation): https://github.com/whatwg/html/issues/6060
