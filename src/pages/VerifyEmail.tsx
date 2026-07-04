import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'
import { apiVerifyEmail, ApiError, isAuthed, patchCurrentUser } from '../data/api'
import { Icon } from '../components/ui/Icon'

type State = 'verifying' | 'ok' | 'error'

export default function VerifyEmail() {
  const [state, setState] = useState<State>('verifying')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || ''
    if (!token) {
      setState('error')
      setMsg('Link inválido — não encontramos o código de verificação.')
      return
    }
    apiVerifyEmail(token)
      .then(() => {
        patchCurrentUser({ emailVerified: true })
        setState('ok')
      })
      .catch((err) => {
        setState('error')
        setMsg(err instanceof ApiError ? err.friendly() : 'Não foi possível confirmar. O link pode ter expirado.')
      })
  }, [])

  return (
    <div className="auth">
      <div className="auth-aura" />
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="auth-logo">
            <Icon name="spark" size={20} />
          </span>
          <span className="auth-word">
            Cant<em>o</em>
          </span>
        </div>

        {state === 'verifying' && (
          <>
            <h1 className="auth-title">Confirmando seu e-mail…</h1>
            <p className="auth-sub">Um instante, estamos validando seu link.</p>
          </>
        )}

        {state === 'ok' && (
          <>
            <div className="auth-invite">
              <Icon name="check" size={16} />
              <span>E-mail confirmado com sucesso.</span>
            </div>
            <h1 className="auth-title">Tudo certo!</h1>
            <p className="auth-sub">Sua conta está verificada. Pode voltar a treinar.</p>
            <Link to={isAuthed() ? '/' : '/auth'} className="btn btn--primary auth-submit">
              {isAuthed() ? 'Ir para o app' : 'Entrar'}
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className="auth-title">Não deu para confirmar</h1>
            <p className="auth-error">{msg}</p>
            <p className="auth-sub" style={{ marginTop: 8 }}>
              Faça login e reenvie a confirmação pelas Configurações.
            </p>
            <Link to={isAuthed() ? '/config' : '/auth'} className="btn btn--primary auth-submit">
              {isAuthed() ? 'Ir para Configurações' : 'Entrar'}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
