import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getBlogEntriesForLocale, getBlogEntrySlug } from '../lib/blog/posts';

const SITE_TITLE = 'saku-space';
const SITE_DESCRIPTION = 'sakuのブログ - Web開発とデザインの記録';

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getBlogEntriesForLocale('ja');

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site?.toString() || 'https://saku-space.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${getBlogEntrySlug(post)}/`,
      categories: post.data.tags,
    })),
    customData: `<language>ja</language>`,
  });
}
