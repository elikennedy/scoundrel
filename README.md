# Scoundrel

A personal browser adaptation of the solitaire dungeon-crawling card game Scoundrel.

## Status

Bootstrapped on 24 October 2026 with Vite, React, and TypeScript. The pure TypeScript game engine and playable React interface are implemented. Start a shuffled game, resolve room cards, manage weapons and healing, flee, and view the final score. Cards use a fixed bronze frame, value/type banner, and parchment nameplate with unique illustrations and catalogue names for all 44 playable cards.

## Purpose

Build a single-player browser game with room exploration, monsters, weapons, health potions, and a clear win/loss flow.

## Rules Reference

Source: [original rules PDF](https://www.stfj.net/art/2011/Scoundrel.pdf), version 1.0, 15 August 2011, by Zach Gage and Kurt Bieg. Checked 24 October 2026. Paraphrased baseline:

- **Setup:** Remove jokers, red aces, and red face cards. Shuffle the 44-card Dungeon. Health starts/caps at 20.
- **Cards:** Clubs/spades are monsters (2–10; J=11, Q=12, K=13, A=14). Diamonds are weapons; hearts are potions (both 2–10).
- **Rooms:** Reveal four. Flee: return them to Dungeon bottom; never consecutively. Otherwise resolve three in any order; retain the fourth for next room.
- **Weapons:** Replace weapons, discarding their attached monsters. Combat damage is `max(0, monster − weapon)`; attach the defeated monster. Subsequent targets must be ≤ the previous attached monster. Barehanded combat costs full monster value; discard that monster.
- **Potions:** Heal their value; discard. Only one heals per turn; discard extras.
- **Ending/scoring:** Die at health ≤0; subtract remaining Dungeon monsters’ values from health. Clear Dungeon: score health; at 20, add the final potion’s value if it was the last card.

### Implementation Clarifications

The engine uses these explicit interpretations of the original rules:

- Weapon targets may have equal or lower value than the last monster slain with that weapon (`≤`). This follows the PDF’s parenthetical wording where its prose is inconsistent.
- Resolving three cards ends a turn and automatically refills the room, carrying its fourth card forward. When the draw pile is empty, continue resolving the remaining cards; a three-card turn still resets the potion allowance. Victory requires clearing both the draw pile and room.
- Flee only before resolving any card in a full four-card room. Return cards to the bottom in their current order without shuffling. Resolve the following room before fleeing again.
- Loss scoring includes unresolved face-up room monsters and monsters in the draw pile. Retain negative health when calculating the score. Death takes precedence if the final combat also clears the dungeon.
- A potion taken at full health consumes the turn’s healing allowance. The final-potion scoring bonus follows the final card’s identity, including a potion discarded after the allowance was used.

These decisions are covered by rule tests and can be revised explicitly if we choose a different variant.

## Game Engine

`src/game/index.ts` exports the React-independent API:

- `createDeck()` creates all 44 cards with stable IDs such as `spades-14` and `diamonds-10`. Artwork is associated using these IDs; the engine stores only card identity, kind, suit, and value.
- `shuffleDeck(deck, random?)` returns a shuffled copy. Randomness lives outside the state machine and can be injected for reproducible deals.
- `createInitialState()` returns the `ready` state. `gameReducer(state, action)` supports `start`, `resolve`, `flee`, and `reset`, and is suitable for React’s `useReducer`.
- Start (or restart) with `{ type: 'start', deck: shuffleDeck(createDeck()) }`. Start validates a complete standard Scoundrel deck and deals the first room automatically.
- Resolve a card with `{ type: 'resolve', cardId }`; monsters require `combat: 'barehanded'` or `combat: 'weapon'`.
- `getLegalActions(state)`, `canFlee(state)`, and `canUseWeapon(state, monster)` support UI affordances. Start/reset are lifecycle actions rather than room actions.
- `applyAction(state, action)` returns `{ ok, state, error? }` for validation feedback. Rejected actions preserve the original state; the reducer adapter returns that unchanged state.

States progress from `ready` to `playing`, then `won` or `lost`; `start` restarts from any state and `reset` returns to `ready`. Terminal states retain the board and final score for a results view. Transitions return new state without mutating their inputs. Treat exported readonly states and cards as immutable; this API accepts typed application actions, not untrusted network/save data.

## Workspace Placement

Personal project at `/Users/elikennedy/projects/personal/scoundrel`, backed by a private GitHub repository: https://github.com/elikennedy/scoundrel.

## Stack

React, TypeScript, Vite, and Oxlint. Use Node.js 24 LTS and npm. The npm lockfile is committed.

## Local Development

- `npm ci`: install locked dependencies.
- `npm run dev`: start the local development server.
- `npm run build`: type-check and build production assets into `dist/`.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run static checks.
- `npm test`: type-check and run rule tests with Node.js 24’s built-in TypeScript support and test runner (no additional test dependencies).

## Environment And Secrets

No environment variables, secrets, backend, or local services are required. Real `.env` files must remain untracked. Browser-exposed variables must never contain secrets.

## Important Files

- `src/game/`: pure TypeScript cards, state transitions, and legal-action helpers.
- `tests/game.test.ts`: rule scenarios and complete simulated games.
- `src/App.tsx`: game lifecycle, room rendering, action announcements, and results.
- `src/components/RoomCard.tsx`: accessible card controls and combat previews.
- `src/components/CardFace.tsx`: fixed card template and crop defaults.
- `src/components/cardIllustrations.ts`: names and artwork metadata keyed by stable card ID.
- `public/art/`: runtime card illustrations, dungeon backdrop, and card back.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`: product constraints and visual design contract.
- `docs/card-art-direction.md`: art style, asset brief, naming, and generation workflow from the user’s reference.
- `src/components/GameSidebar.tsx`: health, weapon limits, and card counts.
- `src/components/cardPresentation.ts`: card display names.
- `src/index.css` and `src/App.css`: visual styles.
- `src/main.tsx`: React mounting.
- `vite.config.ts`: build configuration.
- `AGENTS.md`: tracked guidance for future agents.

## Registry Notes

Registered in the workspace PocketBase `projects` collection with `work=false`, `git_sync_mode=github`, and controlled Game, react, typescript, and vite tags. PocketBase is metadata only; the game does not depend on it at runtime. Prefer Context7 MCP for technical documentation.

## Current Objective

Playtest the illustrated interface and refine artwork crops where needed.

## Known Unknowns

The original rules and chosen interpretations are documented above. Deployment target and save-game behavior remain undecided. Art direction and the completed 44-card artwork run are documented.

## Next Steps

1. Playtest the complete illustrated deck and refine any artwork or crops.
2. Decide save-game behavior and deployment target.
3. Continue playtesting balance and accessibility on small screens.

## Interface Notes

The interface is a candlelit dungeon card table with generated surroundings and a generated deck back. Existing bronze card frames and parchment nameplates remain; cards have detached action buttons, no type badges, and no visible playing-card subtitles. Value/type icons and screen-reader identities retain clear semantics. Monster art aligns to the top so heads remain visible. Four desktop columns become two below 760px, with explicit narrow-grid width constraints.

Health, the equipped weapon illustration and target limit, healing availability and draw/discard counts sit below the room. Native buttons retain damage/healing previews, unavailable states, action announcements, and focus management. The rules panel and creator credits remain available. The ready screen presents the deck and a start action.

Design contract: [DESIGN.md](DESIGN.md). New generated UI art and full prompts: [UI generation provenance](docs/art/ui-generation-2026-10-24.json), with original PNGs in `docs/art/ui-originals/` and runtime WebP files in `public/art/ui/`.

Validation: lint and production build; all 14 engine tests; desktop and mobile visual checks; browser smoke checks for start, equip, weapon combat, weapon-limit updates, healing, and automatic room advancement. Screenshots are in `docs/ui-review/`.

The [card art direction](docs/card-art-direction.md) preserves the supplied sample and specifies a consistent dark fantasy style. Generate illustrations without text or borders; the app supplies those elements. All 44 playable cards now have generated artwork; original images and prompts are retained in `docs/art/`. See the [full-deck generation log](docs/art/full-deck-run-2026-10-24.md) for provenance and desktop/mobile review.

The [card art catalogue](docs/card-catalogue.md) records the user-defined names and illustration concepts for all four suits, including eight reserved red face-card/ace concepts outside the current 44-card game. It supersedes the reference’s provisional names; all playable identities and illustrations are connected. The eight reserved concepts have no generated assets and remain outside the deck.
