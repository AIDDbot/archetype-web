import type { ReactElement } from "react";
import { Link } from "react-router";
import type { Identity } from "#shared/identity.type.ts";
import type { Feature, HomeCard, PageProps } from "#shared/components/page.contract.ts";
export type HomeOptions = { identity: Identity; cards: HomeCard[] };
export function registerHome(options: HomeOptions): Feature {
  function Home(props: PageProps): ReactElement {
    return (
      <>
        <header className="home-header">
          <h1>{options.identity.displayName}</h1>
          <p>{options.identity.description}</p>
          <p>Version {options.identity.version}</p>
        </header>
        <div className="grid" aria-label="Application cards">
          {options.cards.map((card) =>
            card.page ? (
              <card.page key={card.path} {...props} />
            ) : (
              <article key={card.path}>
                <h2>
                  <Link to={card.path}>{card.title}</Link>
                </h2>
                <p>{card.description}</p>
              </article>
            ),
          )}
        </div>
      </>
    );
  }
  return {
    pages: [
      {
        path: "/",
        access: "everyone",
        page: Home,
        load: (services) => {
          for (const card of options.cards) card.load?.(services, {});
        },
      },
    ],
    links: [{ path: "/", label: "Home", access: "everyone" }],
    cards: [],
  };
}
