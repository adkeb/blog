<template>
  <article class="surface card">
    <h2 class="title">
      <NuxtLink :to="item.url">{{ item.title }}</NuxtLink>
    </h2>
    <p class="meta">
      {{ item.date }} · {{ item.category }}
      <span class="kind">{{ kindLabel }}</span>
      <span v-if="item.chapterTitle" class="chapter"> · 章节：{{ item.chapterTitle }}</span>
      <span v-if="item.draft" class="draft">草稿</span>
    </p>
    <p class="description">{{ item.description }}</p>
    <div>
      <NuxtLink
        v-for="tag in item.tags"
        :key="tag"
        class="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      >
        #{{ tag }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { FeedItem } from "~/types/post";

const props = defineProps<{
  item: FeedItem;
}>();

const kindLabel = computed(() => {
  if (props.item.kind === "chapter") {
    return "章节";
  }
  if (props.item.kind === "chapter_post") {
    return "子文章";
  }
  return "文章";
});
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
  padding: 1.2rem;
}

.title {
  margin: 0 0 0.3rem;
}

.description {
  margin: 0.6rem 0 0.8rem;
}

.kind {
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.75rem;
  margin-left: 0.45rem;
  padding: 0.05rem 0.45rem;
}

.chapter {
  color: var(--text-soft);
}

.draft {
  background: #fde68a;
  border-radius: 6px;
  color: #7c2d12;
  font-size: 0.8rem;
  margin-left: 0.4rem;
  padding: 0.1rem 0.35rem;
}
</style>
