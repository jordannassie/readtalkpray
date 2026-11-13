"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string; notice?: string | null; authRemoved?: boolean };
    if (!response.ok || !body.ok) {
      setBusy(false);
      setMessage(body.error || "The account was not deleted.");
      return;
    }
    const notice = body.notice || (body.authRemoved ? "Your Read Talk Pray data and login were removed." : "Your Read Talk Pray data was removed.");
    setDone(notice);
    setBusy(false);
  }

  async function finish() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <section className="mt-4 rounded-[28px] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Delete My Account</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">Permanently remove your Read Talk Pray profile, applications, photos, and groups you lead.</p>
      <button type="button" onClick={() => setOpen(true)} className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-[#e10600] px-5 text-sm font-semibold text-white">
        Delete My Account
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-3xl bg-white p-6">
            <h3 id="delete-account-title" className="text-xl font-semibold">Delete this account?</h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[#444]">
              <p>This permanently deletes your Read Talk Pray profile, group applications, uploaded photos, and groups you lead, including interested-person details on those groups.</p>
              <p>If this same login is also used for Sending Church, that other app&apos;s data and login stay in place. Read Talk Pray data is still removed.</p>
              <p>Sign in again if it has been more than 15 minutes. Type DELETE to confirm. This is not a deactivation.</p>
            </div>
            <label className="mt-4 block text-sm font-medium">
              Type DELETE
              <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
            </label>
            {message ? <p className="mt-3 text-sm text-[#9a3412]">{message}</p> : null}
            {done ? <p className="mt-3 text-sm">{done}</p> : null}
            <div className="mt-4 flex gap-2">
              {done ? (
                <button type="button" onClick={() => void finish()} className="inline-flex h-11 items-center justify-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">
                  Return to the website
                </button>
              ) : (
                <button type="button" disabled={busy || confirm !== "DELETE"} onClick={() => void remove()} className="inline-flex h-11 items-center justify-center rounded-full bg-[#e10600] px-4 text-sm font-semibold text-white disabled:opacity-50">
                  {busy ? "Deleting…" : "Delete permanently"}
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
