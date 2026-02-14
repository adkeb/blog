#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"

echo "[smoke] checking ${BASE_URL}"

for path in / /posts /chapters /about /search /rss.xml /sitemap.xml /search-index.json /robots.txt /api/healthz; do
  code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "${code}" != "200" ]]; then
    echo "FAILED ${path} -> ${code}" >&2
    exit 1
  fi
  echo "OK ${path}"
done

echo "[smoke] all checks passed"
