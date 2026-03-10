export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactSubmissionInput = ContactFormValues & {
  recaptchaToken: string;
};

export type ContactDeliveryStatus = 'pending' | 'delivered' | 'failed';
export type ContactProvider = 'resend';

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

export type RecaptchaVerifier = (token: string) => Promise<boolean>;

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ success?: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export type ContactRuntimeEnv = {
  CONTACT_DB: D1Database;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  GOOGLE_RECAPTCHA_SECRET_KEY: string;
  PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY?: string;
};
