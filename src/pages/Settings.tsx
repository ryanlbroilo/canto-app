import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { useAuth } from '../app/AuthContext'
import { setProfile, setSettings } from '../data/store'
import { midiLabel } from '../audio/notes'
import { apiDeleteMe, apiExportMyData, apiResendVerification } from '../data/api'
import { Icon } from '../components/ui/Icon'

export default function Settings() {
  const { engine, micStatus, profile, settings, baseline, reload } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile.name)
  const [goal, setGoal] = useState(profile.goal)
  const [gate, setGate] = useState(settings.noiseGate)
  const [fading, setFading] = useState(settings.fadingFeedback)
  const [guide, setGuide] = useState(settings.targetGuide)
  const [saved, setSaved] = useState(false)
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // medidor ao vivo para calibrar o gate
  const levelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    return engine.subscribe((f) => {
      if (levelRef.current) levelRef.current.style.width = `${Math.min(100, Math.round(f.rms * 320))}%`
    })
  }, [engine])
  useEffect(() => () => engine.stop(), [engine])

  function save() {
    setProfile({ name: name.trim(), goal: goal.trim() })
    setSettings({ noiseGate: gate, fadingFeedback: fading, targetGuide: guide })
    reload()
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function resetAll() {
    if (!confirm('Isso apaga seu range, sessões e configurações deste dispositivo. Continuar?')) return
    localStorage.clear()
    reload()
    location.href = '/'
  }

  async function doLogout() {
    await logout()
    navigate('/auth', { replace: true })
  }

  async function resendVerification() {
    if (resend === 'sending') return
    setResend('sending')
    await apiResendVerification().catch(() => undefined)
    setResend('sent')
  }

  // LGPD — portabilidade: baixa todos os dados da conta como JSON.
  async function exportData() {
    if (exporting) return
    setExporting(true)
    try {
      const data = await apiExportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'canto-meus-dados.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Não foi possível exportar agora. Tente novamente em instantes.')
    } finally {
      setExporting(false)
    }
  }

  // LGPD — exclusão: apaga a conta no servidor e limpa este dispositivo.
  async function deleteAccount() {
    if (deleting) return
    const first = confirm('Excluir sua conta apaga permanentemente seu progresso, sessões e métricas do servidor. Esta ação NÃO pode ser desfeita. Deseja continuar?')
    if (!first) return
    const typed = prompt('Para confirmar, digite EXCLUIR (em maiúsculas).')
    if (typed !== 'EXCLUIR') return
    setDeleting(true)
    try {
      await apiDeleteMe()
      localStorage.clear()
      navigate('/auth', { replace: true })
    } catch (err) {
      setDeleting(false)
      const isOwner = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 409
      alert(
        isOwner
          ? 'Você é o dono de uma organização com outros membros. Transfira a propriedade ou remova os membros antes de excluir sua conta.'
          : 'Não foi possível excluir agora. Tente novamente em instantes.',
      )
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-sub">Perfil, calibração do microfone e preferências de treino.</p>
        </div>
        <button className="btn btn--primary" onClick={save}>
          {saved ? (
            <>
              <Icon name="check" /> Salvo
            </>
          ) : (
            'Salvar'
          )}
        </button>
      </div>

      {user && (
        <div className="card reveal r0" style={{ marginBottom: 18 }}>
          <span className="card-title">Conta</span>
          <div className="setting-row">
            <div>
              <div className="setting-label">{user.email}</div>
              <div className="setting-desc">
                Organização <strong>{user.tenantSlug}</strong> · perfil {user.role.toLowerCase()}. Seu progresso sincroniza com esta conta.
              </div>
            </div>
            <button className="btn btn--sm" onClick={doLogout}>
              <Icon name="lock" /> Sair
            </button>
          </div>
        </div>
      )}

      {user && !user.emailVerified && (
        <div className="card reveal r0" style={{ marginBottom: 18, borderColor: 'rgba(233,180,76,0.35)', background: 'rgba(233,180,76,0.06)' }}>
          <div className="setting-row">
            <div>
              <div className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="mail" size={16} /> Confirme seu e-mail
              </div>
              <div className="setting-desc">
                Enviamos um link para <strong>{user.email}</strong>. Confirmar protege sua conta e libera a recuperação de senha.
              </div>
            </div>
            <button className="btn btn--sm btn--primary" onClick={resendVerification} disabled={resend === 'sending'}>
              {resend === 'sent' ? (
                <>
                  <Icon name="check" /> Enviado
                </>
              ) : resend === 'sending' ? (
                'Enviando…'
              ) : (
                'Reenviar'
              )}
            </button>
          </div>
        </div>
      )}

      <Link to="/planos" className="card reveal r0" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, textDecoration: 'none', color: 'inherit' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, flex: 'none', borderRadius: 12, color: 'var(--gold-2)', background: 'rgba(233,180,76,0.1)', border: '1px solid var(--hairline)' }}>
          <Icon name="bolt" size={20} />
        </span>
        <div style={{ flex: 1 }}>
          <div className="setting-label">Planos e assinatura</div>
          <div className="setting-desc">Desbloqueie o coach completo — EVA que explica, caminho ilimitado, saúde vocal e progresso a fundo.</div>
        </div>
        <Icon name="chevron" size={18} />
      </Link>

      <div className="grid grid-2">
        <div className="card reveal r0">
          <span className="card-title">Perfil</span>
          <div className="stack gap-3" style={{ marginTop: 14 }}>
            <label className="field">
              <span className="field-label">Seu nome</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamo?" />
            </label>
            <label className="field">
              <span className="field-label">Seu objetivo</span>
              <textarea className="textarea" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex.: cantar louvores no tom, soltar os agudos, afinar sem apoio…" />
            </label>
          </div>
        </div>

        <div className="card reveal r1">
          <span className="card-title">Voz</span>
          {baseline ? (
            <div className="stack gap-2" style={{ marginTop: 14 }}>
              <div className="row spread">
                <span className="muted">Extensão</span>
                <strong>
                  {midiLabel(baseline.lowMidi)} → {midiLabel(baseline.highMidi)}
                </strong>
              </div>
              <div className="row spread">
                <span className="muted">Tipo aproximado</span>
                <strong>{baseline.voiceType}</strong>
              </div>
              <Link to="/range" className="btn btn--block" style={{ marginTop: 8 }}>
                Refazer teste de range
              </Link>
            </div>
          ) : (
            <p className="hint" style={{ marginTop: 12 }}>
              Ainda não medido. <Link to="/range" style={{ color: 'var(--gold-2)' }}>Fazer teste →</Link>
            </p>
          )}
        </div>
      </div>

      <div className="card reveal r2" style={{ marginTop: 18 }}>
        <span className="card-title">Calibração do microfone</span>
        <div className="setting-row">
          <div>
            <div className="setting-label">Sensibilidade (gate de ruído)</div>
            <div className="setting-desc">Ajuste até o medidor abaixo reagir só à sua voz, não ao ruído do ambiente.</div>
          </div>
          <div className="stack gap-1" style={{ width: 200 }}>
            <input type="range" min={0.002} max={0.03} step={0.001} value={gate} onChange={(e) => setGate(Number(e.target.value))} style={{ accentColor: 'var(--gold)' }} />
            <div className="level">
              <div className="level-bar" ref={levelRef} />
            </div>
          </div>
        </div>
        <div className="row gap-2" style={{ marginTop: 12 }}>
          {micStatus === 'running' ? (
            <button className="btn btn--sm" onClick={() => engine.stop()}>
              Parar microfone
            </button>
          ) : (
            <button className="btn btn--sm btn--primary" onClick={() => engine.start()}>
              <Icon name="mic" /> Testar microfone
            </button>
          )}
        </div>
      </div>

      <div className="card reveal r3" style={{ marginTop: 18 }}>
        <span className="card-title">Preferências de treino</span>
        <div className="setting-row">
          <div>
            <div className="setting-label">Desmame do feedback (fading)</div>
            <div className="setting-desc">Reduz gradualmente o feedback visual para você aprender a afinar sem depender da tela (transferência).</div>
          </div>
          <div className="toggle" data-on={fading} onClick={() => setFading((v) => !v)} role="switch" aria-checked={fading} />
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Mostrar nota-guia</div>
            <div className="setting-desc">Exibe a nota-alvo durante os exercícios.</div>
          </div>
          <div className="toggle" data-on={guide} onClick={() => setGuide((v) => !v)} role="switch" aria-checked={guide} />
        </div>
      </div>

      <div className="card reveal r4" style={{ marginTop: 18 }}>
        <span className="card-title">Dados e privacidade</span>

        <div className="setting-row">
          <div>
            <div className="setting-label">Seu áudio nunca sai do dispositivo</div>
            <div className="setting-desc">
              O microfone é processado no navegador — só as métricas numéricas (afinação, registro, vibrato) sincronizam com sua conta. Leia a{' '}
              <Link to="/privacidade" style={{ color: 'var(--gold-2)' }}>Política de Privacidade</Link>.
            </div>
          </div>
        </div>

        {user && (
          <div className="setting-row">
            <div>
              <div className="setting-label">Exportar meus dados (LGPD)</div>
              <div className="setting-desc">Baixe tudo o que guardamos sobre você — perfil, sessões e métricas — em um arquivo JSON aberto.</div>
            </div>
            <button className="btn btn--sm" onClick={exportData} disabled={exporting}>
              <Icon name="download" /> {exporting ? 'Preparando…' : 'Exportar'}
            </button>
          </div>
        )}

        <div className="setting-row">
          <div>
            <div className="setting-label">Apagar a cópia local</div>
            <div className="setting-desc">Remove range, sessões e configurações guardadas apenas neste aparelho. Sua conta no servidor permanece.</div>
          </div>
          <button className="btn btn--sm" onClick={resetAll}>
            Limpar dispositivo
          </button>
        </div>

        {user && (
          <div className="setting-row">
            <div>
              <div className="setting-label" style={{ color: 'var(--off)' }}>Excluir minha conta</div>
              <div className="setting-desc">Apaga permanentemente sua conta e todos os dados no servidor. Esta ação não pode ser desfeita.</div>
            </div>
            <button className="btn btn--danger btn--sm" onClick={deleteAccount} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir conta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
