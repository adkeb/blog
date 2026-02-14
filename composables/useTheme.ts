type ThemeMode = "light" | "dark";

const STORAGE_KEY = "blog-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function getSystemTheme(): ThemeMode {
  if (!import.meta.client) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode): void {
  if (!import.meta.client) {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const theme = useState<ThemeMode>("theme-mode", () => "light");
  const initialized = useState<boolean>("theme-mode-initialized", () => false);

  const initTheme = () => {
    if (!import.meta.client || initialized.value) {
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    const resolved = isThemeMode(saved) ? saved : getSystemTheme();
    theme.value = resolved;
    applyTheme(resolved);
    initialized.value = true;
  };

  const setTheme = (value: ThemeMode) => {
    theme.value = value;
    applyTheme(value);
    if (import.meta.client) {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const toggleTheme = () => {
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme
  };
}
