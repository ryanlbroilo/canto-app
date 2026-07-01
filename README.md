# Canto — Treino Vocal com IA

Plataforma web de treino vocal. **Fase 1 (esta base):** pipeline de detecção de pitch em
tempo real no navegador, com feedback visual _durante_ a nota. O áudio nunca sai do dispositivo.

## Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`, clique em **Começar**, permita o microfone e cante.
(Microfone exige contexto seguro: `localhost` ou `https`.)

Outros comandos:

```bash
npm run build      # build de produção (Vite)
npm run typecheck  # checagem de tipos (tsc)
```

## O que já funciona

- Captura de microfone (`getUserMedia`) iniciada por gesto do usuário.
- Detecção de F0 em tempo real via **McLeod Pitch Method (MPM)**.
- Leitura grande de nota + desvio em **cents** com agulha, cor comunicando acerto/erro
  (verde ≤10¢ · amarelo ≤25¢ · vermelho acima) — _Knowledge of Results_.
- **Piano-roll** rolando com o histórico de pitch (mostra estabilidade e vibrato).
- **Modo afinador** (nota mais próxima) e **modo alvo** (praticar acertar uma nota).

## Arquitetura (e para onde vai)

O motor de pitch fica atrás da interface `PitchEngine` (`src/audio/PitchEngine.ts`).
Hoje usa `AnalyserNode` + `requestAnimationFrame` + MPM no main thread — robusto e
comprovado. A evolução (sem mudar quem consome o motor):

1. **AudioWorklet + WebAssembly** para tirar o DSP do main thread (latência/estabilidade).
2. Trocar/complementar o MPM por **SwiftF0** (ou PESTO) em **ONNX** (`onnxruntime-web`,
   WASM→WebGPU) para robustez a ruído e nos extremos (agudos/graves).
3. Ring buffer via `SharedArrayBuffer` (exige headers COOP/COEP — já anotado no `vite.config.ts`).

Contexto de produto e P&D: ver `PRD-plataforma-vocal-eva.md`,
`fundamentacao-academica-vocal.md` e `pd-vocal-estado-da-arte-2026-07-01.md` na raiz.

## Estrutura

```
src/
  audio/
    mpm.ts            # McLeod Pitch Method (detecção de F0)
    notes.ts          # Hz <-> nota <-> MIDI, cents
    PitchEngine.ts    # captura + loop de análise (interface estável)
  components/
    PitchDisplay.tsx  # nota + cents + agulha (herói)
    PitchGraph.tsx    # piano-roll do histórico
    TargetPicker.tsx  # seletor de nota-alvo
    LevelMeter.tsx    # nível do microfone
  hooks/
    usePitchEngine.ts
  theme.ts            # cores por precisão (cents)
  App.tsx
```
