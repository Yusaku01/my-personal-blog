export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactSubmissionInput = ContactFormValues & {
  turnstileToken: string;
  remoteIp?: string;
};

export type ContactDeliveryStatus = 'pending' | 'delivered' | 'failed';
export type ContactProvider = 'cloudflare-email';

export type ContactNotifierResult = {
  provider: ContactProvider;
  providerMessageId: string | null;
};

export interface ContactSubmissionRepository {
  createSubmission(
    input: ContactFormValues & { provider: ContactProvider }
  ): Promise<{ id: string }>;
  updateDeliveryStatus(input: {
    id: string;
    deliveryStatus: ContactDeliveryStatus;
    provider: ContactProvider;
    providerMessageId: string | null;
  }): Promise<void>;
}

export interface ContactNotifier {
  sendNotification(input: ContactFormValues): Promise<ContactNotifierResult>;
}

export type TurnstileVerifier = (token: string, remoteIp?: string) => Promise<boolean>;

export type EmailAddress = string | { email: string; name?: string };

export interface SendEmailBinding {
  send(input: {
    to: EmailAddress | EmailAddress[];
    from: EmailAddress;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: EmailAddress;
    headers?: Record<string, string>;
  }): Promise<{ messageId: string }>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ success?: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export type ContactRuntimeEnv = {
  CONTACT_DB: D1Database;
  EMAIL: SendEmailBinding;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
};
