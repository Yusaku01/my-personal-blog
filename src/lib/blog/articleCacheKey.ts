import type { Locale } from '../i18n';
import type { Post } from '../../types';

type RelatedPostCard = Pick<Post, 'url' | 'title' | 'excerpt' | 'publishDate'>;

export type BlogArticleCacheKeyInput = {
  locale: Locale;
  post: {
    id: string;
    digest?: string | number | null;
  };
  relatedPosts: readonly RelatedPostCard[];
};

const CACHE_KEY_SCHEMA_VERSION = 1;

/**
 * Returns a stable key for the data rendered by a localized blog article route.
 */
export const createBlogArticleCacheKey = ({
  locale,
  post,
  relatedPosts,
}: BlogArticleCacheKeyInput): string => {
  if (post.digest === null || post.digest === undefined || String(post.digest).length === 0) {
    throw new Error(`Cannot create a blog article cache key without a digest: ${post.id}`);
  }

  return JSON.stringify({
    version: CACHE_KEY_SCHEMA_VERSION,
    locale,
    post: {
      id: post.id,
      digest: String(post.digest),
    },
    relatedPosts: relatedPosts.map(({ url, title, excerpt, publishDate }) => [
      url,
      title,
      excerpt?.trim() ?? null,
      new Date(publishDate).toISOString(),
    ]),
  });
};
