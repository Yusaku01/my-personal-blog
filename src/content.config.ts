import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    pattern: '{ja,en}/**/*.{md,mdx}',
    base: './src/content/blog',
    retainBody: true,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.date(),
      author: z.string(),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

const findsFeed = defineCollection({
  loader: glob({
    pattern: '*.json',
    base: './src/content/findsFeed',
  }),
  schema: z.object({
    feeds: z.array(
      z.object({
        name: z.string(),
        nameUrl: z.url().optional(),
        url: z.url(),
        description: z.string().optional(),
        tags: z.array(z.string()).default([]),
        enabled: z.boolean().default(true),
      })
    ),
  }),
});

const profile = defineCollection({
  loader: glob({
    pattern: '*.mdx',
    base: './src/content/profile',
  }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    socialLinks: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
        iconLight: z.string(),
        iconDark: z.string(),
        class: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  blog,
  findsFeed,
  profile,
};
