import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'お名前を入力してください')
    .max(80, 'お名前は80文字以内で入力してください'),
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .pipe(z.email({ message: '有効なメールアドレスを入力してください' }))
    .pipe(z.string().max(254, 'メールアドレスは254文字以内で入力してください')),
  subject: z
    .string()
    .trim()
    .min(1, '件名を入力してください')
    .max(120, '件名は120文字以内で入力してください'),
  message: z
    .string()
    .trim()
    .min(1, 'メッセージを入力してください')
    .max(4000, 'メッセージは4000文字以内で入力してください'),
});
export type ContactForm = z.infer<typeof contactFormSchema>;

// Post Types
export type PostSource = 'personal' | 'zenn' | 'zennScrap' | 'qiita';

export type Post = {
  title: string;
  url: string;
  publishDate: Date;
  tags: string[];
  source: PostSource;
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
      excerpt?: string;
      thumbnail?: string | ImageMetadata;
    }
);

// For external posts (e.g., Qiita)
export type ExternalPost = Extract<Post, { isExternal: true }>;

export type SearchablePost = Post & {
  searchText: string;
};
