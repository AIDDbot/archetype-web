import {
  readableDate,
  readableNumber,
  readableDuration,
  readableText,
} from "#shared/values/readable/readable.format.ts";
import type {
  DisplayValue,
  ValueFormat,
  Fact,
  ShownFact,
  RecordDescription,
  RecordCardModel,
  RecordDetailDescription,
  RecordDetailModel,
  TableDescription,
  RecordTableModel,
  TableRow,
  Column,
  ShownRow,
} from "./record.type.ts";

export function displayValue(input: DisplayValue, format: ValueFormat): string {
  const formats = {
    text: () => readableText(input.text),
    date: () => readableDate(input.date, format),
    number: () => readableNumber(input.number, format),
    duration: () => readableDuration(input.seconds, format),
  };
  return formats[input.kind]();
}

export function prepareFacts(facts: readonly Fact[], format: ValueFormat): ShownFact[] {
  return facts.map((fact) => ({
    label: fact.label,
    value: displayValue(fact.value, format),
    link: fact.link,
  }));
}

export function createRecordCard(input: RecordDescription, format: ValueFormat): RecordCardModel {
  return { title: input.title, facts: prepareFacts(input.facts, format), link: input.link };
}

export function createRecordDetail(
  input: RecordDetailDescription,
  format: ValueFormat,
): RecordDetailModel {
  return {
    title: input.title,
    sections: input.sections.map((section) => ({
      title: section.title,
      facts: prepareFacts(section.facts, format),
    })),
  };
}

type RowFormat = { columns: readonly Column[]; format: ValueFormat };
function prepareRow(row: TableRow, options: RowFormat): ShownRow {
  return {
    key: row.key,
    cells: options.columns.map((column) => ({
      key: column.key,
      align: column.align,
      value: displayValue(row.values[column.key] ?? { kind: "text" }, options.format),
    })),
  };
}

export function createRecordTable(input: TableDescription, format: ValueFormat): RecordTableModel {
  return {
    title: input.title,
    columns: input.columns,
    rows: input.rows.map((row) => prepareRow(row, { columns: input.columns, format })),
  };
}
