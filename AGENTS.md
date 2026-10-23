# AGENTS.md

## Project Intent

Build Scoundrel, a single-player dungeon-crawling card game playable in the browser. This is a newly bootstrapped personal app; the pure TypeScript game engine and playable React interface are implemented; unique artwork and catalogue names are connected for all 44 playable cards.

## Workspace Context

Canonical directory: `/Users/elikennedy/projects/personal/scoundrel`. Follow the parent workspace AGENTS.md, CONSTITUTION.md, and STANDARDS.md at `/Users/elikennedy/projects`. This project is classified as personal and does not depend on the control plane at runtime. Prefer the Context7 MCP tool interface for library documentation.

## Structure

- `src/game/`: React-independent cards, state machine, and action validation.
- `tests/game.test.ts`: rule tests and deterministic complete-game simulations.
- `src/App.tsx`: gameplay screen, lifecycle, announcements, and focus management.
- `src/components/`: room cards, adventurer status, and presentation helpers.
- `src/components/cardIllustrations.ts`: catalogue names, local artwork paths, and optional crop overrides.
- `public/art/cards/`, `public/art/ui/`: runtime WebP illustrations, backdrop, and deck back.
- `docs/art/`: retained originals, prompts, and generation provenance.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`: product constraints and the visual design contract.
- `src/main.tsx`: React entry point.
- `src/App.css`, `src/index.css`: styling.
- `vite.config.ts`, `tsconfig*.json`: build and TypeScript configuration.
- `README.md`: status, commands, and next steps.

Keep the rules engine in pure TypeScript, separate from React rendering. Verify the original rules and credit their creators before implementing or copying game material. Do not assume a rules variant without documenting it.

## Run And Build

Use Node.js 24 LTS and npm. Install with `npm ci`; develop with `npm run dev`; validate with `npm run lint` and `npm run build`; preview with `npm run preview`. Run `npm test` for strict engine/test type-checking and Node.js 24 built-in rule tests. Keep meaningful rule tests alongside engine changes. The chosen rule interpretations are documented in README.md.

## Registry Relationship

Maintain the PocketBase `projects` record whose directory is this project's absolute path. Use pocketbase-mcp, not direct SQLite access. Preserve `work=false`, `is_git_repo=true`, `git_sync_mode=github`, and controlled Game/react/typescript/vite tags. Update registry metadata if the folder or Git backing changes.

## Git And Secrets

Private GitHub backing: https://github.com/elikennedy/scoundrel. Use `main` as the initial branch. This AGENTS.md is intentionally tracked. Commit the npm lockfile; exclude dependencies, builds, caches, logs, and real environment files. Maintain `.env.example` if configuration becomes necessary. Never place secrets in browser code.

## Guardrails

Preserve the personal classification and Vite/React/TypeScript stack. Keep documentation truthful as implementation evolves. Make browser interactions accessible by keyboard and usable on small screens. Preserve the user-approved bronze/parchment card faces, detached action buttons, and top-aligned monster artwork. Avoid reintroducing visible card type badges or identity subtitles. Avoid adding backend services until a concrete feature requires them.
