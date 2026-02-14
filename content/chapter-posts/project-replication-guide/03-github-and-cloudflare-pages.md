---
title: "第 3 节：连接 GitHub 与 Cloudflare Pages（自动部署主链路）"
slug: "03-github-and-cloudflare-pages"
description: "把仓库 adkeb/blog 接入 Pages，设置正确构建参数，避开常见部署报错。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - GitHub
  - Cloudflare Pages
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 3
legacySlugs: []
---

## 3.1 先确认代码已在 GitHub

你的目标仓库是：`adkeb/blog`。

本地执行：

```bash
git remote -v
```

应看到：

```text
origin git@github.com:adkeb/blog.git
```

如果不是这个地址，先修正 remote 再继续。

## 3.2 在 Cloudflare 创建 Pages 项目

操作路径（新版控制台）：

1. 进入 `Workers & Pages`
2. 选择 `Import an existing Git repository`
3. 选择 GitHub 账号与仓库 `adkeb/blog`
4. 生产分支选 `main`

## 3.3 构建参数必须这样填

这一项非常关键，填错就会失败：

1. Framework preset：`Nuxt.js`
2. Build command：`npm run generate`
3. Build output directory：`dist`

你之前踩过的坑：

- 填成 `.output/public`，会报 “build output directory not found”

原因：`nuxt generate` 产物在 `dist`，而不是 `.output/public`。

## 3.4 你曾遇到的典型错误是怎么来的

报错：

```text
The name 'ASSETS' is reserved in Pages projects.
```

本质原因：

- 把 Worker 的 `wrangler deploy` 混进了 Pages 的构建流程

正确做法：

1. Pages 只做站点构建与静态发布
2. Worker（如 OAuth）单独在本地/CI 用 wrangler 部署

## 3.5 验收方法

当你 push 到 `main` 后：

1. Cloudflare 自动出现新 deployment
2. 状态为 Success（绿色）
3. `www.xuyangfly.site` 可访问

部署失败时，优先查看：

- Build command
- Output directory
- 是否有额外 deploy 命令误加

