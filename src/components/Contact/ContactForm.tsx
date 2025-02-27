import React, { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactForm as ContactFormData } from '../../types/index';
import { submitContactForm } from '../../lib/api-clients/contact';
import { button, input } from '../../styles/variants';

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
    register: ReturnType<typeof useForm>['register'];
    error?: { message?: string };
    rows?: number;
  }) => {
    const InputComponent = rows ? 'textarea' : 'input';

    return (
      <div className="mb-6">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
        <InputComponent
          id={id}
          type={type}
          {...register(id)}
          rows={rows}
          className={input({ color: error ? 'error' : 'primary' })}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
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
      return <div className="mt-2 text-blue-600">処理中です。しばらくお待ちください...</div>;
    }

    if (isSuccess) {
      return <div className="mt-2 text-green-600">お問い合わせを送信しました！</div>;
    }

    if (error) {
      return <div className="mt-2 text-red-600">{error}</div>;
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-[#222] p-6 rounded-lg shadow-sm pt-6 pb-14 space-y-3"
    >
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

      <div className="mt-6">
        <FormStatus
          isPending={isPending}
          isSuccess={formStatus.isSuccess}
          error={formStatus.error}
        />
      </div>

      <div className="mx-auto grid justify-center mt-8">
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
