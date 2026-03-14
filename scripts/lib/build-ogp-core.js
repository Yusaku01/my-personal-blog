import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadDefaultJapaneseParser } from 'budoux';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');
const defaultContentDir = path.join(projectRoot, 'src', 'content', 'blog');
const defaultOutputDir = path.join(projectRoot, 'public', 'images', 'ogp');
const directFontDir = path.join(
  projectRoot,
  'node_modules',
  '@fontsource',
  'zen-kaku-gothic-new',
  'files'
);
const pnpmStoreDir = path.join(projectRoot, 'node_modules', '.pnpm');

export const WIDTH = 1200;
export const HEIGHT = 630;

const defaultParser = loadDefaultJapaneseParser();

export const basicPages = [
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

export function normalizeTitle(title) {
  return title.replace(/\s+/g, ' ').trim();
}

export function createNode(type, props = {}, ...children) {
  const normalizedChildren = children.flat().filter((child) => child !== null && child !== false);
  return {
    type,
    props: {
      ...props,
      ...(normalizedChildren.length > 0
        ? {
            children: normalizedChildren.length === 1 ? normalizedChildren[0] : normalizedChildren,
          }
        : {}),
    },
  };
}

export function createTitleNodes(title, { parser = defaultParser } = {}) {
  const normalizedTitle = normalizeTitle(title);
  const chunks = parser.parse(normalizedTitle);
  return chunks.map((chunk, index) => createNode('span', { key: `title-chunk-${index}` }, chunk));
}

export function getPreviewTarget(argv = process.argv) {
  const previewIndex = argv.indexOf('--preview');
  if (previewIndex === -1) {
    return null;
  }

  const previewTitle = argv[previewIndex + 1];
  if (!previewTitle) {
    throw new Error('Preview title is missing. Use --preview "Title"');
  }

  return {
    slug: 'preview',
    filename: 'preview',
    title: normalizeTitle(previewTitle),
    isBasicPage: argv.includes('--basic'),
  };
}

export async function loadFonts({ fontDir, readdirImpl = readdir, readFileImpl = readFile } = {}) {
  const resolvedFontDir = fontDir ?? (await resolveFontDir({ readdirImpl, logger: console }));
  const filenames = await readdirImpl(resolvedFontDir);
  const resolveFontPath = (weight) => {
    const filename =
      filenames.find((name) => name === `zen-kaku-gothic-new-japanese-${weight}-normal.woff`) ??
      filenames.find((name) => name === `zen-kaku-gothic-new-japanese-${weight}-normal.woff2`) ??
      filenames.find((name) => name.endsWith(`-${weight}-normal.woff`)) ??
      filenames.find((name) => name.endsWith(`-${weight}-normal.woff2`));

    if (!filename) {
      throw new Error(
        `Required font file for weight ${weight} was not found in ${resolvedFontDir}`
      );
    }

    return path.join(resolvedFontDir, filename);
  };

  const [regular, bold, heavy] = await Promise.all([
    readFileImpl(resolveFontPath(400)),
    readFileImpl(resolveFontPath(700)),
    readFileImpl(resolveFontPath(900)),
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

async function resolveFontDir({ readdirImpl, logger }) {
  try {
    await readdirImpl(directFontDir);
    return directFontDir;
  } catch {
    // Fall through to pnpm's nested package layout.
  }

  try {
    const pnpmEntries = await readdirImpl(pnpmStoreDir);
    const fontPackageDir = pnpmEntries.find((entry) =>
      entry.startsWith('@fontsource+zen-kaku-gothic-new@')
    );

    if (!fontPackageDir) {
      throw new Error('Font package directory was not found in pnpm store');
    }

    return path.join(
      pnpmStoreDir,
      fontPackageDir,
      'node_modules',
      '@fontsource',
      'zen-kaku-gothic-new',
      'files'
    );
  } catch (error) {
    logger?.error?.('❌ OGPフォントの解決に失敗しました:', error);
    throw error;
  }
}

export function createOgpElement({ title, isBasicPage }, { parser = defaultParser } = {}) {
  const titleNodes = createTitleNodes(title, { parser });
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
    fontSize: isBasicPage ? '58px' : '50px',
    fontWeight: 900,
    lineHeight: 1.3,
    textAlign: isBasicPage ? 'center' : 'left',
    maxWidth: '88%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: isBasicPage ? 'center' : 'flex-start',
    alignItems: 'center',
    whiteSpace: 'normal',
    rowGap: '0px',
    columnGap: '0px',
  };

  const brandStyle = {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    fontSize: '34px',
    fontWeight: 900,
  };

  // Satori accepts React-element-like objects, so this script does not need React itself.
  return createNode(
    'div',
    { style: baseStyle },
    createNode('div', { style: titleStyle }, titleNodes),
    !isBasicPage ? createNode('div', { style: brandStyle }, 'SAKUSPACE') : null
  );
}

export async function createOgpImage(
  target,
  fonts,
  { parser = defaultParser, satoriImpl = satori, resvgClass = Resvg } = {}
) {
  const svg = await satoriImpl(createOgpElement(target, { parser }), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new resvgClass(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

export async function getBlogEntries({
  contentDir = defaultContentDir,
  readdirImpl = readdir,
  readFileImpl = readFile,
  matterImpl = matter,
  logger = console,
} = {}) {
  try {
    const entries = await readdirImpl(contentDir, { withFileTypes: true });
    const posts = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) continue;
      if (entry.name.startsWith('_')) continue;

      const slug = entry.name.replace(/\.mdx?$/, '');
      const filePath = path.join(contentDir, entry.name);
      const fileContents = await readFileImpl(filePath, 'utf-8');
      const { data } = matterImpl(fileContents);

      posts.push({
        slug,
        filename: slug,
        title: data.title || slug,
        isBasicPage: false,
      });
    }

    return posts;
  } catch (error) {
    logger.error('❌ ブログ記事の読み込みに失敗しました:', error);
    return [];
  }
}

export async function runBuildOgp({
  argv = process.argv,
  outputDir = defaultOutputDir,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  loadFonts: loadFontsImpl = loadFonts,
  createOgpImage: createOgpImageImpl = createOgpImage,
  getBlogEntries: getBlogEntriesImpl = getBlogEntries,
  logger = console,
} = {}) {
  logger.log('📜️ OGP画像を生成しています...');

  await mkdirImpl(outputDir, { recursive: true });

  const fonts = await loadFontsImpl();
  const previewTarget = getPreviewTarget(argv);
  const targets = previewTarget
    ? [previewTarget]
    : [...basicPages, ...(await getBlogEntriesImpl())];

  if (previewTarget) {
    logger.log(`🧪 Preview OGPを生成しています: ${previewTarget.title}`);
  } else {
    logger.log(`✅ 合計 ${targets.length} ページのOGP画像を生成します`);
  }

  for (const target of targets) {
    if (!previewTarget) {
      const label = target.slug ?? target.filename;
      logger.log(`📷 ${label}のOGP画像を生成しています...`);
    }

    const png = await createOgpImageImpl(target, fonts);
    await writeFileImpl(path.join(outputDir, `${target.filename}.png`), png);
    logger.log(`  ✓ ${target.filename}.png を保存しました`);
  }

  logger.log(
    previewTarget ? '🎉 Preview OGPの生成が完了しました!' : '🎉 OGP画像の生成が完了しました!'
  );

  return {
    generatedCount: targets.length,
    targets,
  };
}
