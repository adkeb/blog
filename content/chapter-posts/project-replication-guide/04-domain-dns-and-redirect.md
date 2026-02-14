---
title: "第 4 节：域名、DNS 与 301 跳转（主域统一）"
slug: "04-domain-dns-and-redirect"
description: "把裸域 xuyangfly.site 301 到 www，解决规则不生效与代理记录问题。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - DNS
  - 301
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 4
legacySlugs: []
---

## 4.1 为什么要做裸域 301 到 www

统一主域可以减少 SEO 分裂和链接重复。

你的目标是：

- `https://xuyangfly.site/xxx` 永久跳到 `https://www.xuyangfly.site/xxx`

## 4.2 跳转规则怎么填

在 Cloudflare 中创建转发规则：

1. URL 匹配：`xuyangfly.site/*`
2. 类型：`Forwarding URL`
3. 状态码：`301 - Permanent Redirect`
4. 目标：`https://www.xuyangfly.site/$1`

`$1` 代表原路径后半段，会被完整保留。

## 4.3 为什么你会看到“rule may not apply to traffic”

这提示表示：当前流量没走 Cloudflare 代理层。

修复：

1. 到 DNS 列表确认根域记录是橙云（Proxied）
2. 如果没有合适记录，创建一个 A 记录占位并开启代理
3. 保存后等待 1~5 分钟再测

## 4.4 验证命令

在浏览器访问：

- `https://xuyangfly.site/test?a=1`

期望：

- 地址栏最终变成 `https://www.xuyangfly.site/test?a=1`

如果是连接失败（如 `ERR_CONNECTION_CLOSED`），优先回到 DNS 检查代理状态。

