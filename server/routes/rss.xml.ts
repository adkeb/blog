import { getVisibleFeed } from "~/server/utils/content";
import { escapeXml, stripTrailingSlash, toAbsoluteUrl } from "~/utils/site";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = stripTrailingSlash(config.public.siteUrl);
  const feed = await getVisibleFeed(event);

  const items = feed
    .map((item) => {
      const link = toAbsoluteUrl(siteUrl, item.url);
      const description = escapeXml(item.description || "");
      return `
  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <description>${description}</description>
    <category>${escapeXml(item.kind)}</category>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Personal Blog</title>
    <link>${siteUrl}</link>
    <description>个人技术博客 RSS</description>
    <language>zh-cn</language>
${items}
  </channel>
</rss>`;

  setHeader(event, "content-type", "application/rss+xml; charset=utf-8");
  return xml;
});
