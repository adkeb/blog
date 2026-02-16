# Cloudflare Pages + Tunnel 部署手册

## 1. 本地初始化

```bash
npm install
cp .env.example .env
```

更新 `.env`：

- `SITE_URL` -> 你的主域名（建议 `https://www.your-domain.com`）
- `PREVIEW_URL` -> 你的预览域名（如 `https://preview.your-domain.com`）
- `NUXT_PUBLIC_SHOW_DRAFTS=false`
- `GISCUS_*` -> giscus 配置

## 2. Cloudflare Pages（公开主站）

1. 在 Cloudflare Pages 连接 GitHub 仓库。
2. Build command: `npm run generate`
3. Build output directory: `dist`
4. 添加环境变量：
   - `SITE_URL`
   - `NUXT_PUBLIC_SHOW_DRAFTS=false`
   - `GISCUS_*`
5. 绑定域名：
   - `www.<domain>` 指向 Pages
   - `<domain>` 在 Cloudflare 中设置 301 到 `www.<domain>`

## 3. Decap CMS（/admin）

1. 修改 `public/admin/config.yml` 的 `backend.repo`。
2. 若使用 GitHub OAuth：
   - 参考 `docs/decap-github-oauth-cloudflare-worker.md`
   - 配置 GitHub OAuth App 回调地址
   - 部署 Cloudflare Worker OAuth 中转服务
3. 发布后访问：`https://www.<domain>/admin`
4. 若启用章节化内容，新增两个 collection：
   - `chapters`
   - `chapter_posts`
5. 章节正文可插入目录占位符：

```md
::chapter-children
::
```

6. 子文章需放在目录 `content/chapter-posts/<chapterSlug>/` 下，并填写同名 `chapterSlug` 字段。

## 4. Tunnel（私有预览/运维）

### 阶段 A：本机按需在线

1. 拷贝配置模板：

```bash
cp ops/cloudflare/tunnel/config.example.yml ops/cloudflare/tunnel/config.yml
```

2. 修改 `config.yml`：
   - `tunnel` ID
   - `credentials-file` 路径
   - `preview.<domain>`、`ops.<domain>`

3. 启动预览服务（草稿可见）：

```bash
./scripts/preview-dev.sh
```

4. 启动 tunnel：

```bash
./scripts/tunnel-run.sh
```

### 阶段 B：迁移云主机常驻

1. 在云主机部署 `cloudflared` 与 Node 运行时。
2. 将 `preview-dev` 改为 systemd 服务（或容器）。
3. 将 `cloudflared tunnel run` 也配置为 systemd 服务。
4. 监控 `api/healthz`，确保预览服务在线。

## 5. Zero Trust Access

按 `ops/cloudflare/tunnel/access-policies.md` 配置：

- `preview.<domain>`：12h 会话，白名单访问
- `ops.<domain>`：2h 会话，管理员白名单 + 强认证

## 6. 验收检查

1. 关停本地 Tunnel 后，`www.<domain>` 仍可访问。
2. 未授权访问 `preview.<domain>` 会被 Access 拦截。
3. 设置 `NUXT_PUBLIC_SHOW_DRAFTS=true` 时草稿可见；`false` 时草稿不可见。
4. `https://www.<domain>/rss.xml`、`/sitemap.xml`、`/search-index.json` 可访问。
5. 文章页 giscus 评论可加载。
6. 章节页 `https://www.<domain>/chapters` 可访问，且章节子文章支持旧 `/posts/:slug` 301 跳转。

## 7. 多应用统一入口（可选）

若你还要部署更多应用（如 TTS、图像工具、内部面板），建议启用应用中心：

1. 在 Tunnel 里为每个应用加一个子域（`<app>.<domain>` -> 本地端口）。
2. 在 `content/apps/` 新增对应应用条目。
3. 前台统一从 `https://www.<domain>/apps` 直达访问。

详细步骤见：`docs/cloudflare-tunnel-app-center.md`
