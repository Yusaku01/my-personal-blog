import type { ContactNotifier } from './types';

type CreateResendNotifierOptions = {
  apiKey: string;
  toEmail: string;
  fromEmail: string;
  fetchImpl?: typeof fetch;
};

type ResendResponse = {
  id?: string;
};

export const createResendNotifier = ({
  apiKey,
  toEmail,
  fromEmail,
  fetchImpl = fetch,
}: CreateResendNotifierOptions): ContactNotifier => {
  return {
    async sendNotification({ name, email, subject, message }) {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: email,
          subject: `[CONTACT] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ResendResponse;
      return {
        provider: 'resend' as const,
        providerMessageId: data.id ?? null,
      };
    },
  };
};
