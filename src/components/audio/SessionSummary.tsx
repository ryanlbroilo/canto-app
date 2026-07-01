import { FeatureReport } from '../../data/types'

// Resumo visual de uma sessão a partir do feature-JSON (o mesmo que a EVA lê).
// Torna os números do DSP tangíveis: acerto, desvio, vibrato, tempo em cada
// registro (barra empilhada) e eventos de quebra.
const ZONES: { key: 'peito' | 'mix' | 'cabeca' | 'falsete'; label: string; color: string }[] = [
  { key: 'peito', label: 'Peito', color: '#e9b44c' },
  { key: 'mix', label: 'Mix', color: '#57d6a6' },
  { key: 'cabeca', label: 'Cabeça', color: '#7fb2ff' },
  { key: 'falsete', label: 'Falsete', color: '#c48bff' },
]

export function SessionSummary({ report }: { report: FeatureReport }) {
  const p = report.performance
  const rt = p.registerTime
  const hasReg = ZONES.some((z) => rt[z.key] > 0)

  return (
    <div className="summary">
      <div className="summary-stats">
        <SumStat value={`${Math.round(p.notesHitPct)}%`} label="Acerto" />
        <SumStat value={`${Math.round(p.avgCentsDeviation)}¢`} label="Desvio médio" />
        <SumStat value={p.vibrato.present ? `${p.vibrato.rateHz} Hz` : '—'} label="Vibrato" />
        <SumStat value={`${Math.round(p.stability.clarity * 100)}%`} label="Estabilidade" />
      </div>

      {hasReg && (
        <div className="summary-block">
          <div className="summary-label">Tempo em cada registro</div>
          <div className="reg-bar">
            {ZONES.map((z) =>
              rt[z.key] > 0 ? (
                <div key={z.key} className="reg-seg" style={{ width: `${rt[z.key]}%`, background: z.color }} title={`${z.label} ${rt[z.key]}%`} />
              ) : null,
            )}
          </div>
          <div className="reg-legend">
            {ZONES.filter((z) => rt[z.key] > 0).map((z) => (
              <span key={z.key} className="reg-legend-item">
                <span className="dot" style={{ background: z.color }} /> {z.label} {rt[z.key]}%
              </span>
            ))}
          </div>
        </div>
      )}

      {p.events.length > 0 && (
        <div className="summary-events">
          {p.events.slice(0, 4).map((e, i) => (
            <span key={i} className="badge" style={{ color: 'var(--off)', borderColor: 'rgba(242,109,91,0.3)' }}>
              ⚡ quebra {e.from ?? '?'} → {e.to ?? '?'} {e.note ? `(${e.note})` : ''}
            </span>
          ))}
        </div>
      )}

      {p.vibrato.present && (
        <p className="hint" style={{ fontSize: 12.5 }}>
          Vibrato de <strong>{p.vibrato.rateHz} Hz</strong> (~{p.vibrato.extentCents}¢) — {p.vibrato.rateHz >= 5 && p.vibrato.rateHz <= 7 ? 'taxa saudável.' : 'trabalhe a regularidade.'}
        </p>
      )}
    </div>
  )
}

function SumStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="sum-stat">
      <div className="sum-stat-value mono">{value}</div>
      <div className="sum-stat-label">{label}</div>
    </div>
  )
}
