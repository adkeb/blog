<template>
  <div class="admin-live">
    <button
      class="toggle"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      @click="open = !open"
    >
      {{ open ? "关闭实时编辑" : "实时编辑" }}
    </button>

    <section v-if="open" class="surface panel" aria-label="管理员实时编辑面板">
      <h2>实时编辑面板</h2>

      <template v-if="!isAdmin">
        <p class="meta">
          仅管理员可用。请用 GitHub 管理员账号认证。
        </p>
        <p v-if="!adminLoginConfigured" class="meta error">
          未配置 `NUXT_PUBLIC_ADMIN_GITHUB_LOGIN`，无法校验管理员身份。
        </p>
        <button
          class="primary"
          type="button"
          :disabled="authLoading || !adminLoginConfigured"
          @click="loginWithGitHub"
        >
          {{ authLoading ? "认证中..." : "使用 GitHub 管理员认证" }}
        </button>
        <p v-if="authError" class="meta error">{{ authError }}</p>
      </template>

      <template v-else>
        <div class="panel-head">
          <p class="meta">当前管理员：{{ adminLogin }}</p>
          <button class="ghost" type="button" @click="logout">退出</button>
        </div>

        <h3>站点文案实时修改</h3>
        <label>
          站点名称
          <input v-model="draft.brandName" type="text" @input="applyTextDraft" />
        </label>
        <label>
          首页眉标
          <input v-model="draft.heroEyebrow" type="text" @input="applyTextDraft" />
        </label>
        <label>
          首页主标题
          <input v-model="draft.heroTitle" type="text" @input="applyTextDraft" />
        </label>
        <label>
          首页简介
          <textarea v-model="draft.heroDescription" rows="3" @input="applyTextDraft" />
        </label>
        <label>
          页脚文案
          <input v-model="draft.footerText" type="text" @input="applyTextDraft" />
        </label>

        <h3>代码框统一样式（一键全站生效）</h3>
        <div class="preset-row">
          <button class="ghost" type="button" @click="applyPreset('default')">默认</button>
          <button class="ghost" type="button" @click="applyPreset('midnight')">午夜蓝</button>
          <button class="ghost" type="button" @click="applyPreset('forest')">森林绿</button>
        </div>

        <div class="code-grid">
          <label>
            代码框背景
            <input v-model="draft.codeTheme.codeBg" type="color" @input="applyCodeDraft" />
          </label>
          <label>
            代码框文字
            <input v-model="draft.codeTheme.codeText" type="color" @input="applyCodeDraft" />
          </label>
          <label>
            代码框边框
            <input v-model="draft.codeTheme.codeBorder" type="color" @input="applyCodeDraft" />
          </label>
          <label>
            行内代码背景
            <input v-model="draft.codeTheme.inlineCodeBg" type="color" @input="applyCodeDraft" />
          </label>
          <label>
            行内代码文字
            <input v-model="draft.codeTheme.inlineCodeText" type="color" @input="applyCodeDraft" />
          </label>
        </div>

        <div class="actions">
          <NuxtLink class="ghost" :to="adminEntryUrl" target="_blank">
            编辑当前页面内容
          </NuxtLink>
          <button class="ghost danger" type="button" @click="resetAll">
            重置实时改动
          </button>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CodeThemeTokens, LiveCustomizationState } from "~/composables/useLiveCustomization";

type ThemePresetName = "default" | "midnight" | "forest";

interface AuthSession {
  login: string;
}

const AUTH_SESSION_KEY = "blog-admin-auth-session-v1";
const POPUP_FEATURES = "width=720,height=860,menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes";

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const { state, init, patch, setCodeTheme, reset } = useLiveCustomization();

const open = ref(false);
const authLoading = ref(false);
const authError = ref("");
const adminLogin = ref("");
const draft = ref<LiveCustomizationState>({
  brandName: "",
  heroEyebrow: "",
  heroTitle: "",
  heroDescription: "",
  footerText: "",
  codeTheme: {
    codeBg: "#000000",
    codeText: "#ffffff",
    codeBorder: "#000000",
    inlineCodeBg: "#ffffff",
    inlineCodeText: "#000000"
  }
});

const configuredAdminLogin = computed(() =>
  String(runtimeConfig.public.adminGithubLogin || "").trim().toLowerCase()
);
const adminLoginConfigured = computed(() => configuredAdminLogin.value.length > 0);
const isAdmin = computed(() => {
  return adminLoginConfigured.value && adminLogin.value.toLowerCase() === configuredAdminLogin.value;
});
const oauthBaseUrl = computed(() => {
  const value = String(runtimeConfig.public.adminOauthBaseUrl || "").trim();
  return value.length > 0 ? value : "https://decap-github-oauth.xuyang020128.workers.dev";
});

const adminEntryUrl = computed(() => {
  const path = route.path || "/";
  const postMatch = path.match(/^\/posts\/([^/]+)$/);
  if (postMatch) {
    return `/admin/#/collections/posts/entries/${encodeURIComponent(decodeURIComponent(postMatch[1]))}`;
  }

  const chapterMatch = path.match(/^\/chapters\/([^/]+)$/);
  if (chapterMatch) {
    return `/admin/#/collections/chapters/entries/${encodeURIComponent(decodeURIComponent(chapterMatch[1]))}`;
  }

  const chapterPostMatch = path.match(/^\/chapters\/([^/]+)\/([^/]+)$/);
  if (chapterPostMatch) {
    const entry = `${decodeURIComponent(chapterPostMatch[1])}/${decodeURIComponent(chapterPostMatch[2])}`;
    return `/admin/#/collections/chapter_posts/entries/${encodeURIComponent(entry)}`;
  }

  return "/admin/";
});

const codePresets: Record<ThemePresetName, CodeThemeTokens> = {
  default: {
    codeBg: "#0f172a",
    codeText: "#e2e8f0",
    codeBorder: "#1e293b",
    inlineCodeBg: "#e2e8f0",
    inlineCodeText: "#0f172a"
  },
  midnight: {
    codeBg: "#0b1020",
    codeText: "#c7dcff",
    codeBorder: "#1d2b4e",
    inlineCodeBg: "#1f2f4d",
    inlineCodeText: "#dbeafe"
  },
  forest: {
    codeBg: "#0f1a14",
    codeText: "#d3f7e1",
    codeBorder: "#1c3a2c",
    inlineCodeBg: "#1a3127",
    inlineCodeText: "#c8f6de"
  }
};

function cloneState(source: LiveCustomizationState): LiveCustomizationState {
  return {
    ...source,
    codeTheme: { ...source.codeTheme }
  };
}

function readAuthSession(): AuthSession | null {
  if (!import.meta.client) {
    return null;
  }

  const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && typeof (parsed as { login?: unknown }).login === "string") {
      return { login: (parsed as { login: string }).login };
    }
  } catch {
    return null;
  }

  return null;
}

function writeAuthSession(session: AuthSession): void {
  if (!import.meta.client) {
    return;
  }
  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function clearAuthSession(): void {
  if (!import.meta.client) {
    return;
  }
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

async function waitForOAuthResult(popup: Window): Promise<string> {
  if (!import.meta.client) {
    throw new Error("OAuth only works in browser.");
  }

  const workerOrigin = new URL(oauthBaseUrl.value).origin;

  return await new Promise<string>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("GitHub 认证超时，请重试。"));
    }, 180000);

    const closedTimer = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("认证窗口已关闭。"));
      }
    }, 400);

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.clearInterval(closedTimer);
      window.removeEventListener("message", onMessage);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== workerOrigin || typeof event.data !== "string") {
        return;
      }

      const message = event.data;
      if (message === "authorizing:github") {
        popup.postMessage("authorizing:github", workerOrigin);
        return;
      }

      if (message.startsWith("authorization:github:error:")) {
        cleanup();
        reject(new Error("GitHub OAuth 返回错误。"));
        return;
      }

      if (!message.startsWith("authorization:github:success:")) {
        return;
      }

      const payloadRaw = message.slice("authorization:github:success:".length);
      try {
        const payload = JSON.parse(payloadRaw) as { token?: unknown };
        if (typeof payload.token !== "string" || payload.token.length === 0) {
          throw new Error("missing token");
        }
        cleanup();
        resolve(payload.token);
      } catch {
        cleanup();
        reject(new Error("OAuth 回调解析失败。"));
      }
    };

    window.addEventListener("message", onMessage);
  });
}

async function fetchGitHubLogin(accessToken: string): Promise<string> {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!resp.ok) {
    throw new Error(`GitHub 用户信息请求失败（${resp.status}）。`);
  }

  const body = (await resp.json()) as { login?: unknown };
  if (typeof body.login !== "string" || body.login.length === 0) {
    throw new Error("GitHub 返回用户信息无效。");
  }

  return body.login;
}

function applyTextDraft(): void {
  patch({
    brandName: draft.value.brandName,
    heroEyebrow: draft.value.heroEyebrow,
    heroTitle: draft.value.heroTitle,
    heroDescription: draft.value.heroDescription,
    footerText: draft.value.footerText
  });
}

function applyCodeDraft(): void {
  setCodeTheme({ ...draft.value.codeTheme });
}

function applyPreset(preset: ThemePresetName): void {
  const next = { ...codePresets[preset] };
  draft.value.codeTheme = next;
  setCodeTheme(next);
}

function resetAll(): void {
  reset();
  draft.value = cloneState(state.value);
}

async function loginWithGitHub(): Promise<void> {
  if (!import.meta.client || authLoading.value) {
    return;
  }

  authLoading.value = true;
  authError.value = "";

  try {
    const authUrl = new URL(`${oauthBaseUrl.value.replace(/\/$/, "")}/auth`);
    authUrl.searchParams.set("provider", "github");
    authUrl.searchParams.set("origin", window.location.origin);
    authUrl.searchParams.set("scope", "repo read:user");

    const popup = window.open(authUrl.toString(), "blog-admin-oauth", POPUP_FEATURES);
    if (!popup) {
      throw new Error("浏览器阻止了弹窗，请允许弹窗后重试。");
    }

    const token = await waitForOAuthResult(popup);
    const login = await fetchGitHubLogin(token);

    if (login.toLowerCase() !== configuredAdminLogin.value) {
      throw new Error(`当前登录账号 ${login} 不是管理员账号 ${configuredAdminLogin.value}。`);
    }

    adminLogin.value = login;
    writeAuthSession({ login });
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "认证失败，请重试。";
    adminLogin.value = "";
    clearAuthSession();
  } finally {
    authLoading.value = false;
  }
}

function logout(): void {
  adminLogin.value = "";
  authError.value = "";
  clearAuthSession();
}

onMounted(() => {
  init();
  draft.value = cloneState(state.value);

  const session = readAuthSession();
  if (session && session.login.toLowerCase() === configuredAdminLogin.value) {
    adminLogin.value = session.login;
  }
});

watch(
  () => state.value,
  (next) => {
    draft.value = cloneState(next);
  },
  { deep: true }
);
</script>

<style scoped>
.admin-live {
  bottom: 1rem;
  position: fixed;
  right: 1rem;
  z-index: 60;
}

.toggle {
  background: var(--brand);
  border: 1px solid var(--brand);
  border-radius: 999px;
  color: #eafffb;
  cursor: pointer;
  font: inherit;
  padding: 0.4rem 0.8rem;
}

.panel {
  margin-top: 0.6rem;
  max-height: 78vh;
  overflow: auto;
  padding: 1rem;
  width: min(92vw, 440px);
}

.panel h2 {
  margin: 0 0 0.5rem;
}

.panel h3 {
  margin: 1.1rem 0 0.5rem;
}

.panel-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

label {
  color: var(--text-muted);
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.55rem;
}

input,
textarea {
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text);
  display: block;
  font: inherit;
  margin-top: 0.2rem;
  padding: 0.45rem 0.5rem;
  width: 100%;
}

input[type="color"] {
  cursor: pointer;
  height: 2.2rem;
  padding: 0.2rem;
}

.primary,
.ghost {
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  padding: 0.35rem 0.6rem;
}

.primary {
  background: var(--brand);
  border-color: var(--brand);
  color: #eafffb;
}

.danger {
  border-color: #ef4444;
  color: #b91c1c;
}

.preset-row {
  display: flex;
  gap: 0.45rem;
}

.code-grid {
  display: grid;
  gap: 0.3rem;
  grid-template-columns: 1fr 1fr;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.error {
  color: #ef4444;
}
</style>
