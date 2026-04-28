import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ephraem — News',
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
          blogTitle: 'News',
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

  plugins: [
    function injectBlobsAndTransition() {
      return {
        name: 'inject-blobs-transition',
        injectHtmlTags() {
          return {
            preBodyTags: [
              {
                tagName: 'div',
                attributes: {
                  id: 'page-transition',
                },
              },
              {
                tagName: 'div',
                attributes: {
                  class: 'blob blob-yellow',
                  id: 'blob-yellow',
                },
              },
              {
                tagName: 'div',
                attributes: {
                  class: 'blob blob-orange',
                  id: 'blob-orange',
                },
              },
              {
                tagName: 'script',
                innerHTML: `
                  (function() {
                    // Blob Sync
                    if (!sessionStorage.getItem('blobEpoch')) {
                      sessionStorage.setItem('blobEpoch', Date.now());
                    }
                    var elapsed = (Date.now() - +sessionStorage.getItem('blobEpoch')) / 1000;
                    var PERIOD = 9;
                    var yellow = document.getElementById('blob-yellow');
                    var orange = document.getElementById('blob-orange');
                    if (yellow) yellow.style.animationDelay = -(elapsed % PERIOD) + 's';
                    if (orange) orange.style.animationDelay = -((elapsed + 4.5) % PERIOD) + 's';
                  })();

                  function leaveAndNavigate(url) {
                    var overlay = document.getElementById('page-transition');
                    if (overlay) {
                      overlay.style.animation = 'none';
                      overlay.offsetHeight;
                      overlay.style.animation = 'overlayLeave 0.35s ease-in both';
                      setTimeout(function() { window.location.href = url; }, 340);
                    } else {
                      window.location.href = url;
                    }
                  }

                  window.addEventListener('pageshow', function (e) {
                    if (!e.persisted) return;
                    var overlay = document.getElementById('page-transition');
                    if (!overlay) return;
                    overlay.style.animation = 'none';
                    overlay.offsetHeight;
                    overlay.style.animation = 'overlayEnter 0.55s ease-out both';
                  });

                  document.addEventListener('DOMContentLoaded', function() {
                    document.body.addEventListener('click', function(e) {
                      var link = e.target.closest('a');
                      if (!link) return;
                      var href = link.getAttribute('href');
                      // Catch links leaving the blog but staying on the site
                      if (href && (href.startsWith('https://blessephraem.github.io') || href.startsWith('/Portfolio') || href === '/' || href.startsWith('/wiki'))) {
                        if (href.includes('/news/')) return;
                        if (link.getAttribute('target') === '_blank') return;
                        e.preventDefault();
                        leaveAndNavigate(href);
                      }
                    });
                  });
                `,
              },
            ],
          };
        },
      };
    },
  ],

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
            href: 'https://blessephraem.github.io',
            label: 'Menu',
            position: 'right',
          },
          {
            href: 'https://blessephraem.github.io/wiki/',
            label: 'Wiki',
            position: 'right',
          },
          {
            href: 'https://blessephraem.github.io/Portfolio',
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
