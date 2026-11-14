"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { publicLocationLabel } from "@/lib/groups/geo";
import type { CoLeaderInvite, OwnedApplication, PublicGroup } from "@/lib/groups/types";

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
  leader_user_id?: string | null;
  co_leader_name?: string | null;
  co_leader_photo_url?: string | null;
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
  googlePhotoUrl = null,
  applications,
  groups,
  requests,
  details,
  locationChanges,
  invites = [],
  selectedId = "",
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
  invites?: CoLeaderInvite[];
  selectedId?: string;
  focus?: "all" | "home" | "group" | "me";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const items = groupEntries(applications, groups, invites, profile.user_id);
  const incoming = invites.filter((invite) => invite.invited_by !== profile.user_id && (invite.status === "pending" || invite.status === "accepted"));

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

  async function respondInvite(id: string, action: "accept" | "decline" | "cancel") {
    const response = await fetch("/api/groups/co-leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    const body = (await response.json()) as { error?: string };
    setMessage(response.ok ? (action === "accept" ? "Invitation accepted. An admin still confirms both leaders." : action === "decline" ? "Invitation declined." : "Co-leader invitation cancelled.") : body.error || "That invitation did not update.");
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
    <div className={focus === "home" ? "mt-5" : "mt-2 space-y-6"}>
      {message ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{message}</p> : null}

      {focus === "home" || focus === "all" ? (
        items[0] ? (
          <div>
            <EntryCard entry={items[0]} photoUrl={profile.photo_url || googlePhotoUrl} compact />
            {items.length > 1 ? (
              <Link href="/app/group" className="mt-3 inline-flex text-sm font-semibold text-[#157a3a]">You have {items.length} groups</Link>
            ) : null}
          </div>
        ) : null
      ) : null}

      {focus === "group" || focus === "all" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">My Groups</h2>
            <Link href="/app/start" className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">+ Add Group</Link>
          </div>
          {incoming.map((invite) => (
            <section key={invite.id} className="rounded-[22px] border border-[#d7f3e2] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#157a3a]">{invite.status === "accepted" ? "Accepted" : "Invitation Pending"}</p>
              <p className="mt-1 text-sm text-[#142033]">{invite.group_name || "A Bible group"} invited you to lead together.</p>
              {invite.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => void respondInvite(invite.id, "accept")} className="inline-flex h-11 items-center rounded-full bg-[#157a3a] px-4 text-sm font-semibold text-white">Accept</button>
                  <button type="button" onClick={() => void respondInvite(invite.id, "decline")} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Decline</button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#157a3a]">An admin confirms you before the group shows both leaders.</p>
              )}
            </section>
          ))}
          {items.length === 0 ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">You do not have a group yet.</p>
            </section>
          ) : null}
          {items.map((entry) => (
            <div key={entry.key} className="space-y-3">
              <EntryCard entry={entry} photoUrl={profile.photo_url || googlePhotoUrl} />
              {selectedId === entry.key ? (
                <GroupDesk
                  email={email}
                  profile={profile}
                  googlePhotoUrl={googlePhotoUrl}
                  application={entry.application}
                  group={entry.group}
                  invite={entry.invite}
                  primary={entry.primary}
                  people={entry.group ? requests.filter((item) => item.group_id === entry.group?.id) : []}
                  detail={entry.group ? details.find((item) => item.group_id === entry.group?.id) ?? null : null}
                  pendingLocation={entry.group ? locationChanges.find((item) => item.group_id === entry.group?.id && item.status === "pending") ?? null : null}
                  onSaveGroup={saveGroup}
                  onStatus={setStatus}
                  onLocation={requestLocation}
                  onShare={share}
                  onCancelInvite={(id) => void respondInvite(id, "cancel")}
                />
              ) : null}
            </div>
          ))}
        </div>
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

function EntryCard({ entry, photoUrl, compact = false }: { entry: Entry; photoUrl: string | null; compact?: boolean }) {
  const { application, group, invite } = entry;
  const status = group?.status || application?.status || "none";
  const name = group?.name || application?.group_name?.trim() || "My Bible Group";
  const place = group?.public_location || (application ? safePlace(application) : "");
  const leader = group?.leader_name || application?.leader_name || "Group leader";
  const card = toPublicGroup({
    application,
    group,
    photo: group?.leader_photo_url || application?.leader_photo_url || photoUrl,
    leader,
    name,
    place,
  });
  if (!card) return null;
  const inviteLabel = invite ? (invite.approved ? "Co-leader confirmed" : invite.status === "accepted" ? "Co-leader accepted" : "Invitation Pending") : "";
  return (
    <section className="rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm">
      <JoinGroupForm
        group={card}
        variant="panel"
        hideJoin
        compact={compact}
        statusLabel={STATUS_LABEL[status] ?? status}
        footer={<Link href={`/app/group?id=${entry.key}`} className="inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Manage Group</Link>}
      />
      {inviteLabel ? <p className="mt-3 text-sm font-semibold text-[#157a3a]">{inviteLabel}{invite ? ` · ${invite.name}` : ""}</p> : null}
    </section>
  );
}

function GroupDesk({
  email,
  profile,
  googlePhotoUrl,
  application,
  group,
  invite,
  primary,
  people,
  detail,
  pendingLocation,
  onSaveGroup,
  onStatus,
  onLocation,
  onShare,
  onCancelInvite,
}: {
  email: string;
  profile: Profile;
  googlePhotoUrl: string | null;
  application: Application | null;
  group: Group | null;
  invite: CoLeaderInvite | null;
  primary: boolean;
  people: RequestRow[];
  detail: Detail | null;
  pendingLocation: LocationChange | null;
  onSaveGroup: (event: FormEvent<HTMLFormElement>, id: string) => void;
  onStatus: (id: string, action: "pause" | "resume") => void;
  onLocation: (event: FormEvent<HTMLFormElement>, id: string) => void;
  onShare: (id: string) => void;
  onCancelInvite: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const photo = group?.leader_photo_url || application?.leader_photo_url || profile.photo_url || googlePhotoUrl;
  const leader = group?.leader_name || application?.leader_name || profile.full_name || email;
  const name = group?.name || application?.group_name?.trim() || "My Bible Group";
  const status = group?.status || application?.status || "none";
  const place = group?.public_location || (application ? safePlace(application) : "");
  const approved = status === "approved";
  const previewGroup = toPublicGroup({ application, group, photo, leader, name, place });

  if (!group && !application) return null;

  return (
    <div className="space-y-3 rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {group ? (
          <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Edit Group</button>
        ) : (
          <Link href={application ? `/app/start?application=${application.id}` : "/app/start"} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Edit Group</Link>
        )}
        <button type="button" onClick={() => setPreviewing(true)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Preview Group</button>
        {approved && group ? (
          <button type="button" onClick={() => void onShare(group.id)} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Share Group</button>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-[#157a3a]">{statusCopy(status, application?.review_message ?? null, approved && group ? `/groups/${group.id}` : "")}</p>
      {invite && primary ? (
        <p className="text-sm font-semibold text-[#157a3a]">
          {invite.name} · {invite.approved ? "Co-leader confirmed" : invite.status === "accepted" ? "Accepted" : "Invitation Pending"}
          {invite.status !== "cancelled" ? (
            <button type="button" onClick={() => onCancelInvite(invite.id)} className="ml-3 font-semibold text-[#1976F3]">Cancel</button>
          ) : null}
        </p>
      ) : null}
      {approved ? (
        <button type="button" onClick={() => setShowPeople((value) => !value)} className="inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Manage Interested People</button>
      ) : null}
      {group?.status === "approved" ? (
        <button type="button" onClick={() => void onStatus(group.id, "pause")} className="ml-3 inline-flex h-11 items-center text-sm font-semibold text-[#52627a]">Pause group</button>
      ) : null}
      {group?.status === "paused" ? (
        <button type="button" onClick={() => void onStatus(group.id, "resume")} className="inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Resume group</button>
      ) : null}
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
    </div>
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

function statusCopy(status: string, message: string | null, publicPath: string) {
  if (status === "pending") return "Your application has been received. Our team will contact you before your group appears publicly.";
  if (status === "changes_requested") return message || "A reviewer asked for changes.";
  if (status === "approved") return publicPath ? `Your group is approved and visible on the map. ${publicPath}` : "Your group is approved and visible on the map.";
  if (status === "suspended" || status === "paused") return "This group is hidden from the public map.";
  if (status === "rejected") return message || "This application was not approved.";
  return "";
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
    co_leader_name: group?.co_leader_name ?? null,
    co_leader_photo_url: group?.co_leader_photo_url ?? null,
  };
}

type Entry = {
  key: string;
  application: Application | null;
  group: Group | null;
  invite: CoLeaderInvite | null;
  primary: boolean;
};

function groupEntries(applications: Application[], groups: Group[], invites: CoLeaderInvite[], userId: string) {
  const used = new Set<string>();
  const items: Entry[] = [];
  for (const application of applications) {
    if (application.status === "rejected") continue;
    const group = application.group_id ? groups.find((item) => item.id === application.group_id) ?? null : null;
    if (group) used.add(group.id);
    items.push({
      key: application.id,
      application,
      group,
      invite: openInvite(invites, application.id, group?.id),
      primary: true,
    });
  }
  for (const group of groups) {
    if (used.has(group.id) || group.status === "rejected") continue;
    items.push({
      key: group.id,
      application: null,
      group,
      invite: openInvite(invites, null, group.id),
      primary: group.leader_user_id === userId,
    });
  }
  return items;
}

function openInvite(invites: CoLeaderInvite[], applicationId: string | null, groupId?: string | null) {
  return invites.find((invite) => (
    (invite.status === "pending" || invite.status === "accepted")
    && ((applicationId && invite.application_id === applicationId) || (groupId && invite.group_id === groupId))
  )) ?? null;
}
