import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

// Rede de segurança de produção: um erro de render em qualquer página não
// derruba o app inteiro numa tela branca — mostramos um fallback recuperável.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Em produção isto pode virar telemetria (Sentry etc.). Por ora, console.
    console.error('[Canto] erro não tratado:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="auth">
        <div className="auth-aura" />
        <div className="auth-card card" style={{ textAlign: 'center' }}>
          <h1 className="auth-title">Algo saiu do tom</h1>
          <p className="auth-sub">
            Encontramos um erro inesperado nesta tela. Seu progresso está salvo — recarregar costuma resolver.
          </p>
          <button className="btn btn--primary auth-submit" onClick={() => location.reload()}>
            Recarregar
          </button>
          <button
            className="auth-link"
            style={{ marginTop: 10 }}
            onClick={() => {
              location.href = '/'
            }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }
}
