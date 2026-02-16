#!/usr/bin/env bash
set -euo pipefail

TOKEN="${CF_TUNNEL_TOKEN_QWEN3TTS:-${1:-}}"

if [ -z "$TOKEN" ]; then
  cat >&2 <<'MSG'
Missing tunnel token.

Usage:
  export CF_TUNNEL_TOKEN_QWEN3TTS='<your-cloudflare-tunnel-token>'
  ./ops/qwen3tts-tunnel/start-cloudflared-tunnel.sh
MSG
  exit 1
fi

exec cloudflared tunnel --no-autoupdate run --token "$TOKEN"
