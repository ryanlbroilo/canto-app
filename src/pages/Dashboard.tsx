import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { AudioBlob } from '../components/audio/AudioBlob'
import { Icon } from '../components/ui/Icon'
import type { IconName } from '../components/ui/Icon'
import { midiLabel } from '../audio/notes'
import { SKILL_BY_ID } from '../data/skills'
import { TRACKS, trackForLevel } from '../data/tracks'
import { ACHIEVEMENTS } from '../data/achievements'
import { getExercise } from '../data/exercises'
import { getFreezeState } from '../data/store'
import { useEntitlement } from '../hooks/useEntitlement'
import type { ExerciseKind, TrackLevel } from '../data/types'

// ---------- helpers de apresentação ----------

function greeting(name: string): string {
  const h = new Date().getHours()
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${part}, ${name.split(' ')[0]}` : part
}

// Cada tipo de exercício ganha um ícone próprio no card de próximo passo / trilha.
const KIND_ICON: Record<ExerciseKind, IconName> = {
  breathing: 'lungs',
  siren: 'wave',
  scale: 'music',
  interval: 'target',
  sustain: 'gauge',
}

// Nível numérico de gamificação → nível da trilha (currículo tem 3 faixas).
// 1–2 iniciante, 3–4 intermediário, 5+ avançado. Simples e honesto.
function trackLevelFor(level: number): TrackLevel {
  if (level >= 5) return 'avancado'
  if (level >= 3) return 'intermediario'
  return 'iniciante'
}

// Mini-calendário: os últimos 7 dias, marcando os praticados e o de hoje.
function last7(days: string[]) {
  const today = new Date()
  const set = new Set(days)
  const wd = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const out: { key: string; label: string; done: boolean; today: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ key, label: wd[d.getDay()], done: set.has(key), today: i === 0 })
  }
  return out
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export default function Dashboard() {
  const { engine, baseline, profile, streak, sessions, gamification } = useApp()
  const { totalXp, level, xpIntoLevel, xpForNext, skills, achievements, recommendation, exercisesDone } =
    gamification
  const { allowed: canMinistry } = useEntitlement('team_admin')
  const freeze = getFreezeState()

  const isNew = sessions.length === 0
  const week = last7(streak.days)
  const weekSessions = sessions.filter((s) => Date.now() - new Date(s.dateISO).getTime() < 7 * 864e5).length
  const octaves = baseline ? ((baseline.highMidi - baseline.lowMidi) / 12).toFixed(1) : '—'

  // Progresso de XP dentro do nível (0..1) para a barra do hero.
  const xpPct = xpForNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 0

  // --- Trilha ativa (derivada do nível) ---
  const trackLevel = trackLevelFor(level)
  const track = trackForLevel(trackLevel)
  // Um exercício da trilha está "dominado" quando a melhor pontuação ≥ 90.
  const dominated = (id: string) => (exercisesDone[id]?.bestScore ?? 0) >= 90
  const trackDone = track.exerciseIds.filter(dominated).length
  const trackPct = track.exerciseIds.length
    ? Math.round((trackDone / track.exerciseIds.length) * 100)
    : 0
  // Próximo passo da trilha: primeiro exercício ainda não dominado.
  const nextTrackId = track.exerciseIds.find((id) => !dominated(id))
  // A trilha do nível é o currículo inteiro (dezenas de nós). Na home mostramos
  // só uma JANELA ao redor de onde o cantor está (estilo Duolingo) — o caminho
  // completo vive na página de Exercícios. Sem isso, 80+ passos se empilham.
  const STEP_WINDOW = 5
  const nextIdx = track.exerciseIds.findIndex((id) => id === nextTrackId)
  const anchor = nextIdx < 0 ? track.exerciseIds.length - STEP_WINDOW : nextIdx - 1
  const stepStart = Math.max(0, Math.min(anchor, track.exerciseIds.length - STEP_WINDOW))
  const stepWindow = track.exerciseIds.slice(stepStart, stepStart + STEP_WINDOW)
  const stepsRemaining = Math.max(0, track.exerciseIds.length - (stepStart + STEP_WINDOW))

  // --- Próximo passo adaptativo (o coração da home) ---
  // Usa a recomendação da gamificação; se ela não existir (usuário sem sessões
  // ou sem relatório), cai para o 1º passo da trilha do nível — sempre há um CTA.
  const recId = recommendation?.exerciseId ?? nextTrackId ?? track.exerciseIds[0]
  const recEx = recId ? getExercise(recId) : undefined
  const recReason =
    recommendation?.reason ??
    (isNew
      ? 'Comece por aqui: um aquecimento curto para o EVA ouvir sua voz e montar seu plano.'
      : 'Continue de onde parou na sua trilha — este é o próximo passo do currículo.')
  const recTag = recommendation?.tag ?? 'começar'

  // --- Missão do dia (honesta, derivada das sessões) ---
  const didToday = streak.days.includes(todayKey())
  const mission = didToday
    ? { title: 'Missão cumprida hoje ✦', sub: 'Você já treinou hoje — sua ofensiva segue viva.' }
    : {
        title: 'Faça 1 exercício hoje',
        sub: 'Poucos minutos bastam para manter a ofensiva e destravar XP.',
      }

  // --- Conquistas ---
  const unlockedSet = new Set(achievements)
  const unlockedCount = unlockedSet.size

  return (
    <div className="page">
      <div className="dsh">
        {/* ============ HERO com XP / nível ============ */}
        <div className="card card--glow dsh-hero reveal r0">
          <div className="dsh-hero-body">
            <div className="dsh-eyebrow">
              <Icon name="spark" size={14} /> Seu estúdio
            </div>
            <h1 className="dsh-greet">
              {greeting(profile.name)} <span className="dsh-wave">🎙️</span>
            </h1>
            <p className="dsh-sub">
              {isNew
                ? 'Bem-vindo ao Canto. Vamos ouvir sua voz e montar um plano só seu — leva poucos minutos.'
                : 'Pronto para treinar? Seu próximo passo já está escolhido logo abaixo.'}
            </p>

            {/* barra de XP / nível */}
            <div className="dsh-xp">
              <div className="dsh-xp-top">
                <div className="dsh-level">
                  <span className="dsh-level-badge">{level}</span>
                  <span className="dsh-level-label">
                    nível
                    <b>Nível {level}</b>
                  </span>
                </div>
                <span className="dsh-xp-count">
                  <b>{xpIntoLevel}</b> / {xpForNext} XP p/ nível {level + 1}
                </span>
              </div>
              <div className="dsh-xp-track" role="progressbar" aria-valuenow={xpPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="dsh-xp-fill" style={{ width: `${Math.max(xpPct, 2)}%` }} />
              </div>
              <span className="dsh-xp-count" style={{ marginTop: 2 }}>
                {totalXp} XP no total
              </span>
            </div>

            <div className="dsh-hero-actions">
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

          <div className="dsh-blob-wrap">
            <AudioBlob engine={engine} size={172} />
          </div>
        </div>

        {/* ============ COLUNA ESQUERDA ============ */}
        <div className="dsh-col">
          {/* Próximo passo (adaptativo) — destaque */}
          <div className="card dsh-next reveal r1">
            <div className="dsh-next-head">
              <span className="dsh-next-eyebrow">Próximo passo</span>
              {recTag && (
                <span className="badge badge--gold">
                  <Icon name="bolt" size={12} /> {recTag}
                </span>
              )}
            </div>

            {recEx ? (
              <>
                <div className="dsh-next-main">
                  <span className="dsh-next-icon">
                    <Icon name={KIND_ICON[recEx.kind]} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="dsh-next-title">{recEx.name}</div>
                    <div className="dsh-next-meta">
                      <span>{recEx.durationMin} min</span>
                      <span className="faint">·</span>
                      <span>{recEx.focus}</span>
                    </div>
                  </div>
                </div>

                <p className="dsh-next-reason">
                  <span className="dsh-eva-mark">EVA:</span> {recReason}
                </p>

                <Link to={`/exercicios/${recEx.id}`} className="btn btn--primary btn--block">
                  <Icon name="play" /> Começar
                </Link>
              </>
            ) : (
              <p className="hint">Assim que você fizer o teste de range, monto seu primeiro passo.</p>
            )}
          </div>

          {/* Trilha ativa */}
          <div className="card reveal r2">
            <div className="dsh-track-head">
              <div>
                <span className="card-title">Sua trilha</span>
                <div className="dsh-track-name">{track.name}</div>
              </div>
              <span className="badge badge--gold">
                <Icon name="route" size={12} /> {trackLevel}
              </span>
            </div>
            <p className="dsh-track-hint">{track.hint}</p>

            <div className="dsh-track-bar-row">
              <div className="bar" style={{ flex: 1 }}>
                <div className="bar-fill" style={{ width: `${trackPct}%` }} />
              </div>
              <span className="dsh-xp-count">
                <b>{trackDone}</b>/{track.exerciseIds.length}
              </span>
            </div>

            {/* mini-caminho serpenteado: uma janela ao redor do próximo passo,
                com o nó ativo em destaque ("Continuar") — estilo Duolingo home. */}
            <div className="dsh-mpath">
              {stepWindow.map((id, i) => {
                const ex = getExercise(id)
                if (!ex) return null
                const state = dominated(id) ? 'done' : id === nextTrackId ? 'next' : 'todo'
                return (
                  <Link key={id} to={`/exercicios/${id}`} className="dsh-mp-node" data-state={state} data-side={i % 2 === 0 ? 'l' : 'r'} title={ex.name}>
                    <span className="dsh-mp-name">{ex.name}</span>
                    <span className="dsh-mp-dot">
                      {state === 'next' && <span className="dsh-mp-cta">Continuar</span>}
                      <Icon name={state === 'done' ? 'check' : KIND_ICON[ex.kind]} size={16} />
                    </span>
                  </Link>
                )
              })}
            </div>
            {stepsRemaining > 0 && (
              <Link to="/exercicios" className="dsh-link" style={{ marginTop: 10, display: 'inline-flex' }}>
                ver o caminho completo · +{stepsRemaining} nós <Icon name="chevron" size={14} />
              </Link>
            )}
          </div>

          {/* Skills (mini) */}
          <div className="card reveal r3">
            <div className="dsh-sec-head">
              <span className="card-title">Suas competências</span>
              <Link to="/progresso" className="dsh-link">
                ver progresso <Icon name="chevron" size={14} />
              </Link>
            </div>
            <div className="dsh-skills">
              {skills.map((sp) => {
                const meta = SKILL_BY_ID[sp.id]
                if (!meta) return null
                return (
                  <span className="dsh-skill" key={sp.id} title={meta.short}>
                    <span className="dsh-skill-orb" style={{ background: meta.color }}>
                      <Icon name={meta.icon} />
                    </span>
                    <span className="dsh-skill-name">{meta.name}</span>
                    <span className="dsh-skill-lvl">N{sp.level}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Conquistas */}
          <div className="card reveal r4">
            <div className="dsh-sec-head">
              <span className="card-title">Conquistas</span>
              <span className="dsh-ach-count">
                {unlockedCount}/{ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="dsh-ach-grid">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = unlockedSet.has(a.id)
                return (
                  <div
                    className="dsh-ach"
                    key={a.id}
                    data-unlocked={unlocked}
                    title={`${a.label} — ${a.desc}`}
                  >
                    <span className="dsh-ach-medal">
                      <Icon name={a.icon} />
                      {!unlocked && (
                        <span className="dsh-ach-lock">
                          <Icon name="lock" size={10} />
                        </span>
                      )}
                    </span>
                    <span className="dsh-ach-label">{a.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ============ COLUNA DIREITA ============ */}
        <div className="dsh-col">
          {/* Missão do dia */}
          <div className="card reveal r1" data-done={didToday}>
            <span className="card-title">Missão do dia</span>
            <div className="dsh-mission" data-done={didToday} style={{ marginTop: 14 }}>
              <span className="dsh-mission-check">
                <Icon name={didToday ? 'check' : 'target'} size={22} />
              </span>
              <div className="dsh-mission-body">
                <div className="dsh-mission-title">{mission.title}</div>
                <div className="dsh-mission-sub">{mission.sub}</div>
              </div>
            </div>
          </div>

          {/* Streak + números */}
          <div className="card reveal r2">
            <div className="dsh-sec-head">
              <span className="card-title">Sua semana</span>
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                {freeze.available > 0 && (
                  <span className="badge" title="Protetor de ofensiva — cobre 1 dia perdido automaticamente" style={{ color: 'var(--info)' }}>
                    <Icon name="shield" size={12} /> {freeze.available}
                  </span>
                )}
                <span className="badge badge--gold">
                  <Icon name="flame" size={13} /> recorde {streak.longest}d
                </span>
              </span>
            </div>
            <div className="dsh-stat-row" style={{ marginTop: 14 }}>
              <div className="dsh-stat">
                <div className="dsh-stat-value dsh-flame">
                  {streak.current}
                  <span className="dsh-unit">{streak.current === 1 ? 'dia' : 'dias'}</span>
                </div>
                <div className="dsh-stat-label">Ofensiva 🔥</div>
              </div>
              <div className="dsh-stat">
                <div className="dsh-stat-value">{weekSessions}</div>
                <div className="dsh-stat-label">Sessões</div>
              </div>
              <div className="dsh-stat">
                <div className="dsh-stat-value">
                  <span className="mono">{octaves}</span>
                </div>
                <div className="dsh-stat-label">Oitavas</div>
              </div>
            </div>
            <hr className="dsh-hr" />
            <div className="dsh-week">
              {week.map((d) => (
                <div key={d.key} className="dsh-day" data-done={d.done} data-today={d.today}>
                  {d.label}
                </div>
              ))}
            </div>
            <Link to="/comunidade" className="dsh-link" style={{ marginTop: 12, display: 'inline-flex' }}>
              ver a liga do ministério <Icon name="chevron" size={14} />
            </Link>
          </div>

          {/* Range */}
          <div className="card reveal r3">
            <span className="card-title">Seu range</span>
            {baseline ? (
              <>
                <div className="dsh-range-notes">
                  <span className="dsh-range-note">{midiLabel(baseline.lowMidi)}</span>
                  <span className="dsh-range-arrow">→</span>
                  <span className="dsh-range-note">{midiLabel(baseline.highMidi)}</span>
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
                Ainda não medido.{' '}
                <Link to="/onboarding" style={{ color: 'var(--gold-2)' }}>
                  Fazer teste →
                </Link>
              </p>
            )}
          </div>

          {/* EVA */}
          <div className="card reveal r4">
            <div className="dsh-eva">
              <span className="dsh-eva-avatar">
                <Icon name="spark" size={20} />
              </span>
              <div className="dsh-eva-body">
                <div className="row spread">
                  <strong>EVA</strong>
                  <span className="badge">prévia</span>
                </div>
                <p className="hint" style={{ marginTop: 6 }}>
                  {isNew
                    ? 'Assim que você treinar, eu analiso sua afinação e ajusto o próximo passo. Bora começar?'
                    : recommendation
                      ? recommendation.reason
                      : 'Continue treinando — a cada sessão eu refino seu plano.'}
                </p>
                <Link to="/eva" className="btn btn--sm" style={{ marginTop: 10 }}>
                  Conversar com a EVA
                </Link>
              </div>
            </div>
          </div>

          {/* Harmonia & ministério */}
          <div className="card reveal r4">
            <span className="card-title">Cante em harmonia</span>
            <p className="hint" style={{ marginTop: 6 }}>
              Ache sua voz na harmonia: cante sua terça, quinta ou oitava contra uma referência e sinta o encaixe travar.
            </p>
            <Link to="/harmonia" className="btn btn--sm btn--primary btn--block" style={{ marginTop: 12 }}>
              <Icon name="music" /> Treinar harmonia
            </Link>
            <Link to="/musicas" className="btn btn--sm btn--block" style={{ marginTop: 8 }}>
              <Icon name="note" /> Cantar uma música
            </Link>
            {canMinistry && (
              <Link to="/ministerio" className="btn btn--sm btn--block" style={{ marginTop: 8 }}>
                <Icon name="church" /> Abrir ministério
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
