import type { Card } from '../game'
import { CardFace } from './CardFace'
import { cardName } from './cardPresentation'

export type DungeonReveal = Readonly<{ cards: readonly Card[]; mirror: boolean }>

export function DrawPile({ cards, reveal, onDismissReveal }: { cards: readonly Card[]; reveal: DungeonReveal | null; onDismissReveal: () => void }) {
  return <aside className={`table-pile draw-pile ${reveal ? 'has-sight' : ''}`} aria-label={`Draw pile: ${cards.length} cards`}>
    <img src="/art/ui/card-back.webp" alt="Draw pile" />
    <span>Dungeon <strong>{cards.length}</strong></span>
    {reveal && reveal.cards.length > 0 && <div className={`dungeon-sight ${reveal.mirror ? 'mirror-sight' : ''}`} role="region" aria-label="Revealed dungeon cards" onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onDismissReveal() }
    }}>
      <button className="sight-close" type="button" aria-label="Close revealed cards" onClick={onDismissReveal}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <ol aria-label="Revealed dungeon cards in draw order">{reveal.cards.map((card, index) => <li key={card.id} aria-label={`${index + 1}: ${cardName(card)}`}>
        <p className="sight-order">{index === 0 ? 'Next' : index === 1 ? 'Then' : 'Third'}</p>
        <CardFace card={card} labelId={`sight-${card.id}`} />
      </li>)}</ol>
    </div>}
  </aside>
}
