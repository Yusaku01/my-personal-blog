import { visit } from 'unist-util-visit';

type CodeNode = {
  type: 'code';
  lang?: string | null;
  meta?: string | null;
};

type VisitTree = Parameters<typeof visit>[0];

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  astro: 'astro',
  bash: 'bash',
  c: 'c',
  cc: 'cpp',
  cjs: 'js',
  cpp: 'cpp',
  css: 'css',
  fish: 'fish',
  go: 'go',
  gql: 'graphql',
  graphql: 'graphql',
  h: 'c',
  hpp: 'cpp',
  html: 'html',
  java: 'java',
  js: 'js',
  json: 'json',
  jsonc: 'json',
  jsx: 'jsx',
  kt: 'kotlin',
  less: 'less',
  md: 'markdown',
  mdx: 'mdx',
  mjs: 'mjs',
  php: 'php',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sass: 'sass',
  scss: 'scss',
  sh: 'bash',
  sql: 'sql',
  svg: 'xml',
  svelte: 'svelte',
  swift: 'swift',
  toml: 'toml',
  ts: 'ts',
  tsx: 'tsx',
  vue: 'vue',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  zsh: 'bash',
};

const hasMetaAttribute = (
  meta: string | null | undefined,
  attributeName: 'filename' | 'title'
): boolean => {
  if (!meta) {
    return false;
  }

  return new RegExp(`(?:^|\\s)${attributeName}\\s*=`).test(meta);
};

const escapeMetaAttributeValue = (value: string): string => {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
};

const isLikelyFileName = (value: string): boolean => {
  const candidate = value.trim();
  if (!candidate || /\s/.test(candidate) || candidate.includes('=')) {
    return false;
  }

  const normalized = candidate.replaceAll('\\', '/');

  if (normalized.includes('/')) {
    return normalized.split('/').some((segment) => segment.length > 0);
  }

  const lastDotIndex = normalized.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === normalized.length - 1) {
    return false;
  }

  return /^[A-Za-z0-9._-]+$/.test(normalized);
};

const inferLanguageFromFilename = (filename: string): string => {
  const normalized = filename.replaceAll('\\', '/');
  const leaf = normalized.split('/').at(-1) ?? normalized;
  const segments = leaf.toLowerCase().split('.').filter(Boolean);
  const extension = segments.at(-1);

  if (!extension) {
    return 'plaintext';
  }

  return EXTENSION_TO_LANGUAGE[extension] ?? 'plaintext';
};

const appendFilenameMeta = (meta: string | null | undefined, filename: string): string => {
  const serializedFilename = `filename="${escapeMetaAttributeValue(filename)}"`;
  if (!meta || meta.trim().length === 0) {
    return serializedFilename;
  }

  return `${meta.trim()} ${serializedFilename}`;
};

const codeFenceFilename = () => {
  return (tree: VisitTree) => {
    visit(tree, 'code', (node) => {
      const codeNode = node as CodeNode;
      if (!codeNode.lang || typeof codeNode.lang !== 'string') {
        return;
      }

      const rawLang = codeNode.lang.trim();
      if (!isLikelyFileName(rawLang)) {
        return;
      }

      const hasExplicitFilename = hasMetaAttribute(codeNode.meta, 'filename');
      const hasExplicitTitle = hasMetaAttribute(codeNode.meta, 'title');

      if (!hasExplicitFilename && !hasExplicitTitle) {
        codeNode.meta = appendFilenameMeta(codeNode.meta, rawLang);
      }

      codeNode.lang = inferLanguageFromFilename(rawLang);
    });
  };
};

export default codeFenceFilename;
