import { type ContactForm } from '@/types';

// SSGFormのエンドポイントURL
// クライアントサイドでも使えるようにpublicなエンドポイントです
const FORM_ENDPOINT =
  import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT || 'https://ssgform.com/s/rGYtwI020c3g';

export async function submitContactForm(data: ContactForm): Promise<Response> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit contact form: ${response.status} ${errorText}`);
  }

  return response;
}
