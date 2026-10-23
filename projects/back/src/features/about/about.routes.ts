import type { Feature } from "#shared/http/feature.contract.ts";
import type { Identity } from "#shared/identity.type.ts";
export const projects = [
  {
    name: "back",
    type: "api",
    technologies: ["TypeScript", "Node.js", "Express", "SQLite", "Vite+", "Vitest"],
  },
  {
    name: "front",
    type: "web",
    technologies: ["TypeScript", "React", "Vite", "react-router", "Pico CSS", "Vite+", "Vitest"],
  },
  {
    name: "e2e",
    type: "e2e",
    technologies: ["TypeScript", "Node.js", "Playwright", "Chromium", "tree-kill"],
  },
];
export function registerAbout(identity: Identity): Feature {
  const answer = {
    name: identity.displayName,
    description: identity.description,
    version: identity.version,
    author: identity.author,
    projects,
  };
  return {
    migrations: [],
    routes: [
      {
        method: "get",
        path: "/about",
        public: true,
        handler: (_request, response) => response.json(answer),
      },
    ],
  };
}
