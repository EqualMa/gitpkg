import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Cover from "@site/static/img/cover.svg";
import GitPkgApi from "@site/src/components/GitPkgApi";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <Cover style={{ maxHeight: 280 }} />
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Home"
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main className={styles.howTo}>
        <Heading as="h1" style={{ textAlign: "center" }}>
          How to use
        </Heading>
        <GitPkgApi />

        <div style={{ textAlign: "center" }}>
          You can also check out the detailed {}
          <Link to="/about/guide">guide</Link>.
        </div>
      </main>
    </Layout>
  );
}
