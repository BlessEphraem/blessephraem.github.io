import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

// Helper to group sidebar items by year
function groupItemsByYear(items) {
  const years = {};
  items.forEach((item) => {
    const date = new Date(item.date);
    const year = isNaN(date.getTime()) ? 'Recent' : date.getFullYear();
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
  
  // Extract tag slug from URL (e.g., from /news/tags/slug)
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  // Filter sidebar items dynamically based on tag context
  const filteredSidebarItems = useMemo(() => {
    if (!sidebar || !sidebar.items) return [];
    if (!currentTag) return sidebar.items;
    
    // Filter items whose permalink contains the tag slug as part of the post slug
    // Format: /news/YYYY/MM/DD/slug-tag_slug or similar
    return sidebar.items.filter(item => {
      const parts = item.permalink.split('/').filter(Boolean);
      const postSlug = parts[parts.length - 1] || '';
      return postSlug.includes(currentTag);
    });
  }, [sidebar, currentTag]);

  // If filtered items are empty but we have a tag, show nothing or all (depending on UX preference)
  // Here we show filtered items. If empty, the right sidebar simply won't show filtered posts.
  const displayItems = currentTag ? filteredSidebarItems : (sidebar?.items || []);

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row" style={{ minHeight: 'calc(100vh - var(--ifm-navbar-height))' }}>
          {!isPostPage && (
            <BlogSidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
          )}

          <main
            className={clsx('col', {
              // Post page: centered and fixed-width look via padding/offset
              'col--8 col--offset-2': isPostPage,
              // List page: Dynamic based on sidebar
              'col--7': !isPostPage && !isSidebarCollapsed,
              'col--9': !isPostPage && isSidebarCollapsed,
            })}
            style={isPostPage ? { padding: '2rem 1rem' } : { padding: '2rem 3rem' }}
          >
            {children}
          </main>

          {!isPostPage && (
            <div className="col col--2" style={{ borderLeft: '1px solid var(--glass-border)', padding: '1rem' }}>
              {displayItems.length > 0 && (
                <nav className="menu thin-scrollbar" aria-label="Blog recent posts navigation">
                  <div className="menu__title" style={{ color: 'var(--ifm-color-primary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                    {currentTag ? `Posts: ${currentTag}` : 'Recent posts'}
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
              )}
              {toc && <div className="margin-top--lg">{toc}</div>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
