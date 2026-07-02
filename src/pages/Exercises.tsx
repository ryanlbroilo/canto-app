import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/exercises.css'
import { getExercise, EXERCISES, EXERCISE_COUNT } from '../data/exercises'
import { TRACKS, trackForLevel } from '../data/tracks'
import { unitsForLevel } from '../data/curriculum'
import { SKILL_BY_ID, SKILLS } from '../data/skills'
import { CurriculumUnit, Exercise, ExerciseKind, ExercisePhase, SkillId, TrackLevel } from '../data/types'
import { useApp } from '../app/AppContext'
import { Icon, IconName } from '../components/ui/Icon'

// Ícone por tipo de exercício (respiração, sirene, escala/intervalo, sustentação).
const KIND_ICON: Record<ExerciseKind, IconName> = {
  breathing: 'lungs',
  siren: 'wave',
  scale: 'target',
  interval: 'target',
  sustain: 'music',
}

// Rótulos e ícones das abas de nível — a ordem é a progressão da jornada.
const LEVELS: { level: TrackLevel; label: string; icon: IconName }[] = [
  { level: 'iniciante', label: 'Iniciante', icon: 'spark' },
  { level: 'intermediario', label: 'Intermediário', icon: 'bolt' },
  { level: 'avancado', label: 'Avançado', icon: 'crown' },
]

// Limiar de maestria: bestScore ≥ 90 = "dominado" (coroa dourada).
const MASTERY = 90

type MasteryState = 'locked' | 'next' | 'practiced' | 'mastered'

// Deriva o estado de maestria de um exercício a partir do progresso salvo.
function stateFor(done: { count: number; bestScore: number } | undefined): Exclude<MasteryState, 'next' | 'locked'> | 'available' {
  if (!done || done.count === 0) return 'available'
  if (done.bestScore >= MASTERY) return 'mastered'
  return 'practiced'
}

export default function Exercises() {
  const { gamification } = useApp()
  const done = gamification.exercisesDone
  const reco = gamification.recommendation
  const [view, setView] = useState<'trilha' | 'biblioteca'>('trilha')

  // Descobre o nível "atual" do cantor: a primeira trilha que ainda não está
  // 100% dominada. Serve de aba inicial e de foco do resumo.
  const currentLevel = useMemo<TrackLevel>(() => {
    for (const track of TRACKS) {
      const allMastered = track.exerciseIds.every((id) => (done[id]?.bestScore ?? 0) >= MASTERY)
      if (!allMastered) return track.level
    }
    return TRACKS[TRACKS.length - 1].level // tudo dominado → fica no último
  }, [done])

  const [level, setLevel] = useState<TrackLevel>(currentLevel)
  // Acompanha o nível computado quando ele MUDA (ex.: dominou a trilha e subiu).
  // A seleção manual de aba persiste enquanto currentLevel não muda.
  useEffect(() => setLevel(currentLevel), [currentLevel])
  const track = trackForLevel(level)

  const isMastered = (id: string) => (done[id]?.bestScore ?? 0) >= MASTERY

  // Unidades do nível ativo (o path completo, agrupado estilo Duolingo).
  const units = useMemo(() => unitsForLevel(level), [level])

  // Progresso do nível: exercícios dominados / total e unidades concluídas.
  const totalEx = track.exerciseIds.length
  const masteredCount = track.exerciseIds.filter(isMastered).length
  const trackPct = totalEx ? Math.round((masteredCount / totalEx) * 100) : 0
  const unitsDone = units.filter((u) => u.exerciseIds.length > 0 && u.exerciseIds.every(isMastered)).length
  // Índice da unidade "ativa": a primeira que ainda não está 100% dominada.
  const activeUnitIdx = units.findIndex((u) => !u.exerciseIds.every(isMastered))

  // O "próximo" nó: recomendação da EVA se estiver neste nível; senão o 1º não dominado.
  const recoInTrack = reco && track.exerciseIds.includes(reco.exerciseId) ? reco.exerciseId : null
  const firstUndone = track.exerciseIds.find((id) => !isMastered(id)) ?? null
  const nextId = recoInTrack ?? firstUndone

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="page-sub">
            Um caminho de {units.length ? 'dezenas de' : ''} unidades te guia do primeiro fôlego ao clímax do louvor — e
            a biblioteca de {EXERCISE_COUNT} exercícios é seu campo de treino livre. Cada nó dá feedback de afinação em
            tempo real e guarda sua melhor pontuação.
          </p>
        </div>
      </div>

      {/* Alternador: caminho ↔ biblioteca completa */}
      <div className="ex-switch" role="tablist" aria-label="Modo de visualização">
        <button role="tab" aria-selected={view === 'trilha'} data-active={view === 'trilha'} onClick={() => setView('trilha')}>
          <Icon name="route" size={15} /> Caminho
        </button>
        <button role="tab" aria-selected={view === 'biblioteca'} data-active={view === 'biblioteca'} onClick={() => setView('biblioteca')}>
          <Icon name="dumbbell" size={15} /> Biblioteca · {EXERCISE_COUNT}
        </button>
      </div>

      {view === 'biblioteca' && <Catalog done={done} recoId={reco?.exerciseId} />}

      {view === 'trilha' && (
      <>
      {/* Resumo geral: nível atual + progresso do caminho */}
      <SummaryCard
        level={currentLevel}
        activeLevel={level}
        pct={trackPct}
        mastered={masteredCount}
        total={totalEx}
        unitsDone={unitsDone}
        unitsTotal={units.length}
      />

      {/* Abas de nível (seções) */}
      <div className="trk-tabs" role="tablist" aria-label="Nível do caminho">
        {LEVELS.map(({ level: lv, label, icon }) => {
          const uns = unitsForLevel(lv)
          const t = trackForLevel(lv)
          const ud = uns.filter((u) => u.exerciseIds.length > 0 && u.exerciseIds.every(isMastered)).length
          const complete = ud === uns.length && uns.length > 0
          return (
            <button
              key={lv}
              role="tab"
              aria-selected={level === lv}
              className="trk-tab"
              data-active={level === lv}
              onClick={() => setLevel(lv)}
            >
              <span className="trk-tab-badge">
                <Icon name={icon} size={18} />
              </span>
              <span>
                <span className="trk-tab-title">
                  {label}
                  {complete && (
                    <span className="trk-tab-done" title="Nível dominado">
                      <Icon name="crown" size={13} />
                    </span>
                  )}
                </span>
                <span className="trk-tab-meta">
                  {ud}/{uns.length} unidades · {t.exerciseIds.length} nós
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Cabeçalho do nível ativo */}
      <div className="trk-head reveal">
        <div>
          <div className="trk-head-name">{track.name}</div>
          <div className="trk-head-hint">{track.hint}</div>
        </div>
        <div className="trk-head-prog">
          <div className="trk-head-prog-num">
            <b>{unitsDone}</b> de {units.length} unidades
          </div>
          <div className="bar" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${trackPct}%` }} />
          </div>
        </div>
      </div>

      {/* O CAMINHO: unidades temáticas em sequência */}
      {units.map((unit, ui) => (
        <UnitBlock
          key={unit.id}
          unit={unit}
          state={ui < activeUnitIdx || activeUnitIdx === -1 ? 'done' : ui === activeUnitIdx ? 'active' : 'upcoming'}
          done={done}
          nextId={nextId}
          recoId={recoInTrack}
          reco={reco}
        />
      ))}

      <div className="trk-foot reveal">
        <Icon name="route" size={18} />
        <span>
          O caminho é um guia, não uma corrente — você pode praticar qualquer exercício a qualquer momento. Dominar
          (pontuação ≥ {MASTERY}) acende o dourado; completar todos os nós de uma unidade conquista o troféu dela.
        </span>
      </div>
      </>
      )}
    </div>
  )
}

/* ---------------- Uma UNIDADE do caminho (cabeçalho + nós + revisão) ---------------- */
function UnitBlock({
  unit,
  state,
  done,
  nextId,
  recoId,
  reco,
}: {
  unit: CurriculumUnit
  state: 'done' | 'active' | 'upcoming'
  done: Record<string, { count: number; bestScore: number }>
  nextId: string | null
  recoId: string | null
  reco: { exerciseId: string; reason: string; tag: string } | null
}) {
  const exercises = unit.exerciseIds.map((id) => getExercise(id)).filter((e): e is Exercise => Boolean(e))
  const masteredInUnit = exercises.filter((e) => (done[e.id]?.bestScore ?? 0) >= MASTERY).length
  const unitComplete = exercises.length > 0 && masteredInUnit === exercises.length

  return (
    <section className="unit reveal" data-state={state}>
      <div className="unit-head">
        <span className="unit-badge" data-complete={unitComplete}>
          {unitComplete ? <Icon name="crown" size={16} /> : unit.index}
        </span>
        <div className="unit-id">
          <div className="unit-title">{unit.title}</div>
          <div className="unit-sub">{unit.subtitle}</div>
        </div>
        <span className="unit-prog" title={`${masteredInUnit} de ${exercises.length} dominados`}>
          {masteredInUnit}/{exercises.length}
        </span>
      </div>

      <div className="trk-path unit-path">
        {exercises.map((ex, i) => {
          const d = done[ex.id]
          const base = stateFor(d)
          const isNext = ex.id === nextId
          const isReco = ex.id === recoId
          const nodeState: MasteryState =
            base === 'mastered' ? 'mastered' : isNext ? 'next' : base === 'practiced' ? 'practiced' : 'locked'
          return (
            <StopNode
              key={ex.id}
              ex={ex}
              index={i}
              side={i % 2 === 0 ? 'left' : 'right'}
              baseState={base}
              nodeState={nodeState}
              best={d?.bestScore ?? 0}
              count={d?.count ?? 0}
              recommended={isReco}
              recoReason={isReco ? reco?.reason : undefined}
              recoTag={isReco ? reco?.tag : undefined}
            />
          )
        })}
        <ReviewNode complete={unitComplete} title={unit.title} side={exercises.length % 2 === 0 ? 'left' : 'right'} />
      </div>
    </section>
  )
}

/* ---------------- Nó de revisão (troféu de fim de unidade) ---------------- */
function ReviewNode({ complete, title, side }: { complete: boolean; title: string; side: 'left' | 'right' }) {
  return (
    <div className="trk-stop trk-review" data-side={side} data-complete={complete}>
      <div className="trk-rail">
        <div className="trk-node" data-state={complete ? 'mastered' : 'locked'}>
          <Icon name="trophy" size={20} />
        </div>
      </div>
      <div className="trk-review-card">
        <div className="trk-review-title">
          <Icon name="trophy" size={14} /> Revisão · {title}
        </div>
        <div className="trk-review-sub">
          {complete ? 'Unidade conquistada! Troféu dourado.' : 'Domine todos os nós desta unidade para conquistar o troféu.'}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Resumo geral (anel de progresso) ---------------- */
function SummaryCard({
  level,
  activeLevel,
  pct,
  mastered,
  total,
  unitsDone,
  unitsTotal,
}: {
  level: TrackLevel
  activeLevel: TrackLevel
  pct: number
  mastered: number
  total: number
  unitsDone: number
  unitsTotal: number
}) {
  const R = 44
  const C = 2 * Math.PI * R
  const offset = C * (1 - pct / 100)
  const levelLabel = LEVELS.find((l) => l.level === activeLevel)?.label ?? ''
  const currentLabel = LEVELS.find((l) => l.level === level)?.label ?? ''

  return (
    <div className="card card--glow trk-summary reveal">
      <div>
        <div className="trk-summary-eyebrow">Sua jornada · nível {currentLabel.toLowerCase()}</div>
        <div className="trk-summary-title">Nível {levelLabel}</div>
        <p className="trk-summary-sub">
          {total === 0
            ? 'Seu caminho está prontinho para começar. O primeiro nó já está aceso — dê o play.'
            : mastered === total
              ? 'Nível inteiro dominado. Suba de nível ou volte para lapidar a pontuação.'
              : `${unitsDone} de ${unitsTotal} unidades conquistadas · ${mastered} de ${total} nós dominados. Continue de onde parou.`}
        </p>
      </div>

      <div className="trk-summary-ring" style={{ width: 116, height: 116 }}>
        <svg width={116} height={116} viewBox="0 0 116 116" aria-hidden="true">
          <defs>
            <linearGradient id="trkGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-2)" />
              <stop offset="100%" stopColor="var(--gold-deep)" />
            </linearGradient>
          </defs>
          <circle className="trk-summary-ring-track" cx="58" cy="58" r={R} fill="none" strokeWidth="9" />
          <circle
            className="trk-summary-ring-fill"
            cx="58"
            cy="58"
            r={R}
            fill="none"
            strokeWidth="9"
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="trk-summary-ring-label">
          <div className="trk-summary-ring-pct">{pct}%</div>
          <div className="trk-summary-ring-cap">do nível</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Uma parada do caminho ---------------- */
function StopNode({
  ex,
  index,
  side,
  baseState,
  nodeState,
  best,
  count,
  recommended,
  recoReason,
  recoTag,
}: {
  ex: Exercise
  index: number
  side: 'left' | 'right'
  baseState: 'available' | 'practiced' | 'mastered'
  nodeState: MasteryState
  best: number
  count: number
  recommended: boolean
  recoReason?: string
  recoTag?: string
}) {
  const mastered = baseState === 'mastered'
  // anel de progresso ao redor do nó quando praticado mas não dominado
  const showRing = baseState === 'practiced'
  const r = 30
  const c = 2 * Math.PI * r
  const ringOffset = c * (1 - Math.min(best, MASTERY) / MASTERY)

  return (
    <div
      className="trk-stop reveal"
      data-side={side}
      data-mastered={mastered}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Trilho + nó */}
      <div className="trk-rail">
        <div className="trk-node" data-state={nodeState}>
          {showRing && (
            <svg className="trk-node-ring" width={64} height={64} viewBox="0 0 64 64" aria-hidden="true">
              <circle className="trk-node-ring-fill" cx="32" cy="32" r={r} strokeDasharray={c} strokeDashoffset={ringOffset} />
            </svg>
          )}
          {mastered ? (
            <Icon name="crown" size={22} />
          ) : nodeState === 'practiced' ? (
            <Icon name="check" size={20} />
          ) : (
            <span className="trk-node-num">{index + 1}</span>
          )}
        </div>
      </div>

      {/* Card do exercício */}
      <Link
        to={`/exercicios/${ex.id}`}
        className="trk-node-card"
        data-recommended={recommended}
        data-state={baseState}
      >
        {recommended && (
          <div>
            <span className="trk-reco">
              <Icon name="star" size={12} /> Recomendado{recoTag ? ` · ${recoTag}` : ''}
            </span>
            {recoReason && <p className="trk-reco-reason">{recoReason}</p>}
          </div>
        )}

        <div className="trk-card-top">
          <span className="trk-card-icon">
            <Icon name={KIND_ICON[ex.kind]} size={20} />
          </span>
          <div className="grow">
            <div className="trk-card-name">{ex.name}</div>
            <div className="trk-card-focus">{ex.focus}</div>
          </div>
          <span className="trk-card-go">
            <Icon name="chevron" size={18} />
          </span>
        </div>

        {/* skills desenvolvidas */}
        <div className="trk-skills">
          {ex.skills.map((sid) => {
            const s = SKILL_BY_ID[sid]
            if (!s) return null
            return (
              <span key={sid} className="trk-skill" style={{ ['--skill' as string]: s.color }}>
                <Icon name={s.icon} size={13} />
                {s.name}
              </span>
            )
          })}
        </div>

        {/* metadados: duração, dificuldade, XP, melhor pontuação */}
        <div className="trk-card-meta">
          <span className="trk-meta-item">
            <Icon name="play" size={13} />
            {ex.durationMin} min
          </span>
          {ex.difficulty && (
            <span className="trk-meta-item" title={`Dificuldade ${ex.difficulty}/5`}>
              <span className="trk-diff">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="trk-diff-dot" data-on={n <= (ex.difficulty ?? 0)} />
                ))}
              </span>
            </span>
          )}
          <span className="trk-meta-item">
            <Icon name="bolt" size={13} />
            <span className="trk-xp">+{ex.xp} XP</span>
          </span>
          {count > 0 && (
            <span className="trk-best" data-mastered={mastered} title={`Feito ${count}× · melhor ${best}`}>
              <Icon name={mastered ? 'crown' : 'star'} size={14} />
              {best}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}

/* ---------------- Biblioteca completa (catálogo filtrado) ---------------- */
const LEVEL_OPTS: { v: TrackLevel | 'all'; label: string }[] = [
  { v: 'all', label: 'Todos os níveis' },
  { v: 'iniciante', label: 'Iniciante' },
  { v: 'intermediario', label: 'Intermediário' },
  { v: 'avancado', label: 'Avançado' },
]
const PHASE_OPTS: { v: ExercisePhase | 'all'; label: string }[] = [
  { v: 'all', label: 'Todas as fases' },
  { v: 'aquecimento', label: 'Aquecimento' },
  { v: 'tecnica', label: 'Técnica' },
  { v: 'aplicacao', label: 'Aplicação' },
]
const KIND_OPTS: { v: ExerciseKind | 'all'; label: string }[] = [
  { v: 'all', label: 'Todos os tipos' },
  { v: 'breathing', label: 'Respiração' },
  { v: 'siren', label: 'Sirene' },
  { v: 'scale', label: 'Escala' },
  { v: 'interval', label: 'Intervalo' },
  { v: 'sustain', label: 'Sustentação' },
]
const PHASE_LABEL: Record<ExercisePhase, string> = {
  aquecimento: 'Aquecimento',
  tecnica: 'Técnica',
  aplicacao: 'Aplicação',
}
const LEVEL_LABEL: Record<TrackLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

function Catalog({
  done,
  recoId,
}: {
  done: Record<string, { count: number; bestScore: number }>
  recoId?: string
}) {
  const [q, setQ] = useState('')
  const [lvl, setLvl] = useState<TrackLevel | 'all'>('all')
  const [phase, setPhase] = useState<ExercisePhase | 'all'>('all')
  const [kind, setKind] = useState<ExerciseKind | 'all'>('all')
  const [skill, setSkill] = useState<SkillId | 'all'>('all')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (lvl !== 'all' && e.level !== lvl) return false
      if (phase !== 'all' && e.phase !== phase) return false
      if (kind !== 'all' && e.kind !== kind) return false
      if (skill !== 'all' && !e.skills.includes(skill)) return false
      if (needle && !`${e.name} ${e.focus} ${e.description}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [q, lvl, phase, kind, skill])

  const anyFilter = q.trim() !== '' || lvl !== 'all' || phase !== 'all' || kind !== 'all' || skill !== 'all'
  const reset = () => {
    setQ('')
    setLvl('all')
    setPhase('all')
    setKind('all')
    setSkill('all')
  }

  return (
    <div className="reveal">
      {/* filtros */}
      <div className="card cat-filters">
        <input
          className="cat-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Buscar entre ${EXERCISE_COUNT} exercícios (nome, foco, descrição)…`}
          aria-label="Buscar exercícios"
        />
        <div className="cat-selects">
          <select value={lvl} onChange={(e) => setLvl(e.target.value as TrackLevel | 'all')} aria-label="Nível">
            {LEVEL_OPTS.map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>
          <select value={phase} onChange={(e) => setPhase(e.target.value as ExercisePhase | 'all')} aria-label="Fase">
            {PHASE_OPTS.map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value as ExerciseKind | 'all')} aria-label="Tipo">
            {KIND_OPTS.map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>
          <select value={skill} onChange={(e) => setSkill(e.target.value as SkillId | 'all')} aria-label="Competência">
            <option value="all">Todas as competências</option>
            {SKILLS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cat-count">
        <span>
          <b>{results.length}</b> {results.length === 1 ? 'exercício' : 'exercícios'}
          {anyFilter ? ' no filtro' : ' na biblioteca'}
        </span>
        {anyFilter && (
          <button className="btn btn--sm btn--ghost" onClick={reset}>Limpar filtros</button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card cat-empty">
          <Icon name="target" size={22} />
          <p>Nada com esses filtros. Tente afrouxar a busca ou trocar o tipo/competência.</p>
        </div>
      ) : (
        <div className="cat-grid">
          {results.map((ex) => {
            const d = done[ex.id]
            const best = d?.bestScore ?? 0
            const mastered = best >= MASTERY
            return (
              <Link key={ex.id} to={`/exercicios/${ex.id}`} className="cat-card" data-reco={ex.id === recoId}>
                <div className="cat-card-top">
                  <span className="cat-card-icon"><Icon name={KIND_ICON[ex.kind]} size={18} /></span>
                  <div className="grow">
                    <div className="cat-card-name">{ex.name}</div>
                    <div className="cat-card-focus">{ex.focus}</div>
                  </div>
                  {mastered && <span className="cat-card-crown" title="Dominado"><Icon name="crown" size={15} /></span>}
                </div>
                <div className="cat-card-tags">
                  <span className="cat-tag cat-tag--phase">{PHASE_LABEL[ex.phase]}</span>
                  <span className="cat-tag">{LEVEL_LABEL[ex.level]}</span>
                  {ex.skills.slice(0, 2).map((sid) => {
                    const s = SKILL_BY_ID[sid]
                    return s ? (
                      <span key={sid} className="cat-tag cat-tag--skill" style={{ ['--skill' as string]: s.color }}>
                        {s.name}
                      </span>
                    ) : null
                  })}
                </div>
                <div className="cat-card-meta">
                  <span className="trk-diff" title={`Dificuldade ${ex.difficulty ?? 3}/5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="trk-diff-dot" data-on={n <= (ex.difficulty ?? 0)} />
                    ))}
                  </span>
                  <span className="cat-meta-item"><Icon name="play" size={12} />{ex.durationMin}m</span>
                  <span className="cat-meta-item cat-xp"><Icon name="bolt" size={12} />+{ex.xp}</span>
                  {best > 0 && <span className="cat-meta-item cat-best" data-mastered={mastered}><Icon name="star" size={12} />{best}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
