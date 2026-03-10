import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('blog search layout contract', () => {
  it('defines a blog-only grid variant that keeps empty tracks with auto-fill', async () => {
    const layout = await readFile(path.join(process.cwd(), 'src/layouts/Layout.astro'), 'utf8');

    expect(layout).toContain('.grid-fluid-cards-blog');
    expect(layout).toContain(
      'grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--cards-min)), 1fr));'
    );
  });

  it('applies the blog-only grid variant to the blog results container', async () => {
    const controls = await readFile(
      path.join(process.cwd(), 'src/components/Blog/BlogControls.astro'),
      'utf8'
    );

    expect(controls).toContain('class="grid-fluid-cards grid-fluid-cards-blog"');
  });
});
