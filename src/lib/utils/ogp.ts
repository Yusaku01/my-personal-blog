import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_OGP_IMAGE =
  'https://cdn.qiita.com/assets/qiita-fb-2887e7b4aad86fd8c25cea84846f2236.png';

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const CACHE_DIR = path.join(process.cwd(), '.astro-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'ogp-cache.json');

const IMAGE_PROXY_BASE = 'https://images.weserv.nl';
const OPTIMIZED_WIDTH = 600;
const OPTIMIZED_HEIGHT = 315;
const OPTIMIZED_QUALITY = 75;

type OgpCacheEntry = {
  imageUrl: string;
  fetchedAt: number;
};

type OgpCache = Record<string, OgpCacheEntry>;

let memoryCache: OgpCache | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function loadCache(): Promise<OgpCache> {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    memoryCache = JSON.parse(raw) as OgpCache;
  } catch {
    memoryCache = {};
  }

  return memoryCache;
}

async function saveCache(cache: OgpCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const data = JSON.stringify(cache, null, 2);
  writeQueue = writeQueue.then(() => fs.writeFile(CACHE_FILE, data, 'utf8'));
  await writeQueue;
}

function isCacheEntryFresh(entry: OgpCacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

function createOptimizedImageUrl(originalUrl: string): string {
  try {
    const targetUrl = new URL(originalUrl);

    // Qiita imgix URLs have complex nested encoding that breaks parameter modification
    // Return original URL to avoid 403 errors and parameter inconsistency
    if (targetUrl.hostname === 'qiita-user-contents.imgix.net') {
      return originalUrl;
    }

    const hostWithPort = targetUrl.port
      ? `${targetUrl.hostname}:${targetUrl.port}`
      : targetUrl.hostname;
    const protocolPrefix = targetUrl.protocol === 'https:' ? 'ssl:' : '';

    // images.weserv.nl expects scheme-less URLs, with an "ssl:" prefix to proxy HTTPS sources
    const proxiedPath = `${protocolPrefix}${hostWithPort}${targetUrl.pathname}${targetUrl.search}`;
    const params = new URLSearchParams({
      url: proxiedPath,
      w: String(OPTIMIZED_WIDTH),
      h: String(OPTIMIZED_HEIGHT),
      fit: 'cover',
      we: 'true',
      q: String(OPTIMIZED_QUALITY),
    });

    return `${IMAGE_PROXY_BASE}/?${params.toString()}`;
  } catch {
    // If URL parsing fails, fall back to the original URL
    return originalUrl;
  }
}

export async function getOGPImage(url: string): Promise<string> {
  const cache = await loadCache();
  const cached = cache[url];

  if (cached && isCacheEntryFresh(cached)) {
    return createOptimizedImageUrl(cached.imageUrl);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page HTML: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');

    const imageUrl = ogImage || DEFAULT_OGP_IMAGE;
    cache[url] = { imageUrl, fetchedAt: Date.now() };
    await saveCache(cache);

    return createOptimizedImageUrl(imageUrl);
  } catch {
    if (cached) {
      return createOptimizedImageUrl(cached.imageUrl);
    }

    return createOptimizedImageUrl(DEFAULT_OGP_IMAGE);
  }
}
