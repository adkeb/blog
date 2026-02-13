<template>
  <header class="header">
    <div class="container row">
      <NuxtLink class="brand" to="/">Personal Blog</NuxtLink>
      <nav class="nav">
        <NuxtLink to="/posts">文章</NuxtLink>
        <NuxtLink to="/search">搜索</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </div>
    <div v-if="runtimeConfig.public.showDrafts" class="preview-tip">
      当前为预览模式：草稿可见
    </div>
  </header>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
</script>

<style scoped>
.header {
  background: #ffffffcc;
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.4rem;
  position: sticky;
  top: 0;
  z-index: 20;
}

.row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 4rem;
}

.brand {
  color: var(--brand-strong);
  font-size: 1.2rem;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 1rem;
}

.preview-tip {
  background: #dbeafe;
  color: #1e3a8a;
  font-size: 0.9rem;
  padding: 0.45rem 1rem;
  text-align: center;
}

@media (max-width: 640px) {
  .row {
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.8rem 1rem;
  }
}
</style>

