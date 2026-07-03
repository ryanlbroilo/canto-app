// CARD COMPARTILHÁVEL (UGC) — 100% device-local. O áudio NUNCA sai do aparelho
// (moat); o que se compartilha é o RESULTADO em números. Gera um PNG a partir de
// um SVG desenhado na hora (sem libs externas) e usa Web Share quando disponível,
// caindo pro download da imagem. Nada vai pra servidor.

export interface ShareStat {
  label: string
  value: string
}
export interface ShareCardData {
  /** rótulo pequeno no topo, ex.: "MEU ENCAIXE" */
  eyebrow: string
  /** número/valor gigante, ex.: "92%" ou "14" */
  big: string
  /** legenda do número, ex.: "de encaixe" */
  bigLabel: string
  /** título (nome do exercício, do drill, ou frase) */
  title: string
  /** até 3 mini-stats na base */
  stats: ShareStat[]
  /** nome do cantor (opcional) */
  name?: string
}

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

/** Monta o SVG do card (1080×1080, quadrado social). Cores inline (o SVG→canvas
 * não enxerga as CSS vars nem as fontes do app; usamos famílias do sistema). */
export function buildShareSvg(d: ShareCardData): string {
  const stats = d.stats.slice(0, 3)
  const statW = 300
  const statsSvg = stats
    .map((s, i) => {
      const x = 540 + (i - (stats.length - 1) / 2) * statW
      return `<text x="${x}" y="905" text-anchor="middle" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#f3cd73">${esc(s.value)}</text><text x="${x}" y="952" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#ab9d86">${esc(s.label)}</text>`
    })
    .join('')
  const name = d.name
    ? `<text x="540" y="262" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#ab9d86">${esc(d.name)}</text>`
    : ''
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15100a"/><stop offset="1" stop-color="#0a0907"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.62"><stop offset="0" stop-color="#e9b44c" stop-opacity="0.20"/><stop offset="1" stop-color="#e9b44c" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#glow)"/>
  <rect x="28" y="28" width="1024" height="1024" rx="40" fill="none" stroke="#e9b44c" stroke-opacity="0.18" stroke-width="2"/>
  <g transform="translate(450,108)"><path d="M0 26 h26 l16 -52 l30 118 l30 -150 l26 118 l16 -34 h26" fill="none" stroke="#e9b44c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>
  <text x="540" y="220" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#f3cd73" letter-spacing="1">Canto</text>
  ${name}
  <text x="540" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" letter-spacing="10" fill="#c9a24a">${esc(d.eyebrow.toUpperCase())}</text>
  <text x="540" y="600" text-anchor="middle" font-family="Georgia, serif" font-size="230" font-weight="800" fill="#f3cd73">${esc(d.big)}</text>
  <text x="540" y="672" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#ab9d86">${esc(d.bigLabel)}</text>
  <text x="540" y="764" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-weight="600" fill="#f5eddd">${esc(d.title)}</text>
  ${statsSvg}
  <text x="540" y="1014" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#8a7c64">treine sua voz · Canto</text>
</svg>`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('falha ao renderizar o SVG'))
    img.src = src
  })
}

/** Renderiza o card como PNG (Blob) via SVG→canvas. */
export async function renderCardPng(d: ShareCardData, size = 1080): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([buildShareSvg(d)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d indisponível')
    ctx.drawImage(img, 0, 0, size, size)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob nulo'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'failed'

/** Compartilha o card: Web Share (mobile) quando dá, senão baixa a imagem. */
export async function shareCard(d: ShareCardData, filename = 'canto.png'): Promise<ShareResult> {
  let blob: Blob
  try {
    blob = await renderCardPng(d)
  } catch (e) {
    console.error('[shareCard] falha ao gerar', e)
    return 'failed'
  }
  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data?: unknown) => boolean; share?: (data?: unknown) => Promise<void> }
  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Canto', text: `${d.eyebrow}: ${d.big}` })
      return 'shared'
    } catch (e) {
      // usuário cancelou o share nativo — não é erro: volta ao estado neutro (não força download)
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      // erro real do share → cai pro download
    }
  }
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    // adia o revoke: alguns navegadores (Firefox) abortam o download se o URL
    // for revogado no mesmo tick do click.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return 'downloaded'
  } catch (e) {
    console.error('[shareCard] falha ao baixar', e)
    return 'failed'
  }
}
