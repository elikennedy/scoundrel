import { useLayoutEffect, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'
import { getAudioPreferences, subscribeAudioPreferences, updateAudioPreferences, prepareGameAudio } from './gameAudio'
import type { HouseRules } from '../game'
import './SoundSettings.css'

export function SoundSettings({ dialogRef, open, onClose, rules, onRulesChange }: { rules: HouseRules; onRulesChange: (rules: HouseRules) => void; dialogRef: RefObject<HTMLDialogElement | null>; open: boolean; onClose: () => void }) {
  useLayoutEffect(() => {
    if (open) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [open, dialogRef])
  const settings = useSyncExternalStore(subscribeAudioPreferences, getAudioPreferences)
  return <dialog className="sound-modal" ref={dialogRef} aria-labelledby="sound-title" onClose={onClose}>
    {open && <>
    <img className="sound-plate" src="/art/ui/result-plate.webp" alt="" />
    <div className="sound-content">
      <header className="sound-heading">
        <img src="/art/ui/settings-medallion.webp" alt="" />
        <h2 id="sound-title" >Settings</h2>
      </header>
      <div className="settings-grid"><section className="settings-audio" aria-label="Audio">
      {(['sfx', 'music'] as const).map(channel => {
        const label = channel === 'sfx' ? 'Sound effects' : 'Music'
        const volumeKey = channel === 'sfx' ? 'sfxVolume' : 'musicVolume'
        const muteKey = channel === 'sfx' ? 'sfxMuted' : 'musicMuted'
        const volume = Math.round(settings[volumeKey] * 100)
        return <section className="sound-channel" key={channel} aria-label={label}>
          <div className="sound-channel-label"><label htmlFor={`volume-${channel}`}>{label}</label><output htmlFor={`volume-${channel}`}>{volume}%</output></div>
          <div className="sound-channel-controls">
            <input id={`volume-${channel}`} type="range" min="0" max="100" step="1" value={volume} aria-valuetext={`${volume} percent${settings.allMuted || settings[muteKey] ? ', muted' : ''}`} onChange={event => {
              prepareGameAudio()
              updateAudioPreferences({ [volumeKey]: Number(event.target.value) / 100 })
            }} />
            <button className="sound-mute" aria-label={`Mute ${label.toLowerCase()}`} aria-pressed={settings[muteKey]} onClick={() => {
              prepareGameAudio()
              updateAudioPreferences({ [muteKey]: !settings[muteKey] })
            }}>
              <span className="sound-mute-icon"><img src="/art/ui/sound-medallion.webp" alt="" />{settings[muteKey] && <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 39 39 9" /></svg>}</span>
              <span>{settings[muteKey] ? 'Muted' : 'Mute'}</span>
            </button>
          </div>
        </section>
      })}
      <button className="sound-master" aria-label="Mute all audio" aria-pressed={settings.allMuted} onClick={() => {
        prepareGameAudio()
        updateAudioPreferences({ allMuted: !settings.allMuted })
      }}>{settings.allMuted ? 'Unmute all' : 'Mute all'}</button>
      <p className="sound-status" role="status">{settings.allMuted ? 'All audio is muted.' : '\u00a0'}</p>
      </section>
      <section className="house-settings" aria-labelledby="house-title">
        <h3 id="house-title">Optional house rules</h3>
        <div className="house-setting-row"><label htmlFor="handicap">Handicap</label><select id="handicap" value={rules.handicap} onChange={event => onRulesChange({ ...rules, handicap: Number(event.target.value) as HouseRules['handicap'] })}>
          <option value={0}>Off</option>{[1, 2, 3, 4].map(level => <option key={level} value={level}>{level} extra {level === 1 ? 'card' : 'cards'}</option>)}
        </select></div>
        <p id="handicap-help">Add randomly chosen hearts and diamonds valued 11–14.</p>
        <div className="house-setting-row"><label htmlFor="jokers">Jokers</label><select id="jokers" value={rules.jokers ? 'in' : 'out'} onChange={event => onRulesChange({ ...rules, jokers: event.target.value === 'in' })}><option value="out">Jokers out</option><option value="in">Jokers in</option></select></div>
        <p>Applies to your next new game. House rules runs show a final score and are excluded from high scores.</p>
      </section>
      </div>
      <button className="sound-return" onClick={() => dialogRef.current?.close()} aria-label="Return to game"><img src="/art/ui/return-to-game.webp" alt="" /></button>
    </div>
    </>}
  </dialog>
}
