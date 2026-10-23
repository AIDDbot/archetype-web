# back — api

## Purpose

- **Owns**: Data and the HTTP API.
- **Never**: Browser screens.

## Technology

- **Stack**: TypeScript 7; Node.js; Express 5; npm.
- **Dependencies**: express — HTTP framework; @types/express — framework types; workspace Vite+ — checks and tests.
- **Slots**: `test` `npm test`; `test:spec` n/a: no acceptance tests; `start` `npm start`; `layers` `npm run layers`; `crap` `npm run crap`; `upgrade` `npm --prefix ../.. run upgrade`.

## Folders

| Concept | Path | Mechanism |
| --- | --- | --- |
| composition | `src/app.main.ts`, `src/features/features.manifest.ts`, `src/core/lifecycle/app.compose.ts` | Explicit registrations |
| `core` | `src/core/{concern}/{topic}.{role}.ts`; folders: lifecycle, settings, logging, http, database, session | Express |
| features | `src/features/{feature}/` | Endpoints |
| facade | `{feature}.api.ts` | Calls logic |
| presentation / logic / data / types | `*.routes.ts`, `*.controller.ts` / `*.service.ts` / `*.repository.ts` / `*.type.ts` | Express Router |
| `shared` | `src/shared/{concern}/`; folders: values, database, logging, http, session; index: `src/shared/README.md` | Plain modules |
| services of core | Registration arguments; contracts in shared concern folders | Dependency injection |
| imports out of a folder | `#shared/*`, `#core/*` for core and composition, `#api/*` for facades | Package imports |
| unit tests | Beside the module, `*.test.ts` | Vite+ Vitest |

## Platform

- **Needs**: Node.js. **Gives to**: front and e2e.
- `src/core/lifecycle/`: Composition, feature service connections, validated startup, signal registration and request/log/database shutdown.
- `src/core/settings/`: Environment definitions and checks before startup.
- `src/core/logging/`: Queued daily plain text files, severity filter and standard error fallback.
- `src/core/database/`: File SQLite adapter and ordered transactional migrations in `migrations(version, appliedAt)`.
- `src/core/session/`: Salted scrypt password adapter, random tokens, and request session guard.
- `src/core/http/`: CORS, security headers, request identifiers, body limits, request logs and expected error answers.
- `src/core/http/`: Explicit route registrations under `/api`, route index and JSON not-found answer.
- **Port**: 3000. **Variables**: `PORT=3000`, `HOST=0.0.0.0`, `DATABASE_URL=./data/app.sqlite`, `CORS_ORIGIN=*`, `LOG_DIR=./logs`, `LOG_LEVEL=info`, `BODY_LIMIT_KB=100`. Optional project `.env`; paths start at the project folder.

- Text settings: HOST has 1 to 253 characters; DATABASE_URL, LOG_DIR and CORS_ORIGIN have 1 to 4096 characters after trimming.
- `SESSION_TTL_HOURS=24`: Integer from 1 to 720.

## Project rules

- Express 5 uses ES modules and async handlers.
- Node.js supplies SQLite; no database package.
- `shared/http/`: `readFields` returns the typed result of field readers and collects each field error; `readPage` reads bounded list parameters. `PageAnswer` defines list answers.
