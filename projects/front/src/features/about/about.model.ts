import {
  createRecordCard,
  createRecordDetail,
  createRecordTable,
} from "#shared/components/record.prepare.ts";
import { createRecordState } from "#shared/components/form.prepare.ts";
import type {
  Fact,
  RecordCardModel,
  RecordDetailModel,
  RecordTableModel,
  StateModel,
} from "#shared/components/record.type.ts";
import type { About, AboutState } from "./about.type.ts";
const format = { locale: "en", style: {} };
export function aboutState(state: AboutState): StateModel {
  return createRecordState({
    state: state.status,
    busy: "Loading about",
    empty: "",
    error: "About unavailable",
  });
}
export function aboutCard(about: About): RecordCardModel {
  return createRecordCard(
    {
      title: "About",
      facts: [
        { label: "Application", value: { kind: "text", text: about.name } },
        { label: "Version", value: { kind: "text", text: about.version } },
      ],
      link: { href: "/about", label: "About this application" },
    },
    format,
  );
}
export function aboutDetail(about: About): RecordDetailModel {
  const facts: Fact[] = [
    { label: "Description", value: { kind: "text", text: about.description } },
    { label: "Version", value: { kind: "text", text: about.version } },
    { label: "Author", value: { kind: "text", text: about.author.name } },
    {
      label: "Website",
      value: { kind: "text", text: about.author.url },
      link: { href: about.author.url, label: "Website" },
    },
  ];
  return createRecordDetail(
    { title: about.name, sections: [{ title: "Application", facts }] },
    format,
  );
}
export function aboutTable(about: About): RecordTableModel {
  return createRecordTable(
    {
      title: "Project technologies",
      columns: [
        { key: "name", label: "Project", align: "left" },
        { key: "type", label: "Type", align: "left" },
        { key: "technologies", label: "Technologies", align: "left" },
      ],
      rows: about.projects.map((project) => ({
        key: project.name,
        values: {
          name: { kind: "text", text: project.name },
          type: { kind: "text", text: project.type },
          technologies: { kind: "text", text: project.technologies.join(", ") },
        },
      })),
    },
    format,
  );
}
