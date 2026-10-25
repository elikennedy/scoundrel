import { DEFAULT_HOUSE_RULES, validHouseRules } from '../game/index.ts'
import type { HouseRules } from '../game/index.ts'
const key = 'scoundrel-house-rules-v1'
export function normalizeHouseRules(value: unknown): HouseRules {
  if (value && typeof value === 'object' && validHouseRules(value as HouseRules)) {
    const rules = value as HouseRules
    return { handicap: rules.handicap, jokers: rules.jokers, cosmic: rules.cosmic ?? false, barricades: rules.barricades ?? false }
  }
  return { ...DEFAULT_HOUSE_RULES }
}
export function loadHouseRules(): HouseRules {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    return normalizeHouseRules(value)
  } catch { /* Unavailable storage keeps the defaults. */ }
  return { ...DEFAULT_HOUSE_RULES }
}
export function saveHouseRules(rules: HouseRules) {
  try { localStorage.setItem(key, JSON.stringify(rules)) } catch { /* Settings still work for this session. */ }
}
