// Conjunto de ícones (SVG inline, stroke). Sem dependências.
// Uso: <Icon name="mic" />

type IconName =
  | 'home'
  | 'mic'
  | 'gauge'
  | 'dumbbell'
  | 'chart'
  | 'spark'
  | 'settings'
  | 'chevron'
  | 'menu'
  | 'play'
  | 'flame'
  | 'wave'
  | 'target'
  | 'check'
  | 'lungs'
  | 'send'
  | 'lock'
  | 'trophy'
  | 'medal'
  | 'star'
  | 'bolt'
  | 'music'
  | 'route'
  | 'crown'
  | 'bridge'
  | 'church'
  | 'note'
  | 'shield'
  | 'mail'
  | 'download'

const PATHS: Record<IconName, JSX.Element> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9" />,
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  gauge: (
    <>
      <path d="M12 13a1 1 0 0 0 1-1l3-5" />
      <path d="M4.5 18a9 9 0 1 1 15 0" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16l3-4 3 2 4-6" />,
  spark: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  play: <path d="M7 4.5 19 12 7 19.5z" />,
  flame: <path d="M12 3c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 2 2 2 3 1-.5-2-1-4 0-6z" />,
  wave: <path d="M2 12h2l2-6 3 14 3-18 3 12 2-4h2" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  check: <path d="M4 12.5 9 17.5 20 6.5" />,
  lungs: <path d="M12 3v9M8 8c-3 1-4 4-4 8 0 2 3 2 4 0 1-2 1-5 0-8zM16 8c3 1 4 4 4 8 0 2-3 2-4 0-1-2-1-5 0-8z" />,
  send: <path d="M4 12 20 4l-6 16-3-7-7-1z" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M10 15h4M9 20h6M12 15v5" />
    </>
  ),
  medal: (
    <>
      <path d="M8 3 6 9M16 3l2 6M9 3h6" />
      <circle cx="12" cy="15" r="5" />
      <path d="M12 13v4M10.5 15h3" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M9 19h6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6" />
    </>
  ),
  crown: <path d="M4 8l3 9h10l3-9-5 4-3-6-3 6z" />,
  bridge: (
    <>
      <path d="M3 8c4 0 6 3 9 3s5-3 9-3" />
      <path d="M3 8v8M21 8v8M9 11v5M15 11v5M3 16h18" />
    </>
  ),
  church: (
    <>
      <path d="M12 2v4M10.5 4h3" />
      <path d="M12 7 5 11v9h14v-9z" />
      <path d="M9.5 20v-4a2.5 2.5 0 0 1 5 0v4" />
    </>
  ),
  note: (
    <>
      <path d="M10 17V3l8 2.4" />
      <circle cx="7" cy="17" r="3" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  download: <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />,
}

// v2 chunky: ícones-forma fechada renderizam SÓLIDOS (fill); o resto é traço grosso.
const SOLID = new Set<IconName>(['flame', 'star', 'play', 'crown', 'bolt', 'shield'])

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const solid = SOLID.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={solid ? 0 : 2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export type { IconName }
