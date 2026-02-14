---
title: "第 8 节：章节体系（父文 + 子文 + 旧链接 301）"
slug: "08-chapter-system-and-route-migration"
description: "实现章节化写作、章节目录占位符、子文章路由与 legacySlugs 迁移跳转。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - 章节体系
  - 路由迁移
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 8
legacySlugs: []
---

## 8.1 章节体系是什么

你当前项目有 3 类内容：

1. 普通文章 `posts`
2. 章节父文 `chapters`
3. 章节子文章 `chapterPosts`

路由分别是：

- `/posts/:slug`
- `/chapters/:chapterSlug`
- `/chapters/:chapterSlug/:slug`

## 8.2 目录约束为什么重要

子文章文件路径必须匹配 frontmatter 的 `chapterSlug`：

```text
content/chapter-posts/<chapterSlug>/<post>.md
```

比如：

- 路径：`content/chapter-posts/machine-learning/linear-regression.md`
- frontmatter：`chapterSlug: machine-learning`

如果不一致，构建阶段直接报错，阻止脏数据上线。

## 8.3 章节正文插目录占位符

章节正文里插入：

```md
::chapter-children
::
```

渲染时会由 `components/content/ChapterChildren.vue` 自动拉取同章节子文章并按 `order` 排序。

## 8.4 旧链接迁移（301）

当历史链接还是 `/posts/old-slug` 时，系统会：

1. 先查普通文章
2. 查不到再查章节子文章的 `legacySlugs`
3. 命中则 301 到新地址 `/chapters/:chapterSlug/:slug`

这样迁移不会让旧外链失效。

## 8.5 当前策略：子文章只在章节体系内出现

根据你的新要求，项目已调整为：

- 子文章不进入首页、全站列表、标签页等全局流
- 子文章只通过章节页目录进入

这让信息结构更清晰：

- 首页展示“文章/章节”
- 深度内容在章节内展开

