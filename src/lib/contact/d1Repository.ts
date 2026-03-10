import type { ContactSubmissionRepository, D1Database } from './types';

export const createD1ContactSubmissionRepository = (
  database: D1Database
): ContactSubmissionRepository => {
  return {
    async createSubmission({ name, email, subject, message, provider }) {
      const id = crypto.randomUUID();

      await database
        .prepare(
          `
            INSERT INTO contact_submissions (
              id,
              name,
              email,
              subject,
              message,
              delivery_status,
              provider,
              provider_message_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `
        )
        .bind(id, name, email, subject, message, 'pending', provider, null)
        .run();

      return { id };
    },

    async updateDeliveryStatus({ id, deliveryStatus, provider, providerMessageId }) {
      await database
        .prepare(
          `
            UPDATE contact_submissions
            SET delivery_status = ?, provider = ?, provider_message_id = ?
            WHERE id = ?
          `
        )
        .bind(deliveryStatus, provider, providerMessageId, id)
        .run();
    },
  };
};
