"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function rememberNext(path: string) {
  document.cookie = `rtp_auth_next=${encodeURIComponent(path)}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function LoginForm({
  nextPath,
  mode,
  notice,
}: {
  nextPath: string;
  mode: "signin" | "signup" | "reset";
  notice: string;
}) {
  const [message, setMessage] = useState(notice);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function callbackUrl() {
    return `${window.location.origin}/auth/callback`;
  }

  async function continueWithGoogle() {
    if (!isSupabaseConfigured()) {
      setMessage("Sign-in needs the Supabase URL and anon key.");
      return;
    }
    setBusy(true);
    setMessage("");
    rememberNext(nextPath);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      setBusy(false);
      setMessage("Google sign-in did not start. If this account is not an approved tester yet, Google will refuse the login while the app is in testing.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage("Sign-in needs the Supabase URL and anon key.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    if (!email) {
      setMessage("Enter your email.");
      return;
    }
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    rememberNext(mode === "reset" ? "/login/update-password" : nextPath);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl() });
      setBusy(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setSent(true);
      setMessage("If this email can receive mail, a password reset link is on its way.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setBusy(false);
        setMessage("Use a password of at least 8 characters.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl(),
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (data.session) {
        window.location.assign(nextPath);
        return;
      }
      setSent(true);
      setMessage("Check your email to confirm the account, then sign in.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    window.location.assign(nextPath);
  }

  const title = mode === "signup" ? "Create an account" : mode === "reset" ? "Reset your password" : "Sign in";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[#eee] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
        <Logo width={84} />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#666]">
          Sign in to start a group or open your dashboard. Google sign-in is limited to approved testers while Google authentication is in testing.
        </p>
        {mode !== "reset" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void continueWithGoogle()}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-[#e6e6e6] bg-white px-5 py-3.5 text-sm font-medium hover:bg-[#fafafa] disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === "signup" ? (
            <label className="block text-sm font-medium">
              Full name
              <input name="fullName" autoComplete="name" className="mt-1 h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4" />
            </label>
          ) : null}
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="email" className="mt-1 h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4" />
          </label>
          {mode !== "reset" ? (
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="mt-1 h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4" />
            </label>
          ) : null}
          <button type="submit" disabled={busy || sent} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1976F3] text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Working…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in with email"}
          </button>
        </form>
        {message ? <p className="mt-4 text-center text-sm text-[#9a3412]">{message}</p> : null}
        <p className="mt-6 text-center text-sm text-[#555]">
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline">Terms of Use</Link>
        </p>
        <div className="mt-3 flex flex-col gap-2 text-center text-sm text-[#555]">
          {mode !== "signin" ? <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link> : null}
          {mode !== "signup" ? <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create an account</Link> : null}
          {mode !== "reset" ? <Link href={`/login?mode=reset&next=${encodeURIComponent(nextPath)}`}>Forgot password</Link> : null}
        </div>
      </div>
    </div>
  );
}
