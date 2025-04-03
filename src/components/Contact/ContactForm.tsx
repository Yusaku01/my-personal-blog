import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { contactFormSchema } from '../../types/index';
import { useState } from 'react';
import ContactFormLabel from './ContactFormLabel';
import ContactFormInput from './ContactFormInput';
import ContactFormTextarea from './ContactFormTextarea';

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // リアルタイムバリデーション用
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // ここで実際のAPI送信処理を行います
      console.log('送信データ:', data);

      // 送信成功を模擬（実際の実装では適切なAPIコールに置き換えてください）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <h2 className="text-xl font-bold text-green-800 mb-2">送信完了</h2>
        <p className="text-green-700">
          お問い合わせありがとうございます。できるだけ早くご返信いたします。
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          新しいお問い合わせ
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="text-gray-800 dark:text-white mb-8 text-center">
        ご質問やお問い合わせがありましたら、以下のフォームからご連絡ください。
        <br />
        可能な限り早くご返信いたします。
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
        <div className="mb-4">
          <ContactFormLabel htmlFor="name" label="お名前" required />
          <ContactFormInput register={register} errors={errors} id="name" type="text" />
        </div>

        <div className="mb-4">
          <ContactFormLabel htmlFor="email" label="メールアドレス" required />
          <ContactFormInput register={register} errors={errors} id="email" type="email" />
        </div>

        <div className="mb-4">
          <ContactFormLabel htmlFor="subject" label="件名" required />
          <ContactFormInput register={register} errors={errors} id="subject" type="text" />
        </div>

        <div className="mb-6">
          <ContactFormLabel htmlFor="message" label="メッセージ" required />
          <ContactFormTextarea register={register} errors={errors} />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-300 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-300 font-bold tracking-wide"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </form>
    </>
  );
}
