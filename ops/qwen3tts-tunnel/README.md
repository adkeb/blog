# qwen3tts + Cloudflare Tunnel

This directory contains scripts to run `qwen3tts` with the root conda env `qwen3-tts`
and expose it through Cloudflare Tunnel.

## Prerequisites

1. `cloudflared` installed
2. Cloudflare tunnel token created in dashboard
3. Conda env exists: `qwen3-tts`
4. Project path exists: `/root/work/qwen3tts/tts-web-api`

## One-command run

```bash
export CF_TUNNEL_TOKEN_QWEN3TTS='<YOUR_TUNNEL_TOKEN>'
./ops/qwen3tts-tunnel/run-qwen3tts-with-tunnel.sh
```

## Split run

Terminal 1:

```bash
./ops/qwen3tts-tunnel/start-qwen3tts.sh
```

Terminal 2:

```bash
export CF_TUNNEL_TOKEN_QWEN3TTS='<YOUR_TUNNEL_TOKEN>'
./ops/qwen3tts-tunnel/start-cloudflared-tunnel.sh
```

## Environment overrides

- `CONDA_BASE` (default: `/root/anaconda3`)
- `CONDA_ENV_NAME` (default: `qwen3-tts`)
- `QWEN3TTS_PROJECT_DIR` (default: `/root/work/qwen3tts/tts-web-api`)
- `FASTAPI_HOST` / `FASTAPI_PORT` (default: `127.0.0.1:8000`)
- `REACT_HOST` / `REACT_PORT` (default: `127.0.0.1:5173`)
