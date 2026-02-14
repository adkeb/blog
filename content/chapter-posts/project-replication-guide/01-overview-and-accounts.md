---
title: "第 1 节：先把地基打好（目标、账号、工具）"
slug: "01-overview-and-accounts"
description: "你要先准备哪些账号和工具，为什么必须先做这一步，以及每个工具在项目里的职责。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - 入门
  - 准备工作
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 1
legacySlugs: []
---

## 1.1 这一整个项目到底在做什么

你现在要复刻的是一个“静态主站 + 私有预览后台”的博客系统。

系统分工如下：

1. 公开站点：给所有访客看文章，要求稳定、快、便宜。
2. 私有预览：只给你自己看草稿、后台编辑，要求安全。
3. 内容管理：用可视化后台写文章，但底层仍是 Git 文件，方便版本管理和回滚。

一句话概括：

> 主站要稳，后台要安全，内容要可追溯。

## 1.2 你必须准备的账号

按顺序准备下面 4 类账号：

1. GitHub 账号（你已经在用：`adkeb`）
2. Cloudflare 账号（你已绑定域名 `xuyangfly.site`）
3. 域名（并且 DNS 在 Cloudflare 管理）
4. giscus 所需 GitHub 仓库权限（评论功能）

为什么必须先准备账号：

- 没有 GitHub：无法做代码仓库与自动部署
- 没有 Cloudflare：无法托管 Pages、Tunnel、Access
- 没有域名：无法做正式地址与 HTTPS
- 没有仓库权限：CMS/OAuth/评论全都做不通

## 1.3 你必须安装的本地工具

### Git

作用：把代码提交到 GitHub。

检查命令：

```bash
git --version
```

### Node.js（建议 20+）

作用：运行 Nuxt 项目、安装依赖。

检查命令：

```bash
node -v
npm -v
```

### Wrangler（Cloudflare CLI）

作用：部署 Decap OAuth Worker。

你可以不全局安装，用 `npx wrangler ...` 临时调用。

检查命令：

```bash
npx wrangler --version
```

## 1.4 你的项目目录结构（你将频繁看到）

```text
content/
  posts/                  # 普通文章
  chapters/               # 章节父文
  chapter-posts/          # 章节子文章
public/admin/config.yml   # Decap CMS 配置
ops/decap-oauth/worker.js # OAuth Worker
pages/                    # 前端路由页面
server/routes/            # RSS/Sitemap/Search API
assets/css/main.css       # 全局样式（含夜间模式变量）
```

你现在先不用死记，后面每节会反复用到。

## 1.5 本节验收（你必须确认）

请逐项确认：

1. 你可以登录 GitHub 和 Cloudflare。
2. 你能看到仓库 `adkeb/blog`。
3. 本地能执行 `git --version`、`node -v`。
4. 本地能执行 `npx wrangler --version`。

只要这 4 项都完成，你就具备继续复刻的基础条件。

## 1.6 常见问题

### 问：我不会命令行，能复刻吗？

可以。你只需要复制命令执行，不需要理解每个参数的全部细节。

### 问：我用的是 Conda base 环境，会冲突吗？

不会。你当前环境已经能跑 `npx wrangler`，说明链路可用。

