import { useEffect, useState } from 'react'
import { getTheme, toggleTheme, type ThemeMode } from './theme-mode'

// Botão de alternância de tema. Reusa as classes do botão-ícone da topbar.
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getTheme())

  useEffect(() => {
    const onChange = () => setMode(getTheme())
    window.addEventListener('themechange', onChange)
    return () => window.removeEventListener('themechange', onChange)
  }, [])

  const alvo = mode === 'dark' ? 'claro' : 'escuro'
  return (
    <button
      className="btn btn--icon btn--ghost"
      onClick={toggleTheme}
      aria-label={`Mudar para o tema ${alvo}`}
      title={`Tema ${alvo}`}
    >
      <span aria-hidden="true" style={{ fontSize: '1.05rem', lineHeight: 1 }}>
        {mode === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  )
}
