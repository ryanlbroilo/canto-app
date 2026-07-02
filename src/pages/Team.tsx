import { useEffect, useState } from 'react'
import '../styles/team.css'
import { useAuth } from '../app/AuthContext'
import { apiCreateInvite, apiListInvites, apiListMembers, apiRevokeInvite, Invite, Member } from '../data/api'
import { Icon } from '../components/ui/Icon'

const inviteUrl = (token: string) => `${window.location.origin}/auth?convite=${token}`

export default function Team() {
  const { user } = useAuth()
  const isLeader = user?.role === 'OWNER' || user?.role === 'ADMIN'

  const [invites, setInvites] = useState<Invite[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

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

  if (!isLeader) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Meu time</h1>
            <p className="page-sub">Só o líder da organização gerencia convites e vê o time.</p>
          </div>
        </div>
        <div className="card">
          <p className="hint">Você é membro de <strong>{user?.tenantSlug}</strong>. Fale com quem te convidou para virar co-líder.</p>
        </div>
      </div>
    )
  }

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
              <div className="member-row" key={m.id}>
                <div className="member-avatar">{(m.name || m.email).trim().slice(0, 1).toUpperCase()}</div>
                <div className="member-id">
                  <div className="member-name">{m.name || m.email.split('@')[0]} {m.role !== 'MEMBER' && <span className="badge badge--gold">{m.role === 'OWNER' ? 'líder' : 'co-líder'}</span>}</div>
                  <div className="member-mail">{m.email}</div>
                </div>
                <div className="member-stat"><b>{m.sessionCount}</b><span>sessões</span></div>
                <div className="member-stat"><b>{m.totalXp}</b><span>XP</span></div>
                <div className="member-stat member-last"><b>{m.lastSessionAt ? new Date(m.lastSessionAt).toLocaleDateString('pt-BR') : '—'}</b><span>últ. treino</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
