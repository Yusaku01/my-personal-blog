import type { ContactRateLimiter, RateLimitBinding } from './types';

export const createContactRateLimiter = (binding: RateLimitBinding): ContactRateLimiter => {
  return async (remoteIp) => {
    const key = remoteIp?.trim();
    if (!key) {
      throw new Error('Client address is unavailable for contact rate limiting');
    }

    const result = await binding.limit({ key });
    return result.success;
  };
};
