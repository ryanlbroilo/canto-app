import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './app/AppContext'
import { AppShell } from './app/AppShell'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import RangeTest from './pages/RangeTest'
import Exercises from './pages/Exercises'
import ExercisePlayer from './pages/ExercisePlayer'
import Progress from './pages/Progress'
import Coach from './pages/Coach'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import './styles/index.css'

// Sem React.StrictMode: o StrictMode monta efeitos duas vezes em dev, o que
// dispararia getUserMedia / AudioContext em duplicidade.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProvider>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/praticar" element={<Practice />} />
          <Route path="/range" element={<RangeTest />} />
          <Route path="/exercicios" element={<Exercises />} />
          <Route path="/exercicios/:id" element={<ExercisePlayer />} />
          <Route path="/progresso" element={<Progress />} />
          <Route path="/eva" element={<Coach />} />
          <Route path="/config" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  </BrowserRouter>,
)
