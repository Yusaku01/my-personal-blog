import type { ExternalPost } from '../../types';

const CACHE_DURATION = 60 * 60 * 1000;

type FeedLoaderOptions = {
  label: string;
  load: (username: string) => Promise<ExternalPost[]>;
};

function summarizeFetchError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause;
    if (
      typeof cause === 'object' &&
      cause !== null &&
      'code' in cause &&
      typeof cause.code === 'string'
    ) {
      return cause.code;
    }

    return error.message;
  }

  return 'unknown error';
}

export function createCachedFeedLoader({ label, load }: FeedLoaderOptions) {
  const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();
  const inFlight = new Map<string, Promise<ExternalPost[]>>();
  const warnedMessages = new Set<string>();

  return async (username: string): Promise<ExternalPost[]> => {
    const cachedData = cache.get(username);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    const pending = inFlight.get(username);
    if (pending) {
      return pending;
    }

    const request = (async () => {
      try {
        const posts = await load(username);
        cache.set(username, { data: posts, timestamp: Date.now() });
        return posts;
      } catch (error) {
        const message = `[blog] Failed to fetch ${label} (${summarizeFetchError(error)}). Using cached or empty results.`;
        if (!warnedMessages.has(message)) {
          warnedMessages.add(message);
          console.warn(message);
        }

        return cachedData?.data ?? [];
      }
    })();

    inFlight.set(username, request);
    try {
      return await request;
    } finally {
      inFlight.delete(username);
    }
  };
}
