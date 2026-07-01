import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { getRangeHistory } from '../data/store'
import { midiLabel } from '../audio/notes'
import { COLORS } from '../theme'

export default function Progress() {
  const { sessions, streak, baseline } = useApp()
  const history = getRangeHistory()
  const bestOct = history.length ? Math.max(...history.map((h) => (h.highMidi - h.lowMidi) / 12)).toFixed(1) : '—'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Progresso</h1>
          <p className="page-sub">Sua evolução ao longo do tempo — extensão, afinação e consistência.</p>
        </div>
      </div>

      <div className="stat-row reveal r0" style={{ marginBottom: 18 }}>
        <Stat value={String(streak.total)} label="Sessões totais" />
        <Stat value={`${streak.current}d`} label="Ofensiva atual" />
        <Stat value={`${streak.longest}d`} label="Maior ofensiva" />
        <Stat value={String(bestOct)} label="Melhor extensão (oit.)" />
      </div>

      <div className="grid grid-2">
        <div className="card reveal r1">
          <span className="card-title">Evolução da extensão</span>
          {history.length >= 2 ? (
            <RangeChart history={history} />
          ) : (
            <Empty text="Refaça o teste de range algumas vezes para ver a evolução do grave ao agudo aqui." action={<Link to="/range" className="btn btn--sm">Medir range</Link>} />
          )}
        </div>

        <div className="card reveal r2">
          <span className="card-title">Precisão de afinação</span>
          {sessions.length >= 1 ? (
            <AccuracyChart values={sessions.map((s) => s.notesHitPct)} />
          ) : (
            <Empty text="Treine alguns exercícios para acompanhar sua precisão sessão a sessão." action={<Link to="/exercicios" className="btn btn--sm">Treinar</Link>} />
          )}
        </div>
      </div>

      <div className="card reveal r3" style={{ marginTop: 18 }}>
        <span className="card-title">Consistência (últimas 9 semanas)</span>
        <Heatmap days={streak.days} />
      </div>

      {baseline && (
        <p className="hint" style={{ marginTop: 16 }}>
          Range atual: <strong>{midiLabel(baseline.lowMidi)} → {midiLabel(baseline.highMidi)}</strong> · {baseline.voiceType} (aprox.)
        </p>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card">
      <div className="stat">
        <div className="stat-value">
          <span className="mono">{value}</span>
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function Empty({ text, action }: { text: string; action: React.ReactNode }) {
  return (
    <div className="stack gap-3 center" style={{ padding: '28px 8px' }}>
      <p className="hint">{text}</p>
      <div>{action}</div>
    </div>
  )
}

function useChart(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = c.clientWidth
    const h = c.clientHeight
    c.width = w * dpr
    c.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

function RangeChart({ history }: { history: { lowMidi: number; highMidi: number }[] }) {
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 24
      const lows = history.map((x) => x.lowMidi)
      const highs = history.map((x) => x.highMidi)
      const min = Math.min(...lows) - 2
      const max = Math.max(...highs) + 2
      const xFor = (i: number) => pad + (i / (history.length - 1)) * (w - pad * 2)
      const yFor = (m: number) => h - pad - ((m - min) / (max - min)) * (h - pad * 2)
      // área entre low e high
      ctx.beginPath()
      history.forEach((x, i) => (i === 0 ? ctx.moveTo(xFor(i), yFor(x.highMidi)) : ctx.lineTo(xFor(i), yFor(x.highMidi))))
      for (let i = history.length - 1; i >= 0; i--) ctx.lineTo(xFor(i), yFor(history[i].lowMidi))
      ctx.closePath()
      ctx.fillStyle = 'rgba(233,180,76,0.12)'
      ctx.fill()
      line(ctx, history.map((x, i) => [xFor(i), yFor(x.highMidi)]), COLORS.gold)
      line(ctx, history.map((x, i) => [xFor(i), yFor(x.lowMidi)]), COLORS.good)
    },
    [history.length],
  )
  return (
    <div className="chart-wrap">
      <canvas ref={ref} className="chart-canvas" />
      <div className="graph-legend" style={{ position: 'static', marginTop: 6 }}>
        <span style={{ color: COLORS.gold }}>● agudo</span>
        <span style={{ color: COLORS.good }}>● grave</span>
      </div>
    </div>
  )
}

function AccuracyChart({ values }: { values: number[] }) {
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 24
      const xFor = (i: number) => (values.length === 1 ? w / 2 : pad + (i / (values.length - 1)) * (w - pad * 2))
      const yFor = (v: number) => h - pad - (v / 100) * (h - pad * 2)
      // grade 50/100
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ;[0, 50, 100].forEach((g) => {
        ctx.beginPath()
        ctx.moveTo(pad, yFor(g))
        ctx.lineTo(w - pad, yFor(g))
        ctx.stroke()
      })
      const pts = values.map((v, i) => [xFor(i), yFor(v)] as [number, number])
      line(ctx, pts, COLORS.gold)
      pts.forEach(([x, y]) => {
        ctx.fillStyle = COLORS.gold
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    },
    [values.length],
  )
  return <canvas ref={ref} className="chart-canvas" />
}

function line(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string) {
  if (pts.length === 0) return
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.stroke()
}

function Heatmap({ days }: { days: string[] }) {
  const set = new Set(days)
  const cells: { key: string; done: boolean }[] = []
  const today = new Date()
  for (let i = 62; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ key, done: set.has(key) })
  }
  return (
    <div className="heat" style={{ marginTop: 14 }}>
      {cells.map((c) => (
        <div
          key={c.key}
          className="heat-cell"
          title={c.key}
          style={c.done ? { background: 'rgba(233,180,76,0.55)', border: '1px solid rgba(233,180,76,0.7)' } : undefined}
        />
      ))}
    </div>
  )
}
