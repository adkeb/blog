#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="${1:-ops/cloudflare/tunnel/config.yml}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is required but not installed." >&2
  exit 1
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  echo "Tunnel config file not found: ${CONFIG_PATH}" >&2
  echo "Copy ops/cloudflare/tunnel/config.example.yml to ${CONFIG_PATH} and fill real values." >&2
  exit 1
fi

echo "[tunnel] running with config: ${CONFIG_PATH}"
cloudflared tunnel --config "${CONFIG_PATH}" run

