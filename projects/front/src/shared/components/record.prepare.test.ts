import { expect, test } from "vite-plus/test";
import {
  displayValue,
  createRecordCard,
  createRecordDetail,
  createRecordTable,
} from "./record.prepare.ts";
import type { DisplayValue, Fact, Column } from "./record.type.ts";
const format = { locale: "en-US", style: { dateStyle: "short" as const, timeZone: "UTC" } };
const samples: { input: DisplayValue; expected: string }[] = [
  { input: { kind: "text", text: "Ada" }, expected: "Ada" },
  { input: { kind: "number", number: 1234 }, expected: "1,234" },
  { input: { kind: "duration", seconds: 2 }, expected: "2 seconds" },
  { input: { kind: "date", date: new Date("2026-01-02T00:00:00Z") }, expected: "1/2/26" },
  { input: { kind: "text" }, expected: "—" },
  { input: { kind: "number" }, expected: "—" },
  { input: { kind: "duration" }, expected: "—" },
  { input: { kind: "date" }, expected: "—" },
];
test.each(samples)("formats $input.kind as $expected", ({ input, expected }) => {
  expect(displayValue(input, format)).toBe(expected);
});
test("preserves the declared fact and section order", () => {
  const facts: Fact[] = [
    { label: "Second", value: { kind: "text", text: "B" } },
    { label: "First", value: { kind: "text", text: "A" } },
  ];
  const shown = [
    { label: "Second", value: "B" },
    { label: "First", value: "A" },
  ];
  const link = { href: "/records/1", label: "Open" };
  expect(createRecordCard({ title: "Record", facts, link }, format)).toEqual({
    title: "Record",
    facts: shown,
    link,
  });
  expect(
    createRecordDetail({ title: "Record", sections: [{ title: "Facts", facts }] }, format),
  ).toEqual({ title: "Record", sections: [{ title: "Facts", facts: shown }] });
});
test("aligns cells with declared columns and supplies missing values", () => {
  const columns: Column[] = [
    { key: "number", label: "Number", align: "right" },
    { key: "name", label: "Name", align: "left" },
    { key: "missing", label: "Missing", align: "center" },
  ];
  const rows = [
    {
      key: "a",
      values: {
        name: { kind: "text" as const, text: "Ada" },
        number: { kind: "number" as const, number: 4 },
      },
    },
  ];
  expect(createRecordTable({ title: "Records", columns, rows }, format)).toEqual({
    title: "Records",
    columns,
    rows: [
      {
        key: "a",
        cells: [
          { key: "number", value: "4", align: "right" },
          { key: "name", value: "Ada", align: "left" },
          { key: "missing", value: "—", align: "center" },
        ],
      },
    ],
  });
  expect(createRecordTable({ title: "Records", columns, rows: [] }, format).rows).toEqual([]);
});
