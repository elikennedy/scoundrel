import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Card } from '../game'
import { FIRST_BLOOD_GRACE_MS } from '../game'
import { CardFace } from './CardFace'
import { cardName } from './cardPresentation'
import { illustrations } from './cardIllustrations'

export function DiscardPile({ cards, bleeding = false, bleedElapsedMs = 0 }: { cards: readonly Card[]; bleeding?: boolean; bleedElapsedMs?: number }) {
  const [open, setOpen] = useState(false)
  const recent = cards.slice(-5)
  const graceExpired = bleedElapsedMs >= FIRST_BLOOD_GRACE_MS
  return <aside className={`table-pile discard-pile ${open ? 'fan-open' : ''}`} aria-label={`Discard pile: ${cards.length} cards`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
    {bleeding && <div className="bleeding-indicator" role="timer" aria-live="off" aria-label={graceExpired ? 'Bleeding: losing 1 health per second' : `Bleeding: ${Math.ceil((FIRST_BLOOD_GRACE_MS - bleedElapsedMs) / 1000)} seconds of grace remaining`}>
      {graceExpired ? <img className="bleeding-warning-art" src="/art/ui/bleeding.webp" alt="Bleeding" /> : <div className={`bleeding-timer ${bleedElapsedMs === 0 ? 'grace-reset' : ''}`} aria-hidden="true" style={{ '--bleed-fill': `${Math.min(1, bleedElapsedMs / FIRST_BLOOD_GRACE_MS)}turn` } as CSSProperties} />}
    </div>}
    <div className="discard-stack" data-discard-target>
      {!recent.length && <div className="empty-discard" />}
      {recent.map((card, i) => <div key={card.id} tabIndex={0} className="discard-card" aria-label={illustrations[card.id]?.name ?? cardName(card)} style={{ '--depth': recent.length - 1 - i, zIndex: i + 1 } as CSSProperties}>
        <CardFace card={card} labelId={`discard-${card.id}`} />
      </div>)}
    </div>
    <span>Discard <strong>{cards.length}</strong></span>
  </aside>
}
