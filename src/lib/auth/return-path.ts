const APP_PATHS = new Set([
  "/app",
  "/app/groups",
  "/app/start",
  "/app/group",
  "/app/me",
  "/app/admin",
  "/dashboard",
  "/start",
  "/admin",
  "/leader",
  "/csv",
  "/dashboard/leads",
  "/login/update-password",
]);

export function safeAppReturnPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) return null;
  const [path, query] = value.split("#")[0]?.split("?") ?? [];
  if (!path || !APP_PATHS.has(path) || path.includes("..")) return null;
  if (!query) return path;
  const incoming = new URLSearchParams(query);
  const kept = new URLSearchParams();
  for (const key of path === "/app/start" ? ["application", "group"] : path === "/app/group" ? ["id"] : []) {
    const item = incoming.get(key);
    if (item && /^[0-9a-f-]{36}$/i.test(item)) kept.set(key, item);
  }
  const suffix = kept.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function safeLeadsReturnPath(value: string | null) {
  return safeAppReturnPath(value);
}

export function publicRequestOrigin(request: Request) {
  const current = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.split(",")[0]?.trim();
  if (host && host !== current.host && !host.endsWith(".netlify.app")) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  const primary = process.env.URL;
  if (process.env.CONTEXT === "production" && primary && current.hostname.endsWith(".netlify.app")) {
    return new URL(primary).origin;
  }
  return current.origin;
}
