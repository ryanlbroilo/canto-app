// Gera os ícones do app a partir de public/brand/eva-icon-1024.png + o favicon
// (anel "o") a partir de SVG. Rode: npm run gen:icons
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { writeFileSync } from 'node:fs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'brand', 'eva-icon-1024.png')
const pub = join(root, 'public')

async function resize(size, name) {
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(join(pub, name))
  console.log('  ✓', name, `(${size}×${size})`)
}

// Ícones do app — nomes que o manifest já referencia + apple-touch.
console.log('ícones do app:')
await resize(192, 'icon-192.png')
await resize(512, 'icon-512.png')
await resize(512, 'maskable-512.png') // o tile é full-bleed → serve de maskable
await resize(180, 'apple-touch-icon.png')

// Favicon = o anel de afinação ("o"): âmbar + ponto brasa. SVG + PNGs de fallback.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#F2A83B" stroke-width="16"/><circle cx="50" cy="50" r="14" fill="#E4572E"/></svg>`
writeFileSync(join(pub, 'favicon.svg'), faviconSvg)
console.log('favicon:')
console.log('  ✓ favicon.svg')
for (const s of [32, 48]) {
  await sharp(Buffer.from(faviconSvg)).resize(s, s).png().toFile(join(pub, `favicon-${s}.png`))
  console.log(`  ✓ favicon-${s}.png`)
}
console.log('pronto.')
