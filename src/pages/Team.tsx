import { useEffect, useState } from 'react'
import '../styles/team.css'
import { useAuth } from '../app/AuthContext'
import { apiCreateInvite, apiListInvites, apiListMembers, apiMemberDetail, apiRevokeInvite, Invite, Member, MemberDetail } from '../data/api'
import { computeGamification } from '../data/gamification'
import { computeStreak } from '../data/store'
import { SKILL_BY_ID } from '../data/skills'
import { getExercise } from '../data/exercises'
import { GamificationState, SessionRecord, VocalBaseline } from '../data/types'
import { Icon } from '../components/ui/Icon'

const inviteUrl = (token: string) => `${window.location.origin}/auth?convite=${token}`

interface Detail {
  member: MemberDetail
  game: GamificationState
  streakCurrent: number
}

export default function Team() {
  const { user } = useAuth()
  const isLeader = user?.role === 'OWNER' || user?.role === 'ADMIN'

  const [invites, setInvites] = useState<Invite[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isLeader) return
    Promise.all([apiListInvites().catch(() => []), apiListMembers().catch(() => [])])
      .then(([inv, mem]) => {
        setInvites(inv)
        setMembers(mem)
      })
      .finally(() => setLoading(false))
  }, [isLeader])

  const activeLink = invites.find((i) => i.status === 'ok' && i.maxUses == null)

  async function generate() {
    setCreating(true)
    try {
      const inv = await apiCreateInvite({ role: 'MEMBER', expiresInDays: 30 })
      setInvites((prev) => [inv, ...prev])
      copy(inviteUrl(inv.token))
    } finally {
      setCreating(false)
    }
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(link)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      /* clipboard bloqueado */
    }
  }

  async function revoke(id: string) {
    await apiRevokeInvite(id).catch(() => undefined)
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'revoked' } : i)))
  }

  async function openMember(id: string) {
    setDetailLoading(id)
    try {
      const m = await apiMemberDetail(id)
      const sessions = m.sessions as SessionRecord[]
      const streak = computeStreak(sessions)
      const game = computeGamification({ sessions, streak, baseline: (m.baseline as VocalBaseline | null) ?? null, rangeHistory: [] })
      setDetail({ member: m, game, streakCurrent: streak.current })
    } finally {
      setDetailLoading(null)
    }
  }

  if (!isLeader) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Meu time</h1>
            <p className="page-sub">Só o líder da organização gerencia convites e acompanha o time.</p>
          </div>
        </div>
        <div className="card">
          <p className="hint">Você é membro de <strong>{user?.tenantSlug}</strong>. Fale com quem te convidou para virar co-líder.</p>
        </div>
      </div>
    )
  }

  // ---- Detalhe de um membro ----
  if (detail) {
    const { member: m, game, streakCurrent } = detail
    const rec = game.recommendation
    const recEx = rec ? getExercise(rec.exerciseId) : undefined
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <button className="btn btn--sm btn--ghost" onClick={() => setDetail(null)} style={{ marginBottom: 10 }}>← Voltar ao time</button>
            <h1 className="page-title">{m.name || m.email.split('@')[0]}</h1>
            <p className="page-sub">{m.email} · {m.role === 'OWNER' ? 'líder' : m.role === 'ADMIN' ? 'co-líder' : 'membro'} · desde {new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="member-stats reveal r0">
          <div className="ms-card"><b>Nível {game.level}</b><span>{game.totalXp} XP total</span></div>
          <div className="ms-card"><b>{streakCurrent}</b><span>dias de ofensiva</span></div>
          <div className="ms-card"><b>{m.sessions.length}</b><span>sessões</span></div>
          <div className="ms-card"><b>{game.achievements.length}</b><span>conquistas</span></div>
        </div>

        {rec && recEx && (
          <div className="card card--glow reveal r1" style={{ marginTop: 18 }}>
            <span className="card-title">Foco sugerido pela EVA</span>
            <div className="row gap-3" style={{ alignItems: 'center', marginTop: 12 }}>
              <span className="ex-icon"><Icon name="target" size={20} /></span>
              <div>
                <div style={{ fontWeight: 600 }}>{recEx.name} <span className="badge badge--gold" style={{ marginLeft: 6 }}>{rec.tag}</span></div>
                <p className="hint" style={{ margin: '2px 0 0' }}>{rec.reason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card reveal r2" style={{ marginTop: 18 }}>
          <span className="card-title">Competências</span>
          <div className="skill-grid">
            {game.skills.map((s) => {
              const meta = SKILL_BY_ID[s.id]
              return (
                <div className="skill-cell" key={s.id}>
                  <div className="skill-top"><Icon name={meta.icon} size={15} /> <span>{meta.name}</span><span className="skill-lv">Nv {s.level}</span></div>
                  <div className="skill-bar"><div className="skill-fill" style={{ width: `${Math.min(100, s.last5Avg)}%`, background: meta.color }} /></div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card reveal r3" style={{ marginTop: 18 }}>
          <span className="card-title">Sessões recentes</span>
          {m.sessions.length === 0 ? (
            <p className="hint" style={{ marginTop: 12 }}>Ainda não treinou.</p>
          ) : (
            <div className="sess-list">
              {m.sessions.slice(0, 10).map((s) => (
                <div className="sess-row" key={s.id}>
                  <span className="sess-label">{s.label}</span>
                  <span className="mono muted">{new Date(s.dateISO).toLocaleDateString('pt-BR')}</span>
                  <span className="mono" style={{ color: s.notesHitPct >= 70 ? 'var(--good)' : s.notesHitPct >= 50 ? 'var(--close)' : 'var(--off)' }}>{Math.round(s.notesHitPct)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- Lista do time ----
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meu time</h1>
          <p className="page-sub">Convide seu time de louvor ou seus alunos e acompanhe a evolução de cada um.</p>
        </div>
      </div>

      <div className="card card--glow reveal r0">
        <span className="card-title">Convidar pro time</span>
        <p className="hint" style={{ marginTop: 6 }}>Gere um link e compartilhe. Quem entrar por ele vira membro da sua organização.</p>

        {activeLink ? (
          <div className="invite-link">
            <input className="invite-link-field" readOnly value={inviteUrl(activeLink.token)} onFocus={(e) => e.target.select()} />
            <button className="btn btn--primary btn--sm" onClick={() => copy(inviteUrl(activeLink.token))}>
              <Icon name={copied === inviteUrl(activeLink.token) ? 'check' : 'send'} size={15} />
              {copied === inviteUrl(activeLink.token) ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        ) : (
          <button className="btn btn--primary" style={{ marginTop: 14 }} onClick={generate} disabled={creating}>
            <Icon name="route" /> {creating ? 'Gerando…' : 'Gerar link de convite'}
          </button>
        )}

        {invites.filter((i) => i.status !== 'revoked').length > 0 && (
          <div className="invite-list">
            {invites
              .filter((i) => i.status !== 'revoked')
              .map((i) => (
                <div className="invite-row" key={i.id}>
                  <span className="badge">{i.role === 'ADMIN' ? 'co-líder' : 'membro'}</span>
                  <span className="mono muted">{i.useCount} uso{i.useCount === 1 ? '' : 's'}</span>
                  <span className={`badge ${i.status === 'ok' ? 'badge--good' : ''}`}>{i.status === 'ok' ? 'ativo' : i.status}</span>
                  <button className="btn btn--sm btn--ghost" onClick={() => revoke(i.id)}>Revogar</button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card reveal r1" style={{ marginTop: 18 }}>
        <span className="card-title">Membros · {members.length}</span>
        {loading ? (
          <p className="hint" style={{ marginTop: 12 }}>Carregando…</p>
        ) : (
          <div className="member-list">
            {members.map((m) => (
              <button className="member-row member-row--btn" key={m.id} onClick={() => openMember(m.id)} disabled={detailLoading === m.id}>
                <div className="member-avatar">{(m.name || m.email).trim().slice(0, 1).toUpperCase()}</div>
                <div className="member-id">
                  <div className="member-name">{m.name || m.email.split('@')[0]} {m.role !== 'MEMBER' && <span className="badge badge--gold">{m.role === 'OWNER' ? 'líder' : 'co-líder'}</span>}</div>
                  <div className="member-mail">{m.email}</div>
                </div>
                <div className="member-stat"><b>{m.sessionCount}</b><span>sessões</span></div>
                <div className="member-stat"><b>{m.totalXp}</b><span>XP</span></div>
                <div className="member-stat member-last"><b>{m.lastSessionAt ? new Date(m.lastSessionAt).toLocaleDateString('pt-BR') : '—'}</b><span>últ. treino</span></div>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
