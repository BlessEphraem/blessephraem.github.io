// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  programsSidebar: [
    {
      type: 'category',
      label: 'InputBar',
      link: { type: 'generated-index', title: 'InputBar', description: 'Fast application launcher for Windows.' },
      items: [
        'programs/inputbar/getting-started',
        'programs/inputbar/settings',
        'programs/inputbar/hotkeys',
        'programs/inputbar/theme',
        {
          type: 'category',
          label: 'Built-in Plugins',
          items: [
            'programs/inputbar/plugins',
            'programs/inputbar/plugins/app',
            'programs/inputbar/plugins/calc',
            'programs/inputbar/plugins/shell',
            'programs/inputbar/plugins/system',
            'programs/inputbar/plugins/everything',
          ],
        },
        'programs/inputbar/create-plugins',
        'programs/inputbar/ipc',
      ],
    },
    {
      type: 'category',
      label: 'Premiere Companion',
      link: { type: 'generated-index', title: 'Premiere Companion', description: 'Effect and preset launcher for Adobe Premiere Pro.' },
      items: [
        'programs/premiere-companion/getting-started',
        'programs/premiere-companion/search-bar',
        'programs/premiere-companion/quick-apply',
        'programs/premiere-companion/commands',
        'programs/premiere-companion/macros-hotkeys',
        'programs/premiere-companion/better-motion',
      ],
    },
  ],
  pluginsSidebar: [
    {
      type: 'category',
      label: 'Plugins',
      items: [
        'plugins/jsx-runner',
        'plugins/jsx-scripts',
      ],
    },
  ],
};

export default sidebars;
