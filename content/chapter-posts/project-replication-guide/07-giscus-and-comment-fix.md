---
title: "第 7 节：评论系统 giscus 与空白问题修复"
slug: "07-giscus-and-comment-fix"
description: "配置 giscus 参数、环境变量同步，并修复登录后评论空白、刷新后评论空白问题。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - giscus
  - 评论系统
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 7
legacySlugs: []
---

## 7.1 giscus 必备参数

你需要从 giscus 配置页记录：

1. `repo`
2. `repoId`
3. `category`
4. `categoryId`

你的当前值是基于仓库 `adkeb/blog`。

## 7.2 环境变量要在两个环境都填

Cloudflare Pages 里：

- Production 环境变量
- Preview 环境变量

都要填同样的 `GISCUS_*`。

否则表现会是：

- 线上能加载、预览不加载
- 或者反过来

## 7.3 你遇到的评论空白问题

问题现象：

1. 登录 GitHub 回来后评论区空白
2. 刷新当前页面后又空白
3. 需要手动关弹窗/重进才恢复

### 修复点（`components/GiscusComments.client.vue`）

1. 监听 `focus` 和 `visibilitychange`
   - 从 GitHub 授权窗口返回时，自动重新挂载 giscus。
2. 把加载策略改为 `eager`
   - 避免懒加载时机导致 iframe 空白。
3. 路由监听从 `fullPath` 收敛到 `path`
   - 减少不必要重挂载。
4. 主题切换时向 iframe `postMessage`
   - 避免夜间模式切换导致评论状态不一致。

## 7.4 验收步骤

1. 打开任意文章页，确认评论可见。
2. 点击登录并完成 GitHub 授权。
3. 回到页面后无需手动刷新即可评论。
4. 手动刷新页面，评论区仍正常渲染。

