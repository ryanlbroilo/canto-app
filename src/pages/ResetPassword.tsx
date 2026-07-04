import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'
import { apiResetPassword, ApiError } from '../data/api'
import { Icon } from '../components/ui/Icon'

export default function ResetPassword() {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiResetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.friendly() : 'Não foi possível redefinir. O link pode ter expirado.')
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

        {done ? (
          <>
            <div className="auth-invite">
              <Icon name="check" size={16} />
              <span>Senha redefinida com sucesso.</span>
            </div>
            <h1 className="auth-title">Pronto!</h1>
            <p className="auth-sub">Por segurança, encerramos suas outras sessões. Entre com a nova senha.</p>
            <Link to="/auth" className="btn btn--primary auth-submit">
              Entrar
            </Link>
          </>
        ) : !token ? (
          <>
            <h1 className="auth-title">Link inválido</h1>
            <p className="auth-error">Não encontramos o código de redefinição. Peça um novo link.</p>
            <Link to="/recuperar" className="btn btn--primary auth-submit">
              Pedir novo link
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Nova senha</h1>
            <p className="auth-sub">Escolha uma senha forte — mínimo de 8 caracteres.</p>

            <label className="auth-field">
              <span>Nova senha</span>
              <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" required minLength={8} autoComplete="new-password" />
            </label>
            <label className="auth-field">
              <span>Confirmar senha</span>
              <input className="auth-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repita a senha" required minLength={8} autoComplete="new-password" />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Salvando…' : 'Redefinir senha'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
