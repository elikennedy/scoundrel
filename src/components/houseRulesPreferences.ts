import { DEFAULT_HOUSE_RULES, validHouseRules } from '../game'
import type { HouseRules } from '../game'
const key = 'scoundrel-house-rules-v1'
export function loadHouseRules(): HouseRules {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (value && validHouseRules(value)) return { handicap: value.handicap, jokers: value.jokers }
  } catch { /* Unavailable storage keeps the defaults. */ }
  return { ...DEFAULT_HOUSE_RULES }
}
export function saveHouseRules(rules: HouseRules) {
  try { localStorage.setItem(key, JSON.stringify(rules)) } catch { /* Settings still work for this session. */ }
}
