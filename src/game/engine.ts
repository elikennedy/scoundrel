import { DEFAULT_HOUSE_RULES, isCompleteDeck } from './cards.ts'
import type { Card, CardId, Monster, Weapon, HouseRules } from './cards.ts'

export const MAX_HEALTH = 20
export type CombatMode = 'barehanded' | 'weapon'
export type EquippedWeapon = Readonly<{ card: Weapon; monsters: readonly Monster[] }>
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
export type GameState = Readonly<{
  rules: HouseRules
  status: GameStatus
  health: number
  dungeon: readonly Card[]
  room: readonly Card[]
  discard: readonly Card[]
  weapon: EquippedWeapon | null
  roomNumber: number
  resolvedThisRoom: number
  jokerPlayedThisRoom: boolean
  potionUsed: boolean
  previousRoomFled: boolean
  lastResolved: Card | null
  score: number | null
}>

export type GameAction =
  | Readonly<{ type: 'start'; deck: readonly Card[]; rules?: HouseRules }>
  | Readonly<{ type: 'reset' }>
  | Readonly<{ type: 'flee' }>
  | Readonly<{ type: 'resolve'; cardId: CardId; combat?: CombatMode; joker?: 'play' | 'discard'; randomSample?: number }>

export type ActionError = 'invalid-deck' | 'not-playing' | 'cannot-flee' | 'card-not-in-room' | 'combat-required' | 'unexpected-combat' | 'weapon-unavailable' | 'invalid-joker-action'
export type Transition =
  | Readonly<{ ok: true; state: GameState }>
  | Readonly<{ ok: false; state: GameState; error: ActionError }>

export function createInitialState(): GameState {
  return {
    rules: DEFAULT_HOUSE_RULES, status: 'ready', health: MAX_HEALTH, dungeon: [], room: [], discard: [],
    weapon: null, roomNumber: 0, resolvedThisRoom: 0, jokerPlayedThisRoom: false, potionUsed: false,
    previousRoomFled: false, lastResolved: null, score: null,
  }
}

/** Eligibility belongs to the run snapshot, never to mutable presentation preferences. */
export function isHighScoreEligible(state: GameState): boolean {
  return state.rules.handicap === 0 && !state.rules.jokers
}

export function canFlee(state: GameState): boolean {
  return state.status === 'playing' && state.room.length === 4 && state.resolvedThisRoom === 0 && !state.jokerPlayedThisRoom && !state.previousRoomFled
}

export function canUseWeapon(state: GameState, monster: Monster): boolean {
  if (state.status !== 'playing' || !state.weapon) return false
  const previous = state.weapon.monsters.at(-1)
  return !previous || monster.value <= previous.value
}

export function combatDamage(monster: Monster, weapon: Weapon | null): number {
  return Math.max(0, monster.value - (weapon?.value ?? 0))
}

/** Legal actions let any future UI share the engine's availability checks. */
export function getLegalActions(state: GameState): GameAction[] {
  if (state.status !== 'playing') return []
  const actions: GameAction[] = canFlee(state) ? [{ type: 'flee' }] : []
  for (const card of state.room) {
    if (card.kind === 'monster') {
      actions.push({ type: 'resolve', cardId: card.id, combat: 'barehanded' })
      if (canUseWeapon(state, card)) actions.push({ type: 'resolve', cardId: card.id, combat: 'weapon' })
    } else if (card.kind === 'joker') {
      actions.push({ type: 'resolve', cardId: card.id, joker: 'discard' })
      if (state.discard.length) actions.push({ type: 'resolve', cardId: card.id, joker: 'play', randomSample: 0 })
    } else actions.push({ type: 'resolve', cardId: card.id })
  }
  return actions
}

function dealRoom(state: GameState): GameState {
  const count = Math.min(4 - state.room.length, state.dungeon.length)
  return {
    ...state, room: [...state.room, ...state.dungeon.slice(0, count)],
    dungeon: state.dungeon.slice(count), roomNumber: state.roomNumber + 1,
    resolvedThisRoom: 0, jokerPlayedThisRoom: false, potionUsed: false,
  }
}

function finishOrAdvance(state: GameState): GameState {
  if (state.health <= 0) {
    const remaining = [...state.dungeon, ...state.room]
      .reduce((sum, card) => sum + (card.kind === 'monster' ? card.value : 0), 0)
    return { ...state, status: 'lost', score: state.health - remaining }
  }
  if (state.dungeon.length === 0 && state.room.length === 0) {
    const bonus = state.health === MAX_HEALTH && state.lastResolved?.kind === 'potion' ? state.lastResolved.value : 0
    return { ...state, status: 'won', score: state.health + bonus }
  }
  return state.resolvedThisRoom === 3 ? dealRoom(state) : state
}

/** Pure, deterministic transition. Invalid actions preserve the original state. */
export function applyAction(state: GameState, action: GameAction): Transition {
  const reject = (error: ActionError): Transition => ({ ok: false, state, error })
  if (action.type === 'reset') return { ok: true, state: createInitialState() }
  if (action.type === 'start') {
    if (!isCompleteDeck(action.deck, action.rules ?? DEFAULT_HOUSE_RULES)) return reject('invalid-deck')
    return { ok: true, state: dealRoom({ ...createInitialState(), rules: { ...(action.rules ?? DEFAULT_HOUSE_RULES) }, status: 'playing', dungeon: [...action.deck] }) }
  }
  if (state.status !== 'playing') return reject('not-playing')
  if (action.type === 'flee') {
    if (!canFlee(state)) return reject('cannot-flee')
    return {
      ok: true,
      state: dealRoom({ ...state, dungeon: [...state.dungeon, ...state.room], room: [], previousRoomFled: true }),
    }
  }
  const card = state.room.find((entry) => entry.id === action.cardId)
  if (!card) return reject('card-not-in-room')
  if (card.kind === 'monster' && !action.combat) return reject('combat-required')
  if (card.kind !== 'monster' && action.combat) return reject('unexpected-combat')
  if (card.kind === 'monster' && action.combat === 'weapon' && !canUseWeapon(state, card)) return reject('weapon-unavailable')

  if (card.kind === 'joker') {
    if (action.joker !== 'play' && action.joker !== 'discard') return reject('invalid-joker-action')
    if (action.joker === 'play') {
      const sample = action.randomSample
      if (!state.discard.length || sample === undefined || !Number.isFinite(sample) || sample < 0 || sample >= 1) return reject('invalid-joker-action')
      const index = Math.floor(sample * state.discard.length)
      const returned = state.discard[index]
      return { ok: true, state: {
        ...state, jokerPlayedThisRoom: true, room: state.room.map(entry => entry.id === card.id ? returned : entry),
        discard: [...state.discard.filter((_, i) => i !== index), card], previousRoomFled: false,
      } }
    }
  } else if (action.joker !== undefined || action.randomSample !== undefined) return reject('invalid-joker-action')

  let next: GameState = {
    ...state, room: state.room.filter((entry) => entry.id !== card.id),
    resolvedThisRoom: state.resolvedThisRoom + 1, lastResolved: card, previousRoomFled: false,
  }
  switch (card.kind) {
    case 'joker':
      next = { ...next, discard: [...state.discard, card] }
      break
    case 'weapon':
      next = {
        ...next, weapon: { card, monsters: [] },
        discard: [...state.discard, ...(state.weapon ? [state.weapon.card, ...state.weapon.monsters] : [])],
      }
      break
    case 'potion':
      next = {
        ...next, health: state.potionUsed ? state.health : Math.min(MAX_HEALTH, state.health + card.value),
        potionUsed: true, discard: [...state.discard, card],
      }
      break
    case 'monster': {
      const weapon = action.combat === 'weapon' ? state.weapon : null
      next = {
        ...next, health: state.health - combatDamage(card, weapon?.card ?? null),
        weapon: weapon ? { card: weapon.card, monsters: [...weapon.monsters, card] } : state.weapon,
        discard: weapon ? state.discard : [...state.discard, card],
      }
      break
    }
  }
  return { ok: true, state: finishOrAdvance(next) }
}

/** React useReducer-compatible adapter; applyAction also exposes rejection reasons. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  return applyAction(state, action).state
}
