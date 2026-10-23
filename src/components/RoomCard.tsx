import { cardName } from './cardPresentation'
import { CardFace } from './CardFace'
import { illustrations } from './cardIllustrations'
import { canUseWeapon, combatDamage } from '../game'
import type { Card, GameAction, GameState } from '../game'
type Props = { card: Card; game: GameState; onAction: (action: GameAction) => void }
export function RoomCard({ card, game, onAction }: Props) {
  const playing = game.status === 'playing'
  const weaponAllowed = card.kind === 'monster' && canUseWeapon(game, card)
  const healing = game.potionUsed ? 0 : Math.min(card.value, 20 - game.health)
  const labelId = `card-${card.id}`
  const name = illustrations[card.id]?.name ?? cardName(card)
  return (
    <article className={`room-card ${card.kind}`} aria-labelledby={labelId}>
      <CardFace card={card} labelId={labelId} />
      <div className="card-actions">
        {card.kind === 'monster' ? <>
          <button disabled={!playing || !weaponAllowed} title={!game.weapon ? 'Equip a weapon first' : !weaponAllowed ? 'This monster exceeds your weapon limit' : undefined} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'weapon' })} aria-label={`Fight ${name} with weapon${weaponAllowed ? `, lose ${combatDamage(card, game.weapon!.card)} health` : ', unavailable'}`}>Weapon <span>{weaponAllowed ? `−${combatDamage(card, game.weapon!.card)} HP` : '—'}</span></button>
          <button className="barehanded" disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'barehanded' })} aria-label={`Fight ${name} barehanded, lose ${card.value} health`}>Barehanded <span>−{card.value} HP</span></button>
        </> : <button disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id })} aria-label={`${card.kind === 'weapon' ? 'Equip' : game.potionUsed ? 'Discard' : 'Heal with'} ${name}${card.kind === 'potion' ? `, restore ${healing} health` : ''}`}>
          {card.kind === 'weapon' ? 'Equip' : game.potionUsed ? 'Discard' : 'Heal'}<span>{card.kind === 'weapon' ? `${card.value} power` : game.potionUsed ? 'Spent' : `+${healing} HP`}</span>
        </button>}
      </div>
    </article>
  )
}
