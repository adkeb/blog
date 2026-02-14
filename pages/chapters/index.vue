<template>
  <section>
    <h1>章节总览</h1>
    <p class="meta">共 {{ chapters.length }} 个章节</p>

    <article v-for="chapter in chapters" :key="chapter.slug" class="surface chapter-card">
      <h2>
        <NuxtLink :to="getChapterUrl(chapter.slug)">{{ chapter.title }}</NuxtLink>
      </h2>
      <p class="meta">
        {{ chapter.date }} · {{ chapter.category }} · 子文章 {{ chapter.childCount }} 篇
      </p>
      <p>{{ chapter.description }}</p>
      <div>
        <NuxtLink
          v-for="tag in chapter.tags"
          :key="tag"
          class="tag"
          :to="`/tags/${encodeURIComponent(tag)}`"
        >
          #{{ tag }}
        </NuxtLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { ChapterItem, ChapterPostItem } from "~/types/post";
import {
  assertChapterPostDirectory,
  filterByVisibility,
  getChapterUrl,
  sortPostsDesc
} from "~/utils/posts";

const config = useRuntimeConfig();

const { data } = await useAsyncData("chapters-index", async () => {
  const [chapters, chapterPosts] = await Promise.all([
    queryCollection("chapters").all() as Promise<ChapterItem[]>,
    queryCollection("chapterPosts").all() as Promise<ChapterPostItem[]>
  ]);

  const visibleChapters = sortPostsDesc(filterByVisibility(chapters, config.public.showDrafts));
  const visibleChapterPosts = filterByVisibility(chapterPosts, config.public.showDrafts);

  for (const child of visibleChapterPosts) {
    assertChapterPostDirectory(child);
  }

  const countMap = new Map<string, number>();
  for (const child of visibleChapterPosts) {
    countMap.set(child.chapterSlug, (countMap.get(child.chapterSlug) || 0) + 1);
  }

  return visibleChapters.map((chapter) => ({
    ...chapter,
    childCount: countMap.get(chapter.slug) || 0
  }));
});

const chapters = computed(() => data.value ?? []);

useSeoMeta({
  title: "章节",
  description: "按章节组织的技术目录和子文章集合。",
  ogType: "website"
});
</script>

<style scoped>
.chapter-card {
  margin-bottom: 1rem;
  padding: 1rem;
}

.chapter-card h2 {
  margin: 0 0 0.25rem;
}
</style>
