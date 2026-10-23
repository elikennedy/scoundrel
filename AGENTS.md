# AGENTS.md

## Project Intent

Build Scoundrel, a single-player dungeon-crawling card game playable in the browser. This is a playable desktop personal app; the pure TypeScript game engine and playable React interface are implemented; unique artwork and catalogue names are connected for all 44 playable cards.

## Workspace Context

Canonical directory: `/Users/elikennedy/projects/personal/scoundrel`. Follow the parent workspace AGENTS.md, CONSTITUTION.md, and STANDARDS.md at `/Users/elikennedy/projects`. This project is classified as personal and does not depend on the control plane at runtime. Prefer the Context7 MCP tool interface for library documentation.

## Structure

- `src/game/`: React-independent cards, state machine, and action validation.
- `tests/game.test.ts`: rule tests and deterministic complete-game simulations.
- `src/App.tsx`: gameplay screen, lifecycle, announcements, and focus management.
- `src/components/`: room cards, status, discard fan, cancellable card motion and the illustrated How to Play guide.
- `src/components/cardIllustrations.ts`: catalogue names, local artwork paths, and optional crop overrides.
- `public/art/cards/`, `public/art/ui/`: selected runtime card/UI assets, including the backdrop, deck back and control sprites.
- `docs/README.md`: documentation map and retention policy.
- `docs/rules.md`, `docs/architecture.md`: rule interpretations, engine API and presentation lifecycle.
- `docs/art/`: retained originals, exact prompts, selected export mappings and provenance.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`: product constraints and the visual design contract.
- `src/main.tsx`: React entry point.
- `src/App.css`, `src/index.css`: styling.
- `vite.config.ts`, `tsconfig*.json`: build and TypeScript configuration.
- `README.md`: status, commands, and next steps.

Keep the rules engine in pure TypeScript, separate from React rendering. Verify the original rules and credit their creators before implementing or copying game material. Do not assume a rules variant without documenting it.

## Run And Build

Use Node.js 24 LTS and npm. Install with `npm ci`; develop with `npm run dev`; validate with `npm run lint` and `npm run build`; preview with `npm run preview`. Run `npm test` for strict engine/test type-checking and Node.js 24 built-in rule tests. Keep meaningful rule tests alongside engine changes. The chosen rule interpretations are documented in `docs/rules.md`; validation guidance is in `docs/architecture.md`.

## Registry Relationship

Maintain the PocketBase `projects` record whose directory is this project's absolute path. Use pocketbase-mcp, not direct SQLite access. Preserve `work=false`, `is_git_repo=true`, `git_sync_mode=github`, and controlled Game/react/typescript/vite tags. Update registry metadata if the folder or Git backing changes.

## Git And Secrets

Private GitHub backing: https://github.com/elikennedy/scoundrel. Use `main` as the initial branch. This AGENTS.md is intentionally tracked. Commit the npm lockfile; exclude dependencies, builds, caches, logs, and real environment files. Maintain `.env.example` if configuration becomes necessary. Never place secrets in browser code.

## Guardrails

Preserve the personal classification and Vite/React/TypeScript stack. Keep documentation truthful as implementation evolves. The current product is desktop only by explicit user request; do not add mobile layout work by default. Keep keyboard operation and reduced motion. Preserve the user-approved bronze/parchment card faces, contextual image actions over cards on hover/focus, and top-aligned monster artwork. Avoid reintroducing visible card type badges or identity subtitles. Keep game-over dismissal limited to Play again; the guide may close with Return or Escape. Avoid adding backend services until a concrete feature requires them.

Use the Impeccable plugin and its current skill workflow for frontend design work. Preserve the confirmed product and design contract; do not copy machine-specific plugin paths into project instructions. Put temporary review captures under ignored `.impeccable/review/`. Retain original art and prompts, but remove duplicate logs and superseded runtime exports after confirming their selected replacements.
