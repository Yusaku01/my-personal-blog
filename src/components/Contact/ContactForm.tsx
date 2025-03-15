import React, { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '../../types/index';
import type { ContactForm as ContactFormData } from '../../types/index';
import { submitContactForm } from '../../lib/api-clients/contact';
import { button, input } from '../../styles/unoVariants';

// FormInputコンポーネント固有のスタイル
const formInputStyles = {
  container: 'mb-6',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  errorMessage: 'mt-1 text-sm text-red-600 dark:text-red-400',
};

// FormStatusコンポーネント固有のスタイル
const formStatusStyles = {
  pending: 'mt-2 text-gray-600 dark:text-gray-400',
  success: 'mt-2 text-gray-700 dark:text-gray-300',
  error: 'mt-2 text-gray-700 dark:text-gray-300',
};

// ContactFormコンポーネント固有のスタイル
const contactFormStyles = {
  form: 'bg-white dark:bg-gray-800 p-6 rounded-lg pt-6 pb-14 space-y-3',
  statusContainer: 'mt-6',
  buttonContainer: 'mx-auto grid justify-center mt-8',
};

// FormInput コンポーネントで入力フィールドの責務を分離
const FormInput = React.memo(
  ({
    id,
    label,
    type = 'text',
    register,
    error,
    rows,
  }: {
    id: keyof ContactFormData;
    label: string;
    type?: string;
    register: UseFormRegister<ContactFormData>;
    error?: { message?: string };
    rows?: number;
  }) => {
    const InputComponent = rows ? 'textarea' : 'input';

    return (
      <div className={formInputStyles.container}>
        <label htmlFor={id} className={formInputStyles.label}>
          {label}
        </label>
        <InputComponent
          id={id}
          type={type}
          {...register(id)}
          rows={rows}
          className={input({ color: error ? 'error' : 'primary' })}
        />
        {error && <p className={formInputStyles.errorMessage}>{error.message}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// FormStatus コンポーネントでフォームの状態表示の責務を分離
const FormStatus = React.memo(
  ({
    isPending,
    isSuccess,
    error,
  }: {
    isPending: boolean;
    isSuccess: boolean;
    error: string | null;
  }) => {
    if (isPending) {
      return <div className={formStatusStyles.pending}>処理中です。しばらくお待ちください...</div>;
    }

    if (isSuccess) {
      return <div className={formStatusStyles.success}>お問い合わせを送信しました！</div>;
    }

    if (error) {
      return <div className={formStatusStyles.error}>{error}</div>;
    }

    return null;
  }
);

FormStatus.displayName = 'FormStatus';

export const ContactForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [formStatus, setFormStatus] = useState<{
    isSuccess: boolean;
    error: string | null;
  }>({
    isSuccess: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // useCallbackでメモ化してレンダリングごとに再生成されるのを防止
  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      // エラーや成功メッセージをリセット
      setFormStatus({ isSuccess: false, error: null });

      try {
        // 非同期処理をstartTransitionの外側で実行
        await submitContactForm(data);

        // 状態更新のみをstartTransitionでラップ
        startTransition(() => {
          setFormStatus({ isSuccess: true, error: null });
          reset();
        });
      } catch (error) {
        // エラー時の状態更新もstartTransitionでラップ
        startTransition(() => {
          setFormStatus({
            isSuccess: false,
            error: 'エラーが発生しました。時間をおいて再度お試しください。',
          });
        });
        console.error('Form submission error:', error);
      }
    },
    [reset, startTransition]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={contactFormStyles.form}>
      <FormInput id="name" label="お名前" register={register} error={errors.name} />

      <FormInput
        id="email"
        label="メールアドレス"
        type="email"
        register={register}
        error={errors.email}
      />

      <FormInput id="subject" label="件名" register={register} error={errors.subject} />

      <FormInput
        id="message"
        label="メッセージ"
        register={register}
        error={errors.message}
        rows={5}
      />

      <input type="hidden" name="_csrf" value="token" />

      <div className={contactFormStyles.statusContainer}>
        <FormStatus
          isPending={isPending}
          isSuccess={formStatus.isSuccess}
          error={formStatus.error}
        />
      </div>

      <div className={contactFormStyles.buttonContainer}>
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className={button({ size: 'md', disabled: isSubmitting || isPending })}
        >
          {isSubmitting || isPending ? '送信中...' : '送信する'}
        </button>
      </div>
    </form>
  );
};
