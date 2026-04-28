import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import toolsData from './tools.json';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Dev Wiki" description={siteConfig.tagline}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            <span className={styles.accent}>EPHRAEM</span> — Dev Wiki
          </h1>
          <p className={styles.heroSubtitle}>
            Documentation for my open-source tools. Built to fix creative workflows.
          </p>
          <div className={styles.heroBtns}>
            <a
              className={styles.btnSecondary}
              href="https://github.com/BlessEphraem"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub →
            </a>
          </div>
        </div>

        <section className={styles.grid}>
          {toolsData.map((tool) => (
            <Link key={tool.name} to={tool.link} className={styles.card} style={{'--card-color': tool.color}}>
              {tool.iconImg
                ? <img src={tool.iconImg} alt={tool.name} className={styles.cardIcon} />
                : <span className={styles.cardEmoji}>{tool.iconEmoji}</span>
              }
              <h2 className={styles.cardName}>{tool.name}</h2>
              <p className={styles.cardDesc}>{tool.desc}</p>
              <span className={styles.cardArrow}>Read docs →</span>
            </Link>
          ))}
        </section>
      </main>
    </Layout>
  );
}

