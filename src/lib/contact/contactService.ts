import type {
  ContactNotifier,
  ContactSubmissionInput,
  ContactSubmissionRepository,
  RecaptchaVerifier,
} from './types';

type ContactSubmissionDependencies = {
  verifyRecaptcha: RecaptchaVerifier;
  repository: ContactSubmissionRepository;
  notifier: ContactNotifier;
};

type ContactSubmissionErrorCode = 'RECAPTCHA_FAILED' | 'PERSIST_FAILED' | 'DELIVERY_FAILED';

export class ContactSubmissionError extends Error {
  code: ContactSubmissionErrorCode;
  submissionId?: string;

  constructor(
    code: ContactSubmissionErrorCode,
    message: string,
    options?: { submissionId?: string; cause?: unknown }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'ContactSubmissionError';
    this.code = code;
    this.submissionId = options?.submissionId;
  }
}

export const submitContactSubmission = async (
  input: ContactSubmissionInput,
  { verifyRecaptcha, repository, notifier }: ContactSubmissionDependencies
) => {
  const isRecaptchaValid = await verifyRecaptcha(input.recaptchaToken);
  if (!isRecaptchaValid) {
    throw new ContactSubmissionError(
      'RECAPTCHA_FAILED',
      'reCAPTCHA の検証に失敗しました。時間をおいて再度お試しください。'
    );
  }

  let submissionId: string;

  try {
    const created = await repository.createSubmission({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      provider: 'resend',
    });
    submissionId = created.id;
  } catch (error) {
    throw new ContactSubmissionError(
      'PERSIST_FAILED',
      'お問い合わせの保存に失敗しました。時間をおいて再度お試しください。',
      { cause: error }
    );
  }

  try {
    const notification = await notifier.sendNotification({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    });

    await repository.updateDeliveryStatus({
      id: submissionId,
      deliveryStatus: 'delivered',
      provider: notification.provider,
      providerMessageId: notification.providerMessageId,
    });

    return {
      submissionId,
      provider: notification.provider,
      providerMessageId: notification.providerMessageId,
    };
  } catch (error) {
    await repository.updateDeliveryStatus({
      id: submissionId,
      deliveryStatus: 'failed',
      provider: 'resend',
      providerMessageId: null,
    });

    throw new ContactSubmissionError(
      'DELIVERY_FAILED',
      '送信に失敗しました。時間をおいて再度お試しください。',
      { submissionId, cause: error }
    );
  }
};
