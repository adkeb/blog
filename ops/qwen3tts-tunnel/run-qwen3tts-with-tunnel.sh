#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="${QWEN3TTS_LOG_DIR:-/root/work/qwen3tts/logs}"
APP_LOG="$LOG_DIR/qwen3tts-app.log"
REACT_HOST="${REACT_HOST:-127.0.0.1}"
REACT_PORT="${REACT_PORT:-5173}"
QWEN3TTS_TUNNEL_HOST="${QWEN3TTS_TUNNEL_HOST:-tts.xuyangfly.site}"

mkdir -p "$LOG_DIR"

"$SCRIPT_DIR/start-qwen3tts.sh" >"$APP_LOG" 2>&1 &
APP_PID=$!

cleanup() {
  if kill -0 "$APP_PID" >/dev/null 2>&1; then
    kill "$APP_PID" >/dev/null 2>&1 || true
    wait "$APP_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "qwen3tts started in background: PID=$APP_PID"
echo "app log: $APP_LOG"

echo "Waiting for frontend at http://${REACT_HOST}:${REACT_PORT} ..."
for _ in $(seq 1 120); do
  if curl --noproxy "*" -fsS "http://${REACT_HOST}:${REACT_PORT}" >/dev/null 2>&1; then
    host_probe="$(
      curl --noproxy "*" -sS -H "Host: ${QWEN3TTS_TUNNEL_HOST}" "http://${REACT_HOST}:${REACT_PORT}" \
        | head -c 240 || true
    )"
    if printf '%s' "$host_probe" | grep -Fq "Blocked request. This host"; then
      cat >&2 <<MSG
Vite blocked tunnel host: ${QWEN3TTS_TUNNEL_HOST}

Fix in qwen3tts frontend config:
  /root/work/qwen3tts/tts-web-api/frontend-react/vite.config.js
Add:
  server.allowedHosts: ['${QWEN3TTS_TUNNEL_HOST}']

Then restart this script.
MSG
      exit 1
    fi

    echo "Frontend is ready. Starting Cloudflare Tunnel..."
    "$SCRIPT_DIR/start-cloudflared-tunnel.sh"
    exit 0
  fi

  if ! kill -0 "$APP_PID" >/dev/null 2>&1; then
    echo "qwen3tts exited early. Check log: $APP_LOG" >&2
    exit 1
  fi

  sleep 1
done

echo "Timed out waiting for qwen3tts frontend readiness." >&2
exit 1
