# Personal Blog (Nuxt + Cloudflare)

This repository is a personal blog starter with:

- Public site on Cloudflare Pages (stable, low-cost static hosting)
- Private preview/ops endpoints via Cloudflare Tunnel
- Cloudflare Zero Trust for `preview.*` and `ops.*`

Design rule: `Tunnel downtime must not break the public website`.

## Stack

- Nuxt 3 (SSG)
- Nuxt Content
- Decap CMS (`/admin`)
- giscus comments
- Cloudflare Pages + Tunnel + Zero Trust

## Implemented Features

- Post list / post detail / tags / search
- Chapter system: `/chapters`, chapter detail, and chapter child post detail
- App Center: `/apps` (unified gateway for many deployed apps)
- Draft visibility toggle (`NUXT_PUBLIC_SHOW_DRAFTS`)
- `rss.xml`, `sitemap.xml`, `search-index.json`, `robots.txt`
- CMS admin panel at `/admin`
- Health endpoint at `/api/healthz`

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Draft Preview Mode

```bash
./scripts/preview-dev.sh
```

Runs on `127.0.0.1:8787`.

## Tunnel

```bash
cp ops/cloudflare/tunnel/config.example.yml ops/cloudflare/tunnel/config.yml
./scripts/tunnel-run.sh
```

## Important Files

- `.env.example`
  - Public interface vars: `SITE_URL`, `PREVIEW_URL`, `GISCUS_*`, `CF_ACCESS_AUD`
- `content.config.ts`
- `content/apps/*.md` (App Center entries)
- `public/admin/config.yml`
- `docs/decap-github-oauth-cloudflare-worker.md`
- `ops/cloudflare/tunnel/config.example.yml`
- `ops/cloudflare/tunnel/access-policies.md`
- `docs/cloudflare-pages-tunnel.md`
- `docs/cloudflare-tunnel-app-center.md` (multi-app tunnel + app center)

## Chapterized Writing

### Structure

```text
content/
  chapters/
    machine-learning.md
  chapter-posts/
    machine-learning/
      linear-regression.md
      gradient-descent.md
```

### Chapter Frontmatter

```yaml
---
title: "Machine Learning"
slug: "machine-learning"
description: "Chapter index page"
date: "2026-02-14"
tags: ["ml"]
category: "Chapter"
draft: false
---
```

Insert chapter children directory in the chapter body:

```md
::chapter-children
::
```

### Chapter Child Frontmatter

```yaml
---
title: "Linear Regression"
slug: "linear-regression"
chapterSlug: "machine-learning"
order: 1
legacySlugs: ["ml-linear-regression"]
description: "..."
date: "2026-02-14"
draft: false
---
```

Rules:

- The file path directory must match `chapterSlug` (field + directory validation).
- Old links `/posts/:legacySlug` are redirected (301) to `/chapters/:chapterSlug/:slug`.

## App Center (Multi-App)

- Route: `/apps`
- Source: `content/apps/*.md`
- CMS collection: `App Center`

For each new app (not only TTS):

1. Add a Cloudflare Tunnel hostname mapping (e.g. `my-app.xuyangfly.site -> http://127.0.0.1:<port>`).
2. Add one markdown entry under `content/apps/`.

Example frontmatter:

```yaml
---
title: "My App"
slug: "my-app"
description: "What this app does"
url: "https://my-app.xuyangfly.site"
date: "2026-02-16"
status: "online" # online | private | offline
order: 20
draft: false
---
```
