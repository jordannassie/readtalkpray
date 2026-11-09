"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LoginForm({
  nextPath,
  googleError,
}: {
  nextPath: string;
  googleError: boolean;
}) {
  const [message, setMessage] = useState(
    googleError ? "Google sign-in did not finish. Try again." : "",
  );
  const [busy, setBusy] = useState(false);

  async function continueWithGoogle() {
    if (!isSupabaseConfigured()) {
      setMessage("Google sign-in needs NEXT_PUBLIC_SUPABASE_URL and the anon key.");
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setBusy(false);
      setMessage(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sending-bg)] px-5">
      <div className="w-full max-w-md rounded-[28px] border border-[#eee] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
        <Logo />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Read Talk Pray</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#666]">
          Sign in with Google to open your group or the lead tools.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void continueWithGoogle()}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-[#e6e6e6] bg-white px-5 py-3.5 text-sm font-medium hover:bg-[#fafafa] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.79Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.95-2.94l-3.88-3c-1.08.73-2.47 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.26A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.55.38-2.26V6.65H1.27A12 12 0 0 0 0 12c0 1.94.46 3.78 1.27 5.35l4-3.09Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.14 15.23 0 12 0 7.31 0 3.23 2.69 1.27 6.65l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
            />
          </svg>
          Continue with Google
        </button>
        {message ? <p className="mt-4 text-center text-sm text-[#9a3412]">{message}</p> : null}
        <p className="mt-5 text-center text-xs text-[#999]">
          Leaders use the email from their group application. Leads stay limited to admins.
        </p>
      </div>
    </div>
  );
}
