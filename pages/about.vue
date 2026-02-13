<template>
  <section class="surface about">
    <h1>关于本站</h1>
    <p>
      本站采用 Nuxt 3 + Nuxt Content 构建，公开页面部署于 Cloudflare Pages；
      预览与运维入口通过 Cloudflare Tunnel 暴露，并由 Zero Trust Access 保护。
    </p>
    <ul>
      <li>内容维护：Markdown + Decap CMS</li>
      <li>评论系统：giscus（GitHub Discussions）</li>
      <li>静态能力：RSS、Sitemap、Search Index</li>
      <li>核心设计：Tunnel 离线不影响公开主站可用性</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "关于",
  description: "个人博客的技术架构与运维策略。"
});
</script>

<style scoped>
.about {
  padding: 1.2rem;
}
</style>

