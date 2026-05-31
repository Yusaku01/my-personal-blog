import type { ContactNotifier, SendEmailBinding } from './types';

type CreateCloudflareEmailNotifierOptions = {
  email: SendEmailBinding;
  toEmail: string;
  fromEmail: string;
};

export const createCloudflareEmailNotifier = ({
  email,
  toEmail,
  fromEmail,
}: CreateCloudflareEmailNotifierOptions): ContactNotifier => {
  return {
    async sendNotification({ name, email: replyTo, subject, message }) {
      const response = await email.send({
        from: fromEmail,
        to: toEmail,
        replyTo,
        subject: `[CONTACT] ${subject}`,
        text: `Name: ${name}\nEmail: ${replyTo}\nSubject: ${subject}\n\n${message}`,
      });

      return {
        provider: 'cloudflare-email' as const,
        providerMessageId: response.messageId,
      };
    },
  };
};
