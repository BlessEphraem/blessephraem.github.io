import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout title="News" description="Thoughts, Updates & Articles by Ephraem">
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '6rem 1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          EPHRAEM — News
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '2rem' }}>
          Thoughts, Updates & Articles
        </p>
        <Link
          to="/posts/"
          style={{
            color: 'var(--ifm-color-primary)',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Read posts →
        </Link>
      </main>
    </Layout>
  );
}
