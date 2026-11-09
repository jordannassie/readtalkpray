"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Group = {
  id: string;
  name: string;
  description: string | null;
  public_location: string;
  meeting_day: string | null;
  meeting_time: string | null;
  leader_name: string;
  city: string;
};

type RequestRow = {
  id: string;
  group_id: string;
  first_name: string;
  phone: string;
  email: string | null;
  status: string;
  address_shared: boolean;
};

type Detail = { group_id: string; address: string | null; leader_email: string | null };

export function LeaderHome({
  groups,
  requests,
  details,
}: {
  groups: Group[];
  requests: RequestRow[];
  details: Detail[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function saveGroup(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id,
        name: form.get("name"),
        description: form.get("description"),
        meetingDay: form.get("meetingDay"),
        meetingTime: form.get("meetingTime"),
        publicLocation: form.get("publicLocation"),
      }),
    });
    setMessage(response.ok ? "Saved." : "That update did not save.");
    if (response.ok) router.refresh();
  }

  async function mark(requestId: string, addressShared: boolean) {
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "request",
        requestId,
        status: "contacted",
        addressShared,
      }),
    });
    setMessage(response.ok ? "Updated." : "That update did not save.");
    if (response.ok) router.refresh();
  }

  if (groups.length === 0) {
    return (
      <p className="mt-8 rounded-3xl bg-white p-6 text-sm leading-relaxed text-[#444]">
        No group is linked to this email yet. After your application is approved, sign in with the same email address you used on the form.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {message ? <p className="text-sm text-[#166]">{message}</p> : null}
      {groups.map((group) => {
        const detail = details.find((item) => item.group_id === group.id);
        const people = requests.filter((item) => item.group_id === group.id);
        return (
          <section key={group.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <form className="space-y-3" onSubmit={(event) => void saveGroup(event, group.id)}>
              <label className="block text-sm font-medium">
                Group name
                <input name="name" defaultValue={group.name} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
              </label>
              <label className="block text-sm font-medium">
                Public location
                <input name="publicLocation" defaultValue={group.public_location} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Day
                  <input name="meetingDay" defaultValue={group.meeting_day ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
                </label>
                <label className="block text-sm font-medium">
                  Time
                  <input name="meetingTime" defaultValue={group.meeting_time ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Description
                <textarea name="description" defaultValue={group.description ?? ""} rows={3} className="mt-1 w-full rounded-2xl border border-[#e6e6e6] px-3 py-2" />
              </label>
              <button type="submit" className="rounded-full bg-[var(--sending-blue)] px-4 py-2 text-sm font-semibold text-white">
                Save group
              </button>
            </form>
            {detail?.address ? (
              <p className="mt-4 text-sm text-[#444]">
                Private address, visible only to you: <strong>{detail.address}</strong>
              </p>
            ) : null}
            <h2 className="mt-6 font-semibold">People who want to join</h2>
            {people.length === 0 ? <p className="mt-2 text-sm text-[#666]">No requests yet.</p> : null}
            <ul className="mt-3 space-y-2">
              {people.map((person) => (
                <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f6f8fb] px-3 py-3 text-sm">
                  <span>
                    {person.first_name} · <button type="button" className="text-[var(--sending-blue)]" onClick={() => void navigator.clipboard.writeText(person.phone)}>{person.phone}</button>
                    {person.email ? ` · ${person.email}` : ""}
                  </span>
                  <button type="button" className="rounded-full border border-black/10 px-3 py-1" onClick={() => void mark(person.id, true)}>
                    {person.address_shared ? "Address shared" : "Mark address shared"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
