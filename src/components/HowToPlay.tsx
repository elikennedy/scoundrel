import { useId, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { applyAction, createDeck, createHandicapCards, createCosmicCards, createBarricadeCards, createInitialState } from '../game'
import type { CardId, GameAction } from '../game'
import { CardFace } from './CardFace'
import './HowToPlay.css'

const deck = createDeck()
const guideDeck = [...createCosmicCards(), ...createBarricadeCards('wood', 1), ...createBarricadeCards('rubble', 1), ...createBarricadeCards('thorns', 1), ...createBarricadeCards('pit', 1), ...deck, ...createHandicapCards(), ...createDeck({ handicap: 0, jokers: true }).filter(card => card.kind === 'joker')]
function GuideCard({ id, caption, className = '' }: { id: CardId; caption?: string; className?: string }) {
  const labelId = useId()
  const card = guideDeck.find(c => c.id === id)!
  return <figure className={`guide-card ${className}`}><CardFace card={card} labelId={labelId} loading="lazy" />{caption && <figcaption>{caption}</figcaption>}</figure>
}
function BronzeAction({ icon, children, onClick, pressed }: { icon: number; children: React.ReactNode; onClick: () => void; pressed?: boolean }) {
  return <button className="guide-bronze-action" onClick={onClick} aria-pressed={pressed}><img src={`/art/ui/control-${icon}.png`} alt="" /><span>{children}</span></button>
}
const practiceIds: CardId[] = ['diamonds-7', 'clubs-10', 'hearts-6', 'spades-12']
const practiceActions: GameAction[] = [
  { type: 'resolve', cardId: 'diamonds-7' },
  { type: 'resolve', cardId: 'clubs-10', combat: 'weapon' },
  { type: 'resolve', cardId: 'hearts-6' },
]
function practiceState(step: number) {
  const ordered = [...practiceIds.map(id => deck.find(c => c.id === id)!), ...deck.filter(c => !practiceIds.includes(c.id))]
  const started = applyAction(createInitialState(), { type: 'start', deck: ordered })
  if (!started.ok) throw new Error('Invalid practice deck')
  let state = { ...started.state, health: 14 }
  for (const action of practiceActions.slice(0, step)) {
    const next = applyAction(state, action)
    if (next.ok) state = next.state
  }
  return state
}
const practiceCopy = [
  'You enter at 14 health, without a weapon. The order matters: take the spear before confronting the troll.',
  'The spear is equipped at power 7. A fresh weapon has no target limit, so it can face the 10-value troll.',
  'The troll costs 3 health: 10 minus 7. You are at 11. Your spear can now face monsters of value 10 or less.',
  'The remedy restores 6 health, bringing you to 17. Three cards are resolved. The queen slides right and three new cards are dealt. Your spear cannot face the queen yet: her value is 12.',
]
const chapters = [['guide-room', 'The room'], ['guide-combat', 'Combat'], ['guide-healing', 'Healing'], ['guide-tactics', 'Tactics'], ['guide-ending', 'Winning'], ['guide-house', 'House rules']]

export function HowToPlay({ dialogRef, open, onClose }: { dialogRef: RefObject<HTMLDialogElement | null>; open: boolean; onClose: () => void }) {
  useLayoutEffect(() => {
    if (open) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [open, dialogRef])
  const [step, setStep] = useState(0)
  const [combat, setCombat] = useState<'weapon' | 'barehanded'>('weapon')
  const practice = practiceState(step)
  function jump(id: string) {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    const heading = section?.querySelector<HTMLElement>('h2')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }
  return <dialog className="how-to-play" ref={dialogRef} aria-labelledby="guide-title" onClose={onClose}>
    {open && <>
    <div className="guide-toolbar">
      <img className="guide-brand" src="/art/ui/scoundrel-title-v2.webp" alt="Scoundrel" />
      <nav aria-label="How to play chapters">{chapters.map(([id, name]) => <button key={id} onClick={() => jump(id)}>{name}</button>)}</nav>
      <button className="guide-return" aria-label="Return to game" onClick={() => dialogRef.current?.close()}><img src="/art/ui/return-to-game.webp" alt="Return to game" /></button>
    </div>
    <div className="guide-body">
      <header className="guide-hero">
        <div><h2 id="guide-title"><img src="/art/ui/how-to-play.webp" alt="How to Play" /></h2><p className="guide-lead">You have 20 health. The standard dungeon has 44 cards.<br />Make every choice earn its place.</p><p>Scoundrel is a solitaire dungeon crawl. Monsters cost health, weapons soften their blows, and potions buy you another chance. Survive every card to win. The challenge is deciding what to face, what to save, and when to run.</p><button className="guide-text-link" onClick={() => jump('guide-practice')}>Try a room below <span aria-hidden="true">↓</span></button></div>
        <div className="guide-hero-art" aria-label="A monster, a weapon and a healing potion"><GuideCard id="clubs-13" /><GuideCard id="diamonds-10" /><GuideCard id="hearts-10" /></div>
      </header>

      <section className="guide-section" id="guide-room" aria-labelledby="room-guide-title">
        <div className="guide-section-intro"><h2 id="room-guide-title">Four cards. Three choices.</h2><p>The face-down pile is the dungeon. Each room reveals four cards. The standard deck removes jokers, red aces and red face cards. Optional house rules can add them back; see the House rules chapter. Before touching any of them, decide whether to flee. If you stay, resolve <strong>three cards, in any order</strong>. Each fight, weapon pickup or potion counts as one choice.</p></div>
        <div className="guide-room-example"><GuideCard id="diamonds-7" caption="Equip a weapon" /><GuideCard id="clubs-10" caption="Fight a monster" /><GuideCard id="hearts-6" caption="Drink a potion" /><GuideCard id="spades-12" caption="Carry one forward" className="guide-carry" /></div>
        <div className="guide-room-afterword"><p>The fourth card is your next room’s first problem—or its saving grace. It slides to the rightmost position, then three new cards join it. There is no separate “end turn” button.</p><p><strong>At the dungeon’s end:</strong> if there aren’t enough cards to refill the room, play what remains. Emptying the draw pile alone does not win. Resolve every card still on the table; every three resolutions still start a fresh turn.</p></div>
      </section>

      <section className="guide-section guide-card-types" aria-label="Know the cards">
        <article><GuideCard id="clubs-13" /><h2>Monsters</h2><p>There are 26: clubs and spades, valued 2 through 14. The number on the banner is the danger. Jacks are 11, queens 12, kings 13 and aces 14.</p><p>Choose a weapon attack or fight barehanded. Both defeat the monster immediately, but the health cost—and the effect on your weapon—can be very different.</p></article>
        <article><GuideCard id="diamonds-7" /><h2>Weapons</h2><p>There are nine, valued 2 through 10. A weapon reduces the damage you take by its power. Its power stays the same; its allowed targets narrow as you use it.</p><p><strong>Taking a weapon always equips it.</strong> Your previous weapon and its defeated monsters go to the discard pile. A new weapon starts with no target limit.</p></article>
        <article><GuideCard id="hearts-6" /><h2>Potions</h2><p>There are nine, valued 2 through 10. Each can restore that much health, up to the maximum of 20. Only the first potion you take in a turn heals you.</p><p>Later potions are discarded for no healing, but still count as resolved cards. The allowance resets when the next turn begins.</p></article>
      </section>

      <section className="guide-section guide-combat" id="guide-combat" aria-labelledby="combat-guide-title">
        <div><h2 id="combat-guide-title">Choose how to take the hit.</h2><p>Fighting barehanded costs the monster’s full value. With a usable weapon, subtract the weapon’s power. Damage never drops below zero; a strong weapon prevents the hit rather than healing you.</p><p>A barehanded kill sends the monster to discard and <strong>leaves your weapon and its target limit unchanged</strong>. A weapon kill joins the stack behind your equipped weapon and sets its next target limit.</p><div className="guide-combat-controls"><BronzeAction icon={3} pressed={combat === 'weapon'} onClick={() => setCombat('weapon')}>With weapon</BronzeAction><BronzeAction icon={4} pressed={combat === 'barehanded'} onClick={() => setCombat('barehanded')}>Barehanded</BronzeAction></div></div>
        <div className="guide-combat-example"><div className="guide-versus"><GuideCard id="clubs-10" caption="Danger 10" /><span aria-hidden="true">against</span><GuideCard id="diamonds-7" caption="Power 7" className={combat === 'barehanded' ? 'guide-unused' : ''} /></div><output className="guide-damage" aria-live="polite"><strong>{combat === 'weapon' ? '3' : '10'}</strong> health lost<span>{combat === 'weapon' ? '10 danger − 7 power = 3 damage' : 'No weapon used: take the full 10 damage'}</span></output></div>
      </section>

      <section className="guide-section" aria-labelledby="chain-guide-title">
        <div className="guide-section-intro"><h2 id="chain-guide-title">A weapon remembers its last kill.</h2><p>A fresh weapon can face any monster. After a kill, it can only face a monster whose value is <strong>equal to or below the last one it defeated</strong>. It is the last monster’s value—not the weapon’s power—that sets the limit.</p><p>With a power-7 weapon, this whole sequence is legal:</p></div>
        <div className="guide-chain">{(['spades-12','clubs-10','clubs-6','spades-6'] as CardId[]).map((id, i) => <div key={id}><GuideCard id={id} caption={['Lose 5 health','Lose 3 health','No damage','Equal is allowed'][i]} /><span className="guide-limit">Next target ≤ {deck.find(c => c.id === id)!.value}</span></div>)}</div>
        <div className="guide-chain-note"><img src="/art/ui/control-3.png" alt="" /><p>After that final 6, a 7 is too strong for this weapon—even though its power is still 7. Fight the 7 barehanded, leave it behind, or equip a new weapon first. A weak target can close off a useful weapon sooner than you expect.</p></div>
      </section>

      <section className="guide-section guide-practice" id="guide-practice" aria-labelledby="practice-guide-title">
        <div className="guide-practice-heading"><h2 id="practice-guide-title">Walk through one room.</h2><span>A practice example. Your game stays untouched.</span></div>
        <div className="guide-practice-layout">
          <div className="guide-room-example">{practiceIds.map((id, i) => <GuideCard key={id} id={id} className={i < step ? 'guide-resolved' : i === 3 ? 'guide-carry' : ''} caption={i < step ? ['Equipped','Defeated','Drunk'][i] : i === 3 ? 'Leave for next room' : ['Take first','Fight second','Drink third'][i]} />)}</div>
          <div className="guide-practice-story">
            <div className="guide-practice-stats"><span>Health <strong>{practice.health} / 20</strong></span><span>Weapon <strong>{practice.weapon ? '7 power' : 'Barehanded'}</strong></span><span>Resolved <strong>{step} / 3</strong></span></div>
            <p className="guide-practice-message" aria-live="polite" aria-atomic="true">{practiceCopy[step]}</p>
            <div className="guide-practice-actions"><BronzeAction icon={step === 3 ? 1 : step === 2 ? 5 : 3} onClick={() => setStep(step === 3 ? 0 : step + 1)}>{['Equip the spear','Fight the troll','Drink the remedy','Reset example'][step]}</BronzeAction>{step > 0 && step < 3 && <button className="guide-text-link" onClick={() => setStep(0)}>Start over</button>}</div>
          </div>
        </div>
      </section>

      <section className="guide-section guide-healing" id="guide-healing" aria-labelledby="healing-guide-title">
        <div className="guide-potion-art"><GuideCard id="hearts-8" caption="First potion: heals" /><GuideCard id="hearts-6" caption="Second potion: discarded" /></div>
        <div><h2 id="healing-guide-title">Make the healing count.</h2><p>At 16 health, an 8-value potion restores only 4: the rest is lost to the 20-health cap. Taking it still uses your turn’s healing allowance. A potion taken at full health uses that allowance too.</p><p>If you take another potion before resolving three cards, it heals nothing. Consider leaving that second potion as your carryover instead, so it can heal in the next turn.</p><p><strong>Fight, then heal—when you can survive the fight.</strong> Taking damage first can make space for a potion’s full value. But a potion cannot rescue you after a lethal hit: zero health ends the run immediately.</p></div>
      </section>

      <section className="guide-section guide-flee" aria-labelledby="flee-guide-title">
        <div><h2 id="flee-guide-title">Live to face it later.</h2><p>Flee before resolving any card in a full, four-card room. All four cards return to the <strong>bottom of the dungeon</strong> in their current order, without shuffling, and a new room is dealt.</p><p>You cannot flee two rooms in a row. After an escape, you must resolve the next room before fleeing is available again. Once you resolve a card, the decision to stay is made.</p><p>Fleeing postpones a problem; it does not remove it. Those monsters will return. When fewer than four cards remain in a room, fleeing is unavailable.</p></div><div className="guide-flee-art"><img src="/art/ui/card-back.webp" alt="Cards return to the bottom of the draw pile" /><img src="/art/ui/control-2.png" alt="" /></div>
      </section>

      <section className="guide-section guide-tactics" id="guide-tactics" aria-labelledby="tactics-guide-title">
        <h2 id="tactics-guide-title" className="guide-image-heading"><img src="/art/ui/survival-tactics.webp" alt="Survival Tactics" /></h2><p className="guide-lead">The best move is rarely about one card.</p>
        <div className="guide-tactic-list">
          <article><img src="/art/ui/control-3.png" alt="" /><div><h3>Spend your weapon’s range carefully.</h3><p>Look at the strongest monster you can afford to fight before using a fresh weapon on a small one. A descending run of targets keeps more options open. A low-power weapon can still save health across several fights; replacing it is a decision, not an automatic upgrade.</p></div></article>
          <article><img src="/art/ui/control-4.png" alt="" /><div><h3>Sometimes your health is the cheaper resource.</h3><p>Suppose your weapon’s limit is 10 and a value-2 monster appears. Spending 2 health barehanded preserves that limit for a larger threat. Using the weapon saves health now but drops the limit to 2. Choose with your remaining health and healing in mind; preserving a weapon is never worth dying for.</p></div></article>
          <article><img src="/art/ui/control-5.png" alt="" /><div><h3>Choose the fourth card on purpose.</h3><p>A potion carried into the next turn can be much more useful than a potion discarded after healing is spent. A threatening monster can wait for a better weapon—but it occupies one slot in the next room. Weigh what you gain by waiting against the problem you guarantee yourself.</p></div></article>
          <article><img src="/art/ui/control-2.png" alt="" /><div><h3>Read the whole room before you commit.</h3><p>Estimate the health cost of your best three-card sequence, including weapon limits and healing order. If it is disastrous, consider fleeing while you still can. The next room is unknown and must be faced, so escaping a merely awkward room can trade away a valuable option.</p></div></article>
          <article><img src="/art/ui/control-0.png" alt="" /><div><h3>Remember what the dungeon has spent.</h3><p>The deck contains eight monsters above 10, nine weapons and nine potions. As those cards leave play, the remaining risks change. Hover the discard pile to inspect its last five cards. Remember that monsters behind your weapon are defeated too, while cards from a fled room are still waiting in the dungeon.</p></div></article>
        </div>
      </section>

      <section className="guide-section" id="guide-ending" aria-labelledby="ending-guide-title">
        <div className="guide-section-intro"><h2 id="ending-guide-title">Survival is the first victory.</h2><p>You win when the draw pile and room are both empty and you still have health. Cards in your equipped stack are already resolved. If health reaches zero or below, the run ends immediately—even if that fight also removed the last card.</p></div>
        <div className="guide-endings"><article><img src="/art/ui/bronze-chalice.webp" alt="" /><div><h3>Leave the dungeon alive</h3><p>Your remaining health is your score. Finishing at 13 health scores <strong>13</strong>.</p><p>For the final-potion bonus, finish at exactly 20 health with a potion as the last card resolved. Add that potion’s value: a final 8 scores <strong>28</strong>. In this version, the last card’s identity counts even if that potion did not heal.</p></div></article><article><img src="/art/ui/bronze-skull.webp" alt="" /><div><h3>Fall in the dungeon</h3><p>Keep any negative health, then subtract the total value of every unresolved monster in the room and draw pile. Do not count defeated monsters attached to your weapon.</p><p>Example: at 3 health, an 11-value barehanded fight leaves −8. If a 14 and a 6 remain unresolved, your score is <strong>−28</strong>.</p></div></article></div>
      </section>

      <section className="guide-section guide-house" id="guide-house" aria-labelledby="house-guide-title">
        <div className="guide-section-intro"><h2 id="house-guide-title">Optional house rules</h2><p>Open the bronze Settings cog to change your next dungeon. Handicap, jokers, cosmic cards and barricades are optional house rules for this adaptation, separate from the original Scoundrel rules by Zach Gage and Kurt Bieg. All default off. Your choices are saved in this browser and apply when you start a new game; the current run keeps its rules.</p></div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Examples of the eight optional handicap cards"><GuideCard id="diamonds-12" caption="A stronger weapon" /><GuideCard id="hearts-13" caption="More healing" /></div>
          <div><h3>Handicap: one to four extra cards</h3><p>Choose level 1–4 to add that many distinct cards at random from the eight hearts and diamonds valued 11–14: their jacks, queens, kings and aces. The selection is made again for every new game, then shuffled into the dungeon.</p><p>Diamonds equip as weapons with power 11–14. Hearts restore their value in health, still capped at 20, and follow the usual one-potion-per-turn rule. At 16 health, a value-13 heart restores only 4 health and uses that turn’s healing allowance.</p><p>Level 2 makes a 46-card dungeon. Add both jokers as well and it becomes 48 cards. Leave Handicap Off to keep the high-value red cards out.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="The two optional jokers"><GuideCard id="joker-1" /><GuideCard id="joker-2" /></div>
          <div><h3>Jokers: discard or take a chance</h3><p>Jokers in adds The Grinning Harlequin and The Briar Trickster. Each offers two choices:</p><p><strong>Discard</strong> sends the joker to the discard pile and counts as one of the room’s three resolutions.</p><p><strong>Play</strong> sends it to discard and replaces it in the same room slot with one randomly selected card already in the discard pile. You might retrieve a useful weapon or potion—or bring back a monster. Resolve the returned card as usual.</p><p>A swap does not count as a resolution or reset your healing allowance. The joker being played cannot draw itself, but either joker can retrieve the other. With an empty discard pile, only Discard is available. Either choice commits you to the room, so you cannot flee afterward.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="The two optional cosmic cards"><GuideCard id="cosmic-fate" /><GuideCard id="cosmic-forge" /></div>
          <div><h3>Cosmic cards: change your fate</h3><p>Cosmic cards in adds Hand of Fate, Forge of Destiny, Devil’s Sight and Mirror of Misfortune, one of each. All four use the purple question-mark banner. You can always <strong>Discard</strong> one to resolve its room slot without using its power.</p><p><strong>Activate Hand of Fate</strong> to discard it, return every other card still in the room to the dungeon, shuffle that whole remaining deck, and deal a fresh room. Your health, weapon and existing discard pile stay as they are. The new room starts with zero resolutions, a fresh healing allowance and the usual flee rules. It can contain a card you just returned.</p><p><strong>Activate Forge of Destiny</strong> to resolve its slot and clear your equipped weapon’s target restriction. Its defeated monsters move to discard, so the weapon can face any next monster. It keeps its current power, including any power lost to barricades. Without an equipped weapon, only Discard is available.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Devil’s Sight cosmic card"><GuideCard id="cosmic-sight" caption="Pay 3 health to see ahead" /></div>
          <div><h3>Devil’s Sight: knowledge has a price</h3><p><strong>Activate Devil’s Sight</strong> to discard it, resolve its room slot, lose 3 health and reveal up to the next three dungeon cards in draw order. If this is your third resolution, the room refills first; you see the next cards still in the deck. The revealed cards stay in the dungeon.</p><p>The reveal opens beside the draw pile. Use <strong>Hide</strong> or <strong>Show</strong> to inspect it without moving a card. Revealed cards leave the preview as they are dealt. Hand of Fate’s reshuffle clears the preview, and using another Devil’s Sight takes a fresh look at the next three.</p><p>With fewer than three cards in the dungeon, you see what remains. The health cost still applies with an empty deck and can kill you at 3 health or less. Choose <strong>Discard</strong> instead to resolve the slot without paying health or revealing cards.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Mirror of Misfortune cosmic card"><GuideCard id="cosmic-mirror" caption="Reveal, then choose an exchange" /></div>
          <div><h3>Mirror of Misfortune: an exchange you must make</h3><p><strong>Activate Mirror of Misfortune</strong> to discard it, resolve its room slot and reveal the top dungeon card. Then choose <strong>Exchange</strong> on any remaining room card: the revealed card takes that card’s place, and your chosen room card returns to the top of the dungeon.</p><p>You must complete the exchange before taking another game action. It has no health cost, does not equip or resolve the incoming card, and does not spend a second resolution. Your healing allowance and equipment stay unchanged.</p><p>If the mirror is your third resolution, the room refills only after you choose the exchange. The card you returned to the top may be dealt straight back into that new room. Without a dungeon card or another room card to exchange, Activate is unavailable; <strong>Discard</strong> still resolves the mirror normally.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Wooden Barricade and Rubble examples"><GuideCard id="wood-1" caption="Costs 1" /><GuideCard id="rubble-1" caption="Costs 2" /></div>
          <div><h3>Barricades: spend health or steel</h3><p>Barricades in adds 1–4 copies of each obstacle: Wooden Barricade, Rubble, Poisoned Thorns and Pit Trap. The four counts are chosen independently for each new game. Every copy occupies a room slot and counts as a resolution when cleared.</p><p><strong>Barehanded:</strong> lose 1 health for Wooden Barricade or 2 for Rubble. Your weapon and its target restriction are unchanged.</p><p><strong>With a weapon:</strong> lose no health, but reduce the equipped weapon’s current power by 1 for wood or 2 for rubble. If its power falls below 2, the weapon is destroyed and discarded with its attached monsters. Otherwise its previous target restriction stays in place.</p><p>A power-4 weapon becomes power 2 after Rubble; another wooden barricade would destroy it. The equipped card and status show its remaining power. Forge clears the target restriction without repairing this wear; equipping a new weapon starts at its printed power.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Poisoned Thorns and Pit Trap examples"><GuideCard id="thorns-1" caption="Costs 3" /><GuideCard id="pit-1" caption="1 health; no weapon option" /></div>
          <div><h3>Thorns and traps</h3><p><strong>Poisoned Thorns</strong> work like Rubble at a higher cost. Clear them barehanded for 3 health, or use a weapon to lose 3 weapon power and no health. As with other barricades, power below 2 destroys the weapon and discards its attached monsters. The poison causes no continuing damage after the card is cleared.</p><p><strong>Pit Trap</strong> has only one action: <strong>Clear</strong> for 1 health. You cannot use a weapon. Your equipment keeps its power and target restriction. Clearing either obstacle resolves its room slot.</p></div>
        </div>
        <div className="guide-house-scores"><h3>A final score, without a leaderboard entry</h3><p>Any run started with handicap, jokers, cosmic cards or barricades enabled still shows its final score, including the usual final-potion bonus, but cannot be entered on the high score board. Changing Settings during the run does not change its eligibility. Turn all house rules off, then start a new game for a standard scored run.</p></div>
      </section>

      <section className="guide-section guide-controls" aria-labelledby="controls-guide-title"><div><h2 id="controls-guide-title">At your table</h2><p>Hover a room card to reveal its actions and preview the health cost. The bronze sword attacks with a weapon; the fist attacks barehanded; the flask takes a potion. A dimmed action is unavailable.</p><p>Use <kbd>Tab</kbd> to focus cards and controls, then <kbd>Enter</kbd> or <kbd>Space</kbd> to activate a focused button. Focus reveals the same card actions as hovering. Press <kbd>Escape</kbd> to close this guide, or use Return to game. Reading the guide does not resolve any cards.</p></div><div className="guide-control-icons"><img src="/art/ui/control-3.png" alt="Weapon attack" /><img src="/art/ui/control-4.png" alt="Barehanded attack" /><img src="/art/ui/control-5.png" alt="Take potion" /></div></section>

      <footer className="guide-sources"><h2>The rules behind the dungeon</h2><p>Scoundrel was created by <strong>Zach Gage and Kurt Bieg</strong> in 2011. This guide explains this browser adaptation’s rules, with original examples checked against its game engine.</p><p>We allow equal-value weapon targets. Turns reset after three resolutions even when the draw pile is empty. Loss scoring includes unresolved room monsters and retains negative health. These are this adaptation’s documented interpretations.</p><p><a href="https://www.stfj.net/art/2011/Scoundrel.pdf" target="_blank" rel="noreferrer">Original rules</a><a href="https://howto.cards/en/scoundrel/" target="_blank" rel="noreferrer">Rules cross-reference</a><a href="https://www.scoundrelcardgame.com/strategy" target="_blank" rel="noreferrer">Further strategy reading</a></p><button className="guide-return" aria-label="Return to game" onClick={() => dialogRef.current?.close()}><img src="/art/ui/return-to-game.webp" alt="Return to game" /></button></footer>
    </div>
    </>}
  </dialog>
}
