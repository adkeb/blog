# Cloudflare Zero Trust Access 策略模板

以下策略用于保护 `preview.<domain>` 和 `ops.<domain>`。

## 1. Preview 应用策略

- Application Domain: `preview.<domain>`
- Session Duration: `12h`
- Policy 1 (`allow`):
  - Include: 指定邮箱白名单（你的个人邮箱）
  - Include: 指定 IdP group（可选）
- Policy 2 (`block`):
  - Include: Everyone

## 2. Ops 应用策略

- Application Domain: `ops.<domain>`
- Session Duration: `2h`
- Policy 1 (`allow`):
  - Include: 指定邮箱白名单（仅管理员）
  - Require: One-time PIN 或硬件密钥（推荐）
- Policy 2 (`block`):
  - Include: Everyone

## 3. 额外建议

- 开启 Access logs，至少保留 30 天。
- 对 `ops.<domain>` 使用更短会话和更严格验证。
- 避免将公开 API 放在 Tunnel 且无 Access 保护。

