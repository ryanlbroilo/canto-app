import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { usePitchEngine } from '../hooks/usePitchEngine'
import { PitchEngine, EngineStatus } from '../audio/PitchEngine'
import { GamificationState, Profile, Settings, SessionRecord, Streak, VocalBaseline } from '../data/types'
import {
  getBaseline,
  getProfile,
  getSettings,
  getSessions,
  getStreak,
  getGamification,
  getFreezeState,
  reconcileStreak,
  type FreezeState,
} from '../data/store'

interface AppCtx {
  engine: PitchEngine
  micStatus: EngineStatus
  baseline: VocalBaseline | null
  profile: Profile
  settings: Settings
  streak: Streak
  /** Protetor de ofensiva (streak freeze) — exposto pelo contexto (fonte única) */
  freeze: FreezeState
  sessions: SessionRecord[]
  /** Estado agregado de gamificação (XP, nível, skills, conquistas, recomendação) */
  gamification: GamificationState
  /** Re-lê tudo do store (chamar após salvar) */
  reload: () => void
}

const Ctx = createContext<AppCtx | null>(null)

function loadAll() {
  // Ponto explícito de reconciliação do protetor de ofensiva (grava só se mudar);
  // depois streak/freeze são leituras PURAS do estado já reconciliado.
  reconcileStreak()
  return {
    baseline: getBaseline(),
    profile: getProfile(),
    settings: getSettings(),
    streak: getStreak(),
    freeze: getFreezeState(),
    sessions: getSessions(),
    gamification: getGamification(),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { engine, status } = usePitchEngine()
  const [data, setData] = useState(loadAll)
  const reload = useCallback(() => setData(loadAll()), [])

  // Calibra o estimador de registro com a extensão medida (passaggio pessoal).
  useEffect(() => {
    if (data.baseline) engine.setRange(data.baseline.lowMidi, data.baseline.highMidi)
  }, [engine, data.baseline])

  return <Ctx.Provider value={{ engine, micStatus: status, ...data, reload }}>{children}</Ctx.Provider>
}

export function useApp(): AppCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp deve ser usado dentro de <AppProvider>')
  return c
}
