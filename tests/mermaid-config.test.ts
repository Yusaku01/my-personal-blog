import { describe, expect, it } from 'vitest';
import {
  markdownRehypePlugins,
  markdownSyntaxHighlight,
  mermaidRehypePlugin,
} from '../src/lib/markdown/mermaidConfig';

describe('mermaid markdown config', () => {
  it('excludes mermaid from Shiki highlighting so rehype-mermaid can process it', () => {
    expect(markdownSyntaxHighlight.type).toBe('shiki');
    expect(markdownSyntaxHighlight.excludeLangs).toContain('mermaid');
    expect(markdownSyntaxHighlight.excludeLangs).toContain('math');
  });

  it('always includes rehype-mermaid in the shared rehype plugin list', () => {
    expect(markdownRehypePlugins).toContainEqual(mermaidRehypePlugin);
  });

  it('keeps the expected build-time SVG rendering options', () => {
    expect(mermaidRehypePlugin[1]).toMatchObject({
      strategy: 'img-svg',
      dark: true,
      prefix: 'mermaid-diagram',
    });
  });
});
