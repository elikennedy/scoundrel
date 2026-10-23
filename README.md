# Scoundrel

A personal, single-player browser adaptation of the dungeon-crawling card game by Zach Gage and Kurt Bieg. Built with React, TypeScript and Vite; the rules engine is independent of React.

## Current state

The desktop game is playable with all 44 illustrated cards, weapons, healing, fleeing and scoring. Bronze image controls, a face-up discard fan, animated dealing/carryover/returns, and illustrated outcome dialogs form the game table. The full-screen How to Play guide includes rules, tactics, scoring, a combat comparison and an isolated practice room.

Keyboard interaction and reduced motion are supported. Mobile layouts are outside the current scope. There is no runtime backend, saved-game persistence or deployment configuration.

## Run and validate

Use Node.js 24 LTS and npm. Install dependencies with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Strict engine/test type-checking and 14 rule/simulation tests |
| `npm run lint` | Static checks with Oxlint |
| `npm run build` | Type-check and build production assets into `dist/` |
| `npm run preview` | Preview the production build |

No environment variables, credentials or services are needed. Keep secrets out of browser code and real environment files out of Git; add `.env.example` if configuration is introduced.

## Documentation

- [Documentation map](docs/README.md): ownership and retention policy.
- [Rules and interpretations](docs/rules.md): the game contract and credited original source.
- [Architecture and validation](docs/architecture.md): engine API, animation lifecycle and UI checks.
- [PRODUCT.md](PRODUCT.md): confirmed product scope and open decisions.
- [DESIGN.md](DESIGN.md): current visual and motion contract; `.impeccable/design.json` extends it.
- [Artwork index](docs/art/README.md): runtime/source assets, exact prompts and archived variants.
- [Guide research](docs/guide/research.md): sources, limitations and worked examples.
- [AGENTS.md](AGENTS.md): project-local operating instructions.

## Important source

`src/game/` contains the rules; `tests/game.test.ts` validates them. `src/App.tsx` coordinates the live table and dialogs. `src/components/` contains cards, status, piles, motion and How to Play. Artwork mappings are in `cardIllustrations.ts`; runtime art is under `public/art/` and retained originals under `docs/art/`.

## Workspace and Git

Canonical directory: `/Users/elikennedy/projects/personal/scoundrel`. Private GitHub backing: [elikennedy/scoundrel](https://github.com/elikennedy/scoundrel), branch `main`. This is a personal project. The PocketBase registry is metadata only, never a runtime dependency; update it if the directory or Git backing changes.

## Next decisions

Continue desktop playtesting, especially keyboard use, endgames and the illustrated guide. Deployment and saved-game behaviour remain undecided. Do not introduce a backend without a concrete feature requiring one.
