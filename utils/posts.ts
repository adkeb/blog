import type { PostItem } from "~/types/post";

export function sortPostsDesc(posts: PostItem[]): PostItem[] {
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function filterByVisibility(posts: PostItem[], showDrafts: boolean): PostItem[] {
  if (showDrafts) {
    return posts;
  }
  return posts.filter((post) => !post.draft);
}

export function extractTags(posts: PostItem[]): string[] {
  const allTags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      allTags.add(tag);
    }
  }
  return [...allTags].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

