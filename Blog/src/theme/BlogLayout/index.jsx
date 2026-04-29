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
    const year = new Date(item.date).getFullYear();
    if (!years[year]) years[year] = [];
    years[year].push(item);
  });
  return Object.entries(years).sort(([yearA], [yearB]) => yearB - yearA);
}

export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const { pathname } = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Detect if on a post page: regex for /YYYY/MM/DD/ (Docusaurus default)
  const isPostPage = /\/\d{4}\/\d{2}\/\d{2}\//.test(pathname);
  
  // Custom repo navigation check (matches tags)
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  // Filter sidebar items dynamically based on tag context
  const filteredSidebarItems = useMemo(() => {
    if (!sidebar || !sidebar.items) return [];
    if (!currentTag) return sidebar.items;
    
    // Filter items whose permalink contains the tag slug
    // Assuming the post slug or part of path contains the tag slug for the repo
    return sidebar.items.filter(item => 
      item.permalink.includes(`/tags/${currentTag}`) || 
      item.permalink.includes(`-${currentTag}-`) ||
      item.permalink.endsWith(`-${currentTag}`)
    );
  }, [sidebar, currentTag]);

  // If filtered items are empty but we have a tag, it means the permalink logic might be different.
  // We'll fall back to all items if filtering results in 0 items to avoid empty sidebar.
  const displayItems = filteredSidebarItems.length > 0 ? filteredSidebarItems : (sidebar?.items || []);

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          {!isPostPage && (
            <BlogSidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
          )}

          <main
            className={clsx('col', {
              // Post page: centered and wider
              'col--8 col--offset-2': isPostPage,
              // Tag/List page with Repo Nav
              'col--7': !isPostPage && !isSidebarCollapsed,
              'col--9': !isPostPage && isSidebarCollapsed,
            })}
          >
            {children}
          </main>

          {!isPostPage && (
            <div className="col col--2">
              {sidebar && displayItems.length > 0 && (
                <nav className="menu thin-scrollbar" aria-label="Blog recent posts navigation">
                  <div className="menu__title">{sidebar.title}</div>
                  <ul className="menu__list">
                    {groupItemsByYear(displayItems).map(([year, items]) => (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
