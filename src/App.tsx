import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { applyAction, isHighScoreEligible, canFlee, createDeck, createInitialState, shuffleDeck } from './game'
import type { Card, GameAction, HouseRules } from './game'
import { RoomCard } from './components/RoomCard'
import { illustrations } from './components/cardIllustrations'
import { cardName } from './components/cardPresentation'
import { GameSidebar } from './components/GameSidebar'
import { HowToPlay } from './components/HowToPlay'
import { DrawPile } from './components/DrawPile'
import { DiscardPile } from './components/DiscardPile'
import { HighScores, ScoreLedger } from './components/HighScores'
import type { HighScore } from './scores/store'
import { cardElement, flyCard, hideCardSource, slashCard, healCard } from './components/cardMotion'
import { getDealSound, prepareGameAudio, playActionSound, warmGameAudio } from './components/gameAudio'
import { waitForImages } from './components/imageReadiness'
import { TableTool } from './components/TableTool'
import { SoundSettings } from './components/SoundSettings'
import { setAudioPageActive } from './components/gameAudio'
import { resolutionSound } from './components/actionSounds'
import { loadHouseRules, saveHouseRules } from './components/houseRulesPreferences'
import './App.css'

function App() {
  const [houseRules, setHouseRules] = useState(loadHouseRules)
  function updateHouseRules(rules: HouseRules) { setHouseRules(rules); saveHouseRules(rules) }
  const [slots, setSlots] = useState<(Card | null)[]>([null, null, null, null])
  const [healthPreview, setHealthPreview] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [hiddenCards, setHiddenCards] = useState<string[]>([])
  const motion = useRef(new AbortController())
  const locked = useRef(false)
  const incoming = useRef<Card[]>([])
  const returningCard = useRef<string | null>(null)
  useEffect(() => () => motion.current.abort(), [])
  useEffect(() => {
    const updateVisibility = () => setAudioPageActive(!document.hidden)
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => { document.removeEventListener('visibilitychange', updateVisibility); setAudioPageActive(false) }
  }, [])
  const soundDialog = useRef<HTMLDialogElement>(null)
  const resultDialog = useRef<HTMLDialogElement>(null)
  const rulesDialog = useRef<HTMLDialogElement>(null)
  const scoresDialog = useRef<HTMLDialogElement>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [soundOpen, setSoundOpen] = useState(false)
  const [scoresOpen, setScoresOpen] = useState(false)
  const [completedRun, setCompletedRun] = useState<Omit<HighScore, 'name'> | null>(null)
  const [savingScore, setSavingScore] = useState(false)
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
      // Start decoding all four eager room images together, alongside the deal sound.
      const ready = cards.map(card => {
        const face = cardElement(card.id)
        return waitForImages(face ? [...face.querySelectorAll('img')] : [], signal)
      })
      const back = document.querySelector<HTMLImageElement>('.draw-pile img')
      const [sound] = await Promise.all([getDealSound(), waitForImages(back ? [back] : [], signal)])
      if (signal.aborted) return
      for (const [index, card] of cards.entries()) {
        if (signal.aborted) return
        await ready[index]
        if (signal.aborted) return
        const face = cardElement(card.id)
        const fromDiscard = returningCard.current === card.id
        const origin = fromDiscard ? document.querySelector('[data-discard-target]')?.getBoundingClientRect() : draw
        if (face && origin) {
          await flyCard(face, origin, face.getBoundingClientRect(), signal, fromDiscard ? { duration: 320 } : { flip: 'reveal', duration: sound.duration, flipDuration: sound.duration, sound: sound.play, delay: index === 0 ? 0 : 50 })
        }
        if (signal.aborted) return
        // Reveal each real card as its flying copy lands, rather than waiting for the entire deal.
        setHiddenCards(hidden => hidden.filter(id => id !== card.id))
      }
      returningCard.current = null
      warmGameAudio()
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
      setCompletedRun(null)
    }
    const signal = motion.current.signal
    const result = applyAction(game, action)
    if (!result.ok) {
      setAnnouncement(`That action is unavailable: ${result.error.replaceAll('-', ' ')}.`)
      return
    }
    prepareGameAudio({ deferMusic: action.type === 'start' })
    const next = result.state
    const fateActivated = action.type === 'resolve' && action.cardId === 'cosmic-fate' && action.cosmic === 'activate'
    if ((next.status === 'won' || next.status === 'lost') && next.score !== null && isHighScoreEligible(next)) {
      // getRandomValues also works on plain-HTTP self-hosts, unlike randomUUID.
      const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16).padStart(8, '0')).join('')
      setCompletedRun({ id, score: next.score, completedAt: new Date().toISOString() })
    }
    locked.current = true
    setBusy(true)
    setHealthPreview(next.health)
    const flights: Promise<void>[] = []
    const discard = document.querySelector('[data-discard-target]')?.getBoundingClientRect()
    const equipped = document.querySelector('[data-weapon-target]')?.getBoundingClientRect()
    if (action.type === 'resolve') {
      const face = cardElement(action.cardId)
      const card = game.room.find(c => c.id === action.cardId)!
      void playActionSound(resolutionSound(card, game.potionUsed), signal)
      const target = card.kind === 'weapon' || (card.kind === 'monster' && action.combat === 'weapon') ? equipped : discard
      if (face && (card.kind === 'monster' || card.kind === 'barricade' || (card.kind === 'cosmic' && card.id === 'cosmic-sight' && action.cosmic === 'activate'))) {
        await slashCard(face, signal)
        if (signal.aborted) return
      }
      if (face && ((card.kind === 'potion' && !game.potionUsed) || (card.kind === 'cosmic' && action.cosmic === 'activate' && card.id === 'cosmic-forge'))) {
        await healCard(face, signal)
        if (signal.aborted) return
      }
      if (face && target) {
        flights.push(flyCard(face, hideCardSource(face), target, signal))
      }
      if ((card.kind === 'weapon' || (game.weapon && !next.weapon)) && discard) {
        document.querySelectorAll<HTMLElement>('.equipped-stack .card-face').forEach((old, i) => {
          flights.push(flyCard(old, hideCardSource(old), discard, signal, { delay: i * 60 }))
        })
      }
    }
    if (action.type === 'mirror-exchange') {
      const face = cardElement(action.cardId)
      const draw = document.querySelector('.draw-pile img')?.getBoundingClientRect()
      if (face && draw) flights.push(flyCard(face, hideCardSource(face), draw, signal, { flip: 'hide' }))
    }
    if (action.type === 'resolve' && action.cardId === 'cosmic-forge' && action.cosmic === 'activate' && discard) {
      document.querySelectorAll<HTMLElement>('.equipped-stack .weapon-trophy .card-face').forEach((old, i) => {
        flights.push(flyCard(old, hideCardSource(old), discard, signal, { delay: i * 60 }))
      })
    }
    if (action.type === 'flee' || fateActivated) {
      const draw = document.querySelector('.draw-pile img')?.getBoundingClientRect()
      if (draw) game.room.filter(card => !fateActivated || card.id !== 'cosmic-fate').forEach((card, i) => {
        const face = cardElement(card.id)
        if (face) {
          flights.push(flyCard(face, hideCardSource(face), draw, signal, { flip: 'hide', delay: i * 50 }))
        }
      })
    }
    await Promise.all(flights)
    if (signal.aborted) return
    const previous = action.type === 'start' || action.type === 'flee' || fateActivated ? [] : slots
    const nextSlots = Array.from({ length: 4 }, (_, i) => previous[i] && next.room.some(c => c.id === previous[i]!.id) ? previous[i]! : null)
    const mirrorArrival = action.type === 'mirror-exchange' ? game.dungeon[0] : undefined
    if (mirrorArrival && action.type === 'mirror-exchange') {
      const outgoingId = action.cardId
      nextSlots[next.roomNumber !== game.roomNumber ? 3 : slots.findIndex(card => card?.id === outgoingId)] = mirrorArrival
    }
    if (action.type === 'resolve' && !fateActivated && next.status === 'playing' && next.roomNumber !== game.roomNumber) {
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
    const swapped = action.type === 'resolve' && action.joker === 'play'
      ? next.room.find(card => !game.room.some(old => old.id === card.id)) : undefined
    if (swapped && action.type === 'resolve') {
      const replacedId = action.cardId
      nextSlots[slots.findIndex(card => card?.id === replacedId)] = swapped
    }
    const newcomers = next.room.filter(c => !nextSlots.some(existing => existing?.id === c.id))
    newcomers.forEach(card => { nextSlots[nextSlots.indexOf(null)] = card })
    // The draw pile is on the left: deal the farthest (rightmost) open slot first.
    const arrivals = [...newcomers, ...(mirrorArrival ? [mirrorArrival] : [])]
    incoming.current = arrivals.sort((a, b) =>
      nextSlots.findIndex(card => card?.id === b.id) - nextSlots.findIndex(card => card?.id === a.id))
    returningCard.current = swapped?.id ?? null
    if (swapped) incoming.current.push(swapped)
    setHiddenCards([...arrivals, ...(swapped ? [swapped] : [])].map(c => c.id))
    setSlots(nextSlots)
    setHealthPreview(null)
    if (!arrivals.length && !swapped) { locked.current = false; setBusy(false) }
    let message = ''
    if (action.type === 'start') message = ''
    if (action.type === 'flee') message = `You fled. Room ${next.roomNumber} revealed. You must face this room.`
    if (action.type === 'resolve') {
      const card = game.room.find((entry) => entry.id === action.cardId)!
      if (card.kind === 'cosmic') message = action.cosmic === 'discard' ? `Discarded ${cardName(card)}.` : card.id === 'cosmic-fate' ? 'Hand of Fate reshuffled the remaining room into the dungeon.' : card.id === 'cosmic-sight' ? `Devil's Sight cost 3 health. Revealed ${next.dungeon.filter(card => next.revealedDungeon.includes(card.id)).map(cardName).join(', ') || 'no cards; the dungeon is empty'}.` : card.id === 'cosmic-mirror' ? `Mirror of Misfortune revealed ${next.dungeon[0] ? cardName(next.dungeon[0]) : 'a card'}. Choose a remaining room card to exchange.` : `Forge of Destiny cleared your weapon target restriction. Power remains ${next.weapon?.power}.`
      if (card.kind === 'barricade') message = action.combat === 'weapon' ? `Cleared ${cardName(card)} without losing health. ${next.weapon ? `Weapon power reduced to ${next.weapon.power}.` : 'Your weapon was destroyed.'}` : `Cleared ${cardName(card)} barehanded. Lost ${card.value} health.`
      if (card.kind === 'joker') message = action.joker === 'play' ? `${cardName(card)} exchanged for ${swapped ? cardName(swapped) : 'a discarded card'}.` : `Discarded ${cardName(card)}.`
      if (card.kind === 'monster') message = `Defeated ${cardName(card)} ${action.combat === 'weapon' ? 'with your weapon' : 'barehanded'}. Lost ${game.health - next.health} health.`
      if (card.kind === 'weapon') message = `Equipped ${cardName(card)}. Weapon power ${card.value}.`
      if (card.kind === 'potion') message = game.potionUsed ? `Discarded ${cardName(card)}. Healing already used this turn.` : `Drank ${cardName(card)}. Restored ${next.health - game.health} health.`
      if (next.roomNumber !== game.roomNumber && next.status === 'playing') message += ` Room ${next.roomNumber} revealed.`
    }
    if (action.type === 'mirror-exchange') {
      const outgoing = game.room.find(card => card.id === action.cardId)!
      message = `Exchanged ${cardName(outgoing)} for ${cardName(game.dungeon[0])}. ${cardName(outgoing)} returned to the dungeon.`
      if (next.roomNumber !== game.roomNumber) message += ` Room ${next.roomNumber} revealed.`
    }
    if (next.status === 'won') message += ` Dungeon cleared. Final score ${next.score}.`
    if (next.status === 'lost') message += ` Your journey ends. Final score ${next.score}.`
    setAnnouncement(message)
    moveFocus.current = true
    setGame(next)
  }

  function start() { act({ type: 'start', deck: shuffleDeck(createDeck(houseRules)), rules: houseRules }) }
  const fleeReason = game.resolvedThisRoom > 0 || game.jokerPlayedThisRoom ? 'You have already entered this room.'
    : game.previousRoomFled ? 'You fled the last room. Stand your ground.'
    : game.room.length < 4 ? 'The final cards must be faced.' : 'Return this room to the bottom of the dungeon.'

  return (
    <main className={`app-shell ${game.status === 'ready' ? 'at-gate' : 'at-table'}`}>
      <nav className="table-tools" aria-label="Game controls">
        <TableTool className="restart" label="New game" tooltip="Start a new game" onClick={start} />
        <TableTool className="settings-medallion" label="Settings" tooltip="Sound and optional house rules" onClick={() => { prepareGameAudio(); setSoundOpen(true) }} />
        <TableTool className="scores-medallion" label="High scores" tooltip="View high scores" onClick={() => { setScoresOpen(true) }} />
        <TableTool className="help" label="How to play" tooltip="Rules and practice" onClick={() => setRulesOpen(true)} />
      </nav>
      {game.status === 'ready' ? (
        <section className="welcome" aria-label="Begin a game">
          <h1 className="title-wordmark"><img src="/art/ui/scoundrel-title-v2.webp" alt="Scoundrel" /></h1>
          <button className="welcome-deck-button" onClick={start} aria-label="Enter the dungeon with this deck"><img className="welcome-deck" src="/art/ui/card-back.webp" alt="" /></button>
          <button className="primary-button" onClick={start}>Enter the dungeon</button>
        </section>
      ) : (
        <div className="game-layout">
          <DrawPile cards={game.dungeon} revealedIds={game.revealedDungeon} mirrorCard={game.mirrorRevealed ? game.dungeon[0] : undefined} />
          <DiscardPile cards={game.discard} />
          <div className="play-area">

            <section className="room-section" aria-labelledby="room-title">
              <div className="section-heading"><h2 id="room-title" ref={roomHeading} tabIndex={-1}>Room {game.roomNumber}</h2><span className="turn-counter" aria-label={`${game.resolvedThisRoom} of 3 cards resolved`}>{[0,1,2].map(i => <i key={i} className={i < game.resolvedThisRoom ? 'resolved' : ''} aria-hidden="true" />)}</span>{playing && <button className="flee-control" disabled={busy || !canFlee(game)} title={fleeReason} aria-label={`Flee room. ${fleeReason}`} onClick={() => act({ type: 'flee' })}><span className="medallion escape" aria-hidden="true" /><span>Flee room</span></button>}</div>
              {game.mirrorRevealed && <p className="mirror-instruction" id="mirror-choice-help">Choose a room card to exchange for {game.dungeon[0] && (illustrations[game.dungeon[0].id]?.name ?? cardName(game.dungeon[0]))}.</p>}
              <div className="room-grid" aria-busy={busy}>{slots.map((card, i) => <div className="room-slot" key={i} style={{ visibility: card && hiddenCards.includes(card.id) ? 'hidden' : undefined }}>{card && <RoomCard card={card} game={game} onAction={act} busy={busy} />}</div>)}</div>

            </section>
          </div>
          <GameSidebar game={healthPreview === null ? game : { ...game, health: healthPreview }} />
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{game.status !== 'ready' ? announcement : ''}</p>
      <dialog className={`result-modal ${isHighScoreEligible(game) ? 'with-scores' : 'house-result'} ${game.status}`} ref={resultDialog} aria-labelledby="result-title" aria-describedby="result-score" onCancel={event => event.preventDefault()}>
        {finished && <div className="result-layout">
        <div className="result-summary">
        <img className="result-plate" src="/art/ui/result-plate.webp?v=1" alt="" />
        <div className="result-content">
        <img className="result-emblem" src={game.status === 'won' ? '/art/ui/bronze-chalice.webp' : '/art/ui/bronze-skull.webp?v=1'} alt="" />
        <h2 id="result-title" ref={resultHeading} tabIndex={-1}>{game.status === 'won' ? 'You survived.' : 'Your descent ends.'}</h2>
        <p id="result-score">Final score <strong>{game.score}</strong></p>
        {!isHighScoreEligible(game) && <p className="house-run-note">House rules run · excluded from high scores</p>}
        <button className="replay-button" disabled={savingScore} onClick={start} aria-label="Play again"><img src="/art/ui/play-again.webp" alt="Play again" /></button>
        </div>
        </div>
        {finished && completedRun && <div className="result-record"><ScoreLedger key={completedRun.id} run={completedRun} onSaving={setSavingScore} /></div>}
        </div>}
      </dialog>
      <SoundSettings dialogRef={soundDialog} open={soundOpen} rules={houseRules} onRulesChange={updateHouseRules} onClose={() => setSoundOpen(false)} />
      <HowToPlay dialogRef={rulesDialog} open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <HighScores dialogRef={scoresDialog} open={scoresOpen} onClose={() => setScoresOpen(false)} />
    </main>
  )
}
export default App
