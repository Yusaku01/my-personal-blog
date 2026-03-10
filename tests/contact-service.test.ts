import { describe, expect, it, vi } from 'vitest';
import { ContactSubmissionError, submitContactSubmission } from '../src/lib/contact/contactService';

const createDependencies = () => {
  const calls: string[] = [];

  const dependencies = {
    verifyRecaptcha: vi.fn(async () => {
      calls.push('verifyRecaptcha');
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
        return { provider: 'resend' as const, providerMessageId: 'email-1' };
      }),
    },
  };

  return { calls, dependencies };
};

describe('submitContactSubmission', () => {
  it('stops before persistence when recaptcha verification fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.verifyRecaptcha.mockResolvedValue(false);

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          recaptchaToken: 'token',
        },
        dependencies
      )
    ).rejects.toMatchObject({
      code: 'RECAPTCHA_FAILED',
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
          recaptchaToken: 'token',
        },
        dependencies
      )
    ).resolves.toEqual({
      provider: 'resend',
      providerMessageId: 'email-1',
      submissionId: 'submission-1',
    });

    expect(calls).toEqual([
      'verifyRecaptcha',
      'createSubmission',
      'sendNotification',
      'updateDeliveryStatus:delivered',
    ]);
  });

  it('keeps the record and marks failure when email delivery fails', async () => {
    const { dependencies } = createDependencies();
    dependencies.notifier.sendNotification.mockRejectedValue(new Error('resend failed'));

    await expect(
      submitContactSubmission(
        {
          name: 'Saku',
          email: 'saku@example.com',
          subject: 'Hello',
          message: 'World',
          recaptchaToken: 'token',
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
      provider: 'resend',
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
          recaptchaToken: 'token',
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
