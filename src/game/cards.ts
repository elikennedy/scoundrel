export type Suit = 'clubs' | 'spades' | 'diamonds' | 'hearts'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
export type CardId = `${Suit}-${Rank}`
export type Monster = Readonly<{ id: CardId; kind: 'monster'; suit: 'clubs' | 'spades'; value: Rank }>
export type Weapon = Readonly<{ id: CardId; kind: 'weapon'; suit: 'diamonds'; value: Rank }>
export type Potion = Readonly<{ id: CardId; kind: 'potion'; suit: 'hearts'; value: Rank }>
export type Card = Monster | Weapon | Potion

/** Stable IDs are also the future artwork keys; no presentation data belongs here. */
export function createDeck(): Card[] {
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

export function isCompleteDeck(deck: readonly Card[]): boolean {
  const expected = new Map(createDeck().map((card) => [card.id, card]))
  if (deck.length !== expected.size) return false
  for (const card of deck) {
    const canonical = expected.get(card.id)
    if (!canonical || canonical.kind !== card.kind || canonical.suit !== card.suit || canonical.value !== card.value) return false
    expected.delete(card.id)
  }
  return expected.size === 0
}
