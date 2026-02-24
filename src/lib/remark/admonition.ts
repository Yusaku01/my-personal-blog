import { SKIP, visit } from 'unist-util-visit';

type GenericNode = {
  type: string;
  children?: GenericNode[];
  data?: Record<string, unknown>;
  label?: unknown;
  name?: unknown;
  value?: unknown;
};

type ParentNode = GenericNode & {
  children: GenericNode[];
};

type ContainerDirectiveNode = ParentNode & {
  type: 'containerDirective';
};

const LABELS = {
  note: 'Note',
  caution: 'Caution',
  danger: 'Danger',
} as const;

type AdmonitionVariant = keyof typeof LABELS;

const SUPPORTED_VARIANTS = new Set<AdmonitionVariant>(['note', 'caution', 'danger']);

const isSupportedVariant = (value: string): value is AdmonitionVariant => {
  return SUPPORTED_VARIANTS.has(value as AdmonitionVariant);
};

const isParentNode = (value: unknown): value is ParentNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { children?: unknown };
  return 'children' in candidate && Array.isArray(candidate.children);
};

const isContainerDirectiveNode = (value: unknown): value is ContainerDirectiveNode => {
  return isParentNode(value) && value.type === 'containerDirective';
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const createOpeningHtmlNode = (variant: AdmonitionVariant, title: string): GenericNode => {
  const escapedTitle = escapeHtml(title);

  return {
    type: 'html',
    value: `<aside class="admonition admonition--${variant}" aria-label="${escapedTitle}"><p class="admonition__title">${escapedTitle}</p><div class="admonition__content">`,
  };
};

const createClosingHtmlNode = (): GenericNode => {
  return {
    type: 'html',
    value: '</div></aside>',
  };
};

const isDirectiveLabelParagraph = (node: GenericNode): node is ParentNode => {
  const directiveLabel =
    typeof node.data === 'object' && node.data !== null ? node.data.directiveLabel : undefined;

  return node.type === 'paragraph' && directiveLabel === true && Array.isArray(node.children);
};

const readTextFromParagraph = (node: ParentNode): string => {
  if (!Array.isArray(node.children)) {
    return '';
  }

  return node.children
    .map((child) => {
      if (typeof child !== 'object' || child === null) {
        return '';
      }

      return typeof child.value === 'string' ? child.value : '';
    })
    .join('')
    .trim();
};

const resolveTitleAndChildren = (
  node: ContainerDirectiveNode,
  variant: AdmonitionVariant
): { title: string; contentChildren: GenericNode[] } => {
  const initialTitle = typeof node.label === 'string' ? node.label.trim() : '';
  const children = [...node.children];

  if (children.length > 0 && isDirectiveLabelParagraph(children[0])) {
    const extractedTitle = readTextFromParagraph(children[0]);
    const resolvedTitle = extractedTitle.length > 0 ? extractedTitle : initialTitle;
    return {
      title: resolvedTitle.length > 0 ? resolvedTitle : LABELS[variant],
      contentChildren: children.slice(1),
    };
  }

  return {
    title: initialTitle.length > 0 ? initialTitle : LABELS[variant],
    contentChildren: children,
  };
};

const remarkAdmonition = () => {
  return (tree: GenericNode) => {
    visit(tree, (node: unknown, index: number | undefined, parent: unknown) => {
      if (!isContainerDirectiveNode(node) || typeof index !== 'number' || !isParentNode(parent)) {
        return;
      }

      const normalizedName = typeof node.name === 'string' ? node.name.trim().toLowerCase() : '';
      if (!normalizedName) {
        return;
      }

      if (!isSupportedVariant(normalizedName)) {
        parent.children.splice(index, 1, ...node.children);
        return [SKIP, index] as const;
      }

      const { title, contentChildren } = resolveTitleAndChildren(node, normalizedName);
      const openingNode = createOpeningHtmlNode(normalizedName, title);
      const closingNode = createClosingHtmlNode();

      parent.children.splice(index, 1, openingNode, ...contentChildren, closingNode);
      return [SKIP, index + contentChildren.length + 2] as const;
    });
  };
};

export default remarkAdmonition;
