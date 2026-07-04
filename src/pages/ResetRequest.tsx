import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'
import { apiRequestReset } from '../data/api'
import { Icon } from '../components/ui/Icon'

const LAST_TENANT = 'canto.lastTenant.v1'

export default function ResetRequest() {
  const [tenantSlug, setTenantSlug] = useState(() => localStorage.getItem(LAST_TENANT) || '')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    // Nunca vaza existência: sempre mostramos a mesma confirmação.
    await apiRequestReset(tenantSlug.trim().toLowerCase(), email.trim()).catch(() => undefined)
    setLoading(false)
    setSent(true)
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

        {sent ? (
          <>
            <div className="auth-invite">
              <Icon name="check" size={16} />
              <span>Se essa conta existir, o link já está a caminho.</span>
            </div>
            <h1 className="auth-title">Verifique seu e-mail</h1>
            <p className="auth-sub">Enviamos as instruções para redefinir sua senha. O link expira em 1 hora.</p>
            <Link to="/auth" className="btn btn--primary auth-submit">
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Recuperar senha</h1>
            <p className="auth-sub">Informe sua organização e e-mail. Enviaremos um link para você criar uma nova senha.</p>

            <label className="auth-field">
              <span>Organização (identificador)</span>
              <input className="auth-input" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="meu-estudio" required autoCapitalize="none" spellCheck={false} />
            </label>
            <label className="auth-field">
              <span>E-mail</span>
              <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required autoComplete="email" />
            </label>

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>
            <p className="auth-switch">
              Lembrou a senha?{' '}
              <Link to="/auth" className="auth-link">
                Entrar
              </Link>
            </p>
          </>
        )}
      </form>
    </div>
  )
}
