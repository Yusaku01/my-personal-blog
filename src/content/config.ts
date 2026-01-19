import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const bookmarkFeeds = defineCollection({
  type: 'data',
  schema: z.object({
    feeds: z.array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        description: z.string().optional(),
        tags: z.array(z.string()).default([]),
        enabled: z.boolean().default(true),
      })
    ),
  }),
});

const bookmarkItems = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        publishDate: z.coerce.date(),
        summary: z.string(),
        reason: z.string(),
        sourceName: z.string(),
        sourceUrl: z.string().url(),
        tags: z.array(z.string()).default([]),
        score: z.number().min(0).max(100).optional(),
      })
    ),
  }),
});

export const collections = {
  blog,
  bookmarkFeeds,
  bookmarkItems,
};
