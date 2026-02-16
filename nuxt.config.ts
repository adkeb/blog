import { defineNuxtConfig } from "nuxt/config";

const siteUrl = process.env.SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || "https://www.example.com";
const previewUrl =
  process.env.PREVIEW_URL || process.env.NUXT_PUBLIC_PREVIEW_URL || "https://preview.example.com";
const showDrafts = process.env.NUXT_PUBLIC_SHOW_DRAFTS === "true";
const giscusRepo = process.env.GISCUS_REPO || process.env.NUXT_PUBLIC_GISCUS_REPO || "";
const giscusRepoId = process.env.GISCUS_REPO_ID || process.env.NUXT_PUBLIC_GISCUS_REPO_ID || "";
const giscusCategory = process.env.GISCUS_CATEGORY || process.env.NUXT_PUBLIC_GISCUS_CATEGORY || "";
const giscusCategoryId =
  process.env.GISCUS_CATEGORY_ID || process.env.NUXT_PUBLIC_GISCUS_CATEGORY_ID || "";
const giscusMapping = process.env.GISCUS_MAPPING || process.env.NUXT_PUBLIC_GISCUS_MAPPING || "pathname";
const giscusStrict = process.env.GISCUS_STRICT || process.env.NUXT_PUBLIC_GISCUS_STRICT || "0";
const giscusReactionsEnabled =
  process.env.GISCUS_REACTIONS_ENABLED || process.env.NUXT_PUBLIC_GISCUS_REACTIONS_ENABLED || "1";
const giscusEmitMetadata =
  process.env.GISCUS_EMIT_METADATA || process.env.NUXT_PUBLIC_GISCUS_EMIT_METADATA || "0";
const giscusInputPosition =
  process.env.GISCUS_INPUT_POSITION || process.env.NUXT_PUBLIC_GISCUS_INPUT_POSITION || "top";
const giscusTheme = process.env.GISCUS_THEME || process.env.NUXT_PUBLIC_GISCUS_THEME || "light";
const inferredAdminLoginFromRepo = giscusRepo.includes("/") ? giscusRepo.split("/")[0] : "";
const adminGithubLogin = (process.env.NUXT_PUBLIC_ADMIN_GITHUB_LOGIN || inferredAdminLoginFromRepo).trim();
const adminOauthBaseUrl =
  process.env.NUXT_PUBLIC_ADMIN_OAUTH_BASE_URL || "https://decap-github-oauth.xuyang020128.workers.dev";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/content"],
  runtimeConfig: {
    cfAccessAud: process.env.CF_ACCESS_AUD || "",
    public: {
      siteUrl,
      previewUrl,
      showDrafts,
      giscus: {
        repo: giscusRepo,
        repoId: giscusRepoId,
        category: giscusCategory,
        categoryId: giscusCategoryId,
        mapping: giscusMapping,
        strict: giscusStrict,
        reactionsEnabled: giscusReactionsEnabled,
        emitMetadata: giscusEmitMetadata,
        inputPosition: giscusInputPosition,
        theme: giscusTheme
      },
      adminGithubLogin,
      adminOauthBaseUrl
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: "zh-CN" },
      titleTemplate: "%s · Personal Blog",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "个人博客：技术沉淀、文章发布与检索。" }
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/rss.xml", "/sitemap.xml", "/search-index.json", "/robots.txt", "/chapters", "/apps"]
    }
  },
  routeRules: {
    "/admin/**": {
      headers: {
        "x-robots-tag": "noindex, nofollow"
      }
    }
  }
});
