import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import { useAuth } from '../app/AuthContext'
import { useApp } from '../app/AppContext'
import { ApiError } from '../data/api'
import { Icon } from '../components/ui/Icon'

const LAST_TENANT = 'canto.lastTenant.v1'

export default function Auth() {
  const { login, register } = useAuth()
  const { reload } = useApp()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tenantSlug, setTenantSlug] = useState(() => localStorage.getItem(LAST_TENANT) || '')
  const [tenantName, setTenantName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login({ tenantSlug: tenantSlug.trim().toLowerCase(), email: email.trim(), password })
        localStorage.setItem(LAST_TENANT, tenantSlug.trim().toLowerCase())
      } else {
        await register({ tenantName: tenantName.trim(), email: email.trim(), password, name: name.trim() || undefined })
      }
      reload()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.friendly() : 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-aura" />
      <form className="auth-card card" onSubmit={submit}>
        <div className="auth-brand">
          <span className="auth-logo">
            <Icon name="spark" size={20} />
          </span>
          <span className="auth-word">
            Cant<em>o</em>
          </span>
        </div>

        <h1 className="auth-title">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Entre para treinar e sincronizar seu progresso.'
            : 'Crie sua organização e comece a treinar. Sua voz fica no dispositivo — só as métricas viajam.'}
        </p>

        {mode === 'register' && (
          <label className="auth-field">
            <span>Organização</span>
            <input className="auth-input" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Meu estúdio" required minLength={2} autoComplete="organization" />
          </label>
        )}
        {mode === 'login' && (
          <label className="auth-field">
            <span>Organização (identificador)</span>
            <input className="auth-input" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="meu-estudio" required autoCapitalize="none" spellCheck={false} />
          </label>
        )}
        {mode === 'register' && (
          <label className="auth-field">
            <span>Seu nome</span>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamamos" autoComplete="name" />
          </label>
        )}
        <label className="auth-field">
          <span>E-mail</span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Senha</span>
          <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'mínimo 8 caracteres' : '••••••••'} required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
          {loading ? 'Um instante…' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
        </button>

        <p className="auth-switch">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button type="button" className="auth-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </form>
    </div>
  )
}
