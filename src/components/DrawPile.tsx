import { useState } from 'react'
import type { Card, CardId } from '../game'
import { CardFace } from './CardFace'
import { cardName } from './cardPresentation'

function RevealedCards({ cards, mirror = false }: { cards: readonly Card[]; mirror?: boolean }) {
  const [open, setOpen] = useState(true)
  return <details className={`dungeon-sight ${mirror ? 'mirror-sight' : ''}`} open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>{mirror ? 'Mirror of Misfortune' : 'Revealed dungeon'} · {cards.length} <span>{open ? 'Hide' : 'Show'}</span></summary>
    <ol aria-label="Revealed dungeon cards in draw order">{cards.map((card, index) => <li key={card.id} aria-label={`${index + 1}: ${cardName(card)}`}>
      <p className="sight-order">{index === 0 ? 'Next' : index === 1 ? 'Then' : 'Third'}</p>
      <CardFace card={card} labelId={`sight-${card.id}`} />
    </li>)}</ol>
  </details>
}

export function DrawPile({ cards, revealedIds, mirrorCard }: { cards: readonly Card[]; revealedIds: readonly CardId[]; mirrorCard?: Card }) {
  const revealed = mirrorCard ? [mirrorCard] : cards.filter(card => revealedIds.includes(card.id))
  return <aside className={`table-pile draw-pile ${revealed.length ? 'has-sight' : ''}`} aria-label={`Draw pile: ${cards.length} cards`}>
    <img src="/art/ui/card-back.webp" alt="Draw pile" />
    <span>Dungeon <strong>{cards.length}</strong></span>
    {revealed.length > 0 && <RevealedCards key={`${mirrorCard ? 'mirror' : 'known'}-${revealed.map(card => card.id).join(',')}`} cards={revealed} mirror={!!mirrorCard} />}
  </aside>
}
