---
title: "第 6 节：Decap CMS 与 GitHub OAuth Worker"
slug: "06-decap-cms-and-oauth-worker"
description: "从 Netlify 失败场景迁移到 Cloudflare Worker OAuth 网关，打通 /admin 可视化编辑。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - Decap CMS
  - OAuth
  - Worker
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 6
legacySlugs: []
---

## 6.1 为什么要单独部署 OAuth Worker

你遇到过默认 Netlify OAuth 回调不可用问题（`Not Found`）。

因此项目采用自建方案：

- `ops/decap-oauth/worker.js` 处理 GitHub OAuth
- `public/admin/config.yml` 指向你自己的 `base_url`

这让登录链路完全可控。

## 6.2 CMS 配置（必须与项目一致）

`public/admin/config.yml` 核心段：

```yaml
backend:
  name: github
  repo: adkeb/blog
  branch: main
  base_url: https://decap-github-oauth.xuyang020128.workers.dev
  auth_endpoint: auth
```

## 6.3 Worker 环境变量与密钥

`ops/decap-oauth/wrangler.toml` 里是公开配置：

- `CMS_ORIGIN`
- `GITHUB_REDIRECT_URI`
- `GITHUB_CLIENT_ID`

密钥必须用 secret：

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put OAUTH_STATE_SECRET
```

**注意**：`GITHUB_CLIENT_SECRET` 绝对不能写入 git。

## 6.4 Worker 路由逻辑（读懂就够，不用会写）

`worker.js` 做两件事：

1. `/auth`：发起 GitHub 授权
2. `/callback`：换 token 并回传给 Decap 窗口

你项目中还做了弹窗握手与 postMessage 回传，解决了“登录成功但 CMS 不更新”的常见问题。

## 6.5 部署命令（完整）

```bash
cd ops/decap-oauth
npx wrangler whoami
npx wrangler deploy
```

部署成功会返回你的 workers.dev 地址。

## 6.6 验收标准

1. 打开 `https://www.xuyangfly.site/admin`
2. 点“使用 GitHub 登录”
3. 授权后可进入 CMS 内容列表
4. 新建文章后能触发 Git 提交

