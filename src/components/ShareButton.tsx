import { useState } from 'react'
import { Icon } from './ui/Icon'
import { shareCard, ShareCardData } from '../share/shareCard'

// Botão que gera o card device-local e dispara o compartilhamento (Web Share no
// mobile; download da imagem no desktop). Nada vai pra servidor.
export function ShareButton({
  data,
  filename = 'canto.png',
  label = 'Compartilhar',
  className = 'btn btn--sm',
}: {
  data: ShareCardData
  filename?: string
  label?: string
  className?: string
}) {
  const [state, setState] = useState<'idle' | 'working' | 'shared' | 'downloaded' | 'failed'>('idle')

  async function onClick() {
    setState('working')
    const r = await shareCard(data, filename)
    if (r === 'cancelled') {
      setState('idle') // cancelamento do usuário não é erro
      return
    }
    setState(r)
    window.setTimeout(() => setState('idle'), 2600)
  }

  const text =
    state === 'working'
      ? 'Gerando…'
      : state === 'downloaded'
        ? 'Imagem salva'
        : state === 'shared'
          ? 'Compartilhado'
          : state === 'failed'
            ? 'Tente de novo'
            : label
  const icon = state === 'shared' || state === 'downloaded' ? 'check' : 'send'

  return (
    <button className={className} onClick={onClick} disabled={state === 'working'}>
      <Icon name={icon} size={14} /> {text}
    </button>
  )
}
