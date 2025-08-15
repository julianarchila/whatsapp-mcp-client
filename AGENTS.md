# Agent Guidelines for whatsapp-mcp-client

This document outlines the essential commands and code style guidelines for agents operating within this repository.

## Build, Lint, and Test Commands

- **Build All Projects:** `turbo run build`
- **Type Check All Projects:** `turbo run check-types`
- **Lint Web Application:** `pnpm --filter web lint` (or `next lint` within `apps/web`)
**Run Single Test:** Use one of the following commands:
- **All workspaces:** `npm test` (runs `pnpm -r run test` across all packages)
- **Web app only:** `cd apps/web && npm test`

## Code Style Guidelines

- **Language:** TypeScript is preferred for all new code.
- **Typing:** Adhere to strict TypeScript typing (`"strict": true` in `tsconfig.json`).
- **Formatting:** Follow ESLint rules enforced by `next lint`. Use consistent indentation (2 spaces, if not already set by prettier/eslint), brace style, and spacing.
- **Imports:** Use absolute imports with `@/` for `src` and `@env` for `env.ts`. Group imports: external libraries first, then internal modules, separated by blank lines.
- **Naming Conventions:**
    - Variables: `camelCase`
    - Functions: `camelCase`
    - Classes/Components: `PascalCase`
    - Constants: `UPPER_SNAKE_CASE`
- **Error Handling:** Use `neverthrow` blocks for asynchronous operations and potential runtime errors. Propagate errors appropriately.
- **Comments:** Add comments sparingly, focusing on *why* complex logic exists, not *what* it does.

## Cursor/Copilot Rules

No specific Cursor or Copilot rule files were found in the repository.
