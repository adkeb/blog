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
const { theme } = useTheme();
const mountedKey = ref("");
let ensureTimer: ReturnType<typeof window.setTimeout> | null = null;
let retryCount = 0;

const enabled = computed(() => {
  const g = config.public.giscus;
  return Boolean(g.repo && g.repoId && g.category && g.categoryId);
});

const resolvedTheme = computed(() => {
  const configured = String(config.public.giscus.theme || "").trim();
  if (!configured || configured === "preferred_color_scheme") {
    return theme.value === "dark" ? "dark" : "light";
  }
  return configured;
});

function postThemeToIframe(nextTheme: string): boolean {
  const iframe = container.value?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  if (!iframe?.contentWindow) {
    return false;
  }

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme: nextTheme
        }
      }
    },
    "https://giscus.app"
  );
  return true;
}

function hasGiscusFrame(): boolean {
  return Boolean(container.value?.querySelector("iframe.giscus-frame"));
}

function clearEnsureTimer(): void {
  if (ensureTimer) {
    window.clearTimeout(ensureTimer);
    ensureTimer = null;
  }
}

function scheduleEnsureFrame(key: string): void {
  clearEnsureTimer();
  ensureTimer = window.setTimeout(() => {
    if (mountedKey.value !== key) {
      return;
    }

    if (hasGiscusFrame()) {
      retryCount = 0;
      return;
    }

    if (retryCount >= 2) {
      return;
    }

    retryCount += 1;
    mountGiscus(true);
  }, 3200);
}

function mountGiscus(force = false) {
  if (!enabled.value || !container.value) {
    return;
  }

  const key = `${route.path}::${resolvedTheme.value}`;
  const hasFrame = hasGiscusFrame();
  if (!force && hasFrame && mountedKey.value === key) {
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
  script.setAttribute("data-theme", resolvedTheme.value);
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "eager");

  script.addEventListener("error", () => {
    scheduleEnsureFrame(key);
  });

  container.value.appendChild(script);
  mountedKey.value = key;
  scheduleEnsureFrame(key);
}

onMounted(() => {
  mountGiscus(true);
});

onBeforeUnmount(() => {
  clearEnsureTimer();
});

watch(
  () => route.path,
  () => {
    retryCount = 0;
    mountGiscus(true);
  }
);

watch(
  () => resolvedTheme.value,
  (nextTheme) => {
    if (!postThemeToIframe(nextTheme)) {
      mountGiscus(true);
    }
  }
);
</script>

<style scoped>
.comments {
  margin-top: 1.5rem;
  padding: 1rem 1rem 0;
}
</style>
