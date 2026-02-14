import { getVisibleFeed } from "~/server/utils/content";

export default defineEventHandler(async (event) => {
  const feed = await getVisibleFeed(event);
  const payload = feed.map((item) => ({
    title: item.title,
    slug: item.slug,
    kind: item.kind,
    url: item.url,
    chapterSlug: item.chapterSlug,
    chapterTitle: item.chapterTitle,
    description: item.description,
    category: item.category,
    tags: item.tags,
    date: item.date,
    draft: item.draft ?? false
  }));

  setHeader(event, "content-type", "application/json; charset=utf-8");
  return payload;
});
