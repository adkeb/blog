import { stripTrailingSlash, toAbsoluteUrl } from "~/utils/site";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = stripTrailingSlash(config.public.siteUrl);

  const body = `User-agent: *
Allow: /

User-agent: *
Disallow: /admin/

Sitemap: ${toAbsoluteUrl(siteUrl, "/sitemap.xml")}
`;

  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return body;
});

