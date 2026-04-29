import {themes as prismThemes} from 'prism-react-renderer';
import { createRequire } from 'module';
import { existsSync } from 'fs';
const require = createRequire(import.meta.url);
const siteConfig = require('../site.config.json');
const generatedBlogNav = existsSync(new URL('./generated-blog-navbar.json', import.meta.url))
  ? require('./generated-blog-navbar.json')
  : [];
const portfolioNav = existsSync(new URL('./generated-blog-portfolio-nav.json', import.meta.url))
  ? require('./generated-blog-portfolio-nav.json')
  : [];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: siteConfig.blog.title,
  tagline: siteConfig.blog.tagline,
  favicon: 'img/Ephraem-white.svg',

  future: {
    v4: true,
  },

  url: siteConfig.domain,
  baseUrl: '/news/',

  stylesheets: [siteConfig.font],

  organizationName: siteConfig.owner,
  projectName: siteConfig.project,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  staticDirectories: ['assets', '../assets'],

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          path: './posts',
          routeBasePath: '/',
          blogTitle: 'Home',
          blogDescription: 'Thoughts, Updates & Articles by Ephraem',
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          showReadingTime: true,
          onUntruncatedBlogPosts: 'ignore',
          feedOptions: {
            type: 'all',
            title: 'Ephraem — News',
            description: 'Thoughts, Updates & Articles by Ephraem',
          },
        },
        pages: false,
        theme: {
          customCss: './assets/css/custom.css',
        },
      },
    ],
  ],

  plugins: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Ephraem',
        logo: {
          alt: 'Ephraem',
          src: 'img/Ephraem-white.svg',
          href: '/news/',
          target: '_self',
          style: { height: '32px', width: '32px' },
        },
        items: [
          {
            href: 'pathname:///',
            label: 'Menu',
            position: 'right',
            target: '_self',
          },
          {
            href: 'pathname:///wiki/',
            label: 'Wiki',
            position: 'right',
            target: '_self',
          },
          {
            href: 'pathname:///Portfolio/',
            label: 'Portfolio',
            position: 'right',
            target: '_self',
          },
          ...portfolioNav,
          ...generatedBlogNav,
          {
            href: siteConfig.social.github,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Ephraem.`,
      },
      prism: {
        theme: prismThemes.vsDark,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ['python', 'json', 'bash', 'powershell'],
      },
    }),
};

export default config;
