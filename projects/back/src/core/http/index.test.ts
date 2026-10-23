import { expect, test } from "vite-plus/test";
import { routeIndex, indexHandler, notFoundHandler } from "./index.middleware.ts";
import { createRouteFake } from "#shared/http/route.contract.ts";
test("lists registrations and returns index and not-found bodies", () => {
  const features = [
    {
      routes: [{ method: "get" as const, path: "/sample", handler: (): void => {} }],
      migrations: [],
    },
  ];
  expect(routeIndex(features)).toEqual([{ method: "GET", path: "/api/sample" }]);
  const fake = createRouteFake({ body: undefined, params: {}, query: {}, headers: {} });
  indexHandler(features)(fake.request, fake.response);
  expect(fake.result().body).toEqual({ routes: [{ method: "GET", path: "/api/sample" }] });
  notFoundHandler(fake.request, fake.response);
  expect(fake.result()).toMatchObject({ status: 404, body: { error: "Not found" } });
});
