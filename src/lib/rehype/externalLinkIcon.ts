import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

type ExternalLinkIconOptions = {
  site: string;
};

const iconClassName = ['i-ic-open-in-new', 'text-3.5', 'ml-1', 'align-middle'];

const isExternalLink = (href: string | undefined, site: URL): boolean => {
  if (!href) {
    return false;
  }

  const normalizedHref = href.trim();
  if (!normalizedHref || normalizedHref.startsWith('#')) {
    return false;
  }

  let resolvedUrl: URL;
  try {
    resolvedUrl = new URL(normalizedHref, site);
  } catch {
    return false;
  }

  if (resolvedUrl.protocol !== 'http:' && resolvedUrl.protocol !== 'https:') {
    return false;
  }

  return resolvedUrl.hostname !== site.hostname;
};

const getClassList = (classValue: unknown): string[] => {
  if (Array.isArray(classValue)) {
    return classValue.map(String);
  }

  if (typeof classValue === 'string') {
    return classValue.split(' ').filter(Boolean);
  }

  return [];
};

const externalLinkIcon = ({ site }: ExternalLinkIconOptions) => {
  const siteUrl = new URL(site);

  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') {
        return;
      }

      const classList = [
        ...getClassList(node.properties?.className),
        ...getClassList(node.properties?.class),
      ];
      if (classList.includes('rlc-container')) {
        return;
      }

      const href = node.properties?.href;
      const hrefValue = typeof href === 'string' ? href : undefined;

      if (!isExternalLink(hrefValue, siteUrl)) {
        return;
      }

      node.children.push({
        type: 'element',
        tagName: 'span',
        properties: {
          className: iconClassName,
          'aria-label': '外部リンク',
        },
        children: [],
      });
    });
  };
};

export default externalLinkIcon;
