"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { LiveStatus, LiveToggle } from "@/components/groups/LiveStatus";
import { publicLocationLabel } from "@/lib/groups/geo";
import { cityState, type CoLeaderInvite, type OwnedApplication, type PublicGroup } from "@/lib/groups/types";

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
  groupme_url?: string | null;
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

  async function setLive(id: string, live: boolean) {
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: live ? "resume" : "pause", id }),
    });
    setMessage(response.ok ? (live ? "Your group is live." : "Your group is paused.") : "That status did not change.");
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
          {items.length === 0 ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">You do not have a group yet.</p>
            </section>
          ) : null}
          {items.length > 1 ? (
            <ul className="space-y-2">
              {items.map((entry) => {
                const active = (selectedId || items[0]?.key) === entry.key;
                const label = entry.group?.name || entry.application?.group_name?.trim() || "My Bible Group";
                const status = entry.group?.status || entry.application?.status || "";
                const place = cityState({ city: entry.group?.city || entry.application?.city || "", state: entry.group?.state ?? entry.application?.state ?? null });
                return (
                  <li key={entry.key}>
                    <Link href={`/app/group?id=${entry.key}`} className={`flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-sm ${active ? "border-[#1976F3]" : "border-[#e6ebf2]"}`}>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{label}</span>
                        <span className="block truncate text-[#667085]">{place}</span>
                      </span>
                      <span className="shrink-0">{status === "approved" || status === "paused" ? <LiveStatus live={status === "approved"} /> : <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#9a3412]">{STATUS_LABEL[status] ?? status}</span>}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {items.filter((entry) => entry.key === (selectedId || items[0]?.key)).map((entry) => (
            <GroupDesk
              key={entry.key}
              email={email}
              profile={profile}
              googlePhotoUrl={googlePhotoUrl}
              application={entry.application}
              group={entry.group}
              people={entry.group ? requests.filter((item) => item.group_id === entry.group?.id) : []}
              primary={entry.primary}
              onShare={share}
              onLive={setLive}
            />
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
  const { application, group } = entry;
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
  primary,
  onShare,
  onLive,
}: {
  email: string;
  profile: Profile;
  googlePhotoUrl: string | null;
  application: Application | null;
  group: Group | null;
  people: RequestRow[];
  primary: boolean;
  onShare: (id: string) => void;
  onLive: (id: string, live: boolean) => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const photo = group?.leader_photo_url || application?.leader_photo_url || profile.photo_url || googlePhotoUrl;
  const leader = group?.leader_name || application?.leader_name || profile.full_name || email;
  const name = group?.name || application?.group_name?.trim() || "My Bible Group";
  const status = group?.status || application?.status || "none";
  const place = group?.public_location || (application ? safePlace(application) : "");
  const live = status === "approved";
  const paused = status === "paused";
  const approved = live || paused;
  const previewGroup = toPublicGroup({ application, group, photo, leader, name, place });
  const editHref = application ? `/app/start?application=${application.id}` : group ? `/app/start?group=${group.id}` : "/app/start";

  if (!group && !application) return null;

  return (
    <div className="space-y-3">
      {previewGroup ? (
        <section className="rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm">
          <JoinGroupForm group={previewGroup} variant="panel" hideJoin availability={live ? "live" : paused ? "paused" : undefined} statusLabel={live || paused ? undefined : STATUS_LABEL[status] ?? status} />
        </section>
      ) : null}
      {primary && group && (live || paused) ? <LiveToggle live={live} onChange={(next) => onLive(group.id, next)} /> : null}
      <div className="flex flex-wrap gap-2">
        <Link href={editHref} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Edit Group</Link>
        {approved && group ? (
          <Link href={`/groups/${group.id}`} className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold">View Profile</Link>
        ) : (
          <button type="button" onClick={() => setPreviewing(true)} className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold">View Profile</button>
        )}
        {approved && group ? (
          <button type="button" onClick={() => void onShare(group.id)} className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold">Share Group</button>
        ) : null}
      </div>
      <section className="rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Interested People <span className="font-medium text-[#157a3a]">({people.length})</span></h3>
        {people.length === 0 ? <p className="mt-2 text-sm text-[#666]">No one has signed up yet. Share your group to invite people.</p> : null}
        <ul className="mt-3 space-y-3">
          {people.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">{person.first_name}</span>
                <span className="block text-[#52627a]">{person.phone}</span>
                <span className="block text-xs text-[#667085]">{new Date(person.created_at).toLocaleDateString()}</span>
              </span>
              <a href={`sms:${person.phone}`} className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#1976F3] px-4 font-semibold text-white">Text</a>
            </li>
          ))}
        </ul>
      </section>
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
    co_leader_name: group?.co_leader_name ?? application?.co_leader_name ?? null,
    co_leader_photo_url: group?.co_leader_photo_url ?? application?.co_leader_photo_url ?? null,
    groupme_url: group?.groupme_url ?? null,
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
