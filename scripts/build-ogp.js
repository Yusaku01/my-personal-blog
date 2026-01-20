// build-ogp.js - OGP画像自動生成スクリプト
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadDefaultJapaneseParser } from 'budoux';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const outputDir = path.join(process.cwd(), 'public', 'images', 'ogp');

const WIDTH = 1200;
const HEIGHT = 630;

const parser = loadDefaultJapaneseParser();

const basicPages = [
  { slug: 'index', filename: 'default', title: 'SAKUSPACE', isBasicPage: true },
  { slug: 'blog', filename: 'blog', title: 'BLOG', isBasicPage: true },
  {
    slug: 'blog-personal',
    filename: 'blog-personal',
    title: 'BLOG | 個人ブログ',
    isBasicPage: true,
  },
  {
    slug: 'blog-zenn',
    filename: 'blog-zenn',
    title: 'BLOG | Zenn',
    isBasicPage: true,
  },
  {
    slug: 'blog-qiita',
    filename: 'blog-qiita',
    title: 'BLOG | Qiita',
    isBasicPage: true,
  },
  { slug: 'finds', filename: 'finds', title: 'FINDS', isBasicPage: true },
  { slug: 'profile', filename: 'profile', title: 'PROFILE', isBasicPage: true },
  { slug: 'contact', filename: 'contact', title: 'CONTACT', isBasicPage: true },
];

function normalizeTitle(title) {
  return title.replace(/\s+/g, ' ').trim();
}

function createTitleNodes(title) {
  const normalizedTitle = normalizeTitle(title);
  const chunks = parser.parse(normalizedTitle);
  return chunks.map((chunk, index) =>
    React.createElement('span', { key: `title-chunk-${index}` }, chunk)
  );
}

function getPreviewTarget() {
  const previewIndex = process.argv.indexOf('--preview');
  if (previewIndex === -1) return null;

  const previewTitle = process.argv[previewIndex + 1];
  if (!previewTitle) {
    throw new Error('Preview title is missing. Use --preview "Title"');
  }

  return {
    slug: 'preview',
    filename: 'preview',
    title: normalizeTitle(previewTitle),
    isBasicPage: process.argv.includes('--basic'),
  };
}

async function loadFonts() {
  const fontDir = path.join(
    __dirname,
    '..',
    'node_modules',
    '@fontsource',
    'zen-kaku-gothic-new',
    'files'
  );

  const [regular, bold, heavy] = await Promise.all([
    readFile(path.join(fontDir, 'zen-kaku-gothic-new-japanese-400-normal.woff')),
    readFile(path.join(fontDir, 'zen-kaku-gothic-new-japanese-700-normal.woff')),
    readFile(path.join(fontDir, 'zen-kaku-gothic-new-japanese-900-normal.woff')),
  ]);

  return [
    {
      name: 'Zen Kaku Gothic New',
      data: regular,
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Zen Kaku Gothic New',
      data: bold,
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Zen Kaku Gothic New',
      data: heavy,
      weight: 900,
      style: 'normal',
    },
  ];
}

function createOgpElement({ title, isBasicPage }) {
  const titleNodes = createTitleNodes(title);
  const baseStyle = {
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontFamily: 'Zen Kaku Gothic New',
    position: 'relative',
  };

  const titleStyle = {
    fontSize: isBasicPage ? '58px' : '48px',
    fontWeight: 900,
    lineHeight: 1.3,
    textAlign: 'center',
    maxWidth: '80%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'normal',
    rowGap: '0px',
    columnGap: '0px',
  };

  const brandStyle = {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    fontSize: '30px',
    fontWeight: 900,
  };

  return React.createElement(
    'div',
    { style: baseStyle },
    React.createElement('div', { style: titleStyle }, titleNodes),
    !isBasicPage && React.createElement('div', { style: brandStyle }, 'SAKUSPACE')
  );
}

async function createOgpImage({ title, isBasicPage }, fonts) {
  const svg = await satori(createOgpElement({ title, isBasicPage }), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

async function getBlogEntries() {
  try {
    const entries = await readdir(contentDir, { withFileTypes: true });
    const posts = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) continue;
      if (entry.name.startsWith('_')) continue;

      const slug = entry.name.replace(/\.mdx?$/, '');
      const filePath = path.join(contentDir, entry.name);
      const fileContents = await readFile(filePath, 'utf-8');
      const { data } = matter(fileContents);

      posts.push({
        slug,
        filename: slug,
        title: data.title || slug,
        isBasicPage: false,
      });
    }

    return posts;
  } catch (error) {
    console.error('❌ ブログ記事の読み込みに失敗しました:', error);
    return [];
  }
}

async function generateOGImages() {
  console.log('📜️ OGP画像を生成しています...');

  await mkdir(outputDir, { recursive: true });

  const fonts = await loadFonts();
  const previewTarget = getPreviewTarget();

  if (previewTarget) {
    console.log(`🧪 Preview OGPを生成しています: ${previewTarget.title}`);
    const png = await createOgpImage(previewTarget, fonts);
    await writeFile(path.join(outputDir, `${previewTarget.filename}.png`), png);
    console.log(`  ✓ ${previewTarget.filename}.png を保存しました`);
    console.log('🎉 Preview OGPの生成が完了しました!');
    return;
  }
  const blogEntries = await getBlogEntries();
  const targets = [...basicPages, ...blogEntries];

  console.log(`✅ 合計 ${targets.length} ページのOGP画像を生成します`);

  for (const target of targets) {
    const label = target.slug ?? target.filename;
    console.log(`📷 ${label}のOGP画像を生成しています...`);

    const png = await createOgpImage(target, fonts);
    await writeFile(path.join(outputDir, `${target.filename}.png`), png);

    console.log(`  ✓ ${target.filename}.png を保存しました`);
  }

  console.log('🎉 OGP画像の生成が完了しました!');
}

generateOGImages().catch((error) => {
  console.error('❌ OGP画像生成中にエラーが発生しました:', error);
  process.exit(1);
});
