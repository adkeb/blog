<template>
  <header class="header">
    <div class="container row">
      <NuxtLink class="brand" to="/">{{ customization.brandName }}</NuxtLink>
      <div class="actions">
        <nav class="nav">
          <NuxtLink to="/posts">文章</NuxtLink>
          <NuxtLink to="/chapters">章节</NuxtLink>
          <NuxtLink to="/search">搜索</NuxtLink>
          <NuxtLink to="/about">关于</NuxtLink>
        </nav>
        <button
          class="theme-toggle"
          type="button"
          :aria-label="themeLabel"
          @click="toggleTheme"
        >
          {{ themeLabel }}
        </button>
      </div>
    </div>
    <div v-if="runtimeConfig.public.showDrafts" class="preview-tip">
      当前为预览模式：草稿可见
    </div>
  </header>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const { theme, toggleTheme } = useTheme();
const { state: customization } = useLiveCustomization();

const themeLabel = computed(() => (theme.value === "dark" ? "日间" : "夜间"));
</script>

<style scoped>
.header {
  background: var(--header-bg);
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

.actions {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.theme-toggle {
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  padding: 0.2rem 0.7rem;
}

.theme-toggle:hover {
  border-color: var(--brand);
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

  .actions {
    justify-content: center;
    width: 100%;
  }
}
</style>
