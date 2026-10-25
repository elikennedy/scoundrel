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
const chapters = [['guide-basics', 'Basics'], ['guide-room', 'Rooms'], ['guide-combat', 'Combat'], ['guide-practice', 'Practice'], ['guide-ending', 'Scoring'], ['guide-house', 'House rules']]
const houseChapters = [['guide-handicap', 'Handicap'], ['guide-jokers', 'Jokers'], ['guide-obstacles', 'Obstacles'], ['guide-cosmic', 'Cosmic cards'], ['guide-first-blood', 'First Blood']]
const cosmicChapters = [['guide-fate', 'Hand of Fate'], ['guide-forge', 'Forge of Destiny'], ['guide-sight', 'Devil’s Sight'], ['guide-mirror', 'Mirror of Misfortune']]

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
    const heading = section?.matches('h2, h3') ? section : section?.querySelector<HTMLElement>('h2, h3')
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
        <div><h2 id="guide-title"><img src="/art/ui/how-to-play.webp" alt="How to Play" /></h2><p className="guide-lead">You have 20 health. The standard dungeon has 44 cards.<br />Make every choice earn its place.</p><p>Scoundrel is a solitaire dungeon crawl. Monsters cost health, weapons soften their blows, and potions buy you another chance. Survive every card to win. Start with the basics below, then try the practice room. Leave optional house rules off for your first dungeon.</p><button className="guide-text-link" onClick={() => jump('guide-practice')}>Try the practice room <span aria-hidden="true">↓</span></button><p className="guide-timed-note">Already playing First Blood? This guide does not pause an active bleeding timer.</p></div>
        <div className="guide-hero-art" aria-label="A monster, a weapon and a healing potion"><GuideCard id="clubs-13" /><GuideCard id="diamonds-10" /><GuideCard id="hearts-10" /></div>
      </header>

      <section className="guide-section guide-controls" id="guide-basics" aria-labelledby="controls-guide-title"><div><h2 id="controls-guide-title">At your table</h2><p>Hover a room card to reveal its actions and preview the health cost. The bronze sword attacks with a weapon; the fist attacks barehanded; the flask takes a potion. A dimmed action is unavailable.</p><p>Use <kbd>Tab</kbd> to focus cards and controls, then <kbd>Enter</kbd> or <kbd>Space</kbd> to activate a focused button. Focus reveals the same card actions as hovering. Press <kbd>Escape</kbd> to close this guide, or use Return to game.</p><p>The face-down pile on the left is your dungeon; the face-up pile on the right is discard. Hover or focus discard to inspect its last five cards. The bottom of the table shows health and your equipped weapon. Reading this guide does not resolve cards or pause First Blood.</p></div><div className="guide-control-icons"><img src="/art/ui/control-3.png" alt="Weapon attack" /><img src="/art/ui/control-4.png" alt="Barehanded attack" /><img src="/art/ui/control-5.png" alt="Take potion" /></div></section>

      <section className="guide-section" id="guide-cards" aria-labelledby="cards-guide-title">
        <div className="guide-section-intro"><h2 id="cards-guide-title">Know your three card types.</h2><p>The standard 44-card dungeon has monsters, weapons and potions. Their painted names vary; the banner’s number tells you the value. Learn these three types before adding optional cards.</p></div>
        <div className="guide-card-types">
        <article><GuideCard id="clubs-13" /><h3>Monsters</h3><p>There are 26: clubs and spades, valued 2 through 14. The number on the banner is the danger. Jacks are 11, queens 12, kings 13 and aces 14.</p><p>Choose a weapon attack or fight barehanded. Both defeat the monster immediately, but the health cost—and the effect on your weapon—can be very different.</p></article>
        <article><GuideCard id="diamonds-7" /><h3>Weapons</h3><p>There are nine, valued 2 through 10. A weapon reduces the damage you take by its power. Against monsters its power stays the same; its allowed targets narrow as you use it.</p><p><strong>Taking a weapon always equips it.</strong> Your previous weapon and its defeated monsters go to the discard pile. A new weapon starts with no target limit.</p></article>
        <article><GuideCard id="hearts-6" /><h3>Potions</h3><p>There are nine, valued 2 through 10. Each can restore that much health, up to the maximum of 20. Only the first potion you take in a turn heals you.</p><p>Later potions are discarded for no healing, but still count as resolved cards. The allowance resets when the next turn begins.</p></article>
        </div>
      </section>

      <section className="guide-section" id="guide-room" aria-labelledby="room-guide-title">
        <div className="guide-section-intro"><h2 id="room-guide-title">Four cards. Three choices.</h2><p>The face-down pile is the dungeon. Each room reveals four cards. The standard deck removes jokers, red aces and red face cards. Optional house rules can add them back; see the House rules chapter. Before touching any of them, decide whether to flee. If you stay, resolve <strong>three cards, in any order</strong>. Each fight, weapon pickup or potion counts as one choice.</p></div>
        <div className="guide-room-example"><GuideCard id="diamonds-7" caption="Equip a weapon" /><GuideCard id="clubs-10" caption="Fight a monster" /><GuideCard id="hearts-6" caption="Drink a potion" /><GuideCard id="spades-12" caption="Carry one forward" className="guide-carry" /></div>
        <div className="guide-room-afterword"><p>The fourth card is your next room’s first problem—or its saving grace. It slides to the rightmost position, then three new cards join it. There is no separate “end turn” button.</p><p><strong>At the dungeon’s end:</strong> if there aren’t enough cards to refill the room, play what remains. Emptying the draw pile alone does not win. Resolve every card still on the table; every three resolutions still start a fresh turn.</p></div>
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

      <section className="guide-section guide-healing" id="guide-healing" aria-labelledby="healing-guide-title">
        <div className="guide-potion-art"><GuideCard id="hearts-8" caption="First potion: heals" /><GuideCard id="hearts-6" caption="Second potion: discarded" /></div>
        <div><h2 id="healing-guide-title">Make the healing count.</h2><p>At 16 health, an 8-value potion restores only 4: the rest is lost to the 20-health cap. Taking it still uses your turn’s healing allowance. A potion taken at full health uses that allowance too.</p><p>If you take another potion before resolving three cards, it heals nothing. Consider leaving that second potion as your carryover instead, so it can heal in the next turn.</p><p><strong>Fight, then heal—when you can survive the fight.</strong> Taking damage first can make space for a potion’s full value. But a potion cannot rescue you after a lethal hit: zero health ends the run immediately.</p></div>
      </section>

      <section className="guide-section guide-flee" aria-labelledby="flee-guide-title">
        <div><h2 id="flee-guide-title">Live to face it later.</h2><p>Flee before resolving any card in a full, four-card room. All four cards return to the <strong>bottom of the dungeon</strong> in their current order, without shuffling, and a new room is dealt.</p><p>You cannot flee two rooms in a row. After an escape, you must resolve the next room before fleeing is available again. Once you resolve a card, the decision to stay is made.</p><p>Fleeing postpones a problem; it does not remove it. Those monsters will return. When fewer than four cards remain in a room, fleeing is unavailable.</p></div><div className="guide-flee-art"><img src="/art/ui/card-back.webp" alt="Cards return to the bottom of the draw pile" /><img src="/art/ui/control-2.png" alt="" /></div>
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

      <section className="guide-section" id="guide-ending" aria-labelledby="ending-guide-title">
        <div className="guide-section-intro"><h2 id="ending-guide-title">Survival is the first victory.</h2><p>You win when the draw pile and room are both empty and you still have health. Cards in your equipped stack are already resolved. If health reaches zero or below, the run ends immediately—even if that fight also removed the last card.</p></div>
        <div className="guide-endings"><article><img src="/art/ui/bronze-chalice.webp" alt="" /><div><h3>Leave the dungeon alive</h3><p>Your remaining health is your score. Finishing at 13 health scores <strong>13</strong>.</p><p>For the final-potion bonus, finish at exactly 20 health with a potion as the last card resolved. Add that potion’s value: a final 8 scores <strong>28</strong>. In this version, the last card’s identity counts even if that potion did not heal.</p></div></article><article><img src="/art/ui/bronze-skull.webp" alt="" /><div><h3>Fall in the dungeon</h3><p>Keep any negative health, then subtract the total value of every unresolved monster in the room and draw pile. Do not count defeated monsters attached to your weapon.</p><p>Example: at 3 health, an 11-value barehanded fight leaves −8. If a 14 and a 6 remain unresolved, your score is <strong>−28</strong>.</p></div></article></div>
        <div className="guide-score-saving"><h3>Keep your score</h3><p>After victory or defeat, you can enter three letters and choose <strong>Save score</strong>. Saving is optional; <strong>Play again</strong> starts a new run. High scores keeps the best ten on each of two boards in this browser.</p><p>Every house rule off means <strong>Original rules</strong>. Any enabled option—including First Blood alone—means <strong>House rules</strong>. The board is fixed when the run starts. Use the bronze laurel control to view either board; changing Settings does not move an existing run between them.</p></div>
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

      <section className="guide-section guide-house" id="guide-house" aria-labelledby="house-guide-title">
        <div className="guide-section-intro">
          <h2 id="house-guide-title">Change your next dungeon.</h2>
          <p>Learn the standard game first, then add the challenges you want. Open the bronze <strong>Settings</strong> cog to choose Handicap, Jokers, Barricades, Cosmic cards or First Blood. All five default off, work independently and can be combined. Your choices are saved in this browser and apply to <strong>new games</strong>; changing a setting never changes the run already in progress.</p>
          <p>These are house rules for this adaptation, separate from the original rules by Zach Gage and Kurt Bieg. Any enabled option puts the run on the <strong>House rules</strong> high score board.</p>
          <nav className="guide-house-nav" aria-label="House rule topics">{houseChapters.map(([id, name]) => <button className="guide-text-link" key={id} onClick={() => jump(id)}>{name}</button>)}</nav>
        </div>

        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Examples of the eight optional handicap cards"><GuideCard id="diamonds-12" caption="A stronger weapon" /><GuideCard id="hearts-13" caption="More healing" /></div>
          <div><h3 id="guide-handicap">Handicap: stronger supplies</h3><p>Choose level 1–4 to add that many distinct cards from the eight hearts and diamonds valued 11–14: their jacks, queens, kings and aces. The selection is made at random for each new game, then shuffled into the dungeon.</p><p>Diamonds equip at their printed power, 11–14. Hearts heal their printed value, still capped at 20 and limited to one healing potion per turn. At 16 health, a value-13 heart restores only 4 and uses that turn’s allowance.</p><p>Level 2 makes a 46-card dungeon; adding both jokers makes 48. This option adds supplies without changing how weapons or healing work.</p></div>
        </div>

        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="The two optional jokers"><GuideCard id="joker-1" /><GuideCard id="joker-2" /></div>
          <div><h3 id="guide-jokers">Jokers: retrieve a discarded card</h3><p><strong>Jokers in</strong> adds The Grinning Harlequin and The Briar Trickster. Each offers <strong>Play</strong> and <strong>Discard</strong>.</p><p><strong>Play:</strong> discard the joker and replace it in the same room slot with one random card already in discard. That card might be a weapon, a potion or a monster. Resolve it normally afterward. The swap spends <strong>no resolution</strong> and does not reset healing.</p><p><strong>Discard:</strong> send the joker to discard and count one resolution. With an empty discard pile, this is the only available choice.</p><p>Either choice commits you to the room, so you cannot flee afterward. A joker cannot retrieve itself, but it can retrieve the other joker. Defeated monsters still attached to your weapon are not in discard and cannot be retrieved.</p></div>
        </div>

        <div className="guide-house-topic">
          <h3 id="guide-obstacles">Barricades, thorns and traps</h3>
          <p><strong>Barricades in</strong> adds 1–4 copies of each of the four obstacles below, for 4–16 extra cards. Each count is chosen independently for every new game. All occupy room slots; clearing one discards it and counts as one resolution.</p>
          <table className="guide-obstacle-costs">
            <caption>Choose between health and weapon power</caption>
            <thead><tr><th scope="col">Obstacle</th><th scope="col">Barehanded / Clear</th><th scope="col">With a weapon</th></tr></thead>
            <tbody>
              <tr><th scope="row">Wooden Barricade</th><td>Lose 1 health</td><td>Lose 1 power; no health lost</td></tr>
              <tr><th scope="row">Rubble</th><td>Lose 2 health</td><td>Lose 2 power; no health lost</td></tr>
              <tr><th scope="row">Poisoned Thorns</th><td>Lose 3 health</td><td>Lose 3 power; no health lost</td></tr>
              <tr><th scope="row">Pit Trap</th><td>Lose 1 health</td><td>Unavailable</td></tr>
            </tbody>
          </table>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Wooden Barricade and Rubble"><GuideCard id="wood-1" caption="Wood: costs 1" /><GuideCard id="rubble-1" caption="Rubble: costs 2" /></div>
          <div><h3>Wood and rubble: health or weapon wear</h3><p>Barehanded clearing pays the health cost and leaves your weapon unchanged. Using <strong>Weapon</strong> pays no health, but permanently reduces its current power. Unlike fighting a monster, this wears down the weapon itself.</p><p>Any equipped weapon can clear wood, rubble or thorns, even if its monster target limit is low. Clearing an obstacle <strong>does not change that target limit</strong> or add a monster trophy.</p><p>A weapon reduced below power 2 breaks: discard it and all its attached monsters. A power-4 weapon survives Rubble at power 2; clearing a Wooden Barricade next would break it. The equipped card and status show its remaining power.</p><p>Equipping a new weapon restores that card’s printed power, even if a joker retrieved it from discard. Forge of Destiny clears the target limit but <strong>does not repair wear</strong>.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art" aria-label="Poisoned Thorns and Pit Trap"><GuideCard id="thorns-1" caption="Thorns: costs 3" /><GuideCard id="pit-1" caption="Trap: 1 health only" /></div>
          <div><h3>Thorns and traps: know the exception</h3><p><strong>Poisoned Thorns</strong> cost 3 health barehanded or 3 weapon power with no health loss. Power below 2 still breaks your weapon. Despite the name, the thorns cause <strong>no continuing poison damage</strong>.</p><p><strong>Pit Trap</strong> has only <strong>Clear</strong>: lose 1 health. There is no weapon option, and your equipment keeps its power and target limit.</p><p>Health costs can kill you. With First Blood enabled, paying any obstacle’s health cost also starts bleeding; paying only weapon power does not. Unresolved obstacles add no monster penalty to a defeat score.</p></div>
        </div>

        <div className="guide-house-topic">
          <h3 id="guide-cosmic">Cosmic cards: change the situation</h3>
          <p><strong>Cosmic cards in</strong> adds one each of Hand of Fate, Forge of Destiny, Devil’s Sight and Mirror of Misfortune. Look for the purple question-mark banner. Each has <strong>Activate</strong> and <strong>Discard</strong> actions.</p>
          <p><strong>Discard</strong> always resolves that card’s slot without using its power. Activate also resolves it, except that Hand of Fate starts a fresh room. Read each effect before choosing: some require a weapon or other cards, and Devil’s Sight costs health. Choosing either action commits you to the room.</p>
          <nav className="guide-house-nav" aria-label="Cosmic card topics">{cosmicChapters.map(([id, name]) => <button className="guide-text-link" key={id} onClick={() => jump(id)}>{name}</button>)}</nav>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art guide-house-single"><GuideCard id="cosmic-fate" caption="Shuffle the remaining dungeon" /></div>
          <div><h3 id="guide-fate">Hand of Fate: deal a fresh room</h3><p><strong>Activate:</strong> discard Hand of Fate, return every other unresolved room card to the dungeon, shuffle all those remaining cards together, then deal a new room of up to four.</p><p>You keep your health, weapon, its current power and trophies, and the existing discard pile. Previously resolved cards do not come back. A card you just returned may be dealt straight back.</p><p>The fresh room resets your resolution count and healing allowance. Normal flee rules apply again, including in a full new room. Any old dungeon preview is cleared. If you want to keep the current room, choose <strong>Discard</strong> instead.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art guide-house-single"><GuideCard id="cosmic-forge" caption="Reset the target limit" /></div>
          <div><h3 id="guide-forge">Forge of Destiny: free your weapon</h3><p><strong>Activate:</strong> resolve the forge, discard all monsters attached to your equipped weapon, and clear its target limit. It can now face any next monster.</p><p>The weapon keeps its current power. A weapon worn down to power 2 stays at power 2; the forge does not repair it or replace it. Your healing allowance does not reset unless this resolution ends the turn.</p><p>You must have an equipped weapon to Activate. Without one, choose <strong>Discard</strong>. As with other ordinary resolutions, a third choice refills the room.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art guide-house-single"><GuideCard id="cosmic-sight" caption="Pay 3 health to see ahead" /></div>
          <div><h3 id="guide-sight">Devil’s Sight: pay to look ahead</h3><p><strong>Activate:</strong> resolve the sight, lose <strong>3 health</strong>, and reveal up to the next three cards still in the dungeon, in draw order. They stay in the deck. If this is your third resolution, the room refills first; you see the cards after that refill.</p><p>The temporary preview opens beside the draw pile. Dismiss it with <strong>X</strong>, or continue playing to clear it. Once closed it cannot reopen; another reveal activation can open a new preview.</p><p>With fewer than three dungeon cards, you see what remains. The cost applies even when the dungeon is empty, and <strong>kills you at 3 health or less</strong>. In First Blood, it also starts bleeding. Choose <strong>Discard</strong> to resolve the card without paying health or revealing anything.</p></div>
        </div>
        <div className="guide-house-row">
          <div className="guide-house-art guide-house-single"><GuideCard id="cosmic-mirror" caption="Reveal, then choose an exchange" /></div>
          <div><h3 id="guide-mirror">Mirror of Misfortune: make the exchange</h3><p><strong>Activate:</strong> resolve the mirror and reveal the top dungeon card. Then choose <strong>Exchange</strong> on a remaining room card. The revealed card takes its place, and the card you chose returns to the <strong>top</strong> of the dungeon.</p><p>You must finish this exchange before any other gameplay action, apart from starting a new game. Closing the preview with <strong>X</strong> does not cancel the choice. The preview also closes when you exchange.</p><p>The exchange costs no health or extra resolution. It does not equip, heal with or resolve the incoming card. Your weapon and healing allowance stay unchanged. If the mirror was your third resolution, the room refills only after the exchange; the returned top card may be dealt immediately.</p><p>Activate needs both a dungeon card and another room card. Otherwise, <strong>Discard</strong> remains available. First Blood keeps running while you decide, so an unfinished exchange does not protect you from bleeding damage.</p></div>
        </div>

        <div className="guide-house-row guide-first-blood">
          <div className="guide-blood-example" aria-label="First Blood grace timer examples">
            <figure><div className="guide-blood-clock" aria-hidden="true" /><figcaption>0 seconds<br />Fresh grace</figcaption></figure>
            <figure><div className="guide-blood-clock half-full" aria-hidden="true" /><figcaption>2.5 seconds<br />Half used</figcaption></figure>
            <figure><img src="/art/ui/bleeding.webp" alt="Bleeding" loading="lazy" /><figcaption>5 seconds<br />Grace expires</figcaption></figure>
          </div>
          <div><h3 id="guide-first-blood">First Blood: act before you bleed</h3><p>Enable <strong>First Blood</strong> for time pressure without adding cards. Nothing counts down until you first lose health. Monster damage, an obstacle’s health cost or Devil’s Sight starts <strong>permanent bleeding</strong>. A zero-damage weapon attack or weapon wear alone does not.</p><p>You get <strong>5 free seconds</strong> after each successful gameplay action. Then each full additional second costs <strong>1 health</strong>: the warning appears at 5 seconds, the first point is lost at 6, the next at 7, and so on. Waiting can kill you.</p><p>Playing or discarding a card, equipping, healing, clearing an obstacle, fleeing and choosing a Mirror exchange all renew the five-second grace period. Joker swaps and cosmic actions count too, even when they do not spend a normal resolution. An unavailable action does not reset it.</p><p><strong>Healing restores health but never cures bleeding</strong>, even at 20 health. Card animations do not consume your thinking time. Settings, this guide and background tabs keep the clock running; opening, closing or clicking through them does not give fresh grace. Read this chapter before starting a timed run.</p><p>The health area shows remaining grace. The unlabelled circle above discard fills clockwise with blood, then becomes the pulsing <strong>BLEEDING</strong> image shown here. The music plays at double speed with a deeper pitch while this warning is active, returning to its normal speed and pitch when you take an action or the run ends. With reduced motion the warning stays steady. The full-screen red tint gets stronger as health falls; it stays faint at 20 health. These examples are still images, not a running timer.</p><p>Bleed damage never resolves cards, repairs a weapon or resets healing. Death can interrupt a pending Mirror exchange. Victory or defeat stops the clock; a new game clears bleeding. All First Blood runs use the House rules high score board.</p></div>
        </div>
        <p className="guide-house-summary">With every card option at its maximum, the dungeon has 70 cards. First Blood changes the pace, not the deck size. All combinations share the House rules high score board.</p>
      </section>

      <footer className="guide-sources"><h2>The rules behind the dungeon</h2><p>Scoundrel was created by <strong>Zach Gage and Kurt Bieg</strong> in 2011. This guide explains this browser adaptation’s rules, with original examples checked against its game engine.</p><p>We allow equal-value weapon targets. Turns reset after three resolutions even when the draw pile is empty. Loss scoring includes unresolved room monsters and retains negative health. These are this adaptation’s documented interpretations.</p><p><a href="https://www.stfj.net/art/2011/Scoundrel.pdf" target="_blank" rel="noreferrer">Original rules</a><a href="https://howto.cards/en/scoundrel/" target="_blank" rel="noreferrer">Rules cross-reference</a><a href="https://www.scoundrelcardgame.com/strategy" target="_blank" rel="noreferrer">Further strategy reading</a></p><button className="guide-return" aria-label="Return to game" onClick={() => dialogRef.current?.close()}><img src="/art/ui/return-to-game.webp" alt="Return to game" /></button></footer>
    </div>
    </>}
  </dialog>
}
