import { defineConfig } from 'astro/config';
// もしSSRにするときは、以下コメントアウトを解除
// import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://saku-space.com',
  output: 'static',
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
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
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
      cssCodeSplit: true,
    },
    ssr: {
      noExternal: ['date-fns'],
    },
  },
});
