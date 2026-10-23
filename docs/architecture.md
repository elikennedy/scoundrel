# Architecture and validation

## Boundaries

- `src/game/`: pure immutable TypeScript rules, stable card IDs and action validation; no React or DOM dependencies.
- `src/App.tsx`: live game lifecycle, four presentation slots, transition sequencing, announcements and dialogs.
- `src/components/cardMotion.ts`: temporary visual copies, cancellation, flipping and travel; never changes rules.
- `RoomCard.tsx`, `CardFace.tsx`, `cardIllustrations.ts`: actions, shared card template and artwork catalogue.
- `GameSidebar.tsx`, `DiscardPile.tsx`: health/equipment and the last-five discard fan.
- `HowToPlay.tsx` / `.css`: scrolling illustrated guide and isolated engine-backed practice.

## Engine API


`src/game/index.ts` exports the React-independent API:

- `createDeck()` creates all 44 cards with stable IDs such as `spades-14` and `diamonds-10`. Artwork is associated using these IDs; the engine stores only card identity, kind, suit, and value.
- `shuffleDeck(deck, random?)` returns a shuffled copy. Randomness lives outside the state machine and can be injected for reproducible deals.
- `createInitialState()` returns the `ready` state. `gameReducer(state, action)` supports `start`, `resolve`, `flee`, and `reset`, and is suitable for React’s `useReducer`.
- Start (or restart) with `{ type: 'start', deck: shuffleDeck(createDeck()) }`. Start validates a complete standard Scoundrel deck and deals the first room automatically.
- Resolve a card with `{ type: 'resolve', cardId }`; monsters require `combat: 'barehanded'` or `combat: 'weapon'`.
- `getLegalActions(state)`, `canFlee(state)`, and `canUseWeapon(state, monster)` support UI affordances. Start/reset are lifecycle actions rather than room actions.
- `applyAction(state, action)` returns `{ ok, state, error? }` for validation feedback. Rejected actions preserve the original state; the reducer adapter returns that unchanged state.

States progress from `ready` to `playing`, then `won` or `lost`; `start` restarts from any state and `reset` returns to `ready`. Terminal states retain the board and final score for a results view. Transitions return new state without mutating their inputs. Treat exported readonly states and cards as immutable; this API accepts typed application actions, not untrusted network/save data.


## Presentation sequencing

Engine results are calculated before animation. Health previews update immediately, while the next board state waits for outgoing cards and any carryover slide. Fixed slots preserve card positions within a room. On room advance, the survivor moves to the rightmost slot; new cards then deal from right to left. The engine's room order remains independent of visual slot order.

The whole source card is hidden before its visual copy moves, including action overlays and focus outlines. Visibility is restored in a layout effect after the next slots commit. Incoming real cards remain hidden until their copies land. The busy flag disables gameplay actions and suppresses overlays/card emphasis during transitions. New game aborts outstanding animations; stale completions must not update a restarted game.

Returning flee copies retain the original card layout and scale as a whole. Building them at deck size would reflow labels and squeeze artwork. Card motion timings and visual rules belong in [DESIGN.md](../DESIGN.md), not the engine.

## Accessibility and dialogs

Native buttons expose unavailable actions and health consequences. Tab reveals card controls; Enter or Space activates focused buttons. A visually hidden live region announces action results. Return/escape closes How to Play, with chapter navigation focusing the selected heading. The guide practice state is independent of the live game.

Outcome dialogs use native modal focus containment and prevent the cancel event. Play again is their only dismissal action. Reduced motion replaces spatial travel/flips with brief fades and removes card/fan transitions; interactions still update normally.

## Validation

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check` before a handoff. The 14 engine tests cover deck validation, turns, fleeing, weapon limits, healing, scoring, immutability and complete deterministic runs.

For UI changes, check the affected states in a desktop browser: deal order, landing handoff, carryover slide, source cleanup, correct discard/equipment destinations, flee returns and restart cancellation. Check keyboard focus and reduced motion when changing interaction code. For guide changes, check combat comparison, all practice steps/reset, scrolling/return controls and the longest narration at 1280×720. Practice health should read 14 → 14 → 11 → 17.

Review screenshots are disposable evidence under `.impeccable/review/` (ignored). Historical captures are not current product specifications. Do not add tests that merely duplicate styling; keep meaningful rule changes covered by engine tests.
