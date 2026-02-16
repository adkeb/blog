#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNTIME_DIR="${QWEN3TTS_RUNTIME_DIR:-/root/work/qwen3tts/run}"
PID_FILE="$RUNTIME_DIR/qwen3tts-tunnel.pid"
LOG_FILE="${QWEN3TTS_DAEMON_LOG:-$RUNTIME_DIR/qwen3tts-tunnel.log}"

mkdir -p "$RUNTIME_DIR"

is_running() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "${pid:-}" ] && kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

require_token() {
  if [ -n "${CF_TUNNEL_TOKEN_QWEN3TTS:-}" ]; then
    return 0
  fi

  if [ -n "${CF_TUNNEL_TOKEN_QWEN3TTS_FILE:-}" ] && [ -f "${CF_TUNNEL_TOKEN_QWEN3TTS_FILE}" ]; then
    CF_TUNNEL_TOKEN_QWEN3TTS="$(tr -d '\r\n' <"${CF_TUNNEL_TOKEN_QWEN3TTS_FILE}")"
    export CF_TUNNEL_TOKEN_QWEN3TTS
    return 0
  fi

  cat >&2 <<'MSG'
Missing CF_TUNNEL_TOKEN_QWEN3TTS.

Use one of:
  export CF_TUNNEL_TOKEN_QWEN3TTS='...'
or:
  export CF_TUNNEL_TOKEN_QWEN3TTS_FILE='/path/to/token.txt'
MSG
  exit 1
}

start() {
  if is_running; then
    echo "Already running (PID=$(cat "$PID_FILE"))."
    return 0
  fi

  require_token

  # Use a new process group so stop() can terminate all child processes together.
  nohup setsid "$SCRIPT_DIR/run-qwen3tts-with-tunnel.sh" >>"$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" >"$PID_FILE"
  sleep 1

  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "Started qwen3tts+tunnel daemon (PID=$pid)"
    echo "Log file: $LOG_FILE"
    return 0
  fi

  echo "Failed to start daemon. Check logs: $LOG_FILE" >&2
  rm -f "$PID_FILE"
  return 1
}

stop() {
  if ! is_running; then
    echo "Not running."
    rm -f "$PID_FILE"
    return 0
  fi

  local pid pgid
  pid="$(cat "$PID_FILE")"
  pgid="$(ps -o pgid= -p "$pid" | tr -d ' ' || true)"

  if [ -n "${pgid:-}" ]; then
    kill -TERM "-$pgid" >/dev/null 2>&1 || true
  else
    kill -TERM "$pid" >/dev/null 2>&1 || true
  fi

  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done

  if kill -0 "$pid" >/dev/null 2>&1; then
    if [ -n "${pgid:-}" ]; then
      kill -KILL "-$pgid" >/dev/null 2>&1 || true
    else
      kill -KILL "$pid" >/dev/null 2>&1 || true
    fi
  fi

  rm -f "$PID_FILE"
  echo "Stopped."
}

status() {
  if is_running; then
    echo "Running (PID=$(cat "$PID_FILE"))."
    ss -ltnp | rg ':5173|:8000' || true
    return 0
  fi

  echo "Not running."
  return 1
}

logs() {
  touch "$LOG_FILE"
  tail -n 100 -f "$LOG_FILE"
}

case "${1:-}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop || true
    start
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  *)
    cat <<'MSG'
Usage:
  ./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh start|stop|restart|status|logs
MSG
    exit 1
    ;;
esac
