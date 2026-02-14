import type { H3Event } from "h3";
import { queryCollection } from "@nuxt/content/server";
import type { ChapterItem, ChapterPostItem, FeedItem, PostItem } from "~/types/post";
import {
  buildUnifiedFeed,
  filterByVisibility,
  sortPostsDesc
} from "~/utils/posts";

export async function getVisiblePosts(event: H3Event): Promise<PostItem[]> {
  const config = useRuntimeConfig(event);
  const all = (await queryCollection(event, "posts").all()) as PostItem[];
  return sortPostsDesc(filterByVisibility(all, config.public.showDrafts));
}

export async function getVisibleChapters(event: H3Event): Promise<ChapterItem[]> {
  const config = useRuntimeConfig(event);
  const all = (await queryCollection(event, "chapters").all()) as ChapterItem[];
  return sortPostsDesc(filterByVisibility(all, config.public.showDrafts));
}

export async function getVisibleChapterPosts(event: H3Event): Promise<ChapterPostItem[]> {
  const config = useRuntimeConfig(event);
  const all = (await queryCollection(event, "chapterPosts").all()) as ChapterPostItem[];
  return sortPostsDesc(filterByVisibility(all, config.public.showDrafts));
}

export async function getVisibleFeed(event: H3Event): Promise<FeedItem[]> {
  const config = useRuntimeConfig(event);
  const [posts, chapters] = await Promise.all([
    queryCollection(event, "posts").all() as Promise<PostItem[]>,
    queryCollection(event, "chapters").all() as Promise<ChapterItem[]>
  ]);

  return buildUnifiedFeed({
    posts,
    chapters,
    showDrafts: config.public.showDrafts,
    includeChapterPosts: false
  });
}
