# AGENTS.md

## Project Intent

Build Scoundrel, a single-player dungeon-crawling card game playable in the browser. This is a newly bootstrapped personal app; gameplay remains to be implemented.

## Workspace Context

Canonical directory: `/Users/elikennedy/projects/personal/scoundrel`. Follow the parent workspace AGENTS.md, CONSTITUTION.md, and STANDARDS.md at `/Users/elikennedy/projects`. This project is classified as personal and does not depend on the control plane at runtime. Prefer the Context7 MCP tool interface for library documentation.

## Structure

- `src/App.tsx`: application shell.
- `src/main.tsx`: React entry point.
- `src/App.css`, `src/index.css`: styling.
- `vite.config.ts`, `tsconfig*.json`: build and TypeScript configuration.
- `README.md`: status, commands, and next steps.

Keep the eventual rules engine in pure TypeScript, separate from React rendering. Verify the original rules and credit their creators before implementing or copying game material. Do not assume a rules variant without documenting it.

## Run And Build

Use Node.js 24 LTS and npm. Install with `npm ci`; develop with `npm run dev`; validate with `npm run lint` and `npm run build`; preview with `npm run preview`. No test runner is configured yet. Add meaningful rule tests when implementing gameplay.

## Registry Relationship

Maintain the PocketBase `projects` record whose directory is this project's absolute path. Use pocketbase-mcp, not direct SQLite access. Preserve `work=false`, `is_git_repo=true`, `git_sync_mode=github`, and controlled Game/react/typescript/vite tags. Update registry metadata if the folder or Git backing changes.

## Git And Secrets

Private GitHub backing: https://github.com/elikennedy/scoundrel. Use `main` as the initial branch. This AGENTS.md is intentionally tracked. Commit the npm lockfile; exclude dependencies, builds, caches, logs, and real environment files. Maintain `.env.example` if configuration becomes necessary. Never place secrets in browser code.

## Guardrails

Preserve the personal classification and Vite/React/TypeScript stack. Keep documentation truthful as implementation evolves. Make browser interactions accessible by keyboard and usable on small screens. Avoid adding backend services until a concrete feature requires them.
