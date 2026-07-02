import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

// Tira o peso morto de ~13MB do ORT no bundle de produção.
// O `onnxruntime-web/wasm` tem um `new URL("ort-wasm-simd-threaded.wasm", import.meta.url)`
// dentro de um bloco `if (false)` (código morto — só usado se wasmPaths não for setado).
// O scanner de assets do Vite emite a cópia do .wasm AO VER esse texto, ANTES do
// tree-shaking apagar o ramo — mas o runtime nunca usa: carregamos os binários de
// `/ort/` via `ort.env.wasm.wasmPaths`. Trocando `import.meta.url` por um base literal
// só nessas chamadas, o gatilho do `vite:asset-import-meta-url` some e o .wasm não é
// emitido. Roda com `enforce: 'pre'`, antes do plugin de assets do Vite.
function stripOrtDeadWasm(): Plugin {
  return {
    name: 'strip-ort-dead-wasm',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('onnxruntime-web') || !id.endsWith('.mjs')) return null
      if (!code.includes('ort-wasm-simd-threaded') || !code.includes('import.meta.url')) return null
      const out = code.replace(/new URL\(("ort-wasm-simd-threaded[^"]*\.wasm"), ?import\.meta\.url\)/g, 'new URL($1, "/ort/")')
      return out === code ? null : { code: out, map: null }
    },
  }
}

// Serve /ort/* CRU (antes da transform do Vite) — evita o ?import no .mjs do ORT.
function serveOrtRaw(): Plugin {
  return {
    name: 'serve-ort-raw',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (url.startsWith('/ort/')) {
          const file = path.join(process.cwd(), 'public', url)
          if (fs.existsSync(file)) {
            res.setHeader('Content-Type', url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript')
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
            fs.createReadStream(file).pipe(res)
            return
          }
        }
        next()
      })
    },
  }
}

// A EVA agora é servida pelo backend NestJS (POST /api/eva/chat, autenticado +
// rate-limited), que guarda a chave do EVA Hub. Não há mais proxy no Vite.

export default defineConfig(() => {
  return {
    plugins: [stripOrtDeadWasm(), react(), serveOrtRaw()],
    server: { port: 5173, host: true, headers: isolationHeaders },
    preview: { port: 5173, headers: isolationHeaders },
    // ORT é importado no swiftf0-worker → no build o worker é um bundle à parte e
    // NÃO herda `plugins`; precisa do stripOrtDeadWasm aqui pra tirar o .wasm morto.
    worker: { format: 'es' as const, plugins: () => [stripOrtDeadWasm()] },
    optimizeDeps: { exclude: ['onnxruntime-web'] },
  }
})
