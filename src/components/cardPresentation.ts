import type { Card } from '../game'

export function cardName(card: Card): string {
  if (card.kind === 'joker') return card.id === 'joker-1' ? 'The Grinning Harlequin' : 'The Briar Trickster'
  if (card.id === 'cosmic-mirror') return 'Mirror of Misfortune'
  if (card.kind === 'cosmic') return card.id === 'cosmic-fate' ? 'Hand of Fate' : card.id === 'cosmic-sight' ? "Devil's Sight" : 'Forge of Destiny'
  if (card.kind === 'barricade') return card.material === 'wood' ? 'Wooden Barricade' : card.material === 'thorns' ? 'Poisoned Thorns' : card.material === 'pit' ? 'Pit Trap' : 'Rubble'
  const rank = ({ 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace' } as Record<number, string>)[card.value] ?? card.value
  return `${rank} of ${card.suit}`
}
