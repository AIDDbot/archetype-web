import { useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { RecordCard, RecordFacts, RecordDetail } from "#shared/components/record.component.tsx";
import { RecordTable } from "#shared/components/table.component.tsx";
import { RecordState } from "#shared/components/form.component.tsx";
import type { Identity } from "#shared/identity.type.ts";
import { aboutCard, aboutDetail, aboutState, aboutTable } from "./about.model.ts";
import type { AboutStore } from "./about.type.ts";
export type AboutCardProps = { store: AboutStore };
export type AboutProps = AboutCardProps & { identity: Identity };
export function AboutCard(props: AboutCardProps): ReactElement {
  const state = useSyncExternalStore(props.store.state.subscribe, props.store.state.read);
  const model = {
    title: "About",
    facts: [],
    link: { href: "/about", label: "About this application" },
  };
  return (
    <RecordCard model={model}>
      <RecordState model={aboutState(state)}>
        {state.about && <RecordFacts facts={aboutCard(state.about).facts} />}
      </RecordState>
    </RecordCard>
  );
}
export function AboutPage(props: AboutProps): ReactElement {
  const state = useSyncExternalStore(props.store.state.subscribe, props.store.state.read);
  return (
    <>
      <RecordDetail model={{ title: props.identity.displayName, sections: [] }} />
      <RecordState model={aboutState(state)}>
        {state.about && (
          <>
            <RecordDetail model={{ ...aboutDetail(state.about), title: "" }} />
            <RecordTable model={aboutTable(state.about)} />
          </>
        )}
      </RecordState>
    </>
  );
}
