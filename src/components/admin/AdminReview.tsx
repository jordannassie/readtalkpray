"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Application = {
  id: string;
  leader_name: string;
  email: string | null;
  phone: string;
  city: string;
  state: string | null;
  country: string;
  location_type: string;
  meeting_location: string;
  meeting_day: string | null;
  meeting_time: string | null;
  description: string | null;
  status: string;
};

type JoinRequest = {
  id: string;
  first_name: string;
  phone: string;
  email: string | null;
  status: string;
  address_shared: boolean;
  group_id: string;
};

export function AdminReview({
  applications,
  requests,
}: {
  applications: Application[];
  requests: JoinRequest[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const pending = applications.filter((item) => item.status === "pending");

  async function decide(id: string, decision: "approve" | "reject") {
    setBusy(id);
    setError("");
    const response = await fetch("/api/admin/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    const body = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok) {
      setError(body.error || "That update did not save.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {error ? <p className="rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm text-[#9a3412]">{error}</p> : null}
      <section>
        <h2 className="text-xl font-semibold">Pending groups</h2>
        {pending.length === 0 ? <p className="mt-3 text-sm text-[#666]">No groups are waiting for review.</p> : null}
        <ul className="mt-4 space-y-3">
          {pending.map((item) => (
            <li key={item.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="font-semibold">{item.leader_name}</p>
              <p className="mt-1 text-sm text-[#555]">
                {[item.city, item.state, item.country].filter(Boolean).join(", ")} · {item.location_type.replace("_", " ")}
              </p>
              <p className="mt-1 text-sm text-[#555]">
                {item.meeting_location} · {[item.meeting_day, item.meeting_time].filter(Boolean).join(" ")}
              </p>
              <p className="mt-1 text-sm">{item.email} · {item.phone}</p>
              {item.description ? <p className="mt-2 text-sm text-[#444]">{item.description}</p> : null}
              <div className="mt-4 flex gap-2">
                <button type="button" disabled={busy === item.id} onClick={() => void decide(item.id, "approve")} className="rounded-full bg-[var(--sending-blue)] px-4 py-2 text-sm font-semibold text-white">
                  Approve
                </button>
                <button type="button" disabled={busy === item.id} onClick={() => void decide(item.id, "reject")} className="rounded-full border border-black/10 px-4 py-2 text-sm">
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Join requests</h2>
        {requests.length === 0 ? <p className="mt-3 text-sm text-[#666]">No join requests yet.</p> : null}
        <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white">
          {requests.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{item.first_name} · {item.phone}{item.email ? ` · ${item.email}` : ""}</span>
              <span className="text-[#666]">{item.status}{item.address_shared ? " · address shared" : ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
