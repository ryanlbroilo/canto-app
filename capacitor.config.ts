import type { CapacitorConfig } from '@capacitor/cli'

// Shell nativo iOS/Android via Capacitor. Escolhemos Capacitor (e não React
// Native / Flutter) por um motivo decisivo: o motor de áudio do Canto — DSP em
// Rust→WASM, AudioWorklet e F0 neural (ONNX) — roda no WebView exatamente como
// na web. RN/Flutter exigiriam reescrever esse núcleo do zero. Aqui, o mesmo
// build de produção (webDir 'dist') vira app nativo, preservando o diferencial.
const config: CapacitorConfig = {
  appId: 'com.canto.app',
  appName: 'Canto',
  webDir: 'dist',
  backgroundColor: '#0d0c0a',
  android: {
    backgroundColor: '#0d0c0a',
    // O treino usa o microfone; a permissão vai no AndroidManifest ao rodar `cap add android`.
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: '#0d0c0a',
    contentInset: 'always',
  },
  plugins: {
    // Splash controlada por nós (evita flash branco antes do app montar).
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#0d0c0a',
      showSpinner: false,
    },
  },
}

export default config
