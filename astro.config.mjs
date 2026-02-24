import { defineConfig } from 'astro/config';
// もしSSRにするときは、以下コメントアウトを解除
// import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import remarkLinkCard from 'remark-link-card';
import externalLinkIcon from './src/lib/rehype/externalLinkIcon';
import footnoteBackrefIcon from './src/lib/rehype/footnoteBackrefIcon';
import remarkAdmonition from './src/lib/remark/admonition.ts';
import codeFenceFilename from './src/lib/remark/codeFenceFilename.ts';
import disableLinkCardInList from './src/lib/remark/disableLinkCardInList.ts';

const readMetaAttribute = (meta, attributeName) => {
  if (typeof meta !== 'string' || meta.length === 0) {
    return null;
  }

  const attributePattern = new RegExp(
    `(?:^|\\s)${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"']+))`
  );
  const match = meta.match(attributePattern);
  if (!match) {
    return null;
  }

  return match[1] ?? match[2] ?? match[3] ?? null;
};

const codeFilenameMetaTransformer = {
  pre(node) {
    const rawMeta = this.options?.meta?.__raw;
    if (typeof rawMeta !== 'string' || rawMeta.length === 0) {
      return;
    }

    const codeFilename =
      readMetaAttribute(rawMeta, 'filename') ?? readMetaAttribute(rawMeta, 'title');
    if (!codeFilename) {
      return;
    }

    node.properties ??= {};
    node.properties.dataCodeFilename = codeFilename;
  },
};

export default defineConfig({
  site: 'https://saku-space.com',
  cacheDir: './.astro-cache',
  output: 'static',
  image: {
    domains: [
      'qiita-user-contents.imgix.net',
      'res.cloudinary.com',
      'cdn.qiita.com',
      'images.weserv.nl',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qiita-user-contents.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.qiita.com',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
    ],
  },
  // devToolbar: { enabled: false },
  integrations: [
    UnoCSS({
      injectReset: true, // CSSリセットを注入
    }),
    mdx({
      rehypePlugins: [[externalLinkIcon, { site: 'https://saku-space.com' }], footnoteBackrefIcon],
    }),
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja-JP',
        },
      },
      // サイトマップから除外したいページを指定
      filter: (page) => !page.includes('/admin/') && !page.includes('/api/'),
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkAdmonition,
      disableLinkCardInList,
      codeFenceFilename,
      [remarkLinkCard, { shortenUrl: true }],
    ],
    rehypePlugins: [[externalLinkIcon, { site: 'https://saku-space.com' }], footnoteBackrefIcon],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      transformers: [codeFilenameMetaTransformer],
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
      manifest: true,
      cssCodeSplit: true,
    },
    ssr: {
      noExternal: ['date-fns'],
    },
  },
});
