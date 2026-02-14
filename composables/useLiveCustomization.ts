interface CodeThemeTokens {
  codeBg: string;
  codeText: string;
  codeBorder: string;
  inlineCodeBg: string;
  inlineCodeText: string;
}

interface LiveCustomizationState {
  brandName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  codeTheme: CodeThemeTokens;
}

const STORAGE_KEY = "blog-live-customization-v1";

const DEFAULT_STATE: LiveCustomizationState = {
  brandName: "Personal Blog",
  heroEyebrow: "Cloudflare Pages + Tunnel",
  heroTitle: "个人技术博客",
  heroDescription:
    "这是一个以技术沉淀为目标的博客模板。公开站点部署在 Cloudflare Pages，私有预览和后台通过 Cloudflare Tunnel 暴露。",
  footerText: "Personal Blog. Built with Nuxt + Cloudflare Pages.",
  codeTheme: {
    codeBg: "#0f172a",
    codeText: "#e2e8f0",
    codeBorder: "#1e293b",
    inlineCodeBg: "#e2e8f0",
    inlineCodeText: "#0f172a"
  }
};

function cloneDefaults(): LiveCustomizationState {
  return {
    ...DEFAULT_STATE,
    codeTheme: { ...DEFAULT_STATE.codeTheme }
  };
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function coerceString(input: unknown, fallback: string): string {
  return typeof input === "string" && input.trim().length > 0 ? input : fallback;
}

function normalizeCodeTheme(input: unknown): CodeThemeTokens {
  const defaults = DEFAULT_STATE.codeTheme;
  if (!input || typeof input !== "object") {
    return { ...defaults };
  }

  const source = input as Record<string, unknown>;
  return {
    codeBg: isHexColor(source.codeBg) ? source.codeBg : defaults.codeBg,
    codeText: isHexColor(source.codeText) ? source.codeText : defaults.codeText,
    codeBorder: isHexColor(source.codeBorder) ? source.codeBorder : defaults.codeBorder,
    inlineCodeBg: isHexColor(source.inlineCodeBg) ? source.inlineCodeBg : defaults.inlineCodeBg,
    inlineCodeText: isHexColor(source.inlineCodeText) ? source.inlineCodeText : defaults.inlineCodeText
  };
}

function normalizeState(input: unknown): LiveCustomizationState {
  const defaults = cloneDefaults();
  if (!input || typeof input !== "object") {
    return defaults;
  }

  const source = input as Record<string, unknown>;
  return {
    brandName: coerceString(source.brandName, defaults.brandName),
    heroEyebrow: coerceString(source.heroEyebrow, defaults.heroEyebrow),
    heroTitle: coerceString(source.heroTitle, defaults.heroTitle),
    heroDescription: coerceString(source.heroDescription, defaults.heroDescription),
    footerText: coerceString(source.footerText, defaults.footerText),
    codeTheme: normalizeCodeTheme(source.codeTheme)
  };
}

function applyCodeTheme(theme: CodeThemeTokens): void {
  if (!import.meta.client) {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty("--code-bg", theme.codeBg);
  root.style.setProperty("--code-text", theme.codeText);
  root.style.setProperty("--code-border", theme.codeBorder);
  root.style.setProperty("--inline-code-bg", theme.inlineCodeBg);
  root.style.setProperty("--inline-code-text", theme.inlineCodeText);
}

function saveState(state: LiveCustomizationState): void {
  if (!import.meta.client) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useLiveCustomization() {
  const state = useState<LiveCustomizationState>("live-customization", () => cloneDefaults());
  const initialized = useState<boolean>("live-customization-initialized", () => false);

  const init = () => {
    if (!import.meta.client || initialized.value) {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        state.value = normalizeState(parsed);
      } catch {
        state.value = cloneDefaults();
      }
    } else {
      state.value = cloneDefaults();
    }

    applyCodeTheme(state.value.codeTheme);
    initialized.value = true;
  };

  const patch = (next: Partial<LiveCustomizationState>) => {
    state.value = normalizeState({
      ...state.value,
      ...next,
      codeTheme: {
        ...state.value.codeTheme,
        ...(next.codeTheme || {})
      }
    });

    applyCodeTheme(state.value.codeTheme);
    saveState(state.value);
  };

  const setCodeTheme = (next: Partial<CodeThemeTokens>) => {
    patch({
      codeTheme: {
        ...state.value.codeTheme,
        ...next
      }
    });
  };

  const reset = () => {
    state.value = cloneDefaults();
    applyCodeTheme(state.value.codeTheme);
    saveState(state.value);
  };

  return {
    state,
    init,
    patch,
    setCodeTheme,
    reset
  };
}

export type { CodeThemeTokens, LiveCustomizationState };
