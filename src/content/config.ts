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

const profile = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
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
