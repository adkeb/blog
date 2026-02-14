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
        <p v-if="adminLoginConfigured" class="meta">
          目标管理员账号：{{ configuredAdminLogin }}
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
          <button
            class="primary"
            type="button"
            :disabled="publishLoading || !githubRepoConfigured"
            @click="publishLiveCustomization"
          >
            {{ publishLoading ? "发布中..." : "保存并发布（所有访客）" }}
          </button>
          <button class="ghost danger" type="button" @click="resetAll">
            重置实时改动
          </button>
        </div>

        <h3>当前页面源码直改（免进 /admin）</h3>
        <p class="meta">
          当前路径：{{ pageSourcePath || "当前页不支持源码编辑" }}
        </p>
        <div class="actions">
          <button
            class="ghost"
            type="button"
            :disabled="pageSourceLoading || !pageSourcePath || !githubRepoConfigured"
            @click="loadPageSource"
          >
            {{ pageSourceLoading ? "加载中..." : "加载源码" }}
          </button>
          <button
            class="primary"
            type="button"
            :disabled="pageSourceSaving || !pageSourceSha || !pageSourcePath || !githubRepoConfigured"
            @click="savePageSource"
          >
            {{ pageSourceSaving ? "保存中..." : "保存源码并发布" }}
          </button>
        </div>
        <textarea
          v-model="pageSourceText"
          rows="10"
          placeholder="点击“加载源码”后可直接修改 Markdown；保存会提交到 GitHub main 分支。"
        />
        <p v-if="saveSuccess" class="meta success">{{ saveSuccess }}</p>
        <p v-if="saveError" class="meta error">{{ saveError }}</p>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CodeThemeTokens, LiveCustomizationState } from "~/composables/useLiveCustomization";

type ThemePresetName = "default" | "midnight" | "forest";

interface AuthSession {
  login: string;
  token?: string;
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
const adminToken = ref("");
const saveError = ref("");
const saveSuccess = ref("");
const publishLoading = ref(false);
const pageSourceLoading = ref(false);
const pageSourceSaving = ref(false);
const pageSourcePath = ref("");
const pageSourceSha = ref("");
const pageSourceText = ref("");
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
const githubRepo = computed(() => String(runtimeConfig.public.giscus?.repo || "").trim());
const githubRepoConfigured = computed(() => githubRepo.value.includes("/"));
const githubContentBranch = computed(() => "main");

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

function encodePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToUtf8(input: string): string {
  const normalized = input.replace(/\n/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function resolvePageContentPath(): string {
  const path = route.path || "/";
  const postMatch = path.match(/^\/posts\/([^/]+)$/);
  if (postMatch) {
    return `content/posts/${decodeURIComponent(postMatch[1])}.md`;
  }

  const chapterMatch = path.match(/^\/chapters\/([^/]+)$/);
  if (chapterMatch) {
    return `content/chapters/${decodeURIComponent(chapterMatch[1])}.md`;
  }

  const chapterPostMatch = path.match(/^\/chapters\/([^/]+)\/([^/]+)$/);
  if (chapterPostMatch) {
    return `content/chapter-posts/${decodeURIComponent(chapterPostMatch[1])}/${decodeURIComponent(chapterPostMatch[2])}.md`;
  }

  return "";
}

interface GitHubContentResponse {
  sha: string;
  content: string;
  encoding?: string;
}

async function getRepoContent(path: string): Promise<GitHubContentResponse> {
  if (!adminToken.value) {
    throw new Error("登录态缺少访问令牌，请重新点击“使用 GitHub 管理员认证”。");
  }
  const encodedPath = encodePath(path);
  const url = `https://api.github.com/repos/${githubRepo.value}/contents/${encodedPath}?ref=${encodeURIComponent(githubContentBranch.value)}`;
  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${adminToken.value}`
    }
  });

  if (!resp.ok) {
    throw new Error(`读取仓库文件失败（${resp.status}）。`);
  }

  return (await resp.json()) as GitHubContentResponse;
}

async function putRepoContent(input: {
  path: string;
  content: string;
  sha: string;
  message: string;
}): Promise<void> {
  if (!adminToken.value) {
    throw new Error("登录态缺少访问令牌，请重新点击“使用 GitHub 管理员认证”。");
  }
  const encodedPath = encodePath(input.path);
  const url = `https://api.github.com/repos/${githubRepo.value}/contents/${encodedPath}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${adminToken.value}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      message: input.message,
      content: utf8ToBase64(input.content),
      sha: input.sha,
      branch: githubContentBranch.value
    })
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`提交仓库文件失败（${resp.status}）: ${detail}`);
  }
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
    adminToken.value = token;
    writeAuthSession({ login, token });
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "认证失败，请重试。";
    adminLogin.value = "";
    adminToken.value = "";
    clearAuthSession();
  } finally {
    authLoading.value = false;
  }
}

function logout(): void {
  adminLogin.value = "";
  adminToken.value = "";
  authError.value = "";
  saveError.value = "";
  saveSuccess.value = "";
  clearAuthSession();
}

async function publishLiveCustomization(): Promise<void> {
  if (!isAdmin.value || !githubRepoConfigured.value) {
    return;
  }
  saveError.value = "";
  saveSuccess.value = "";
  publishLoading.value = true;

  try {
    const path = "public/site-settings.json";
    const current = await getRepoContent(path);
    const nextContent = JSON.stringify(state.value, null, 2) + "\n";
    await putRepoContent({
      path,
      content: nextContent,
      sha: current.sha,
      message: "chore: update live site customization"
    });
    saveSuccess.value = "已提交到仓库，Cloudflare Pages 正在自动部署。";
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : "发布失败。";
  } finally {
    publishLoading.value = false;
  }
}

async function loadPageSource(): Promise<void> {
  if (!isAdmin.value || !pageSourcePath.value || !githubRepoConfigured.value) {
    return;
  }
  saveError.value = "";
  saveSuccess.value = "";
  pageSourceLoading.value = true;

  try {
    const current = await getRepoContent(pageSourcePath.value);
    pageSourceSha.value = current.sha;
    pageSourceText.value = base64ToUtf8(current.content || "");
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : "加载源码失败。";
  } finally {
    pageSourceLoading.value = false;
  }
}

async function savePageSource(): Promise<void> {
  if (!isAdmin.value || !pageSourcePath.value || !pageSourceSha.value || !githubRepoConfigured.value) {
    return;
  }
  saveError.value = "";
  saveSuccess.value = "";
  pageSourceSaving.value = true;

  try {
    await putRepoContent({
      path: pageSourcePath.value,
      content: pageSourceText.value.endsWith("\n") ? pageSourceText.value : `${pageSourceText.value}\n`,
      sha: pageSourceSha.value,
      message: `docs: update ${pageSourcePath.value} from live panel`
    });

    const refreshed = await getRepoContent(pageSourcePath.value);
    pageSourceSha.value = refreshed.sha;
    saveSuccess.value = "页面源码已提交到仓库，Cloudflare Pages 正在自动部署。";
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : "保存源码失败。";
  } finally {
    pageSourceSaving.value = false;
  }
}

onMounted(() => {
  void init().then(() => {
    draft.value = cloneState(state.value);
  });
  pageSourcePath.value = resolvePageContentPath();

  const session = readAuthSession();
  if (session && session.login.toLowerCase() === configuredAdminLogin.value) {
    adminLogin.value = session.login;
    adminToken.value = typeof session.token === "string" ? session.token : "";
  }
});

watch(
  () => state.value,
  (next) => {
    draft.value = cloneState(next);
  },
  { deep: true }
);

watch(
  () => route.path,
  () => {
    pageSourcePath.value = resolvePageContentPath();
    pageSourceSha.value = "";
    pageSourceText.value = "";
  }
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
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.error {
  color: #ef4444;
}

.success {
  color: #0f766e;
}
</style>
