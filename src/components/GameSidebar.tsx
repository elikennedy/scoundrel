import { MAX_HEALTH } from '../game'
import type { GameState } from '../game'
import { illustrations } from './cardIllustrations'
export function GameSidebar({ game }: { game: GameState }) {
  const lastMonster = game.weapon?.monsters.at(-1)
  const weapon = game.weapon && illustrations[game.weapon.card.id]
  return (
    <aside className="game-sidebar" aria-label="Adventurer status">
      <section className={`health-panel ${game.health <= 5 ? 'critical' : ''}`} aria-label="Health">
        <div className="health-value"><span>Health</span><strong>{game.health}<small> / {MAX_HEALTH}</small></strong></div>
        <progress max={MAX_HEALTH} value={Math.max(0, game.health)} aria-label={`Health: ${game.health} of ${MAX_HEALTH}`} />
        <p className={`potion-status ${game.potionUsed ? 'used' : ''}`}>{game.potionUsed ? 'Healing spent' : 'Healing ready'}</p>
      </section>
      <section className="weapon-panel" aria-label="Equipped weapon">
        {weapon?.src && <img src={weapon.src} alt="" />}
        <div><h3>{weapon?.name ?? 'Unarmed'}</h3><p>{game.weapon ? `${game.weapon.card.value} power · ${lastMonster ? `Next target ≤ ${lastMonster.value}` : 'Any target'}` : 'Find a weapon in the dungeon'}</p></div>
      </section>
      <div className="dungeon-pile"><img src="/art/ui/card-back.webp" alt="" /><dl className="dungeon-counts"><div><dt>Dungeon</dt><dd>{game.dungeon.length}</dd></div><div><dt>Discarded</dt><dd>{game.discard.length}</dd></div></dl></div>
    </aside>
  )
}
