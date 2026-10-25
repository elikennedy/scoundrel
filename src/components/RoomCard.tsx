import { cardName } from './cardPresentation'
import { CardFace } from './CardFace'
import { illustrations } from './cardIllustrations'
import { canUseWeapon, combatDamage, canActivateCosmic } from '../game'
import type { Card, GameAction, GameState } from '../game'
type Props = { card: Card; game: GameState; onAction: (action: GameAction) => void; busy?: boolean }
export function RoomCard({ card, game, onAction, busy }: Props) {
  const playing = game.status === 'playing' && !busy
  const weaponAllowed = card.kind === 'barricade' ? card.material !== 'pit' && game.weapon !== null : card.kind === 'monster' && canUseWeapon(game, card)
  const mirrorIncoming = game.mirrorRevealed ? game.dungeon[0] : undefined
  const mirrorName = mirrorIncoming && (illustrations[mirrorIncoming.id]?.name ?? cardName(mirrorIncoming))
  const healing = game.potionUsed ? 0 : Math.min(card.value, 20 - game.health)
  const labelId = `card-${card.id}`
  const name = illustrations[card.id]?.name ?? cardName(card)
  return (
    <article data-room-card={card.id} tabIndex={0} className={`room-card ${card.kind}`} aria-labelledby={labelId} aria-describedby={game.mirrorRevealed ? 'mirror-choice-help' : undefined}>
      <CardFace card={card} labelId={labelId} />
      <div className="card-actions">
        {game.mirrorRevealed ? <button className="action-cosmic" disabled={!playing} onClick={() => onAction({ type: 'mirror-exchange', cardId: card.id })} aria-label={`Exchange ${name} for ${mirrorName}; return ${name} to the top of the dungeon`}>Exchange<span>For top card</span></button> : card.kind === 'monster' ? <>
          <button className="action-weapon" disabled={!playing || !weaponAllowed} title={!game.weapon ? 'Equip a weapon first' : !weaponAllowed ? 'This monster exceeds your weapon limit' : undefined} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'weapon' })} aria-label={`Fight ${name} with weapon${weaponAllowed ? `, lose ${combatDamage(card, game.weapon!.card, game.weapon!.power)} health` : ', unavailable'}`}>Weapon <span>{weaponAllowed ? `−${combatDamage(card, game.weapon!.card, game.weapon!.power)} HP` : '—'}</span></button>
          <button className="barehanded" disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'barehanded' })} aria-label={`Fight ${name} barehanded, lose ${card.value} health`}>Barehanded <span>−{card.value} HP</span></button>
        </> : card.kind === 'barricade' ? <>
          {card.material !== 'pit' && <button className="action-weapon" disabled={!playing || !weaponAllowed} title={!game.weapon ? 'Equip a weapon first' : undefined} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'weapon' })} aria-label={`Clear ${name} with weapon, lose no health, ${game.weapon && game.weapon.power - card.value < 2 ? 'destroy your weapon' : `lose ${card.value} weapon power`}`}>Weapon<span>{game.weapon && game.weapon.power - card.value < 2 ? 'Breaks weapon' : `−${card.value} power`}</span></button>}
          <button className="barehanded" disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id, combat: 'barehanded' })} aria-label={`Clear ${name} barehanded, lose ${card.value} health`}>{card.material === 'pit' ? 'Clear' : 'Barehanded'}<span>−{card.value} HP</span></button>
        </> : card.kind === 'cosmic' ? <>
          <button className="action-cosmic" disabled={!playing || !canActivateCosmic(game, card)} title={!canActivateCosmic(game, card) ? card.id === 'cosmic-forge' ? 'Equip a weapon first' : 'Needs a dungeon card and another room card to exchange' : undefined} onClick={() => onAction({ type: 'resolve', cardId: card.id, cosmic: 'activate', ...(card.id === 'cosmic-fate' ? { randomSamples: Array.from({ length: Math.max(0, game.dungeon.length + game.room.length - 2) }, () => Math.random()) } : {}) })} aria-label={`Activate ${name}, ${card.id === 'cosmic-fate' ? 'reshuffle the remaining room into the dungeon and deal a fresh room' : card.id === 'cosmic-sight' ? 'lose 3 health and reveal the next three dungeon cards' : card.id === 'cosmic-mirror' ? 'reveal the next dungeon card, then exchange it with a remaining room card' : 'clear your weapon target restriction, keeping current power'}`}>Activate<span>{card.id === 'cosmic-fate' ? 'New room' : card.id === 'cosmic-sight' ? '−3 HP · Reveal' : card.id === 'cosmic-mirror' ? 'Reveal & swap' : 'Reset limit'}</span></button>
          <button className="action-discard" disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id, cosmic: 'discard' })} aria-label={`Discard ${name}, resolve one room slot`}>Discard<span>Pass</span></button>
        </> : card.kind === 'joker'  ? <>
          <button className="action-equip" disabled={!playing || !game.discard.length} title={!game.discard.length ? 'The discard pile is empty' : undefined} onClick={() => onAction({ type: 'resolve', cardId: card.id, joker: 'play', randomSample: Math.random() })} aria-label={`Play ${name}, exchange for a random discarded card`}>Play<span>Swap</span></button>
          <button className="barehanded" disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id, joker: 'discard' })} aria-label={`Discard ${name}`}>Discard<span>Pass</span></button>
        </> : <button className={card.kind === 'weapon' ? 'action-equip' : 'action-heal'} disabled={!playing} onClick={() => onAction({ type: 'resolve', cardId: card.id })} aria-label={`${card.kind === 'weapon' ? 'Equip' : game.potionUsed ? 'Discard' : 'Heal with'} ${name}${card.kind === 'potion' ? `, restore ${healing} health` : ''}`}>
          {card.kind === 'weapon' ? 'Equip' : game.potionUsed ? 'Discard' : 'Heal'}<span>{card.kind === 'weapon' ? `${card.value} power` : game.potionUsed ? 'Spent' : `+${healing} HP`}</span>
        </button>}
      </div>
    </article>
  )
}
