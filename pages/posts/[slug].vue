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
import type { PostItem } from "~/types/post";

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));

const { data } = await useAsyncData(`post-${slug.value}`, async () => {
  const result = (await queryCollection("posts")
    .where("slug", "=", slug.value)
    .first()) as PostItem | null;
  if (!result) {
    return null;
  }

  if (result.draft && !config.public.showDrafts) {
    return null;
  }
  return result;
});

const post = computed(() => data.value as PostItem | null);
const resolvedPost = post.value;

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
