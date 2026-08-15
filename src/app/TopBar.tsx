import { useLocation } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { useApp } from './AppContext'
import { ThemeToggle } from './ThemeToggle'

const TITLES: Record<string, string> = {
  '/': 'Início',
  '/praticar': 'Praticar',
  '/exercicios': 'Exercícios',
  '/range': 'Meu range',
  '/progresso': 'Progresso',
  '/eva': 'EVA Coach',
  '/config': 'Configurações',
}

function titleFor(pathname: string): string {
  if (pathname.startsWith('/exercicios/')) return 'Exercício'
  return TITLES[pathname] ?? 'Canto'
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const { micStatus, profile } = useApp()
  const live = micStatus === 'running'
  const initials = (profile.name || 'Canto').trim().slice(0, 1).toUpperCase()

  return (
    <header className="topbar">
      <div className="row gap-3">
        <button className="btn btn--icon btn--ghost menu-btn" onClick={onMenu} aria-label="Menu">
          <Icon name="menu" />
        </button>
        <span className="topbar-title">{titleFor(pathname)}</span>
      </div>
      <div className="topbar-actions">
        <ThemeToggle />
        <div className="mic-pill" data-live={live}>
          <span className="mic-dot" />
          {live ? 'microfone ao vivo' : 'microfone desligado'}
        </div>
        <div className="avatar" title={profile.name || 'Você'}>
          {initials}
        </div>
      </div>
    </header>
  )
}
