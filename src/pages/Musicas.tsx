import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/musicas.css'
import { SONGS, SongSource } from '../data/songs'
import { Icon } from '../components/ui/Icon'

const FILTERS: { id: 'todas' | SongSource; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'autoral', label: 'Autorais' },
  { id: 'dominio-publico', label: 'Domínio público' },
]

// CATÁLOGO DE MÚSICAS — conteúdo estático (autoral + domínio público). Cada card
// leva ao player, onde dá pra aprender a melodia ou cantar pontuado.
export default function Musicas() {
  const [filter, setFilter] = useState<'todas' | SongSource>('todas')
  const list = filter === 'todas' ? SONGS : SONGS.filter((s) => s.source === filter)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Músicas</h1>
          <p className="page-sub">Cante músicas de verdade — o app compara sua voz com a melodia, nota a nota.</p>
        </div>
        <span className="badge badge--gold">{SONGS.length} músicas</span>
      </div>

      <div className="card reveal r0">
        <div className="segmented" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
          {FILTERS.map((x) => (
            <button key={x.id} data-active={filter === x.id} onClick={() => setFilter(x.id)}>{x.label}</button>
          ))}
        </div>

        <div className="song-grid">
          {list.map((s) => (
            <Link key={s.id} to={`/musicas/${s.id}`} className="song-card">
              <div className="song-card-head">
                <div>
                  <div className="song-card-title">{s.title}</div>
                  <div className="song-card-composer">{s.composer} · {s.keyLabel}</div>
                </div>
                <span className="song-card-diff" title={`dificuldade ${s.difficulty}/5`}>
                  {'●'.repeat(s.difficulty)}<span className="faint">{'●'.repeat(5 - s.difficulty)}</span>
                </span>
              </div>
              <div className="song-tags">
                {s.tags.map((t) => (
                  <span key={t} className="song-tag">{t}</span>
                ))}
              </div>
              <div className="row spread" style={{ alignItems: 'center', marginTop: 2 }}>
                <span className="song-source">{s.source === 'autoral' ? 'autoral' : 'domínio público'}</span>
                <span className="btn btn--sm btn--primary"><Icon name="play" size={13} /> Cantar</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
