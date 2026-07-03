import { NavLink } from 'react-router-dom'
import { Icon, IconName } from '../components/ui/Icon'
import { EXERCISES } from '../data/exercises'
import { useEntitlement } from '../hooks/useEntitlement'
import { useApp } from './AppContext'

interface NavItem {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const TREINO: NavItem[] = [
  { to: '/praticar', label: 'Praticar', icon: 'mic' },
  { to: '/exercicios', label: 'Exercícios', icon: 'dumbbell' },
  { to: '/harmonia', label: 'Harmonia', icon: 'music' },
  { to: '/musicas', label: 'Músicas', icon: 'note' },
  { to: '/range', label: 'Meu range', icon: 'gauge' },
  { to: '/saude', label: 'Saúde vocal', icon: 'lungs' },
]
const ACOMP: NavItem[] = [
  { to: '/progresso', label: 'Progresso', icon: 'chart' },
  { to: '/comunidade', label: 'Comunidade', icon: 'medal' },
  { to: '/ministerio', label: 'Ministério', icon: 'church' },
  { to: '/time', label: 'Meu time', icon: 'crown' },
  { to: '/eva', label: 'EVA Coach', icon: 'spark' },
]

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { streak, gamification } = useApp()
  const { allowed: canMinistry } = useEntitlement('team_admin')

  const link = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      onClick={onNavigate}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {item.to === '/exercicios' && <span className="nav-badge">{EXERCISES.length}</span>}
      {item.to === '/ministerio' && !canMinistry && <span className="nav-badge" style={{ opacity: 0.7 }}><Icon name="lock" size={11} /></span>}
    </NavLink>
  )

  return (
    <aside className="sidebar" data-open={open}>
      <div className="brand">
        <span className="brand-mark">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#241a08" strokeWidth="2.1" strokeLinecap="round">
            <path d="M2 12h3l2-7 3.5 15 3.5-19 3 15 2-4h3" />
          </svg>
        </span>
        <span className="brand-name">
          Cant<em>o</em>
        </span>
      </div>

      <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={onNavigate}>
        <Icon name="home" />
        <span>Início</span>
      </NavLink>

      <div className="nav-section">Treino</div>
      {TREINO.map(link)}

      <div className="nav-section">Acompanhamento</div>
      {ACOMP.map(link)}

      <div className="sidebar-foot">
        <NavLink to="/config" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={onNavigate}>
          <Icon name="settings" />
          <span>Configurações</span>
        </NavLink>
        <div className="nav-link" style={{ cursor: 'default' }}>
          <Icon name="bolt" />
          <span>Nível {gamification.level}</span>
          <span className="nav-badge" style={{ color: '#e9b44c' }}>
            {gamification.xpIntoLevel}/{gamification.xpForNext} XP
          </span>
        </div>
        <div className="nav-link" style={{ cursor: 'default' }}>
          <Icon name="flame" />
          <span>Ofensiva</span>
          <span className="nav-badge">{streak.current} {streak.current === 1 ? 'dia' : 'dias'}</span>
        </div>
      </div>
    </aside>
  )
}
