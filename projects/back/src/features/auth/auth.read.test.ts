import { expect, test } from "vite-plus/test";
import { readCredentials, readRegistration } from "./auth.read.ts";

test("normalizes names and email, preserves password spaces, and discards client role", () => {
  expect(
    readRegistration({ name: "  Ab  ", email: "A@B.CO", password: " 123456 ", role: "admin" }),
  ).toEqual({ name: "Ab", email: "a@b.co", password: " 123456 " });
  expect(readCredentials({ email: "a@b.co", password: "12345678" })).toEqual({
    email: "a@b.co",
    password: "12345678",
  });
});
test("reports all invalid fields and accepts each closed boundary", () => {
  expect(() => readRegistration({ name: "a", email: "a", password: "a" })).toThrowError(
    expect.objectContaining({
      fields: { name: expect.any(String), email: expect.any(String), password: expect.any(String) },
    }),
  );
  for (const value of [
    undefined,
    null,
    {},
    { name: 2, email: 3, password: 4 },
    { name: " ", email: "a@b", password: "short" },
  ])
    expect(() => readRegistration(value)).toThrow("Invalid fields");
  for (const length of [2, 64])
    expect(
      readRegistration({ name: "a".repeat(length), email: "a@b.co", password: "1".repeat(8) }).name,
    ).toHaveLength(length);
  for (const length of [8, 64])
    expect(
      readCredentials({ email: "a@b.co", password: "1".repeat(length) }).password,
    ).toHaveLength(length);
  expect(
    readCredentials({ email: "a".repeat(59) + "@b.co", password: "12345678" }).email,
  ).toHaveLength(64);
  for (const changes of [
    { name: "a".repeat(65) },
    { email: "a".repeat(60) + "@b.co" },
    { password: "1".repeat(65) },
  ])
    expect(() =>
      readRegistration({ name: "Ab", email: "a@b.co", password: "12345678", ...changes }),
    ).toThrow("Invalid fields");
});
