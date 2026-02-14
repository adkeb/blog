<template>
  <article v-if="chapter" class="surface chapter">
    <h1>{{ chapter.title }}</h1>
    <p class="meta">
      发布：{{ chapter.date }}
      <span v-if="chapter.updated"> · 更新：{{ chapter.updated }}</span>
      <span> · 分类：{{ chapter.category }}</span>
      <span v-if="chapter.draft" class="draft">草稿</span>
    </p>
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
    <hr />
    <ContentRenderer class="prose" :value="chapter" />
    <GiscusComments />
  </article>
</template>

<script setup lang="ts">
import type { ChapterItem } from "~/types/post";
import { getChapterUrl } from "~/utils/posts";

const route = useRoute();
const config = useRuntimeConfig();
const chapterSlug = computed(() => String(route.params.chapterSlug));

const { data } = await useAsyncData(`chapter-${chapterSlug.value}`, async () => {
  const chapter = (await queryCollection("chapters")
    .where("slug", "=", chapterSlug.value)
    .first()) as ChapterItem | null;

  if (!chapter) {
    return null;
  }
  if (chapter.draft && !config.public.showDrafts) {
    return null;
  }
  return chapter;
});

const chapter = computed(() => data.value as ChapterItem | null);
const resolvedChapter = chapter.value;

if (!resolvedChapter) {
  throw createError({
    statusCode: 404,
    statusMessage: "章节不存在"
  });
}

const { touch } = useReadingHistory();
onMounted(() => {
  touch({
    url: getChapterUrl(chapterSlug.value),
    title: resolvedChapter.title,
    kind: "chapter",
    category: resolvedChapter.category
  });
});

const canonical = `${config.public.siteUrl.replace(/\/$/, "")}/chapters/${encodeURIComponent(chapterSlug.value)}`;
useSeoMeta({
  title: `${resolvedChapter.title}（章节）`,
  description: resolvedChapter.description,
  ogTitle: resolvedChapter.title,
  ogDescription: resolvedChapter.description,
  ogType: "article",
  ogUrl: canonical,
  articlePublishedTime: resolvedChapter.date,
  articleModifiedTime: resolvedChapter.updated || resolvedChapter.date
});
</script>

<style scoped>
.chapter {
  padding: 1.2rem;
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
</style>
