export type Suit = 'clubs' | 'spades' | 'diamonds' | 'hearts'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
export type CardId = `${Suit}-${Rank}` | 'joker-1' | 'joker-2'
export type Monster = Readonly<{ id: CardId; kind: 'monster'; suit: 'clubs' | 'spades'; value: Rank }>
export type Weapon = Readonly<{ id: CardId; kind: 'weapon'; suit: 'diamonds'; value: Rank }>
export type Potion = Readonly<{ id: CardId; kind: 'potion'; suit: 'hearts'; value: Rank }>
export type Joker = Readonly<{ id: 'joker-1' | 'joker-2'; kind: 'joker'; suit: 'jokers'; value: 0 }>
export type Card = Monster | Weapon | Potion | Joker
export type HouseRules = Readonly<{ handicap: 0 | 1 | 2 | 3 | 4; jokers: boolean }>
export const DEFAULT_HOUSE_RULES: HouseRules = { handicap: 0, jokers: false }

export function validHouseRules(rules: HouseRules): boolean {
  return Number.isInteger(rules.handicap) && rules.handicap >= 0 && rules.handicap <= 4 && typeof rules.jokers === 'boolean'
}

export function createHandicapCards(): (Weapon | Potion)[] {
  return ([11, 12, 13, 14] as const).flatMap(value => [
    { id: `diamonds-${value}`, kind: 'weapon', suit: 'diamonds', value } as Weapon,
    { id: `hearts-${value}`, kind: 'potion', suit: 'hearts', value } as Potion,
  ])
}

/** Stable IDs are also the future artwork keys; no presentation data belongs here. */
export function createDeck(rules: HouseRules = DEFAULT_HOUSE_RULES, random: () => number = Math.random): Card[] {
  if (!validHouseRules(rules)) throw new RangeError('Invalid house rules.')
  const cards: Card[] = []
  for (let value = 2; value <= 14; value++) {
    const rank = value as Rank
    cards.push({ id: `clubs-${rank}`, kind: 'monster', suit: 'clubs', value: rank })
    cards.push({ id: `spades-${rank}`, kind: 'monster', suit: 'spades', value: rank })
    if (value <= 10) {
      cards.push({ id: `diamonds-${rank}`, kind: 'weapon', suit: 'diamonds', value: rank })
      cards.push({ id: `hearts-${rank}`, kind: 'potion', suit: 'hearts', value: rank })
    }
  }
  if (rules.handicap) cards.push(...shuffleDeck(createHandicapCards(), random).slice(0, rules.handicap))
  if (rules.jokers) cards.push({ id: 'joker-1', kind: 'joker', suit: 'jokers', value: 0 }, { id: 'joker-2', kind: 'joker', suit: 'jokers', value: 0 })
  return cards
}

/** Fisher–Yates; inject randomness for reproducible deals. Never mutates its input. */
export function shuffleDeck(deck: readonly Card[], random: () => number = Math.random): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const sample = random()
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError('Random samples must be in [0, 1).')
    }
    const j = Math.floor(sample * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function isCompleteDeck(deck: readonly Card[], rules: HouseRules = DEFAULT_HOUSE_RULES): boolean {
  if (!validHouseRules(rules)) return false
  const base = createDeck({ ...rules, handicap: 0 })
  const expected = new Map([...base, ...createHandicapCards()].map(card => [card.id, card]))
  const seen = new Set<CardId>()
  let extras = 0
  for (const card of deck) {
    const canonical = expected.get(card.id)
    if (!canonical || seen.has(card.id) || canonical.kind !== card.kind || canonical.suit !== card.suit || canonical.value !== card.value) return false
    seen.add(card.id)
    if ((card.kind === 'weapon' || card.kind === 'potion') && card.value > 10) extras++
  }
  return extras === rules.handicap && deck.length === base.length + extras && base.every(card => seen.has(card.id))
}
