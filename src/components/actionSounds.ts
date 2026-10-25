import type { Card } from '../game/index.ts'

/** Presentation cues follow suit/rank and the selected bottle illustrations. */
export function resolutionSound(card: Card, potionUsed: boolean): string | null {
  if (card.kind === 'monster') {
    const family = card.suit === 'clubs' ? 'beast' : 'shade'
    const size = card.value <= 6 ? 'small' : card.value <= 11 ? 'medium' : 'large'
    return `${family}-${size}`
  }
  if (card.kind === 'weapon') return 'equip'
  if (card.kind === 'barricade') return 'decard'
  if (card.kind === 'cosmic') return 'decard'
  if (card.kind === 'joker') return 'decard'
  if (potionUsed) return 'decard'
  if (card.id === 'hearts-6') return 'clay-uncork'
  if (card.id === 'hearts-2' || card.id === 'hearts-9') return 'glass-uncork'
  return 'heal'
}

export const actionSoundNames = [
  'beast-small', 'beast-medium', 'beast-large',
  'shade-small', 'shade-medium', 'shade-large',
  'decard', 'clay-uncork', 'glass-uncork', 'equip', 'heal',
] as const
