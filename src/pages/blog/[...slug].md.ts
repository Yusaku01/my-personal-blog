import type { APIRoute } from 'astro';
import { getBlogEntriesForLocale, getBlogEntrySlug } from '../../lib/blog/posts';

export const prerender = true;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const posts = await getBlogEntriesForLocale('ja');
    const post = posts.find((p) => getBlogEntrySlug(p) === slug);

    if (!post?.body) {
      return new Response('Not Found', { status: 404 });
    }

    // Markdownコンテンツを返す
    return new Response(post.body.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error reading markdown content:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

// 静的パスの生成
export async function getStaticPaths() {
  const posts = await getBlogEntriesForLocale('ja');
  return posts.map((post) => ({
    params: { slug: getBlogEntrySlug(post) },
    cacheKey: String(post.digest ?? post.body ?? ''),
  }));
}
