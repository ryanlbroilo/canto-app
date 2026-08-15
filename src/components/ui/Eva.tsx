// A mascote EVA (brasa-cantante) por emoção. Centraliza o mapa emoção → arquivo
// (public/brand/eva-*.png). Uso: <Eva mood="celebrate" size={80} />
export type EvaMood =
  | 'happy'
  | 'hello'
  | 'listening'
  | 'celebrate'
  | 'encourage'
  | 'streak'
  | 'resting'
  | 'sad'
  | 'thinking'
  | 'levelup'

const FILE: Record<EvaMood, string> = {
  happy: '/brand/eva.png',
  hello: '/brand/eva-hello.png',
  listening: '/brand/eva-listening.png',
  celebrate: '/brand/eva-celebrate.png',
  encourage: '/brand/eva-encourage.png',
  streak: '/brand/eva-streak.png',
  resting: '/brand/eva-resting.png',
  sad: '/brand/eva-sad.png',
  thinking: '/brand/eva-thinking.png',
  levelup: '/brand/eva-levelup.png',
}

export function Eva({ mood = 'happy', size = 72, className }: { mood?: EvaMood; size?: number; className?: string }) {
  return (
    <img
      src={FILE[mood]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'block', alignSelf: 'center', flex: 'none' }}
    />
  )
}
