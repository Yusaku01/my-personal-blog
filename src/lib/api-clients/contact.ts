import { type ContactForm } from '../../types/index';

// SSGFormのエンドポイントURL
// クライアントサイドでも使えるようにpublicなエンドポイントです
const FORM_ENDPOINT = 'https://ssgform.com/s/rGYtwI020c3g';

export async function submitContactForm(data: ContactForm): Promise<Response> {
  console.log('送信先URL:', FORM_ENDPOINT);
  console.log('送信データ:', data);

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('APIエラー:', response.status, errorText);
      throw new Error(`Failed to submit contact form: ${response.status} ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('送信例外:', error);
    throw error;
  }
}
