import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import { useAuth } from '../app/AuthContext'
import { useApp } from '../app/AppContext'
import { ApiError, apiPreviewInvite, InvitePreview } from '../data/api'
import { Icon } from '../components/ui/Icon'

const LAST_TENANT = 'canto.lastTenant.v1'

export default function Auth() {
  const { login, register, registerWithInvite } = useAuth()
  const { reload } = useApp()
  const navigate = useNavigate()

  // A landing manda ?modo=criar pra já abrir no cadastro.
  const [mode, setMode] = useState<'login' | 'register'>(
    new URLSearchParams(window.location.search).get('modo') === 'criar' ? 'register' : 'login',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tenantSlug, setTenantSlug] = useState(() => localStorage.getItem(LAST_TENANT) || '')
  const [tenantName, setTenantName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)

  // Convite (?convite=TOKEN): professor/igreja convidando alguém pro time.
  const [inviteToken] = useState(() => new URLSearchParams(window.location.search).get('convite') || '')
  const [invite, setInvite] = useState<{ state: 'none' | 'loading' | 'valid' | 'invalid'; preview?: InvitePreview }>(
    { state: inviteToken ? 'loading' : 'none' },
  )
  const joining = invite.state === 'valid'

  useEffect(() => {
    if (!inviteToken) return
    apiPreviewInvite(inviteToken)
      .then((p) => {
        if (p.valid) {
          setInvite({ state: 'valid', preview: p })
          if (p.email) setEmail(p.email)
        } else {
          setInvite({ state: 'invalid', preview: p })
        }
      })
      .catch(() => setInvite({ state: 'invalid' }))
  }, [inviteToken])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    const creating = joining || mode === 'register'
    if (creating && !consent) {
      setError('Marque o aceite da Política de Privacidade para continuar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (joining) {
        await registerWithInvite({ token: inviteToken, email: email.trim(), password, name: name.trim() || undefined, consent })
      } else if (mode === 'login') {
        await login({ tenantSlug: tenantSlug.trim().toLowerCase(), email: email.trim(), password })
        localStorage.setItem(LAST_TENANT, tenantSlug.trim().toLowerCase())
      } else {
        await register({ tenantName: tenantName.trim(), email: email.trim(), password, name: name.trim() || undefined, consent })
      }
      reload()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.friendly() : 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  const roleWord = invite.preview?.role === 'ADMIN' ? 'co-líder' : 'membro'

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

        {invite.state === 'loading' && <p className="auth-sub">Verificando convite…</p>}

        {joining ? (
          <>
            <div className="auth-invite">
              <Icon name="route" size={16} />
              <span>
                Você foi convidado para <strong>{invite.preview?.tenantName}</strong> como {roleWord}.
              </span>
            </div>
            <h1 className="auth-title">Entrar no time</h1>
            <p className="auth-sub">Crie sua conta e comece a treinar com {invite.preview?.tenantName}.</p>
          </>
        ) : (
          <>
            {invite.state === 'invalid' && <p className="auth-error">Convite inválido ou expirado — você ainda pode entrar ou criar uma conta.</p>}
            <h1 className="auth-title">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
            <p className="auth-sub">
              {mode === 'login'
                ? 'Entre para treinar e sincronizar seu progresso.'
                : 'Crie sua organização e comece a treinar. Sua voz fica no dispositivo — só as métricas viajam.'}
            </p>
          </>
        )}

        {!joining && mode === 'register' && (
          <label className="auth-field">
            <span>Organização</span>
            <input className="auth-input" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Meu estúdio" required minLength={2} autoComplete="organization" />
          </label>
        )}
        {!joining && mode === 'login' && (
          <label className="auth-field">
            <span>Organização (identificador)</span>
            <input className="auth-input" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="meu-estudio" required autoCapitalize="none" spellCheck={false} />
          </label>
        )}
        {(joining || mode === 'register') && (
          <label className="auth-field">
            <span>Seu nome</span>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamamos" autoComplete="name" />
          </label>
        )}
        <label className="auth-field">
          <span>E-mail</span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required autoComplete="email" readOnly={joining && !!invite.preview?.email} />
        </label>
        <label className="auth-field">
          <span>Senha</span>
          <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={joining || mode === 'register' ? 'mínimo 8 caracteres' : '••••••••'} required minLength={joining || mode === 'register' ? 8 : 1} autoComplete={mode === 'login' && !joining ? 'current-password' : 'new-password'} />
        </label>

        {(joining || mode === 'register') && (
          <label className="auth-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              Li e aceito a{' '}
              <Link to="/privacidade" target="_blank" rel="noreferrer" className="auth-link">
                Política de Privacidade
              </Link>{' '}
              (LGPD).
            </span>
          </label>
        )}

        {!joining && mode === 'login' && (
          <p className="auth-forgot">
            <Link to="/recuperar" className="auth-link">
              Esqueci minha senha
            </Link>
          </p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
          {loading ? 'Um instante…' : joining ? 'Entrar no time' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
        </button>

        {!joining && (
          <p className="auth-switch">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button type="button" className="auth-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
