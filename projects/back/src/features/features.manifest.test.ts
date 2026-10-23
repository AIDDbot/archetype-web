import { expect, test } from "vite-plus/test";
import { registerFeatures } from "./features.manifest.ts";
test("registers the about endpoint with composition identity", () => {
  const identity = {
    displayName: "Example",
    description: "Description",
    version: "1",
    author: { name: "Author", url: "https://example.com" },
  };
  expect(registerFeatures(identity)[0]?.routes[0]?.path).toBe("/about");
});
