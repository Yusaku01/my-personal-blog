import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { getQiitaPosts } from '../api-clients/qiita';
import { getZennPosts, getZennScraps } from '../api-clients/zenn';
import type { Post, SearchablePost } from '../../types/index';
import { buildBlogSearchText } from './search';
import { buildSearchIndexEntries, type SearchIndexEntry } from './searchIndex';
import { defaultLocale, locales, localizedPath, type Locale } from '../i18n';

type BlogEntry = CollectionEntry<'blog'>;

type BlogEntryOptions = {
  includeDrafts?: boolean;
};

const shouldIncludeDraftEntries = (includeDrafts?: boolean): boolean =>
  includeDrafts ?? import.meta.env.DEV;

export const getBlogEntryLocale = (entry: BlogEntry): Locale | null => {
  const [locale] = entry.id.split('/');
  return locales.includes(locale as Locale) ? (locale as Locale) : null;
};

export const getBlogEntrySlug = (entry: BlogEntry): string => {
  const [, ...slugParts] = entry.id.split('/');
  return slugParts.join('/') || entry.id;
};

export const isDraftBlogEntry = (entry: BlogEntry): boolean =>
  getBlogEntrySlug(entry).startsWith('_');

export async function getBlogEntriesForLocale(
  locale: Locale = defaultLocale,
  { includeDrafts }: BlogEntryOptions = {}
): Promise<BlogEntry[]> {
  const posts = await getCollection('blog');
  const includeDraftEntries = shouldIncludeDraftEntries(includeDrafts);
  const publishedPosts = includeDraftEntries
    ? posts
    : posts.filter((post) => !isDraftBlogEntry(post));
  const jaPosts = publishedPosts.filter((post) => getBlogEntryLocale(post) === defaultLocale);

  if (locale === defaultLocale) {
    return jaPosts;
  }

  const localizedPostsBySlug = new Map(
    publishedPosts
      .filter((post) => getBlogEntryLocale(post) === locale)
      .map((post) => [getBlogEntrySlug(post), post])
  );
  const resolvedPosts = jaPosts.map(
    (post) => localizedPostsBySlug.get(getBlogEntrySlug(post)) ?? post
  );
  const jaSlugs = new Set(jaPosts.map((post) => getBlogEntrySlug(post)));
  const localeOnlyPosts = [...localizedPostsBySlug]
    .filter(([slug]) => !jaSlugs.has(slug))
    .map(([, post]) => post);

  return [...resolvedPosts, ...localeOnlyPosts];
}

export async function getAllBlogPosts(locale: Locale = 'ja'): Promise<SearchablePost[]> {
  const posts = await getBlogEntriesForLocale(locale);
  const qiitaPosts = await getQiitaPosts('ngtnysk');
  const zennPosts = await getZennPosts('saku2323');
  const zennScraps = await getZennScraps('saku2323');

  const allPosts: SearchablePost[] = [
    ...posts.map((post) => ({
      title: post.data.title,
      url: localizedPath(`/blog/${getBlogEntrySlug(post)}`, locale),
      publishDate: post.data.publishDate,
      excerpt: post.data.description,
      thumbnail: post.data.image,
      isExternal: false as const,
      source: 'personal' as const,
      tags: post.data.tags || [],
      searchText: buildBlogSearchText({
        source: 'personal',
        title: post.data.title,
        tags: post.data.tags || [],
        excerpt: post.data.description,
        body: post.body,
      }),
    })),
    ...qiitaPosts.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
    ...zennPosts.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
    ...zennScraps.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
  ];

  return [...allPosts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export async function getRelatedBlogPosts(
  currentPost: BlogEntry,
  locale: Locale = 'ja',
  limit = 2
): Promise<Post[]> {
  const currentSlug = getBlogEntrySlug(currentPost);
  const currentTags = new Set(currentPost.data.tags.map((tag) => tag.toLowerCase()));

  if (currentTags.size === 0) {
    return [];
  }

  const posts = await getBlogEntriesForLocale(locale);

  return posts
    .map((post) => {
      const matchingTagCount = post.data.tags.filter((tag) =>
        currentTags.has(tag.toLowerCase())
      ).length;

      return { post, matchingTagCount };
    })
    .filter(({ post, matchingTagCount }) => {
      return getBlogEntrySlug(post) !== currentSlug && matchingTagCount > 0;
    })
    .sort((a, b) => {
      if (b.matchingTagCount !== a.matchingTagCount) {
        return b.matchingTagCount - a.matchingTagCount;
      }

      return b.post.data.publishDate.getTime() - a.post.data.publishDate.getTime();
    })
    .slice(0, limit)
    .map(({ post }) => ({
      title: post.data.title,
      url: localizedPath(`/blog/${getBlogEntrySlug(post)}`, locale),
      publishDate: post.data.publishDate,
      excerpt: post.data.description,
      thumbnail: post.data.image,
      isExternal: false as const,
      source: 'personal' as const,
      tags: post.data.tags || [],
    }));
}

export async function getSearchIndexEntries(locale: Locale = 'ja'): Promise<SearchIndexEntry[]> {
  const posts = await getAllBlogPosts(locale);
  return buildSearchIndexEntries(posts);
}
