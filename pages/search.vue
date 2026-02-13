<template>
  <section>
    <h1>搜索</h1>
    <input
      v-model="keyword"
      class="search-input"
      placeholder="输入标题、摘要或标签关键词"
      type="search"
    />
    <p class="meta">命中 {{ filtered.length }} 条结果</p>
    <PostCard v-for="item in filtered" :key="item.slug" :post="item" />
  </section>
</template>

<script setup lang="ts">
import Fuse from "fuse.js";
import type { PostItem } from "~/types/post";

const keyword = ref("");

const { data } = await useFetch<PostItem[]>("/search-index.json", {
  default: () => []
});

const filtered = computed(() => {
  const list = data.value ?? [];
  if (!keyword.value.trim()) {
    return list;
  }
  const engine = new Fuse(list, {
    includeScore: true,
    threshold: 0.35,
    keys: ["title", "description", "tags"]
  });
  return engine.search(keyword.value.trim()).map((row) => row.item);
});

useSeoMeta({
  title: "搜索",
  description: "博客全文检索（标题、摘要、标签）。"
});
</script>

<style scoped>
.search-input {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  margin: 0.8rem 0;
  max-width: 640px;
  padding: 0.7rem;
  width: 100%;
}
</style>

