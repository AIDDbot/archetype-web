import type { Database } from "#shared/database/database.contract.ts";
import type { Repository } from "./settings.type.ts";
import { readPreferences } from "./settings.read.ts";
export function createRepository(database: Database): Repository {
  return {
    find: (id) => {
      const row = database
        .prepare("SELECT theme,dateFormat FROM settings WHERE userId = ?")
        .get(id);
      const absent = row === undefined;
      if (absent) return undefined;
      return readPreferences(row);
    },
    save: (settings) => {
      database
        .prepare(`INSERT INTO settings (userId,theme,dateFormat,updatedAt) VALUES (?,?,?,?)
        ON CONFLICT(userId) DO UPDATE SET theme=excluded.theme,
        dateFormat=excluded.dateFormat,updatedAt=excluded.updatedAt`)
        .run(settings.userId, settings.theme, settings.dateFormat, settings.updatedAt);
    },
  };
}
