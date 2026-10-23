import { expect, test } from "vite-plus/test";
import { createAboutStore } from "./about.store.ts";
import { readAbout } from "./about.read.ts";
import { aboutCard, aboutDetail, aboutState, aboutTable } from "./about.model.ts";
const about = {
  name: "Example",
  description: "Description",
  version: "1.2.3",
  author: { name: "Author", url: "https://example.com" },
  projects: [{ name: "back", type: "api", technologies: ["TypeScript", "Express"] }],
};
test("loads an about answer from data and clears stale facts while loading", async () => {
  const pending = Promise.withResolvers<typeof about | null>();
  const store = createAboutStore({ load: () => pending.promise });
  expect(store.state.read()).toEqual({ status: "busy", about: null });
  const loading = store.load();
  expect(store.state.read()).toEqual({ status: "busy", about: null });
  pending.resolve(about);
  await loading;
  expect(store.state.read()).toEqual({ status: "ready", about });
  const unavailable = createAboutStore({ load: async () => null });
  await unavailable.load();
  expect(unavailable.state.read()).toEqual({ status: "error", about: null });
});
test("reads each public about field", () => {
  expect(readAbout(about)).toEqual(about);
  expect(() => readAbout(null)).toThrow("Expected an object");
  expect(() => readAbout({ ...about, name: 1 })).toThrow("Expected text");
  expect(() => readAbout({ ...about, projects: {} })).toThrow("Expected a list");
});
test("prepares card, detail, table and each data state", () => {
  expect(aboutCard(about).facts).toEqual([
    { label: "Application", value: "Example" },
    { label: "Version", value: "1.2.3" },
  ]);
  expect(aboutDetail(about).sections[0]?.facts).toContainEqual({
    label: "Author",
    value: "Author",
  });
  expect(aboutDetail(about).sections[0]?.facts).toContainEqual({
    label: "Website",
    value: "https://example.com",
    link: { href: "https://example.com", label: "Website" },
  });
  expect(aboutTable(about).rows[0]?.cells.map((cell) => cell.value)).toEqual([
    "back",
    "api",
    "TypeScript, Express",
  ]);
  expect(aboutState({ status: "busy", about: null }).busy).toBe(true);
  expect(aboutState({ status: "ready", about }).dataHidden).toBe(false);
  expect(aboutState({ status: "error", about: null }).message).toBe("About unavailable");
});
