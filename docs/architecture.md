# Architecture and validation

## Boundaries

- `src/game/`: pure immutable TypeScript rules, stable card IDs and action validation; no React or DOM dependencies.
- `src/App.tsx`: live game lifecycle, four presentation slots, transition sequencing, announcements and dialogs.
- `src/components/cardMotion.ts`: temporary visual copies, cancellation, flipping and travel; never changes rules.
- `RoomCard.tsx`, `CardFace.tsx`, `cardIllustrations.ts`: actions, shared card template and artwork catalogue.
- `GameSidebar.tsx`, `DiscardPile.tsx`: health/equipment and the last-five discard fan.
- `HowToPlay.tsx` / `.css`: scrolling illustrated guide and isolated engine-backed practice.
- `src/scores/store.ts`: validated high score records, ranking and async storage contract; browser implementation and future cloud adapter selection. `config.ts` reads the Vite build-time cloud flag.
- `HighScores.tsx` / `.css`: shared illustrated score ledger, initials entry and standalone high score dialog. The outcome embeds the same ledger beside its result plate.

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

The standalone high score dialog closes with its Return to game image button or native Escape handling and restores focus to the opener. Its plate and laurel/crown images are decorative; headings, labels, score data and table semantics remain HTML. Image controls retain accessible names and keyboard focus styling. Populated score tables expose a focusable scroll region so keyboard users can reach all ten entries; the outcome ledger does not add a dismissal action.

## High score lifecycle

App captures a stable random run ID, final engine score and ISO completion timestamp when an action produces a terminal state. The outcome mounts one ledger per run; saving is explicit and optional. Initials normalize to three uppercase A–Z letters. A submission lock and stable ID prevent duplicate entries; Play again is disabled during a pending write. The list refreshes when the standalone ledger opens. The stored top ten rank by score descending, completion time ascending, then ID for deterministic ordering. Scores outside the top ten are acknowledged without claiming a retained entry.

The browser store reads and validates existing records before each write, so it does not overwrite damaged data and incorporates other tabs' completed writes. Simultaneous writes across tabs are not transactional. Storage access and quota failures reject into visible recovery messages. Timestamps persist as ISO strings and display as local date/time. Data is scoped to the site origin; no current-game persistence is added.

`VITE_CLOUD_STORAGE_ENABLED=true` selects the cloud boundary; absent/false uses local storage. The unconfigured cloud implementation rejects explicitly. A future Firestore store implements `list()` and idempotent `save(entry)` and is supplied to `selectScoreStore`; it must preserve validation, ranking, stable IDs and timestamps. Cloud authentication, security rules and abuse prevention remain future work. No Firebase SDK or service is initialized in this version.

## Validation

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check` before a handoff. The 14 engine tests cover deck validation, turns, fleeing, weapon limits, healing, scoring, immutability and complete deterministic runs. Seven storage tests cover initials, ordering/retention, persistence, duplicate saves, damaged data, access/quota failures and cloud selection.

For high scores, check empty/populated ledgers, initials normalization, one save per run, reload persistence, save failure/retry, local date/time and keyboard access. Escape closes the standalone ledger and returns focus to its opener; the outcome still only closes with Play again. Review ten rows at 1280×720 in both contexts: the bounded table may show fewer rows initially, and keyboard scrolling must reach the final entries without crossing the illustrated rim.

For UI changes, check the affected states in a desktop browser: deal order, landing handoff, carryover slide, source cleanup, correct discard/equipment destinations, flee returns and restart cancellation. Check keyboard focus and reduced motion when changing interaction code. For guide changes, check combat comparison, all practice steps/reset, scrolling/return controls and the longest narration at 1280×720. Practice health should read 14 → 14 → 11 → 17.

Review screenshots are disposable evidence under `.impeccable/review/` (ignored). Historical captures are not current product specifications. Do not add tests that merely duplicate styling; keep meaningful rule changes covered by engine tests.
