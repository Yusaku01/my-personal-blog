import { defineAction } from 'astro:actions';
import { createContactActionHandler } from '../lib/contact/contactAction';
import { submitContactSubmission } from '../lib/contact/contactService';
import { createD1ContactSubmissionRepository } from '../lib/contact/d1Repository';
import { createRecaptchaVerifier } from '../lib/contact/recaptcha';
import { createResendNotifier } from '../lib/contact/resendNotifier';
import type { ContactRuntimeEnv } from '../lib/contact/types';

const resolveContactRuntimeEnv = (locals: unknown): ContactRuntimeEnv => {
  const runtimeEnv = (locals as { runtime?: { env?: Partial<ContactRuntimeEnv> } })?.runtime?.env;

  if (
    !runtimeEnv?.CONTACT_DB ||
    !runtimeEnv.RESEND_API_KEY ||
    !runtimeEnv.CONTACT_TO_EMAIL ||
    !runtimeEnv.CONTACT_FROM_EMAIL ||
    !runtimeEnv.GOOGLE_RECAPTCHA_SECRET_KEY
  ) {
    throw new Error('Contact runtime environment is not configured.');
  }

  return runtimeEnv as ContactRuntimeEnv;
};

export const server = {
  contact: defineAction({
    accept: 'form',
    handler: async (formData, context) => {
      const env = resolveContactRuntimeEnv(context.locals);
      const actionHandler = createContactActionHandler({
        submitContactSubmission: (input) =>
          submitContactSubmission(input, {
            verifyRecaptcha: createRecaptchaVerifier({
              secretKey: env.GOOGLE_RECAPTCHA_SECRET_KEY,
            }),
            repository: createD1ContactSubmissionRepository(env.CONTACT_DB),
            notifier: createResendNotifier({
              apiKey: env.RESEND_API_KEY,
              toEmail: env.CONTACT_TO_EMAIL,
              fromEmail: env.CONTACT_FROM_EMAIL,
            }),
          }),
      });

      return actionHandler(formData);
    },
  }),
};
