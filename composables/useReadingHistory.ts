import type { ContentKind } from "~/types/post";

interface ReadingHistoryItem {
  url: string;
  title: string;
  kind: ContentKind;
  category?: string;
  chapterSlug?: string;
  chapterTitle?: string;
  visitedAt: string;
}

const STORAGE_KEY = "blog-reading-history-v1";
const MAX_ITEMS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHistoryItem(value: unknown): value is ReadingHistoryItem {
  if (!isRecord(value)) {
    return false;
  }

  const kind = value.kind;
  return (
    typeof value.url === "string" &&
    typeof value.title === "string" &&
    (kind === "post" || kind === "chapter" || kind === "chapter_post") &&
    typeof value.visitedAt === "string"
  );
}

function parseHistory(raw: string | null): ReadingHistoryItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isHistoryItem);
  } catch {
    return [];
  }
}

function saveHistory(items: ReadingHistoryItem[]): void {
  if (!import.meta.client) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useReadingHistory() {
  const items = useState<ReadingHistoryItem[]>("reading-history-items", () => []);
  const initialized = useState<boolean>("reading-history-initialized", () => false);

  const init = () => {
    if (!import.meta.client || initialized.value) {
      return;
    }

    items.value = parseHistory(window.localStorage.getItem(STORAGE_KEY));
    initialized.value = true;
  };

  const touch = (input: Omit<ReadingHistoryItem, "visitedAt">) => {
    if (!import.meta.client) {
      return;
    }

    init();

    const now = new Date().toISOString();
    const nextItem: ReadingHistoryItem = {
      ...input,
      visitedAt: now
    };

    const merged = [nextItem, ...items.value.filter((item) => item.url !== input.url)].slice(0, MAX_ITEMS);
    items.value = merged;
    saveHistory(merged);
  };

  const remove = (url: string) => {
    if (!import.meta.client) {
      return;
    }

    init();
    const next = items.value.filter((item) => item.url !== url);
    items.value = next;
    saveHistory(next);
  };

  const clear = () => {
    if (!import.meta.client) {
      return;
    }

    items.value = [];
    saveHistory([]);
  };

  return {
    items: readonly(items),
    init,
    touch,
    remove,
    clear
  };
}
