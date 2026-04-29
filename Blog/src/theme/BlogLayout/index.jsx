import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

// Load sidebar data to check visibility
let sidebarData = [];
try {
  sidebarData = require('../../data/generated-blog-sidebar.json');
} catch { }

function getInfoFromPermalink(permalink) {
  const parts = permalink.split('/').filter(Boolean);
  // Expected: ['news', 'YYYY', 'MM', 'DD', 'slug']
  if (parts.length >= 4 && !isNaN(parts[1])) {
    return {
      year: parts[1],
      slug: parts[parts.length - 1] || ''
    };
  }
  return { year: 'Recent', slug: parts[parts.length - 1] || '' };
}

function groupItemsByYear(items) {
  const years = {};
  items.forEach((item) => {
    const { year } = getInfoFromPermalink(item.permalink);
    if (!years[year]) years[year] = [];
    years[year].push(item);
  });
  return Object.entries(years).sort(([yearA], [yearB]) => {
    if (yearA === 'Recent') return -1;
    if (yearB === 'Recent') return 1;
    return yearB - yearA;
  });
}

export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Detect if on a post page: regex for /YYYY/MM/DD/
  const isPostPage = /\/\d{4}\/\d{2}\/\d{2}\//.test(pathname);
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  // Determine if left sidebar SHOULD be rendered
  const hasLeftSidebar = useMemo(() => {
    if (isPostPage) return false;
    if (!sidebarData.length) return false;
    return sidebarData.some(
      (c) => c.category === currentTag || c.repos.some((r) => r.slug === currentTag)
    );
  }, [currentTag, isPostPage]);

  // Robust Filtering for Right Sidebar
  const displayItems = useMemo(() => {
    if (!sidebar || !sidebar.items) return [];
    if (!currentTag) return sidebar.items;

    const catData = sidebarData.find(c => c.category === currentTag);
    const allowedSlugs = catData ? catData.repos.map(r => r.slug) : [currentTag];
    
    return sidebar.items.filter(item => {
      const { slug } = getInfoFromPermalink(item.permalink);
      return allowedSlugs.some(s => slug.includes(s));
    });
  }, [sidebar, currentTag]);

  return (
    <Layout {...layoutProps}>
      <div className="blog-layout__wrapper">
        {hasLeftSidebar && (
          <BlogSidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        )}

        <div className="blog-layout__main-container">
          <main className="blog-layout__main-content">
            {children}
          </main>
        </div>

        {!isPostPage && displayItems.length > 0 && (
          <aside className="blog-layout__right-sidebar">
            <nav className="menu thin-scrollbar" aria-label="Blog recent posts navigation">
              <div className="menu__title" style={{ color: 'var(--ifm-color-primary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                {currentTag ? `Filter: ${currentTag}` : 'Recent posts'}
              </div>
              <ul className="menu__list">
                {groupItemsByYear(displayItems).map(([year, items]) => (
                  <li key={year} className="menu__list-item">
                    <div className="menu__link menu__link--sublist" style={{ pointerEvents: 'none', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
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
                            style={{ fontSize: '0.85rem' }}
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
            {toc && <div className="margin-top--lg">{toc}</div>}
          </aside>
        )}
      </div>
    </Layout>
  );
}
