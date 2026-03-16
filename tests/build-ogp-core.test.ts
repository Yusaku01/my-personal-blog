import { describe, expect, it, vi } from 'vitest';
import {
  basicPages,
  createNode,
  createOgpElement,
  getBlogEntries,
  getPreviewTarget,
  loadFonts,
  normalizeTitle,
  resolveFontDir,
  runBuildOgp,
} from '../scripts/lib/build-ogp-core.js';

function createParser(chunks: string[]) {
  return {
    parse: vi.fn(() => chunks),
  };
}

function createLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  };
}

function createFont(name = 'Zen Kaku Gothic New', data = 'font', weight = 400) {
  return {
    name,
    data: Buffer.from(data),
    weight,
    style: 'normal',
  };
}

describe('normalizeTitle', () => {
  it('collapses whitespace and trims the result', () => {
    expect(normalizeTitle('  Hello \n   World\t ')).toBe('Hello World');
  });
});

describe('getPreviewTarget', () => {
  it('returns null when preview mode is not requested', () => {
    expect(getPreviewTarget(['node', 'scripts/build-ogp.js'])).toBeNull();
  });

  it('returns a normalized preview target', () => {
    expect(
      getPreviewTarget(['node', 'scripts/build-ogp.js', '--preview', '  Preview   Title  '])
    ).toEqual({
      slug: 'preview',
      filename: 'preview',
      title: 'Preview Title',
      isBasicPage: false,
    });
  });

  it('marks preview targets as basic pages when requested', () => {
    expect(
      getPreviewTarget(['node', 'scripts/build-ogp.js', '--preview', 'Preview Title', '--basic'])
    ).toMatchObject({
      isBasicPage: true,
    });
  });

  it('throws when preview mode is missing a title', () => {
    expect(() => getPreviewTarget(['node', 'scripts/build-ogp.js', '--preview'])).toThrow(
      'Preview title is missing. Use --preview "Title"'
    );
  });
});

describe('createNode', () => {
  it('creates a React-element-like object without importing React', () => {
    expect(
      createNode('div', { style: { color: 'black' } }, 'hello', createNode('span', {}, 'world'))
    ).toEqual({
      type: 'div',
      props: {
        style: { color: 'black' },
        children: ['hello', { type: 'span', props: { children: 'world' } }],
      },
    });
  });
});

describe('createOgpElement', () => {
  it('builds a Satori-compatible tree and includes the brand for article cards', () => {
    const element = createOgpElement(
      { title: 'OGP Title', isBasicPage: false },
      {
        parser: createParser(['OGP', ' ', 'Title']),
      }
    );

    expect(element.type).toBe('div');
    expect(element.props.style.width).toBe('1200px');
    expect(element.props.children).toHaveLength(2);

    const [titleNode, brandNode] = element.props.children;
    expect(titleNode.type).toBe('div');
    expect(titleNode.props.children).toHaveLength(3);
    expect(titleNode.props.style).toMatchObject({
      textAlign: 'left',
      justifyContent: 'flex-start',
    });
    expect(brandNode).toEqual({
      type: 'div',
      props: {
        style: expect.objectContaining({
          position: 'absolute',
          bottom: '40px',
          right: '40px',
        }),
        children: 'SAKUSPACE',
      },
    });
  });

  it('omits the brand block for basic pages', () => {
    const element = createOgpElement(
      { title: 'Basic Page', isBasicPage: true },
      {
        parser: createParser(['Basic Page']),
      }
    );

    expect(element.props.children).toMatchObject({
      type: 'div',
      props: {
        style: expect.objectContaining({
          fontSize: '58px',
          display: 'flex',
          textAlign: 'center',
          justifyContent: 'center',
        }),
      },
    });
  });
});

describe('getBlogEntries', () => {
  it('collects md and mdx files, skips underscored entries, and falls back to the slug', async () => {
    const readdirImpl = vi.fn(async () => [
      { name: 'first-post.mdx', isFile: () => true },
      { name: 'second-post.md', isFile: () => true },
      { name: '_draft-post.mdx', isFile: () => true },
      { name: 'images', isFile: () => false },
      { name: 'notes.txt', isFile: () => true },
    ]);
    const readFileImpl = vi
      .fn()
      .mockResolvedValueOnce('---\ntitle: First Post\n---')
      .mockResolvedValueOnce('---\ndescription: No title\n---');
    const matterImpl = vi
      .fn()
      .mockReturnValueOnce({ data: { title: 'First Post' } })
      .mockReturnValueOnce({ data: {} });

    await expect(
      getBlogEntries({
        contentDir: '/virtual/blog',
        readdirImpl,
        readFileImpl,
        matterImpl,
      })
    ).resolves.toEqual([
      {
        slug: 'first-post',
        filename: 'first-post',
        title: 'First Post',
        isBasicPage: false,
      },
      {
        slug: 'second-post',
        filename: 'second-post',
        title: 'second-post',
        isBasicPage: false,
      },
    ]);
  });

  it('returns an empty list when reading blog entries fails', async () => {
    const errorSpy = vi.fn();

    await expect(
      getBlogEntries({
        contentDir: '/virtual/blog',
        readdirImpl: vi.fn(async () => {
          throw new Error('read failed');
        }),
        logger: { error: errorSpy },
      })
    ).resolves.toEqual([]);

    expect(errorSpy).toHaveBeenCalled();
  });
});

describe('loadFonts', () => {
  it('resolves the font directory from the package path by default', async () => {
    const readdirImpl = vi
      .fn()
      .mockResolvedValueOnce(['zen-kaku-gothic-new-japanese-400-normal.woff'])
      .mockResolvedValueOnce([
        'zen-kaku-gothic-new-japanese-400-normal.woff',
        'zen-kaku-gothic-new-japanese-700-normal.woff',
        'zen-kaku-gothic-new-japanese-900-normal.woff',
      ]);
    const readFileImpl = vi
      .fn()
      .mockResolvedValueOnce(Buffer.from('regular'))
      .mockResolvedValueOnce(Buffer.from('bold'))
      .mockResolvedValueOnce(Buffer.from('heavy'));

    await expect(
      loadFonts({
        readdirImpl,
        readFileImpl,
        resolvePackagePathImpl: vi.fn(
          () => '/virtual/node_modules/@fontsource/zen-kaku-gothic-new/package.json'
        ),
      })
    ).resolves.toHaveLength(3);

    expect(readdirImpl).toHaveBeenNthCalledWith(
      1,
      '/virtual/node_modules/@fontsource/zen-kaku-gothic-new/files'
    );
    expect(readdirImpl).toHaveBeenNthCalledWith(
      2,
      '/virtual/node_modules/@fontsource/zen-kaku-gothic-new/files'
    );
  });

  it('prefers japanese subset font files when multiple subsets exist', async () => {
    const readdirImpl = vi.fn(async () => [
      'zen-kaku-gothic-new-10-400-normal.woff',
      'zen-kaku-gothic-new-10-700-normal.woff',
      'zen-kaku-gothic-new-10-900-normal.woff',
      'zen-kaku-gothic-new-japanese-400-normal.woff',
      'zen-kaku-gothic-new-japanese-700-normal.woff',
      'zen-kaku-gothic-new-japanese-900-normal.woff',
    ]);
    const readFileImpl = vi
      .fn()
      .mockResolvedValueOnce(Buffer.from('regular'))
      .mockResolvedValueOnce(Buffer.from('bold'))
      .mockResolvedValueOnce(Buffer.from('heavy'));

    await expect(
      loadFonts({
        fontDir: '/virtual/fonts',
        readdirImpl,
        readFileImpl,
      })
    ).resolves.toEqual([
      {
        name: 'Zen Kaku Gothic New',
        data: Buffer.from('regular'),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Zen Kaku Gothic New',
        data: Buffer.from('bold'),
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Zen Kaku Gothic New',
        data: Buffer.from('heavy'),
        weight: 900,
        style: 'normal',
      },
    ]);

    expect(readdirImpl).toHaveBeenCalledWith('/virtual/fonts');
    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-japanese-400-normal.woff'
    );
    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-japanese-700-normal.woff'
    );
    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-japanese-900-normal.woff'
    );
  });

  it('falls back to other matching subsets when japanese font files are unavailable', async () => {
    const readdirImpl = vi.fn(async () => [
      'zen-kaku-gothic-new-10-400-normal.woff',
      'zen-kaku-gothic-new-10-700-normal.woff',
      'zen-kaku-gothic-new-10-900-normal.woff',
    ]);
    const readFileImpl = vi
      .fn()
      .mockResolvedValueOnce(Buffer.from('regular'))
      .mockResolvedValueOnce(Buffer.from('bold'))
      .mockResolvedValueOnce(Buffer.from('heavy'));

    await expect(
      loadFonts({
        fontDir: '/virtual/fonts',
        readdirImpl,
        readFileImpl,
      })
    ).resolves.toHaveLength(3);

    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-10-400-normal.woff'
    );
    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-10-700-normal.woff'
    );
    expect(readFileImpl).toHaveBeenCalledWith(
      '/virtual/fonts/zen-kaku-gothic-new-10-900-normal.woff'
    );
  });
});

describe('resolveFontDir', () => {
  it('logs and rethrows when the direct dependency cannot be resolved', async () => {
    const errorSpy = vi.fn();

    await expect(
      resolveFontDir({
        readdirImpl: vi.fn(async () => []),
        logger: { error: errorSpy },
        resolvePackagePathImpl: vi.fn(() => {
          throw new Error('module not found');
        }),
      })
    ).rejects.toThrow('module not found');

    expect(errorSpy).toHaveBeenCalled();
  });
});

describe('runBuildOgp', () => {
  it('generates only the preview image in preview mode', async () => {
    const mkdirImpl = vi.fn();
    const writeFileImpl = vi.fn();
    const createOgpImage = vi.fn(async () => Buffer.from('preview-png'));
    const logger = createLogger();
    const getBlogEntries = vi.fn(async () => [
      { slug: 'first-post', filename: 'first-post', title: 'First Post', isBasicPage: false },
    ]);

    const result = await runBuildOgp({
      argv: ['node', 'scripts/build-ogp.js', '--preview', ' Preview Title '],
      outputDir: '/virtual/output',
      mkdirImpl,
      writeFileImpl,
      loadFonts: vi.fn(async () => [createFont()]),
      createOgpImage,
      getBlogEntries,
      logger,
    });

    expect(result.generatedCount).toBe(1);
    expect(result.targets).toEqual([
      {
        slug: 'preview',
        filename: 'preview',
        title: 'Preview Title',
        isBasicPage: false,
      },
    ]);
    expect(getBlogEntries).not.toHaveBeenCalled();
    expect(mkdirImpl).toHaveBeenCalledWith('/virtual/output', { recursive: true });
    expect(writeFileImpl).toHaveBeenCalledWith(
      '/virtual/output/preview.png',
      Buffer.from('preview-png')
    );
  });

  it('generates default pages and blog entries in normal mode', async () => {
    const writeFileImpl = vi.fn();
    const createOgpImage = vi.fn(async (target) => Buffer.from(target.filename));
    const logger = createLogger();
    const getBlogEntriesMock = vi.fn(async () => [
      { slug: 'first-post', filename: 'first-post', title: 'First Post', isBasicPage: false },
    ]);

    const result = await runBuildOgp({
      argv: ['node', 'scripts/build-ogp.js'],
      outputDir: '/virtual/output',
      mkdirImpl: vi.fn(),
      writeFileImpl,
      loadFonts: vi.fn(async () => [createFont()]),
      createOgpImage,
      getBlogEntries: getBlogEntriesMock,
      logger,
    });

    expect(getBlogEntriesMock).toHaveBeenCalledOnce();
    expect(result.generatedCount).toBe(basicPages.length + 1);
    expect(result.targets.at(-1)).toEqual({
      slug: 'first-post',
      filename: 'first-post',
      title: 'First Post',
      isBasicPage: false,
    });
    expect(writeFileImpl).toHaveBeenCalledWith(
      '/virtual/output/default.png',
      Buffer.from('default')
    );
    expect(writeFileImpl).toHaveBeenCalledWith(
      '/virtual/output/first-post.png',
      Buffer.from('first-post')
    );
  });
});
