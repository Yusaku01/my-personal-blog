import * as cheerio from 'cheerio';

const DEFAULT_OGP_IMAGE =
  'https://cdn.qiita.com/assets/qiita-fb-2887e7b4aad86fd8c25cea84846f2236.png';

const IMAGE_PROXY_BASE = 'https://images.weserv.nl';
const OPTIMIZED_WIDTH = 600;
const OPTIMIZED_HEIGHT = 315;
const OPTIMIZED_QUALITY = 75;

function createOptimizedImageUrl(originalUrl: string): string {
  try {
    const targetUrl = new URL(originalUrl);

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
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');

    const imageUrl = ogImage || DEFAULT_OGP_IMAGE;
    return createOptimizedImageUrl(imageUrl);
  } catch (error) {
    console.error(`Failed to fetch OGP image for ${url}:`, error);
    return createOptimizedImageUrl(DEFAULT_OGP_IMAGE);
  }
}
