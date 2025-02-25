import { type ContactForm } from '../../types/index';

const FORM_ENDPOINT = process.env.CONTACT_FORM_ENDPOINT || 'https://ssgform.com/s/xxxxx';

export async function submitContactForm(data: ContactForm): Promise<Response> {
  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit contact form');
  }

  return response;
}
