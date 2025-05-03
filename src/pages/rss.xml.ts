// import rss from '@astrojs/rss';
// import { getCollection } from 'astro:content';
// import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';
// import type { APIContext } from 'astro';

// export async function GET(context: APIContext) {
//   const blog = await getCollection('blog');
//   const posts = blog.filter((post) => !post.data.draft);

//   return rss({
//     title: SITE_TITLE,
//     description: SITE_DESCRIPTION,
//     site: context.site?.toString() || SITE_URL,
//     items: posts.map((post) => ({
//       title: post.data.title,
//       pubDate: post.data.createDate,
//       description: post.body.slice(0, 200) + '...',
//       link: `/posts/${post.slug}/`,
//       categories: post.data.tags,
//     })),
//     customData: `<language>ja</language>`,
//   });
// }
