# front - web

## Purpose

- **Owns**: Browser screens.
- **Never**: Data persistence.

## Technology

- **Stack**: TypeScript 7; Node.js; React 19 and react-router 8; npm.
- **Dependencies**: react and react-dom - rendering; react-router - routing; @vitejs/plugin-react - Vite integration; @types/react and @types/react-dom - types; @picocss/pico and @fontsource/roboto, @fontsource/audiowide, @fontsource/anonymous-pro - visual base; workspace Vite+ - tooling.
- **Slots**: `test` `npm test`; `test:spec` n/a: no acceptance tests; `start` `npm start`; `layers` `npm run layers`; `crap` `npm run crap`; `upgrade` `npm --prefix ../.. run upgrade`.

## Folders

| Concept | Path | Mechanism |
| --- | --- | --- |
| composition | `src/app.main.tsx`, `src/features/features.manifest.ts`, `src/core/lifecycle/app.compose.tsx` | Explicit registrations |
| `core` | `src/core/{concern}/{topic}.{role}.ts`; folders: lifecycle, settings, logging, http, shell, theme, session | React |
| features | `src/features/{feature}/` | Pages |
| facade | `{feature}.api.ts` | Calls logic |
| presentation / logic / data / types | `*.routes.tsx`, `*.page.tsx`, `*.component.tsx` / `*.store.ts` / `*.client.ts` / `*.type.ts` | Explicit route objects |
| `shared` | `src/shared/{concern}/`; folders: values, state, http, logging, components, session; index: `src/shared/README.md` | Plain modules |
| services of core | React contexts; contracts in shared concern folders | Dependency injection |
| imports out of a folder | `#shared/*`, `#core/*` for core and composition, `#api/*` for facades | Package imports |
| unit tests | Beside the module, `*.test.ts` | Vite+ Vitest |

## Platform

- **Needs**: back. **Gives to**: Browser users and e2e.
- `src/core/lifecycle/`: StrictMode startup, session restore, explicit shell router composition and service injection into route loaders.
- `src/core/theme/`: Brand styles and tokens; one theme store: the account theme with a session, else the stored light or dark selection or the system preference, set before rendering.
- `src/core/shell/`: Access marks for routes and menu links, session menu controls, page service injection and not-found page.
- **Port**: 4000, strict, all interfaces. **Variables**: `PORT=4000`, `API_BASE_URL=http://localhost:3000`; Vite `loadEnv` reads optional project `.env`.
- `src/core/settings/`: Checked environment reader, port and API URL.
- `src/core/http/`: Runtime configuration middleware for development and preview; HTTP client reads the runtime address, sends the stored bearer token and maps API errors.
- `src/core/session/`: Browser token storage adapter, access selection, registered local return targets, route loader access checks, and the preferences of the account loaded at each session change through the registered preference source.
- `src/core/logging/`: Console action logger; page and theme services for the shell.

- API_BASE_URL has 1 to 4096 characters after trimming and must be an absolute HTTP or HTTPS URL.

## Project rules

- React function components and hooks; explicit data-mode react-router routes.
- Semantic HTML uses Pico CSS and the Bedrock theme.
- The manifest supplies the pages, menu links and home cards to the composition. Each page and menu link has an access mark. Optional route loaders get path parameters and start data work before a page renders. Home card loaders use the same service contract.
- `shared/components/`: Typed descriptions prepare record cards, details, tables, forms and data states in `.ts` modules. Components render the prepared values. `records.css` gives the card grid with theme tokens.


