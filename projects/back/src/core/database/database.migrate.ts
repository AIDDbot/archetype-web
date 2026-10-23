import type { Database } from "#shared/database/database.contract.ts";
import type { Migration } from "#shared/database/migration.contract.ts";
import { ExpectedError } from "#shared/expected.error.ts";
export type MigrationOptions = {
  database: Database;
  migrations: readonly Migration[];
  clock: () => Date;
};
function knownVersions(options: MigrationOptions): Set<string> {
  const rows = options.database.prepare("SELECT version FROM migrations").all();
  const known = new Set(options.migrations.map((migration) => migration.version));
  for (const row of rows) {
    const version = String(row.version);
    const recognized = known.has(version);
    if (!recognized)
      throw new ExpectedError({
        kind: "unavailable",
        message: `Unknown migration version ${version}`,
      });
  }
  return new Set(rows.map((row) => String(row.version)));
}
function applyMigration(options: MigrationOptions, migration: Migration): void {
  options.database.exec("BEGIN");
  try {
    migration.apply(options.database);
    options.database
      .prepare("INSERT INTO migrations (version, appliedAt) VALUES (?, ?)")
      .run(migration.version, options.clock().toISOString());
    options.database.exec("COMMIT");
  } catch (error) {
    options.database.exec("ROLLBACK");
    throw error;
  }
}
export function migrate(options: MigrationOptions): void {
  options.database.exec(
    "CREATE TABLE IF NOT EXISTS migrations (version TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)",
  );
  const applied = knownVersions(options);
  const ordered = options.migrations.toSorted((left, right) =>
    left.version.localeCompare(right.version),
  );
  for (const migration of ordered) {
    const pending = !applied.has(migration.version);
    if (pending) applyMigration(options, migration);
  }
}
