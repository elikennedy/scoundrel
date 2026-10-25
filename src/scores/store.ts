import type { ScoreBoard } from '../game/engine.ts'

export type HighScore = Readonly<{
  id: string
  name: string
  score: number
  completedAt: string
}>

export interface ScoreStore {
  readonly mode: 'browser' | 'cloud'
  list(board?: ScoreBoard): Promise<HighScore[]>
  save(entry: HighScore, board?: ScoreBoard): Promise<HighScore[]>
}

export const SCORE_LIMIT = 10
export const SCORE_STORAGE_KEY = 'scoundrel.high-scores.v1'
export const HOUSE_SCORE_STORAGE_KEY = 'scoundrel.house-high-scores.v1'

function storageKey(board: ScoreBoard): string {
  return board === 'original' ? SCORE_STORAGE_KEY : HOUSE_SCORE_STORAGE_KEY
}

export function normalizeInitials(value: string): string {
  return value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 3)
}

function isHighScore(value: unknown): value is HighScore {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return typeof entry.id === 'string' && entry.id.length > 0
    && typeof entry.name === 'string' && /^[A-Z]{3}$/.test(entry.name)
    && typeof entry.score === 'number' && Number.isSafeInteger(entry.score)
    && typeof entry.completedAt === 'string'
    && Number.isFinite(Date.parse(entry.completedAt))
}

export function rankScores(entries: readonly HighScore[]): HighScore[] {
  return [...entries].sort((a, b) => b.score - a.score
    || Date.parse(a.completedAt) - Date.parse(b.completedAt)
    || a.id.localeCompare(b.id)).slice(0, SCORE_LIMIT)
}

type BrowserStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void }

export function createBrowserScoreStore(storage: () => BrowserStorage): ScoreStore {
  function read(board: ScoreBoard): HighScore[] {
    const raw = storage().getItem(storageKey(board))
    if (raw === null) return []
    let data: unknown
    try { data = JSON.parse(raw) } catch { throw new Error('Saved scores could not be read. Browser data has been left unchanged.') }
    if (!Array.isArray(data) || !data.every(isHighScore)) {
      throw new Error('Saved scores could not be read. Browser data has been left unchanged.')
    }
    return rankScores(data)
  }
  return {
    mode: 'browser',
    async list(board = 'original') { return read(board) },
    async save(entry, board = 'original') {
      if (!isHighScore(entry)) throw new Error('Enter exactly three letters to save your score.')
      // A stable run ID makes a repeated submission idempotent.
      const previous = read(board)
      const entries = rankScores([...previous.filter(item => item.id !== entry.id), entry])
      storage().setItem(storageKey(board), JSON.stringify(entries))
      return entries
    },
  }
}

/** The future Firestore adapter implements this same asynchronous contract. */
export function selectScoreStore(cloudEnabled: boolean, browser: ScoreStore, cloud?: ScoreStore): ScoreStore {
  if (!cloudEnabled) return browser
  if (cloud) return cloud
  const unavailable = async (): Promise<HighScore[]> => {
    throw new Error('Cloud scores are not connected yet. Play again, or switch this build to browser storage.')
  }
  return { mode: 'cloud', list: unavailable, save: unavailable }
}
