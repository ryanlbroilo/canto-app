import { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './app/AppContext'
import { AuthProvider, useAuth } from './app/AuthContext'
import { AppShell } from './app/AppShell'
import { ErrorBoundary } from './app/ErrorBoundary'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import ResetRequest from './pages/ResetRequest'
import ResetPassword from './pages/ResetPassword'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import RangeTest from './pages/RangeTest'
import Exercises from './pages/Exercises'
import ExercisePlayer from './pages/ExercisePlayer'
import ReviewRunner from './pages/ReviewRunner'
import SaudeVocal from './pages/SaudeVocal'
import HarmonyTrainer from './pages/HarmonyTrainer'
import Ministerio from './pages/Ministerio'
import Comunidade from './pages/Comunidade'
import Musicas from './pages/Musicas'
import SongPlayer from './pages/SongPlayer'
import Karaoke from './pages/Karaoke'
import KaraokePlayer from './pages/KaraokePlayer'
import Planos from './pages/Planos'
import Progress from './pages/Progress'
import Team from './pages/Team'
import Coach from './pages/Coach'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import './styles/index.css'
import { initTheme } from './app/theme-mode'

// Sincroniza cores de canvas + meta com o tema aplicado pelo script inline (index.html).
initTheme()

// Portão de autenticação: exige login para as rotas do app.
function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="auth">
        <div className="auth-aura" />
      </div>
    )
  }
  if (status === 'anon') return <Navigate to="/bem-vindo" replace />
  return <>{children}</>
}

// Sem React.StrictMode: o StrictMode monta efeitos duas vezes em dev, o que
// dispararia getUserMedia / AudioContext em duplicidade.
// Root em singleton no window: o HMR reaproveita o mesmo root em vez de chamar
// createRoot() de novo no mesmo nó (o que dispara o warning do React 18).
const container = document.getElementById('root')!
const w = window as unknown as { __cantoRoot?: ReturnType<typeof createRoot> }
const root = w.__cantoRoot ?? (w.__cantoRoot = createRoot(container))
root.render(
  <ErrorBoundary>
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/bem-vindo" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verificar" element={<VerifyEmail />} />
          <Route path="/recuperar" element={<ResetRequest />} />
          <Route path="/redefinir" element={<ResetPassword />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/praticar" element={<Practice />} />
            <Route path="/range" element={<RangeTest />} />
            <Route path="/exercicios" element={<Exercises />} />
            <Route path="/exercicios/:id" element={<ExercisePlayer />} />
            <Route path="/revisao/unidade/:unitId" element={<ReviewRunner mode="unit" />} />
            <Route path="/revisao/espacada" element={<ReviewRunner mode="spaced" />} />
            <Route path="/saude" element={<SaudeVocal />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/aquecimento" element={<ReviewRunner mode="warmup" />} />
            <Route path="/desaquecimento" element={<ReviewRunner mode="cooldown" />} />
            <Route path="/harmonia" element={<HarmonyTrainer />} />
            <Route path="/musicas" element={<Musicas />} />
            <Route path="/musicas/:id" element={<SongPlayer />} />
            <Route path="/karaoke" element={<Karaoke />} />
            <Route path="/karaoke/:id" element={<KaraokePlayer />} />
            <Route path="/ministerio" element={<Ministerio />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/progresso" element={<Progress />} />
            <Route path="/time" element={<Team />} />
            <Route path="/eva" element={<Coach />} />
            <Route path="/config" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
  </ErrorBoundary>,
)

// PWA: registra o service worker só em produção (em dev, o HMR do Vite e o SW
// brigam). O SW nunca cacheia a API nem o áudio — ver public/sw.js.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
