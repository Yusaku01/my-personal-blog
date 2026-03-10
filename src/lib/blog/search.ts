import type { PostSource } from '../../types';

export type BlogSearchEntry = {
  url: string;
  source: PostSource;
  searchText: string;
};

type BlogSearchTextInput = {
  source: PostSource;
  title: string;
  tags?: string[];
  excerpt?: string;
  body?: string;
};

const FENCED_CODE_BLOCK_PATTERN = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;
const MARKDOWN_NOISE_PATTERN = /[#>*_~]/g;
const EXTRA_PUNCTUATION_PATTERN = /[()[\]{}]/g;
const WHITESPACE_PATTERN = /\s+/g;

export const normalizeSearchText = (value: string): string => {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(FENCED_CODE_BLOCK_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(MARKDOWN_IMAGE_PATTERN, ' $1 ')
    .replace(MARKDOWN_LINK_PATTERN, ' $1 ')
    .replace(MARKDOWN_NOISE_PATTERN, ' ')
    .replace(EXTRA_PUNCTUATION_PATTERN, ' ')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();
};

export const buildBlogSearchText = ({
  source,
  title,
  tags = [],
  excerpt,
  body,
}: BlogSearchTextInput): string => {
  const parts = [title, tags.join(' ')];

  if (source === 'personal') {
    parts.push(excerpt ?? '', body ?? '');
  }

  return normalizeSearchText(parts.join(' '));
};

export const matchesSearchQuery = (searchText: string, query: string): boolean => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearchText(searchText).includes(normalizedQuery);
};

export const buildBlogTabHref = (basePath: string, query: string): string => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return basePath;
  }

  const params = new URLSearchParams();
  params.set('q', trimmedQuery);
  return `${basePath}?${params.toString()}`;
};
