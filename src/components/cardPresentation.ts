import type { Card } from '../game'

export function cardName(card: Card): string {
  const rank = ({ 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace' } as Record<number, string>)[card.value] ?? card.value
  return `${rank} of ${card.suit}`
}
