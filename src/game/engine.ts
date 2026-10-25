import { DEFAULT_HOUSE_RULES, isCompleteDeck, shuffleDeck } from './cards.ts'
import type { Card, CardId, Monster, Weapon, Cosmic, HouseRules } from './cards.ts'

export const MAX_HEALTH = 20
export const FIRST_BLOOD_GRACE_MS = 5000
export const FIRST_BLOOD_TICK_MS = 1000
export type CombatMode = 'barehanded' | 'weapon'
export type EquippedWeapon = Readonly<{ card: Weapon; power: number; monsters: readonly Monster[] }>
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
export type GameState = Readonly<{
  rules: HouseRules
  status: GameStatus
  health: number
  bleeding: boolean
  bleedElapsedMs: number
  dungeon: readonly Card[]
  room: readonly Card[]
  revealedDungeon: readonly CardId[]
  mirrorRevealed: CardId | null
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
  | Readonly<{ type: 'elapse'; milliseconds: number }>
  | Readonly<{ type: 'mirror-exchange'; cardId: CardId }>
  | Readonly<{ type: 'resolve'; cardId: CardId; combat?: CombatMode; joker?: 'play' | 'discard'; randomSample?: number; cosmic?: 'activate' | 'discard'; randomSamples?: readonly number[] }>

export type ActionError = 'invalid-deck' | 'not-playing' | 'cannot-flee' | 'card-not-in-room' | 'combat-required' | 'unexpected-combat' | 'weapon-unavailable' | 'invalid-joker-action' | 'invalid-cosmic-action' | 'mirror-choice-required' | 'invalid-mirror-exchange' | 'invalid-elapsed-time'
export type Transition =
  | Readonly<{ ok: true; state: GameState }>
  | Readonly<{ ok: false; state: GameState; error: ActionError }>

export function createInitialState(): GameState {
  return {
    rules: DEFAULT_HOUSE_RULES, status: 'ready', health: MAX_HEALTH, bleeding: false, bleedElapsedMs: 0, dungeon: [], room: [], revealedDungeon: [], mirrorRevealed: null, discard: [],
    weapon: null, roomNumber: 0, resolvedThisRoom: 0, jokerPlayedThisRoom: false, potionUsed: false,
    previousRoomFled: false, lastResolved: null, score: null,
  }
}

export type ScoreBoard = 'original' | 'house'

/** Board selection belongs to the run snapshot, never to mutable preferences. */
export function getScoreBoard(state: GameState): ScoreBoard {
  return state.rules.handicap === 0 && !state.rules.jokers && !state.rules.cosmic && !state.rules.barricades && !state.rules.firstBlood ? 'original' : 'house'
}

export function canFlee(state: GameState): boolean {
  return state.status === 'playing' && state.room.length === 4 && state.resolvedThisRoom === 0 && !state.jokerPlayedThisRoom && !state.previousRoomFled && !state.mirrorRevealed
}

export function canUseWeapon(state: GameState, monster: Monster): boolean {
  if (state.status !== 'playing' || !state.weapon) return false
  const previous = state.weapon.monsters.at(-1)
  return !previous || monster.value <= previous.value
}

export function combatDamage(monster: Monster, weapon: Weapon | null, power = weapon?.value ?? 0): number {
  return Math.max(0, monster.value - power)
}

export function canActivateCosmic(state: GameState, card: Cosmic): boolean {
  if (state.status !== 'playing' || state.mirrorRevealed) return false
  if (card.id === 'cosmic-forge') return state.weapon !== null
  if (card.id === 'cosmic-mirror') return state.room.length > 1 && state.dungeon.length > 0
  return true
}

/** Legal actions let any future UI share the engine's availability checks. */
export function getLegalActions(state: GameState): GameAction[] {
  if (state.status !== 'playing') return []
  if (state.mirrorRevealed) return state.room.map(card => ({ type: 'mirror-exchange', cardId: card.id }))
  const actions: GameAction[] = canFlee(state) ? [{ type: 'flee' }] : []
  for (const card of state.room) {
    if (card.kind === 'monster' || card.kind === 'barricade') {
      actions.push({ type: 'resolve', cardId: card.id, combat: 'barehanded' })
      if (card.kind === 'barricade' ? card.material !== 'pit' && state.weapon !== null : canUseWeapon(state, card)) actions.push({ type: 'resolve', cardId: card.id, combat: 'weapon' })
    } else if (card.kind === 'joker') {
      actions.push({ type: 'resolve', cardId: card.id, joker: 'discard' })
      if (state.discard.length) actions.push({ type: 'resolve', cardId: card.id, joker: 'play', randomSample: 0 })
    } else if (card.kind === 'cosmic') {
      actions.push({ type: 'resolve', cardId: card.id, cosmic: 'discard' })
      if (canActivateCosmic(state, card)) actions.push({ type: 'resolve', cardId: card.id, cosmic: 'activate',
        ...(card.id === 'cosmic-fate' ? { randomSamples: Array(Math.max(0, state.dungeon.length + state.room.length - 2)).fill(0) } : {}),
      })
    } else actions.push({ type: 'resolve', cardId: card.id })
  }
  return actions
}

function dealRoom(state: GameState): GameState {
  const count = Math.min(4 - state.room.length, state.dungeon.length)
  return {
    ...state, room: [...state.room, ...state.dungeon.slice(0, count)],
    revealedDungeon: state.revealedDungeon.filter(id => state.dungeon.slice(count).some(card => card.id === id)),
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
  if (state.mirrorRevealed) return state
  if (state.dungeon.length === 0 && state.room.length === 0) {
    const bonus = state.health === MAX_HEALTH && state.lastResolved?.kind === 'potion' ? state.lastResolved.value : 0
    return { ...state, status: 'won', score: state.health + bonus }
  }
  return state.resolvedThisRoom === 3 ? dealRoom(state) : state
}

/** Pure, deterministic transition. Invalid actions preserve the original state. */
function transition(state: GameState, action: GameAction): Transition {
  const reject = (error: ActionError): Transition => ({ ok: false, state, error })
  if (action.type === 'reset') return { ok: true, state: createInitialState() }
  if (action.type === 'start') {
    if (!isCompleteDeck(action.deck, action.rules ?? DEFAULT_HOUSE_RULES)) return reject('invalid-deck')
    return { ok: true, state: dealRoom({ ...createInitialState(), rules: { ...(action.rules ?? DEFAULT_HOUSE_RULES) }, status: 'playing', dungeon: [...action.deck] }) }
  }
  if (state.status !== 'playing') return reject('not-playing')
  if (action.type === 'elapse') {
    if (!Number.isFinite(action.milliseconds) || action.milliseconds < 0 || action.milliseconds > Number.MAX_SAFE_INTEGER - state.bleedElapsedMs) return reject('invalid-elapsed-time')
    if (!state.rules.firstBlood || !state.bleeding || action.milliseconds === 0) return { ok: true, state }
    const bleedElapsedMs = state.bleedElapsedMs + action.milliseconds
    const ticks = (elapsed: number) => Math.floor(Math.max(0, elapsed - FIRST_BLOOD_GRACE_MS) / FIRST_BLOOD_TICK_MS)
    // A delayed browser timer stops at the first lethal tick, never overscoring death.
    const damage = Math.min(state.health, ticks(bleedElapsedMs) - ticks(state.bleedElapsedMs))
    return { ok: true, state: finishOrAdvance({ ...state, health: state.health - damage, bleedElapsedMs }) }
  }
  if (action.type === 'mirror-exchange') {
    const incoming = state.dungeon[0]
    const outgoing = state.room.find(card => card.id === action.cardId)
    if (!state.mirrorRevealed || incoming?.id !== state.mirrorRevealed || !outgoing) return reject('invalid-mirror-exchange')
    return { ok: true, state: finishOrAdvance({
      ...state, mirrorRevealed: null,
      room: state.room.map(card => card.id === outgoing.id ? incoming : card),
      dungeon: [outgoing, ...state.dungeon.slice(1)],
      revealedDungeon: [outgoing.id, ...state.revealedDungeon.filter(id => id !== incoming.id && id !== outgoing.id)],
    }) }
  }
  if (state.mirrorRevealed) return reject('mirror-choice-required')
  if (action.type === 'flee') {
    if (!canFlee(state)) return reject('cannot-flee')
    return {
      ok: true,
      state: dealRoom({ ...state, dungeon: [...state.dungeon, ...state.room], room: [], previousRoomFled: true }),
    }
  }
  const card = state.room.find((entry) => entry.id === action.cardId)
  if (!card) return reject('card-not-in-room')
  if ((card.kind === 'monster' || card.kind === 'barricade') && !action.combat) return reject('combat-required')
  if (card.kind !== 'monster' && card.kind !== 'barricade' && action.combat) return reject('unexpected-combat')
  if (card.kind === 'monster' && action.combat === 'weapon' && !canUseWeapon(state, card)) return reject('weapon-unavailable')

  if (card.kind === 'barricade' && action.combat === 'weapon' && (card.material === 'pit' || !state.weapon)) return reject('weapon-unavailable')

  if (card.kind !== 'cosmic' && (action.cosmic !== undefined || action.randomSamples !== undefined)) return reject('invalid-cosmic-action')

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

  if (card.kind === 'cosmic') {
    if (action.cosmic !== 'activate' && action.cosmic !== 'discard') return reject('invalid-cosmic-action')
    if (action.cosmic === 'activate' && !canActivateCosmic(state, card)) return reject(card.id === 'cosmic-forge' ? 'weapon-unavailable' : 'invalid-cosmic-action')
    if (action.cosmic === 'activate' && card.id === 'cosmic-mirror') {
      const top = state.dungeon[0]
      if (action.randomSamples !== undefined) return reject('invalid-cosmic-action')
      return { ok: true, state: {
        ...state, room: state.room.filter(entry => entry.id !== card.id),
        discard: [...state.discard, card], resolvedThisRoom: state.resolvedThisRoom + 1,
        lastResolved: card, previousRoomFled: false, mirrorRevealed: top.id,
        revealedDungeon: [...new Set([top.id, ...state.revealedDungeon])],
      } }
    }
    if (action.cosmic === 'activate' && card.id === 'cosmic-fate') {
      const returned = [...state.dungeon, ...state.room.filter(entry => entry.id !== card.id)]
      const samples = action.randomSamples
      if (!samples || samples.length !== Math.max(0, returned.length - 1) || Array.from(samples).some(sample => !Number.isFinite(sample) || sample < 0 || sample >= 1)) return reject('invalid-cosmic-action')
      let index = 0
      const dungeon = shuffleDeck(returned, () => samples[index++])
      return { ok: true, state: finishOrAdvance(dealRoom({
        ...state, room: [], dungeon, revealedDungeon: [], discard: [...state.discard, card], lastResolved: card, previousRoomFled: false,
      })) }
    }
    if (action.randomSamples !== undefined) return reject('invalid-cosmic-action')
  } else if (action.cosmic !== undefined || action.randomSamples !== undefined) return reject('invalid-cosmic-action')

  let next: GameState = {
    ...state, room: state.room.filter((entry) => entry.id !== card.id),
    resolvedThisRoom: state.resolvedThisRoom + 1, lastResolved: card, previousRoomFled: false,
  }
  switch (card.kind) {
    case 'cosmic':
      next = {
        ...next, discard: [...state.discard, ...(action.cosmic === 'activate' && card.id === 'cosmic-forge' && state.weapon ? state.weapon.monsters : []), card],
        health: action.cosmic === 'activate' && card.id === 'cosmic-sight' ? state.health - 3 : state.health,
        weapon: action.cosmic === 'activate' && card.id === 'cosmic-forge' && state.weapon ? { ...state.weapon, monsters: [] } : state.weapon,
      }
      break
    case 'barricade': {
      const weapon = state.weapon
      const usesWeapon = action.combat === 'weapon' && weapon !== null
      const power = usesWeapon ? weapon.power - card.value : 0
      const destroyed = usesWeapon && power < 2
      next = {
        ...next, health: usesWeapon ? state.health : state.health - card.value,
        weapon: usesWeapon ? destroyed ? null : { ...weapon, power } : weapon,
        discard: [...state.discard, ...(destroyed ? [weapon.card, ...weapon.monsters] : []), card],
      }
      break
    }
    case 'joker':
      next = { ...next, discard: [...state.discard, card] }
      break
    case 'weapon':
      next = {
        ...next, weapon: { card, power: card.value, monsters: [] },
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
        ...next, health: state.health - combatDamage(card, weapon?.card ?? null, weapon?.power ?? 0),
        weapon: weapon ? { ...weapon, monsters: [...weapon.monsters, card] } : state.weapon,
        discard: weapon ? state.discard : [...state.discard, card],
      }
      break
    }
  }
  const advanced = finishOrAdvance(next)
  return { ok: true, state: card.id === 'cosmic-sight' && action.cosmic === 'activate'
    ? { ...advanced, revealedDungeon: advanced.dungeon.slice(0, 3).map(card => card.id) } : advanced }
}

/** Accepted player actions renew grace; health loss permanently starts First Blood. */
export function applyAction(state: GameState, action: GameAction): Transition {
  const result = transition(state, action)
  if (!result.ok || action.type === 'elapse' || action.type === 'start' || action.type === 'reset') return result
  return { ok: true, state: {
    ...result.state,
    bleeding: Boolean(state.rules.firstBlood && (state.bleeding || result.state.health < state.health)),
    bleedElapsedMs: 0,
  } }
}

/** React useReducer-compatible adapter; applyAction also exposes rejection reasons. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  return applyAction(state, action).state
}
