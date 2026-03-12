import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import he from 'he';
import ogs from 'open-graph-scraper';
import sanitize from 'sanitize-filename';
import { visit } from 'unist-util-visit';

type GenericNode = {
  type: string;
  children?: GenericNode[];
  data?: Record<string, unknown>;
  value?: unknown;
};

type ParagraphNode = GenericNode & {
  type: 'paragraph';
  children: GenericNode[];
};

type TextNode = GenericNode & {
  type: 'text';
  value: string;
};

type LinkNode = GenericNode & {
  type: 'link';
  url: string;
  children?: GenericNode[];
};

type LinkCardOptions = {
  cache?: boolean;
  shortenUrl?: boolean;
};

const URL_PATTERN = /(https?:\/\/|www(?=\.))([-.\w]+)([^\s]*)/g;
const URL_ONLY_PATTERN = /^(https?:\/\/|www(?=\.))([-.\w]+)([^\s]*)$/i;
const DEFAULT_SAVE_DIRECTORY = 'public';
const DEFAULT_OUTPUT_DIRECTORY = '/remark-link-card/';

const isParagraphNode = (value: unknown): value is ParagraphNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown; children?: unknown };
  return candidate.type === 'paragraph' && Array.isArray(candidate.children);
};

const isTextNode = (value: unknown): value is TextNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown; value?: unknown };
  return candidate.type === 'text' && typeof candidate.value === 'string';
};

const isLinkNode = (value: unknown): value is LinkNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown; url?: unknown; children?: unknown };
  return (
    candidate.type === 'link' &&
    typeof candidate.url === 'string' &&
    (candidate.children === undefined || Array.isArray(candidate.children))
  );
};

export const getParagraphUrlCandidate = (node: ParagraphNode) => {
  if (node.children.length !== 1 || node.data?._skipLinkCardInList) {
    return null;
  }

  const [child] = node.children;
  if (isTextNode(child)) {
    const urls = child.value.match(URL_PATTERN);
    if (!urls || urls.length !== 1) {
      return null;
    }

    return urls[0];
  }

  if (!isLinkNode(child)) {
    return null;
  }

  const linkText =
    child.children?.length === 1 && isTextNode(child.children[0])
      ? child.children[0].value.trim()
      : '';

  if (linkText !== '' && linkText !== child.url) {
    return null;
  }

  return URL_ONLY_PATTERN.test(child.url) ? child.url : null;
};

const getOpenGraph = async (targetUrl: string) => {
  try {
    const { result } = await ogs({ url: targetUrl, timeout: 10000 });
    return result;
  } catch {
    return undefined;
  }
};

const downloadImage = async (url: string, saveDirectory: string) => {
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return undefined;
  }

  const filename = sanitize(decodeURI(targetUrl.href));
  const saveFilePath = path.join(saveDirectory, filename);

  try {
    await access(saveFilePath);
    return filename;
  } catch {
    // Continue and write the file below.
  }

  await mkdir(saveDirectory, { recursive: true });

  try {
    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const arrayBuffer = await response.arrayBuffer();
    await writeFile(saveFilePath, Buffer.from(arrayBuffer));
    return filename;
  } catch {
    return undefined;
  }
};

const fetchData = async (targetUrl: string, options?: LinkCardOptions) => {
  const ogResult = await getOpenGraph(targetUrl);
  const parsedUrl = new URL(targetUrl);

  const title = (ogResult?.ogTitle && he.encode(ogResult.ogTitle)) || parsedUrl.hostname;
  const description = (ogResult?.ogDescription && he.encode(ogResult.ogDescription)) || '';

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
  let faviconSrc = faviconUrl;

  if (options?.cache) {
    const faviconFilename = await downloadImage(
      faviconUrl,
      path.join(process.cwd(), DEFAULT_SAVE_DIRECTORY, DEFAULT_OUTPUT_DIRECTORY)
    );
    faviconSrc = faviconFilename
      ? path.join(DEFAULT_OUTPUT_DIRECTORY, faviconFilename)
      : faviconUrl;
  }

  let ogImageSrc = '';
  if (ogResult?.ogImage?.url) {
    if (options?.cache) {
      const imageFilename = await downloadImage(
        ogResult.ogImage.url,
        path.join(process.cwd(), DEFAULT_SAVE_DIRECTORY, DEFAULT_OUTPUT_DIRECTORY)
      );
      ogImageSrc = imageFilename
        ? path.join(DEFAULT_OUTPUT_DIRECTORY, imageFilename)
        : ogResult.ogImage.url;
    } else {
      ogImageSrc = ogResult.ogImage.url;
    }
  }

  const ogImageAlt = (ogResult?.ogImage?.alt && he.encode(ogResult.ogImage.alt)) || title;

  let displayUrl = options?.shortenUrl ? parsedUrl.hostname : targetUrl;
  try {
    displayUrl = decodeURI(displayUrl);
  } catch {
    // Keep the original value when decoding fails.
  }

  return {
    description,
    displayUrl,
    faviconSrc,
    ogImageAlt,
    ogImageSrc,
    title,
    url: targetUrl,
  };
};

const createLinkCard = (data: Awaited<ReturnType<typeof fetchData>>) => {
  const faviconElement = data.faviconSrc
    ? `<img class="rlc-favicon" src="${data.faviconSrc}" alt="${data.title} favicon" width="16" height="16">`
    : '';

  const descriptionElement = data.description
    ? `<div class="rlc-description">${data.description}</div>`
    : '';

  const imageElement = data.ogImageSrc
    ? `<div class="rlc-image-container">
      <img class="rlc-image" src="${data.ogImageSrc}" alt="${data.ogImageAlt}" />
    </div>`
    : '';

  return `
<a class="rlc-container" href="${data.url}">
  <div class="rlc-info">
    <div class="rlc-title">${data.title}</div>
    ${descriptionElement}
    <div class="rlc-url-container">
      ${faviconElement}
      <span class="rlc-url">${data.displayUrl}</span>
    </div>
  </div>
  ${imageElement}
</a>
`.trim();
};

const remarkLinkCard = (options?: LinkCardOptions) => {
  return async (tree: GenericNode) => {
    const transformers: Array<() => Promise<void>> = [];

    visit(tree, 'paragraph', (node: unknown, index: number | undefined, parent: unknown) => {
      if (!isParagraphNode(node) || typeof index !== 'number') {
        return;
      }

      const urlCandidate = getParagraphUrlCandidate(node);
      if (!urlCandidate) {
        return;
      }

      transformers.push(async () => {
        const data = await fetchData(urlCandidate, options);
        const targetChildren =
          parent &&
          typeof parent === 'object' &&
          parent !== null &&
          Array.isArray((parent as GenericNode).children)
            ? (parent as GenericNode).children!
            : tree.children;

        if (!targetChildren) {
          return;
        }

        targetChildren.splice(index, 1, {
          type: 'html',
          value: createLinkCard(data),
        });
      });
    });

    try {
      await Promise.all(transformers.map((transformer) => transformer()));
    } catch {
      // Keep markdown rendering resilient when metadata fetches fail.
    }

    return tree;
  };
};

export default remarkLinkCard;
