# Archetype Web

Welcome. This is a web system that is ready on its first day. Out of the box, you get an API, the browser screens, user accounts with their settings, and an acceptance suite that proves each of them. It has no business feature yet. That part is yours.

It comes from [AIDDbot](https://github.com/AIDDbot/AIDDbot), a set of agent skills that copies this workspace into each new web system. But you can also use it on your own.

- [What it does](./.product/PRD.md): the features, each one with its spec.
- [How it is made](./.product/system.md): the projects, the technology and the technical decisions.

## Start

Requirements: Node.js 26 or later, and Git.

> [!NOTE]
> This workspace is built on the [Vite+](https://viteplus.dev/) toolchain.

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

## Make it yours

> [!TIP]
> Give the app its name, and sign it as yours.

- Put your identity in `projects/back/package.json` and `projects/front/package.json`: `displayName`, `description`, `author` and `version`.
- The [`.product/`](./.product/) folder has the foundation specs and the schema documents.
- With [AIDDbot](https://github.com/AIDDbot/AIDDbot), your first business spec is `S0008`.

---

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
