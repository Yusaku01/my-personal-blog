import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ContactForm } from '../../types';

export default function ContactFormTextarea({
  register,
  errors,
  id = 'message',
}: {
  register: UseFormRegister<ContactForm>;
  errors: FieldErrors<ContactForm>;
  id?: keyof ContactForm;
}) {
  return (
    <>
      <textarea
        id={id}
        rows={6}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 dark:text-gray-900 max-h-60 ${
          errors[id] ? 'border-red-500 text-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
        }`}
        {...register(id)}
      ></textarea>
      {errors[id] && <p className="mt-1 text-sm text-red-500">{errors[id].message}</p>}
    </>
  );
}
