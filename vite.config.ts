import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

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

// Proxy da EVA (EVA Hub) — guarda a chave no servidor (nunca vai pro bundle).
// O frontend chama /api/eva/chat; aqui repassa para evahub.com.br com o Bearer.
// Config em .env.local: EVA_HUB_KEY=evh_live_... e EVA_ASSISTANT_ID=asst_...
function evaProxy(env: Record<string, string>): Plugin {
  return {
    name: 'eva-proxy',
    configureServer(server) {
      server.middlewares.use('/api/eva/chat', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'method not allowed' }))
          return
        }
        const key = env.EVA_HUB_KEY
        const assistantId = env.EVA_ASSISTANT_ID
        if (!key || !assistantId) {
          res.statusCode = 501 // não configurado → o Coach cai na prévia
          res.end(JSON.stringify({ error: 'EVA não configurada (defina EVA_HUB_KEY e EVA_ASSISTANT_ID em .env.local)' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
          const wantStream = !!body.stream
          const upstream = await fetch('https://evahub.com.br/api/v1/chat', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ assistant_id: assistantId, messages: body.messages ?? [], stream: wantStream }),
          })
          if (wantStream && upstream.ok && upstream.body) {
            // repassa o SSE cru para o cliente
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
            res.setHeader('Cache-Control', 'no-cache, no-transform')
            res.setHeader('Connection', 'keep-alive')
            Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream).pipe(res)
            return
          }
          // não-stream (ou upstream com erro): devolve JSON
          const text = await upstream.text()
          res.statusCode = upstream.status
          res.end(text)
        } catch (e) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'proxy error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // carrega .env* (inclusive não-VITE_) só no servidor
  return {
    plugins: [stripOrtDeadWasm(), react(), serveOrtRaw(), evaProxy(env)],
    server: { port: 5173, host: true, headers: isolationHeaders },
    preview: { port: 5173, headers: isolationHeaders },
    // ORT é importado no swiftf0-worker → no build o worker é um bundle à parte e
    // NÃO herda `plugins`; precisa do stripOrtDeadWasm aqui pra tirar o .wasm morto.
    worker: { format: 'es', plugins: () => [stripOrtDeadWasm()] },
    optimizeDeps: { exclude: ['onnxruntime-web'] },
  }
})
