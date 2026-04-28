import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'News - Ephraem',
  tagline: 'Thoughts, Updates & Articles',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://blessephraem.github.io',
  baseUrl: '/news/',

  stylesheets: [
    'https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap',
  ],

  organizationName: 'BlessEphraem',
  projectName: 'blessephraem.github.io',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  staticDirectories: ['assets'],

  clientModules: ['./assets/clientModules/pageTransition.js'],

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
          src: 'img/avatar-white.png',
          href: '/news/',
          target: '_self',
          style: { height: '36px', width: '36px' },
        },
        items: [
          {
            href: '/',
            label: 'Menu',
            position: 'right',
          },
          {
            href: '/wiki/',
            label: 'Wiki',
            position: 'right',
          },
          {
            href: '/Portfolio/',
            label: 'Portfolio',
            position: 'right',
          },
          {
            href: 'https://github.com/BlessEphraem',
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
