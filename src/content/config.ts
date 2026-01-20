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

const findsFeed = defineCollection({
  type: 'data',
  schema: z.object({
    feeds: z.array(
      z.object({
        name: z.string(),
        nameUrl: z.string().url().optional(),
        url: z.string().url(),
        description: z.string().optional(),
        tags: z.array(z.string()).default([]),
        enabled: z.boolean().default(true),
      })
    ),
  }),
});

export const collections = {
  blog,
  findsFeed,
};
