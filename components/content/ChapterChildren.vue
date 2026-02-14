<template>
  <section class="chapter-children">
    <h2>章节目录</h2>
    <div v-if="children.length > 0" class="grid">
      <article v-for="child in children" :key="child.slug" class="surface card">
        <p class="order">第 {{ child.order }} 节</p>
        <h3>
          <NuxtLink :to="getChapterPostUrl(chapterSlug, child.slug)">
            {{ child.title }}
          </NuxtLink>
        </h3>
        <p class="meta">{{ child.date }}</p>
        <p class="desc">{{ child.description }}</p>
      </article>
    </div>
    <p v-else class="meta">当前章节还没有子文章。</p>
  </section>
</template>

<script setup lang="ts">
import type { ChapterPostItem } from "~/types/post";
import {
  assertChapterPostDirectory,
  filterByVisibility,
  getChapterPostUrl,
  sortChapterChildren
} from "~/utils/posts";

const props = defineProps<{
  chapterSlug?: string;
}>();

const route = useRoute();
const config = useRuntimeConfig();
const chapterSlug = computed(() => props.chapterSlug || String(route.params.chapterSlug || ""));

const { data } = await useAsyncData(
  () => `chapter-children-${chapterSlug.value}-${String(config.public.showDrafts)}`,
  async () => {
    if (!chapterSlug.value) {
      return [];
    }
    const rows = (await queryCollection("chapterPosts").all()) as ChapterPostItem[];
    const filtered = filterByVisibility(rows, config.public.showDrafts).filter(
      (row) => row.chapterSlug === chapterSlug.value
    );

    for (const row of filtered) {
      assertChapterPostDirectory(row);
    }

    return sortChapterChildren(filtered);
  }
);

const children = computed(() => data.value ?? []);
</script>

<style scoped>
.chapter-children {
  margin-top: 1.2rem;
}

.grid {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.card {
  padding: 0.9rem;
}

.card h3 {
  margin: 0.15rem 0 0.2rem;
}

.order {
  color: var(--brand-strong);
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0;
}

.desc {
  margin: 0.35rem 0 0;
}
</style>
