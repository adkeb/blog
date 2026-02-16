<template>
  <section>
    <header class="apps-head">
      <h1>应用中心</h1>
      <p class="meta">统一管理所有外部应用入口（Cloudflare Tunnel / 公网服务）。</p>
    </header>

    <div v-if="apps.length > 0" class="grid">
      <article v-for="app in apps" :key="app.slug" class="surface app-card">
        <div class="row">
          <h2>{{ app.title }}</h2>
          <span class="status" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
        </div>

        <p class="meta">{{ app.category }} · {{ app.date }}</p>
        <p class="desc">{{ app.description }}</p>

        <div>
          <span v-for="tag in app.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <a class="open-link" :href="app.url" target="_blank" rel="noopener noreferrer">直达应用</a>
      </article>
    </div>

    <p v-else class="meta">暂无应用。</p>
  </section>
</template>

<script setup lang="ts">
import type { AppItem } from "~/types/app";

const config = useRuntimeConfig();

const { data } = await useAsyncData("apps-list", async () => {
  const items = (await queryCollection("apps").all()) as AppItem[];
  const visible = items.filter((item) => config.public.showDrafts || !item.draft);
  return [...visible].sort((a, b) => {
    if ((a.order ?? 100) !== (b.order ?? 100)) {
      return (a.order ?? 100) - (b.order ?? 100);
    }
    return +new Date(b.date) - +new Date(a.date);
  });
});

const apps = computed(() => (data.value ?? []) as AppItem[]);

function statusLabel(status: AppItem["status"]): string {
  if (status === "online") {
    return "在线";
  }
  if (status === "private") {
    return "私有";
  }
  return "离线";
}

useSeoMeta({
  title: "应用中心",
  description: "博客应用目录，集中管理可直达访问的部署应用。"
});
</script>

<style scoped>
.apps-head {
  margin-bottom: 1rem;
}

.apps-head h1 {
  margin-bottom: 0.2rem;
}

.grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.app-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
}

.row {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.row h2 {
  margin: 0;
}

.desc {
  margin: 0;
}

.open-link {
  align-self: flex-start;
  background: var(--brand);
  border-radius: 10px;
  color: #f0fdfa;
  padding: 0.35rem 0.7rem;
}

.status {
  border-radius: 999px;
  font-size: 0.8rem;
  padding: 0.1rem 0.45rem;
}

.status-online {
  background: #dcfce7;
  color: #166534;
}

.status-private {
  background: #dbeafe;
  color: #1e3a8a;
}

.status-offline {
  background: #fee2e2;
  color: #991b1b;
}
</style>
