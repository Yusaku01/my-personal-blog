import type { TurnstileVerifier } from './types';

type CreateTurnstileVerifierOptions = {
  secretKey: string;
  fetchImpl?: typeof fetch;
};

type TurnstileResponse = {
  success?: boolean;
};

export const createTurnstileVerifier = ({
  secretKey,
  fetchImpl = fetch,
}: CreateTurnstileVerifierOptions): TurnstileVerifier => {
  return async (token: string, remoteIp?: string) => {
    if (!secretKey || !token.trim()) {
      return false;
    }

    const body = new FormData();
    body.set('secret', secretKey);
    body.set('response', token);

    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as TurnstileResponse;
    return Boolean(data.success);
  };
};
