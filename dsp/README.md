# canto-dsp — núcleo de DSP vocal (Rust → WebAssembly)

O hot path do processamento de sinal (F0 + features espectrais) escrito em Rust e
compilado para WebAssembly. É o núcleo "escreva uma vez": roda no navegador hoje
(WASM) e é reaproveitável no mobile depois (mesma lógica via binding nativo).

## Pré-requisitos (uma vez)

```bash
# 1. Rust
curl https://sh.rustup.rs -sSf | sh        # (Windows: https://win.rustup.rs/x86_64)
# 2. target WebAssembly
rustup target add wasm32-unknown-unknown
# 3. wasm-pack (binário prebuilt, sem precisar de linker MSVC)
#    https://github.com/wasm-bindgen/wasm-pack/releases  →  colocar wasm-pack no PATH
```

## Build

Do diretório raiz do projeto:

```bash
npm run build:dsp     # compila para src/wasm/ (target web, usado pelo app)
npm run test:dsp      # compila target nodejs e roda o smoke test (senoides)
```

O artefato final (`src/wasm/canto_dsp_bg.wasm` + glue) é versionado, então o app
builda mesmo sem a toolchain Rust instalada. Só rode `build:dsp` ao mexer no Rust.

## Saída de `analyze(frame)`

Vetor `Float32Array` por frame:

| índice | feature | unidade |
|---|---|---|
| 0 | `f0` (0 = sem voz) | Hz |
| 1 | `clarity` (periodicidade NSDF) | 0..1 |
| 2 | `rms` | 0..1 |
| 3 | `spectral_centroid` | Hz |
| 4 | `spectral_tilt` = ln(E_alta/E_baixa), split 1.5 kHz | — |

## Verificado

`npm run test:dsp` → 10/10 notas de **E2 a A5** com ~0 cents de erro; centróide
escala com a frequência; F0 = 0 no silêncio. WASM final: ~27 KB.

## Próximos passos (roadmap de engenharia)

- Rodar este núcleo dentro de um **AudioWorklet** (fora do main thread) com ring
  buffer lock-free (SharedArrayBuffer/Atomics).
- Adicionar **F0 neural (SwiftF0/ONNX)** num Web Worker como segunda opinião.
- Features de **registro/passaggio** (H1-H2 relativo a F0, tuning de formantes).
