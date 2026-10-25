import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyAction, canFlee, canUseWeapon, createDeck, createCosmicCards, createBarricadeCards, createInitialState, getLegalActions, isCompleteDeck, getScoreBoard, shuffleDeck } from '../src/game/index.ts'
import type { Card, GameAction, GameState, Monster, Weapon } from '../src/game/index.ts'

const standard = createDeck()
const get = (id: string) => standard.find(c => c.id === id)!
const fate = createCosmicCards()[0]
const forge = createCosmicCards()[1]
const wood = createBarricadeCards('wood', 1)[0]
const rubble = createBarricadeCards('rubble', 1)[0]
const sword = get('diamonds-10') as Weapon
const trophy = get('clubs-2') as Monster
function scenario(room: Card[], overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), status: 'playing', room, roomNumber: 1, ...overrides }
}
function resolve(state: GameState, action: GameAction): GameState {
  const result = applyAction(state, action)
  assert.equal(result.ok, true)
  return result.state
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze) }
  return value
}
function cards(state: GameState): Card[] {
  return [...state.room, ...state.dungeon, ...state.discard, ...(state.weapon ? [state.weapon.card, ...state.weapon.monsters] : [])]
}

test('custom options compose with every existing rule combination and validate without random selection', () => {
  for (const handicap of [0, 1, 2, 3, 4] as const) for (const jokers of [false, true]) for (const cosmic of [false, true]) for (const barricades of [false, true]) {
    const rules = { handicap, jokers, cosmic, barricades }
    const deck = createDeck(rules, () => .6)
    assert.equal(deck.length, 44 + handicap + Number(jokers) * 2 + Number(cosmic) * 4 + Number(barricades) * 12)
    assert.equal(new Set(deck.map(c => c.id)).size, deck.length)
    for (let i = 0; i < 5; i++) assert.equal(isCompleteDeck(deck, rules), true)
    const started = applyAction(createInitialState(), { type: 'start', deck, rules })
    assert.equal(started.ok, true)
    assert.equal(getScoreBoard(started.state), !handicap && !jokers && !cosmic && !barricades ? 'original' : 'house')
    assert.equal(isCompleteDeck([...deck.slice(1), deck[1]], rules), false)
  }
})

test('barricade counts are independently random from one to four with unique copy IDs', () => {
  let index = 0
  const deck = createDeck({ handicap: 0, jokers: false, barricades: true }, () => [0, .999, .3, .6][index++])
  assert.equal(deck.filter(c => c.kind === 'barricade' && c.material === 'wood').length, 1)
  assert.equal(deck.filter(c => c.kind === 'barricade' && c.material === 'rubble').length, 4)
  assert.equal(deck.filter(c => c.kind === 'barricade' && c.material === 'thorns').length, 2)
  assert.equal(deck.filter(c => c.kind === 'barricade' && c.material === 'pit').length, 3)
  const rules = { handicap: 0 as const, jokers: false, barricades: true }
  assert.equal(isCompleteDeck(deck, rules), true)
  assert.equal(isCompleteDeck(deck.filter(c => c.id !== 'wood-1'), rules), false)
  assert.equal(isCompleteDeck(deck, { ...rules, barricades: false }), false)
  assert.equal(isCompleteDeck([...standard, ...createCosmicCards()]), false)
  assert.equal(isCompleteDeck(deck.map(c => c.id === 'wood-1' ? { ...c, value: 2 } : c) as Card[], rules), false)
  for (const sample of [-1, 1, NaN, Infinity]) assert.throws(() => createDeck(rules, () => sample), RangeError)
})

test('Hand of Fate shuffles only the remaining room and dungeon into a fresh room', () => {
  const initial = freeze(scenario([fate, get('clubs-3'), get('hearts-2'), get('diamonds-2')], {
    dungeon: [get('spades-4'), get('clubs-5'), get('hearts-6')], discard: [get('hearts-3')],
    health: 13, potionUsed: true, resolvedThisRoom: 2, previousRoomFled: true, jokerPlayedThisRoom: true,
    weapon: { card: sword, power: 6, monsters: [trophy] },
  }))
  const returned = [...initial.dungeon, ...initial.room.filter(c => c.id !== fate.id)]
  const next = resolve(initial, { type: 'resolve', cardId: fate.id, cosmic: 'activate', randomSamples: Array(returned.length - 1).fill(0) })
  const shuffled = shuffleDeck(returned, () => 0)
  assert.deepEqual(next.room, shuffled.slice(0, 4))
  assert.deepEqual(next.dungeon, shuffled.slice(4))
  assert.deepEqual(next.discard.map(c => c.id), ['hearts-3', fate.id])
  assert.equal(next.roomNumber, initial.roomNumber + 1)
  assert.equal(next.resolvedThisRoom, 0)
  assert.equal(next.potionUsed, false)
  assert.equal(canFlee(next), true)
  assert.equal(next.weapon, initial.weapon)
  assert.equal(next.health, 13)
  assert.deepEqual(cards(next).map(c => c.id).sort(), cards(initial).map(c => c.id).sort())
  const other = resolve(initial, { type: 'resolve', cardId: fate.id, cosmic: 'activate', randomSamples: Array(returned.length - 1).fill(.999) })
  assert.notDeepEqual(other.room, next.room)
})

test('Hand of Fate handles the final partial room, last card, discard and invalid samples', () => {
  const state = scenario([fate, get('hearts-2')], { potionUsed: true, resolvedThisRoom: 2 })
  const next = resolve(state, { type: 'resolve', cardId: fate.id, cosmic: 'activate', randomSamples: [] })
  assert.deepEqual(next.room, [get('hearts-2')])
  assert.equal(next.status, 'playing')
  assert.equal(next.potionUsed, false)
  assert.equal(canFlee(next), false)
  for (const cosmic of ['activate', 'discard'] as const) {
    const won = resolve(scenario([fate]), { type: 'resolve', cardId: fate.id, cosmic, ...(cosmic === 'activate' ? { randomSamples: [] } : {}) })
    assert.equal(won.status, 'won')
    assert.equal(won.score, 20)
  }
  const room = scenario([fate, get('clubs-2'), get('hearts-2')])
  for (const samples of [undefined, [], [-1], [1], [NaN], Array(1)]) {
    const result = applyAction(room, { type: 'resolve', cardId: fate.id, cosmic: 'activate', randomSamples: samples })
    assert.equal(result.ok, false)
    assert.equal(result.state, room)
  }
  const discarded = resolve(room, { type: 'resolve', cardId: fate.id, cosmic: 'discard' })
  assert.equal(discarded.resolvedThisRoom, 1)
  assert.equal(discarded.roomNumber, room.roomNumber)
  assert.equal(discarded.discard.at(-1)?.id, fate.id)
})

test('Forge of Destiny clears trophies and target limits while retaining reduced power and healing allowance', () => {
  const initial = freeze(scenario([forge, get('clubs-12'), get('hearts-2')], {
    weapon: { card: sword, power: 6, monsters: [trophy] }, potionUsed: true,
  }))
  assert.equal(canUseWeapon(initial, get('clubs-12') as Monster), false)
  const next = resolve(initial, { type: 'resolve', cardId: forge.id, cosmic: 'activate' })
  assert.equal(next.resolvedThisRoom, 1)
  assert.equal(next.potionUsed, true)
  assert.equal(next.weapon?.power, 6)
  assert.equal(next.weapon?.card.value, 10)
  assert.deepEqual(next.weapon?.monsters, [])
  assert.deepEqual(next.discard.map(c => c.id), [trophy.id, forge.id])
  assert.equal(canUseWeapon(next, get('clubs-12') as Monster), true)
  const fought = resolve(next, { type: 'resolve', cardId: 'clubs-12', combat: 'weapon' })
  assert.equal(fought.health, 14)
  assert.equal(fought.weapon?.power, 6)
  const discarded = resolve(initial, { type: 'resolve', cardId: forge.id, cosmic: 'discard' })
  assert.equal(discarded.weapon, initial.weapon)
  const unarmed = scenario([forge])
  assert.equal(applyAction(unarmed, { type: 'resolve', cardId: forge.id, cosmic: 'activate' }).ok, false)
  assert.equal(getLegalActions(unarmed).some(a => a.type === 'resolve' && a.cosmic === 'activate'), false)
  assert.equal(resolve(unarmed, { type: 'resolve', cardId: forge.id, cosmic: 'discard' }).status, 'won')
})

test('Forge counts toward the third resolution and normal room advancement', () => {
  const next = resolve(scenario([forge, get('clubs-3')], { resolvedThisRoom: 2, weapon: { card: sword, power: 3, monsters: [trophy] }, potionUsed: true, dungeon: [get('hearts-2')] }), { type: 'resolve', cardId: forge.id, cosmic: 'activate' })
  assert.equal(next.roomNumber, 2)
  assert.equal(next.resolvedThisRoom, 0)
  assert.equal(next.potionUsed, false)
  assert.equal(next.weapon?.power, 3)
})

test('barricades cost health barehanded or current weapon power, preserving target history', () => {
  for (const barrier of [wood, rubble, createBarricadeCards('thorns', 1)[0]]) {
    const initial = freeze(scenario([barrier, get('clubs-4')], { weapon: { card: sword, power: 7, monsters: [trophy] } }))
    const bare = resolve(initial, { type: 'resolve', cardId: barrier.id, combat: 'barehanded' })
    assert.equal(bare.health, 20 - barrier.value)
    assert.equal(bare.weapon, initial.weapon)
    const armed = resolve(initial, { type: 'resolve', cardId: barrier.id, combat: 'weapon' })
    assert.equal(armed.health, 20)
    assert.equal(armed.weapon?.power, 7 - barrier.value)
    assert.equal(armed.weapon?.card.value, 10)
    assert.equal(armed.weapon?.monsters, initial.weapon!.monsters)
    assert.equal(armed.discard.at(-1)?.id, barrier.id)
    assert.equal(armed.resolvedThisRoom, 1)
    assert.equal(canUseWeapon(armed, get('clubs-4') as Monster), false)
    assert.equal(applyAction(scenario([barrier]), { type: 'resolve', cardId: barrier.id, combat: 'weapon' }).ok, false)
    assert.equal(applyAction(initial, { type: 'resolve', cardId: barrier.id }).ok, false)
  }
})

test('power below two destroys the equipped weapon and discards its attached monsters exactly once', () => {
  for (const barrier of [wood, rubble, createBarricadeCards('thorns', 1)[0]]) for (const power of [2, 3, 4, 5]) {
    const initial = scenario([barrier, get('clubs-4')], { weapon: { card: sword, power, monsters: [trophy] } })
    const next = resolve(initial, { type: 'resolve', cardId: barrier.id, combat: 'weapon' })
    const destroyed = power - barrier.value < 2
    assert.equal(next.weapon === null, destroyed)
    assert.equal(next.weapon?.power, destroyed ? undefined : power - barrier.value)
    assert.deepEqual(next.discard.map(c => c.id), destroyed ? [sword.id, trophy.id, barrier.id] : [barrier.id])
    assert.deepEqual(cards(next).map(c => c.id).sort(), cards(initial).map(c => c.id).sort())
    assert.equal(next.health, 20)
  }
})

test('barricade death takes precedence over clearing the last card; a fresh weapon restores printed power', () => {
  const lost = resolve(scenario([rubble], { health: 1 }), { type: 'resolve', cardId: rubble.id, combat: 'barehanded' })
  assert.equal(lost.status, 'lost')
  assert.equal(lost.health, -1)
  assert.equal(lost.score, -1)
  const replaced = resolve(scenario([get('diamonds-5')], { weapon: { card: sword, power: 2, monsters: [trophy] } }), { type: 'resolve', cardId: 'diamonds-5' })
  assert.equal(replaced.weapon?.power, 5)
})

test('all custom-rule deterministic runs conserve every physical card, remain immutable and terminate', () => {
  for (let seed = 1; seed <= 80; seed++) {
    let value = seed
    const random = () => ((value = (value * 1664525 + 1013904223) >>> 0) / 2 ** 32)
    const rules = { handicap: 4 as const, jokers: true, cosmic: true, barricades: true }
    const deck = shuffleDeck(createDeck(rules, random), random)
    const expected = deck.map(c => c.id).sort()
    let state = resolve(createInitialState(), { type: 'start', deck, rules })
    let steps = 0
    while (state.status === 'playing') {
      freeze(state)
      const legal = getLegalActions(state)
      assert.ok(legal.length)
      let action = legal[Math.floor(random() * legal.length)]
      if (action.type === 'resolve' && action.cosmic === 'activate' && action.cardId === fate.id) action = { ...action, randomSamples: action.randomSamples!.map(random) }
      if (action.type === 'resolve' && action.joker === 'play') action = { ...action, randomSample: random() }
      state = resolve(state, action)
      assert.deepEqual(cards(state).map(c => c.id).sort(), expected)
      assert.equal(new Set(cards(state).map(c => c.id)).size, expected.length)
      if (state.weapon) assert.ok(state.weapon.power >= 2 && state.weapon.power <= state.weapon.card.value)
      assert.ok(++steps <= 500)
    }
    assert.equal(typeof state.score, 'number')
    assert.equal(getScoreBoard(state), 'house')
  }
})

test('Devil\'s Sight costs three health, resolves a slot and reveals the next cards without drawing them', () => {
  const sight = createCosmicCards().find(card => card.id === 'cosmic-sight')!
  const initial = freeze(scenario([sight, get('clubs-3')], { dungeon: [get('hearts-2'), get('diamonds-5'), get('clubs-6'), get('spades-8')], weapon: { card: sword, power: 5, monsters: [trophy] }, potionUsed: true }))
  const next = resolve(initial, { type: 'resolve', cardId: sight.id, cosmic: 'activate' })
  assert.equal(next.health, 17)
  assert.equal(next.resolvedThisRoom, 1)
  assert.equal(next.potionUsed, true)
  assert.equal(next.weapon, initial.weapon)
  assert.equal(next.dungeon, initial.dungeon)
  assert.deepEqual(next.revealedDungeon, ['hearts-2', 'diamonds-5', 'clubs-6'])
  assert.equal(next.discard.at(-1)?.id, sight.id)
  assert.deepEqual(cards(next).map(c => c.id).sort(), cards(initial).map(c => c.id).sort())
  const discarded = resolve(initial, { type: 'resolve', cardId: sight.id, cosmic: 'discard' })
  assert.equal(discarded.health, 20)
  assert.deepEqual(discarded.revealedDungeon, [])
  assert.equal(discarded.resolvedThisRoom, 1)
})

test('Devil\'s Sight reveals after automatic refill; drawn cards leave the preview and reshuffling clears it', () => {
  const sight = createCosmicCards().find(card => card.id === 'cosmic-sight')!
  const dungeon = ['clubs-3', 'clubs-4', 'clubs-5', 'hearts-2', 'diamonds-2', 'spades-2', 'spades-3'].map(get)
  const next = resolve(scenario([sight, get('hearts-3')], { resolvedThisRoom: 2, dungeon }), { type: 'resolve', cardId: sight.id, cosmic: 'activate' })
  assert.equal(next.roomNumber, 2)
  assert.equal(next.resolvedThisRoom, 0)
  assert.deepEqual(next.revealedDungeon, ['hearts-2', 'diamonds-2', 'spades-2'])
  const fled = resolve(next, { type: 'flee' })
  assert.deepEqual(fled.revealedDungeon, [])
  assert.deepEqual(fled.room.slice(0, 3).map(c => c.id), next.revealedDungeon)
  const withFate = scenario([fate, get('clubs-2')], { dungeon: [get('hearts-2'), get('diamonds-2'), get('spades-2'), get('spades-3')], revealedDungeon: ['hearts-2', 'diamonds-2', 'spades-2'] })
  const reshuffled = resolve(withFate, { type: 'resolve', cardId: fate.id, cosmic: 'activate', randomSamples: [0, 0, 0, 0] })
  assert.deepEqual(reshuffled.revealedDungeon, [])
})

test('Devil\'s Sight supports fewer than three cards, costs health even with an empty deck and can be lethal', () => {
  const sight = createCosmicCards().find(card => card.id === 'cosmic-sight')!
  for (const count of [0, 1, 2]) {
    const dungeon = ['hearts-2', 'diamonds-2'].slice(0, count).map(get)
    const next = resolve(scenario([sight, get('clubs-2')], { dungeon }), { type: 'resolve', cardId: sight.id, cosmic: 'activate' })
    assert.equal(next.health, 17)
    assert.deepEqual(next.revealedDungeon, dungeon.map(c => c.id))
    assert.equal(next.resolvedThisRoom, 1)
  }
  const lost = resolve(scenario([sight, get('clubs-4')], { health: 3, dungeon: [get('clubs-5')] }), { type: 'resolve', cardId: sight.id, cosmic: 'activate' })
  assert.equal(lost.status, 'lost')
  assert.equal(lost.health, 0)
  assert.equal(lost.score, -9)
  const unarmed = scenario([sight])
  assert.ok(getLegalActions(unarmed).some(action => action.type === 'resolve' && action.cosmic === 'activate'))
  const won = resolve(unarmed, { type: 'resolve', cardId: sight.id, cosmic: 'activate' })
  assert.equal(won.status, 'won')
  assert.equal(won.score, 17)
})

test('Mirror of Misfortune reveals first, then requires an exchange before any other game action', () => {
  const mirror = createCosmicCards().find(card => card.id === 'cosmic-mirror')!
  const initial = freeze(scenario([mirror, get('clubs-14'), get('hearts-2'), get('diamonds-5')], {
    dungeon: [get('hearts-10'), get('spades-4')], health: 16, potionUsed: true,
    weapon: { card: sword, power: 4, monsters: [trophy] }, revealedDungeon: ['hearts-10', 'spades-4'],
  }))
  const pending = resolve(initial, { type: 'resolve', cardId: mirror.id, cosmic: 'activate' })
  assert.equal(pending.mirrorRevealed, 'hearts-10')
  assert.equal(pending.dungeon, initial.dungeon)
  assert.equal(pending.room.length, 3)
  assert.equal(pending.resolvedThisRoom, 1)
  assert.deepEqual(pending.discard, [mirror])
  assert.equal(pending.health, 16)
  assert.equal(pending.potionUsed, true)
  assert.equal(pending.weapon, initial.weapon)
  assert.equal(canFlee(pending), false)
  assert.deepEqual(getLegalActions(pending), initial.room.slice(1).map(card => ({ type: 'mirror-exchange', cardId: card.id })))
  for (const action of [{ type: 'flee' }, { type: 'resolve', cardId: 'hearts-2' }, { type: 'resolve', cardId: 'clubs-14', combat: 'barehanded' }, { type: 'resolve', cardId: mirror.id, cosmic: 'discard' }] as const) {
    const rejected = applyAction(pending, action)
    assert.equal(rejected.ok, false)
    assert.equal(rejected.state, pending)
  }
  const exchanged = resolve(freeze(pending), { type: 'mirror-exchange', cardId: 'hearts-2' })
  assert.deepEqual(exchanged.room.map(card => card.id), ['clubs-14', 'hearts-10', 'diamonds-5'])
  assert.deepEqual(exchanged.dungeon.map(card => card.id), ['hearts-2', 'spades-4'])
  assert.deepEqual(exchanged.revealedDungeon, ['hearts-2', 'spades-4'])
  assert.equal(exchanged.mirrorRevealed, null)
  assert.equal(exchanged.resolvedThisRoom, 1)
  assert.equal(exchanged.health, 16)
  assert.equal(exchanged.potionUsed, true)
  assert.equal(exchanged.weapon, initial.weapon)
  assert.deepEqual(cards(exchanged).map(card => card.id).sort(), cards(initial).map(card => card.id).sort())
  assert.equal(applyAction(pending, { type: 'mirror-exchange', cardId: mirror.id }).ok, false)
  assert.equal(applyAction(pending, { type: 'mirror-exchange', cardId: 'spades-4' }).ok, false)
  assert.equal(applyAction(initial, { type: 'mirror-exchange', cardId: 'hearts-2' }).ok, false)
  assert.equal(resolve(pending, { type: 'reset' }).mirrorRevealed, null)
})

test('the mirror third resolution waits for the required exchange before refill, including a one-card dungeon', () => {
  const mirror = createCosmicCards().find(card => card.id === 'cosmic-mirror')!
  const initial = scenario([mirror, get('clubs-14')], { dungeon: [get('hearts-10')], resolvedThisRoom: 2, potionUsed: true })
  const pending = resolve(initial, { type: 'resolve', cardId: mirror.id, cosmic: 'activate' })
  assert.equal(pending.roomNumber, 1)
  assert.equal(pending.resolvedThisRoom, 3)
  assert.equal(pending.potionUsed, true)
  assert.deepEqual(pending.room.map(card => card.id), ['clubs-14'])
  const next = resolve(pending, { type: 'mirror-exchange', cardId: 'clubs-14' })
  assert.equal(next.roomNumber, 2)
  assert.equal(next.resolvedThisRoom, 0)
  assert.equal(next.potionUsed, false)
  assert.equal(next.mirrorRevealed, null)
  assert.deepEqual(next.room.map(card => card.id), ['hearts-10', 'clubs-14'])
  assert.deepEqual(next.dungeon, [])
  assert.deepEqual(next.revealedDungeon, [])
  assert.equal(next.health, 20)
})

test('mirror activation requires both a dungeon card and another room card; Discard remains available', () => {
  const mirror = createCosmicCards().find(card => card.id === 'cosmic-mirror')!
  for (const state of [scenario([mirror], { dungeon: [get('hearts-2')] }), scenario([mirror, get('clubs-2')]), scenario([mirror])]) {
    assert.equal(applyAction(state, { type: 'resolve', cardId: mirror.id, cosmic: 'activate' }).ok, false)
    assert.equal(getLegalActions(state).some(action => action.type === 'resolve' && action.cardId === mirror.id && action.cosmic === 'activate'), false)
    const discarded = resolve(state, { type: 'resolve', cardId: mirror.id, cosmic: 'discard' })
    assert.equal(discarded.discard.at(-1)?.id, mirror.id)
    assert.equal(discarded.mirrorRevealed, null)
  }
})

test('Pit Trap costs exactly one health, preserves equipment and never permits weapon use', () => {
  const pit = createBarricadeCards('pit', 1)[0]
  const state = freeze(scenario([pit, get('clubs-2')], { weapon: { card: sword, power: 2, monsters: [trophy] } }))
  assert.equal(getLegalActions(state).some(action => action.type === 'resolve' && action.cardId === pit.id && action.combat === 'weapon'), false)
  assert.equal(applyAction(state, { type: 'resolve', cardId: pit.id, combat: 'weapon' }).ok, false)
  const next = resolve(state, { type: 'resolve', cardId: pit.id, combat: 'barehanded' })
  assert.equal(next.health, 19)
  assert.equal(next.weapon, state.weapon)
  assert.equal(next.resolvedThisRoom, 1)
  assert.deepEqual(next.discard, [pit])
  const lost = resolve(scenario([pit], { health: 1 }), { type: 'resolve', cardId: pit.id, combat: 'barehanded' })
  assert.equal(lost.status, 'lost')
  assert.equal(lost.score, 0)
})

test('Poisoned Thorns have an immediate three-point cost with no continuing poison effect', () => {
  const thorns = createBarricadeCards('thorns', 1)[0]
  const state = scenario([thorns, get('hearts-2')], { weapon: { card: sword, power: 5, monsters: [] } })
  const bare = resolve(state, { type: 'resolve', cardId: thorns.id, combat: 'barehanded' })
  assert.equal(bare.health, 17)
  assert.equal(bare.weapon, state.weapon)
  const armed = resolve(state, { type: 'resolve', cardId: thorns.id, combat: 'weapon' })
  assert.equal(armed.health, 20)
  assert.equal(armed.weapon?.power, 2)
  const healed = resolve(bare, { type: 'resolve', cardId: 'hearts-2' })
  assert.equal(healed.health, 19)
})
