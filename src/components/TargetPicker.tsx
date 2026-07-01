import { noteList } from '../audio/notes'

const NOTES = noteList(40, 79) // E2..G5

/** Seletor da nota-alvo. "Livre" = modo afinador (sem alvo). */
export function TargetPicker({
  target,
  onChange,
}: {
  target: number | null
  onChange: (midi: number | null) => void
}) {
  return (
    <label className="field" style={{ minWidth: 150 }}>
      <span className="field-label">Nota-alvo</span>
      <select
        className="select"
        value={target ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      >
        <option value="">Livre (afinador)</option>
        {NOTES.map((n) => (
          <option key={n.midi} value={n.midi}>
            {n.label}
          </option>
        ))}
      </select>
    </label>
  )
}
