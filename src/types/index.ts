import { z } from 'zod';

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  subject: z.string().min(1, '件名を入力してください'),
  message: z.string().min(1, 'メッセージを入力してください'),
});
export type ContactForm = z.infer<typeof contactFormSchema>;

// Post Types
export type Post = {
  title: string;
  url: string;
  publishDate: Date;
  tags: string[];
  excerpt?: string;
} & (
  | {
      platform: string;
      isExternal: true;
      thumbnail?: string;
    }
  | {
      platform?: string;
      isExternal: false;
      thumbnail?: string;
    }
);

// For external posts (e.g., Qiita)
export type ExternalPost = Extract<Post, { isExternal: true }>;
