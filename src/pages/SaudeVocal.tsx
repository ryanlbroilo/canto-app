import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import '../styles/saude.css'
import { useApp } from '../app/AppContext'
import { vocalHealthToday, weeklyLoad, VocalSignal } from '../data/vocalHealth'
import { Icon } from '../components/ui/Icon'

const SIGNAL_LABEL: Record<VocalSignal, string> = {
  saudavel: 'Voz saudável',
  cansaco: 'Sinais de cansaço',
  tensao: 'Sinais de tensão',
}

export default function SaudeVocal() {
  const { sessions } = useApp()
  const today = useMemo(() => vocalHealthToday(sessions), [sessions])
  const week = useMemo(() => weeklyLoad(sessions), [sessions])
  const maxMin = Math.max(10, ...week.map((d) => d.min))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Saúde vocal</h1>
          <p className="page-sub">
            Sua voz é um músculo — cresce com aquecimento, dosagem e descanso. Aqui você acompanha o esforço, aquece e
            desaquece com segurança. Nenhum áudio sai do seu aparelho.
          </p>
        </div>
      </div>

      {/* Sinal do dia */}
      <div className="vh-signal card card--glow reveal" data-tone={today.tone}>
        <div className="vh-signal-dot" data-tone={today.tone}>
          <Icon name="lungs" size={22} />
        </div>
        <div className="grow">
          <div className="vh-signal-tag">{SIGNAL_LABEL[today.signal]} · hoje</div>
          <div className="vh-signal-headline">{today.headline}</div>
          <p className="vh-signal-advice">{today.advice}</p>
        </div>
      </div>

      {/* Rotinas */}
      <div className="vh-routines reveal r1">
        <Link to="/aquecimento" className="vh-routine">
          <span className="vh-routine-ico" data-kind="warm"><Icon name="flame" size={20} /></span>
          <div>
            <div className="vh-routine-title">Aquecer agora</div>
            <div className="vh-routine-sub">SOVT leve antes de cantar — solta a laringe e liga o apoio.</div>
          </div>
          <Icon name="chevron" size={18} />
        </Link>
        <Link to="/desaquecimento" className="vh-routine">
          <span className="vh-routine-ico" data-kind="cool"><Icon name="wave" size={20} /></span>
          <div>
            <div className="vh-routine-title">Desaquecer</div>
            <div className="vh-routine-sub">Depois de cantar — sirenes graves que tiram a tensão das pregas.</div>
          </div>
          <Icon name="chevron" size={18} />
        </Link>
      </div>

      {/* Carga da semana */}
      <div className="card reveal r2" style={{ marginTop: 18 }}>
        <div className="row spread" style={{ alignItems: 'baseline' }}>
          <span className="card-title">Carga vocal · 7 dias</span>
          <span className="vh-today-load">{today.loadMin} min hoje{today.sessions ? ` · ${today.sessions} sessõe${today.sessions === 1 ? '' : 's'}` : ''}</span>
        </div>
        <div className="vh-week">
          {week.map((d, i) => {
            const h = Math.round((d.min / maxMin) * 100)
            const isToday = i === week.length - 1
            return (
              <div className="vh-day" key={d.day}>
                <div className="vh-bar-track">
                  <div className="vh-bar" data-today={isToday} data-heavy={d.min >= 30} style={{ height: `${d.min ? Math.max(6, h) : 0}%` }} title={`${d.min} min`} />
                </div>
                <div className="vh-day-min">{d.min || ''}</div>
                <div className="vh-day-label" data-today={isToday}>{d.label}</div>
              </div>
            )
          })}
        </div>
        <p className="hint" style={{ marginTop: 10, fontSize: 12.5 }}>
          Barras em coral marcam dias pesados (30+ min de fonação). Alternar dias de esforço com dias leves protege a voz.
        </p>
      </div>

      {/* Hábitos — educação baseada em evidência */}
      <div className="card reveal r3" style={{ marginTop: 18 }}>
        <span className="card-title">Higiene vocal — o que a ciência recomenda</span>
        <div className="vh-tips">
          <Tip icon="wave" title="Hidrate a voz">Água ao longo do dia mantém as pregas lubrificadas. A hidratação age por horas — não adianta só um gole antes de cantar.</Tip>
          <Tip icon="flame" title="Sempre aqueça (e desaqueça)">Exercícios semi-ocluídos (canudo, lip trill, humming) reduzem a pressão nas pregas e a fadiga — a evidência mais sólida do treino vocal.</Tip>
          <Tip icon="lungs" title="Descanso é treino">A voz se reconstrói no repouso. Depois de dias pesados ou sinais de cansaço, um dia de folga fortalece, não enfraquece.</Tip>
          <Tip icon="target" title="Sem empurrar">Dor, ardência ou rouquidão ao cantar são sinais de esforço errado. Menos força, mais fluxo — e pare se doer.</Tip>
        </div>
      </div>

      {/* Sinal de alerta + disclaimer */}
      <div className="vh-alert reveal r3">
        <Icon name="lock" size={16} />
        <p>
          <strong>Isto não é diagnóstico médico.</strong> Os sinais aqui são de bem-estar, não de saúde clínica. Rouquidão,
          dor ou perda de voz que <strong>durem mais de 2 semanas</strong> pedem um <strong>fonoaudiólogo ou otorrinolaringologista</strong> — quem cuida da voz de verdade.
        </p>
      </div>
    </div>
  )
}

function Tip({ icon, title, children }: { icon: 'wave' | 'flame' | 'lungs' | 'target'; title: string; children: ReactNode }) {
  return (
    <div className="vh-tip">
      <span className="vh-tip-ico"><Icon name={icon} size={16} /></span>
      <div>
        <div className="vh-tip-title">{title}</div>
        <p className="vh-tip-body">{children}</p>
      </div>
    </div>
  )
}
