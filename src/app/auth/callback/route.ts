import { NextResponse } from "next/server";
import { publicRequestOrigin, safeAppReturnPath } from "@/lib/auth/return-path";
import { createClient } from "@/lib/supabase/server";

function cookieValue(header: string | null, name: string) {
  if (!header) return null;
  const found = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!found) return null;
  try {
    return decodeURIComponent(found.slice(name.length + 1));
  } catch {
    return null;
  }
}

function clearNext(response: NextResponse) {
  response.cookies.set("rtp_auth_next", "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = publicRequestOrigin(request);
  const code = url.searchParams.get("code");
  const next =
    safeAppReturnPath(cookieValue(request.headers.get("cookie"), "rtp_auth_next")) ??
    safeAppReturnPath(url.searchParams.get("next")) ??
    "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return clearNext(NextResponse.redirect(new URL(next, origin)));
    }
  }

  const login = new URL("/login", origin);
  const providerError = url.searchParams.get("error") ?? "";
  const description = (url.searchParams.get("error_description") ?? "").toLowerCase();
  login.searchParams.set("error", providerError === "access_denied" || description.includes("google") ? "google" : "auth");
  return clearNext(NextResponse.redirect(login));
}
