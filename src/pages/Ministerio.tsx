import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/team.css'
import '../styles/ministerio.css'
import { useAuth } from '../app/AuthContext'
import { useEntitlement } from '../hooks/useEntitlement'
import {
  apiAssignVoicePart,
  apiGetMinistryPlan,
  apiGetReadiness,
  apiListMinistryMembers,
  apiSaveMinistryPlan,
  apiSetMyVoicePart,
  MemberVoicePart,
  ReadinessRow,
} from '../data/api'
import { MinistryPlanItem, VOICE_PARTS, VoicePart, voicePartLabel } from '../data/harmony'
import { HARMONY_EXERCISES } from '../data/harmony'
import { getCachedPlan, getVoicePart, mergeServerPlan, setVoicePart } from '../data/store'
import { warmupQueue } from '../data/vocalHealth'
import { EXERCISES, getExercise } from '../data/exercises'
import { Icon } from '../components/ui/Icon'

// Candidatos que o líder pode colocar no ensaio (aquecimento + set de harmonia).
const WARMUP_CANDIDATE_IDS = Array.from(
  new Set([...warmupQueue(), ...EXERCISES.filter((e) => e.phase === 'aquecimento' && (e.difficulty ?? 3) <= 2).map((e) => e.id)]),
).slice(0, 10)

const PART_CHIPS: VoicePart[] = ['melodia', 'voz2', 'voz3', 'soprano', 'contralto', 'tenor', 'baixo']

export default function Ministerio() {
  const { user } = useAuth()
  const isLeader = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const { allowed, loading: entLoading } = useEntitlement('team_admin')

  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [title, setTitle] = useState('Ensaio do ministério')
  const [items, setItems] = useState<MinistryPlanItem[]>([])
  const [members, setMembers] = useState<MemberVoicePart[]>([])
  const [readiness, setReadiness] = useState<ReadinessRow[]>([])
  const [myPart, setMyPart] = useState<VoicePart>(getVoicePart())
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!allowed) return
    let alive = true
    const cached = getCachedPlan()
    if (cached) {
      setTitle(cached.title)
      setItems(cached.items)
    }
    async function load() {
      try {
        const plan = await apiGetMinistryPlan()
        if (!alive) return
        setTitle(plan.title)
        setItems(plan.items)
        mergeServerPlan(plan)
      } catch {
        if (alive) setOffline(true)
      }
      // dados só do líder (membros/prontidão)
      if (isLeader) {
        const [mem, rd] = await Promise.all([apiListMinistryMembers().catch(() => []), apiGetReadiness().catch(() => [])])
        if (!alive) return
        setMembers(mem)
        setReadiness(rd)
      }
      if (alive) setLoading(false)
    }
    load()
    return () => {
      alive = false
    }
  }, [allowed, isLeader])

  // ---------- Gate: carregando / sem plano Igreja ----------
  if (entLoading) {
    return (
      <div className="page">
        <div className="card"><p className="hint">Carregando…</p></div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Ministério de louvor</h1>
            <p className="page-sub">Aquecimento em grupo, treino de harmonia e o quadro de prontidão do time.</p>
          </div>
        </div>
        <div className="card card--glow">
          <div className="min-lock">
            <span className="min-lock-orb"><Icon name="crown" size={30} /></span>
            <div>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>Ferramentas de ministério</h2>
              <p className="hint center" style={{ maxWidth: '46ch', margin: '0 auto' }}>
                O plano <b>Canto Igreja</b> libera o ensaio compartilhado, a atribuição de naipes e o quadro de prontidão pro culto — todo o time cantando junto e afinado.
              </p>
            </div>
            <Link to="/planos" className="btn btn--primary"><Icon name="crown" /> Conhecer o plano Igreja</Link>
            <Link to="/harmonia" className="btn btn--ghost">Enquanto isso, treinar harmonia solo →</Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Ações ----------
  function toggleItem(kind: 'warmup' | 'harmony', ref: string, label: string) {
    setSaved(false)
    setItems((prev) => (prev.some((i) => i.ref === ref && i.kind === kind) ? prev.filter((i) => !(i.ref === ref && i.kind === kind)) : [...prev, { kind, ref, label }]))
  }
  const inPlan = (kind: 'warmup' | 'harmony', ref: string) => items.some((i) => i.kind === kind && i.ref === ref)

  async function savePlan() {
    setSaving(true)
    try {
      const plan = await apiSaveMinistryPlan({ title, items })
      setItems(plan.items)
      mergeServerPlan(plan)
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch {
      setOffline(true)
    } finally {
      setSaving(false)
    }
  }

  async function assignPart(memberId: string, part: VoicePart) {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, voicePart: part } : m)))
    await apiAssignVoicePart(memberId, part).catch(() => setOffline(true))
  }

  async function chooseMyPart(part: VoicePart) {
    setMyPart(part)
    setVoicePart(part)
    await apiSetMyVoicePart(part).catch(() => undefined)
  }

  const warmupItems = items.filter((i) => i.kind === 'warmup')
  const harmonyItems = items.filter((i) => i.kind === 'harmony')

  // ---------- Painel ----------
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Ministério de louvor</h1>
          <p className="page-sub">{isLeader ? 'Monte o ensaio, distribua os naipes e veja quem está pronto pro culto.' : 'O ensaio do seu ministério — aqueça, ache sua voz e cante junto.'}</p>
        </div>
        <Link to="/harmonia" className="btn btn--sm"><Icon name="music" size={14} /> Treinar harmonia</Link>
      </div>

      {offline && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--hairline-strong)' }}>
          <p className="hint"><Icon name="wave" size={14} /> Plano compartilhado indisponível agora — mostrando o cache local. O treino de harmonia funciona normalmente.</p>
        </div>
      )}

      {/* -------- Ensaio (plano) -------- */}
      <div className="card card--glow reveal r0">
        <div className="row spread" style={{ alignItems: 'center' }}>
          <span className="card-title">Ensaio do ministério</span>
          {isLeader && (
            <button className="btn btn--primary btn--sm" onClick={savePlan} disabled={saving}>
              <Icon name={saved ? 'check' : 'send'} size={14} /> {saved ? 'Salvo' : saving ? 'Salvando…' : 'Salvar ensaio'}
            </button>
          )}
        </div>

        {isLeader && (
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label">Título do ensaio</label>
            <input className="input" value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false) }} maxLength={80} />
          </div>
        )}

        {/* Aquecimento */}
        <div style={{ marginTop: 16 }}>
          <span className="field-label"><Icon name="lungs" size={13} /> Aquecimento</span>
          {loading && !warmupItems.length ? (
            <p className="hint" style={{ marginTop: 8 }}>Carregando…</p>
          ) : warmupItems.length === 0 && !isLeader ? (
            <p className="hint" style={{ marginTop: 8 }}>O líder ainda não montou o aquecimento. Você pode <Link to="/aquecimento" style={{ color: 'var(--gold-2)' }}>aquecer pela rotina padrão</Link>.</p>
          ) : (
            <div style={{ marginTop: 8 }}>
              {warmupItems.map((it) => (
                <div className="min-plan-item" key={`w-${it.ref}`}>
                  <span className="min-plan-ic"><Icon name="lungs" size={16} /></span>
                  <div className="min-plan-body">
                    <div className="min-plan-name">{getExercise(it.ref)?.name ?? it.label}</div>
                    <div className="min-plan-kind">aquecimento</div>
                  </div>
                  {isLeader ? (
                    <button className="btn btn--sm btn--ghost" onClick={() => toggleItem('warmup', it.ref, it.label)}>Remover</button>
                  ) : (
                    <Link className="btn btn--sm" to={`/exercicios/${it.ref}`}><Icon name="play" size={13} /> Fazer</Link>
                  )}
                </div>
              ))}
            </div>
          )}
          {isLeader && (
            <div className="min-add-row">
              {WARMUP_CANDIDATE_IDS.filter((id) => !inPlan('warmup', id)).map((id) => {
                const ex = getExercise(id)
                if (!ex) return null
                return <button key={id} className="chip" onClick={() => toggleItem('warmup', id, ex.name)}>+ {ex.name}</button>
              })}
            </div>
          )}
        </div>

        {/* Set de harmonia */}
        <div style={{ marginTop: 18 }}>
          <span className="field-label"><Icon name="music" size={13} /> Set de harmonia</span>
          {harmonyItems.length === 0 && !isLeader ? (
            <p className="hint" style={{ marginTop: 8 }}>O líder ainda não montou o set de harmonia.</p>
          ) : (
            <div style={{ marginTop: 8 }}>
              {harmonyItems.map((it) => (
                <div className="min-plan-item" key={`h-${it.ref}`}>
                  <span className="min-plan-ic"><Icon name="music" size={16} /></span>
                  <div className="min-plan-body">
                    <div className="min-plan-name">{it.label}</div>
                    <div className="min-plan-kind">encaixe de harmonia</div>
                  </div>
                  {isLeader ? (
                    <button className="btn btn--sm btn--ghost" onClick={() => toggleItem('harmony', it.ref, it.label)}>Remover</button>
                  ) : (
                    <Link className="btn btn--sm" to={`/harmonia?ex=${encodeURIComponent(it.ref)}`}><Icon name="play" size={13} /> Treinar</Link>
                  )}
                </div>
              ))}
            </div>
          )}
          {isLeader && (
            <div className="min-add-row">
              {HARMONY_EXERCISES.filter((e) => !inPlan('harmony', e.id)).map((e) => (
                <button key={e.id} className="chip" onClick={() => toggleItem('harmony', e.id, e.name)}>+ {e.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -------- Meu naipe (membro) -------- */}
      {!isLeader && (
        <div className="card reveal r1" style={{ marginTop: 18 }}>
          <span className="card-title">Minha voz no ministério</span>
          <p className="hint" style={{ marginTop: 6 }}>Escolha o naipe que você canta — assim seu líder acompanha o time por voz.</p>
          <div className="min-part-pick" style={{ marginTop: 12 }}>
            {PART_CHIPS.map((p) => (
              <button key={p} className={`chip ${myPart === p ? 'chip--active' : ''}`} onClick={() => chooseMyPart(p)}>{voicePartLabel(p)}</button>
            ))}
          </div>
        </div>
      )}

      {/* -------- Naipes + prontidão (líder) -------- */}
      {isLeader && (
        <div className="card reveal r1" style={{ marginTop: 18 }}>
          <span className="card-title">Time · naipes e prontidão</span>
          {loading ? (
            <p className="hint" style={{ marginTop: 12 }}>Carregando o time…</p>
          ) : members.length === 0 ? (
            <p className="hint" style={{ marginTop: 12 }}>Convide seu time em <Link to="/time" style={{ color: 'var(--gold-2)' }}>Meu time</Link> para distribuir os naipes.</p>
          ) : (
            <div className="member-list" style={{ marginTop: 8 }}>
              {members.map((m) => {
                const rd = readiness.find((r) => r.id === m.id)
                return (
                  <div className="member-row" key={m.id} style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div className="member-avatar">{(m.name || m.email).trim().slice(0, 1).toUpperCase()}</div>
                    <div className="member-id">
                      <div className="member-name">{m.name || m.email.split('@')[0]} {m.role !== 'MEMBER' && <span className="badge badge--gold">{m.role === 'OWNER' ? 'líder' : 'co-líder'}</span>}</div>
                      <div className="member-mail">{m.email}</div>
                    </div>
                    <select className="select" style={{ width: 'auto', minWidth: 130 }} value={m.voicePart} onChange={(e) => assignPart(m.id, e.target.value as VoicePart)}>
                      {VOICE_PARTS.map((vp) => (
                        <option key={vp.id} value={vp.id}>{vp.label}</option>
                      ))}
                    </select>
                    <div className="min-ready" style={{ flex: 1, minWidth: 150 }}>
                      <div className="bar"><div className="bar-fill" style={{ width: `${rd?.score ?? 0}%` }} /></div>
                      <span className="min-ready-tag" data-state={rd?.status ?? 'cold'}>
                        {rd?.status === 'ready' ? 'pronto' : rd?.status === 'warm' ? 'quase' : 'frio'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <p className="hint" style={{ marginTop: 12, fontSize: 12 }}>Prontidão: aqueceu hoje + praticou a harmonia nos últimos 7 dias.</p>
        </div>
      )}
    </div>
  )
}
