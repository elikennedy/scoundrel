import assert from 'node:assert/strict'
import { test } from 'node:test'
import { existsSync } from 'node:fs'
import { createDeck } from '../src/game/index.ts'
import { actionSoundNames, resolutionSound } from '../src/components/actionSounds.ts'

const deck = createDeck()

test('each monster suit assigns exactly five small, five medium and three large cues', () => {
  for (const [suit, family] of [['clubs', 'beast'], ['spades', 'shade']]) {
    const monsters = deck.filter(card => card.suit === suit)
    assert.deepEqual(monsters.map(card => resolutionSound(card, false)), [
      ...Array(5).fill(`${family}-small`),
      ...Array(5).fill(`${family}-medium`),
      ...Array(3).fill(`${family}-large`),
    ])
  }
})

test('healing cues match bottle artwork or generic heal; spent cards always use discard', () => {
  for (const card of deck.filter(card => card.kind === 'potion')) {
    const expected = card.value === 6 ? 'clay-uncork' : [2, 9].includes(card.value) ? 'glass-uncork' : 'heal'
    assert.equal(resolutionSound(card, false), expected, card.id)
    assert.equal(resolutionSound(card, true), 'decard', card.id)
  }
})

test('all weapons use the equip cue regardless of healing allowance', () => {
  for (const card of deck.filter(card => card.kind === 'weapon')) {
    assert.equal(resolutionSound(card, false), 'equip', card.id)
    assert.equal(resolutionSound(card, true), 'equip', card.id)
  }
})

test('every assigned cue has a bundled WAV', () => {
  for (const name of ['card-dealt', ...actionSoundNames]) {
    assert.ok(existsSync(new URL(`../public/sound/${name}.wav`, import.meta.url)), name)
  }
})
