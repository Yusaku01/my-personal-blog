import { describe, expect, it, vi } from 'vitest';
import { createContactActionHandler } from '../src/lib/contact/contactAction';

const buildFormData = (values: Record<string, string>) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
};

describe('createContactActionHandler', () => {
  it('returns field errors for invalid input', async () => {
    const handler = createContactActionHandler({
      submitContactSubmission: vi.fn(),
    });

    const result = await handler(
      buildFormData({
        name: '',
        email: 'invalid-email',
        subject: '',
        message: '',
        'cf-turnstile-response': '',
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('expected validation failure');
    }

    expect(result.fieldErrors.name).toContain('お名前を入力してください');
    expect(result.fieldErrors.email).toContain('有効なメールアドレスを入力してください');
    expect(result.values.email).toBe('invalid-email');
  });

  it('returns success data when the submission service succeeds', async () => {
    const handler = createContactActionHandler({
      submitContactSubmission: vi.fn().mockResolvedValue({
        submissionId: 'submission-1',
        provider: 'cloudflare-email',
        providerMessageId: 'email-1',
      }),
    });

    await expect(
      handler(
        buildFormData({
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          'cf-turnstile-response': 'token',
        })
      )
    ).resolves.toEqual({
      ok: true,
      submissionId: 'submission-1',
    });
  });

  it('maps submission failures to same-page error data', async () => {
    const handler = createContactActionHandler({
      submitContactSubmission: vi.fn().mockRejectedValue(new Error('failed to send')),
    });

    const result = await handler(
      buildFormData({
        name: 'Saku',
        email: 'saku@example.com',
        subject: 'Hello',
        message: 'World',
        'cf-turnstile-response': 'token',
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('expected failure');
    }

    expect(result.fieldErrors).toEqual({});
    expect(result.message).toBe('送信に失敗しました。時間をおいて再度お試しください。');
    expect(result.values.name).toBe('Saku');
  });
});
