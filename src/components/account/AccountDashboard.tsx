"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Profile = { user_id: string; full_name: string | null; phone: string | null; photo_url: string | null };
type Application = { id: string; status: string; review_message: string | null; group_name: string | null; city: string; created_at: string };
type Group = { id: string; name: string; description: string | null; public_location: string; meeting_day: string | null; meeting_time: string | null; leader_name: string; city: string; status: string };
type RequestRow = { id: string; group_id: string; first_name: string; phone: string; status: string; created_at: string };
type Detail = { group_id: string; address: string | null };
type LocationChange = { id: string; group_id: string; public_location: string; status: string; created_at: string };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  paused: "Paused",
};

export function AccountDashboard({
  profile,
  email,
  isAdmin,
  applications,
  groups,
  requests,
  details,
  locationChanges,
  focus = "all",
}: {
  profile: Profile;
  email: string;
  isAdmin: boolean;
  applications: Application[];
  groups: Group[];
  requests: RequestRow[];
  details: Detail[];
  locationChanges: LocationChange[];
  focus?: "all" | "home" | "group" | "me";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const application = applications[0] ?? null;
  const status = groups.some((group) => group.status === "suspended")
    ? "suspended"
    : groups.some((group) => group.status === "paused")
      ? "paused"
      : application?.status ?? "none";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let photoUrl = profile.photo_url;
    const file = form.get("photo");
    if (file instanceof File && file.size > 0 && isSupabaseConfigured()) {
      if (file.size > 2_000_000) {
        setMessage("Use a photo under 2 MB.");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `profiles/${profile.user_id}/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("rtp-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (!error) photoUrl = supabase.storage.from("rtp-photos").getPublicUrl(path).data.publicUrl;
    }
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), phone: form.get("phone"), photoUrl }),
    });
    const body = (await response.json()) as { error?: string };
    setMessage(response.ok ? "Account saved." : body.error || "Account changes did not save.");
    if (response.ok) router.refresh();
  }

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
      }),
    });
    setMessage(response.ok ? "Group saved." : "That group update did not save.");
    if (response.ok) router.refresh();
  }

  async function setStatus(id: string, action: "pause" | "resume") {
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    setMessage(response.ok ? (action === "pause" ? "Group paused." : "Group is active again.") : "That status did not change.");
    if (response.ok) router.refresh();
  }

  async function requestLocation(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "location",
        id,
        publicLocation: form.get("publicLocation"),
        privateAddress: form.get("privateAddress"),
      }),
    });
    setMessage(response.ok ? "Location change sent for review. The public location stays the same until an admin approves it." : "That location change did not save.");
    if (response.ok) router.refresh();
  }

  async function share(id: string) {
    const url = `${window.location.origin}/groups/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Group link copied.");
    } catch {
      setMessage(url);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {isAdmin && focus !== "me" ? <Link href="/app/admin" className="inline-flex min-h-12 items-center text-sm font-semibold text-[#1976F3]">Open admin review</Link> : null}
      {message ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{message}</p> : null}

      {focus === "home" || focus === "all" ? <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e7f0ff] text-lg font-semibold text-[#1976F3]">
              {(profile.full_name || email).slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#1976F3]">APPLICATION STATUS</p>
            <p className="mt-1 text-2xl font-semibold">{status === "none" ? "No Application" : STATUS_LABEL[status] ?? status}</p>
          </div>
        </div>
        {status === "none" ? (
          <p className="mt-4 text-sm leading-relaxed text-[#444]">
            You have not applied to start a group. <Link href="/app/start" className="font-semibold text-[#1976F3]">Start a group</Link>
          </p>
        ) : null}
        {status === "pending" ? (
          <p className="mt-4 text-sm leading-relaxed text-[#444]">Your application is being reviewed. Our team will contact you before your group is approved.</p>
        ) : null}
        {status === "changes_requested" ? (
          <p className="mt-4 text-sm leading-relaxed text-[#444]">
            {application?.review_message || "A reviewer asked for changes."} <Link href="/app/start" className="font-semibold text-[#1976F3]">Update the application</Link>
          </p>
        ) : null}
        {status === "rejected" ? <p className="mt-4 text-sm leading-relaxed text-[#444]">{application?.review_message || "This application was not approved."}</p> : null}
        {status === "suspended" ? <p className="mt-4 text-sm leading-relaxed text-[#444]">This group is suspended and hidden from the public map.</p> : null}
      </section> : null}

      {focus === "group" || focus === "all" ? groups.length === 0 ? (
        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">My Group</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#444]">You do not have a group yet. An application stays pending until an admin approves it.</p>
          <Link href="/app/start" className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">Start a group</Link>
        </section>
      ) : groups.map((group) => {
        const detail = details.find((item) => item.group_id === group.id);
        const people = requests.filter((item) => item.group_id === group.id);
        const pendingLocation = locationChanges.find((item) => item.group_id === group.id && item.status === "pending");
        return (
          <section key={group.id} className="rounded-[28px] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{group.name}</h2>
              <span className="rounded-full bg-[#e7f0ff] px-3 py-1 text-xs font-semibold text-[#1976F3]">{STATUS_LABEL[group.status] ?? group.status}</span>
            </div>
            <p className="mt-2 text-sm text-[#555]">{group.public_location} · {[group.meeting_day, group.meeting_time].filter(Boolean).join(" · ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.status === "approved" ? (
                <Link href={`/groups/${group.id}`} className="rounded-full border border-black/10 px-4 py-2 text-sm">View public page</Link>
              ) : (
                <span className="rounded-full bg-[#f6f6f6] px-4 py-2 text-sm text-[#666]">Hidden from the public map</span>
              )}
              <button type="button" onClick={() => void share(group.id)} className="rounded-full border border-black/10 px-4 py-2 text-sm">Share group</button>
              {group.status === "approved" ? (
                <button type="button" onClick={() => void setStatus(group.id, "pause")} className="rounded-full border border-black/10 px-4 py-2 text-sm">Pause group</button>
              ) : null}
              {group.status === "paused" ? (
                <button type="button" onClick={() => void setStatus(group.id, "resume")} className="rounded-full bg-[#1976F3] px-4 py-2 text-sm font-semibold text-white">Resume group</button>
              ) : null}
            </div>
            <form className="mt-5 space-y-3" onSubmit={(event) => void saveGroup(event, group.id)}>
              <label className="block text-sm font-medium">Group name<input name="name" defaultValue={group.name} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">Day<input name="meetingDay" defaultValue={group.meeting_day ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
                <label className="block text-sm font-medium">Time<input name="meetingTime" defaultValue={group.meeting_time ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
              </div>
              <label className="block text-sm font-medium">Description<textarea name="description" defaultValue={group.description ?? ""} rows={3} className="mt-1 w-full rounded-2xl border border-[#e6e6e6] px-3 py-2" /></label>
              <button type="submit" className="rounded-full bg-[#1976F3] px-4 py-2 text-sm font-semibold text-white">Save group</button>
            </form>
            <form className="mt-5 space-y-3 border-t border-black/5 pt-5" onSubmit={(event) => void requestLocation(event, group.id)}>
              <h3 className="font-semibold">Edit public location</h3>
              <p className="text-sm text-[#666]">The current public location stays visible until an admin approves a change. A home address is not published.</p>
              <p className="text-sm">Current public location: {group.public_location}</p>
              {detail?.address ? <p className="text-sm text-[#444]">Private address on file: {detail.address}</p> : null}
              {pendingLocation ? <p className="text-sm text-[#9a3412]">Pending review: {pendingLocation.public_location}</p> : null}
              <label className="block text-sm font-medium">Proposed public location<input name="publicLocation" required className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
              <label className="block text-sm font-medium">Private address, if it changed<input name="privateAddress" className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
              <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-sm">Submit location change</button>
            </form>
            <div className="mt-5 border-t border-black/5 pt-5">
              <h3 className="font-semibold">Interested people</h3>
              {people.length === 0 ? <p className="mt-2 text-sm text-[#666]">No one has asked to join yet.</p> : null}
              <ul className="mt-3 space-y-2">
                {people.map((person) => (
                  <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>{person.first_name} · {person.status}</span>
                    <a href={`tel:${person.phone}`} className="font-semibold text-[#1976F3]">{person.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      }) : null}

      {focus === "me" || focus === "all" ? <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Account settings</h2>
        <form className="mt-4 space-y-3" onSubmit={(event) => void saveProfile(event)}>
          <label className="block text-sm font-medium">Full name<input name="fullName" defaultValue={profile.full_name ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
          <label className="block text-sm font-medium">Email<input value={email} readOnly className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-3" /></label>
          <label className="block text-sm font-medium">Phone<input name="phone" defaultValue={profile.phone ?? ""} autoComplete="tel" className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
          <label className="block text-sm font-medium">Profile photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block text-sm" /></label>
          <button type="submit" className="inline-flex h-12 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">Save account</button>
        </form>
      </section> : null}
    </div>
  );
}
