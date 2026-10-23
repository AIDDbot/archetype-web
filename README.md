# Archetype Web

A whole web solution to start from: an API, browser screens, user accounts and their settings, with an acceptance suite. It has no business feature.

[AIDDbot](https://github.com/AIDDbot/AIDDbot) copies this workspace into each new web system. You can also use it on your own.

## Projects

| Folder | Type | Technology |
| --- | --- | --- |
| [`projects/back/`](./projects/back/) | `api` | Node.js, Express, SQLite |
| [`projects/front/`](./projects/front/) | `web` | Vite, React, react-router, Pico CSS |
| [`projects/e2e/`](./projects/e2e/) | `e2e` | Playwright with Chromium |

All in TypeScript, in one npm workspace with [Vite+](https://viteplus.dev).

## Start

Requirements: Node.js 26 or later, and Git.

```sh
npm install   # also installs the pre-commit hook
npm start     # back on http://localhost:3000, front on http://localhost:4000
```

## Check

```sh
npm test           # unit tests
npm run test:e2e   # acceptance suite
npm run check      # format, lint, types, layers and complexity, with no fix
npm run fix        # apply the safe fixes
```

Each commit passes the pre-commit hook: format, lint, types and the affected unit tests.

## Update

```sh
npm run upgrade    # each dependency to its latest version
```

Then run `npm run check` and `npm run test:e2e` again.

## Your system

- Put your identity in `projects/back/package.json` and `projects/front/package.json`: `displayName`, `description`, `author` and `version`.
- `.product/` has the foundation specs (`S0001` to `S0007`) and the schema documents. Your first business spec is `S0008`.

## Changes

Changes pass the archetype gate of the [Archetype Builder](https://github.com/AIDDbot/archetype-builder) (`handover.md`).

## About

- **Author**: [Alberto Basalo](https://albertobasalo.dev)
- **Socials**:
  - [X](https://x.com/albertobasalo)
  - [LinkedIn](https://www.linkedin.com/in/albertobasalo/)
  - [GitHub](https://github.com/albertobasalo)
- **Cursos en Español**: [AI code Academy](https://aicode.academy)
- **AIDDbot.com**: [AIDDbot.com](https://aiddbot.com)
- **The main Repository for AIDDBot**: [AIDDbot](https://github.com/AIDDbot/AIDDbot)

## License

[MIT](./LICENSE)
