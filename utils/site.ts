export function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function toAbsoluteUrl(baseUrl: string, path: string): string {
  const base = stripTrailingSlash(baseUrl);
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function escapeXml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

