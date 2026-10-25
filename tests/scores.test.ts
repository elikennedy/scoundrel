import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createBrowserScoreStore, normalizeInitials, rankScores, SCORE_STORAGE_KEY, selectScoreStore } from '../src/scores/store.ts'
import type { HighScore } from '../src/scores/store.ts'

function entry(id: string, score = -30, completedAt = '2026-10-24T01:00:00.000Z'): HighScore {
  return { id, name: 'ELI', score, completedAt }
}
function memoryStorage() {
  const data = new Map<string, string>()
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) } }
}

test('normalizes arcade initials to exactly three ASCII letters', () => {
  assert.equal(normalizeInitials('e1l!i?extra'), 'ELI')
  assert.equal(normalizeInitials('é12'), '')
})

test('ranks positive, zero and negative scores; ties use completion time; retains ten', () => {
  const entries = Array.from({ length: 12 }, (_, i) => entry(`run-${i}`, -i))
  const ranked = rankScores([...entries, entry('winner', 20), entry('earlier', 0, '2026-10-23T01:00:00.000Z')])
  assert.equal(ranked.length, 10)
  assert.deepEqual(ranked.slice(0, 4).map(item => item.id), ['winner', 'earlier', 'run-0', 'run-1'])
  assert.equal(entries.length, 12)
})

test('persists across store instances and duplicate run submissions cannot add another row', async () => {
  const storage = memoryStorage()
  const first = createBrowserScoreStore(() => storage)
  assert.deepEqual(await first.list(), [])
  await first.save(entry('run'))
  await first.save(entry('run'))
  const second = createBrowserScoreStore(() => storage)
  assert.deepEqual(await second.list(), [entry('run')])
})

test('a lower run does not displace the top ten', async () => {
  const storage = memoryStorage()
  const store = createBrowserScoreStore(() => storage)
  for (let i = 0; i < 10; i++) await store.save(entry(`run-${i}`, i))
  assert.equal((await store.save(entry('low', -100))).some(item => item.id === 'low'), false)
})

test('malformed and invalid saved data is reported without overwriting it', async () => {
  for (const raw of ['{broken', '{}', JSON.stringify([{ ...entry('bad'), name: '<x>' }]), JSON.stringify([{ ...entry('bad'), completedAt: 'invalid' }])]) {
    const storage = memoryStorage()
    storage.setItem(SCORE_STORAGE_KEY, raw)
    const store = createBrowserScoreStore(() => storage)
    await assert.rejects(store.list(), /could not be read/)
    await assert.rejects(store.save(entry('new')), /could not be read/)
    assert.equal(storage.getItem(SCORE_STORAGE_KEY), raw)
  }
})

test('invalid submissions and unavailable or full storage reject without a false success', async () => {
  const store = createBrowserScoreStore(() => memoryStorage())
  await assert.rejects(store.save({ ...entry('bad'), name: 'AB' }))
  await assert.rejects(store.save({ ...entry('bad'), score: Infinity }))
  const blocked = createBrowserScoreStore(() => { throw new Error('Storage blocked') })
  await assert.rejects(blocked.list(), /blocked/)
  const full = createBrowserScoreStore(() => ({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded') } }))
  await assert.rejects(full.save(entry('new')), /Quota/)
})

test('cloud selection never silently writes local scores; supports a future adapter', async () => {
  const browser = createBrowserScoreStore(() => memoryStorage())
  assert.equal(selectScoreStore(false, browser), browser)
  const pending = selectScoreStore(true, browser)
  assert.equal(pending.mode, 'cloud')
  await assert.rejects(pending.list(), /not connected/)
  await assert.rejects(pending.save(entry('run')), /not connected/)
  const cloud = { ...browser, mode: 'cloud' as const }
  assert.equal(selectScoreStore(true, browser, cloud), cloud)
})
