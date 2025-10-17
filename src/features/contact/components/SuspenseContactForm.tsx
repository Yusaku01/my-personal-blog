import { Suspense } from 'react';
import ContactForm from './ContactForm';
import type { ReactNode } from 'react';

interface SuspenseProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export default function SuspenseContactForm({
  fallback = <div className="p-4 border border-gray-300 rounded">読み込み中...</div>,
}: SuspenseProps) {
  return (
    <Suspense fallback={fallback}>
      <ContactForm />
    </Suspense>
  );
}
