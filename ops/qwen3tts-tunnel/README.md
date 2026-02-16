# qwen3tts + Cloudflare Tunnel

This directory contains scripts to run `qwen3tts` with conda env `qwen3-tts`
and expose it through Cloudflare Tunnel.

## Prerequisites

1. `cloudflared` installed
2. Cloudflare tunnel token created in dashboard
3. Conda env exists: `qwen3-tts`
4. Project path exists: `/root/work/qwen3tts/tts-web-api`
5. Tunnel route exists: `tts.xuyangfly.site -> http://127.0.0.1:5173`

## Combined run (legacy)

```bash
export CF_TUNNEL_TOKEN_QWEN3TTS='<YOUR_TUNNEL_TOKEN>'
./ops/qwen3tts-tunnel/run-qwen3tts-with-tunnel.sh
```

This starts app + tunnel in one process. Keep terminal open.

## Recommended split mode (app and tunnel separated)

Terminal A (app, foreground with full logs):

```bash
./ops/qwen3tts-tunnel/start-qwen3tts.sh
```

Terminal B (tunnel daemon, can stay always-on):

```bash
export CF_TUNNEL_TOKEN_QWEN3TTS='<YOUR_TUNNEL_TOKEN>'
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh start
```

Manage daemon:

```bash
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh status
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh logs
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh restart
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh stop
```

## Troubleshooting

1. Browser shows `ERR_CONNECTION_CLOSED`:
   - Usually tunnel process is not running.
   - Run `./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh status`.
   - Also verify app is running in Terminal A.
2. `403 Blocked request. This host is not allowed.`:
   - Add `server.allowedHosts: ['tts.xuyangfly.site']` in:
     `/root/work/qwen3tts/tts-web-api/frontend-react/vite.config.js`
3. Local health check:
   - `curl --noproxy '*' -I http://127.0.0.1:5173`
   - `curl -I https://tts.xuyangfly.site`

## Environment overrides

- `CONDA_BASE` (default: `/root/anaconda3`)
- `CONDA_ENV_NAME` (default: `qwen3-tts`)
- `QWEN3TTS_PROJECT_DIR` (default: `/root/work/qwen3tts/tts-web-api`)
- `FASTAPI_HOST` / `FASTAPI_PORT` (default: `127.0.0.1:8000`)
- `REACT_HOST` / `REACT_PORT` (default: `127.0.0.1:5173`)
- `QWEN3TTS_TUNNEL_HOST` (default: `tts.xuyangfly.site`)
- `QWEN3TTS_RUNTIME_DIR` (default: `/root/work/qwen3tts/run`)
- `QWEN3TTS_DAEMON_LOG` (default: `/root/work/qwen3tts/run/qwen3tts-tunnel.log`)
- `CF_TUNNEL_TOKEN_QWEN3TTS_FILE` (optional token file path for daemon mode)
