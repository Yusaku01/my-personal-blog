import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro';

export default defineConfig({
  integrations: [
    UnoCSS({
      // UnoCSS設定はuno.config.tsから読み込まれます
      injectReset: true, // CSSリセットを注入
    }),
    mdx(),
    react(),
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
