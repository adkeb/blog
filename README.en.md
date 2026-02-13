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
- `public/admin/config.yml`
- `ops/cloudflare/tunnel/config.example.yml`
- `ops/cloudflare/tunnel/access-policies.md`
- `docs/cloudflare-pages-tunnel.md`
