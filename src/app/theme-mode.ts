// Gestão do tema claro/escuro (neutro) escolhido pelo usuário.
// O script inline em index.html já aplica o data-theme antes da pintura (anti-flash);
// este módulo cuida da troca em runtime, persistência e sincronização do canvas/meta.
import { refreshCanvasColors } from '../theme'

export type ThemeMode = 'light' | 'dark'
const KEY = 'canto-theme'

export function getTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme')
    if (attr === 'light' || attr === 'dark') return attr
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function applyDom(mode: ThemeMode): void {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.setAttribute('data-theme', mode)
  el.style.colorScheme = mode
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#17161a' : '#ffffff')
  refreshCanvasColors()
  window.dispatchEvent(new CustomEvent('themechange', { detail: mode }))
}

/** Boot: sincroniza meta + cores do canvas com o tema já aplicado pelo script inline. Não persiste. */
export function initTheme(): void {
  applyDom(getTheme())
}

export function setTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* storage indisponível — segue sem persistir */
  }
  applyDom(mode)
}

export function toggleTheme(): void {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}
