'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { contactFormSchema } from '../../types/index';
import { useEffect, useRef, useState } from 'react';
import ContactFormLabel from './ContactFormLabel';
import ContactFormInput from './ContactFormInput';
import ContactFormTextarea from './ContactFormTextarea';
import { submitContactForm } from '../../lib/api-clients/contact';

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // リアルタイムバリデーション用
  });

  // reCAPTCHA v2 の明示レンダー（React クライアントマウント後にレンダー）
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // ~5秒（100ms間隔）
    const timer = setInterval(() => {
      attempts += 1;
      const grecaptcha = window.grecaptcha;
      if (
        recaptchaContainerRef.current &&
        grecaptcha &&
        grecaptcha.render &&
        recaptchaWidgetId === null
      ) {
        const id = grecaptcha.render(recaptchaContainerRef.current, {
          sitekey: import.meta.env.PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY,
        });
        setRecaptchaWidgetId(id);
        clearInterval(timer);
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [recaptchaWidgetId]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setRecaptchaError(null);
    try {
      // reCAPTCHA チェック
      const grecaptcha = window.grecaptcha;
      if (recaptchaWidgetId === null || !grecaptcha || !grecaptcha.getResponse) {
        setRecaptchaError('reCAPTCHA の初期化に失敗しました。時間をおいて再度お試しください。');
        return;
      }
      const token: string = grecaptcha.getResponse(recaptchaWidgetId);
      if (!token) {
        setRecaptchaError('reCAPTCHA を完了してください。');
        return;
      }

      // 送信データに reCAPTCHA トークンを同梱
      await submitContactForm({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        'g-recaptcha-response': token,
      });

      // フォームをリセット
      reset();
      // reCAPTCHA リセット
      try {
        grecaptcha.reset(recaptchaWidgetId);
      } catch (_) {
        // no-op
      }
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitted(false);
      setErrorMessage(error instanceof Error ? error.message : '送信中にエラーが発生しました');
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
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded lg:hover:bg-green-700 transition-colors"
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
        <div ref={recaptchaContainerRef} className="g-recaptcha" />
        {recaptchaError && <p className="mt-2 text-sm text-red-600">{recaptchaError}</p>}
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

        {errorMessage && <p className="mb-4 text-sm text-red-600 text-center">{errorMessage}</p>}
        <div className="text-center">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </form>
    </>
  );
}
