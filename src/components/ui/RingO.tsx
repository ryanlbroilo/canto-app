// O "o" da marca: um anel de afinação (âmbar) com um ponto no centro (brasa) —
// cabeça de nota / alvo "no tom". Usado no wordmark "Cant(o)". Theme-aware.
export function RingO({ size = '0.82em' }: { size?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="o"
      style={{ width: size, height: size, verticalAlign: '-0.08em', flex: 'none' }}
    >
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gold)" strokeWidth="16" />
      <circle cx="50" cy="50" r="14" fill="var(--ember)" />
    </svg>
  )
}
