<template>
  <section v-if="enabled" class="surface comments">
    <h2>评论</h2>
    <div ref="container" />
  </section>
</template>

<script setup lang="ts">
const container = ref<HTMLElement | null>(null);
const route = useRoute();
const config = useRuntimeConfig();

const enabled = computed(() => {
  const g = config.public.giscus;
  return Boolean(g.repo && g.repoId && g.category && g.categoryId);
});

function mountGiscus() {
  if (!enabled.value || !container.value) {
    return;
  }

  container.value.innerHTML = "";
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  const g = config.public.giscus;
  script.setAttribute("data-repo", g.repo);
  script.setAttribute("data-repo-id", g.repoId);
  script.setAttribute("data-category", g.category);
  script.setAttribute("data-category-id", g.categoryId);
  script.setAttribute("data-mapping", g.mapping);
  script.setAttribute("data-strict", g.strict);
  script.setAttribute("data-reactions-enabled", g.reactionsEnabled);
  script.setAttribute("data-emit-metadata", g.emitMetadata);
  script.setAttribute("data-input-position", g.inputPosition);
  script.setAttribute("data-theme", g.theme);
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");

  container.value.appendChild(script);
}

onMounted(() => {
  mountGiscus();
});

watch(
  () => route.fullPath,
  () => {
    mountGiscus();
  }
);
</script>

<style scoped>
.comments {
  margin-top: 1.5rem;
  padding: 1rem 1rem 0;
}
</style>
