import { expect, test } from "vite-plus/test";
import { registerAbout, projects } from "./about.routes.ts";
import { createRouteFake } from "#shared/http/route.contract.ts";
test("answers with composition identity and each project", () => {
  const identity = {
    displayName: "Example",
    description: "Description",
    version: "1",
    author: { name: "Author", url: "https://example.com" },
  };
  const fake = createRouteFake({ body: undefined, params: {}, query: {}, headers: {} });
  registerAbout(identity).routes[0]?.handler(fake.request, fake.response);
  expect(fake.result()).toEqual({
    status: 200,
    body: {
      name: "Example",
      description: "Description",
      version: "1",
      author: identity.author,
      projects,
    },
  });
});
