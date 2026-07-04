# Canto no celular — iOS & Android

## A decisão: Capacitor (não React Native, não Flutter)

O coração do Canto é o **motor de áudio no dispositivo**: DSP em Rust→WASM (detecção
de pitch MPM), captura via **AudioWorklet**, F0 neural (**ONNX/SwiftF0**) e Web Audio.
Esse motor é o nosso fosso competitivo — ninguém no worship escuta a voz do cantor; nós sim.

- **React Native / Flutter** rodam a UI em nativo, mas **não rodam AudioWorklet nem
  WASM/ONNX do jeito que a web roda**. Portar o Canto pra eles significaria **reescrever
  todo o núcleo de áudio** (semanas de trabalho + risco de regressão no que já funciona).
- **Capacitor** empacota o app web dentro de um WebView nativo. O **mesmo build de
  produção** (`dist/`) — WASM, worklets, ONNX e tudo — vira app de loja **sem reescrever
  nada**. O microfone usa a API nativa via permissão do sistema.

Resultado: um único código, três alvos (web/PWA, iOS, Android), e o motor intacto.

## O que já está pronto neste repo

- `@capacitor/core`, `@capacitor/android`, `@capacitor/ios` e `@capacitor/cli` instalados.
- `capacitor.config.ts` configurado (appId `com.canto.app`, `webDir: dist`, cores/splash).
- Scripts npm: `cap:sync`, `cap:android`, `cap:ios`.
- **PWA já instalável** (manifest + service worker + ícones) — no Android, muitos usuários
  vão "Adicionar à tela inicial" antes mesmo da loja.

## Passo a passo para gerar os apps (quando for publicar)

Pré-requisitos: **Android Studio** (Android) e **Xcode + macOS** (iOS).

```bash
# 1. Adicionar as plataformas nativas (gera as pastas android/ e ios/)
npx cap add android
npx cap add ios

# 2. Buildar a web e sincronizar pro nativo
npm run cap:sync

# 3. Abrir no IDE nativo pra rodar/assinar/publicar
npx cap open android   # ou: npm run cap:android
npx cap open ios       # ou: npm run cap:ios
```

### Permissão de microfone (obrigatória)

- **iOS** — em `ios/App/App/Info.plist` adicione:
  ```xml
  <key>NSMicrophoneUsageDescription</key>
  <string>O Canto usa o microfone para dar feedback de afinação em tempo real. O áudio é processado no aparelho e nunca é enviado ou gravado.</string>
  ```
- **Android** — em `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  ```

### Apontando pro backend de produção

O app nativo carrega o `dist/`, que fala com a API via `VITE_API_URL`. Faça o build
com a URL de produção:

```bash
VITE_API_URL="https://api.seudominio.com/api" npm run cap:sync
```

## Checklist para as lojas (responsabilidade do fundador)

- Conta **Apple Developer** (US$ 99/ano) e **Google Play Console** (US$ 25, único).
- Ícones e splash já derivam de `public/icon-512.png` (o `cap add` gera os tamanhos).
- Política de Privacidade pública (já temos em `/privacidade`) — as duas lojas exigem URL.
- Descrever o uso do microfone no formulário de privacidade das lojas (é local, não sai do device).
