import type { Author } from "#shared/identity.type.ts";
import type { Store } from "#shared/state/store.create.ts";
export type Project = { name: string; type: string; technologies: string[] };
export type About = {
  name: string;
  description: string;
  version: string;
  author: Author;
  projects: Project[];
};
export type AboutData = { load: () => Promise<About | null> };
export type AboutState = { status: "busy" | "ready" | "error"; about: About | null };
export type AboutStore = { state: Store<AboutState>; load: () => Promise<void> };
