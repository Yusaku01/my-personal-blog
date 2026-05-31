import { env } from 'cloudflare:workers';
import type { ContactRuntimeEnv } from './types';

export const getPublicTurnstileSiteKey = (): string => {
  const runtimeEnv = env as Partial<ContactRuntimeEnv>;
  return (
    runtimeEnv.PUBLIC_TURNSTILE_SITE_KEY?.trim() ??
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() ??
    ''
  );
};
