import { actionSoundNames } from './actionSounds'
import { defaultAudioPreferences, effectiveVolumes, normalizeAudioPreferences } from './audioPreferences'
import type { AudioPreferences } from './audioPreferences'
import { createMusicPitch } from './musicPitch'

// Measured fallback for the bundled WAV: 32,310 frames at 44,100 Hz.
const fallbackDuration = 32310 / 44100 * 1000
let context: AudioContext | undefined
let sfxBus: GainNode | undefined
let musicBus: GainNode | undefined
let music: HTMLAudioElement | undefined
let musicPlaybackRate = 1
let musicPitch: ReturnType<typeof createMusicPitch> | undefined
let pageActive = true
const preferencesKey = 'scoundrel:audio:v1'
let preferences = defaultAudioPreferences
try { preferences = normalizeAudioPreferences(JSON.parse(localStorage.getItem(preferencesKey) ?? 'null')) } catch { /* Browser storage is optional. */ }
const listeners = new Set<() => void>()
export const getAudioPreferences = () => preferences
export function subscribeAudioPreferences(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
function applyVolumes() {
  if (!context) return
  const volumes = effectiveVolumes(preferences)
  sfxBus?.gain.setTargetAtTime(volumes.sfx, context.currentTime, 0.01)
  musicBus?.gain.setTargetAtTime(volumes.music, context.currentTime, 0.01)
}
export function updateAudioPreferences(patch: Partial<AudioPreferences>) {
  preferences = normalizeAudioPreferences({ ...preferences, ...patch })
  applyVolumes()
  try { localStorage.setItem(preferencesKey, JSON.stringify(preferences)) } catch { /* Settings still apply for this session. */ }
  listeners.forEach(listener => listener())
}
export function setAudioPageActive(active: boolean) {
  pageActive = active
  if (!active) music?.pause()
  else if (music && context?.state === 'running') void music.play().catch(() => {})
}
/** Hasten and deepen only music, preserving position, volume and effect timing. */
export function setMusicBleedingOut(bleedingOut: boolean) {
  musicPlaybackRate = bleedingOut ? 2 : 1
  if (music) music.playbackRate = musicPlaybackRate
  musicPitch?.setActive(bleedingOut)
}
const buffers = new Map<string, Promise<AudioBuffer | null>>()

function loadSound(name: string, audio: AudioContext) {
  if (!buffers.has(name)) {
    buffers.set(name, Promise.resolve().then(() => fetch(`/sound/${name}.wav`, { signal: AbortSignal.timeout(3000) }))
      .then(response => {
        if (!response.ok) throw new Error('Sound unavailable')
        return response.arrayBuffer()
      })
      .then(bytes => audio.decodeAudioData(bytes))
      .catch(() => null))
  }
  return buffers.get(name)!
}

/** Unlock audio in the gesture handler; first-deal media gets the network first. */
export function prepareGameAudio({ deferMusic = false }: { deferMusic?: boolean } = {}) {
  try {
    if (!context) {
      context = new AudioContext()
      const volumes = effectiveVolumes(preferences)
      sfxBus = context.createGain()
      sfxBus.gain.value = volumes.sfx
      sfxBus.connect(context.destination)
      musicBus = context.createGain()
      musicBus.gain.value = volumes.music
      musicBus.connect(context.destination)
    }
    void context.resume().catch(() => { /* Sound may be blocked; gameplay still works. */ })
    if (!deferMusic) startMusic()
  } catch { /* Audio is optional on browsers without Web Audio support. */ }
}

function startMusic() {
  if (!context) return
  if (!music && musicBus) {
    music = new Audio('/sound/Harp.mp3')
    music.loop = true
    music.preload = 'auto'
    music.playbackRate = musicPlaybackRate
    music.preservesPitch = true
    const source = context.createMediaElementSource(music)
    musicPitch = createMusicPitch(context, source, musicBus, musicPlaybackRate === 2)
  }
  if (pageActive && music?.paused) void music.play().catch(() => { /* Retry on the next user action. */ })
}

let warming = false
/** Warm effects in small batches only after the room has landed. */
export function warmGameAudio() {
  const audio = context
  if (!audio) return
  try { startMusic() } catch { /* Optional music cannot block the room. */ }
  if (warming) return
  warming = true
  void (async () => {
    for (let index = 0; index < actionSoundNames.length; index += 2) {
      await Promise.all(actionSoundNames.slice(index, index + 2).map(name => loadSound(name, audio)))
    }
  })()
}

function playBuffer(buffer: AudioBuffer | null | undefined, delay = 0, muffled = false) {
  if (!buffer || !context || !sfxBus || context.state !== 'running') return () => {}
  const source = context.createBufferSource()
  source.buffer = buffer
  const processing: AudioNode[] = []
  if (muffled) {
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.5
    const gain = context.createGain()
    gain.gain.value = 0.75
    source.connect(filter)
    filter.connect(gain)
    gain.connect(sfxBus)
    processing.push(filter, gain)
  } else source.connect(sfxBus)
  let stopped = false
  source.start(context.currentTime + delay / 1000)
  return () => {
    if (stopped) return
    stopped = true
    source.stop()
    source.disconnect()
    processing.forEach(node => node.disconnect())
  }
}

export async function getDealSound() {
  const buffer = context ? await loadSound('card-dealt', context) : null
  return {
    duration: buffer ? buffer.duration * 1000 : fallbackDuration,
    play: (delay: number) => playBuffer(buffer, delay, true),
  }
}

/** Action clips may ring through card travel, but never through restart or unmount. */
export async function playActionSound(name: string | null, signal: AbortSignal) {
  if (!name || signal.aborted) return
  const buffer = context ? await loadSound(name, context) : null
  if (!buffer || signal.aborted) return
  const stop = playBuffer(buffer)
  const cleanup = () => {
    clearTimeout(timer)
    signal.removeEventListener('abort', cleanup)
    stop()
  }
  const timer = setTimeout(cleanup, buffer.duration * 1000)
  signal.addEventListener('abort', cleanup, { once: true })
}
