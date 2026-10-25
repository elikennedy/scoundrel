/** Lower pitch independently of the music element's playback speed. */
export function createMusicPitch(audio: BaseAudioContext, input: AudioNode, output: AudioNode, initiallyActive = false) {
  const dry = audio.createGain()
  const wet = audio.createGain()
  dry.gain.value = initiallyActive ? 0 : 1
  wet.gain.value = initiallyActive ? 1 : 0
  input.connect(dry).connect(output)
  wet.connect(output)

  // An increasing delay lowers pitch. Two overlapping, Hann-windowed read heads
  // hide each delay ramp's reset. Both stereo channels use the same modulation.
  const frames = Math.round(audio.sampleRate * .16)
  const period = frames / audio.sampleRate
  const pitchRatio = 2 ** (-6 / 12)
  const ramp = audio.createBuffer(1, frames, audio.sampleRate)
  const envelope = audio.createBuffer(1, frames, audio.sampleRate)
  const delays = ramp.getChannelData(0)
  const gains = envelope.getChannelData(0)
  for (let frame = 0; frame < frames; frame++) {
    const phase = frame / frames
    delays[frame] = .005 + (1 - pitchRatio) * period * phase
    gains[frame] = .5 - .5 * Math.cos(2 * Math.PI * phase)
  }

  const start = audio.currentTime + .01
  for (const offset of [0, period / 2]) {
    const delay = audio.createDelay(.1)
    const fade = audio.createGain()
    // Audio-rate control signals supply the full parameter values.
    delay.delayTime.value = 0
    fade.gain.value = 0
    input.connect(delay).connect(fade).connect(wet)
    for (const [buffer, parameter] of [[ramp, delay.delayTime], [envelope, fade.gain]] as const) {
      const control = audio.createBufferSource()
      control.buffer = buffer
      control.loop = true
      control.connect(parameter)
      control.start(start, offset)
    }
  }

  let active = initiallyActive
  return {
    setActive(next: boolean) {
      if (next === active) return
      active = next
      const now = audio.currentTime
      for (const [gain, value] of [[dry.gain, next ? 0 : 1], [wet.gain, next ? 1 : 0]] as const) {
        const current = gain.value
        gain.cancelScheduledValues(now)
        gain.setValueAtTime(current, now)
        gain.linearRampToValueAtTime(value, now + .05)
      }
    },
  }
}
