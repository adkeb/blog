import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const basePostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().default("General"),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  toc: z.boolean().default(true),
  lang: z.string().default("zh-CN")
});

const appSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  url: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().default("Application"),
  status: z.enum(["online", "private", "offline"]).default("online"),
  order: z.number().default(100),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  lang: z.string().default("zh-CN")
});

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: "page",
      source: "posts/*.md",
      schema: basePostSchema
    }),
    chapters: defineCollection({
      type: "page",
      source: "chapters/*.md",
      schema: basePostSchema
    }),
    chapterPosts: defineCollection({
      type: "page",
      source: "chapter-posts/**/*.md",
      schema: basePostSchema.extend({
        chapterSlug: z.string(),
        order: z.number(),
        legacySlugs: z.array(z.string()).default([])
      })
    }),
    apps: defineCollection({
      type: "page",
      source: "apps/*.md",
      schema: appSchema
    })
  }
});
