# Architecture and validation

## Boundaries

The app is a static Vite/React site. The rules engine has no React or browser dependencies; presentation code owns interaction and animation.

- `src/game/`: pure immutable TypeScript rules, stable card IDs and action validation; no React or DOM dependencies.
- `src/App.tsx`: live game lifecycle, four presentation slots, transition sequencing, announcements and dialogs.
- `src/components/gameAudio.ts`: gesture-unlocked Web Audio, cached WAV decoding and cancellable playback. `actionSounds.ts` maps card actions to sound assets.
- `src/components/cardMotion.ts`: temporary visual copies, cancellation, flipping and travel; never changes rules.
- `RoomCard.tsx`, `CardFace.tsx`, `cardIllustrations.ts`: actions, shared card template and artwork catalogue.
- `GameSidebar.tsx`, `DiscardPile.tsx`, `DrawPile.tsx`: health/equipment, the last-five discard fan and known dungeon cards.
- `HowToPlay.tsx` / `.css`: scrolling illustrated guide and isolated engine-backed practice.
- `src/scores/store.ts`: validated high score records, ranking and async storage contract; browser implementation and future cloud adapter selection. `config.ts` reads the Vite build-time cloud flag.
- `TableTool.tsx` / `.css`: equal-size navigation medallions and hover/focus tooltips with Escape dismissal.
- `SoundSettings.tsx` / `.css`: the native Settings dialog, audio controls and house-rule selects. `audioPreferences.ts` validates audio levels; `houseRulesPreferences.ts` migrates and validates saved rule choices.
- `HighScores.tsx` / `.css`: shared illustrated score ledger, initials entry and standalone high score dialog. Eligible standard outcomes embed the same ledger beside the result plate; house-rule outcomes show the score without score entry.

## Engine API

`src/game/index.ts` exports the React-independent API:

- `createDeck(rules?, random?)` creates the standard 44-card deck plus the configured optional cards. `DEFAULT_HOUSE_RULES` disables every option. The injected random function selects handicap cards and independent obstacle counts.
- `createHandicapCards()`, `createCosmicCards()` and `createBarricadeCards(material, count?)` provide canonical card pools for catalogues, guide examples and tests. Stable physical IDs distinguish copies that share artwork.
- `isCompleteDeck(deck, rules?)` checks canonical identities, values, enabled card sets, uniqueness and obstacle count bounds. Validation performs no random selection.
- `shuffleDeck(deck, random?)` returns a shuffled copy; samples must be in `[0, 1)`.
- `createInitialState()` returns the `ready` state. `gameReducer(state, action)` is a reducer adapter over `applyAction(state, action)`, which returns a successful state or an error with the original state unchanged.
- `getLegalActions(state)`, `canFlee(state)`, `canUseWeapon(state, monster)` and `canActivateCosmic(state, card)` provide the engine’s availability checks. Start/reset are lifecycle actions rather than room choices.
- `isHighScoreEligible(state)` checks the run’s rules snapshot. `combatDamage(monster, weapon, currentPower?)` supports combat previews and resolution; equipped combat passes current power rather than printed rank.

| Action | Required data and behaviour |
| --- | --- |
| `start` | A complete `deck` and optional `rules`; validates the composition and deals the first room |
| `resolve` | A room `cardId`; monsters/obstacles require `combat`, jokers require `joker`, cosmic cards require `cosmic` |
| `mirror-exchange` | A remaining room `cardId`; completes the pending mandatory Mirror exchange |
| `flee` | Returns a legal full room to the dungeon bottom without shuffling |
| `reset` | Returns to the empty ready state |

For a standard game, start with `{ type: 'start', deck: shuffleDeck(createDeck()) }`. With house rules, pass the same rules to both `createDeck(rules)` and the start action. Joker Play supplies `randomSample`; Fate Activate supplies one `randomSamples` entry per Fisher–Yates step. The state machine itself has no hidden random draws.

States progress from `ready` to `playing`, then `won` or `lost`; `start` restarts from any state and `reset` returns to `ready`. Terminal states retain the board and final score for a results view. Transitions return new state without mutating their inputs. Treat exported readonly states and cards as immutable; this API accepts typed application actions, not untrusted network/save data.

## House-rule state and transitions

`GameState.rules` snapshots the new-game settings. Browser preferences remain separate, so changing them mid-run cannot alter deck composition or score eligibility. Optional `HouseRules.cosmic` and `.barricades` fields keep older callers compatible; saved handicap/joker choices migrate with new options off. Exact card effects belong in [the rules reference](rules.md#optional-house-rules).

### Card identity and equipment

Custom cards use `cosmic` and `barricade` unions. Obstacle copy IDs run from `wood-1` to `wood-4`, and likewise for `rubble`, `thorns` and `pit`. All copies of a material share one illustration. When Barricades is enabled, validation requires 1–4 of each material.

`EquippedWeapon.power` is current power, separate from immutable `Weapon.value`. Damage previews, the equipped banner and status use current power. Surviving obstacle clears preserve target history; destruction discards the weapon and every attached monster. Forge clears that history and discards the trophies without restoring power. Pit Traps never accept weapon combat; thorns use an immediate three-point cost without a continuing poison state.

### Reveals and the Mirror choice

`GameState.revealedDungeon` records specific known card IDs, not an automatically refreshing peek. Dealing removes departed IDs; Fate clears the snapshot when shuffling. Sight snapshots the next three after ordinary room advancement. A Mirror exchange makes the returned top card known. `DrawPile` displays known cards in draw order through a native Hide/Show disclosure.

Mirror activation sets `GameState.mirrorRevealed` to the dungeon’s top ID while discarding and resolving the mirror. Until the player chooses, the engine accepts only `mirror-exchange`, `start` or `reset`. Exchange replaces the selected room card with the revealed card and puts the selected card at dungeon index zero. It then clears the pending choice and evaluates normal advancement. A third resolution therefore waits for exchange before refilling; the returned card can be dealt immediately.

### Custom-card presentation

Joker swaps keep the room slot and resolution count; the returned card travels from discard. Fate returns all unresolved room faces before a fresh sequential deal. Forge discards trophy faces, and destroyed weapons travel with their trophies. Mirror sends the selected room face to the deck and deals the revealed arrival into its slot, or the carryover slot on advancement. All reuse the shared abort controller and reduced-motion paths.

The guide’s optional-card catalogue is separate from its standard 44-card practice deck. Practice never changes the live run.

## Asset loading

The title screen mounts only its title/deck images and navigation controls. Dialog shells stay mounted for native focus handling, but their image content is absent until opened; outcome artwork mounts only in a finished game. Guide and Settings contents unmount on close while their component state (including guide practice progress) remains. Modal opening runs in a layout effect after the content commits, preserving initial focus and Return/Escape behaviour.

Guide card illustrations use native lazy loading. Live room cards remain eager and decode in parallel with the deal clip; each card waits for its own image and the deck back to decode before its flight starts. `imageReadiness.ts` releases waits on restart/unmount and tolerates failed decoding so the card's error placeholder can take over. It does not preload the entire deck. `tests/imageReadiness.test.ts` covers readiness, failures and cancellation.

Audio unlocks from a user gesture, but a new game defers music and background effect loading until its first deal completes. Audio interaction in Settings can start music independently. Unopened dialogs never initialize audio.

## Presentation sequencing

Engine results are calculated before animation. Health previews update immediately, while the next board state waits for outgoing cards and any carryover slide. Fixed slots preserve card positions within a room. On room advance, the survivor moves to the rightmost slot; new cards then deal from right to left. The engine's room order remains independent of visual slot order.

Each incoming card plays `/sound/card-dealt.wav` while travel and flip share its decoded duration. Deal playback alone passes through a 1,800Hz low-pass filter (Q 0.5) at 75% gain to soften its sharp edge; the source WAV and other sound cues remain unchanged. Audio is unlocked from a game action. The deal clip is requested alongside the first room art; other effects warm in batches of two after the room lands. Clips are decoded once and cached, and an action can request its own clip on demand. Missing, blocked or unsupported audio falls back to silent dealing with the bundled clip's measured timing; loading times out after three seconds. Restart/unmount stops active or scheduled sounds with the same abort signal as card motion. Reduced motion fades for 90ms, then holds the face through the remaining clip duration.

Monster attacks await a cancellable diagonal red slash on the stationary card before travel to discard or equipment. Healing-card use awaits a diffuse golden glow that brightens and expands with the same timing and cancellation path; spent healing-card discards skip it. Both effects are removed before cloning; reduced motion uses a brief stationary fade.

The whole source card is hidden before its visual copy moves, including action overlays and focus outlines. Visibility is restored in a layout effect after the next slots commit. Incoming real cards remain hidden until their copies land. The busy flag disables gameplay actions and suppresses overlays/card emphasis during transitions. New game aborts outstanding animations; stale completions must not update a restarted game.

Returning flee copies retain the original card layout and scale as a whole. Building them at deck size would reflow labels and squeeze artwork. Card motion timings and visual rules belong in [DESIGN.md](../DESIGN.md), not the engine.

## Settings and audio

Top-right controls appear in this order: New game, Settings, High scores, How to play. The cog opens a native modal on the same illustrated slate plate as game over. Return to game or Escape closes it and restores focus to the opener. Native range inputs expose sound-effects and music volumes, with a mute toggle for each channel and a separate Mute all toggle. Muting preserves volume levels and other mute states; changing a slider does not clear a mute. The same dialog contains independent house-rule selects; those choices are saved under `scoundrel-house-rules-v1` and affect only new games.

`gameAudio.ts` routes all effects through one gain bus and music through another. Gain changes apply to active sources with a short ramp. The deal-only filter and 75% gain remain before the SFX bus. Defaults are 100% SFX and 35% music, with all mute toggles off. Preferences are validated and saved under `scoundrel:audio:v1` in local storage. Missing/damaged fields recover to defaults; unavailable storage keeps changes for the current session.

`public/sound/Harp.mp3` loops through an HTML audio element connected to the music bus. For a new game, playback begins after the first room finishes dealing. Opening/interacting with Settings or subsequent game actions can also start or retry playback; loading the page alone stays silent. Music continues through restarts, dialogs and outcomes; hiding the tab or unmounting the app pauses it. Returning to the tab resumes when the audio context is running. Blocked playback is retried at the next audio interaction. The track is streamed rather than decoded into the SFX cache.

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
| Resolve a joker, cosmic card or obstacle | `decard` |

The discard cue takes precedence over bottle cues. Using a healing card at full health still plays its use cue because it consumes the room's healing allowance. `tests/sounds.test.ts` verifies suit/rank boundaries, bottle mappings, weapon cues, discard precedence and asset presence.

## Accessibility and dialogs

Native buttons expose unavailable actions and health consequences. Tab reveals card controls; Enter or Space activates focused buttons. A visually hidden live region announces action results. Return/escape closes How to Play, with chapter navigation focusing the selected heading. The guide practice state is independent of the live game.

Outcome dialogs use native modal focus containment and prevent the cancel event. Play again is their only dismissal action. Reduced motion replaces spatial travel/flips with brief fades and removes card/fan transitions; interactions still update normally.

The standalone high score dialog closes with its Return to game image button or native Escape handling and restores focus to the opener. Its plate and laurel/crown images are decorative; headings, labels, score data and table semantics remain HTML. Image controls retain accessible names and keyboard focus styling. Populated score tables expose a focusable scroll region so keyboard users can reach all ten entries; the outcome ledger does not add a dismissal action.

## High score lifecycle

For an eligible standard run, App captures a stable random run ID, final engine score and ISO completion timestamp when an action produces a terminal state. House-rule outcomes retain the final score and omit score entry. An eligible outcome mounts one ledger per run; saving is explicit and optional. Initials normalize to three uppercase A–Z letters. A submission lock and stable ID prevent duplicate entries; Play again is disabled during a pending write. The list refreshes when the standalone ledger opens. The stored top ten rank by score descending, completion time ascending, then ID for deterministic ordering. Scores outside the top ten are acknowledged without claiming a retained entry.

The browser store reads and validates existing records before each write, so it does not overwrite damaged data and incorporates other tabs' completed writes. Simultaneous writes across tabs are not transactional. Storage access and quota failures reject into visible recovery messages. Timestamps persist as ISO strings and display as local date/time. Data is scoped to the site origin; no current-game persistence is added.

To configure storage, copy `.env.example` to `.env.local` and restart Vite or rebuild. Only the literal `VITE_CLOUD_STORAGE_ENABLED=true` selects the cloud boundary; absent/false uses local storage. Vite exposes `VITE_` variables to browser code, so they must never contain secrets. The unconfigured cloud implementation rejects explicitly. A future Firestore store implements `list()` and idempotent `save(entry)` and is supplied to `selectScoreStore`; it must preserve validation, ranking, stable IDs and timestamps. Cloud authentication, security rules and abuse prevention remain future work. No Firebase SDK or service is initialized in this version.

## Validation

Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check` before a handoff. Tests are grouped by contract rather than a fixed count:

| Test file | Coverage |
| --- | --- |
| `game.test.ts` | Standard rules, handicap/jokers, scoring, immutable transitions and complete runs |
| `customCards.test.ts` | Cosmic/obstacle composition, wear/destruction, reveals, mandatory Mirror choices, edge cases and seeded all-option simulations |
| `scores.test.ts` | Initials, ranking/retention, persistence, duplicate saves, damaged data, storage failures and cloud selection |
| `audioPreferences.test.ts`, `houseRulesPreferences.test.ts` | Normalization, mutes, defaults and saved-setting migration |
| `imageReadiness.test.ts`, `sounds.test.ts` | Image readiness/cancellation, cue mapping and bundled sound files |

The test command prints the current count; keep coverage descriptions current when contracts change.

For high scores, verify a house-rule outcome cannot save even after options are disabled mid-run. For eligible runs, check empty/populated ledgers, initials normalization, one save per run, reload persistence, save failure/retry, local date/time and keyboard access. Escape closes the standalone ledger and returns focus to its opener; the outcome still only closes with Play again. Review ten rows at 1280×720 in both contexts: the bounded table may show fewer rows initially, and keyboard scrolling must reach the final entries without crossing the illustrated rim.

For custom cards, check mandatory Mirror selection and restart, Sight Hide/Show and reveal cleanup, current weapon power, weapon destruction, and the health-only Pit action.

For UI changes, check the affected states in a desktop browser: deal order, landing handoff, carryover slide, source cleanup, correct discard/equipment destinations, flee returns and restart cancellation. Check keyboard focus and reduced motion when changing interaction code. For guide changes, check combat comparison, all practice steps/reset, scrolling/return controls and the longest narration at 1280×720. Practice health should read 14 → 14 → 11 → 17.

Review screenshots are disposable evidence under `.impeccable/review/` (ignored). Historical captures are not current product specifications. Do not add tests that merely duplicate styling; keep meaningful rule changes covered by engine tests.
