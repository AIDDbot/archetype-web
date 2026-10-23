import type { UserId, SessionIdentity } from "#shared/session/session.contract.ts";
import type { AuthFacade } from "#api/auth";
export type Theme = "system" | "light" | "dark";
export type DateFormat = "locale" | "iso";
export type Preferences = { theme: Theme; dateFormat: DateFormat };
export type StoredSettings = Preferences & { userId: UserId; updatedAt: string };
export type Repository = {
  find: (id: UserId) => Preferences | undefined;
  save: (settings: StoredSettings) => void;
};
export type SettingsServices = { repository: Repository; auth: AuthFacade; clock: () => Date };
export type SaveRequest = { session: SessionIdentity; preferences: Preferences };
export type SettingsLogic = {
  read: (session: SessionIdentity) => Preferences;
  save: (input: SaveRequest) => Preferences;
};
