---
title: "从 0 到可运营：本次博客项目完整技术复盘（Cloudflare Pages + Tunnel + Decap + Chapter）"
slug: "project-full-retrospective"
description: "完整复盘本次博客项目从架构设计、Cloudflare 部署、GitHub OAuth、评论系统到章节化内容模型的落地细节与踩坑修复。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - Cloudflare
  - Nuxt
  - Decap CMS
  - GitHub OAuth
  - Giscus
  - 内容架构
category: "Architecture"
cover: ""
draft: false
toc: true
lang: "zh-CN"
---

## 一、项目目标与约束（需求输入）

这次博客建设不是“先做站点再想运维”，而是从一开始就明确了边界和上线路径：

1. 已有域名：`xuyangfly.site`
2. 公开内容必须稳定、低成本托管
3. 预览和后台可以私有化，不要求 24 小时在线（初期）
4. 内容以 Markdown 为核心，保留可视化编辑能力
5. 评论系统使用 GitHub 生态
6. 后续要支持“章节父文 + 子文章”的体系化写作

由此得到技术路线：

- 公开主站：Cloudflare Pages（静态部署）
- 私有预览/后台：Cloudflare Tunnel + Zero Trust Access
- 内容：Nuxt Content
- CMS：Decap CMS（Git-based）
- 评论：giscus

核心设计原则：

> Tunnel 挂掉不影响公开站可用。

---

## 二、阶段 1：基础架构与域名分层设计

### 1) 域名映射

最终边界如下：

- `www.xuyangfly.site` -> Cloudflare Pages（公开主站）
- `xuyangfly.site` -> 301 跳转到 `https://www.xuyangfly.site`
- `preview.xuyangfly.site` -> Tunnel（私有预览）
- `ops.xuyangfly.site` -> Tunnel（可选私有运维）

### 2) 安全边界

- `preview.*`、`ops.*` 通过 Cloudflare Access 限制访问
- 白名单可以基于邮箱或 IdP 组策略
- 会话时长设置为短会话，提高被盗用成本

这一步先把公开路径和私有路径分离，后续所有部署和排障都围绕这个边界进行。

---

## 三、阶段 2：代码基线与工程结构

### 1) 技术栈与脚本

`package.json` 中本项目核心脚本为：

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "check": "nuxt typecheck"
  }
}
```

说明：

- 生产主链路采用 `nuxt generate`，输出静态资源用于 Pages
- 类型校验由 `nuxt typecheck` 承担，作为回归基线

### 2) 运行时配置接口

在 `nuxt.config.ts` 中固化了运行时接口约定：

- `SITE_URL`
- `PREVIEW_URL`
- `GISCUS_*`
- `CF_ACCESS_AUD`（服务间鉴权扩展位）
- `NUXT_PUBLIC_SHOW_DRAFTS`（草稿显示开关）

这保证了 Production / Preview 环境可以“同代码，不同配置”运行。

---

## 四、阶段 3：仓库迁移与 Cloudflare Pages 连接

### 1) 从 Gitee 迁移到 GitHub

仓库最终固定为：`adkeb/blog`。

Cloudflare Pages 连接 GitHub 后：

- Production branch：`main`
- 提交到 `main` 自动触发部署
- Preview deployment 自动生成预览 URL

### 2) 关键构建参数

最终可用配置是：

- Framework preset：`Nuxt.js`
- Build command：`npm run generate`
- Build output directory：`dist`

> 注意：这里必须是 `dist`，不是 `.output/public`。

原因是该项目主链路使用 `nuxt generate`（静态输出到 `dist`），如果输出目录填错会直接报：

```text
Error: Output directory ".output/public" not found.
```

### 3) 典型错误与修复

你在 2026-02-13 遇到过一个关键报错：

```text
The name 'ASSETS' is reserved in Pages projects.
```

触发原因：在 Pages 构建流程里又执行了 `wrangler deploy`（Worker 部署链路），导致配置冲突。

修复原则：

- Pages 项目走 Pages 原生构建部署
- 不在 Pages 构建里执行 `wrangler deploy`
- Worker（比如 OAuth 网关）单独用 wrangler 独立部署

---

## 五、阶段 4：根域名 301 与 DNS 代理细节

### 1) 目标

把裸域 `xuyangfly.site` 统一收敛到 `https://www.xuyangfly.site`，保证：

- SEO 主域统一
- Cookie / CORS / Canonical 更一致

### 2) 规则设置

在 Cloudflare 中设置转发规则（Page Rules 或 Redirect Rules 皆可）：

- 匹配：`xuyangfly.site/*`
- 动作：Forwarding URL
- 状态码：`301 - Permanent Redirect`
- 目标：`https://www.xuyangfly.site/$1`

### 3) 常见弹窗：“rule may not apply to traffic”

你遇到的弹窗本质是：当前匹配记录未走 Cloudflare 代理。

处理方式：

- 确保根域名记录是 **Proxied（橙云）**
- 如果缺少根域名代理记录，可新增一个 A 记录占位（如 `192.0.2.1`）并打开代理

这样规则才能被 Cloudflare 边缘层命中。

---

## 六、阶段 5：草稿预览链路（Production vs Preview）

### 1) 行为预期

- Production（`www.xuyangfly.site`）不显示草稿
- Preview（Cloudflare 自动预览 URL 或私有 preview 子域）可显示草稿

### 2) 实现机制

统一由 `NUXT_PUBLIC_SHOW_DRAFTS` 控制：

- Production 环境：`false`
- Preview 环境：`true`

内容查询层统一应用可见性过滤，保证所有页面行为一致。

### 3) 验收用例

- 访问 Production 的草稿路径：应返回 404
- 访问 Preview 同路径：应能打开

你已经完成该链路验证。

---

## 七、阶段 6：giscus 评论系统接入

### 1) 必备数据

从 giscus 配置页获取并固化：

- `repo`（如 `adkeb/blog`）
- `repoId`
- `category`（如 `General`）
- `categoryId`

### 2) 环境变量策略

Cloudflare Pages 的 Production 与 Preview 都需要填写同一组 `GISCUS_*`，避免两个环境评论行为不一致。

### 3) 常见问题

“giscus app 未安装，访客无法评论”通常是仓库未授权给 giscus GitHub App。

处理顺序：

1. 安装/授权 giscus app 到目标仓库
2. 校验 Discussion 已启用
3. 确认 `repoId/categoryId` 和仓库实际匹配

---

## 八、阶段 7：Decap CMS GitHub OAuth（Cloudflare Worker 网关）

这是本项目最关键的“可运营能力”部分。

### 1) 为什么要自建 OAuth 网关

Decap 默认常见 Netlify OAuth 端点在你当前链路下不可用（出现 `api.netlify.com ... Not Found` 场景），因此改为自建 Worker：

- 完全可控
- 与 Cloudflare 体系一致
- 便于后续审计和扩展

### 2) CMS 端配置

`public/admin/config.yml`：

```yaml
backend:
  name: github
  repo: adkeb/blog
  branch: main
  base_url: https://decap-github-oauth.xuyang020128.workers.dev
  auth_endpoint: auth
```

### 3) Worker 路由设计

`ops/decap-oauth/worker.js` 采用两段式：

- `GET /auth`：构造 GitHub 授权 URL，发起 OAuth
- `GET /callback`：用 `code` 换 `access_token`，再回传给 CMS 窗口

### 4) 安全点

- `state` 签名：`OAUTH_STATE_SECRET`
- 严格验证回调 `state`
- `GITHUB_CLIENT_SECRET` 用 Wrangler Secret 存储，不入仓库

### 5) 关键交互修复（登录后界面不变）

你碰到过“GitHub 登录成功但 CMS 仍停在登录页”问题。

根因通常是弹窗通信链路不完整。当前 Worker 中专门做了：

- `authorizing:*` 握手消息
- `authorization:*:success/error` 回传消息
- `window.opener.postMessage(...)` + fallback

这保证 Decap 主窗口能收到 token 结果并更新状态。

### 6) 部署命令

```bash
cd ops/decap-oauth
npx wrangler whoami
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put OAUTH_STATE_SECRET
npx wrangler deploy
```

你已成功部署到：

- `https://decap-github-oauth.xuyang020128.workers.dev`

---

## 九、阶段 8：编辑体验问题与策略

你在 Decap 富文本模式中遇到了典型问题：

1. 图片/代码块在可视化状态下删除不直观
2. 块级内容插入后，末尾文本输入体验差

项目里做了两类处理：

- 配置提示：在 `posts` body 字段中加入 hint，引导切换 Markdown 模式删除复杂块
- 流程建议：复杂技术文优先 Markdown 模式编辑，减少富文本结构污染

这不是“功能缺失”，而是编辑器模式的取舍问题。

---

## 十、阶段 9：章节化内容系统（Chapter + 子文章）完整落地

这是本次迭代最大的结构升级。

### 1) 内容模型扩展

`content.config.ts` 新增两个集合：

- `chapters` -> `content/chapters/*.md`
- `chapterPosts` -> `content/chapter-posts/**/*.md`

`chapterPosts` 额外字段：

- `chapterSlug: string`
- `order: number`
- `legacySlugs: string[]`

### 2) 类型层统一

`types/post.ts` 增加统一类型：

- `ContentKind = "post" | "chapter" | "chapter_post"`
- `FeedItem` 统一全站列表项

全站页面不再依赖单一 `posts` 数据，而是使用统一聚合流。

### 3) 归属校验（字段 + 目录双重校验）

`utils/posts.ts` 中加入：

- 从路径提取目录段（`chapter-posts/<chapterSlug>/...`）
- 与 frontmatter 的 `chapterSlug` 强校验
- 不一致直接抛错，构建失败

这能防止“文章写在 A 目录却声明属于 B 章节”的脏数据上线。

### 4) 路由与页面

新增路由：

1. `/chapters`
2. `/chapters/:chapterSlug`
3. `/chapters/:chapterSlug/:slug`

对应文件：

- `pages/chapters/index.vue`
- `pages/chapters/[chapterSlug].vue`
- `pages/chapters/[chapterSlug]/[slug].vue`

其中子文章详情页包含：

- 面包屑
- 按 `order` 的上一篇/下一篇导航

### 5) 章节正文占位符目录

新增组件：`components/content/ChapterChildren.vue`

章节正文可写：

```md
::chapter-children
::
```

渲染时自动按当前 `chapterSlug` 查子文章并生成卡片网格。

### 6) 全站流改造

已接入统一 Feed 的页面：

- `pages/index.vue`
- `pages/posts/index.vue`
- `pages/tags/[tag].vue`
- `pages/search.vue`
- `components/PostCard.vue`

卡片支持显示类型标签：文章 / 章节 / 子文章。

### 7) 搜索、RSS、Sitemap 同步

改造文件：

- `server/routes/search-index.json.ts`
- `server/routes/rss.xml.ts`
- `server/routes/sitemap.xml.ts`

结果：章节与子文章均进入搜索索引、订阅与站点地图。

### 8) 旧链接兼容 301

`pages/posts/[slug].vue` 逻辑：

1. 先查普通文章
2. 未命中则查 `chapterPosts.legacySlugs`
3. 命中则 301 到 `/chapters/:chapterSlug/:postSlug`
4. 多命中 -> 500（配置冲突）
5. 未命中 -> 404

这套逻辑让历史链接迁移可控且可审计。

### 9) CMS 同步扩展

`public/admin/config.yml` 新增：

- `chapters` collection
- `chapter_posts` collection

并提供：

- `chapterSlug` relation 字段（来源 `chapters.slug`）
- `order` 字段
- `legacySlugs` 列表字段
- 章节正文默认占位符模板

---

## 十一、阶段 10：构建与回归验证

本次实现后，核心校验命令为：

```bash
npm run check
npm run generate
```

并且 `scripts/smoke-check.sh` 已覆盖：

- `/`
- `/posts`
- `/chapters`
- `/about`
- `/search`
- `/rss.xml`
- `/sitemap.xml`
- `/search-index.json`
- `/robots.txt`
- `/api/healthz`

### 实际结果

- `nuxt typecheck` 通过
- `nuxt generate` 通过
- 章节/子文章路由可静态预渲染

---

## 十二、现状总结（截至 2026-02-14）

这个博客已经从“可访问页面”进入“可持续运营”状态，具备：

1. 稳定的公开发布链路（GitHub -> Cloudflare Pages）
2. 私有化预览与后台能力（Tunnel + Access）
3. 可视化内容运营能力（Decap + GitHub OAuth Worker）
4. 评论闭环（giscus）
5. 面向知识体系化的章节内容模型（chapter + chapter_post）
6. 迁移期兼容策略（legacySlugs -> 301）

如果后续继续演进，优先建议：

- 为 `preview.*` 与 `ops.*` 补齐访问审计与告警
- 增加端到端内容校验（frontmatter lint + route integrity check）
- 为章节目录增加阅读进度或完成度标记
- 将 OAuth Worker 增加请求日志脱敏与异常上报

---

## 附：关键文件索引

- 内容模型：`content.config.ts`
- 聚合与校验：`utils/posts.ts`
- 服务端查询：`server/utils/content.ts`
- 章节页面：`pages/chapters/index.vue`
- 章节详情：`pages/chapters/[chapterSlug].vue`
- 子文章详情：`pages/chapters/[chapterSlug]/[slug].vue`
- 旧链接 301：`pages/posts/[slug].vue`
- CMS 配置：`public/admin/config.yml`
- OAuth Worker：`ops/decap-oauth/worker.js`
- RSS：`server/routes/rss.xml.ts`
- Sitemap：`server/routes/sitemap.xml.ts`
- 搜索索引：`server/routes/search-index.json.ts`

