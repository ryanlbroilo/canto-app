import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  AuthUserInfo,
  currentUser,
  isAuthed,
  LoginInput,
  RegisterInput,
} from '../data/api'
import { fetchServerSessions } from '../data/sync'
import { clearUserData, getProfile, mergeServerSessions, setProfile } from '../data/store'

type Status = 'loading' | 'anon' | 'authed'

interface AuthCtx {
  user: AuthUserInfo | null
  status: Status
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

// Após autenticar: adota o nome da conta (se vazio) e hidrata as sessões do backend.
async function afterAuth(user: AuthUserInfo): Promise<void> {
  const p = getProfile()
  if (!p.name) setProfile({ ...p, name: user.name || user.email.split('@')[0] })
  try {
    mergeServerSessions(await fetchServerSessions())
  } catch {
    /* offline — segue com o local */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserInfo | null>(currentUser())
  const [status, setStatus] = useState<Status>(isAuthed() ? 'loading' : 'anon')

  // Ao abrir com token salvo: valida em /me (e derruba se inválido).
  useEffect(() => {
    if (!isAuthed()) return
    apiMe()
      .then((u) => {
        setUser(u)
        setStatus('authed')
      })
      .catch(() => {
        setUser(null)
        setStatus('anon')
      })
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const u = await apiLogin(input)
    await afterAuth(u)
    setUser(u)
    setStatus('authed')
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const u = await apiRegister(input)
    await afterAuth(u)
    setUser(u)
    setStatus('authed')
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    clearUserData()
    setUser(null)
    setStatus('anon')
  }, [])

  return <Ctx.Provider value={{ user, status, login, register, logout }}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth deve estar dentro de <AuthProvider>')
  return c
}
