"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (password.length < 8) {
      setMessage("Use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
        <label className="mt-6 block text-sm font-medium">
          New password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 h-12 w-full rounded-2xl border border-[#e6e6e6] px-4" />
        </label>
        {message ? <p className="mt-4 text-sm text-[#9a3412]">{message}</p> : null}
        <button type="submit" disabled={busy} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1976F3] font-semibold text-white disabled:opacity-60">
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
    </main>
  );
}
