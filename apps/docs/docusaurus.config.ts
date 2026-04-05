import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DevTrends Docs',
  tagline: 'Contributor documentation for DevTrends',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'https://www.devtrends.pro',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Surge77/social-media-tracker/tree/main/apps/docs/',
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DevTrends Docs',
      logo: {
        alt: 'DevTrends Docs',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Contributor Docs',
        },
        {
          href: 'https://www.devtrends.pro',
          label: 'Product App',
          position: 'right',
        },
        {
          href: 'https://github.com/Surge77/social-media-tracker',
          label: 'Repository',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Start Here',
          items: [
            {
              label: 'Docs Home',
              to: '/',
            },
            {
              label: 'Local Development',
              to: '/getting-started/local-development',
            },
            {
              label: 'System Overview',
              to: '/architecture/system-overview',
            },
          ],
        },
        {
          title: 'Product',
          items: [
            {
              label: 'DevTrends App',
              href: 'https://www.devtrends.pro',
            },
            {
              label: 'Repository',
              href: 'https://github.com/Surge77/social-media-tracker',
            },
          ],
        },
      ],
      copyright: `Copyright (c) ${new Date().getFullYear()} DevTrends.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
