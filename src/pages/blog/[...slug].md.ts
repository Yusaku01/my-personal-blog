import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    // コンテンツコレクションから該当する記事を検索
    const posts = await getCollection('blog');
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      return new Response('Not Found', { status: 404 });
    }

    // MDXファイルのパスを構築
    const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const filePath = path.join(contentDir, `${post.id}`);

    // ファイルの生のコンテンツを読み込む
    const rawContent = await fs.readFile(filePath, 'utf-8');

    // フロントマターを除去（最初の---から2番目の---まで）
    const contentMatch = rawContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const markdownContent = contentMatch ? contentMatch[1].trim() : rawContent;

    // Markdownコンテンツを返す
    return new Response(markdownContent, {
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
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}
