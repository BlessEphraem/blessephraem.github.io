// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ephraem — Dev Wiki',
  tagline: 'Documentation for my open-source tools.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://blessephraem.github.io',
  baseUrl: '/wiki/',

  organizationName: 'BlessEphraem',
  projectName: 'blessephraem.github.io',

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
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'Ephraem',
          src: 'img/avatar.png',
          href: '/intro',
          target: '_self',
          style: { height: '36px', width: '36px' },
        },
        items: [
          {
            to: '/programs/inputbar/getting-started',
            position: 'left',
            label: 'Programs',
          },
          {
            to: '/plugins/jsx-runner',
            position: 'left',
            label: 'Plugins',
          },
          {
            href: 'https://blessephraem.github.io',
            label: '← Portfolio',
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
        links: [
          {
            title: 'Programs',
            items: [
              { label: 'InputBar', to: '/programs/inputbar/getting-started' },
              { label: 'Premiere Companion', to: '/programs/premiere-companion/getting-started' },
            ],
          },
          {
            title: 'Plugins',
            items: [
              { label: 'JSX Runner', to: '/plugins/jsx-runner' },
              { label: 'JSX Scripts', to: '/plugins/jsx-scripts' },
            ],
          },
          {
            title: 'Links',
            items: [
              { label: 'Portfolio', href: 'https://blessephraem.github.io' },
              { label: 'GitHub', href: 'https://github.com/BlessEphraem' },
            ],
          },
        ],
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
