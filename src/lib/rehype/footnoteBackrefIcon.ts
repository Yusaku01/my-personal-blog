import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

const iconClassName = ['i-ic-round-undo', 'text-3.5', 'align-middle'];

const getClassList = (classValue: unknown): string[] => {
  if (Array.isArray(classValue)) {
    return classValue.map(String);
  }

  if (typeof classValue === 'string') {
    return classValue.split(' ').filter(Boolean);
  }

  return [];
};

const footnoteBackrefIcon = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') {
        return;
      }

      const classList = [
        ...getClassList(node.properties?.className),
        ...getClassList(node.properties?.class),
      ];

      if (!classList.includes('data-footnote-backref')) {
        return;
      }

      node.children = [
        {
          type: 'element',
          tagName: 'span',
          properties: {
            className: iconClassName,
            'aria-label': '脚注へ戻る',
          },
          children: [],
        },
      ];
    });
  };
};

export default footnoteBackrefIcon;
