import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router";
import type { RecordCardModel, RecordDetailModel, ShownFact } from "./record.type.ts";
import "./records.css";
type FactsProps = { facts: readonly ShownFact[] };
type CardProps = { model: RecordCardModel; children?: ReactNode };
type DetailProps = { model: RecordDetailModel };
type GridProps = { records: readonly RecordCardModel[] };
export function RecordFacts(props: FactsProps): ReactElement {
  return (
    <dl>
      {props.facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.link ? (
              <a href={fact.link.href} target="_blank" rel="noopener noreferrer">
                {fact.value}
              </a>
            ) : (
              fact.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function RecordCard(props: CardProps): ReactElement {
  return (
    <article>
      <header>
        <h2>{props.model.title}</h2>
      </header>
      {props.children ?? <RecordFacts facts={props.model.facts} />}
      <footer>
        <Link to={props.model.link.href}>{props.model.link.label}</Link>
      </footer>
    </article>
  );
}
export function RecordDetail(props: DetailProps): ReactElement {
  return (
    <div>
      {props.model.title && (
        <header>
          <h1>{props.model.title}</h1>
        </header>
      )}
      {props.model.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <RecordFacts facts={section.facts} />
        </section>
      ))}
    </div>
  );
}
export function RecordGrid(props: GridProps): ReactElement {
  return (
    <div className="record-grid">
      {props.records.map((model) => (
        <RecordCard key={model.link.href} model={model} />
      ))}
    </div>
  );
}
