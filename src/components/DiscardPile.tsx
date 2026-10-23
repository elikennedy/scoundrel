import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Card } from '../game'
import { CardFace } from './CardFace'
import { cardName } from './cardPresentation'
import { illustrations } from './cardIllustrations'

export function DiscardPile({ cards }: { cards: readonly Card[] }) {
  const [open, setOpen] = useState(false)
  const recent = cards.slice(-5)
  return <aside className={`table-pile discard-pile ${open ? 'fan-open' : ''}`} aria-label={`Discard pile: ${cards.length} cards`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
    <div className="discard-stack" data-discard-target>
      {!recent.length && <div className="empty-discard" />}
      {recent.map((card, i) => <div key={card.id} tabIndex={0} className="discard-card" aria-label={illustrations[card.id]?.name ?? cardName(card)} style={{ '--depth': recent.length - 1 - i, zIndex: i + 1 } as CSSProperties}>
        <CardFace card={card} labelId={`discard-${card.id}`} />
      </div>)}
    </div>
    <span>Discard <strong>{cards.length}</strong></span>
  </aside>
}
