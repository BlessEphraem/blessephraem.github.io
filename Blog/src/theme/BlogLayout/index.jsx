import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

// Helper to group sidebar items by year
function groupItemsByYear(items) {
  const years = {};
  items.forEach((item) => {
    const year = new Date(item.date).getFullYear();
    if (!years[year]) years[year] = [];
    years[year].push(item);
  });
  return Object.entries(years).sort(([yearA], [yearB]) => yearB - yearA);
}

export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const { pathname } = useLocation();
  
  // Custom repo navigation check (matches tags)
  const isRepoNavActive = pathname.includes('/tags/');

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          {/* LEFT COLUMN: Custom Repo Navigation */}
          <BlogSidebar sidebar={sidebar} />

          {/* MAIN COLUMN */}
          <main
            className={clsx('col', {
              'col--7': isRepoNavActive,
              'col--9 col--offset-1': !isRepoNavActive,
            })}
          >
            {children}
          </main>

          {/* RIGHT COLUMN: Posts by Date & TOC */}
          <div className="col col--2">
            {sidebar && sidebar.items.length > 0 && (
              <nav className="menu thin-scrollbar" aria-label="Blog recent posts navigation">
                <div className="menu__title">{sidebar.title}</div>
                <ul className="menu__list">
                  {groupItemsByYear(sidebar.items).map(([year, items]) => (
                    <li key={year} className="menu__list-item">
                      <div className="menu__link menu__link--sublist" style={{ pointerEvents: 'none', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
                        {year}
                      </div>
                      <ul className="menu__list">
                        {items.map((item) => (
                          <li key={item.permalink} className="menu__list-item">
                            <Link
                              isInternalLink
                              to={item.permalink}
                              className="menu__link"
                              activeClassName="menu__link--active"
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {toc && <div className="margin-top--lg">{toc}</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
