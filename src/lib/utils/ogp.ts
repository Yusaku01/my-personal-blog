import * as cheerio from 'cheerio';

const DEFAULT_OGP_IMAGE =
  'https://cdn.qiita.com/assets/qiita-fb-2887e7b4aad86fd8c25cea84846f2236.png';

export async function getOGPImage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');

    return ogImage || DEFAULT_OGP_IMAGE;
  } catch (error) {
    console.error(`Failed to fetch OGP image for ${url}:`, error);
    return DEFAULT_OGP_IMAGE;
  }
}
