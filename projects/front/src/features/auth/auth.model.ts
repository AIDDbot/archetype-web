import { createRecordForm } from "#shared/components/form.prepare.ts";
import { createRecordCard } from "#shared/components/record.prepare.ts";
import type {
  RecordCardModel,
  RecordFormModel,
  FormField,
} from "#shared/components/record.type.ts";
import type { Session } from "#shared/session/session.contract.ts";
import type { Operation, AuthResult } from "./auth.type.ts";
const fields: Record<Operation, readonly FormField[]> = {
  login: [
    { name: "email", label: "Email", value: "", type: "email" },
    { name: "password", label: "Password", value: "", type: "password" },
  ],
  register: [
    { name: "name", label: "Name", value: "", type: "text" },
    { name: "email", label: "Email", value: "", type: "email" },
    { name: "password", label: "Password", value: "", type: "password" },
  ],
};
export const titles: Record<Operation, string> = { login: "Login", register: "Register" };
export type FormInput = { operation: Operation; result: AuthResult; sending: boolean };
export function authForm(input: FormInput): RecordFormModel {
  return createRecordForm({
    id: input.operation,
    fields: fields[input.operation],
    errors: input.result.fields,
    sending: input.sending,
    submit: titles[input.operation],
  });
}
export function authCard(session: Session | null): RecordCardModel {
  const anonymous = session === null;
  const link = anonymous
    ? { href: "/login", label: "Login" }
    : { href: `/users/${session.user.id}`, label: `Hello, ${session.user.name}` };
  return createRecordCard({ title: "Account", facts: [], link }, { locale: "en", style: {} });
}

export function formText(value: FormDataEntryValue | null): string {
  const text = typeof value === "string";
  return text ? value : "";
}
