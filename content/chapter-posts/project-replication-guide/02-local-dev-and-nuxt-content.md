---
title: "第 2 节：本地跑起来（Nuxt + Content + 环境变量）"
slug: "02-local-dev-and-nuxt-content"
description: "从零启动本地站点，理解 .env、内容模型、页面路由和构建脚本。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - Nuxt
  - 环境变量
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 2
legacySlugs: []
---

## 2.1 安装依赖并启动项目

在项目根目录执行：

```bash
npm install
cp .env.example .env
npm run dev
```

然后打开浏览器：`http://localhost:3000`。

这一步成功，代表：

1. 依赖安装正常
2. Nuxt 开发服务器可运行
3. 项目基础代码可读

## 2.2 先理解脚本（你之后会一直用）

`package.json` 里的脚本：

```json
{
  "dev": "nuxt dev",
  "build": "nuxt build",
  "generate": "nuxt generate",
  "preview": "nuxt preview",
  "check": "nuxt typecheck"
}
```

逐条解释：

1. `dev`：本地开发，改代码会热更新。
2. `generate`：生成静态站（Cloudflare Pages 用这个）。
3. `check`：类型检查，防止明显代码错误。

你要形成习惯：

- 每次关键改动后跑 `npm run check`
- 准备推送前跑 `npm run generate`

## 2.3 环境变量为什么这么重要

`.env` 是项目行为总开关。

你项目中的关键变量：

1. `SITE_URL` / `NUXT_PUBLIC_SITE_URL`：正式站地址
2. `PREVIEW_URL` / `NUXT_PUBLIC_PREVIEW_URL`：预览地址
3. `NUXT_PUBLIC_SHOW_DRAFTS`：是否显示草稿
4. `GISCUS_*`：评论系统配置
5. `CF_ACCESS_AUD`：Cloudflare Access 拓展鉴权字段

最常见错误：

- 变量只填了 Production，没填 Preview
- public 与非 public 混用，导致客户端拿不到值

你的项目已经采用“双写兼容”方式，降低此类风险。

## 2.4 内容模型：为什么你的文章能变成页面

`content.config.ts` 定义了 3 套内容集合：

1. `posts`：普通文章
2. `chapters`：章节父文
3. `chapterPosts`：章节子文章

系统会把 Markdown frontmatter 字段（例如 `title/date/tags`）解析成可查询数据。

你看到的页面路由是：

- `/posts/:slug`
- `/chapters/:chapterSlug`
- `/chapters/:chapterSlug/:slug`

## 2.5 本节验收

执行并确认：

```bash
npm run check
npm run generate
```

验收标准：

1. 两条命令都通过
2. 本地页面可正常打开
3. 你能看懂 `.env` 每个字段大概作用

