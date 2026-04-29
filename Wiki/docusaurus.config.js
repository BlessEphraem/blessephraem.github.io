import {themes as prismThemes} from 'prism-react-renderer';
import { createRequire } from 'module';
import { existsSync } from 'fs';
const require = createRequire(import.meta.url);
const generatedNav = existsSync('./generated-navbar.json') ? require('./generated-navbar.json') : [];
const siteConfig = require('../site.config.json');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: siteConfig.wiki.title,
  tagline: siteConfig.wiki.tagline,
  favicon: 'img/Ephraem-yellow.svg',

  future: {
    v4: true,
  },

  url: siteConfig.domain,
  baseUrl: '/wiki/',

  stylesheets: [siteConfig.font],

  organizationName: siteConfig.owner,
  projectName: siteConfig.project,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
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
        },
        blog: false,
        pages: {
          path: './pages',
        },
        theme: {
          customCss: ['./assets/css/custom.css', './assets/css/icons.css'],
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
        theme: prismThemes.vsDark,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ['python', 'json', 'bash', 'powershell'],
      },
    }),
};

export default config;
