import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

let sidebarData = [];
try {
  sidebarData = require('../../data/generated-blog-sidebar.json');
} catch { }

export default function BlogSidebar({ isCollapsed, onToggle }) {
  const { pathname } = useLocation();
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  // Find active category context
  const activeCategory = sidebarData.find(
    (c) => c.category === currentTag || c.repos.some((r) => r.slug === currentTag)
  );

  if (!activeCategory) return null;

  return (
    <aside className={clsx('blog-layout__sidebar', { 'blog-layout__sidebar--collapsed': isCollapsed })}>
      <nav className="menu thin-scrollbar" style={{ height: '100%', display: isCollapsed ? 'none' : 'block' }}>
        <div className="menu__title" style={{ padding: '1rem', opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {activeCategory.label}
        </div>
        <ul className="menu__list">
          {activeCategory.repos.map((repo) => {
            const isActive = currentTag === repo.slug;
            return (
              <li key={repo.slug} className="menu__list-item">
                <Link
                  className={clsx('menu__link', {
                    'menu__link--active': isActive,
                  })}
                  to={`/news/tags/${repo.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                  {repo.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={clsx('clean-btn collapseSidebarButton', {
          'collapseSidebarButton--collapsed': isCollapsed,
          'collapseSidebarButton--uncollapsed': !isCollapsed,
        })}
        onClick={onToggle}
      />
    </aside>
  );
}
