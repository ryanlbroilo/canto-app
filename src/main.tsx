import { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './app/AppContext'
import { AuthProvider, useAuth } from './app/AuthContext'
import { AppShell } from './app/AppShell'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import RangeTest from './pages/RangeTest'
import Exercises from './pages/Exercises'
import ExercisePlayer from './pages/ExercisePlayer'
import ReviewRunner from './pages/ReviewRunner'
import SaudeVocal from './pages/SaudeVocal'
import HarmonyTrainer from './pages/HarmonyTrainer'
import Ministerio from './pages/Ministerio'
import Planos from './pages/Planos'
import Progress from './pages/Progress'
import Team from './pages/Team'
import Coach from './pages/Coach'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import './styles/index.css'

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
  if (status === 'anon') return <Navigate to="/auth" replace />
  return <>{children}</>
}

// Sem React.StrictMode: o StrictMode monta efeitos duas vezes em dev, o que
// dispararia getUserMedia / AudioContext em duplicidade.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
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
            <Route path="/ministerio" element={<Ministerio />} />
            <Route path="/progresso" element={<Progress />} />
            <Route path="/time" element={<Team />} />
            <Route path="/eva" element={<Coach />} />
            <Route path="/config" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>,
)
