import { z } from 'zod';

// 共通の日付スキーマ
export const dateSchema = z.date();

// 基本的な投稿スキーマ
export const basePostSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  publishDate: dateSchema,
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([])
});

// 外部投稿スキーマ
export const externalPostSchema = basePostSchema.extend({
  platform: z.string(),
  isExternal: z.literal(true)
});

// 内部投稿スキーマ
export const internalPostSchema = basePostSchema.extend({
  isExternal: z.literal(false)
});

// 投稿スキーマの統合
export const postSchema = z.discriminatedUnion("isExternal", [
  internalPostSchema,
  externalPostSchema
]);

// お問い合わせフォームスキーマ
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, "お名前は必須です")
    .max(50, "お名前は50文字以内で入力してください"),
  email: z.string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください"),
  subject: z.string()
    .min(1, "件名は必須です")
    .max(100, "件名は100文字以内で入力してください"),
  message: z.string()
    .min(1, "メッセージは必須です")
    .max(1000, "メッセージは1000文字以内で入力してください")
});

// 型の定義
export type Post = z.infer<typeof postSchema>;
export type InternalPost = z.infer<typeof internalPostSchema>;
export type ExternalPost = z.infer<typeof externalPostSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;