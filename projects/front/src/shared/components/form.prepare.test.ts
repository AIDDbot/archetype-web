import { expect, test } from "vite-plus/test";
import { createRecordForm, createRecordState } from "./form.prepare.ts";
import type { DataState } from "./record.type.ts";
test("links errors outside labels and disables a sending form", () => {
  const fields = [
    { name: "name", label: "Name", type: "text", value: "Ada" },
    { name: "email", label: "Email", type: "email", value: "" },
  ];
  const input = {
    id: "record",
    fields,
    errors: { email: "Required" },
    sending: true,
    submit: "Save",
  };
  expect(createRecordForm(input)).toEqual({
    disabled: true,
    submit: "Save",
    fields: [
      {
        ...fields[0],
        control: "input",
        id: "record-name",
        errorId: "record-name-error",
        description: undefined,
        error: "",
        invalid: false,
        errorHidden: true,
      },
      {
        ...fields[1],
        control: "input",
        id: "record-email",
        errorId: "record-email-error",
        description: "record-email-error",
        error: "Required",
        invalid: true,
        errorHidden: false,
      },
    ],
  });
  expect(createRecordForm({ ...input, sending: false }).disabled).toBe(false);
});
const states: {
  state: DataState;
  message: string;
  hidden: boolean;
  dataHidden: boolean;
  busy: boolean;
  role: string;
}[] = [
  { state: "ready", message: "", hidden: true, dataHidden: false, busy: false, role: "status" },
  {
    state: "busy",
    message: "Loading",
    hidden: false,
    dataHidden: true,
    busy: true,
    role: "status",
  },
  {
    state: "empty",
    message: "No records",
    hidden: false,
    dataHidden: true,
    busy: false,
    role: "status",
  },
  {
    state: "error",
    message: "Failed",
    hidden: false,
    dataHidden: true,
    busy: false,
    role: "alert",
  },
];
test.each(states)("prepares $state in place of the data", ({ state, ...expected }) => {
  expect(
    createRecordState({ state, busy: "Loading", empty: "No records", error: "Failed" }),
  ).toEqual(expected);
});
test("shows a field with options as a choice", () => {
  const field = {
    name: "theme",
    label: "Theme",
    type: "text",
    value: "dark",
    options: ["light", "dark"],
  };
  const form = createRecordForm({
    id: "settings",
    fields: [field],
    errors: {},
    sending: false,
    submit: "Save",
  });
  expect(form.fields[0]?.control).toBe("select");
  expect(form.fields[0]?.options).toEqual(["light", "dark"]);
});
