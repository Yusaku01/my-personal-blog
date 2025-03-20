'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ContactForm } from '../../types';

export default function ContactFormInput({
  register,
  errors,
  id,
  type,
}: {
  register: UseFormRegister<ContactForm>;
  errors: FieldErrors<ContactForm>;
  id: keyof ContactForm;
  type: string;
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          errors[id] ? 'border-red-500 text-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
        }`}
        {...register(id)}
      />
      {errors[id] && <p className="mt-1 text-sm text-red-500">{errors[id].message}</p>}
    </>
  );
}
