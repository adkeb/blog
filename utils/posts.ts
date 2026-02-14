import type {
  BaseContentItem,
  ChapterItem,
  ChapterPostItem,
  FeedItem,
  PostItem
} from "~/types/post";

function toTimestamp(input?: string): number {
  if (!input) {
    return 0;
  }
  const value = +new Date(input);
  return Number.isFinite(value) ? value : 0;
}

export function sortPostsDesc<T extends BaseContentItem>(posts: T[]): T[] {
  return [...posts].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
}

export function filterByVisibility<T extends BaseContentItem>(posts: T[], showDrafts: boolean): T[] {
  if (showDrafts) {
    return posts;
  }
  return posts.filter((post) => !post.draft);
}

export function extractTags(posts: Array<Pick<BaseContentItem, "tags">>): string[] {
  const allTags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      allTags.add(tag);
    }
  }
  return [...allTags].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function getPostUrl(slug: string): string {
  return `/posts/${encodeURIComponent(slug)}`;
}

export function getChapterUrl(chapterSlug: string): string {
  return `/chapters/${encodeURIComponent(chapterSlug)}`;
}

export function getChapterPostUrl(chapterSlug: string, postSlug: string): string {
  return `${getChapterUrl(chapterSlug)}/${encodeURIComponent(postSlug)}`;
}

export function getChapterDirectoryFromPath(path?: string): string | null {
  if (!path) {
    return null;
  }
  const parts = path.split("/").filter(Boolean);
  if (parts[0] !== "chapter-posts" || parts.length < 3) {
    return null;
  }
  return parts[1] || null;
}

export function assertChapterPostDirectory(post: ChapterPostItem): void {
  const directorySlug = getChapterDirectoryFromPath(post.path || post._path);
  if (!directorySlug) {
    throw new Error(`Chapter post "${post.slug}" must be under /content/chapter-posts/<chapterSlug>/`);
  }
  if (directorySlug !== post.chapterSlug) {
    throw new Error(
      `Chapter post "${post.slug}" has chapterSlug="${post.chapterSlug}" but file directory is "${directorySlug}".`
    );
  }
}

export function sortChapterChildren(posts: ChapterPostItem[]): ChapterPostItem[] {
  return [...posts].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return toTimestamp(b.date) - toTimestamp(a.date);
  });
}

export function buildUnifiedFeed(input: {
  posts: PostItem[];
  chapters: ChapterItem[];
  chapterPosts: ChapterPostItem[];
  showDrafts: boolean;
}): FeedItem[] {
  const posts = filterByVisibility(input.posts, input.showDrafts);
  const chapters = filterByVisibility(input.chapters, input.showDrafts);
  const chapterPosts = filterByVisibility(input.chapterPosts, input.showDrafts);

  const allChapterMap = new Map<string, ChapterItem>();
  for (const chapter of input.chapters) {
    allChapterMap.set(chapter.slug, chapter);
  }

  const visibleChapterMap = new Map<string, ChapterItem>();
  for (const chapter of chapters) {
    visibleChapterMap.set(chapter.slug, chapter);
  }

  const postItems: FeedItem[] = posts.map((post) => ({
    ...post,
    kind: "post",
    url: getPostUrl(post.slug)
  }));

  const chapterItems: FeedItem[] = chapters.map((chapter) => ({
    ...chapter,
    kind: "chapter",
    url: getChapterUrl(chapter.slug)
  }));

  const chapterPostItems: FeedItem[] = [];
  for (const post of chapterPosts) {
    assertChapterPostDirectory(post);

    const existedChapter = allChapterMap.get(post.chapterSlug);
    if (!existedChapter) {
      throw new Error(
        `Chapter post "${post.slug}" references missing chapter "${post.chapterSlug}".`
      );
    }

    const visibleChapter = visibleChapterMap.get(post.chapterSlug);
    if (!visibleChapter) {
      continue;
    }

    chapterPostItems.push({
      ...post,
      kind: "chapter_post",
      chapterTitle: visibleChapter.title,
      url: getChapterPostUrl(post.chapterSlug, post.slug)
    });
  }

  return [...postItems, ...chapterItems, ...chapterPostItems].sort(
    (a, b) => toTimestamp(b.date) - toTimestamp(a.date)
  );
}
