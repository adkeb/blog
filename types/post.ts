export type ContentKind = "post" | "chapter" | "chapter_post";

export interface BaseContentItem {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  category: string;
  cover?: string;
  draft?: boolean;
  toc?: boolean;
  lang?: string;
  path?: string;
  _path?: string;
  body?: unknown;
}

export interface PostItem extends BaseContentItem {
  kind?: "post";
}

export interface ChapterItem extends BaseContentItem {
  kind?: "chapter";
}

export interface ChapterPostItem extends BaseContentItem {
  kind?: "chapter_post";
  chapterSlug: string;
  order: number;
  legacySlugs?: string[];
}

export interface FeedItem extends BaseContentItem {
  kind: ContentKind;
  url: string;
  chapterSlug?: string;
  chapterTitle?: string;
  order?: number;
  legacySlugs?: string[];
}
