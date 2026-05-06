import {themes as prismThemes} from 'prism-react-renderer';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import remarkTabs from './plugins/remark-tabs.mjs';
const require = createRequire(import.meta.url);
const generatedNav = existsSync('./generated-navbar.json') ? require('./generated-navbar.json') : [];
const siteConfig = require('../site.config.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: siteConfig.wiki.title,
  tagline: siteConfig.wiki.tagline,
  favicon: 'img/Ephraem-white.svg',

  future: {
    v4: true,
  },

  url: siteConfig.domain,
  baseUrl: '/wiki/',

  stylesheets: [siteConfig.font, siteConfig.fontCode].filter(Boolean),

  organizationName: siteConfig.owner,
  projectName: siteConfig.project,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
    preprocessor: ({ fileContent }) =>
      fileContent
        .replace(/<!--\s*tabs:start\s*-->/g, '{/* tabs:start */}')
        .replace(/<!--\s*tabs:end\s*-->/g, '{/* tabs:end */}'),
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  staticDirectories: ['assets', '../assets'],

  clientModules: ['./assets/clientModules/categoryTheme.js'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          remarkPlugins: [remarkTabs],
        },
        blog: false,
        pages: {
          path: './pages',
        },
        theme: {
          customCss: ['./assets/css/custom.css', './assets/css/markdown.css', './assets/css/icons.css', './assets/css/codeblock.css', './assets/css/tabs.css'],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'EPHRAEM',
        items: [
          ...generatedNav.map(item => ({...item, position: 'right'})),
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Ephraem. Built with Docusaurus.`,
      },
      prism: {
        theme: {
          ...prismThemes.vsDark,
          plain: { ...prismThemes.vsDark.plain, backgroundColor: 'transparent' },
        },
        darkTheme: {
          ...prismThemes.vsDark,
          plain: { ...prismThemes.vsDark.plain, backgroundColor: 'transparent' },
        },
        additionalLanguages: ['python', 'json', 'bash', 'powershell'],
      },
    }),
};

export default config;
