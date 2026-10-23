import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { applyAction, canFlee, createDeck, createInitialState, shuffleDeck } from './game'
import type { Card, GameAction } from './game'
import { RoomCard } from './components/RoomCard'
import { cardName } from './components/cardPresentation'
import { GameSidebar } from './components/GameSidebar'
import { HowToPlay } from './components/HowToPlay'
import { DiscardPile } from './components/DiscardPile'
import { cardElement, flyCard, hideCardSource } from './components/cardMotion'
import './App.css'

function App() {
  const [slots, setSlots] = useState<(Card | null)[]>([null, null, null, null])
  const [healthPreview, setHealthPreview] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [hiddenCards, setHiddenCards] = useState<string[]>([])
  const motion = useRef(new AbortController())
  const locked = useRef(false)
  const incoming = useRef<Card[]>([])
  useEffect(() => () => motion.current.abort(), [])
  const resultDialog = useRef<HTMLDialogElement>(null)
  const rulesDialog = useRef<HTMLDialogElement>(null)
  const [game, setGame] = useState(createInitialState)
  const [announcement, setAnnouncement] = useState('Your adventure awaits.')
  const roomHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const moveFocus = useRef(false)
  const playing = game.status === 'playing'
  const finished = game.status === 'won' || game.status === 'lost'

  useLayoutEffect(() => {
    // Restore only after React has committed the new slots, before the next paint.
    document.querySelectorAll<HTMLElement>('.room-card, .equipped-stack .card-face').forEach(source => { source.style.visibility = '' })
    const cards = incoming.current
    if (!cards.length) return
    incoming.current = []
    const signal = motion.current.signal
    const draw = document.querySelector('.draw-pile img')?.getBoundingClientRect()
    void (async () => {
      for (const [index, card] of cards.entries()) {
        if (signal.aborted) return
        const face = cardElement(card.id)
        if (face && draw) {
          await flyCard(face, draw, face.getBoundingClientRect(), signal, { flip: 'reveal', duration: 640, delay: index === 0 ? 0 : 50 })
        }
        if (signal.aborted) return
        // Reveal each real card as its flying copy lands, rather than waiting for the entire deal.
        setHiddenCards(hidden => hidden.filter(id => id !== card.id))
      }
      setBusy(false)
      locked.current = false
      roomHeading.current?.focus()
    })()
  }, [game])

  useEffect(() => {
    if (finished && !busy) resultDialog.current?.showModal()
    else resultDialog.current?.close()
    if (moveFocus.current) {
      (finished ? resultHeading : roomHeading).current?.focus()
      moveFocus.current = false
    }
  }, [game, finished, busy])

  async function act(action: GameAction) {
    if (locked.current && action.type !== 'start') return
    if (action.type === 'start') {
      motion.current.abort()
      motion.current = new AbortController()
      resultDialog.current?.close()
    }
    const signal = motion.current.signal
    const result = applyAction(game, action)
    if (!result.ok) {
      setAnnouncement(`That action is unavailable: ${result.error.replaceAll('-', ' ')}.`)
      return
    }
    const next = result.state
    locked.current = true
    setBusy(true)
    setHealthPreview(next.health)
    const flights: Promise<void>[] = []
    const discard = document.querySelector('[data-discard-target]')?.getBoundingClientRect()
    const equipped = document.querySelector('[data-weapon-target]')?.getBoundingClientRect()
    if (action.type === 'resolve') {
      const face = cardElement(action.cardId)
      const card = game.room.find(c => c.id === action.cardId)!
      const target = card.kind === 'weapon' || (card.kind === 'monster' && action.combat === 'weapon') ? equipped : discard
      if (face && target) {
        flights.push(flyCard(face, hideCardSource(face), target, signal))
      }
      if (card.kind === 'weapon' && discard) {
        document.querySelectorAll<HTMLElement>('.equipped-stack .card-face').forEach((old, i) => {
          flights.push(flyCard(old, hideCardSource(old), discard, signal, { delay: i * 60 }))
        })
      }
    }
    if (action.type === 'flee') {
      const draw = document.querySelector('.draw-pile img')?.getBoundingClientRect()
      if (draw) game.room.forEach((card, i) => {
        const face = cardElement(card.id)
        if (face) {
          flights.push(flyCard(face, hideCardSource(face), draw, signal, { flip: 'hide', delay: i * 50 }))
        }
      })
    }
    await Promise.all(flights)
    if (signal.aborted) return
    const previous = action.type === 'start' || action.type === 'flee' ? [] : slots
    const nextSlots = Array.from({ length: 4 }, (_, i) => previous[i] && next.room.some(c => c.id === previous[i]!.id) ? previous[i]! : null)
    if (action.type === 'resolve' && next.status === 'playing' && next.roomNumber !== game.roomNumber) {
      const survivorIndex = nextSlots.findIndex(card => card !== null)
      const survivor = nextSlots[survivorIndex]
      if (survivor && survivorIndex !== 3) {
        const face = cardElement(survivor.id)
        const destination = document.querySelectorAll<HTMLElement>('.room-slot')[3]
        if (face && destination) {
          const slide = flyCard(face, hideCardSource(face), destination.getBoundingClientRect(), signal, { duration: 340, flat: true })
          await slide
          if (signal.aborted) return
        }
        nextSlots[survivorIndex] = null
        nextSlots[3] = survivor
      }
    }
    const newcomers = next.room.filter(c => !nextSlots.some(existing => existing?.id === c.id))
    newcomers.forEach(card => { nextSlots[nextSlots.indexOf(null)] = card })
    // The draw pile is on the left: deal the farthest (rightmost) open slot first.
    incoming.current = [...newcomers].sort((a, b) =>
      nextSlots.findIndex(card => card?.id === b.id) - nextSlots.findIndex(card => card?.id === a.id))
    setHiddenCards(newcomers.map(c => c.id))
    setSlots(nextSlots)
    setHealthPreview(null)
    if (!newcomers.length) { locked.current = false; setBusy(false) }
    let message = ''
    if (action.type === 'start') message = ''
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
      <nav className="table-tools" aria-label="Game controls">
        {game.status !== 'ready' && <button className="medallion restart" aria-label="New game" title="New game" onClick={start} />}
        <button className="medallion help" aria-label="Rules" title="Rules" onClick={() => rulesDialog.current?.showModal()} />
      </nav>
      {game.status === 'ready' ? (
        <section className="welcome" aria-label="Begin a game">
          <h1 className="title-wordmark"><img src="/art/ui/scoundrel-title-v2.webp" alt="Scoundrel" /></h1>
          <button className="welcome-deck-button" onClick={start} aria-label="Enter the dungeon with this deck"><img className="welcome-deck" src="/art/ui/card-back.webp" alt="" /></button>
          <button className="primary-button" onClick={start}>Enter the dungeon</button>
        </section>
      ) : (
        <div className="game-layout">
          <aside className="table-pile draw-pile" aria-label={`Draw pile: ${game.dungeon.length} cards`}><img src="/art/ui/card-back.webp" alt="Draw pile" /><span>Dungeon <strong>{game.dungeon.length}</strong></span></aside>
          <DiscardPile cards={game.discard} />
          <div className="play-area">

            <section className="room-section" aria-labelledby="room-title">
              <div className="section-heading"><h2 id="room-title" ref={roomHeading} tabIndex={-1}>Room {game.roomNumber}</h2><span className="turn-counter" aria-label={`${game.resolvedThisRoom} of 3 cards resolved`}>{[0,1,2].map(i => <i key={i} className={i < game.resolvedThisRoom ? 'resolved' : ''} aria-hidden="true" />)}</span>{playing && <button className="flee-control" disabled={busy || !canFlee(game)} title={fleeReason} aria-label={`Flee room. ${fleeReason}`} onClick={() => act({ type: 'flee' })}><span className="medallion escape" aria-hidden="true" /><span>Flee room</span></button>}</div>
              <div className="room-grid" aria-busy={busy}>{slots.map((card, i) => <div className="room-slot" key={i} style={{ visibility: card && hiddenCards.includes(card.id) ? 'hidden' : undefined }}>{card && <RoomCard card={card} game={game} onAction={act} busy={busy} />}</div>)}</div>

            </section>
          </div>
          <GameSidebar game={healthPreview === null ? game : { ...game, health: healthPreview }} />
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{game.status !== 'ready' ? announcement : ''}</p>
      <dialog className={`result-modal ${game.status}`} ref={resultDialog} aria-labelledby="result-title" aria-describedby="result-score" onCancel={event => event.preventDefault()}>
        <img className="result-plate" src="/art/ui/result-plate.webp?v=1" alt="" />
        <div className="result-content">
        <img className="result-emblem" src={game.status === 'won' ? '/art/ui/bronze-chalice.webp' : '/art/ui/bronze-skull.webp?v=1'} alt="" />
        <h2 id="result-title" ref={resultHeading} tabIndex={-1}>{game.status === 'won' ? 'You survived.' : 'Your descent ends.'}</h2>
        <p id="result-score">Final score <strong>{game.score}</strong></p>
        <button className="replay-button" onClick={start} aria-label="Play again"><img src="/art/ui/play-again.webp" alt="Play again" /></button>
        </div>
      </dialog>
      <HowToPlay dialogRef={rulesDialog} />
    </main>
  )
}
export default App
