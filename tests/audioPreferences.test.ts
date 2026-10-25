import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultAudioPreferences, effectiveVolumes, normalizeAudioPreferences } from '../src/components/audioPreferences.ts'

test('audio preferences recover from missing, malformed and out-of-range fields', () => {
  for (const input of [null, 'bad', [], {}]) assert.deepEqual(normalizeAudioPreferences(input), defaultAudioPreferences)
  assert.deepEqual(normalizeAudioPreferences({ sfxVolume: 5, musicVolume: -1, sfxMuted: 'true', musicMuted: true, allMuted: true }), {
    sfxVolume: 1, musicVolume: 0, sfxMuted: false, musicMuted: true, allMuted: true,
  })
  assert.deepEqual(normalizeAudioPreferences({ sfxVolume: NaN, musicVolume: Infinity }), defaultAudioPreferences)
})

test('channel and master mutes preserve independent levels and mute states', () => {
  const chosen = { ...defaultAudioPreferences, sfxVolume: .7, musicVolume: .2, sfxMuted: true }
  assert.deepEqual(effectiveVolumes(chosen), { sfx: 0, music: .2 })
  const muted = { ...chosen, allMuted: true }
  assert.deepEqual(effectiveVolumes(muted), { sfx: 0, music: 0 })
  assert.deepEqual(effectiveVolumes({ ...muted, allMuted: false }), { sfx: 0, music: .2 })
  assert.equal(muted.sfxVolume, .7)
  assert.deepEqual(effectiveVolumes({ ...chosen, sfxMuted: false, musicMuted: true }), { sfx: .7, music: 0 })
})
