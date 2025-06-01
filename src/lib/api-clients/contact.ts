import { type ContactForm } from '../../types/index';

// SSGFormのエンドポイントURL
// クライアントサイドでも使えるようにpublicなエンドポイントです
const FORM_ENDPOINT =
  import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT || 'https://ssgform.com/s/rGYtwI020c3g';

export async function submitContactForm(data: ContactForm): Promise<Response> {
  try {
    // FormDataを生成
    const formData = new FormData();

    // 各フィールドをFormDataに追加
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // FormDataを使って送信(Content-Typeヘッダーは自動的に設定される)
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit contact form: ${response.status} ${errorText}`);
    }

    return response;
  } catch (error) {
    throw error;
  }
}
