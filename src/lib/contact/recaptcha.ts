import type { RecaptchaVerifier } from './types';

type CreateRecaptchaVerifierOptions = {
  secretKey: string;
  fetchImpl?: typeof fetch;
};

type RecaptchaResponse = {
  success?: boolean;
};

export const createRecaptchaVerifier = ({
  secretKey,
  fetchImpl = fetch,
}: CreateRecaptchaVerifierOptions): RecaptchaVerifier => {
  return async (token: string) => {
    if (!secretKey || !token.trim()) {
      return false;
    }

    const body = new URLSearchParams();
    body.set('secret', secretKey);
    body.set('response', token);

    const response = await fetchImpl('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as RecaptchaResponse;
    return Boolean(data.success);
  };
};
