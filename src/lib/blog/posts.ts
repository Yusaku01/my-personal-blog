import { getCollection } from 'astro:content';
import { getQiitaPosts } from '../api-clients/qiita';
import { getZennPosts, getZennScraps } from '../api-clients/zenn';
import type { Post } from '../../types/index';

export async function getAllBlogPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  const qiitaPosts = await getQiitaPosts('ngtnysk');
  const zennPosts = await getZennPosts('saku2323');
  const zennScraps = await getZennScraps('saku2323');

  const allPosts: Post[] = [
    ...posts.map((post) => ({
      title: post.data.title,
      url: `/blog/${post.slug}`,
      publishDate: post.data.publishDate,
      excerpt: post.data.description,
      thumbnail: post.data.image,
      isExternal: false as const,
      source: 'personal' as const,
      tags: post.data.tags || [],
    })),
    ...qiitaPosts,
    ...zennPosts,
    ...zennScraps,
  ];

  return [...allPosts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}
