import { expect, test } from "vite-plus/test";
import { openMemoryDatabase } from "#shared/database/database.open.ts";
import { migrate } from "./database.migrate.ts";
test("orders, records and skips applied migrations", () => {
  const database = openMemoryDatabase();
  const order: string[] = [];
  const migrations = [
    {
      version: "0002-second",
      apply: () => {
        order.push("second");
      },
    },
    {
      version: "0001-first",
      apply: () => {
        order.push("first");
      },
    },
  ];
  const options = { database, migrations, clock: () => new Date("2026-01-01Z") };
  migrate(options);
  migrate(options);
  expect(order).toEqual(["first", "second"]);
  expect(database.prepare("SELECT * FROM migrations ORDER BY version").all()).toEqual([
    { version: "0001-first", appliedAt: "2026-01-01T00:00:00.000Z" },
    { version: "0002-second", appliedAt: "2026-01-01T00:00:00.000Z" },
  ]);
  expect(() => migrate({ ...options, migrations: [] })).toThrow("0001-first");
  database.close();
});
test("rolls back a failed migration and leaves no version", () => {
  const database = openMemoryDatabase();
  const apply = (): void => {
    database.exec("CREATE TABLE sample (id TEXT)");
    throw new Error("failure");
  };
  expect(() =>
    migrate({ database, migrations: [{ version: "0001-fails", apply }], clock: () => new Date() }),
  ).toThrow("failure");
  expect(database.prepare("SELECT * FROM migrations").all()).toEqual([]);
  expect(database.prepare("SELECT name FROM sqlite_master WHERE name = 'sample'").all()).toEqual(
    [],
  );
  database.close();
});
