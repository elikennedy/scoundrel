import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyAction, createInitialState, createDeck, createBarricadeCards, createCosmicCards, getLegalActions, getScoreBoard } from '../src/game/index.ts'
import type { Card, GameAction, GameState, Weapon } from '../src/game/index.ts'

const deck = createDeck()
const card = (id: string) => deck.find(card => card.id === id)!
const rules = { handicap: 0 as const, jokers: false, firstBlood: true }
function scenario(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), rules, status: 'playing', roomNumber: 1,
    room: [card('clubs-2'), card('hearts-10'), card('diamonds-10'), card('spades-3')], dungeon: [card('clubs-5')], ...overrides }
}
function act(state: GameState, action: GameAction): GameState {
  const result = applyAction(state, action)
  assert.equal(result.ok, true)
  return result.state
}
const wait = (state: GameState, milliseconds: number) => act(state, { type: 'elapse', milliseconds })
const wound = (state = scenario()) => act(state, { type: 'resolve', cardId: 'clubs-2', combat: 'barehanded' })

test('First Blood adds no cards, snapshots its rule and starts only on actual health loss', () => {
  const started = act(createInitialState(), { type: 'start', deck: createDeck(rules), rules })
  assert.equal(getScoreBoard(started), 'house')
  assert.equal(started.bleeding, false)
  assert.equal(wait(started, 60000), started)
  const sword = card('diamonds-10') as Weapon
  const protectedState = scenario({ weapon: { card: sword, power: 10, monsters: [] } })
  const protectedNext = act(protectedState, { type: 'resolve', cardId: 'clubs-2', combat: 'weapon' })
  assert.equal(protectedNext.bleeding, false)
  assert.equal(protectedNext.health, 20)
  assert.equal(wound().bleeding, true)
  const standard = wound(scenario({ rules: { handicap: 0, jokers: false } }))
  assert.equal(standard.bleeding, false)
  assert.equal(wait(standard, 60000), standard)
})

test('five free seconds precede whole one-second bleed ticks; partial time is preserved', () => {
  const initial = Object.freeze(wound())
  let next = wait(initial, 5000)
  assert.equal(next.health, 18)
  next = wait(next, 999)
  assert.equal(next.health, 18)
  next = wait(next, 1)
  assert.equal(next.health, 17)
  next = wait(next, 2500)
  assert.equal(next.health, 15)
  next = wait(next, 500)
  assert.equal(next.health, 14)
  assert.equal(initial.health, 18)
  assert.equal(initial.bleedElapsedMs, 0)
  assert.equal(wait(initial, 9000).health, 14)
})

test('healing restores health without curing bleeding and every accepted action renews grace', () => {
  const bleeding = wait(wound(), 7000)
  const healed = act(bleeding, { type: 'resolve', cardId: 'hearts-10' })
  assert.equal(healed.health, 20)
  assert.equal(healed.bleeding, true)
  assert.equal(healed.bleedElapsedMs, 0)
  assert.equal(wait(healed, 5000).health, 20)
  const equipped = act(wait(healed, 7000), { type: 'resolve', cardId: 'diamonds-10' })
  assert.equal(equipped.bleedElapsedMs, 0)
  assert.equal(equipped.bleeding, true)
  const fullRoom = scenario({ bleeding: true, bleedElapsedMs: 7999 })
  const fled = act(fullRoom, { type: 'flee' })
  assert.equal(fled.bleedElapsedMs, 0)
  assert.equal(fled.bleeding, true)
  const rejected = applyAction(bleeding, { type: 'resolve', cardId: 'clubs-14', combat: 'barehanded' })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.state, bleeding)
  assert.equal(rejected.state.bleedElapsedMs, 7000)
})

test('barricade damage and Sight health costs start bleeding; weapon wear does not', () => {
  for (const material of ['wood', 'rubble', 'thorns', 'pit'] as const) {
    const obstacle = createBarricadeCards(material, 1)[0]
    const state = scenario({ room: [obstacle, card('hearts-2')] })
    assert.equal(act(state, { type: 'resolve', cardId: obstacle.id, combat: 'barehanded' }).bleeding, true)
    if (material !== 'pit') {
      const armed = { ...state, weapon: { card: card('diamonds-10') as Weapon, power: 10, monsters: [] } }
      assert.equal(act(armed, { type: 'resolve', cardId: obstacle.id, combat: 'weapon' }).bleeding, false)
    }
  }
  const sight = createCosmicCards().find(card => card.id === 'cosmic-sight')!
  assert.equal(act(scenario({ room: [sight, card('hearts-2')] }), { type: 'resolve', cardId: sight.id, cosmic: 'activate' }).bleeding, true)
})

test('cosmic, joker and Mirror exchange actions reset grace without curing bleeding', () => {
  const joker: Card = { id: 'joker-1', kind: 'joker', suit: 'jokers', value: 0 }
  const cosmic = createCosmicCards()
  for (const special of [joker, ...cosmic]) {
    const state = scenario({ room: [special, card('hearts-2')], discard: [card('hearts-3')], bleeding: true, bleedElapsedMs: 6500,
      weapon: { card: card('diamonds-10') as Weapon, power: 10, monsters: [] } })
    for (const action of getLegalActions(state).filter(action => action.type === 'resolve' && action.cardId === special.id)) {
      const next = act(state, action)
      assert.equal(next.bleeding, true)
      assert.equal(next.bleedElapsedMs, 0)
      if (next.mirrorRevealed) {
        const swapped = act(wait(next, 6000), { type: 'mirror-exchange', cardId: 'hearts-2' })
        assert.equal(swapped.bleedElapsedMs, 0)
        assert.equal(swapped.bleeding, true)
      }
    }
  }
})

test('bleeding can kill during a mandatory Mirror choice and catches up only to lethal health', () => {
  const state = scenario({ health: 2, bleeding: true, mirrorRevealed: 'clubs-5' })
  const lost = wait(state, 60000)
  assert.equal(lost.health, 0)
  assert.equal(lost.status, 'lost')
  assert.equal(lost.score, -10)
  assert.equal(lost.room, state.room)
  assert.equal(lost.weapon, state.weapon)
  assert.equal(applyAction(lost, { type: 'elapse', milliseconds: 1000 }).ok, false)
  assert.equal(getLegalActions(lost).length, 0)
  const restarted = act(lost, { type: 'start', deck: createDeck(rules), rules })
  assert.equal(restarted.bleeding, false)
  assert.equal(restarted.bleedElapsedMs, 0)
  assert.equal(restarted.health, 20)
  assert.equal(act(lost, { type: 'reset' }).bleeding, false)
})

test('a winning action stops the clock; elapsed input must be finite and nonnegative', () => {
  const won = act(scenario({ room: [card('hearts-10')], dungeon: [], bleeding: true, health: 4 }), { type: 'resolve', cardId: 'hearts-10' })
  assert.equal(won.status, 'won')
  assert.equal(applyAction(won, { type: 'elapse', milliseconds: 1000 }).ok, false)
  const state = wound()
  for (const milliseconds of [-1, Infinity, NaN, Number.MAX_VALUE]) {
    const result = applyAction(state, { type: 'elapse', milliseconds })
    assert.equal(result.ok, false)
    assert.equal(result.state, state)
  }
  assert.equal(wait(state, 0), state)
})
