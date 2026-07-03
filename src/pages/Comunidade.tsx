import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/team.css'
import '../styles/comunidade.css'
import '../styles/ministerio.css'
import { useApp } from '../app/AppContext'
import { useAuth } from '../app/AuthContext'
import { apiLeaderboard, LeaderboardRow } from '../data/api'
import { voicePartLabel } from '../data/harmony'
import { ShareButton } from '../components/ShareButton'
import { ShareCardData } from '../share/shareCard'
import { Icon } from '../components/ui/Icon'

const todayKey = () => new Date().toISOString().slice(0, 10)
const isToday = (iso: string | null): boolean => !!iso && iso.slice(0, 10) === todayKey()

// COMUNIDADE — a liga do ministério (ranking por XP da semana) + as ofensivas do
// time (streak social). O compartilhável é SEMPRE número/branding (o áudio fica
// no device). Dados do ranking vêm do backend; o card pessoal usa o estado local.
export default function Comunidade() {
  const { user } = useAuth()
  const { streak, gamification } = useApp()
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let alive = true
    apiLeaderboard()
      .then((r) => alive && setRows(r))
      .catch(() => {
        if (alive) {
          setOffline(true)
          setRows([])
        }
      })
    return () => {
      alive = false
    }
  }, [])

  const myId = user?.id
  const myRank = useMemo(() => {
    if (!rows || !myId) return null
    const i = rows.findIndex((r) => r.id === myId)
    return i >= 0 ? i + 1 : null
  }, [rows, myId])

  // Card pessoal (sempre disponível — estado local, funciona offline).
  const myShare: ShareCardData = {
    eyebrow: 'minha semana no Canto',
    big: String(streak.current),
    bigLabel: streak.current === 1 ? 'dia de ofensiva' : 'dias de ofensiva',
    title: streak.current >= 3 ? 'Seguindo firme 🔥' : 'Bora manter a ofensiva',
    name: user?.name || undefined,
    stats: [
      { label: 'nível', value: String(gamification.level) },
      { label: 'XP total', value: String(gamification.totalXp) },
      { label: 'no ranking', value: myRank ? `#${myRank}` : '—' },
    ],
  }

  // solo = time de 1 pessoa DE VERDADE (não confundir com falha de rede, que também
  // zera rows) — senão um ministério real veria "convide seu time" numa queda da API.
  const solo = !offline && rows !== null && rows.length <= 1

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Comunidade</h1>
          <p className="page-sub">A liga do seu ministério e as ofensivas do time — treinem juntos, cresçam juntos.</p>
        </div>
        <ShareButton data={myShare} filename="canto-semana.png" label="Compartilhar minha semana" className="btn btn--sm btn--primary" />
      </div>

      {offline && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--hairline-strong)' }}>
          <p className="hint"><Icon name="wave" size={14} /> Ranking indisponível agora. Seu card de progresso continua funcionando.</p>
        </div>
      )}

      {rows === null ? (
        <div className="card"><p className="hint">Carregando o ranking…</p></div>
      ) : offline ? null : solo ? (
        <div className="card card--glow">
          <div className="min-lock">
            <span className="min-lock-orb"><Icon name="flame" size={30} /></span>
            <div>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>Sua liga começa com o time</h2>
              <p className="hint center" style={{ maxWidth: '46ch', margin: '0 auto' }}>
                Convide seu ministério e a ofensiva de cada um vira uma liga semanal. Competir junto é o que mantém a galera treinando.
              </p>
            </div>
            <Link to="/time" className="btn btn--primary"><Icon name="crown" /> Convidar meu time</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Liga da semana (ranking por XP semanal) */}
          <div className="card card--glow reveal r0">
            <div className="row spread" style={{ alignItems: 'center' }}>
              <span className="card-title">Liga da semana</span>
              <span className="badge badge--gold"><Icon name="bolt" size={12} /> XP de seg a dom</span>
            </div>
            <div className="lb-list">
              {rows.map((r, i) => {
                const hot = r.currentStreak > 0
                return (
                  <div className="lb-row" key={r.id} data-me={r.id === myId}>
                    <span className="lb-rank" data-top={i < 3 ? String(i + 1) : undefined}>{i + 1}</span>
                    <div className="member-avatar">{(r.name || r.email).trim().slice(0, 1).toUpperCase()}</div>
                    <div className="member-id">
                      <div className="member-name">
                        {r.name || r.email.split('@')[0]} {r.id === myId && <span className="badge badge--gold">você</span>}
                      </div>
                      <div className="member-mail">{r.voicePart !== 'unassigned' ? voicePartLabel(r.voicePart) : `${r.weeklySessions} sessõe${r.weeklySessions === 1 ? '' : 's'} na semana`}</div>
                    </div>
                    <span className="lb-flame" data-hot={hot} title="ofensiva atual">
                      <Icon name="flame" size={14} /> {r.currentStreak}
                    </span>
                    <div className="lb-metric"><b>{r.weeklyXp}</b><span>XP</span></div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ofensivas do time (streak social) */}
          <div className="card reveal r1" style={{ marginTop: 18 }}>
            <span className="card-title">Ofensivas do time</span>
            <p className="hint" style={{ marginTop: 6 }}>Quem está em chamas — e quem precisa de um empurrãozinho pra não perder a ofensiva hoje.</p>
            <div className="lb-list">
              {[...rows]
                .sort((a, b) => b.currentStreak - a.currentStreak || b.weeklyXp - a.weeklyXp)
                .map((r) => {
                  const atRisk = r.currentStreak > 0 && !isToday(r.lastSessionAt)
                  return (
                    <div className="lb-row" key={r.id} data-me={r.id === myId}>
                      <div className="member-avatar">{(r.name || r.email).trim().slice(0, 1).toUpperCase()}</div>
                      <div className="member-id">
                        <div className="member-name">{r.name || r.email.split('@')[0]}</div>
                        <div className="member-mail">{r.currentStreak > 0 ? `${r.currentStreak} dia${r.currentStreak === 1 ? '' : 's'} seguidos` : 'sem ofensiva ativa'}</div>
                      </div>
                      {atRisk ? (
                        <span className="risk-tag">em risco hoje</span>
                      ) : r.currentStreak >= 7 ? (
                        <span className="lb-flame" data-hot="true"><Icon name="flame" size={14} /> em chamas</span>
                      ) : (
                        <span className="lb-flame" data-hot={r.currentStreak > 0}><Icon name="flame" size={14} /> {r.currentStreak}</span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
