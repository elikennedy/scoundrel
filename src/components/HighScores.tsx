import { useEffect, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { scoreStore } from '../scores/config'
import { normalizeInitials } from '../scores/store'
import type { HighScore } from '../scores/store'
import './HighScores.css'

type CompletedRun = Omit<HighScore, 'name'>
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

function storageError(error: unknown): string {
  return error instanceof Error && error.name === 'Error' ? error.message
    : 'Browser storage is unavailable. Allow site storage and try again. You can still play again.'
}

export function ScoreLedger({ run, onSaving, onReturn }: { run?: CompletedRun; onSaving?: (saving: boolean) => void; onReturn?: () => void }) {
  const [entries, setEntries] = useState<HighScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const submitting = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const savedMessage = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (saved) savedMessage.current?.focus() }, [saved])

  async function load() {
    setLoading(true)
    setError('')
    try { setEntries(await scoreStore.list()) }
    catch (cause) { setError(storageError(cause)) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    let active = true
    scoreStore.list().then(scores => { if (active) setEntries(scores) })
      .catch(cause => { if (active) setError(storageError(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!run || submitting.current || saved) return
    if (!/^[A-Z]{3}$/.test(name)) { input.current?.focus(); return }
    submitting.current = true
    setSaving(true)
    onSaving?.(true)
    setError('')
    try {
      setEntries(await scoreStore.save({ ...run, name }))
      setSaved(true)
    } catch (cause) { setError(storageError(cause)) }
    finally { submitting.current = false; setSaving(false); onSaving?.(false) }
  }

  const rank = saved ? entries.findIndex(entry => entry.id === run?.id) + 1 : 0
  return <section className="score-ledger" aria-labelledby={run ? 'run-scores-title' : 'scores-title'}>
    <img className="score-plate" src="/art/ui/high-scores-plate.webp" alt="" />
    <div className="score-ledger-content">
    <header className="score-ledger-heading">
      <img className="score-emblem" src="/art/ui/bronze-laurel.webp" alt="" />
      <div><h2 id={run ? 'run-scores-title' : 'scores-title'}>High scores</h2>
      <p className="score-scope">{scoreStore.mode === 'browser' ? 'Your best ten descents · This browser' : 'Cloud high scores'}</p></div>
    </header>
    {run && <div className="score-entry">
      {saved ? <p className="score-saved" role="status" ref={savedMessage} tabIndex={-1}>{rank ? `${name}, your score is No. ${rank}.` : `${name}, your score did not reach the top ten.`}</p>
        : <form onSubmit={save}>
          <label htmlFor="score-initials">Leave your initials <span>Three letters, arcade style.</span></label>
          <div className="score-entry-controls">
            <input id="score-initials" ref={input} aria-label="Three-letter initials" value={name} onChange={event => setName(normalizeInitials(event.target.value))} maxLength={3} pattern="[A-Z]{3}" required autoComplete="off" spellCheck={false} placeholder="AAA" disabled={saving} aria-describedby="initials-hint" />
            <button className="ledger-image-button save-score-button" type="submit" aria-label={saving ? 'Saving score' : 'Save score'} disabled={loading || saving || name.length !== 3}><img src="/art/ui/save-score.webp" alt="" /><span className="sr-only">{saving ? 'Saving…' : 'Save score'}</span></button>
          </div>
          <span id="initials-hint" className="sr-only">Use three letters A to Z. Saving is optional; Play again starts another run.</span>
        </form>}
    </div>}
    {error && <div className="score-error" role="alert"><p>{error}</p><button className="ledger-action" type="button" disabled={saving || loading} onClick={load}>Try again</button></div>}
    <div className="score-table-wrap" role="region" aria-label="High score table" tabIndex={entries.length ? 0 : undefined} aria-busy={loading}>
      <table className="score-table">
        <caption className="sr-only">Ten highest scores, highest first. Ties go to the earlier run. Dates and times are local.</caption>
        <thead><tr><th scope="col">No.</th><th scope="col">Name</th><th scope="col">Score</th><th scope="col">Date &amp; time</th></tr></thead>
        <tbody>{entries.map((entry, index) => <tr key={entry.id} className={saved && entry.id === run?.id ? 'current-score' : undefined} aria-current={saved && entry.id === run?.id ? 'true' : undefined}>
          <td>{String(index + 1).padStart(2, '0')}</td><th scope="row">{entry.name}</th><td>{entry.score}</td>
          <td><time dateTime={entry.completedAt}>{dateFormat.format(new Date(entry.completedAt))}<span>{timeFormat.format(new Date(entry.completedAt))}</span></time></td>
        </tr>)}</tbody>
      </table>
      {!entries.length && <p className="score-empty">{loading ? 'Opening the ledger…' : error ? 'The ledger is unavailable.' : 'No scores yet. Your next descent could be the first.'}</p>}
    </div>
    {onReturn && <button className="ledger-image-button scores-return" onClick={onReturn} aria-label="Return to game"><img src="/art/ui/return-to-game.webp" alt="" /></button>}
    </div>
  </section>
}

export function HighScores({ dialogRef, open, onClose }: { dialogRef: RefObject<HTMLDialogElement | null>; open: boolean; onClose: () => void }) {
  return <dialog className="scores-modal" ref={dialogRef} aria-labelledby="scores-title" onClose={onClose}>
    {open && <ScoreLedger onReturn={() => dialogRef.current?.close()} />}
  </dialog>
}
