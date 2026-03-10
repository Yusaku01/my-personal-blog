import type { SearchablePost } from '../../types';
import type { BlogSearchEntry } from './search';

export type SearchIndexEntry = BlogSearchEntry & {
  id: string;
  title: string;
  tags: string[];
  excerpt?: string;
};

export const createSearchIndexEntry = (post: SearchablePost): SearchIndexEntry => {
  return {
    id: post.url,
    url: post.url,
    source: post.source,
    title: post.title,
    tags: post.tags,
    excerpt: post.excerpt,
    searchText: post.searchText,
  };
};

export const buildSearchIndexEntries = (posts: SearchablePost[]): SearchIndexEntry[] => {
  return posts.map(createSearchIndexEntry);
};
