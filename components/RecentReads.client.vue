<template>
  <section class="surface recent" aria-label="最近阅读">
    <div class="head">
      <h2>最近阅读</h2>
      <button
        v-if="items.length > 0"
        class="clear-btn"
        type="button"
        @click="clear"
      >
        清空
      </button>
    </div>

    <p v-if="items.length === 0" class="meta">你最近还没有阅读记录。</p>

    <ul v-else class="list">
      <li v-for="item in items" :key="item.url" class="entry">
        <div class="main">
          <NuxtLink :to="item.url" class="title">{{ item.title }}</NuxtLink>
          <p class="meta info">
            {{ kindLabel(item.kind) }}
            <span v-if="item.chapterTitle"> · 章节：{{ item.chapterTitle }}</span>
            <span v-if="item.category"> · 分类：{{ item.category }}</span>
            <span> · 浏览于：{{ formatTime(item.visitedAt) }}</span>
          </p>
        </div>
        <button
          class="remove-btn"
          type="button"
          @click="remove(item.url)"
        >
          删除
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ContentKind } from "~/types/post";

const { items, init, remove, clear } = useReadingHistory();

onMounted(() => {
  init();
});

function kindLabel(kind: ContentKind): string {
  if (kind === "chapter") {
    return "章节";
  }
  if (kind === "chapter_post") {
    return "子文章";
  }
  return "文章";
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
</script>

<style scoped>
.recent {
  margin: 0 0 1rem;
  padding: 1rem;
}

.head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.head h2 {
  margin: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.entry {
  align-items: flex-start;
  border: 1px solid var(--line);
  border-radius: 12px;
  display: flex;
  gap: 0.9rem;
  justify-content: space-between;
  padding: 0.7rem;
}

.main {
  min-width: 0;
}

.title {
  display: inline-block;
  font-weight: 700;
}

.info {
  margin: 0.25rem 0 0;
}

.clear-btn,
.remove-btn {
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  padding: 0.25rem 0.55rem;
}

.clear-btn:hover,
.remove-btn:hover {
  border-color: var(--brand);
}

@media (max-width: 640px) {
  .entry {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
