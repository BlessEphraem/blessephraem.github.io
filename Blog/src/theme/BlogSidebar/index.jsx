import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

let sidebarData = [];
try {
  sidebarData = require('../../data/generated-blog-sidebar.json');
} catch {
  // not generated yet
}

export default function BlogSidebar({ isCollapsed, onToggle }) {
  const { pathname } = useLocation();
  const tagMatch = pathname.match(/\/tags\/([^/]+)/);
  const currentTag = tagMatch ? tagMatch[1] : null;

  // Find if current page belongs to a category or repo
  const activeItem = sidebarData.find(
    (c) => c.category === currentTag || c.repos.some((r) => r.slug === currentTag)
  );

  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCollapse = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!activeItem || !sidebarData.length) {
    return <aside className="col col--3" style={{ borderRight: '1px solid var(--glass-border)', display: 'none' }} />;
  }

  return (
    <aside className={clsx('col col--3', { 'sidebar-collapsed': isCollapsed })}>
      <nav className="menu thin-scrollbar" style={{ height: '100%' }}>
        {!isCollapsed && (
          <ul className="menu__list">
            {sidebarData.map((catItem) => {
              const isCategoryActive = currentTag === catItem.category;
              const hasActiveChild = catItem.repos.some((r) => r.slug === currentTag);
              const isCategoryCollapsed = collapsedCategories[catItem.category] ?? (!isCategoryActive && !hasActiveChild);

              return (
                <li
                  key={catItem.category}
                  className={clsx('menu__list-item', {
                    'menu__list-item--collapsed': isCategoryCollapsed,
                  })}
                >
                  <div className="menu__list-item-collapsible">
                    <Link
                      className={clsx('menu__link', {
                        'menu__link--active': isCategoryActive,
                      })}
                      to={`/news/tags/${catItem.category}`}
                    >
                      {catItem.label}
                    </Link>
                    <button
                      aria-label="Toggle container"
                      type="button"
                      className="clean-btn menu__caret"
                      onClick={() => toggleCollapse(catItem.category)}
                    />
                  </div>
                  <ul className="menu__list">
                    {catItem.repos.map((repo) => {
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
                </li>
              );
            })}
          </ul>
        )}
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
