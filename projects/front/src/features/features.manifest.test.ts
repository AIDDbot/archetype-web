import { expect, test } from "vite-plus/test";
import { features, registerFeatures } from "./features.manifest.ts";
test("registers the home and gives it the cards of each feature", () => {
  const identity = {
    displayName: "Test app",
    description: "Test description",
    version: "1.0.0",
    author: { name: "Author", url: "https://example.com" },
  };
  const feature = {
    pages: [],
    links: [],
    cards: [{ path: "/example", title: "Example", description: "Example card" }],
  };
  features.push(feature);
  const registrations = registerFeatures(identity);
  features.pop();
  expect(registrations[0]?.links).toContainEqual({ path: "/", label: "Home", access: "everyone" });
  expect(registrations).toContain(feature);
});
