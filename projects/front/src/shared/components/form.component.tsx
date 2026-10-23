import type { ReactElement, SubmitEventHandler } from "react";
import type { Control, RecordFormModel, ShownField, StateProps } from "./record.type.ts";
type FormProps = { model: RecordFormModel; onSubmit: SubmitEventHandler<HTMLFormElement> };
type FieldProps = { field: ShownField };
const controls: Record<Control, (props: FieldProps) => ReactElement> = {
  input: (props) => (
    <input
      id={props.field.id}
      name={props.field.name}
      type={props.field.type}
      defaultValue={props.field.value}
      aria-invalid={props.field.invalid}
      aria-describedby={props.field.description}
    />
  ),
  select: (props) => (
    <select
      id={props.field.id}
      name={props.field.name}
      defaultValue={props.field.value}
      aria-invalid={props.field.invalid}
      aria-describedby={props.field.description}
    >
      {props.field.options?.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  ),
};
export function RecordForm(props: FormProps): ReactElement {
  return (
    <form noValidate onSubmit={props.onSubmit}>
      <fieldset disabled={props.model.disabled}>
        {props.model.fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            {controls[field.control]({ field })}
            <small id={field.errorId} hidden={field.errorHidden}>
              {field.error}
            </small>
          </div>
        ))}
        <button type="submit">{props.model.submit}</button>
      </fieldset>
    </form>
  );
}
export function RecordState(props: StateProps): ReactElement {
  return (
    <div>
      <div hidden={props.model.hidden} role={props.model.role} aria-busy={props.model.busy}>
        {props.model.message}
      </div>
      <div hidden={props.model.dataHidden}>{props.children}</div>
    </div>
  );
}
