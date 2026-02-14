<template>
  <section>
    <h1>标签：#{{ tag }}</h1>
    <p class="meta">共 {{ items.length }} 篇文章</p>
    <PostCard
      v-for="item in items"
      :key="`${item.kind}:${item.chapterSlug || ''}:${item.slug}`"
      :item="item"
    />
  </section>
</template>

<script setup lang="ts">
import type { ChapterItem, FeedItem, PostItem } from "~/types/post";
import { buildUnifiedFeed } from "~/utils/posts";

const route = useRoute();
const config = useRuntimeConfig();
const tag = computed(() => decodeURIComponent(String(route.params.tag)));

const { data } = await useAsyncData(`tag-${tag.value}`, async () => {
  const [posts, chapters] = await Promise.all([
    queryCollection("posts").all() as Promise<PostItem[]>,
    queryCollection("chapters").all() as Promise<ChapterItem[]>
  ]);

  const feed = buildUnifiedFeed({
    posts,
    chapters,
    showDrafts: config.public.showDrafts,
    includeChapterPosts: false
  });
  return feed.filter((item) => (item.tags || []).includes(tag.value));
});

const items = computed(() => (data.value ?? []) as FeedItem[]);

useSeoMeta({
  title: `标签 #${tag.value}`,
  description: `按标签 ${tag.value} 聚合的技术文章。`
});
</script>
