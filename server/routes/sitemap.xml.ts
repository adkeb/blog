import { getVisiblePosts } from "~/server/utils/content";
import { extractTags } from "~/utils/posts";
import { escapeXml, stripTrailingSlash, toAbsoluteUrl } from "~/utils/site";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = stripTrailingSlash(config.public.siteUrl);
  const posts = await getVisiblePosts(event);
  const tags = extractTags(posts);

  const staticPaths = ["/", "/posts", "/about", "/search"];
  const urls = new Set<string>();

  for (const path of staticPaths) {
    urls.add(toAbsoluteUrl(siteUrl, path));
  }

  for (const post of posts) {
    urls.add(toAbsoluteUrl(siteUrl, `/posts/${encodeURIComponent(post.slug)}`));
  }

  for (const tag of tags) {
    urls.add(toAbsoluteUrl(siteUrl, `/tags/${encodeURIComponent(tag)}`));
  }

  const body = [...urls]
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return xml;
});

