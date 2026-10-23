import { testUser as user } from "./auth.fixture.ts";
import { expect, test } from "vite-plus/test";
import { authCard, authForm, formText } from "./auth.model.ts";
test("prepares each form and the visitor card", () => {
  const result = { session: null, message: "", fields: { email: "Invalid email" } };
  for (const operation of ["register", "login"] as const) {
    const form = authForm({ operation, result, sending: true });
    expect(form.disabled).toBe(true);
    expect(form.fields.find((field) => field.name === "email")?.error).toBe("Invalid email");
  }
  expect(authCard(null).link.href).toBe("/login");
  expect(formText(null)).toBe("");
  expect(formText(" password ")).toBe(" password ");
});
test("prepares a signed in account card", () => {
  expect(authCard({ token: "secret", user }).link).toEqual({
    href: "/users/one",
    label: "Hello, Person",
  });
});
