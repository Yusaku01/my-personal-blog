import { type ContactForm } from '../../types/index';

// SSGFormのエンドポイントURL
// 必ず環境変数で設定し、ハードコードされたURLが残らないようにする
const resolveEndpoint = () => {
  const endpoint = import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT?.trim();
  if (!endpoint) {
    throw new Error('Missing PUBLIC_CONTACT_FORM_ENDPOINT');
  }
  return endpoint;
};

export async function submitContactForm(data: ContactForm): Promise<Response> {
  // FormDataを生成
  const formData = new FormData();

  // 各フィールドをFormDataに追加
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  // FormDataを使って送信(Content-Typeヘッダーは自動的に設定される)
  const response = await fetch(resolveEndpoint(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit contact form: ${response.status} ${errorText}`);
  }

  return response;
}
