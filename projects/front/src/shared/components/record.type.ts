import type { ReactNode } from "react";
import type { ReadableDate } from "#shared/values/readable/readable.format.ts";
export type ValueFormat = ReadableDate;
export type DisplayValue = {
  kind: "text" | "number" | "duration" | "date";
  text?: string | number | null;
  number?: number | null;
  date?: Date | null;
  seconds?: number | null;
};
export type Fact = { label: string; value: DisplayValue; link?: RecordLink | undefined };
export type ShownFact = { label: string; value: string; link?: RecordLink | undefined };
export type RecordLink = { href: string; label: string };
export type RecordDescription = { title: string; facts: readonly Fact[]; link: RecordLink };
export type RecordCardModel = { title: string; facts: readonly ShownFact[]; link: RecordLink };
export type RecordSection = { title: string; facts: readonly Fact[] };
export type RecordDetailDescription = { title: string; sections: readonly RecordSection[] };
export type ShownSection = { title: string; facts: readonly ShownFact[] };
export type RecordDetailModel = { title: string; sections: readonly ShownSection[] };
export type Column = { key: string; label: string; align: "left" | "right" | "center" };
export type TableRow = { key: string; values: Readonly<Record<string, DisplayValue>> };
export type TableDescription = {
  title: string;
  columns: readonly Column[];
  rows: readonly TableRow[];
};
export type TableCell = { key: string; value: string; align: Column["align"] };
export type ShownRow = { key: string; cells: readonly TableCell[] };
export type RecordTableModel = {
  title: string;
  columns: readonly Column[];
  rows: readonly ShownRow[];
};
export type DataState = "ready" | "busy" | "empty" | "error";
export type StateDescription = { state: DataState; busy: string; empty: string; error: string };
export type StateModel = {
  hidden: boolean;
  dataHidden: boolean;
  busy: boolean;
  role: "alert" | "status";
  message: string;
};
export type StateProps = { model: StateModel; children: ReactNode };
export type FormField = {
  name: string;
  label: string;
  value: string;
  type: string;
  options?: readonly string[] | undefined;
};
export type Control = "input" | "select";
export type FormDescription = {
  id: string;
  fields: readonly FormField[];
  errors: Readonly<Record<string, string>>;
  sending: boolean;
  submit: string;
};
export type ShownField = FormField & {
  control: Control;
  id: string;
  errorId: string;
  description: string | undefined;
  error: string;
  invalid: boolean;
  errorHidden: boolean;
};
export type RecordFormModel = { fields: readonly ShownField[]; disabled: boolean; submit: string };
