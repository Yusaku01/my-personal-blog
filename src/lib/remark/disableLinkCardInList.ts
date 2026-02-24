import { visit } from 'unist-util-visit';

type GenericNode = {
  type: string;
  children?: GenericNode[];
  data?: Record<string, unknown>;
  value?: unknown;
};

type ParagraphNode = GenericNode & {
  type: 'paragraph';
  children: GenericNode[];
};

const URL_ONLY_PATTERN = /^(https?:\/\/|www(?=\.))([-.\w]+)([^\s]*)$/i;

const isParagraphNode = (value: unknown): value is ParagraphNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown; children?: unknown };
  return candidate.type === 'paragraph' && Array.isArray(candidate.children);
};

const isListItemNode = (value: unknown): value is GenericNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { type?: unknown };
  return candidate.type === 'listItem';
};

const isUrlOnlyParagraph = (node: ParagraphNode): boolean => {
  if (node.children.length !== 1) {
    return false;
  }

  const [child] = node.children;
  if (child.type !== 'text' || typeof child.value !== 'string') {
    return false;
  }

  return URL_ONLY_PATTERN.test(child.value.trim());
};

const disableLinkCardInList = () => {
  return (tree: GenericNode) => {
    visit(tree, 'paragraph', (node: unknown, _index: number | undefined, parent: unknown) => {
      if (!isParagraphNode(node) || !isListItemNode(parent) || !isUrlOnlyParagraph(node)) {
        return;
      }

      const existingData = typeof node.data === 'object' && node.data !== null ? node.data : {};

      node.data = {
        ...existingData,
        _skipLinkCardInList: true,
      };
    });
  };
};

export default disableLinkCardInList;
