# Project instructions

## Assistant

- Use the OS and the shell that your harness gives. When it gives none, find them before the first command.
- **Talk** in the language of the human — **Documents** in ASD-STE100, in English — **Code** in English
- When a request is ambiguous or incomplete, ask one closed question at a time (yes/no or pick-one).

## System

- **Problem**: New web applications need a common foundation for an API, browser screens and user accounts.
- **Solution**: Archetype Web supplies the API, the browser screens, the user accounts and their settings, with no business feature.
- **Verification**: Unit tests prove the internal rules; the acceptance suite proves each requirement through the API and the browser.

| Project | Type | Path |
| --- | --- | --- |
| back | api | `projects/back/`, with its `AGENTS.md` |
| front | web | `projects/front/`, with its `AGENTS.md` |
| e2e | e2e | `projects/e2e/`, with its `AGENTS.md` |

- **Folders**: the product folder is `.product/` (system, specs, model, PRD); the source folders are the paths above.
- **Model**: `.product/model/model.schema.md`; `back.db.schema.md` and `back.api.schema.md` record the backend's physical shapes.
- `back` owns persistence and the API; `front` gets product data only from the API; `e2e` uses public interfaces.

## Commands

- `npm test` runs the unit tests, and `npm run test:e2e` runs the acceptance suite. `npm run check` checks format, lint, types, `layers` and `crap` with no fix, and `npm run fix` applies the safe fixes. `npm start` starts the `back` and the `front`.
- **Pre-commit hook**: `vp staged --relative` formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect. A failure stops the commit.

## Git

- MANDATORY: Preserve work; no secrets; no destructive commands.
- Conventional commits: `{feat|refactor|fix|chore|docs|test}(scope): {description}`. Work on a branch, never on `main`.
