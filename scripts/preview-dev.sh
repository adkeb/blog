#!/usr/bin/env bash
set -euo pipefail

export NUXT_PUBLIC_SHOW_DRAFTS=true
export PREVIEW_URL="${PREVIEW_URL:-https://preview.example.com}"
export NUXT_PUBLIC_PREVIEW_URL="${NUXT_PUBLIC_PREVIEW_URL:-${PREVIEW_URL}}"

echo "[preview-dev] starting Nuxt preview server on 127.0.0.1:8787"
npm run dev -- --host 127.0.0.1 --port 8787
