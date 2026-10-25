export type AudioPreferences = Readonly<{
  sfxVolume: number
  musicVolume: number
  sfxMuted: boolean
  musicMuted: boolean
  allMuted: boolean
}>

export const defaultAudioPreferences: AudioPreferences = {
  sfxVolume: 1, musicVolume: 0.35,
  sfxMuted: false, musicMuted: false, allMuted: false,
}

export function normalizeAudioPreferences(value: unknown): AudioPreferences {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const volume = (key: 'sfxVolume' | 'musicVolume') => typeof input[key] === 'number' && Number.isFinite(input[key])
    ? Math.max(0, Math.min(1, input[key])) : defaultAudioPreferences[key]
  return {
    sfxVolume: volume('sfxVolume'), musicVolume: volume('musicVolume'),
    sfxMuted: input.sfxMuted === true, musicMuted: input.musicMuted === true, allMuted: input.allMuted === true,
  }
}

export function effectiveVolumes(settings: AudioPreferences) {
  return {
    sfx: settings.allMuted || settings.sfxMuted ? 0 : settings.sfxVolume,
    music: settings.allMuted || settings.musicMuted ? 0 : settings.musicVolume,
  }
}
