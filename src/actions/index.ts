import { defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { createContactActionHandler, extractContactFormValues } from '../lib/contact/contactAction';
import { submitContactSubmission } from '../lib/contact/contactService';
import { createCloudflareEmailNotifier } from '../lib/contact/cloudflareEmailNotifier';
import { createD1ContactSubmissionRepository } from '../lib/contact/d1Repository';
import { createTurnstileVerifier } from '../lib/contact/turnstile';
import type { ContactRuntimeEnv } from '../lib/contact/types';

const isContactRuntimeEnv = (
  runtimeEnv: Partial<ContactRuntimeEnv>
): runtimeEnv is ContactRuntimeEnv =>
  Boolean(
    runtimeEnv.CONTACT_DB &&
    runtimeEnv.EMAIL &&
    runtimeEnv.CONTACT_TO_EMAIL &&
    runtimeEnv.CONTACT_FROM_EMAIL &&
    runtimeEnv.TURNSTILE_SECRET_KEY
  );

export const server = {
  contact: defineAction({
    accept: 'form',
    handler: async (formData, context) => {
      const runtimeEnv = env as Partial<ContactRuntimeEnv>;

      if (!isContactRuntimeEnv(runtimeEnv)) {
        return {
          ok: false as const,
          values: extractContactFormValues(formData),
          fieldErrors: {},
          message: 'お問い合わせ機能の設定が不足しています。',
        };
      }

      const actionHandler = createContactActionHandler({
        submitContactSubmission: (input) =>
          submitContactSubmission(input, {
            verifyTurnstile: createTurnstileVerifier({
              secretKey: runtimeEnv.TURNSTILE_SECRET_KEY,
            }),
            repository: createD1ContactSubmissionRepository(runtimeEnv.CONTACT_DB),
            notifier: createCloudflareEmailNotifier({
              email: runtimeEnv.EMAIL,
              toEmail: runtimeEnv.CONTACT_TO_EMAIL,
              fromEmail: runtimeEnv.CONTACT_FROM_EMAIL,
            }),
          }),
      });

      return actionHandler(formData, { remoteIp: context.clientAddress });
    },
  }),
};
