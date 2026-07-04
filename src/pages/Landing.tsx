import { Link, useNavigate } from 'react-router-dom'
import '../styles/landing.css'
import { Icon } from '../components/ui/Icon'

// Landing pública (aquisição). Anônimo que abre o app cai aqui; CTAs levam ao
// cadastro/login. Reusa o design system (dourado/escuro, Fraunces). O visual do
// herói é o mesmo "anel de afinação" do ícone — coerência de marca.
export default function Landing() {
  const navigate = useNavigate()
  const goRegister = () => navigate('/auth?modo=criar')

  return (
    <div className="lp">
      {/* ---------- topo ---------- */}
      <header className="lp-nav">
        <div className="lp-brand">
          <span className="auth-logo">
            <Icon name="spark" size={18} />
          </span>
          <span className="auth-word">
            Cant<em>o</em>
          </span>
        </div>
        <Link to="/auth" className="lp-nav-login">
          Entrar
        </Link>
      </header>

      {/* ---------- herói ---------- */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">
            <Icon name="shield" size={14} /> Sua voz nunca sai do seu aparelho
          </span>
          <h1 className="lp-title">
            Afine sua voz.<br />
            <em>Todo dia.</em>
          </h1>
          <p className="lp-sub">
            O Canto ouve você cantar e te mostra, em tempo real, se está no tom — como um professor
            particular no bolso. Um caminho diário que vicia, um coach de IA que explica, e nada de
            gravar sua voz: tudo acontece no seu navegador.
          </p>
          <div className="lp-cta">
            <button className="btn btn--primary lp-cta-main" onClick={goRegister}>
              Começar grátis <Icon name="chevron" size={16} />
            </button>
            <Link to="/auth" className="btn lp-cta-alt">
              Já tenho conta
            </Link>
          </div>
          <p className="lp-note">Grátis para começar · sem cartão · funciona no celular e no computador</p>
        </div>

        <div className="lp-hero-art" aria-hidden="true">
          <div className="lp-ring lp-ring-3" />
          <div className="lp-ring lp-ring-2" />
          <div className="lp-ring lp-ring-1" />
          <div className="lp-ring-dot" />
        </div>
      </section>

      {/* ---------- como funciona ---------- */}
      <section className="lp-steps">
        <div className="lp-step card">
          <span className="lp-step-ico"><Icon name="wave" size={22} /></span>
          <h3>Feedback em tempo real</h3>
          <p>Cante e veja sua afinação nota a nota. O motor de áudio roda no aparelho — resposta instantânea, sem servidor no meio.</p>
        </div>
        <div className="lp-step card">
          <span className="lp-step-ico"><Icon name="route" size={22} /></span>
          <h3>Um caminho que vicia</h3>
          <p>Exercícios curtos, ofensiva diária, metas e ligas. No estilo dos apps de idioma — só que para a sua voz.</p>
        </div>
        <div className="lp-step card">
          <span className="lp-step-ico"><Icon name="spark" size={22} /></span>
          <h3>EVA, seu coach de IA</h3>
          <p>Depois de cada treino, a EVA explica o quê, o porquê e como melhorar — com base nos números da sua voz, não em achismo.</p>
        </div>
      </section>

      {/* ---------- moat / privacidade ---------- */}
      <section className="lp-privacy">
        <span className="lp-step-ico lp-privacy-ico"><Icon name="shield" size={26} /></span>
        <h2>O áudio é seu. Ponto.</h2>
        <p>
          Diferente de tudo por aí, o Canto <strong>não grava e não envia</strong> sua voz. O microfone
          é analisado ao vivo dentro do navegador; só viajam os números do resultado (afinação, registro,
          vibrato). Privacidade não é recurso — é o alicerce.
        </p>
      </section>

      {/* ---------- ministério / gospel ---------- */}
      <section className="lp-worship card">
        <div>
          <span className="lp-eyebrow"><Icon name="church" size={14} /> Feito para o louvor</span>
          <h2>Todo o time cantando no tom</h2>
          <p>
            Ligue seu ministério: cada voz treina seu naipe, o líder acompanha quem está pronto para o
            domingo, e a harmonia deixa de ser sorte. Aqueça, afine e suba junto.
          </p>
        </div>
        <button className="btn btn--primary" onClick={goRegister}>
          Criar conta do ministério <Icon name="chevron" size={16} />
        </button>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="lp-final">
        <h2>Sua próxima nota afinada começa agora.</h2>
        <button className="btn btn--primary lp-cta-main" onClick={goRegister}>
          Começar grátis <Icon name="chevron" size={16} />
        </button>
      </section>

      {/* ---------- rodapé ---------- */}
      <footer className="lp-foot">
        <span className="auth-word">Cant<em>o</em></span>
        <div className="lp-foot-links">
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/auth">Entrar</Link>
        </div>
        <span className="lp-foot-copy">Treino vocal com IA · sua voz, no seu aparelho.</span>
      </footer>
    </div>
  )
}
