import { useEffect, useId, useState } from 'react'
import './TableTool.css'

type Props = { className: string; label: string; tooltip: string; onClick: () => void }

export function TableTool({ className, label, tooltip, onClick }: Props) {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    if (!hovered) return
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setDismissed(true) }
    document.addEventListener('keydown', dismiss)
    return () => document.removeEventListener('keydown', dismiss)
  }, [hovered])
  return <span className="table-tool" onPointerEnter={() => { setHovered(true); setDismissed(false) }} onPointerLeave={() => setHovered(false)} onFocus={() => setDismissed(false)} onKeyDown={event => {
    if (event.key === 'Escape') { setDismissed(true); event.stopPropagation() }
  }}>
    <button className={`medallion ${className}`} aria-label={label} aria-describedby={id} onClick={onClick} />
    <span className={`table-tooltip${dismissed ? ' is-dismissed' : ''}`} role="tooltip" id={id}>{tooltip}</span>
  </span>
}
