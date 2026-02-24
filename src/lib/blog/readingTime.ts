export const JAPANESE_AVERAGE_CHARS_PER_MINUTE = 653;

const CODE_FENCE_PATTERN = /```[\s\S]*?```/g;
const INLINE_CODE_PATTERN = /`[^`\n]+`/g;
const IMAGE_PATTERN = /!\[([^\]]*)]\([^)]+\)/g;
const LINK_PATTERN = /\[([^\]]+)]\([^)]+\)/g;
const FOOTNOTE_DEF_PATTERN = /^\[\^[^\]]+]:.*$/gm;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const MARKDOWN_SYMBOL_PATTERN = /[*_~>#]/g;
const LIST_MARKER_PATTERN = /^\s*([-+*]|\d+\.)\s+/gm;
const HEADING_PATTERN = /^\s{0,3}#{1,6}\s+/gm;

const normalizeReadableText = (markdown: string): string => {
  return markdown
    .replace(CODE_FENCE_PATTERN, ' ')
    .replace(INLINE_CODE_PATTERN, ' ')
    .replace(IMAGE_PATTERN, '$1')
    .replace(LINK_PATTERN, '$1')
    .replace(FOOTNOTE_DEF_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(HEADING_PATTERN, '')
    .replace(LIST_MARKER_PATTERN, '')
    .replace(MARKDOWN_SYMBOL_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getReadableCharacterCount = (markdown: string): number => {
  const normalized = normalizeReadableText(markdown);
  return normalized.replace(/\s+/g, '').length;
};

export const getEstimatedReadingTimeMinutes = (
  markdown: string,
  charsPerMinute = JAPANESE_AVERAGE_CHARS_PER_MINUTE
): number => {
  const readableCharacters = getReadableCharacterCount(markdown);

  if (readableCharacters === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(readableCharacters / charsPerMinute));
};
