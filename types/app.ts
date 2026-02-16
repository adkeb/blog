export interface AppItem {
  title: string;
  slug: string;
  description: string;
  url: string;
  date: string;
  updated?: string;
  tags: string[];
  category: string;
  status: "online" | "private" | "offline";
  order: number;
  cover?: string;
  draft?: boolean;
  lang?: string;
}
