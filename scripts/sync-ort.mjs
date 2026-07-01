// Copia os binários do onnxruntime-web para public/ort/ (servidos same-origin,
// estáticos puros — o Vite não transforma o que está em public/, evitando o
// erro "Failed to fetch dynamically imported module ...mjs?import").
// Rodado automaticamente em predev/prebuild.
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'onnxruntime-web', 'dist')
const dest = join(root, 'public', 'ort')
const files = ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs']

mkdirSync(dest, { recursive: true })
for (const f of files) {
  const from = join(src, f)
  if (!existsSync(from)) {
    console.error(`[sync-ort] ausente: ${from} — rode "npm install" primeiro`)
    process.exit(1)
  }
  copyFileSync(from, join(dest, f))
}
console.log(`[sync-ort] ${files.length} binários do ORT → public/ort/`)
