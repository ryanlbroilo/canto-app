import { Link } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { AudioBlob } from '../components/audio/AudioBlob'
import { Icon } from '../components/ui/Icon'
import { midiLabel } from '../audio/notes'

function greeting(name: string): string {
  const h = new Date().getHours()
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${part}, ${name.split(' ')[0]}` : part
}

function last7(days: string[]) {
  const today = new Date()
  const out: { key: string; label: string; done: boolean; today: boolean }[] = []
  const set = new Set(days)
  const wd = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ key, label: wd[d.getDay()], done: set.has(key), today: i === 0 })
  }
  return out
}

export default function Dashboard() {
  const { engine, baseline, profile, streak, sessions } = useApp()
  const week = last7(streak.days)
  const weekSessions = sessions.filter((s) => Date.now() - new Date(s.dateISO).getTime() < 7 * 864e5).length
  const octaves = baseline ? ((baseline.highMidi - baseline.lowMidi) / 12).toFixed(1) : '—'
  const lastSession = sessions[sessions.length - 1]

  return (
    <div className="page">
      {/* Hero */}
      <div className="card card--glow hero-card reveal r0" style={{ marginBottom: 18 }}>
        <div>
          <div className="hero-greet">{greeting(profile.name)} 🎙️</div>
          <p className="hero-sub">
            {baseline
              ? 'Pronto para treinar? Comece pelo aquecimento e mantenha sua ofensiva viva.'
              : 'Vamos começar medindo sua extensão vocal — leva menos de um minuto.'}
          </p>
          <div className="row gap-2 wrap">
            {baseline ? (
              <>
                <Link to="/exercicios" className="btn btn--primary">
                  <Icon name="play" /> Treinar agora
                </Link>
                <Link to="/praticar" className="btn">
                  <Icon name="mic" /> Prática livre
                </Link>
              </>
            ) : (
              <Link to="/onboarding" className="btn btn--primary">
                <Icon name="gauge" /> Fazer teste de range
              </Link>
            )}
          </div>
        </div>
        <AudioBlob engine={engine} size={168} />
      </div>

      <div className="grid grid-dash">
        {/* coluna esquerda */}
        <div className="stack gap-3">
          {/* stats */}
          <div className="stat-row">
            <div className="card reveal r1">
              <div className="stat">
                <div className="stat-value">
                  {streak.current}
                  <span style={{ fontSize: 16, color: 'var(--muted)' }}> {streak.current === 1 ? 'dia' : 'dias'}</span>
                </div>
                <div className="stat-label">Ofensiva atual 🔥</div>
              </div>
            </div>
            <div className="card reveal r2">
              <div className="stat">
                <div className="stat-value">{weekSessions}</div>
                <div className="stat-label">Sessões na semana</div>
              </div>
            </div>
            <div className="card reveal r3">
              <div className="stat">
                <div className="stat-value">
                  <span className="mono">{octaves}</span>
                </div>
                <div className="stat-label">Oitavas de extensão</div>
              </div>
            </div>
          </div>

          {/* semana */}
          <div className="card reveal r2">
            <div className="row spread" style={{ marginBottom: 14 }}>
              <span className="card-title">Sua semana</span>
              <span className="badge badge--gold">
                <Icon name="flame" size={13} /> recorde {streak.longest}d
              </span>
            </div>
            <div className="mini-cal">
              {week.map((d) => (
                <div key={d.key} className="mini-cal-day" data-done={d.done} data-today={d.today}>
                  {d.label}
                </div>
              ))}
            </div>
          </div>

          {/* rotina de hoje */}
          <div className="card reveal r3">
            <span className="card-title">Rotina sugerida de hoje</span>
            <div className="stack gap-2" style={{ marginTop: 14 }}>
              <RoutineRow icon="lungs" name="Respiração diafragmática" meta="2 min · aquecimento" to="/exercicios/respiracao" />
              <RoutineRow icon="wave" name="Sirene / lip trill" meta="3 min · conectar registros" to="/exercicios/sirene" />
              <RoutineRow icon="target" name="Escala maior" meta="4 min · precisão" to="/exercicios/escala-maior" />
            </div>
          </div>
        </div>

        {/* coluna direita */}
        <div className="stack gap-3">
          {/* range */}
          <div className="card reveal r2">
            <span className="card-title">Seu range</span>
            {baseline ? (
              <>
                <div className="row gap-2 center" style={{ justifyContent: 'center', margin: '16px 0 8px' }}>
                  <span className="range-note" style={{ fontSize: 38 }}>
                    {midiLabel(baseline.lowMidi)}
                  </span>
                  <span className="range-arrow">→</span>
                  <span className="range-note" style={{ fontSize: 38 }}>
                    {midiLabel(baseline.highMidi)}
                  </span>
                </div>
                <p className="hint center">
                  {baseline.voiceType} (aprox.){baseline.includesFalsetto ? ' · topo c/ falsete' : ''}
                </p>
                <Link to="/range" className="btn btn--block" style={{ marginTop: 12 }}>
                  Refazer teste
                </Link>
              </>
            ) : (
              <p className="hint" style={{ marginTop: 12 }}>
                Ainda não medido. <Link to="/onboarding" style={{ color: 'var(--gold-2)' }}>Fazer teste →</Link>
              </p>
            )}
          </div>

          {/* EVA tip */}
          <div className="card reveal r3">
            <div className="eva-tip">
              <span className="eva-avatar">
                <Icon name="spark" size={20} />
              </span>
              <div>
                <div className="row spread">
                  <strong>EVA</strong>
                  <span className="badge">prévia</span>
                </div>
                <p className="hint" style={{ marginTop: 6 }}>
                  {lastSession
                    ? `Na última sessão você acertou ${Math.round(lastSession.notesHitPct)}% das notas (desvio médio ${Math.round(lastSession.avgCentsDev)}¢). ${lastSession.notesHitPct > 70 ? 'Mandou bem — bora subir a dificuldade.' : 'Vamos focar em sustentar no centro hoje.'}`
                    : 'Assim que você treinar, eu analiso sua afinação e monto o próximo passo. Bora começar?'}
                </p>
                <Link to="/eva" className="btn btn--sm" style={{ marginTop: 10 }}>
                  Conversar com a EVA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoutineRow({ icon, name, meta, to }: { icon: 'lungs' | 'wave' | 'target'; name: string; meta: string; to: string }) {
  return (
    <Link to={to} className="card ex-card" style={{ padding: '12px 14px' }}>
      <span className="ex-icon" style={{ width: 40, height: 40 }}>
        <Icon name={icon} />
      </span>
      <div>
        <div className="ex-name" style={{ fontSize: 14.5 }}>
          {name}
        </div>
        <div className="ex-meta">{meta}</div>
      </div>
      <span className="ex-go">
        <Icon name="chevron" size={18} />
      </span>
    </Link>
  )
}
