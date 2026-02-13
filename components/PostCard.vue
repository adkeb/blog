<template>
  <article class="surface card">
    <h2 class="title">
      <NuxtLink :to="`/posts/${post.slug}`">{{ post.title }}</NuxtLink>
    </h2>
    <p class="meta">
      {{ post.date }} · {{ post.category }}
      <span v-if="post.draft" class="draft">草稿</span>
    </p>
    <p class="description">{{ post.description }}</p>
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
  </article>
</template>

<script setup lang="ts">
import type { PostItem } from "~/types/post";

defineProps<{
  post: PostItem;
}>();
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

.draft {
  background: #fde68a;
  border-radius: 6px;
  color: #7c2d12;
  font-size: 0.8rem;
  margin-left: 0.4rem;
  padding: 0.1rem 0.35rem;
}
</style>

