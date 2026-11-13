"use client";

import { useEffect, useState } from "react";

type AccountUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  photo_url: string | null;
  is_admin: boolean;
  group_names: string | null;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<AccountUser | null>(null);
  const [confirm, setConfirm] = useState("");

  async function load() {
    const response = await fetch("/api/admin/users");
    const body = (await response.json()) as { ok?: boolean; users?: AccountUser[]; error?: string };
    if (!response.ok || !body.ok) {
      setMessage(body.error || "Users could not be loaded.");
      return;
    }
    setUsers(body.users ?? []);
    setMessage("");
  }

  useEffect(() => {
    void load();
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = users.filter((user) => {
    if (!needle) return true;
    return `${user.full_name ?? ""} ${user.email ?? ""}`.toLowerCase().includes(needle);
  });

  async function remove(user: AccountUser) {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: user.user_id, confirm }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string; notice?: string | null };
    if (!response.ok || !body.ok) {
      setMessage(body.error || "That user was not deleted.");
      return;
    }
    setMessage(body.notice || "That Read Talk Pray account was deleted.");
    setSelected(null);
    setConfirm("");
    await load();
  }

  return (
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Users</h2>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name or email"
        className="mt-3 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3 text-sm"
      />
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
      <ul className="mt-4 space-y-3">
        {visible.map((user) => (
          <li key={user.user_id} className="flex items-center gap-3 rounded-2xl border border-black/5 p-3">
            {user.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7f0ff] font-semibold text-[#1976F3]">
                {(user.full_name || user.email || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.full_name || "No name"}</span>
              <span className="block truncate text-xs text-[#666]">{user.email}</span>
              <span className="block text-xs text-[#666]">{user.is_admin ? "Admin" : "Member"}{user.group_names ? ` · ${user.group_names}` : ""}</span>
            </span>
            <button type="button" onClick={() => { setSelected(user); setConfirm(""); }} className="text-sm font-semibold text-[#1976F3]">
              View
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h3 className="text-xl font-semibold">{selected.full_name || "Account"}</h3>
            <p className="mt-2 text-sm">{selected.email}</p>
            <p className="mt-1 text-sm text-[#555]">{selected.is_admin ? "Admin" : "Member"}</p>
            <p className="mt-1 text-sm text-[#555]">{selected.group_names || "No groups"}</p>
            <p className="mt-3 text-sm leading-relaxed">Deleting removes this person&apos;s Read Talk Pray profile, applications, photos, and groups they lead. A shared Sending Church login is not deleted. The main administrator cannot be removed.</p>
            <label className="mt-4 block text-sm font-medium">
              Type DELETE
              <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={confirm !== "DELETE"} onClick={() => void remove(selected)} className="inline-flex h-11 items-center rounded-full bg-[#e10600] px-4 text-sm font-semibold text-white disabled:opacity-50">
                Delete user
              </button>
              <button type="button" onClick={() => setSelected(null)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
