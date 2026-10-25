import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeHouseRules } from '../src/components/houseRulesPreferences.ts'
import { DEFAULT_HOUSE_RULES } from '../src/game/index.ts'

test('existing saved handicap and joker preferences migrate with new options off', () => {
  assert.deepEqual(normalizeHouseRules({ handicap: 3, jokers: true }), { handicap: 3, jokers: true, cosmic: false, barricades: false, firstBlood: false })
  assert.deepEqual(normalizeHouseRules({ handicap: 0, jokers: false, cosmic: true, barricades: true }), { handicap: 0, jokers: false, cosmic: true, barricades: true, firstBlood: false })
})
test('malformed saved house rules recover to defaults and unknown fields are not kept', () => {
  for (const value of [null, [], {}, 'bad', { handicap: 0, jokers: false, cosmic: 'true' }, { handicap: 5, jokers: true }, { handicap: 0, jokers: false, barricades: 1 }, { handicap: 0, jokers: false, firstBlood: 'true' }]) {
    assert.deepEqual(normalizeHouseRules(value), DEFAULT_HOUSE_RULES)
  }
  assert.deepEqual(normalizeHouseRules({ handicap: 1, jokers: true, extra: 'ignored' }), { handicap: 1, jokers: true, cosmic: false, barricades: false, firstBlood: false })
})

test('First Blood persists independently and older settings default it off', () => {
  const saved = { handicap: 0 as const, jokers: false, cosmic: false, barricades: false, firstBlood: true }
  assert.deepEqual(normalizeHouseRules(saved), saved)
  assert.equal(normalizeHouseRules({ handicap: 0, jokers: false }).firstBlood, false)
})
