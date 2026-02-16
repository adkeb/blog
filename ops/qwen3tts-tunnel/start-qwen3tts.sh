#!/usr/bin/env bash
set -euo pipefail

CONDA_BASE="${CONDA_BASE:-/root/anaconda3}"
CONDA_ENV_NAME="${CONDA_ENV_NAME:-qwen3-tts}"
QWEN3TTS_PROJECT_DIR="${QWEN3TTS_PROJECT_DIR:-/root/work/qwen3tts/tts-web-api}"

FASTAPI_HOST="${FASTAPI_HOST:-127.0.0.1}"
FASTAPI_PORT="${FASTAPI_PORT:-8000}"
REACT_HOST="${REACT_HOST:-127.0.0.1}"
REACT_PORT="${REACT_PORT:-5173}"

if [ ! -f "$CONDA_BASE/etc/profile.d/conda.sh" ]; then
  echo "Conda init script not found: $CONDA_BASE/etc/profile.d/conda.sh" >&2
  exit 1
fi

if [ ! -d "$QWEN3TTS_PROJECT_DIR" ]; then
  echo "Qwen3TTS project directory not found: $QWEN3TTS_PROJECT_DIR" >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
set +u
conda activate "$CONDA_ENV_NAME"
set -u

cd "$QWEN3TTS_PROJECT_DIR"

export FASTAPI_HOST FASTAPI_PORT REACT_HOST REACT_PORT

echo "Starting qwen3tts with conda env: $CONDA_ENV_NAME"
echo "Frontend: http://${REACT_HOST}:${REACT_PORT}"
echo "Backend:  http://${FASTAPI_HOST}:${FASTAPI_PORT}"

exec ./start_fullstack.sh
