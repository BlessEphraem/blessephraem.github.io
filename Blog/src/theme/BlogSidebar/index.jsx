import React from 'react';
import { useLocation } from '@docusaurus/router';

let sidebarData = [];
try {
  sidebarData = require('../../data/generated-blog-sidebar.json');
} catch {
  // not generated yet (local dev without running sync scripts)
}

export default function BlogSidebar({ sidebar }) {
  const { pathname } = useLocation();
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  if (!sidebarData.length) {
    return null;
  }

  return (
    <div style={{ padding: '1rem 0.75rem' }}>
      {sidebarData.map((catItem) => {
        const isCatActive = currentTag === catItem.category;
        return (
          <div key={catItem.category} style={{ marginBottom: '1.75rem' }}>
            <a
              href={`/news/tags/${catItem.category}`}
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.6rem',
                textDecoration: 'none',
                opacity: isCatActive ? 1 : 0.55,
              }}
            >
              {catItem.label}
            </a>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {catItem.repos.map((repo) => {
                const isActive = currentTag === repo.slug;
                return (
                  <li
                    key={repo.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.2rem 0',
                    }}
                  >
                    {repo.iconImg ? (
                      <img
                        src={repo.iconImg}
                        alt=""
                        width={16}
                        height={16}
                        style={{ objectFit: 'contain', flexShrink: 0 }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.9rem', lineHeight: 1, flexShrink: 0 }}>
                        📦
                      </span>
                    )}
                    <a
                      href={`/news/tags/${repo.slug}`}
                      style={{
                        fontWeight: isActive ? 700 : 400,
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                      }}
                    >
                      {repo.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
