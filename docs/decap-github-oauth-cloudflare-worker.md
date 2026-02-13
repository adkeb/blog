# Decap CMS GitHub OAuth（Cloudflare Worker 方案）

本指南用于打通 `/admin` 登录发布能力。

## 0. 目标结果

完成后：

1. 访问 `https://www.xuyangfly.site/admin` 可以点击 GitHub 登录。
2. 登录后可在 Decap CMS 中创建/编辑并提交文章到 `adkeb/blog`。

## 1. 创建 GitHub OAuth App

1. 打开 GitHub -> `Settings` -> `Developer settings` -> `OAuth Apps` -> `New OAuth App`。
2. 填写：
   - Application name: `decap-blog-cms`
   - Homepage URL: `https://www.xuyangfly.site`
   - Authorization callback URL: `https://<your-worker-domain>/callback`
3. 创建后记录：
   - `Client ID`
   - `Client Secret`

## 2. 部署 Cloudflare Worker

### 2.1 准备配置文件

1. 进入目录 `ops/decap-oauth`。
2. 复制模板：

```bash
cp wrangler.example.toml wrangler.toml
```

3. 编辑 `wrangler.toml`，设置：
   - `CMS_ORIGIN=https://www.xuyangfly.site`
   - `GITHUB_REDIRECT_URI=https://<your-worker-domain>/callback`
   - `OAUTH_STATE_SECRET=<随机长字符串>`
   - `GITHUB_CLIENT_ID=<GitHub Client ID>`

### 2.2 设置密钥并发布

```bash
cd ops/decap-oauth
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
```

发布后得到 Worker 域名，例如：

`https://decap-github-oauth.<subdomain>.workers.dev`

## 3. 回填 GitHub OAuth 回调地址

回到 GitHub OAuth App，把 callback URL 改为 Worker 的 callback：

`https://decap-github-oauth.<subdomain>.workers.dev/callback`

## 4. 修改 Decap CMS 配置

编辑 `public/admin/config.yml`，在 `backend` 下增加：

```yaml
backend:
  name: github
  repo: adkeb/blog
  branch: main
  base_url: https://decap-github-oauth.<subdomain>.workers.dev
  auth_endpoint: auth
```

## 5. 发布站点并验证

1. 提交代码并推送 `main`，触发 Pages 重新部署。
2. 访问 `https://www.xuyangfly.site/admin`。
3. 点击登录，确认可进入后台编辑并提交文章。

## 6. 常见问题

1. `404 on /callback`  
   - 检查 Worker 是否已发布，callback URL 是否一致。
2. `Login succeeded but cannot commit`  
   - 检查 `repo` 是否 `adkeb/blog`，GitHub App 权限是否给到该仓库。
3. `Invalid state`  
   - 检查 `OAUTH_STATE_SECRET` 是否配置且没有改动。

