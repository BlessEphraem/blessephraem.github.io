import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const tools = [
  {
    emoji: '🖥️',
    name: 'InputBar',
    desc: 'Fast application launcher for Windows, can be triggered with any shortcuts. (Even the "Win" key).',
    link: '/programs/inputbar/readme',
    color: '#9B9B9B',
  },
  {
    emoji: '🎬',
    name: 'Premiere Companion',
    desc: 'An Excalibur software + plugin alternative, and can apply Presets too. Free and Open Source.',
    link: '/programs/premiere-companion/',
    color: '#ff1796',
  },
  {
    emoji: '🔌',
    name: 'JSX Runner',
    desc: 'UXP Premiere Pro plugin to run .jsx scripts.',
    link: '/plugins/jsx-runner',
    color: '#C80A0A',
  },
  {
    emoji: '📜',
    name: 'JSX Scripts',
    desc: 'UXP Javascript Premiere Pro Scripts. Can be used with any plugin that can execute script inside Premiere. (See mine "JSX Runner")',
    link: '/plugins/jsx-scripts',
    color: '#C80A0A',
  },
];

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
            <Link className={styles.btnPrimary} to="/intro">
              About Me
            </Link>
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
          {tools.map((tool) => (
            <Link key={tool.name} to={tool.link} className={styles.card} style={{'--card-color': tool.color}}>
              <span className={styles.cardEmoji}>{tool.emoji}</span>
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

