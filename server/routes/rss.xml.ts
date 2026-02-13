import { getVisiblePosts } from "~/server/utils/content";
import { escapeXml, stripTrailingSlash, toAbsoluteUrl } from "~/utils/site";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = stripTrailingSlash(config.public.siteUrl);
  const posts = await getVisiblePosts(event);

  const items = posts
    .map((post) => {
      const link = toAbsoluteUrl(siteUrl, `/posts/${encodeURIComponent(post.slug)}`);
      const description = escapeXml(post.description || "");
      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${description}</description>
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

