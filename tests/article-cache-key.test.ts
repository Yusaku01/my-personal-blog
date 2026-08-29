import { describe, expect, it } from 'vitest';
import { createBlogArticleCacheKey } from '../src/lib/blog/articleCacheKey';

describe('createBlogArticleCacheKey', () => {
  it('serializes the current article and displayed related cards in a stable order', () => {
    const input = {
      locale: 'ja' as const,
      post: {
        id: 'ja/incremental-build',
        digest: 'current-entry-digest',
      },
      relatedPosts: [
        {
          url: '/blog/first-related-post',
          title: 'First related post',
          excerpt: '  shown after trimming  ',
          publishDate: new Date('2026-08-28T12:34:56.000Z'),
        },
        {
          url: '/blog/second-related-post',
          title: 'Second related post',
          excerpt: undefined,
          publishDate: new Date('2026-08-27T00:00:00.000Z'),
        },
      ],
    };

    const cacheKey = createBlogArticleCacheKey(input);

    expect(cacheKey).toBe(
      '{"version":1,"locale":"ja","post":{"id":"ja/incremental-build","digest":"current-entry-digest"},"relatedPosts":[["/blog/first-related-post","First related post","shown after trimming","2026-08-28T12:34:56.000Z"],["/blog/second-related-post","Second related post",null,"2026-08-27T00:00:00.000Z"]]}'
    );
    expect(createBlogArticleCacheKey(input)).toBe(cacheKey);
  });

  it('fails closed when the current article has no content digest', () => {
    expect(() =>
      createBlogArticleCacheKey({
        locale: 'en',
        post: { id: 'en/incremental-build', digest: undefined },
        relatedPosts: [],
      })
    ).toThrow('Cannot create a blog article cache key without a digest: en/incremental-build');
  });

  it('keeps a Japanese fallback entry identity in an English route key', () => {
    expect(
      createBlogArticleCacheKey({
        locale: 'en',
        post: { id: 'ja/fallback-only-post', digest: 'fallback-entry-digest' },
        relatedPosts: [],
      })
    ).toBe(
      '{"version":1,"locale":"en","post":{"id":"ja/fallback-only-post","digest":"fallback-entry-digest"},"relatedPosts":[]}'
    );
  });
});
