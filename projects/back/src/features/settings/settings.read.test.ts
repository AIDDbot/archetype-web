import { expect, test } from "vite-plus/test";
import { readPreferences } from "./settings.read.ts";
test("reads every preference option and collects both invalid fields", () => {
  for (const theme of ["system", "light", "dark"]) {
    for (const dateFormat of ["locale", "iso"]) {
      expect(readPreferences({ theme, dateFormat })).toEqual({ theme, dateFormat });
    }
  }
  expect(() => readPreferences({ theme: "invalid", dateFormat: "invalid" })).toThrow(
    expect.objectContaining({
      fields: {
        theme: "theme must be system, light or dark",
        dateFormat: "dateFormat must be locale or iso",
      },
    }),
  );
});
