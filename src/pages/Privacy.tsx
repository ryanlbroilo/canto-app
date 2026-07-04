import { Link } from 'react-router-dom'
import '../styles/auth.css'
import '../styles/legal.css'
import { isAuthed } from '../data/api'
import { Icon } from '../components/ui/Icon'

// Política de Privacidade (LGPD - Lei 13.709/2018). Rota pública /privacidade.
// O contato (privacidade@canto.app) e a razão social precisam ser confirmados
// pelo fundador antes do go-live — ver checklist.
export default function Privacy() {
  const back = isAuthed() ? '/config' : '/auth'
  return (
    <div className="legal">
      <div className="legal-card">
        <div className="legal-brand">
          <span className="auth-logo">
            <Icon name="spark" size={18} />
          </span>
          <span className="auth-word">
            Cant<em>o</em>
          </span>
        </div>

        <h1 className="legal-title">Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: julho de 2026 · em conformidade com a LGPD (Lei nº 13.709/2018)</p>

        <div className="legal-callout">
          <Icon name="shield" size={18} />
          <span>
            <strong>Sua voz nunca sai do seu dispositivo.</strong> Todo o processamento de áudio (afinação, registro, vibrato)
            acontece dentro do seu navegador. Nós recebemos apenas os números do resultado — nunca a gravação.
          </span>
        </div>

        <section>
          <h2>1. Quem somos</h2>
          <p>
            O Canto é uma plataforma de treino vocal com apoio de inteligência artificial. Para fins da LGPD, somos o
            controlador dos dados que você nos fornece. Dúvidas ou solicitações sobre seus dados podem ser enviadas para{' '}
            <a href="mailto:privacidade@canto.app">privacidade@canto.app</a>.
          </p>
        </section>

        <section>
          <h2>2. Quais dados tratamos</h2>
          <ul>
            <li>
              <strong>Conta:</strong> nome (opcional), e-mail, senha (armazenada apenas como hash, nunca em texto puro) e a
              organização à qual você pertence.
            </li>
            <li>
              <strong>Métricas de treino:</strong> resultados numéricos das suas sessões — precisão de afinação, extensão
              vocal, registro, vibrato, XP, ofensiva (streak) e histórico de exercícios.
            </li>
            <li>
              <strong>Uso do coach de IA (EVA):</strong> as mensagens que você troca com a EVA, para gerar as respostas de
              orientação.
            </li>
            <li>
              <strong>O que NÃO coletamos:</strong> nós não gravamos, não armazenamos e não transmitimos o áudio do seu
              microfone. O sinal é analisado ao vivo no dispositivo e descartado.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Para que usamos</h2>
          <ul>
            <li>Operar o app: autenticar você, salvar seu progresso e sincronizá-lo entre dispositivos.</li>
            <li>Personalizar o treino e a orientação da EVA ao seu nível.</li>
            <li>Permitir que líderes de organização acompanhem o progresso do time (quando você entra por convite).</li>
            <li>Segurança: prevenir fraude e abuso (ex.: limites de tentativas de login).</li>
          </ul>
        </section>

        <section>
          <h2>4. Base legal</h2>
          <p>
            Tratamos seus dados com base no <strong>consentimento</strong> (aceito no cadastro), na{' '}
            <strong>execução do contrato</strong> (prestar o serviço que você pediu) e no <strong>legítimo interesse</strong>{' '}
            para segurança e melhoria do produto. Você pode retirar o consentimento a qualquer momento excluindo sua conta.
          </p>
        </section>

        <section>
          <h2>5. Com quem compartilhamos</h2>
          <p>Não vendemos seus dados. Compartilhamos o mínimo necessário com operadores que sustentam o serviço:</p>
          <ul>
            <li>
              <strong>Coach de IA (EVA):</strong> suas mensagens ao coach são processadas por um provedor de modelo de
              linguagem, por meio do nosso servidor, apenas para gerar a resposta.
            </li>
            <li>
              <strong>Pagamentos:</strong> se você assinar um plano, os dados de cobrança são processados pela Stripe — nós
              não armazenamos números de cartão.
            </li>
            <li>Autoridades, quando exigido por lei.</li>
          </ul>
        </section>

        <section>
          <h2>6. Seus direitos</h2>
          <p>A LGPD garante a você, a qualquer momento e gratuitamente:</p>
          <ul>
            <li>
              <strong>Acesso e portabilidade:</strong> exportar todos os seus dados em formato aberto, direto nas
              Configurações do app.
            </li>
            <li>
              <strong>Exclusão:</strong> apagar sua conta e os dados associados, também nas Configurações.
            </li>
            <li>Correção de dados incompletos ou desatualizados.</li>
            <li>Revogar o consentimento e obter informação sobre o tratamento.</li>
          </ul>
        </section>

        <section>
          <h2>7. Segurança e retenção</h2>
          <p>
            Senhas são protegidas com hashing forte (argon2), sessões usam tokens com expiração e rotação, e o acesso é
            isolado por organização. Guardamos seus dados enquanto sua conta existir; ao excluí-la, removemos os dados
            pessoais associados, ressalvadas obrigações legais.
          </p>
        </section>

        <section>
          <h2>8. Cookies e armazenamento local</h2>
          <p>
            Usamos o armazenamento local do navegador para manter sua sessão e guardar preferências e uma cópia do seu
            progresso neste dispositivo. Não usamos cookies de rastreamento publicitário.
          </p>
        </section>

        <section>
          <h2>9. Alterações</h2>
          <p>
            Podemos atualizar esta política. Mudanças relevantes serão comunicadas no app. O uso continuado após a
            atualização representa concordância com a versão vigente.
          </p>
        </section>

        <Link to={back} className="btn btn--primary auth-submit" style={{ maxWidth: 260 }}>
          Voltar
        </Link>
      </div>
    </div>
  )
}
