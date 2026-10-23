# e2e - e2e

## Purpose

- **Owns**: Acceptance evidence through the API and browser screens.
- **Never**: Product implementation or direct database access.

## Technology

- **Stack**: TypeScript 7; Node.js; Playwright with Chromium; npm.
- **Dependencies**: @playwright/test - runner; tree-kill - process cleanup; workspace Vite+ - static checks.
- **Slots**: `test` `npm test`; `test:spec` `npm run test:spec --`; `start` `npm start`; `layers` `npm run layers`; `crap` `npm run crap`; `upgrade` `npm --prefix ../.. run upgrade`.

## Folders

| Concept | Path | Mechanism |
| --- | --- | --- |
| entry | `playwright.config.ts` | Playwright runner |
| `core` | `core/{concern}/`; folders: lifecycle, settings | Suite setup and teardown |
| features | `features/{feature}/` | One test for each requirement |
| `shared` | `shared/{concern}/`; folders: values, page-objects, test-data, projects; index: `shared/README.md` | Black-box helpers |
| imports out of a folder | `#shared/*`; no parent imports | Package imports |

## Platform

- **Needs**: back, front, Chromium. **Gives to**: Delivery verification.
- **Port**: None. **Variables**: `BACK_DIRECTORY=../back`, `FRONT_DIRECTORY=../front`, `BACK_START=npm start`, `FRONT_START=npm start`, `E2E_STARTUP_TIMEOUT_MS=30000`. Relative directories start at this project.
- `core/settings/`: Checked startup commands, directories and bounded timeout.
- `shared/projects/`: Public error body check.
- `shared/page-objects/`: Browser page locators and computed color contrast checks.
- Playwright starts each project with its start command and stops it after the suite. Readiness: the API listens on TCP port 3000; the browser serves `/` on port 4000.

- Directories and start commands have 1 to 4096 characters after trimming.

## Project rules

- Tag each requirement test with its global requirement ID.
- The runner owns the entry; no application lifecycle entry or unit tests.
- `shared/page-objects/`: Table and record readers, form fields by exact label and errors by accessible description, and held or failed API routes. Release held answers before removing their interception.


