<template>
  <section v-if="enabled" class="surface comments">
    <h2>评论</h2>
    <ClientOnly>
      <Giscus
        :key="widgetKey"
        :repo="giscus.repo"
        :repo-id="giscus.repoId"
        :category="giscus.category"
        :category-id="giscus.categoryId"
        :mapping="giscus.mapping"
        :strict="giscus.strict"
        :reactions-enabled="giscus.reactionsEnabled"
        :emit-metadata="giscus.emitMetadata"
        :input-position="giscus.inputPosition"
        :theme="resolvedTheme"
        lang="zh-CN"
        loading="eager"
      />
      <template #fallback>
        <p class="meta">评论加载中...</p>
      </template>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import Giscus from "@giscus/vue";
import type { BooleanString, InputPosition, Mapping, Repo } from "@giscus/vue";

const route = useRoute();
const config = useRuntimeConfig();
const { theme } = useTheme();

const enabled = computed(() => {
  const g = config.public.giscus;
  const repo = String(g.repo || "");
  return Boolean(repo.includes("/") && g.repoId && g.category && g.categoryId);
});

function toBooleanString(value: unknown, fallback: BooleanString): BooleanString {
  const text = String(value ?? "");
  if (text === "1") {
    return "1";
  }
  if (text === "0") {
    return "0";
  }
  return fallback;
}

function toInputPosition(value: unknown): InputPosition {
  return String(value) === "top" ? "top" : "bottom";
}

function toMapping(value: unknown): Mapping {
  const text = String(value ?? "pathname");
  const values: Mapping[] = ["url", "title", "og:title", "specific", "number", "pathname"];
  return values.includes(text as Mapping) ? (text as Mapping) : "pathname";
}

const giscus = computed(() => {
  const g = config.public.giscus;
  return {
    repo: String(g.repo || "") as Repo,
    repoId: String(g.repoId || ""),
    category: String(g.category || ""),
    categoryId: String(g.categoryId || ""),
    mapping: toMapping(g.mapping),
    strict: toBooleanString(g.strict, "0"),
    reactionsEnabled: toBooleanString(g.reactionsEnabled, "1"),
    emitMetadata: toBooleanString(g.emitMetadata, "0"),
    inputPosition: toInputPosition(g.inputPosition)
  };
});

const resolvedTheme = computed(() => {
  const configured = String(config.public.giscus.theme || "").trim();
  if (!configured || configured === "preferred_color_scheme") {
    return theme.value === "dark" ? "dark" : "light";
  }
  return configured;
});

const widgetKey = computed(() => `${route.path}::${resolvedTheme.value}`);
</script>

<style scoped>
.comments {
  margin-top: 1.5rem;
  padding: 1rem 1rem 0;
}
</style>
