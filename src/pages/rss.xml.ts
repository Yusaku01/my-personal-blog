import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const SITE_TITLE = 'saku-space';
const SITE_DESCRIPTION = 'sakuのブログ - Web開発とデザインの記録';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');

  // _で始まるファイルは下書きとして扱う
  const posts = blog.filter((post) => !post.slug.startsWith('_'));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site?.toString() || 'https://saku-space.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>ja</language>`,
  });
}
