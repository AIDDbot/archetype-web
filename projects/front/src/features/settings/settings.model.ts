import { createRecordForm } from "#shared/components/form.prepare.ts";
import type { RecordFormModel } from "#shared/components/record.type.ts";
import { dateFormats, themes } from "./settings.type.ts";
import type { SettingsInput, SettingsState } from "./settings.type.ts";
export function settingsForm(values: SettingsInput, state: SettingsState): RecordFormModel {
  return createRecordForm({
    id: "settings",
    fields: [
      { name: "theme", label: "Theme", value: values.theme, type: "text", options: themes },
      {
        name: "dateFormat",
        label: "Date format",
        value: values.dateFormat,
        type: "text",
        options: dateFormats,
      },
    ],
    errors: state.fields,
    sending: state.sending,
    submit: "Save",
  });
}
function formValue(value: FormDataEntryValue | null): string {
  const isText = typeof value === "string";
  return isText ? value : "";
}
export function settingsInput(form: FormData): SettingsInput {
  return { theme: formValue(form.get("theme")), dateFormat: formValue(form.get("dateFormat")) };
}
