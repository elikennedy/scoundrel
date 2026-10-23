import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyAction, canFlee, canUseWeapon, createDeck, createInitialState, gameReducer, getLegalActions, shuffleDeck } from '../src/game/index.ts'
import type { Card, CardId, GameAction, GameState, Monster, Weapon } from '../src/game/index.ts'

function card(id: CardId): Card {
  return createDeck().find((entry) => entry.id === id)!
}
function monster(id: CardId): Monster {
  const found = card(id)
  assert.equal(found.kind, 'monster')
  return found as Monster
}
function weapon(id: CardId): Weapon {
  const found = card(id)
  assert.equal(found.kind, 'weapon')
  return found as Weapon
}
function start(): GameState {
  return gameReducer(createInitialState(), { type: 'start', deck: createDeck() })
}
// Small valid endgame snapshots isolate rules without playing through 44 cards.
function scenario(room: CardId[], overrides: Partial<GameState> = {}): GameState {
  return { ...start(), room: room.map(card), dungeon: [], ...overrides }
}
function resolve(state: GameState, cardId: CardId, combat?: 'barehanded' | 'weapon'): GameState {
  const result = applyAction(state, { type: 'resolve', cardId, combat })
  assert.equal(result.ok, true)
  return result.state
}
function frozen<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value)
    for (const child of Object.values(value)) frozen(child)
  }
  return value
}

test('deck contains exactly 26 monsters, 9 weapons, 9 potions with unique artwork IDs', () => {
  const deck = createDeck()
  assert.equal(new Set(deck.map((entry) => entry.id)).size, 44)
  assert.deepEqual(['monster', 'weapon', 'potion'].map((kind) => deck.filter((entry) => entry.kind === kind).length), [26, 9, 9])
  assert.equal(monster('spades-14').value, 14)
  assert.ok(deck.filter((entry) => entry.kind !== 'monster').every((entry) => entry.value <= 10))
})

test('shuffle is reproducible, preserves cards and input, and rejects invalid randomness', () => {
  const deck = frozen(createDeck())
  const shuffled = shuffleDeck(deck, () => 0.5)
  assert.deepEqual(shuffled, shuffleDeck(deck, () => 0.5))
  assert.notDeepEqual(shuffled, deck)
  assert.deepEqual(shuffled.map((entry) => entry.id).sort(), deck.map((entry) => entry.id).sort())
  for (const sample of [-1, 1, NaN, Infinity]) assert.throws(() => shuffleDeck(deck, () => sample), RangeError)
})

test('start deals four at 20 health; restart and reset discard prior progress', () => {
  const state = start()
  assert.equal(state.status, 'playing')
  assert.equal(state.health, 20)
  assert.equal(state.room.length, 4)
  assert.equal(state.dungeon.length, 40)
  assert.equal(state.roomNumber, 1)
  assert.deepEqual(gameReducer({ ...state, health: 1 }, { type: 'start', deck: createDeck() }), state)
  assert.deepEqual(gameReducer(state, { type: 'reset' }), createInitialState())
})

test('malformed, duplicate and incomplete decks are rejected', () => {
  const deck = createDeck()
  const state = createInitialState()
  for (const bad of [deck.slice(1), [...deck.slice(1), deck[1]], [{ ...deck[0], value: 14 } as Card, ...deck.slice(1)]]) {
    const result = applyAction(state, { type: 'start', deck: bad })
    assert.equal(result.ok, false)
    assert.equal(result.state, state)
  }
})

test('resolve three, carry the fourth, refill, and reset potion allowance', () => {
  let state = scenario(['hearts-2', 'diamonds-2', 'hearts-3', 'clubs-8'], { health: 10, dungeon: [card('hearts-4'), card('clubs-2'), card('spades-2')] })
  state = resolve(state, 'hearts-2')
  state = resolve(state, 'diamonds-2')
  state = resolve(state, 'hearts-3')
  assert.equal(state.health, 12)
  assert.deepEqual(state.room.map((entry) => entry.id), ['clubs-8', 'hearts-4', 'clubs-2', 'spades-2'])
  assert.equal(state.resolvedThisRoom, 0)
  assert.equal(state.potionUsed, false)
  assert.equal(resolve(state, 'hearts-4').health, 16)
})

test('flee preserves order at deck bottom, forbids consecutive fleeing and locks after resolving', () => {
  const initial = start()
  const fled = gameReducer(initial, { type: 'flee' })
  assert.deepEqual(fled.dungeon.slice(-4), initial.room)
  assert.deepEqual(fled.room, initial.dungeon.slice(0, 4))
  assert.equal(canFlee(fled), false)
  assert.equal(gameReducer(fled, { type: 'flee' }), fled)
  let state = resolve(fled, fled.room[0].id, 'barehanded')
  assert.equal(canFlee(state), false)
  state = resolve(state, state.room[0].id, 'barehanded')
  state = resolve(state, state.room[0].id)
  assert.equal(canFlee(state), true)
  assert.equal(canFlee(scenario(['hearts-2'])), false)
})

test('weapon combat reduces damage, allows equal targets and rejects higher targets', () => {
  let state = scenario(['diamonds-5', 'clubs-8', 'spades-8', 'clubs-9'], { dungeon: [card('hearts-2')] })
  state = resolve(state, 'diamonds-5')
  state = resolve(state, 'clubs-8', 'weapon')
  assert.equal(state.health, 17)
  assert.equal(canUseWeapon(state, monster('spades-8')), true)
  assert.equal(canUseWeapon(state, monster('clubs-9')), false)
  assert.equal(gameReducer(state, { type: 'resolve', cardId: 'clubs-9', combat: 'weapon' }), state)
  state = resolve(state, 'spades-8', 'weapon')
  assert.equal(state.health, 14)
  assert.equal(state.weapon?.monsters.length, 2)
})

test('barehanded combat preserves weapon history; weak monsters cause zero weapon damage', () => {
  const equipped = { card: weapon('diamonds-10'), monsters: [monster('clubs-5')] }
  let state = scenario(['clubs-9', 'spades-2'], { weapon: equipped })
  state = resolve(state, 'clubs-9', 'barehanded')
  assert.equal(state.health, 11)
  assert.equal(state.weapon, equipped)
  assert.equal(state.discard.at(-1)?.id, 'clubs-9')
  state = resolve(state, 'spades-2', 'weapon')
  assert.equal(state.health, 11)
  assert.equal(state.weapon?.monsters.at(-1)?.id, 'spades-2')
})

test('replacement is binding and discards old weapon and all attached monsters', () => {
  const equipped = { card: weapon('diamonds-10'), monsters: [monster('clubs-5'), monster('spades-2')] }
  const state = resolve(scenario(['diamonds-2', 'clubs-14'], { weapon: equipped }), 'diamonds-2')
  assert.deepEqual(state.discard.map((entry) => entry.id), ['diamonds-10', 'clubs-5', 'spades-2'])
  assert.equal(state.weapon?.card.value, 2)
  assert.equal(state.weapon?.monsters.length, 0)
  assert.equal(canUseWeapon(state, monster('clubs-14')), true)
})

test('potions cap at 20 and a potion taken at full health still consumes the allowance', () => {
  let state = scenario(['hearts-2', 'clubs-5', 'hearts-10', 'clubs-2'])
  state = resolve(state, 'hearts-2')
  state = resolve(state, 'clubs-5', 'barehanded')
  state = resolve(state, 'hearts-10')
  assert.equal(state.health, 15)
  assert.equal(resolve(scenario(['hearts-10'], { health: 18 }), 'hearts-10').health, 20)
})

test('death retains negative health, counts room and deck monsters, and takes precedence over victory', () => {
  const state = resolve(scenario(['clubs-14', 'spades-8', 'hearts-2'], { health: 3, dungeon: [card('clubs-5'), card('diamonds-2')] }), 'clubs-14', 'barehanded')
  assert.equal(state.status, 'lost')
  assert.equal(state.health, -11)
  assert.equal(state.score, -24)
  const simultaneous = resolve(scenario(['clubs-2'], { health: 2 }), 'clubs-2', 'barehanded')
  assert.equal(simultaneous.status, 'lost')
  assert.equal(simultaneous.score, 0)
})

test('empty draw pile is not victory; final leftover is played in a new turn', () => {
  let state = scenario(['hearts-2', 'diamonds-2', 'hearts-3', 'hearts-4'], { health: 18 })
  state = resolve(state, 'hearts-2')
  assert.equal(state.status, 'playing')
  state = resolve(state, 'diamonds-2')
  state = resolve(state, 'hearts-3')
  assert.equal(state.status, 'playing')
  assert.equal(state.room.length, 1)
  assert.equal(state.potionUsed, false)
  state = resolve(state, 'hearts-4')
  assert.equal(state.status, 'won')
  assert.equal(state.score, 24)
  const ordinaryWin = resolve(scenario(['clubs-2']), 'clubs-2', 'barehanded')
  assert.equal(ordinaryWin.score, 18)
})

test('invalid actions and terminal actions preserve state and expose rejection reasons', () => {
  const state = frozen(scenario(['clubs-2', 'hearts-3']))
  const cases: [GameAction, string][] = [
    [{ type: 'resolve', cardId: 'clubs-2' }, 'combat-required'],
    [{ type: 'resolve', cardId: 'clubs-2', combat: 'weapon' }, 'weapon-unavailable'],
    [{ type: 'resolve', cardId: 'hearts-3', combat: 'barehanded' }, 'unexpected-combat'],
    [{ type: 'resolve', cardId: 'spades-14', combat: 'barehanded' }, 'card-not-in-room'],
  ]
  for (const [action, error] of cases) {
    const result = applyAction(state, action)
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.error, error)
    assert.equal(result.state, state)
  }
  for (const status of ['ready', 'won', 'lost'] as const) {
    const terminal = { ...state, status }
    assert.deepEqual(getLegalActions(terminal), [])
    assert.equal(gameReducer(terminal, { type: 'flee' }), terminal)
  }
})

test('complete deterministic runs conserve every card, never mutate state and always terminate', () => {
  for (let seed = 1; seed <= 100; seed++) {
    let randomState = seed
    const random = () => { randomState = (randomState * 1664525 + 1013904223) >>> 0; return randomState / 2 ** 32 }
    let state = gameReducer(createInitialState(), { type: 'start', deck: shuffleDeck(createDeck(), random) })
    let steps = 0
    while (state.status === 'playing') {
      frozen(state)
      const actions = getLegalActions(state)
      assert.ok(actions.length)
      const result = applyAction(state, actions[Math.floor(random() * actions.length)])
      assert.equal(result.ok, true)
      state = result.state
      const all = [...state.dungeon, ...state.room, ...state.discard, ...(state.weapon ? [state.weapon.card, ...state.weapon.monsters] : [])]
      assert.equal(all.length, 44)
      assert.equal(new Set(all.map((entry) => entry.id)).size, 44)
      assert.ok(state.health <= 20)
      assert.ok(++steps <= 100)
    }
    assert.equal(typeof state.score, 'number')
  }
})
