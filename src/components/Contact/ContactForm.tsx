import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactForm as ContactFormData } from '../../types';
import { submitContactForm } from '../../lib/api-clients/contact';
import { button, input } from '../../styles/variants';

export const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactForm(data);
      alert('お問い合わせを送信しました');
      reset();
    } catch (error) {
      alert('エラーが発生しました。時間をおいて再度お試しください。');
      console.error('Form submission error:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          お名前
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className={input({ color: errors.name ? 'error' : 'primary' })}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          メールアドレス
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className={input({ color: errors.email ? 'error' : 'primary' })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          件名
        </label>
        <input
          type="text"
          id="subject"
          {...register('subject')}
          className={input({ color: errors.subject ? 'error' : 'primary' })}
        />
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          メッセージ
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={5}
          className={input({ color: errors.message ? 'error' : 'primary' })}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <input type="hidden" name="_csrf" value="token" />

      <button
        type="submit"
        disabled={isSubmitting}
        className={button({ fullWidth: true, disabled: isSubmitting })}
      >
        {isSubmitting ? '送信中...' : '送信する'}
      </button>
    </form>
  );
};
