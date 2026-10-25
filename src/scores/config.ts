import { createBrowserScoreStore, selectScoreStore } from './store'

export const scoreStore = selectScoreStore(
  import.meta.env.VITE_CLOUD_STORAGE_ENABLED === 'true',
  createBrowserScoreStore(() => window.localStorage),
)
