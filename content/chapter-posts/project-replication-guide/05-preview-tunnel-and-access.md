---
title: "第 5 节：预览链路（Cloudflare Tunnel + Access）"
slug: "05-preview-tunnel-and-access"
description: "把草稿预览和后台放到私有入口，确保 Tunnel 失效不影响公开主站。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - Tunnel
  - Zero Trust
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 5
legacySlugs: []
---

## 5.1 架构目标

你要达到下面 2 条：

1. 主站永远公开可用（`www`）
2. 预览与运维私有访问（`preview` / `ops`）

## 5.2 草稿显示机制

通过变量控制：

- Production：`NUXT_PUBLIC_SHOW_DRAFTS=false`
- Preview：`NUXT_PUBLIC_SHOW_DRAFTS=true`

这样同一套代码在不同环境会得到不同可见性。

## 5.3 Tunnel 的职责

Tunnel 不是托管主站内容，而是把本地预览服务安全暴露出去。

典型用途：

- 草稿内容预览
- 私有后台入口

## 5.4 Access 的职责

Access 是“谁能进来”的门禁系统。

你应配置：

1. 只允许你的邮箱登录
2. 会话有效期缩短（例如 1~8 小时）
3. 打开审计日志

## 5.5 验收测试

必须做这 3 条：

1. 关闭本地 Tunnel 后，`www` 仍能访问。
2. 未授权访问 `preview.*`，看到拦截页。
3. 授权后能访问预览站，并看到草稿。

