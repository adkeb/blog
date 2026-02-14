<template>
  <section>
    <h1>全部内容</h1>
    <p class="meta">
      共 {{ items.length }} 篇
      <span v-if="config.public.showDrafts">（包含草稿）</span>
    </p>

    <PostCard
      v-for="item in items"
      :key="`${item.kind}:${item.chapterSlug || ''}:${item.slug}`"
      :item="item"
    />

    <section class="surface tags">
      <h2>标签</h2>
      <NuxtLink
        v-for="tag in tags"
        :key="tag"
        class="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      >
        #{{ tag }}
      </NuxtLink>
      <p v-if="tags.length === 0" class="meta">当前没有标签。</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { ChapterItem, ChapterPostItem, FeedItem, PostItem } from "~/types/post";
import { buildUnifiedFeed, extractTags } from "~/utils/posts";

const config = useRuntimeConfig();
const { data } = await useAsyncData("posts-all", async () => {
  const [posts, chapters, chapterPosts] = await Promise.all([
    queryCollection("posts").all() as Promise<PostItem[]>,
    queryCollection("chapters").all() as Promise<ChapterItem[]>,
    queryCollection("chapterPosts").all() as Promise<ChapterPostItem[]>
  ]);

  return buildUnifiedFeed({
    posts,
    chapters,
    chapterPosts,
    showDrafts: config.public.showDrafts
  });
});

const items = computed(() => (data.value ?? []) as FeedItem[]);
const tags = computed(() => extractTags(items.value));

useSeoMeta({
  title: "内容",
  description: "博客全部内容列表（普通文章、章节与章节子文章）。",
  ogType: "website"
});
</script>

<style scoped>
.tags {
  margin-top: 1.3rem;
  padding: 1rem;
}
</style>
