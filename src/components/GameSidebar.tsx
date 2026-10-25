import { MAX_HEALTH } from '../game'
import type { GameState } from '../game'
import { CardFace } from './CardFace'
import { illustrations } from './cardIllustrations'
export function GameSidebar({ game }: { game: GameState }) {
  const lastMonster = game.weapon?.monsters.at(-1)
  const weapon = game.weapon && illustrations[game.weapon.card.id]
  return (
    <aside className="game-sidebar" aria-label="Adventurer status">
      <section className={`health-panel ${game.health <= 5 ? 'critical' : ''}`} aria-label="Health">
        <div className="health-value"><span>Health</span><strong>{game.health}<small> / {MAX_HEALTH}</small></strong></div>
        <progress max={MAX_HEALTH} value={Math.max(0, game.health)} aria-label={`Health: ${game.health} of ${MAX_HEALTH}`} />

      </section>
      <section className="weapon-panel" aria-label="Equipped weapon">
        <div className={`equipped-stack ${game.weapon ? 'armed' : 'unarmed'}`} data-weapon-target>
          {!game.weapon && <img className="unarmed-icon" src="/art/ui/control-4.png" alt="" />}
          {game.weapon?.monsters.slice(-3).map((card, i) => <div key={card.id} className="weapon-trophy" style={{ transform: `translate(${(i + 1) * 12}px,${-(i + 1) * 7}px) rotate(${(i + 1) * 7}deg)` }}><CardFace card={card} labelId={`trophy-${card.id}`} /></div>)}
          {game.weapon && <div className="equipped-face"><CardFace card={game.weapon.card} labelId="equipped-card" valueOverride={game.weapon.power} /></div>}
        </div>
        <div><h3>{weapon?.name ?? 'Barehanded'}</h3>{game.weapon && <p><strong>{game.weapon.power}</strong> power · {lastMonster ? `Next target ≤ ${lastMonster.value}` : 'Any target'}</p>}</div>
      </section>

    </aside>
  )
}
