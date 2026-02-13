export interface PostItem {
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
  body?: unknown;
}

