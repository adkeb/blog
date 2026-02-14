<template>
  <section class="surface hero">
    <p class="eyebrow">Cloudflare Pages + Tunnel</p>
    <h1>个人技术博客</h1>
    <p>
      这是一个以技术沉淀为目标的博客模板。公开站点部署在 Cloudflare Pages，
      私有预览和后台通过 Cloudflare Tunnel 暴露。
    </p>
    <div class="hero-actions">
      <NuxtLink class="cta" to="/posts">进入文章列表</NuxtLink>
      <NuxtLink class="cta secondary" to="/search">搜索文章</NuxtLink>
    </div>
  </section>

  <section>
    <h2>最新文章</h2>
    <PostCard
      v-for="item in latestPosts"
      :key="`${item.kind}:${item.chapterSlug || ''}:${item.slug}`"
      :item="item"
    />
    <p v-if="latestPosts.length === 0" class="meta">暂无文章。</p>
  </section>
</template>

<script setup lang="ts">
import type { ChapterItem, ChapterPostItem, FeedItem, PostItem } from "~/types/post";
import { buildUnifiedFeed } from "~/utils/posts";

const config = useRuntimeConfig();

const { data } = await useAsyncData("home-posts", async () => {
  const [posts, chapters, chapterPosts] = await Promise.all([
    queryCollection("posts").all() as Promise<PostItem[]>,
    queryCollection("chapters").all() as Promise<ChapterItem[]>,
    queryCollection("chapterPosts").all() as Promise<ChapterPostItem[]>
  ]);

  return buildUnifiedFeed({
    posts,
    chapters,
    chapterPosts,
    showDrafts: config.public.showDrafts
  }).slice(0, 6);
});

const latestPosts = computed(() => (data.value ?? []) as FeedItem[]);

useSeoMeta({
  title: "首页",
  description: "技术沉淀博客首页，展示最新文章。",
  ogTitle: "个人博客",
  ogDescription: "Nuxt + Cloudflare Pages + Tunnel 混合托管博客",
  ogType: "website",
  ogUrl: config.public.siteUrl
});
</script>

<style scoped>
.hero {
  margin-bottom: 1.5rem;
  padding: 1.2rem;
}

.eyebrow {
  color: var(--brand);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0.3rem 0 0.4rem;
}

.hero-actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 1rem;
}

.cta {
  background: var(--brand);
  border-radius: 10px;
  color: #f0fdfa;
  display: inline-block;
  padding: 0.5rem 0.8rem;
}

.cta.secondary {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}
</style>
