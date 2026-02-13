import type { H3Event } from "h3";
import type { PostItem } from "~/types/post";
import { filterByVisibility, sortPostsDesc } from "~/utils/posts";

export async function getVisiblePosts(event: H3Event): Promise<PostItem[]> {
  const config = useRuntimeConfig(event);
  const all = (await queryCollection(event, "posts").all()) as PostItem[];
  return sortPostsDesc(filterByVisibility(all, config.public.showDrafts));
}

