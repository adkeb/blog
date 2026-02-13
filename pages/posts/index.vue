<template>
  <section>
    <h1>全部文章</h1>
    <p class="meta">
      共 {{ posts.length }} 篇
      <span v-if="config.public.showDrafts">（包含草稿）</span>
    </p>

    <PostCard v-for="post in posts" :key="post.slug" :post="post" />

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
import type { PostItem } from "~/types/post";
import { extractTags, filterByVisibility, sortPostsDesc } from "~/utils/posts";

const config = useRuntimeConfig();
const { data } = await useAsyncData("posts-all", async () => {
  const rows = (await queryCollection("posts").all()) as PostItem[];
  return sortPostsDesc(filterByVisibility(rows, config.public.showDrafts));
});

const posts = computed(() => data.value ?? []);
const tags = computed(() => extractTags(posts.value));

useSeoMeta({
  title: "文章",
  description: "技术文章列表，按时间倒序展示。",
  ogType: "website"
});
</script>

<style scoped>
.tags {
  margin-top: 1.3rem;
  padding: 1rem;
}
</style>

