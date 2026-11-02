import { describe, expect, it, vi } from 'vitest';
import { ContactSubmissionError, submitContactSubmission } from '../src/lib/contact/contactService';

const createDependencies = () => {
  const calls: string[] = [];

  const dependencies = {
    verifyTurnstile: vi.fn(async () => {
      calls.push('verifyTurnstile');
      return true;
    }),
    checkRateLimit: vi.fn(async () => {
      calls.push('checkRateLimit');
      return true;
    }),
    repository: {
      createSubmission: vi.fn(async () => {
        calls.push('createSubmission');
        return { id: 'submission-1' };
      }),
      updateDeliveryStatus: vi.fn(async ({ deliveryStatus }: { deliveryStatus: string }) => {
        calls.push(`updateDeliveryStatus:${deliveryStatus}`);
      }),
    },
    notifier: {
      sendNotification: vi.fn(async () => {
        calls.push('sendNotification');
        return { provider: 'cloudflare-email' as const, providerMessageId: 'email-1' };
      }),
    },
  };

  return { calls, dependencies };
};

describe('submitContactSubmission', () => {
  it('stops before persistence when turnstile verification fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.verifyTurnstile.mockResolvedValue(false);

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
        },
        dependencies
      )
    ).rejects.toMatchObject({
      code: 'TURNSTILE_FAILED',
    } satisfies Partial<ContactSubmissionError>);

    expect(dependencies.repository.createSubmission).not.toHaveBeenCalled();
    expect(dependencies.notifier.sendNotification).not.toHaveBeenCalled();
  });

  it('persists, sends, and marks delivery in order on success', async () => {
    const { calls, dependencies } = createDependencies();

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
        },
        dependencies
      )
    ).resolves.toEqual({
      provider: 'cloudflare-email',
      providerMessageId: 'email-1',
      submissionId: 'submission-1',
    });

    expect(calls).toEqual([
      'verifyTurnstile',
      'checkRateLimit',
      'createSubmission',
      'sendNotification',
      'updateDeliveryStatus:delivered',
    ]);
  });

  it('does not persist or notify when the contact rate limit is exceeded', async () => {
    const { dependencies } = createDependencies();
    dependencies.checkRateLimit.mockResolvedValue(false);

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
          remoteIp: '203.0.113.1',
        },
        dependencies
      )
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' } satisfies Partial<ContactSubmissionError>);

    expect(dependencies.repository.createSubmission).not.toHaveBeenCalled();
    expect(dependencies.notifier.sendNotification).not.toHaveBeenCalled();
  });

  it('does not persist or notify when the rate limiter fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.checkRateLimit.mockRejectedValue(new Error('rate limiter unavailable'));

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
          remoteIp: '203.0.113.1',
        },
        dependencies
      )
    ).rejects.toThrow('rate limiter unavailable');

    expect(dependencies.repository.createSubmission).not.toHaveBeenCalled();
    expect(dependencies.notifier.sendNotification).not.toHaveBeenCalled();
  });

  it('keeps the record and marks failure when email delivery fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.notifier.sendNotification.mockRejectedValue(new Error('email failed'));

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
        },
        dependencies
      )
    ).rejects.toMatchObject({
      code: 'DELIVERY_FAILED',
      submissionId: 'submission-1',
    } satisfies Partial<ContactSubmissionError>);

    expect(dependencies.repository.createSubmission).toHaveBeenCalledOnce();
    expect(dependencies.repository.updateDeliveryStatus).toHaveBeenCalledWith({
      deliveryStatus: 'failed',
      id: 'submission-1',
      provider: 'cloudflare-email',
      providerMessageId: null,
    });
  });

  it('does not notify when persistence fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.repository.createSubmission.mockRejectedValue(new Error('d1 failed'));

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          turnstileToken: 'token',
        },
        dependencies
      )
    ).rejects.toMatchObject({
      code: 'PERSIST_FAILED',
    } satisfies Partial<ContactSubmissionError>);

    expect(dependencies.notifier.sendNotification).not.toHaveBeenCalled();
    expect(dependencies.repository.updateDeliveryStatus).not.toHaveBeenCalled();
  });
});
