import type {
  FormDescription,
  FormField,
  ShownField,
  RecordFormModel,
  StateDescription,
  StateModel,
  DataState,
} from "./record.type.ts";
type FieldContext = { id: string; errors: Readonly<Record<string, string>> };
function prepareField(field: FormField, context: FieldContext): ShownField {
  const id = `${context.id}-${field.name}`;
  const error = context.errors[field.name] ?? "";
  const invalid = error.length > 0;
  const isChoice = field.options !== undefined;
  return {
    ...field,
    control: isChoice ? "select" : "input",
    id,
    errorId: `${id}-error`,
    description: invalid ? `${id}-error` : undefined,
    error,
    invalid,
    errorHidden: !invalid,
  };
}
export function createRecordForm(input: FormDescription): RecordFormModel {
  return {
    fields: input.fields.map((field) => prepareField(field, input)),
    disabled: input.sending,
    submit: input.submit,
  };
}
type StateFlags = { hidden: boolean; dataHidden: boolean; busy: boolean; role: "status" | "alert" };
const states: Record<DataState, StateFlags> = {
  ready: { hidden: true, dataHidden: false, busy: false, role: "status" },
  busy: { hidden: false, dataHidden: true, busy: true, role: "status" },
  empty: { hidden: false, dataHidden: true, busy: false, role: "status" },
  error: { hidden: false, dataHidden: true, busy: false, role: "alert" },
};
export function createRecordState(input: StateDescription): StateModel {
  const messages = { ready: "", busy: input.busy, empty: input.empty, error: input.error };
  return { ...states[input.state], message: messages[input.state] };
}
