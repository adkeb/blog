# Cloudflare Tunnel 多应用部署（应用中心）

本文用于把多个本机应用通过 Cloudflare Tunnel 暴露，并在博客 `/apps` 统一管理访问入口。

## 1. 目标结构

- 博客统一入口：`https://www.xuyangfly.site/apps`
- 每个应用一个子域，例如：
  - `tts.xuyangfly.site` -> Qwen3TTS
  - `img.xuyangfly.site` -> 图片工具
  - `tools.xuyangfly.site` -> 内部工具页

核心思路：应用部署和 Tunnel 路由独立，博客只维护应用目录链接。

## 2. 在 Cloudflare 建立/维护 Tunnel

1. 打开 Cloudflare Zero Trust 控制台。
2. 进入 `Networks` -> `Tunnels`。
3. 建议使用一个长期 Tunnel（例如 `apps-hub`），并在其中添加多个 Public Hostname。
4. 每个 Hostname 对应一个本地服务地址（`http://127.0.0.1:<port>`）。

示例映射：

- `tts.xuyangfly.site` -> `http://127.0.0.1:5173`
- `img.xuyangfly.site` -> `http://127.0.0.1:7860`
- `tools.xuyangfly.site` -> `http://127.0.0.1:3001`

保存后复制 Tunnel Token（`ey...`）。

## 3. 启动本机应用 + Tunnel

### 3.1 Qwen3TTS（已提供脚本）

推荐“分离运行”：

- 控制台 A：只启动应用（方便观察 FastAPI/Vite 日志）
- Tunnel：单独后台常驻（不随应用终端关闭）

```bash
cd /root/work/bilibili
# 控制台 A：前台启动应用
./ops/qwen3tts-tunnel/start-qwen3tts.sh
```

Tunnel 后台常驻：

```bash
cd /root/work/bilibili
export CF_TUNNEL_TOKEN_QWEN3TTS='<你的TunnelToken>'
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh start
```

查看状态与日志：

```bash
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh status
./ops/qwen3tts-tunnel/daemon-qwen3tts-tunnel.sh logs
```

说明：`start-qwen3tts.sh` 固定使用 `/root/anaconda3` 下的 `qwen3-tts` 环境。

### 3.2 其他应用

其他应用按各自启动方式运行后，只要在 Tunnel 中配置好 Hostname -> 本地端口即可被公网访问。

## 4. 博客应用中心接入

项目已实现：

- 导航：`应用`（`/apps`）
- 内容来源：`content/apps/*.md`
- CMS 后台集合：`应用中心`

每新增一个应用，只需要新增一个条目文件。例如：

```yaml
---
title: "My New App"
slug: "my-new-app"
description: "应用说明"
url: "https://myapp.xuyangfly.site"
date: "2026-02-16"
updated: "2026-02-16"
tags: ["tool", "ai"]
category: "Application"
status: "online" # online | private | offline
order: 20
draft: false
lang: "zh-CN"
---
```

状态说明：

- `online`：公开可访问
- `private`：受 Access 或鉴权保护
- `offline`：暂时下线（保留目录记录）

## 5. 验证清单

1. 每个子域能打开对应应用页面。
2. `https://www.xuyangfly.site/apps` 能看到新应用卡片。
3. 点击卡片可跳转到对应子域。
4. 新增应用时无需改前端代码，仅新增 `content/apps/*.md` 条目。
