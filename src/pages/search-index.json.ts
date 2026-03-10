import type { APIRoute } from 'astro';
import { getSearchIndexEntries } from '../lib/blog/posts';

export const GET: APIRoute = async () => {
  const entries = await getSearchIndexEntries();

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
