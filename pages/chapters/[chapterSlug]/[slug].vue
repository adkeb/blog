<template>
  <article v-if="entry" class="surface post">
    <nav class="meta breadcrumb">
      <NuxtLink to="/chapters">章节</NuxtLink>
      <span>/</span>
      <NuxtLink :to="getChapterUrl(chapter.slug)">{{ chapter.title }}</NuxtLink>
      <span>/</span>
      <span>{{ entry.title }}</span>
    </nav>

    <h1>{{ entry.title }}</h1>
    <p class="meta">
      发布：{{ entry.date }}
      <span v-if="entry.updated"> · 更新：{{ entry.updated }}</span>
      <span> · 第 {{ entry.order }} 节</span>
      <span> · 分类：{{ entry.category }}</span>
      <span v-if="entry.draft" class="draft">草稿</span>
    </p>

    <div>
      <NuxtLink
        v-for="tag in entry.tags"
        :key="tag"
        class="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      >
        #{{ tag }}
      </NuxtLink>
    </div>

    <hr />
    <ContentRenderer class="prose" :value="entry" />

    <nav class="chapter-nav">
      <NuxtLink v-if="prev" :to="getChapterPostUrl(chapter.slug, getChapterPostLeafSlug(prev))">
        ← 上一篇：{{ prev.title }}
      </NuxtLink>
      <span v-else class="meta">← 已是第一篇</span>

      <NuxtLink v-if="next" :to="getChapterPostUrl(chapter.slug, getChapterPostLeafSlug(next))">
        下一篇：{{ next.title }} →
      </NuxtLink>
      <span v-else class="meta">已是最后一篇 →</span>
    </nav>

    <GiscusComments />
  </article>
</template>

<script setup lang="ts">
import type { ChapterItem, ChapterPostItem } from "~/types/post";
import {
  assertChapterPostDirectory,
  filterByVisibility,
  getChapterPostLeafSlug,
  getChapterPostUrl,
  getChapterUrl,
  sortChapterChildren
} from "~/utils/posts";

const route = useRoute();
const config = useRuntimeConfig();
const chapterSlug = computed(() => String(route.params.chapterSlug));
const slug = computed(() => String(route.params.slug));

const { data } = await useAsyncData(`chapter-post-${chapterSlug.value}-${slug.value}`, async () => {
  const [chapter, allChildren] = await Promise.all([
    queryCollection("chapters").where("slug", "=", chapterSlug.value).first() as Promise<ChapterItem | null>,
    queryCollection("chapterPosts").all() as Promise<ChapterPostItem[]>
  ]);

  if (!chapter) {
    return null;
  }
  if (chapter.draft && !config.public.showDrafts) {
    return null;
  }

  const children = sortChapterChildren(
    filterByVisibility(allChildren, config.public.showDrafts).filter(
      (item) => item.chapterSlug === chapterSlug.value
    )
  );

  for (const child of children) {
    assertChapterPostDirectory(child);
  }

  const index = children.findIndex((item) => getChapterPostLeafSlug(item) === slug.value);
  if (index === -1) {
    return null;
  }

  return {
    chapter,
    entry: children[index],
    prev: index > 0 ? children[index - 1] : null,
    next: index < children.length - 1 ? children[index + 1] : null
  };
});

const payload = computed(() => data.value);
const chapter = computed(() => payload.value?.chapter as ChapterItem);
const entry = computed(() => payload.value?.entry as ChapterPostItem);
const prev = computed(() => payload.value?.prev as ChapterPostItem | null);
const next = computed(() => payload.value?.next as ChapterPostItem | null);

if (!payload.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "章节子文章不存在"
  });
}

const canonical = `${config.public.siteUrl.replace(/\/$/, "")}${getChapterPostUrl(chapterSlug.value, slug.value)}`;
useSeoMeta({
  title: payload.value.entry.title,
  description: payload.value.entry.description,
  ogTitle: payload.value.entry.title,
  ogDescription: payload.value.entry.description,
  ogType: "article",
  ogUrl: canonical,
  articlePublishedTime: payload.value.entry.date,
  articleModifiedTime: payload.value.entry.updated || payload.value.entry.date
});
</script>

<style scoped>
.post {
  padding: 1.2rem;
}

.breadcrumb {
  align-items: center;
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.chapter-nav {
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  margin-top: 1.2rem;
  padding-top: 0.9rem;
}

.draft {
  background: #fde68a;
  border-radius: 6px;
  color: #7c2d12;
  font-size: 0.85rem;
  margin-left: 0.4rem;
  padding: 0.1rem 0.4rem;
}

hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 1rem 0;
}

@media (max-width: 640px) {
  .chapter-nav {
    flex-direction: column;
    gap: 0.6rem;
  }
}
</style>
