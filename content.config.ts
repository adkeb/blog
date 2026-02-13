import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: "page",
      source: "posts/*.md",
      schema: z.object({
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
      })
    })
  }
});

