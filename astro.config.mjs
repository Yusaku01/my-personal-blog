import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [
    UnoCSS({
      injectReset: true, // CSSリセットを注入
    }),
    mdx(),
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja-JP',
        },
      },
      // サイトマップから除外したいページを指定
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
    ssr: {
      noExternal: ['date-fns'],
    },
  },
});
