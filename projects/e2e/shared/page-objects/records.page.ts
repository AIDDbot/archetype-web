import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
export type TableRecord = { caption: string; columns: string[]; rows: string[][] };
export type RecordFact = { label: string; value: string };
export type RecordSection = { title: string; facts: RecordFact[] };
export type RecordView = { title: string; facts: RecordFact[]; sections: RecordSection[] };
export type RecordForm = {
  field: (label: string) => Locator;
  expectError: (label: string, message: string) => Promise<void>;
};
async function readFact(scope: Locator): Promise<RecordFact> {
  return {
    label: await scope.locator("dt").innerText(),
    value: await scope.locator("dd").innerText(),
  };
}
async function readFacts(scope: Locator): Promise<RecordFact[]> {
  const facts = await scope.locator(":scope > dl > div").all();
  return Promise.all(facts.map(readFact));
}
async function readSection(scope: Locator): Promise<RecordSection> {
  return { title: await scope.getByRole("heading").innerText(), facts: await readFacts(scope) };
}
export async function readRecord(scope: Locator): Promise<RecordView> {
  const sections = await scope.locator(":scope > section").all();
  return {
    title: await scope.locator(":scope > header").getByRole("heading").innerText(),
    facts: await readFacts(scope),
    sections: await Promise.all(sections.map(readSection)),
  };
}
async function readRow(scope: Locator): Promise<string[]> {
  return scope.getByRole("cell").allTextContents();
}
export async function readTable(scope: Locator): Promise<TableRecord> {
  const rows = await scope.locator("tbody > tr").all();
  return {
    caption: await scope.locator("caption").innerText(),
    columns: await scope.getByRole("columnheader").allTextContents(),
    rows: await Promise.all(rows.map(readRow)),
  };
}
export function recordForm(scope: Locator): RecordForm {
  return {
    field: (label) => scope.getByLabel(label, { exact: true }),
    expectError: async (label, message) => {
      await expect(scope.getByLabel(label, { exact: true })).toHaveAccessibleDescription(message);
    },
  };
}
