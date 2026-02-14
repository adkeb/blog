---
title: "第 9 节：夜间模式、最终检查与上线清单"
slug: "09-dark-mode-and-final-checklist"
description: "完成夜间模式与主题持久化，给出发布前最终检查清单，确保你能稳定长期维护。"
date: "2026-02-14"
updated: "2026-02-14"
tags:
  - 复刻教程
  - 夜间模式
  - 验收
category: "Guide"
cover: ""
draft: false
toc: true
lang: "zh-CN"
chapterSlug: "project-replication-guide"
order: 9
legacySlugs: []
---

## 9.1 夜间模式实现点

本项目夜间模式不是“切一段类名”这么简单，而是完整主题体系：

1. `composables/useTheme.ts`
   - 维护 `light/dark` 状态
   - 读取系统偏好
   - localStorage 持久化
2. `plugins/theme.client.ts`
   - 页面启动时初始化主题，减少闪屏
3. `assets/css/main.css`
   - `:root` 与 `:root[data-theme="dark"]` 双变量集
4. `components/SiteHeader.vue`
   - 提供“夜间/日间”切换按钮

## 9.2 为什么这种做法更稳

优点：

1. 不绑定具体页面组件，任何页面都自动继承主题。
2. 主题变量统一管理，后续改色只改一处。
3. 与 giscus 评论联动，避免评论 iframe 主题不同步。

## 9.3 发布前最终命令清单

每次发布前执行：

```bash
npm run check
npm run generate
git status
git add .
git commit -m "your message"
git push origin main
```

然后去 Cloudflare Pages 看 deployment 是否成功。

## 9.4 线上验收清单（逐条打勾）

1. `https://www.xuyangfly.site` 可访问
2. `https://xuyangfly.site` 会 301 到 `www`
3. `/admin` 可以登录并发布
4. 评论区加载正常，登录后不会空白
5. 夜间模式可切换，刷新后记住状态
6. `/chapters` 能看到章节目录
7. 章节内子文章可访问并有上下篇
8. 普通文章链路不受影响
9. RSS / Sitemap / Search Index 可访问

## 9.5 你已经得到什么

到这一步，你拥有的是一个可以长期迭代的博客系统，而不是一次性演示页：

1. 有稳定发布路径
2. 有安全边界
3. 有可视化运营后台
4. 有评论互动
5. 有章节化知识沉淀结构

这正是“可持续维护”的技术项目形态。

