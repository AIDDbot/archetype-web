import { useRef, useState, useSyncExternalStore } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Link } from "react-router";
import type { PageProps } from "#shared/components/page.contract.ts";
import { RecordForm } from "#shared/components/form.component.tsx";
import { RecordCard } from "#shared/components/record.component.tsx";
import { authForm, authCard, titles, formText } from "./auth.model.ts";
import type { Operation, AuthResult, AuthData } from "./auth.type.ts";
export type AuthProps = PageProps & { operation: Operation; submit: AuthData["submit"] };
const initial: AuthResult = { session: null, message: "", fields: {} };
export function AuthPage(props: AuthProps): ReactElement {
  const [result, setResult] = useState(initial);
  const [sending, setSending] = useState(false);
  const active = useRef(false);
  async function submit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (active.current) return;
    active.current = true;
    setSending(true);
    const values = new FormData(event.currentTarget);
    props.services.logger.operation(props.operation);
    const answer = await props.submit(props.operation, {
      name: formText(values.get("name")),
      email: formText(values.get("email")),
      password: formText(values.get("password")),
    });
    setResult(answer);
    setSending(false);
    active.current = false;
    const authenticated = answer.session !== null;
    if (authenticated) {
      props.services.session.set(answer.session);
      props.services.completeLogin();
    }
  }
  return (
    <section>
      <h1>{titles[props.operation]}</h1>
      <p role="alert">{result.message}</p>
      <RecordForm
        model={authForm({ operation: props.operation, result, sending })}
        onSubmit={(event) => {
          void submit(event);
        }}
      />
    </section>
  );
}
export function AuthCard(props: PageProps): ReactElement {
  const store = props.services.session.state;
  const session = useSyncExternalStore(store.subscribe, store.read);
  const anonymous = session === null;
  return (
    <RecordCard model={authCard(session)}>
      {anonymous ? <Link to="/register">Register</Link> : <p>{session.user.email}</p>}
    </RecordCard>
  );
}
