import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { safeAppReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = { title: "Sign in · Read Talk Pray" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeAppReturnPath(params.next ?? null) ?? "/app";
  const mode = params.mode === "reset" ? "reset" : "signin";
  const notice =
    params.error === "google"
      ? "Google sign-in did not finish. Approved testers can try again. Other Google accounts cannot sign in while Google authentication is in testing."
      : params.error === "auth"
        ? "That sign-in link is invalid or has expired. Request a new one."
        : "";

  return <LoginForm nextPath={nextPath} mode={mode} notice={notice} />;
}
