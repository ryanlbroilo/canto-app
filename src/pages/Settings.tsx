import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { setProfile, setSettings } from '../data/store'
import { midiLabel } from '../audio/notes'
import { Icon } from '../components/ui/Icon'

export default function Settings() {
  const { engine, micStatus, profile, settings, baseline, reload } = useApp()
  const [name, setName] = useState(profile.name)
  const [goal, setGoal] = useState(profile.goal)
  const [gate, setGate] = useState(settings.noiseGate)
  const [fading, setFading] = useState(settings.fadingFeedback)
  const [guide, setGuide] = useState(settings.targetGuide)
  const [saved, setSaved] = useState(false)

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
        <span className="card-title">Dados</span>
        <div className="setting-row">
          <div>
            <div className="setting-label">Tudo fica no seu dispositivo</div>
            <div className="setting-desc">Seu áudio nunca sai do navegador. Range, sessões e preferências ficam só aqui neste aparelho.</div>
          </div>
          <button className="btn btn--danger btn--sm" onClick={resetAll}>
            Apagar meus dados
          </button>
        </div>
      </div>
    </div>
  )
}
