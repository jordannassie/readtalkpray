"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { publicLocationLabel } from "@/lib/groups/geo";
import type { OwnedApplication, PublicGroup } from "@/lib/groups/types";

type Profile = { user_id: string; full_name: string | null; phone: string | null; photo_url: string | null };
type Application = OwnedApplication;
type Group = {
  id: string;
  name: string;
  description: string | null;
  public_location: string;
  meeting_day: string | null;
  meeting_time: string | null;
  duration?: string | null;
  leader_name: string;
  leader_photo_url?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  location_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
};
type RequestRow = { id: string; group_id: string; first_name: string; phone: string; status: string; created_at: string };
type Detail = { group_id: string; address: string | null };
type LocationChange = { id: string; group_id: string; public_location: string; status: string; created_at: string };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Approval",
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
  googlePhotoUrl = null,
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
  googlePhotoUrl?: string | null;
  applications: Application[];
  groups: Group[];
  requests: RequestRow[];
  details: Detail[];
  locationChanges: LocationChange[];
  focus?: "all" | "home" | "group" | "me";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const managed = groups.find((item) => item.status === "approved") ?? groups.find((item) => item.status !== "rejected") ?? groups[0] ?? null;
  const application = applications.find((item) => item.status === "pending" || item.status === "changes_requested") ?? applications[0] ?? null;
  const openApplication = application && (application.status === "pending" || application.status === "changes_requested") ? application : null;
  const status = groups.some((group) => group.status === "suspended")
    ? "suspended"
    : groups.some((group) => group.status === "paused")
      ? "paused"
      : application?.status ?? "none";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), phone: form.get("phone"), photoUrl: profile.photo_url }),
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

      {focus === "home" || focus === "all" ? (
        <HomeGroupCard
          status={status}
          application={application}
          group={managed}
          reviewMessage={application?.review_message ?? null}
        />
      ) : null}

      {focus === "group" || focus === "all" ? (
        <GroupDesk
          email={email}
          profile={profile}
          googlePhotoUrl={googlePhotoUrl}
          application={openApplication}
          group={managed}
          people={managed ? requests.filter((item) => item.group_id === managed.id) : []}
          detail={managed ? details.find((item) => item.group_id === managed.id) ?? null : null}
          pendingLocation={managed ? locationChanges.find((item) => item.group_id === managed.id && item.status === "pending") ?? null : null}
          onSaveGroup={saveGroup}
          onStatus={setStatus}
          onLocation={requestLocation}
          onShare={share}
        />
      ) : null}

      {focus === "me" || focus === "all" ? <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <ProfilePhoto
          userId={profile.user_id}
          name={profile.full_name}
          email={email}
          photoUrl={profile.photo_url}
          googlePhotoUrl={googlePhotoUrl}
          fullName={profile.full_name}
          phone={profile.phone}
          size={144}
        />
        <h2 className="mt-5 text-center text-xl font-semibold">Account settings</h2>
        <form className="mt-4 space-y-3" onSubmit={(event) => void saveProfile(event)}>
          <label className="block text-sm font-medium">Full name<input name="fullName" defaultValue={profile.full_name ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
          <label className="block text-sm font-medium">Email<input value={email} readOnly className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-3" /></label>
          <label className="block text-sm font-medium">Phone<input name="phone" defaultValue={profile.phone ?? ""} autoComplete="tel" className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
          <button type="submit" className="inline-flex h-12 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">Save account</button>
        </form>
      </section> : null}
    </div>
  );
}

function HomeGroupCard({
  status,
  application,
  group,
  reviewMessage,
}: {
  status: string;
  application: Application | null;
  group: Group | null;
  reviewMessage: string | null;
}) {
  const name = group?.name || application?.group_name || "My Bible Group";
  const place = group?.public_location || (application ? safePlace(application) : "");
  const when = [group?.meeting_day || application?.meeting_day, group?.meeting_time || application?.meeting_time].filter(Boolean).join(" · ");
  if (status === "none") {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">My Bible Group</h2>
        <p className="mt-2 text-sm text-[#667085]">You have not started a group yet.</p>
      </section>
    );
  }
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-[#667085]">MY BIBLE GROUP</p>
          <h2 className="mt-1 truncate text-lg font-semibold">{name}</h2>
          <p className="mt-1 truncate text-sm text-[#52627a]">{[when, place].filter(Boolean).join(" · ")}</p>
        </div>
        <StatusPill status={status} />
      </div>
      {status === "rejected" && reviewMessage ? <p className="mt-3 text-sm text-[#9a3412]">{reviewMessage}</p> : null}
      <Link href="/app/group" className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Manage group</Link>
    </section>
  );
}

function GroupDesk({
  email,
  profile,
  googlePhotoUrl,
  application,
  group,
  people,
  detail,
  pendingLocation,
  onSaveGroup,
  onStatus,
  onLocation,
  onShare,
}: {
  email: string;
  profile: Profile;
  googlePhotoUrl: string | null;
  application: Application | null;
  group: Group | null;
  people: RequestRow[];
  detail: Detail | null;
  pendingLocation: LocationChange | null;
  onSaveGroup: (event: FormEvent<HTMLFormElement>, id: string) => void;
  onStatus: (id: string, action: "pause" | "resume") => void;
  onLocation: (event: FormEvent<HTMLFormElement>, id: string) => void;
  onShare: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const photo = group?.leader_photo_url || application?.leader_photo_url || profile.photo_url || googlePhotoUrl;
  const leader = group?.leader_name || application?.leader_name || profile.full_name || email;
  const name = group?.name || application?.group_name?.trim() || "My Bible Group";
  const status = group?.status || application?.status || "none";
  const place = group?.public_location || (application ? safePlace(application) : "");
  const city = group?.city || application?.city || "";
  const when = [group?.meeting_day || application?.meeting_day, group?.meeting_time || application?.meeting_time].filter(Boolean).join(" · ");
  const duration = group?.duration || application?.duration;
  const description = group?.description || application?.description;
  const approved = status === "approved";
  const previewGroup = toPublicGroup({ application, group, photo, leader, name, place });

  if (!group && !application) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">My Bible Group</h2>
        <p className="mt-2 text-sm text-[#667085]">You do not have a group yet.</p>
        <Link href="/app/start" className="mt-4 inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Start a Group</Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-wide text-[#667085]">My Bible Group</h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{name}</p>
        </div>
        <StatusPill status={status} />
      </div>
      {status === "pending" ? (
        <p className="mt-3 rounded-2xl bg-[#f7f7f7] px-3 py-2 text-sm text-[#444]">Your application has been received. Our team will contact you before your group appears publicly.</p>
      ) : null}
      {status === "changes_requested" ? (
        <p className="mt-3 rounded-2xl bg-[#fff7ed] px-3 py-2 text-sm text-[#9a3412]">{application?.review_message || "A reviewer asked for changes."}</p>
      ) : null}
      <div className="mt-4 flex gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e7f0ff] text-lg font-semibold text-[#1976F3]">{leader.slice(0, 1).toUpperCase()}</span>
        )}
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{leader}</p>
          {when ? <p className="mt-1 text-[#52627a]">{when}</p> : null}
          <p className="mt-1 text-[#52627a]">{[city, place].filter(Boolean).join(" · ")}</p>
          {duration ? <p className="mt-1 text-[#52627a]">{duration}</p> : null}
        </div>
      </div>
      {description ? <p className="mt-3 text-sm leading-relaxed text-[#444]">{description}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {group ? (
          <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Edit Group</button>
        ) : (
          <Link href="/app/start" className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Edit Group</Link>
        )}
        <button type="button" onClick={() => setPreviewing(true)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Preview Group</button>
        {approved && group ? (
          <button type="button" onClick={() => void onShare(group.id)} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Share Group</button>
        ) : null}
        {approved ? (
          <button type="button" onClick={() => setShowPeople((value) => !value)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Manage Interested People</button>
        ) : null}
        {group?.status === "approved" ? (
          <button type="button" onClick={() => void onStatus(group.id, "pause")} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">Pause group</button>
        ) : null}
        {group?.status === "paused" ? (
          <button type="button" onClick={() => void onStatus(group.id, "resume")} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Resume group</button>
        ) : null}
      </div>
      {approved && group ? <p className="mt-3 break-all text-sm text-[#1976F3]">/groups/{group.id}</p> : null}
      {editing && group ? (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4">
          <form className="space-y-3" onSubmit={(event) => onSaveGroup(event, group.id)}>
            <label className="block text-sm font-medium">Group name<input name="name" defaultValue={group.name} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">Day<input name="meetingDay" defaultValue={group.meeting_day ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
              <label className="block text-sm font-medium">Time<input name="meetingTime" defaultValue={group.meeting_time ?? ""} className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
            </div>
            <label className="block text-sm font-medium">Description<textarea name="description" defaultValue={group.description ?? ""} rows={3} className="mt-1 w-full rounded-2xl border border-[#e6e6e6] px-3 py-2" /></label>
            <button type="submit" className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Save group</button>
          </form>
          <form className="space-y-3" onSubmit={(event) => onLocation(event, group.id)}>
            <h3 className="font-semibold">Public location</h3>
            <p className="text-sm text-[#666]">The current public location stays visible until an admin approves a change. A home address is not published.</p>
            <p className="text-sm">Current public location: {group.public_location}</p>
            {detail?.address ? <p className="text-sm text-[#444]">Private address on file: {detail.address}</p> : null}
            {pendingLocation ? <p className="text-sm text-[#9a3412]">Pending review: {pendingLocation.public_location}</p> : null}
            <label className="block text-sm font-medium">Proposed public location<input name="publicLocation" required className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
            <label className="block text-sm font-medium">Private address, if it changed<input name="privateAddress" className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] px-3" /></label>
            <button type="submit" className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">Submit location change</button>
          </form>
        </div>
      ) : null}
      {approved && showPeople ? (
        <div className="mt-4 border-t border-black/5 pt-4">
          <h3 className="font-semibold">Interested people</h3>
          {people.length === 0 ? <p className="mt-2 text-sm text-[#666]">No one has asked to join yet.</p> : null}
          <ul className="mt-3 space-y-2">
            {people.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{person.first_name}</span>
                <span className="flex shrink-0 gap-3">
                  <a href={`sms:${person.phone}`} className="inline-flex h-11 items-center font-semibold text-[#1976F3]">Text</a>
                  <a href={`tel:${person.phone}`} className="inline-flex h-11 items-center font-semibold text-[#1976F3]">{person.phone}</a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {previewing && previewGroup ? <GroupPreview group={previewGroup} onClose={() => setPreviewing(false)} /> : null}
    </section>
  );
}

function GroupPreview({ group, onClose }: { group: PublicGroup; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Group preview">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wide text-[#1976F3]">PREVIEW</p>
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center px-2 text-sm font-semibold">Close</button>
        </div>
        <JoinGroupForm group={group} variant="panel" preview />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "approved" ? "bg-[#e8f8ee] text-[#157a3a]" : status === "suspended" || status === "rejected" ? "bg-[#f3f4f6] text-[#444]" : "bg-[#fff7ed] text-[#9a3412]";
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function safePlace(application: OwnedApplication) {
  const locationType = application.location_type === "home" || application.location_type === "other" ? application.location_type : "public_venue";
  return publicLocationLabel({
    locationType,
    meetingLocation: application.meeting_location,
    city: application.city,
    state: application.state ?? "",
  });
}

function toPublicGroup({
  application,
  group,
  photo,
  leader,
  name,
  place,
}: {
  application: Application | null;
  group: Group | null;
  photo: string | null;
  leader: string;
  name: string;
  place: string;
}): PublicGroup | null {
  const source = group || application;
  if (!source) return null;
  const locationType = (group?.location_type || application?.location_type) === "home" || (group?.location_type || application?.location_type) === "other"
    ? ((group?.location_type || application?.location_type) as "home" | "other")
    : "public_venue";
  const latitude = Number(group?.latitude ?? application?.latitude);
  const longitude = Number(group?.longitude ?? application?.longitude);
  return {
    id: group?.id || application?.id || "preview",
    name,
    description: group?.description ?? application?.description ?? null,
    city: group?.city || application?.city || "",
    state: group?.state ?? application?.state ?? null,
    country: group?.country || application?.country || "",
    location_type: locationType,
    public_location: place,
    address: null,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    meeting_day: group?.meeting_day ?? application?.meeting_day ?? null,
    meeting_time: group?.meeting_time ?? application?.meeting_time ?? null,
    leader_name: leader,
    leader_photo_url: photo,
  };
}
