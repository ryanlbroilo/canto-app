/* Service worker do Canto — cache de app-shell conservador.
 * Regras de ouro: NUNCA cachear a API, NUNCA quebrar áudio/wasm.
 * - navegações: network-first, cai pro shell offline ('/').
 * - estáticos same-origin (GET): stale-while-revalidate.
 * - qualquer coisa em /api/ ou cross-origin: passa direto (sem cache).
 */
const VERSION = 'canto-v1'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Só mexemos com o próprio host. API e terceiros passam direto.
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Navegações (SPA): tenta a rede, cai pro shell '/' offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put('/', copy)).catch(() => undefined)
          return res
        })
        .catch(() => caches.match('/', { ignoreSearch: true }).then((r) => r || caches.match('/'))),
    )
    return
  }

  // Estáticos: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(ASSETS).then((c) => c.put(req, copy)).catch(() => undefined)
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
