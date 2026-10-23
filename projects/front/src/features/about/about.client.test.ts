import { expect, test } from "vite-plus/test";
import { createAboutData } from "./about.client.ts";
test("reads the API answer and maps failed answers to unavailable", async () => {
  const about = {
    name: "Example",
    description: "Description",
    version: "1",
    author: { name: "Author", url: "https://example.com" },
    projects: [],
  };
  const paths: string[] = [];
  const data = createAboutData({
    request: async (request) => {
      paths.push(request.path);
      return about;
    },
  });
  expect(await data.load()).toEqual(about);
  expect(paths).toEqual(["/api/about"]);
  const failed = createAboutData({
    request: async () => {
      throw new Error("Offline");
    },
  });
  expect(await failed.load()).toBeNull();
});
