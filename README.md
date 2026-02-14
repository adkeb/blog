# Personal Blog (Nuxt + Cloudflare)

个人博客模板，目标是：

- 公开主站低成本稳定运行（Cloudflare Pages）
- 草稿预览和运维入口走私有通道（Cloudflare Tunnel）
- 内容用 Markdown + 可视化 CMS（Decap CMS）

## 架构

- `www.<domain>` -> Cloudflare Pages（公开）
- `<domain>` -> 301 到 `www.<domain>`
- `preview.<domain>` -> Cloudflare Tunnel（Zero Trust 保护）
- `ops.<domain>` -> Cloudflare Tunnel（可选，Zero Trust 保护）

核心原则：`Tunnel 离线不影响公开主站`。

## 技术栈

- Nuxt 3（静态生成）
- Nuxt Content（内容模型与渲染）
- Decap CMS（`/admin` 可视化编辑）
- giscus（评论）
- Cloudflare Pages + Cloudflare Tunnel + Zero Trust

## 已实现能力

- 文章列表、详情页、标签页、搜索页
- 章节体系：`/chapters`、章节详情、章节子文章详情
- 草稿可见性开关（`NUXT_PUBLIC_SHOW_DRAFTS`）
- RSS：`/rss.xml`
- Sitemap：`/sitemap.xml`
- Search Index：`/search-index.json`
- Robots：`/robots.txt`
- CMS 后台：`/admin`
- 健康检查：`/api/healthz`

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

打开 `http://localhost:3000`。

## 预览模式（草稿可见）

```bash
./scripts/preview-dev.sh
```

默认启动在 `127.0.0.1:8787`。

## Tunnel 启动

```bash
cp ops/cloudflare/tunnel/config.example.yml ops/cloudflare/tunnel/config.yml
./scripts/tunnel-run.sh
```

## 关键配置

- 环境变量模板：`.env.example`
  - 公开接口变量：`SITE_URL`、`PREVIEW_URL`、`GISCUS_*`、`CF_ACCESS_AUD`
- 内容模型：`content.config.ts`
- CMS 配置：`public/admin/config.yml`
- CMS OAuth 部署：`docs/decap-github-oauth-cloudflare-worker.md`
- Tunnel 配置模板：`ops/cloudflare/tunnel/config.example.yml`
- Zero Trust 策略模板：`ops/cloudflare/tunnel/access-policies.md`
- 部署文档：`docs/cloudflare-pages-tunnel.md`

## 验收要点

1. 关闭本地 Tunnel 后，公开站依然可访问。
2. 未授权访问 `preview.*` / `ops.*` 会被 Access 拦截。
3. 草稿文章只在预览模式可见。
4. RSS / Sitemap / Search Index 可正常访问。

## 章节化写作

### 目录结构

```text
content/
  chapters/
    machine-learning.md
  chapter-posts/
    machine-learning/
      linear-regression.md
      gradient-descent.md
```

### 章节 Frontmatter 示例

```yaml
---
title: "机器学习"
slug: "machine-learning"
description: "机器学习章节索引"
date: "2026-02-14"
tags: ["机器学习"]
category: "Chapter"
draft: false
---
```

章节正文可插入目录占位符：

```md
::chapter-children
::
```

### 章节子文章 Frontmatter 示例

```yaml
---
title: "线性回归入门"
slug: "linear-regression"
chapterSlug: "machine-learning"
order: 1
legacySlugs: ["ml-linear-regression"]
description: "..."
date: "2026-02-14"
draft: false
---
```

约束：

- 文件路径必须与 `chapterSlug` 一致（字段 + 目录双重校验）。
- 访问旧链接 `/posts/:legacySlug` 会 301 到 `/chapters/:chapterSlug/:slug`。
