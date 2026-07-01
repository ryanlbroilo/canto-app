import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useApp } from './AppContext'
import { hasSeenOnboarding } from '../data/store'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { baseline } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Primeiro acesso: leva ao onboarding (uma vez).
  useEffect(() => {
    if (!baseline && !hasSeenOnboarding()) navigate('/onboarding', { replace: true })
  }, [baseline, navigate])

  // Fecha o menu mobile ao trocar de rota.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="shell">
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="main">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <div className="scroll">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
