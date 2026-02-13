<template>
  <section>
    <h1>标签：#{{ tag }}</h1>
    <p class="meta">共 {{ posts.length }} 篇文章</p>
    <PostCard v-for="post in posts" :key="post.slug" :post="post" />
  </section>
</template>

<script setup lang="ts">
import type { PostItem } from "~/types/post";
import { filterByVisibility, sortPostsDesc } from "~/utils/posts";

const route = useRoute();
const config = useRuntimeConfig();
const tag = computed(() => decodeURIComponent(String(route.params.tag)));

const { data } = await useAsyncData(`tag-${tag.value}`, async () => {
  const rows = (await queryCollection("posts").all()) as PostItem[];
  const visible = filterByVisibility(rows, config.public.showDrafts);
  return sortPostsDesc(visible.filter((post) => (post.tags || []).includes(tag.value)));
});

const posts = computed(() => data.value ?? []);

useSeoMeta({
  title: `标签 #${tag.value}`,
  description: `按标签 ${tag.value} 聚合的技术文章。`
});
</script>

