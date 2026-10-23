import { useEffect, useRef, useState } from 'react'
import { applyAction, canFlee, createDeck, createInitialState, shuffleDeck } from './game'
import type { GameAction } from './game'
import { RoomCard } from './components/RoomCard'
import { cardName } from './components/cardPresentation'
import { GameSidebar } from './components/GameSidebar'
import './App.css'

function App() {
  const [game, setGame] = useState(createInitialState)
  const [announcement, setAnnouncement] = useState('Your adventure awaits.')
  const roomHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const moveFocus = useRef(false)
  const playing = game.status === 'playing'
  const finished = game.status === 'won' || game.status === 'lost'

  useEffect(() => {
    if (moveFocus.current) {
      (finished ? resultHeading : roomHeading).current?.focus()
      moveFocus.current = false
    }
  }, [game, finished])

  function act(action: GameAction) {
    const result = applyAction(game, action)
    if (!result.ok) {
      setAnnouncement(`That action is unavailable: ${result.error.replaceAll('-', ' ')}.`)
      return
    }
    const next = result.state
    let message = ''
    if (action.type === 'start') message = 'A fresh dungeon. Room 1 revealed.'
    if (action.type === 'flee') message = `You fled. Room ${next.roomNumber} revealed. You must face this room.`
    if (action.type === 'resolve') {
      const card = game.room.find((entry) => entry.id === action.cardId)!
      if (card.kind === 'monster') message = `Defeated ${cardName(card)} ${action.combat === 'weapon' ? 'with your weapon' : 'barehanded'}. Lost ${game.health - next.health} health.`
      if (card.kind === 'weapon') message = `Equipped ${cardName(card)}. Weapon power ${card.value}.`
      if (card.kind === 'potion') message = game.potionUsed ? `Discarded ${cardName(card)}. Healing already used this turn.` : `Drank ${cardName(card)}. Restored ${next.health - game.health} health.`
      if (next.roomNumber !== game.roomNumber && next.status === 'playing') message += ` Room ${next.roomNumber} revealed.`
    }
    if (next.status === 'won') message += ` Dungeon cleared. Final score ${next.score}.`
    if (next.status === 'lost') message += ` Your journey ends. Final score ${next.score}.`
    setAnnouncement(message)
    moveFocus.current = true
    setGame(next)
  }

  function start() { act({ type: 'start', deck: shuffleDeck(createDeck()) }) }
  const fleeReason = game.resolvedThisRoom > 0 ? 'You have already entered this room.'
    : game.previousRoomFled ? 'You fled the last room. Stand your ground.'
    : game.room.length < 4 ? 'The final cards must be faced.' : 'Return this room to the bottom of the dungeon.'

  return (
    <main className={`app-shell ${game.status === 'ready' ? 'at-gate' : 'at-table'}`}>
      <header className="masthead">
        <h1>Scoundrel</h1>
        {playing && <button className="quiet-button" onClick={start}>New game</button>}
      </header>
      {game.status === 'ready' ? (
        <section className="welcome" aria-label="Begin a game">
          <img className="welcome-deck" src="/art/ui/card-back.webp" alt="An ancient deck embossed with a horned skull" />
          <button className="primary-button" onClick={start}>Enter the dungeon</button>
        </section>
      ) : (
        <div className="game-layout">
          <div className="play-area">
            {finished && <section className={`result ${game.status}`} aria-labelledby="result-title"><h2 id="result-title" ref={resultHeading} tabIndex={-1}>{game.status === 'won' ? 'You survived.' : 'Your descent ends.'}</h2><p>Score <strong>{game.score}</strong></p><button className="primary-button" onClick={start}>Play again</button></section>}
            <section className="room-section" aria-labelledby="room-title">
              <div className="section-heading"><h2 id="room-title" ref={roomHeading} tabIndex={-1}>Room {game.roomNumber}</h2><span className="turn-counter" aria-label={`${game.resolvedThisRoom} of 3 cards resolved`}>{[0,1,2].map(i => <i key={i} className={i < game.resolvedThisRoom ? 'resolved' : ''} aria-hidden="true" />)}</span></div>
              <div className="room-grid">{game.room.map((card) => <RoomCard key={card.id} card={card} game={game} onAction={act} />)}{game.room.length === 0 && <p className="empty-room">The dungeon is cleared.</p>}</div>
              {playing && <div className="room-footer"><button className="secondary-button" disabled={!canFlee(game)} aria-describedby="flee-reason" onClick={() => act({ type: 'flee' })}>Flee room</button><p className="small-note" id="flee-reason">{!canFlee(game) ? fleeReason : ''}</p></div>}
            </section>
          </div>
          <GameSidebar game={game} />
        </div>
      )}
      <p className="activity" role="status" aria-live="polite" aria-atomic="true">{game.status !== 'ready' ? announcement : ''}</p>
      <details className="rules"><summary>Rules</summary><div className="rules-grid"><p><strong>Monsters</strong>Fight barehanded for full damage, or use a weapon to reduce damage by its power. After a weapon kill, it can only face monsters of equal or lower value.</p><p><strong>Weapons</strong>Taking a weapon equips it immediately, replacing your old one and resetting its monster limit. You may always choose to fight barehanded.</p><p><strong>Healing</strong>Heal up to 20 health. Only the first potion you take each turn heals; the others are discarded. Resolve three cards to begin the next turn.</p><p><strong>Escape</strong>Flee before touching any card. The room goes to the bottom of the deck. You cannot flee twice in a row. Clear all cards to win; reach zero health and your journey ends.</p></div></details>
      <footer className="credits"><span>Zach Gage &amp; Kurt Bieg</span><a href="https://www.stfj.net/art/2011/Scoundrel.pdf" target="_blank" rel="noreferrer">Original rules</a></footer>
    </main>
  )
}
export default App
