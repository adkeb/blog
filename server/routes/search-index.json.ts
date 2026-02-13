import { getVisiblePosts } from "~/server/utils/content";

export default defineEventHandler(async (event) => {
  const posts = await getVisiblePosts(event);
  const payload = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    description: post.description,
    category: post.category,
    tags: post.tags,
    date: post.date,
    draft: post.draft ?? false
  }));

  setHeader(event, "content-type", "application/json; charset=utf-8");
  return payload;
});
