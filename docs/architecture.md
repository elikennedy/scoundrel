# Architecture and validation

## Boundaries

The app is a static Vite/React site. The rules engine has no React or browser dependencies; presentation code owns interaction and animation.

- `src/game/`: pure immutable TypeScript rules, stable card IDs and action validation; no React or DOM dependencies.
- `src/App.tsx`: live game lifecycle, four presentation slots, transition sequencing, announcements and dialogs.
- `src/components/gameAudio.ts`: gesture-unlocked Web Audio, cached WAV decoding and cancellable playback. `actionSounds.ts` maps card actions to sound assets.
- `src/components/cardMotion.ts`: temporary visual copies, cancellation, flipping and travel; never changes rules.
- `RoomCard.tsx`, `CardFace.tsx`, `cardIllustrations.ts`: actions, shared card template and artwork catalogue.
- `GameSidebar.tsx`, `DiscardPile.tsx`: health/equipment and the last-five discard fan.
- `HowToPlay.tsx` / `.css`: scrolling illustrated guide and isolated engine-backed practice.
- `src/scores/store.ts`: validated high score records, ranking and async storage contract; browser implementation and future cloud adapter selection. `config.ts` reads the Vite build-time cloud flag.
- `TableTool.tsx` / `.css`: equal-size navigation medallions and hover/focus tooltips with Escape dismissal.
- `SoundSettings.tsx` / `.css`: native sound settings dialog, volume sliders and mute toggles. `audioPreferences.ts` validates settings and computes effective channel levels.
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


## Asset loading

The title screen mounts only its title/deck images and navigation controls. Dialog shells stay mounted for native focus handling, but their image content is absent until opened; outcome artwork mounts only in a finished game. Guide and sound contents unmount on close while their component state (including guide practice progress) remains. Modal opening runs in a layout effect after the content commits, preserving initial focus and Return/Escape behaviour.

Guide card illustrations use native lazy loading. Live room cards remain eager and decode in parallel with the deal clip; each card waits for its own image and the deck back to decode before its flight starts. `imageReadiness.ts` releases waits on restart/unmount and tolerates failed decoding so the card's error placeholder can take over. It does not preload the entire deck. `tests/imageReadiness.test.ts` covers readiness, failures and cancellation.

Audio unlocks from a user gesture, but a new game defers music and background effect loading until its first deal completes. Sound settings can start music independently. Unopened dialogs never initialize audio.

## Presentation sequencing

Engine results are calculated before animation. Health previews update immediately, while the next board state waits for outgoing cards and any carryover slide. Fixed slots preserve card positions within a room. On room advance, the survivor moves to the rightmost slot; new cards then deal from right to left. The engine's room order remains independent of visual slot order.

Each incoming card plays `/sound/card-dealt.wav` while travel and flip share its decoded duration. Deal playback alone passes through a 1,800Hz low-pass filter (Q 0.5) at 75% gain to soften its sharp edge; the source WAV and other sound cues remain unchanged. Audio is unlocked from a game action. The deal clip is requested alongside the first room art; other effects warm in batches of two after the room lands. Clips are decoded once and cached, and an action can request its own clip on demand. Missing, blocked or unsupported audio falls back to silent dealing with the bundled clip's measured timing; loading times out after three seconds. Restart/unmount stops active or scheduled sounds with the same abort signal as card motion. Reduced motion fades for 90ms, then holds the face through the remaining clip duration.

Monster attacks await a cancellable diagonal red slash on the stationary card before travel to discard or equipment. Healing-card use awaits a diffuse golden glow that brightens and expands with the same timing and cancellation path; spent healing-card discards skip it. Both effects are removed before cloning; reduced motion uses a brief stationary fade.

The whole source card is hidden before its visual copy moves, including action overlays and focus outlines. Visibility is restored in a layout effect after the next slots commit. Incoming real cards remain hidden until their copies land. The busy flag disables gameplay actions and suppresses overlays/card emphasis during transitions. New game aborts outstanding animations; stale completions must not update a restarted game.

Returning flee copies retain the original card layout and scale as a whole. Building them at deck size would reflow labels and squeeze artwork. Card motion timings and visual rules belong in [DESIGN.md](../DESIGN.md), not the engine.

## Audio controls and music

Top-right controls appear in this order: New game, Sound settings, High scores, How to play. Sound settings opens a native modal on the same illustrated slate plate as game over. Return to game or Escape closes it and restores focus to the opener. Native range inputs expose sound-effects and music volumes, with a mute toggle for each channel and a separate Mute all toggle. Muting preserves volume levels and other mute states; changing a slider does not clear a mute.

`gameAudio.ts` routes all effects through one gain bus and music through another. Gain changes apply to active sources with a short ramp. The deal-only filter and 75% gain remain before the SFX bus. Defaults are 100% SFX and 35% music, with all mute toggles off. Preferences are validated and saved under `scoundrel:audio:v1` in local storage. Missing/damaged fields recover to defaults; unavailable storage keeps changes for the current session.

`public/sound/Harp.mp3` loops through an HTML audio element connected to the music bus. For a new game, playback begins after the first room finishes dealing. Opening/interacting with Sound settings or subsequent game actions can also start or retry playback; loading the page alone stays silent. Music continues through restarts, dialogs and outcomes; hiding the tab or unmounting the app pauses it. Returning to the tab resumes when the audio context is running. Blocked playback is retried at the next audio interaction. The track is streamed rather than decoded into the SFX cache.

`tests/audioPreferences.test.ts` covers normalization, channel independence and restoration after Mute all. Check keyboard slider operation, mute changes while sounds play, Escape/Return focus restoration, preference persistence, and hidden-tab music pause in the browser.

## Action audio

Accepted live-game actions play local WAV files from `public/sound/`. Monster cues begin with the attack slash for both weapon and barehanded combat. They may finish during subsequent card movement; they do not extend animation timing. Restart or unmount cancels all active cues. Invalid actions, hovering, dealing monsters and the practice guide do not trigger action sounds.

| Action/card | Sound |
| --- | --- |
| Equip or replace a weapon | `equip` |
| Attack clubs 2–6 / 7–J / Q–A | `beast-small` / `beast-medium` / `beast-large` |
| Attack spades 2–6 / 7–J / Q–A | `shade-small` / `shade-medium` / `shade-large` |
| Use Dewdrop Vial (hearts 2) or Starlight Elixir (hearts 9) | `glass-uncork` |
| Use Witch's Remedy (hearts 6, clay bottle) | `clay-uncork` |
| Discard any healing card after healing has been used | `decard` (the supplied filename) |
| Use another healing card | `heal` |

The discard cue takes precedence over bottle cues. Using a healing card at full health still plays its use cue because it consumes the room's healing allowance. `tests/sounds.test.ts` verifies suit/rank boundaries, bottle mappings, weapon cues, discard precedence and asset presence.

## Accessibility and dialogs

Native buttons expose unavailable actions and health consequences. Tab reveals card controls; Enter or Space activates focused buttons. A visually hidden live region announces action results. Return/escape closes How to Play, with chapter navigation focusing the selected heading. The guide practice state is independent of the live game.

Outcome dialogs use native modal focus containment and prevent the cancel event. Play again is their only dismissal action. Reduced motion replaces spatial travel/flips with brief fades and removes card/fan transitions; interactions still update normally.

The standalone high score dialog closes with its Return to game image button or native Escape handling and restores focus to the opener. Its plate and laurel/crown images are decorative; headings, labels, score data and table semantics remain HTML. Image controls retain accessible names and keyboard focus styling. Populated score tables expose a focusable scroll region so keyboard users can reach all ten entries; the outcome ledger does not add a dismissal action.

## High score lifecycle

App captures a stable random run ID, final engine score and ISO completion timestamp when an action produces a terminal state. The outcome mounts one ledger per run; saving is explicit and optional. Initials normalize to three uppercase A–Z letters. A submission lock and stable ID prevent duplicate entries; Play again is disabled during a pending write. The list refreshes when the standalone ledger opens. The stored top ten rank by score descending, completion time ascending, then ID for deterministic ordering. Scores outside the top ten are acknowledged without claiming a retained entry.

The browser store reads and validates existing records before each write, so it does not overwrite damaged data and incorporates other tabs' completed writes. Simultaneous writes across tabs are not transactional. Storage access and quota failures reject into visible recovery messages. Timestamps persist as ISO strings and display as local date/time. Data is scoped to the site origin; no current-game persistence is added.

To configure storage, copy `.env.example` to `.env.local` and restart Vite or rebuild. Only the literal `VITE_CLOUD_STORAGE_ENABLED=true` selects the cloud boundary; absent/false uses local storage. Vite exposes `VITE_` variables to browser code, so they must never contain secrets. The unconfigured cloud implementation rejects explicitly. A future Firestore store implements `list()` and idempotent `save(entry)` and is supplied to `selectScoreStore`; it must preserve validation, ranking, stable IDs and timestamps. Cloud authentication, security rules and abuse prevention remain future work. No Firebase SDK or service is initialized in this version.

## Validation

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check` before a handoff. The 14 engine tests cover deck validation, turns, fleeing, weapon limits, healing, scoring, immutability and complete deterministic runs. Seven storage tests cover initials, ordering/retention, persistence, duplicate saves, damaged data, access/quota failures and cloud selection.

For high scores, check empty/populated ledgers, initials normalization, one save per run, reload persistence, save failure/retry, local date/time and keyboard access. Escape closes the standalone ledger and returns focus to its opener; the outcome still only closes with Play again. Review ten rows at 1280×720 in both contexts: the bounded table may show fewer rows initially, and keyboard scrolling must reach the final entries without crossing the illustrated rim.

For UI changes, check the affected states in a desktop browser: deal order, landing handoff, carryover slide, source cleanup, correct discard/equipment destinations, flee returns and restart cancellation. Check keyboard focus and reduced motion when changing interaction code. For guide changes, check combat comparison, all practice steps/reset, scrolling/return controls and the longest narration at 1280×720. Practice health should read 14 → 14 → 11 → 17.

Review screenshots are disposable evidence under `.impeccable/review/` (ignored). Historical captures are not current product specifications. Do not add tests that merely duplicate styling; keep meaningful rule changes covered by engine tests.

House-rule configuration is snapshotted in `GameState.rules` on start. Deck validation requires every standard card plus exactly the configured number of distinct high-value red cards and both jokers only when enabled. Joker swaps accept an injected sample, keep the same room slot and resolution count, and animate the returned card from discard. Browser preferences are stored separately from the live run. Only standard runs create a high-score submission record.
