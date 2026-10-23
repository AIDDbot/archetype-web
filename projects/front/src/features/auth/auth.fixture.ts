import type { SessionIdentity } from "#shared/session/session.contract.ts";
export const testUser: SessionIdentity = {
  id: "one",
  name: "Person",
  email: "a@b.test",
  role: "user",
  createdAt: "2026-10-01T00:00:00.000Z",
};
