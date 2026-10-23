# Scoundrel

A personal browser adaptation of the solitaire dungeon-crawling card game Scoundrel.

## Status

Bootstrapped on 24 October 2026 with Vite, React, and TypeScript. The development foundation is runnable; gameplay is not implemented yet.

## Purpose

Build a single-player browser game with room exploration, monsters, weapons, health potions, and a clear win/loss flow.

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
- Tests: no test runner configured yet; add focused game-rule tests alongside the engine.

## Environment And Secrets

No environment variables, secrets, backend, or local services are required. Real `.env` files must remain untracked. Browser-exposed variables must never contain secrets.

## Important Files

- `src/App.tsx`: application entry screen.
- `src/index.css` and `src/App.css`: visual styles.
- `src/main.tsx`: React mounting.
- `vite.config.ts`: build configuration.
- `AGENTS.md`: tracked guidance for future agents.

## Registry Notes

Registered in the workspace PocketBase `projects` collection with `work=false`, `git_sync_mode=github`, and controlled Game, react, typescript, and vite tags. PocketBase is metadata only; the game does not depend on it at runtime. Prefer Context7 MCP for technical documentation.

## Current Objective

Implement and validate the Scoundrel rules engine, then connect it to an accessible browser interface.

## Known Unknowns

Exact rules variant and attribution requirements should be verified against the original rules before implementation. Deployment target, art direction, and save-game behavior remain undecided.

## Next Steps

1. Verify and document the original rules and attribution.
2. Implement a pure TypeScript engine with tests for deck composition, combat, healing, fleeing, and end conditions.
3. Build responsive card interactions and a restart flow.
