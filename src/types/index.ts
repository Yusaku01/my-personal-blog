import { z } from 'zod';

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(1, { message: '名前を入力してください' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  subject: z.string().min(1, { message: '件名を入力してください' }),
  message: z.string().min(1, { message: 'メッセージを入力してください' }),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Post Types
export type Post = {
  title: string;
  url: string;
  publishDate: Date;
  tags: string[];
} & (
  | {
      platform: string;
      isExternal: true;
      excerpt?: string;
      thumbnail?: string;
    }
  | {
      platform?: string;
      isExternal: false;
      // excerpt?: string;
      thumbnail?: string;
    }
);

// For external posts (e.g., Qiita)
export type ExternalPost = Extract<Post, { isExternal: true }>;
