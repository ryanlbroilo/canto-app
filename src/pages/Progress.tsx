import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../app/AppContext'
import { getRangeHistory } from '../data/store'
import { midiLabel } from '../audio/notes'
import { COLORS } from '../theme'
import { SKILL_BY_ID } from '../data/skills'
import { ACHIEVEMENTS } from '../data/achievements'
import { xpForSession, levelForXp } from '../data/xp'
import { Icon } from '../components/ui/Icon'
import type { SessionRecord, SkillProgress } from '../data/types'
import '../styles/progress.css'

// Cores das zonas de registro (espelham o contrato do prompt/tokens).
const REG_COLORS = {
  peito: '#e9b44c',
  mix: '#57d6a6',
  cabeca: '#7fb2ff',
  falsete: '#c48bff',
} as const

export default function Progress() {
  const { sessions, streak, baseline, gamification } = useApp()
  const history = getRangeHistory()
  const bestOct = history.length
    ? Math.max(...history.map((h) => (h.highMidi - h.lowMidi) / 12)).toFixed(1)
    : '—'

  // Sessões em ordem cronológica — base de todas as séries temporais.
  const ordered = [...sessions].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  // Sessões que carregam featureReport (as curvas ricas dependem disso).
  const withReport = ordered.filter((s) => s.featureReport)
  const totalBreaks = ordered.reduce((n, s) => n + registerBreaks(s), 0)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Progresso</h1>
          <p className="page-sub">
            Sua evolução real — competências, tendências, conquistas e XP ao longo do tempo.
          </p>
        </div>
      </div>

      {/* ---- Faixa de números-chave ---- */}
      <div className="stat-row reveal r0" style={{ marginBottom: 18 }}>
        <Stat value={String(streak.total)} label="Sessões totais" />
        <Stat value={`${streak.current}d`} label="Ofensiva atual" />
        <Stat value={`Nv ${gamification.level}`} label="Nível vocal" />
        <Stat value={String(bestOct)} label="Melhor extensão (oit.)" />
      </div>

      {/* ---- Nível global + XP no tempo ---- */}
      <div className="grid grid-2">
        <div className="card reveal r1">
          <span className="card-title">Nível vocal</span>
          <div className="pg-level" style={{ marginTop: 14 }}>
            <LevelRing
              level={gamification.level}
              into={gamification.xpIntoLevel}
              forNext={gamification.xpForNext}
            />
            <div className="pg-level-body">
              <div className="pg-level-xp">
                <b>{gamification.totalXp.toLocaleString('pt-BR')}</b> XP acumulado
              </div>
              <div className="pg-skill-bar" style={{ marginTop: 10 }}>
                <div
                  className="pg-skill-fill"
                  style={{
                    width: `${pct(gamification.xpIntoLevel, gamification.xpForNext)}%`,
                    ['--sk' as string]: COLORS.gold,
                  }}
                />
              </div>
              <p className="pg-level-xp" style={{ marginTop: 8 }}>
                Faltam {Math.max(0, gamification.xpForNext - gamification.xpIntoLevel)} XP para o
                nível {gamification.level + 1}
              </p>
            </div>
          </div>
        </div>

        <div className="card reveal r2">
          <div className="pg-chart-head">
            <span className="pg-chart-title">XP acumulado no tempo</span>
            <span className="pg-chart-value">{gamification.totalXp.toLocaleString('pt-BR')} XP</span>
          </div>
          {ordered.length >= 1 ? (
            <XpChart sessions={ordered} />
          ) : (
            <div className="pg-empty">
              O XP de cada treino vira uma curva aqui. Complete uma sessão para começar.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          1. Painel de Skills (árvore de competências)
          ========================================================= */}
      <SectionHead
        n={1}
        icon="route"
        title="Competências vocais"
        note="nível, média das últimas 5 e tendência"
      />
      <div className="card reveal r1">
        {gamification.skills.some((s) => s.xp > 0) ? (
          <div className="pg-skills">
            {gamification.skills.map((s) => (
              <SkillRow key={s.id} skill={s} />
            ))}
          </div>
        ) : (
          <Empty
            text="Cada exercício alimenta uma ou mais competências. Treine para ver sua árvore de habilidades crescer."
            action={
              <Link to="/exercicios" className="btn btn--sm">
                Treinar
              </Link>
            }
          />
        )}
      </div>

      {/* =========================================================
          2. Curvas de tendência (afinação, vibrato, estabilidade, registro)
          ========================================================= */}
      <SectionHead
        n={2}
        icon="chart"
        title="Tendências"
        note="derivadas dos relatórios de cada sessão"
      />
      <div className="pg-grid-2 reveal r1">
        {/* (a) Afinação com linha de tendência */}
        <div className="card">
          <div className="pg-chart-head">
            <span className="pg-chart-title">Afinação por sessão</span>
            <span className="pg-chart-value">
              {ordered.length ? `${ordered[ordered.length - 1].notesHitPct.toFixed(0)}%` : '—'}
            </span>
          </div>
          {ordered.length >= 1 ? (
            <AccuracyChart values={ordered.map((s) => s.notesHitPct)} />
          ) : (
            <div className="pg-empty">Sem sessões ainda.</div>
          )}
          <div className="pg-legend">
            <span className="pg-legend-item">
              <span className="pg-legend-dot" style={{ background: COLORS.gold }} /> % de notas na
              zona
            </span>
            <span className="pg-legend-item">
              <span
                className="pg-legend-dot"
                style={{ background: 'rgba(127,178,255,0.9)' }}
              />{' '}
              tendência
            </span>
          </div>
        </div>

        {/* (b) Vibrato — faixa saudável 5–7 Hz sombreada */}
        <div className="card">
          <div className="pg-chart-head">
            <span className="pg-chart-title">Vibrato (Hz)</span>
            <span className="pg-chart-value">faixa saudável 5–7 Hz</span>
          </div>
          {withReport.some((s) => s.featureReport!.performance.vibrato.present) ? (
            <VibratoChart sessions={withReport} />
          ) : (
            <div className="pg-empty">
              O vibrato aparece aqui quando o DSP o detecta numa sustentação. Segure notas longas
              para provocá-lo.
            </div>
          )}
        </div>

        {/* (c) Estabilidade (clarity) no tempo */}
        <div className="card">
          <div className="pg-chart-head">
            <span className="pg-chart-title">Estabilidade (clareza)</span>
            <span className="pg-chart-value">
              {withReport.length
                ? `${Math.round(
                    withReport[withReport.length - 1].featureReport!.performance.stability.clarity *
                      100,
                  )}%`
                : '—'}
            </span>
          </div>
          {withReport.length >= 1 ? (
            <StabilityChart sessions={withReport} />
          ) : (
            <div className="pg-empty">
              A clareza do sinal (menos ruído/quebras) é medida a cada sessão com relatório.
            </div>
          )}
        </div>

        {/* (d) Distribuição de registros — área empilhada */}
        <div className="card">
          <div className="pg-chart-head">
            <span className="pg-chart-title">Uso de registros</span>
            <span className="pg-chart-value">% do tempo por sessão</span>
          </div>
          {withReport.length >= 1 ? (
            <RegisterStack sessions={withReport} />
          ) : (
            <div className="pg-empty">
              Peito, mix, cabeça e falsete são cronometrados a cada sessão e empilhados aqui.
            </div>
          )}
          <div className="pg-legend">
            {(['peito', 'mix', 'cabeca', 'falsete'] as const).map((r) => (
              <span key={r} className="pg-legend-item">
                <span className="pg-legend-dot" style={{ background: REG_COLORS[r] }} />
                {r === 'cabeca' ? 'cabeça' : r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          3. Quebras de registro
          ========================================================= */}
      <SectionHead
        n={3}
        icon="bridge"
        title="Quebras de registro"
        note="transições abruptas entre registros"
      />
      <div className="card reveal r1">
        {withReport.length >= 1 ? (
          <div className="pg-breaks">
            <div>
              <div className={`pg-breaks-num${totalBreaks === 0 ? ' is-zero' : ''}`}>
                {totalBreaks}
              </div>
              <div className="pg-breaks-label">
                {totalBreaks === 0
                  ? 'nenhuma quebra detectada — passaggio limpo'
                  : `no total, em ${withReport.length} sessões com relatório`}
              </div>
            </div>
            <BreaksSparkline sessions={withReport} />
          </div>
        ) : (
          <Empty
            text="As quebras de registro (o famoso “gap” na passagem) são detectadas pelo DSP. Treine com relatório para acompanhá-las."
            action={
              <Link to="/exercicios" className="btn btn--sm">
                Treinar passaggio
              </Link>
            }
          />
        )}
      </div>

      {/* =========================================================
          4. Grade de conquistas
          ========================================================= */}
      <SectionHead
        n={4}
        icon="trophy"
        title="Conquistas"
        note={
          <>
            <span className="pg-ach-count">{gamification.achievements.length}</span> de{' '}
            {ACHIEVEMENTS.length} desbloqueadas
          </>
        }
      />
      <div className="card reveal r1">
        <div className="pg-ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const on = gamification.achievements.includes(a.id)
            return (
              <div key={a.id} className={`pg-ach ${on ? 'pg-ach--on' : 'pg-ach--off'}`}>
                <div className="pg-ach-icon">
                  <Icon name={a.icon} size={20} />
                </div>
                <div className="pg-ach-body">
                  <div className="pg-ach-label">
                    {a.label}
                    {!on && (
                      <span className="pg-ach-lock">
                        <Icon name="lock" size={13} />
                      </span>
                    )}
                  </div>
                  <div className="pg-ach-desc">{a.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* =========================================================
          5. Extensão + consistência (mantidos e enriquecidos)
          ========================================================= */}
      <SectionHead n={5} icon="gauge" title="Extensão e consistência" />
      <div className="grid grid-2 reveal r1">
        <div className="card">
          <span className="card-title">Evolução da extensão</span>
          {history.length >= 2 ? (
            <RangeChart history={history} />
          ) : (
            <Empty
              text="Refaça o teste de range algumas vezes para ver a evolução do grave ao agudo aqui."
              action={
                <Link to="/range" className="btn btn--sm">
                  Medir range
                </Link>
              }
            />
          )}
        </div>

        <div className="card">
          <span className="card-title">Consistência (últimas 9 semanas)</span>
          <Heatmap sessions={ordered} days={streak.days} />
        </div>
      </div>

      {baseline && (
        <p className="hint" style={{ marginTop: 16 }}>
          Range atual:{' '}
          <strong>
            {midiLabel(baseline.lowMidi)} → {midiLabel(baseline.highMidi)}
          </strong>{' '}
          · {baseline.voiceType} (aprox.)
        </p>
      )}
    </div>
  )
}

/* ============================================================
   Blocos de UI
   ============================================================ */

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

function SectionHead({
  n,
  icon,
  title,
  note,
}: {
  n: number
  icon: Parameters<typeof Icon>[0]['name']
  title: string
  note?: React.ReactNode
}) {
  return (
    <div className="pg-section-head reveal r0">
      <span className="pg-section-num">
        <Icon name={icon} size={15} />
      </span>
      <span className="pg-section-title">{title}</span>
      {note != null && <span className="pg-section-note">{note}</span>}
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

// Painel de uma skill: ícone/cor, nível, barra de XP no nível, média e tendência.
function SkillRow({ skill }: { skill: SkillProgress }) {
  const meta = SKILL_BY_ID[skill.id]
  const lv = levelForXp(skill.xp)
  const fill = pct(lv.xpIntoLevel, lv.xpForNext)
  const trend =
    skill.trend > 0.5
      ? ({ cls: 'up', arrow: '▲', text: 'melhorando' } as const)
      : skill.trend < -0.5
        ? ({ cls: 'down', arrow: '▼', text: 'caindo' } as const)
        : ({ cls: 'flat', arrow: '—', text: 'estável' } as const)
  return (
    <div className="pg-skill" style={{ ['--sk' as string]: meta.color }}>
      <div className="pg-skill-icon">
        <Icon name={meta.icon} size={22} />
      </div>
      <div className="pg-skill-body">
        <div className="pg-skill-top">
          <span className="pg-skill-name">{meta.name}</span>
          <span className="pg-skill-lvl">Nv {skill.level}</span>
        </div>
        <div className="pg-skill-bar">
          <div className="pg-skill-fill" style={{ width: `${fill}%` }} />
        </div>
        <div className="pg-skill-meta">
          <span>
            média <span className="pg-skill-avg">{skill.last5Avg.toFixed(0)}%</span>
          </span>
          <span className={`pg-trend pg-trend--${trend.cls}`} title={`Tendência: ${trend.text}`}>
            {trend.arrow} {trend.text}
          </span>
        </div>
      </div>
    </div>
  )
}

// Anel de nível (SVG) com progresso do XP dentro do nível atual.
function LevelRing({ level, into, forNext }: { level: number; into: number; forNext: number }) {
  const size = 92
  const r = 38
  const c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, forNext ? into / forNext : 0))
  return (
    <div className="pg-level-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          fill="var(--gold-2)"
          fontFamily="var(--font-display)"
          fontSize="26"
          fontWeight="600"
        >
          {level}
        </text>
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fill="var(--muted)"
          fontFamily="var(--font-ui)"
          fontSize="10"
          letterSpacing="0.12em"
        >
          NÍVEL
        </text>
      </svg>
    </div>
  )
}

/* ============================================================
   Hook de canvas (retina) — mesmo padrão do Progress original
   ============================================================ */
function useChart(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
) {
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

/* ============================================================
   Gráficos de canvas
   ============================================================ */

// XP cumulativo por sessão (área + linha).
function XpChart({ sessions }: { sessions: SessionRecord[] }) {
  // Série cumulativa somando xpForSession em ordem cronológica.
  const cum: number[] = []
  let acc = 0
  for (const s of sessions) {
    acc += xpForSession(s)
    cum.push(acc)
  }
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 22
      const max = Math.max(...cum, 1)
      const xFor = (i: number) =>
        cum.length === 1 ? w / 2 : pad + (i / (cum.length - 1)) * (w - pad * 2)
      const yFor = (v: number) => h - pad - (v / max) * (h - pad * 2)
      grid(ctx, w, h, pad)
      const pts = cum.map((v, i) => [xFor(i), yFor(v)] as [number, number])
      area(ctx, pts, h - pad, 'rgba(233,180,76,0.16)')
      line(ctx, pts, COLORS.gold)
      dots(ctx, pts, COLORS.gold)
    },
    [cum.length, cum.join(',')],
  )
  return <canvas ref={ref} className="pg-canvas" />
}

// Afinação por sessão + linha de tendência (regressão linear simples).
function AccuracyChart({ values }: { values: number[] }) {
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 22
      const xFor = (i: number) =>
        values.length === 1 ? w / 2 : pad + (i / (values.length - 1)) * (w - pad * 2)
      const yFor = (v: number) => h - pad - (v / 100) * (h - pad * 2)
      // grade 0/50/100
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ;[0, 50, 100].forEach((g) => {
        ctx.beginPath()
        ctx.moveTo(pad, yFor(g))
        ctx.lineTo(w - pad, yFor(g))
        ctx.stroke()
      })
      const pts = values.map((v, i) => [xFor(i), yFor(v)] as [number, number])
      line(ctx, pts, COLORS.gold)
      dots(ctx, pts, COLORS.gold)
      // linha de tendência (mínimos quadrados) quando há ≥2 pontos
      if (values.length >= 2) {
        const { a, b } = linreg(values)
        const y0 = yFor(clamp(b, 0, 100))
        const y1 = yFor(clamp(a * (values.length - 1) + b, 0, 100))
        ctx.strokeStyle = 'rgba(127,178,255,0.9)'
        ctx.lineWidth = 1.8
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        ctx.moveTo(xFor(0), y0)
        ctx.lineTo(xFor(values.length - 1), y1)
        ctx.stroke()
        ctx.setLineDash([])
      }
    },
    [values.length, values.join(',')],
  )
  return <canvas ref={ref} className="pg-canvas" />
}

// Vibrato: rateHz por sessão, com faixa saudável 5–7 Hz sombreada.
function VibratoChart({ sessions }: { sessions: SessionRecord[] }) {
  // Só sessões onde o vibrato foi detectado entram na série.
  const pts = sessions
    .map((s) => s.featureReport!.performance.vibrato)
    .map((v) => (v.present ? v.rateHz : null))
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 22
      const lo = 0
      const hi = 10 // escala fixa 0–10 Hz p/ contexto
      const n = pts.length
      const xFor = (i: number) => (n === 1 ? w / 2 : pad + (i / (n - 1)) * (w - pad * 2))
      const yFor = (v: number) => h - pad - ((v - lo) / (hi - lo)) * (h - pad * 2)
      // faixa saudável 5–7 Hz
      ctx.fillStyle = 'rgba(87,214,166,0.12)'
      ctx.fillRect(pad, yFor(7), w - pad * 2, yFor(5) - yFor(7))
      ctx.strokeStyle = 'rgba(87,214,166,0.35)'
      ctx.lineWidth = 1
      ;[5, 7].forEach((g) => {
        ctx.beginPath()
        ctx.moveTo(pad, yFor(g))
        ctx.lineTo(w - pad, yFor(g))
        ctx.stroke()
      })
      // liga apenas os pontos presentes (ignora nulos, sem interpolar por cima)
      const present = pts
        .map((v, i) => (v == null ? null : ([xFor(i), yFor(v)] as [number, number])))
        .filter((p): p is [number, number] => p != null)
      line(ctx, present, '#c48bff')
      present.forEach(([x, y], idx) => {
        // cor do ponto reflete se está na faixa saudável
        const raw = pts.filter((v) => v != null)[idx] as number
        const ok = raw >= 5 && raw <= 7
        ctx.fillStyle = ok ? COLORS.good : '#c48bff'
        ctx.beginPath()
        ctx.arc(x, y, 3.2, 0, Math.PI * 2)
        ctx.fill()
      })
    },
    [pts.join(',')],
  )
  return <canvas ref={ref} className="pg-canvas" />
}

// Estabilidade: stability.clarity (0..1) por sessão como área.
function StabilityChart({ sessions }: { sessions: SessionRecord[] }) {
  const vals = sessions.map((s) => s.featureReport!.performance.stability.clarity)
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 22
      const xFor = (i: number) => (vals.length === 1 ? w / 2 : pad + (i / (vals.length - 1)) * (w - pad * 2))
      const yFor = (v: number) => h - pad - clamp(v, 0, 1) * (h - pad * 2)
      grid(ctx, w, h, pad)
      const pts = vals.map((v, i) => [xFor(i), yFor(v)] as [number, number])
      area(ctx, pts, h - pad, 'rgba(87,214,166,0.14)')
      line(ctx, pts, COLORS.good)
      dots(ctx, pts, COLORS.good)
    },
    [vals.join(',')],
  )
  return <canvas ref={ref} className="pg-canvas" />
}

// Distribuição de registros: área 100% empilhada (peito/mix/cabeça/falsete).
function RegisterStack({ sessions }: { sessions: SessionRecord[] }) {
  // Normaliza registerTime (segundos) para frações por sessão.
  const rows = sessions.map((s) => {
    const rt = s.featureReport!.performance.registerTime
    const sum = rt.peito + rt.mix + rt.cabeca + rt.falsete || 1
    return {
      peito: rt.peito / sum,
      mix: rt.mix / sum,
      cabeca: rt.cabeca / sum,
      falsete: rt.falsete / sum,
    }
  })
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 22
      const n = rows.length
      const xFor = (i: number) => (n === 1 ? w / 2 : pad + (i / (n - 1)) * (w - pad * 2))
      const yFor = (v: number) => h - pad - v * (h - pad * 2)
      const order = ['peito', 'mix', 'cabeca', 'falsete'] as const
      // acumulado por sessão (base de cada camada)
      const base = rows.map(() => 0)
      for (const key of order) {
        // topo desta camada = base + valor
        const top = rows.map((r, i) => base[i] + r[key])
        ctx.beginPath()
        rows.forEach((_, i) => (i === 0 ? ctx.moveTo(xFor(i), yFor(top[i])) : ctx.lineTo(xFor(i), yFor(top[i]))))
        for (let i = n - 1; i >= 0; i--) ctx.lineTo(xFor(i), yFor(base[i]))
        ctx.closePath()
        ctx.fillStyle = hexToRgba(REG_COLORS[key], 0.55)
        ctx.fill()
        rows.forEach((_, i) => (base[i] = top[i]))
      }
    },
    [JSON.stringify(rows)],
  )
  return <canvas ref={ref} className="pg-canvas" />
}

// Extensão medida (grave/agudo) ao longo das medições de range.
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
      ctx.beginPath()
      history.forEach((x, i) =>
        i === 0 ? ctx.moveTo(xFor(i), yFor(x.highMidi)) : ctx.lineTo(xFor(i), yFor(x.highMidi)),
      )
      for (let i = history.length - 1; i >= 0; i--) ctx.lineTo(xFor(i), yFor(history[i].lowMidi))
      ctx.closePath()
      ctx.fillStyle = 'rgba(233,180,76,0.12)'
      ctx.fill()
      line(
        ctx,
        history.map((x, i) => [xFor(i), yFor(x.highMidi)]),
        COLORS.gold,
      )
      line(
        ctx,
        history.map((x, i) => [xFor(i), yFor(x.lowMidi)]),
        COLORS.good,
      )
    },
    [history.length],
  )
  return (
    <div className="chart-wrap">
      <canvas ref={ref} className="pg-canvas pg-canvas--tall" />
      <div className="pg-legend">
        <span className="pg-legend-item">
          <span className="pg-legend-dot" style={{ background: COLORS.gold }} /> agudo
        </span>
        <span className="pg-legend-item">
          <span className="pg-legend-dot" style={{ background: COLORS.good }} /> grave
        </span>
      </div>
    </div>
  )
}

// Mini-sparkline de quebras de registro por sessão (barras).
function BreaksSparkline({ sessions }: { sessions: SessionRecord[] }) {
  const counts = sessions.map((s) => registerBreaks(s))
  const ref = useChart(
    (ctx, w, h) => {
      const pad = 6
      const max = Math.max(...counts, 1)
      const n = counts.length
      const gap = 3
      const bw = Math.max(2, (w - pad * 2 - gap * (n - 1)) / n)
      counts.forEach((v, i) => {
        const x = pad + i * (bw + gap)
        const bh = (v / max) * (h - pad * 2)
        ctx.fillStyle = v === 0 ? 'rgba(87,214,166,0.4)' : COLORS.off
        const y = h - pad - bh
        const r = Math.min(2, bw / 2)
        roundRect(ctx, x, v === 0 ? h - pad - 2 : y, bw, v === 0 ? 2 : bh, r)
        ctx.fill()
      })
    },
    [counts.join(',')],
  )
  return <canvas ref={ref} className="pg-spark" />
}

// Heatmap de consistência enriquecido: intensidade pela duração somada no dia.
function Heatmap({ sessions, days }: { sessions: SessionRecord[]; days: string[] }) {
  // Minutos treinados por dia (para modular a intensidade da célula).
  const minsByDay = new Map<string, number>()
  for (const s of sessions) {
    const key = s.dateISO.slice(0, 10)
    minsByDay.set(key, (minsByDay.get(key) ?? 0) + s.durationSec / 60)
  }
  const set = new Set(days)
  const cells: { key: string; done: boolean; mins: number }[] = []
  const today = new Date()
  for (let i = 62; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ key, done: set.has(key), mins: minsByDay.get(key) ?? 0 })
  }
  // intensidade 0.35..1 saturando em ~20 min/dia
  const alphaFor = (mins: number) => 0.35 + Math.min(1, mins / 20) * 0.55
  return (
    <>
      <div className="heat" style={{ marginTop: 14 }}>
        {cells.map((c) => (
          <div
            key={c.key}
            className="heat-cell"
            title={c.done ? `${c.key} · ${Math.round(c.mins)} min` : c.key}
            style={
              c.done
                ? {
                    background: `rgba(233,180,76,${alphaFor(c.mins).toFixed(2)})`,
                    border: '1px solid rgba(233,180,76,0.6)',
                  }
                : undefined
            }
          />
        ))}
      </div>
      <div className="pg-heat-legend">
        <span>menos</span>
        <span className="pg-heat-scale">
          {[0.35, 0.55, 0.75, 0.9].map((a) => (
            <span
              key={a}
              className="pg-heat-swatch"
              style={{ background: `rgba(233,180,76,${a})` }}
            />
          ))}
        </span>
        <span>mais tempo no dia</span>
      </div>
    </>
  )
}

/* ============================================================
   Helpers de desenho e cálculo
   ============================================================ */
function line(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string) {
  if (pts.length === 0) return
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.stroke()
}
function area(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  baseY: number,
  fill: string,
) {
  if (pts.length === 0) return
  ctx.beginPath()
  ctx.moveTo(pts[0][0], baseY)
  pts.forEach(([x, y]) => ctx.lineTo(x, y))
  ctx.lineTo(pts[pts.length - 1][0], baseY)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}
function dots(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string) {
  ctx.fillStyle = color
  pts.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}
function grid(ctx: CanvasRenderingContext2D, w: number, h: number, pad: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ;[0, 0.5, 1].forEach((f) => {
    const y = pad + f * (h - pad * 2)
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(w - pad, y)
    ctx.stroke()
  })
}
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
// Regressão linear (mínimos quadrados) sobre índice → valor.
function linreg(ys: number[]): { a: number; b: number } {
  const n = ys.length
  let sx = 0
  let sy = 0
  let sxy = 0
  let sxx = 0
  ys.forEach((y, x) => {
    sx += x
    sy += y
    sxy += x * y
    sxx += x * x
  })
  const denom = n * sxx - sx * sx || 1
  const a = (n * sxy - sx * sy) / denom
  const b = (sy - a * sx) / n
  return { a, b }
}
function registerBreaks(rec: SessionRecord): number {
  return (rec.featureReport?.performance.events ?? []).filter((e) => e.type === 'register_break')
    .length
}
function pct(into: number, forNext: number): number {
  return forNext > 0 ? Math.max(0, Math.min(100, (into / forNext) * 100)) : 0
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
