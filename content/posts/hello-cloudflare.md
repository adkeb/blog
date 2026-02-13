---
title: "从零搭建：Cloudflare Pages + Tunnel 个人博客"
slug: "hello-cloudflare"
description: "记录博客基础设施的首篇文章：主站静态托管，预览通过 Tunnel 私有暴露。"
date: "2026-02-13"
updated: "2026-02-13"
tags:
  - Nuxt
  - Cloudflare
  - 博客
category: "Architecture"
cover: ""
draft: false
toc: true
lang: "zh-CN"
---

## 为什么这样设计

公开内容使用静态托管，目的很直接：

1. 成本低
2. 访问稳定
3. 部署链路清晰

后台和预览走 Tunnel，可以做到更高安全性，并且不影响公开站可用。

## 站点边界

- `www.<domain>`：公开站点（Cloudflare Pages）
- `preview.<domain>`：草稿预览（Tunnel + Zero Trust）
- `ops.<domain>`：运维入口（可选，Tunnel + Zero Trust）

## 下一步

后续会补充：

- 自动化发布流程
- 访问性能观测
- 可选的云主机常驻方案

