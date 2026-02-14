<template>
  <article v-if="post" class="surface post">
    <h1>{{ post.title }}</h1>
    <p class="meta">
      发布：{{ post.date }}
      <span v-if="post.updated"> · 更新：{{ post.updated }}</span>
      <span> · 分类：{{ post.category }}</span>
      <span v-if="post.draft" class="draft">草稿</span>
    </p>
    <div>
      <NuxtLink
        v-for="tag in post.tags"
        :key="tag"
        class="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      >
        #{{ tag }}
      </NuxtLink>
    </div>
    <hr />
    <ContentRenderer class="prose" :value="post" />
    <GiscusComments />
  </article>
</template>

<script setup lang="ts">
import type { ChapterItem, ChapterPostItem, PostItem } from "~/types/post";
import {
  assertChapterPostDirectory,
  filterByVisibility,
  getChapterPostLeafSlug,
  getChapterPostUrl
} from "~/utils/posts";

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));

const { data } = await useAsyncData(`post-${slug.value}`, async () => {
  const result = (await queryCollection("posts").where("slug", "=", slug.value).first()) as PostItem | null;
  if (result) {
    if (result.draft && !config.public.showDrafts) {
      return { mode: "not_found" } as const;
    }
    return { mode: "post", post: result } as const;
  }

  const [chapterPosts, chapters] = await Promise.all([
    queryCollection("chapterPosts").all() as Promise<ChapterPostItem[]>,
    queryCollection("chapters").all() as Promise<ChapterItem[]>
  ]);

  const visibleChapters = new Set(
    filterByVisibility(chapters, config.public.showDrafts).map((chapter) => chapter.slug)
  );
  const matches = filterByVisibility(chapterPosts, config.public.showDrafts).filter((item) =>
    visibleChapters.has(item.chapterSlug) &&
    (item.legacySlugs || []).includes(slug.value)
  );

  for (const item of matches) {
    assertChapterPostDirectory(item);
  }

  if (matches.length > 1) {
    throw createError({
      statusCode: 500,
      statusMessage: `legacySlugs 冲突：${slug.value}`
    });
  }

  if (matches.length === 1) {
    return {
      mode: "redirect",
      to: getChapterPostUrl(matches[0].chapterSlug, getChapterPostLeafSlug(matches[0]))
    } as const;
  }

  return { mode: "not_found" } as const;
});

const postData = computed(() => data.value);

if (postData.value?.mode === "redirect") {
  await navigateTo(postData.value.to, {
    redirectCode: 301
  });
}

const post = computed(() => (postData.value?.mode === "post" ? postData.value.post : null));
const resolvedPost = post.value as PostItem | null;

if (!resolvedPost) {
  throw createError({
    statusCode: 404,
    statusMessage: "文章不存在"
  });
}

const canonical = `${config.public.siteUrl.replace(/\/$/, "")}/posts/${encodeURIComponent(slug.value)}`;
useSeoMeta({
  title: resolvedPost.title,
  description: resolvedPost.description,
  ogTitle: resolvedPost.title,
  ogDescription: resolvedPost.description,
  ogType: "article",
  ogUrl: canonical,
  articlePublishedTime: resolvedPost.date,
  articleModifiedTime: resolvedPost.updated || resolvedPost.date
});
</script>

<style scoped>
.post {
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
