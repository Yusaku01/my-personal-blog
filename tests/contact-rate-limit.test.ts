import { describe, expect, it, vi } from 'vitest';
import { createContactRateLimiter } from '../src/lib/contact/rateLimit';

describe('createContactRateLimiter', () => {
  it('uses the server-provided client address as the rate-limit key', async () => {
    const binding = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const checkRateLimit = createContactRateLimiter(binding);

    await expect(checkRateLimit('203.0.113.1')).resolves.toBe(true);
    expect(binding.limit).toHaveBeenCalledExactlyOnceWith({ key: '203.0.113.1' });
  });

  it('fails closed when the client address is unavailable', async () => {
    const binding = { limit: vi.fn().mockResolvedValue({ success: true }) };
    const checkRateLimit = createContactRateLimiter(binding);

    await expect(checkRateLimit()).rejects.toThrow('Client address is unavailable');
    await expect(checkRateLimit(' ')).rejects.toThrow('Client address is unavailable');
    expect(binding.limit).not.toHaveBeenCalled();
  });
});
