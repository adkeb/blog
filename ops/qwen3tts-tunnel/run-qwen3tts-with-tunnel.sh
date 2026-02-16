#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="${QWEN3TTS_LOG_DIR:-/root/work/qwen3tts/logs}"
APP_LOG="$LOG_DIR/qwen3tts-app.log"

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

echo "Waiting for frontend at http://127.0.0.1:5173 ..."
for _ in $(seq 1 120); do
  if curl -fsS "http://127.0.0.1:5173" >/dev/null 2>&1; then
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
