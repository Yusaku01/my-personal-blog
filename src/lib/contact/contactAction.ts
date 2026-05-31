import { z } from 'astro/zod';
import { contactFormSchema } from '../../types';
import type { ContactForm } from '../../types';
import { ContactSubmissionError } from './contactService';
import type { ContactSubmissionInput } from './types';

type ContactActionFailure = {
  ok: false;
  values: ContactForm;
  fieldErrors: Partial<Record<keyof ContactForm, string[]>>;
  message?: string;
};

type ContactActionSuccess = {
  ok: true;
  submissionId: string;
};

export type ContactActionResult = ContactActionFailure | ContactActionSuccess;

type ContactActionDependencies = {
  submitContactSubmission: (input: ContactSubmissionInput) => Promise<{ submissionId: string }>;
};

type ContactActionOptions = {
  remoteIp?: string;
};

const readFormValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

export const extractContactFormValues = (formData: FormData): ContactForm => ({
  name: readFormValue(formData, 'name'),
  email: readFormValue(formData, 'email'),
  subject: readFormValue(formData, 'subject'),
  message: readFormValue(formData, 'message'),
});

export const createContactActionHandler = ({
  submitContactSubmission,
}: ContactActionDependencies) => {
  return async (
    formData: FormData,
    { remoteIp }: ContactActionOptions = {}
  ): Promise<ContactActionResult> => {
    const values = extractContactFormValues(formData);
    const parsed = contactFormSchema.safeParse(values);

    if (!parsed.success) {
      return {
        ok: false,
        values,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        message: '入力内容を確認してください。',
      };
    }

    try {
      const result = await submitContactSubmission({
        ...parsed.data,
        turnstileToken: readFormValue(formData, 'cf-turnstile-response'),
        remoteIp,
      });

      return {
        ok: true,
        submissionId: result.submissionId,
      };
    } catch (error) {
      return {
        ok: false,
        values,
        fieldErrors: {},
        message:
          error instanceof ContactSubmissionError
            ? error.message
            : '送信に失敗しました。時間をおいて再度お試しください。',
      };
    }
  };
};
