# Archetype Web

An archetype of [AIDDbot](https://github.com/AIDDbot/AIDDbot): a whole web solution with an API, browser screens, user accounts and their settings, and its acceptance suite, with no business feature. It is built with the [Archetype Builder](https://github.com/AIDDbot/archetype-builder). AIDDbot copies the whole workspace into a new system, and the system grows from it. `.product/` holds the shipped foundation specs, `S0001` to `S0007`, and the schema documents: the first business spec of a system is `S0008`.

| Folder | Project type | Technology |
| --- | --- | --- |
| [`projects/back/`](./projects/back/) | `api` | TypeScript on Node.js, Express, SQLite |
| [`projects/front/`](./projects/front/) | `web` | TypeScript on Vite, React with react-router, the brand theme on Pico CSS |
| [`projects/e2e/`](./projects/e2e/) | `e2e` | Playwright with Chromium |

Common tooling: npm workspaces and [Vite+](https://viteplus.dev) (format, lint, type check, Vitest, and the `vp staged` pre-commit hook). The debt checks are in `tools/lint/`, and the longer root scripts in `tools/scripts/`.

## Identity

Put the identity of your system in the `package.json` of each project that shows it: `displayName`, `description`, `author` (`name`, `url`) and `version`. The root has no identity.

## Run

Requirements: Node.js 26 or later, and Git.

```sh
npm install
npm run check
npm test
```

`npm install` runs `prepare`, which installs the pre-commit hook. `npm start` starts the `back` and the `front` in parallel. `npm test` runs the unit tests of each project but the `e2e`, and `npm run test:e2e` runs the acceptance tests. `npm run check` checks the whole repository with no fix: format, lint and types, and `layers` and `crap` of each project (with the unit tests and their coverage); each step runs also after a red one, and the last line gives each red step; `npm run fix` applies the safe fixes. `npm run upgrade` raises each dependency of the root and of each project to its latest version. In each project: `npm test`, `npm run layers` (import boundaries) and `npm run crap` (complexity and coverage).

## Changes

Changes pass the archetype gate of the Builder (`handover.md`).

## License

[MIT](./LICENSE)
