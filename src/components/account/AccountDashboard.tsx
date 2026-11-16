"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Mail, MessageSquare, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { LiveStatus, LiveToggle } from "@/components/groups/LiveStatus";
import { publicLocationLabel } from "@/lib/groups/geo";
import { groupPublicPath } from "@/lib/groups/slug";
import { PhoneInput } from "@/components/phone/PhoneInput";
import { dialPhone, displayPhone } from "@/lib/phone";
import { cityState, meetingWhen, type CoLeaderInvite, type OwnedApplication, type PublicGroup } from "@/lib/groups/types";

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
  slug?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  location_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
};
type RequestRow = { id: string; group_id: string; first_name: string; phone: string; email?: string | null; status: string; created_at: string };
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
  selectedId: _selectedId = "",
  highlightRequestId = "",
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
  highlightRequestId?: string;
  focus?: "all" | "home" | "group" | "me";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [accountPhone, setAccountPhone] = useState(displayPhone(profile.phone));
  const items = groupEntries(applications, groups, invites, profile.user_id);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), phone: accountPhone, photoUrl: profile.photo_url }),
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
    setMessage(response.ok ? "" : "That status did not change.");
    if (response.ok) router.refresh();
  }

  async function share(group: { id: string; slug?: string | null; name?: string }) {
    const url = `${window.location.origin}${groupPublicPath(group)}`;
    const text = group.name ? `Join ${group.name} on Read Talk Pray.` : "Join a Read Talk Pray group.";
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: group.name || "Read Talk Pray", text, url });
        return "shared";
      } catch {
        return "";
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return url;
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
              <p className="mt-3 text-sm text-[#9a3412]">You have {items.length} group records. The extras were kept for review and no new group can be added.</p>
            ) : null}
          </div>
        ) : null
      ) : null}

      {focus === "group" || focus === "all" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">My Group</h2>
            {items.length === 0 ? <Link href="/app/start" className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Start a Group</Link> : null}
          </div>
          {items.length === 0 ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">You do not have a group yet.</p>
            </section>
          ) : null}
          {items.map((entry) => (
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
              highlightRequestId={highlightRequestId}
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
          <label className="block text-sm font-medium">Phone<div className="mt-1"><PhoneInput value={accountPhone} onChange={setAccountPhone} className="h-11 w-full rounded-2xl border border-[#e6e6e6] pr-3" /></div></label>
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
        faces="profile"
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
  highlightRequestId = "",
}: {
  email: string;
  profile: Profile;
  googlePhotoUrl: string | null;
  application: Application | null;
  group: Group | null;
  people: RequestRow[];
  primary: boolean;
  onShare: (group: { id: string; slug?: string | null; name?: string }) => Promise<string>;
  onLive: (id: string, live: boolean) => void;
  highlightRequestId?: string;
}) {
  const [previewing, setPreviewing] = useState(false);
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState("");
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
  const profileHref = group ? groupPublicPath(group) : "";
  const welcome = `Hey! Thanks for your interest in ${name}. We'd love to have you join us! Our group meets ${meetingWhen({ meeting_day: group?.meeting_day ?? application?.meeting_day ?? null, meeting_time: group?.meeting_time ?? application?.meeting_time ?? null }) || "soon"}. Reply here if you have any questions.`;

  if (!group && !application) return null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#e6ebf2] bg-white shadow-sm">
      {previewGroup ? (
        <div className="p-4">
          <JoinGroupForm group={previewGroup} variant="panel" faces="profile" hideJoin availability={live ? "live" : paused ? "paused" : undefined} statusLabel={live || paused ? undefined : STATUS_LABEL[status] ?? status} />
        </div>
      ) : null}
      {primary && group && (live || paused) ? (
        <div className="flex items-center justify-between gap-3 border-t border-[#e6ebf2] px-4 py-3">
          <LiveStatus live={live} label={live ? "Group is Live" : "Group is Paused"} />
          <LiveToggle live={live} onChange={(next) => onLive(group.id, next)} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 border-t border-[#e6ebf2] px-4 py-3">
        <Link href={editHref} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Edit Group</Link>
        {approved && group ? (
          <Link href={profileHref} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">View Profile</Link>
        ) : (
          <button type="button" onClick={() => setPreviewing(true)} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">View Profile</button>
        )}
        {approved && group ? (
          <button type="button" onClick={() => void onShare({ id: group.id, slug: group.slug, name }).then((result) => setNotice(result === "copied" ? "Group link copied." : result && result !== "shared" ? result : ""))} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm font-semibold">Share Group</button>
        ) : null}
      </div>
      {notice ? <p className="px-4 pb-2 text-sm text-[#157a3a]">{notice}</p> : null}
      <div className="border-t border-[#e6ebf2] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Interested People</h3>
          <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-xs font-semibold text-[#157a3a]">{people.length} {people.length === 1 ? "Person" : "People"}</span>
        </div>
        {people.length > 0 ? (
          <button type="button" onClick={() => void navigator.clipboard.writeText(welcome).then(() => setNotice("Welcome message copied."))} className="mt-2 text-sm font-semibold text-[#1976F3]">Copy Welcome Message</button>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-[#666]">No one has signed up yet. Share your group to invite people.</p>
            {approved && group ? <button type="button" onClick={() => void onShare({ id: group.id, slug: group.slug, name }).then((result) => setNotice(result === "copied" ? "Group link copied." : ""))} className="mt-2 inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Share Group</button> : null}
          </div>
        )}
        {people.length > 0 ? <PeopleRows people={people} welcome={welcome} copiedId={copiedId} highlightId={highlightRequestId} onCopy={(id, phone) => void navigator.clipboard.writeText(phone).then(() => setCopiedId(id))} /> : null}
      </div>
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

function safePlace(application: OwnedApplication) {
  const locationType = application.location_type === "home" || application.location_type === "other" ? application.location_type : "public_venue";
  return publicLocationLabel({
    locationType,
    meetingLocation: application.meeting_location,
    city: application.city,
    state: application.state ?? "",
  });
}

function PeopleRows({
  people,
  welcome,
  copiedId,
  highlightId = "",
  onCopy,
}: {
  people: RequestRow[];
  welcome: string;
  copiedId: string;
  highlightId?: string;
  onCopy: (id: string, phone: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(25);
  const needle = query.trim().toLowerCase();
  const digits = needle.replace(/\D/g, "");
  const filtered = people.filter((person) => {
    if (!needle) return true;
    return person.first_name.toLowerCase().includes(needle) || (digits.length > 0 && person.phone.replace(/\D/g, "").includes(digits));
  });
  const rows = filtered.slice(0, shown);
  useEffect(() => {
    if (!highlightId) return;
    const index = people.findIndex((person) => person.id === highlightId);
    if (index >= shown) setShown(index + 1);
    const row = document.getElementById(`interest-${highlightId}`);
    row?.scrollIntoView({ block: "center" });
  }, [highlightId, people, shown]);
  return (
    <div className="mt-3">
      <input value={query} onChange={(event) => { setQuery(event.target.value); setShown(25); }} placeholder="Search name or phone" aria-label="Search interested people" className="h-11 w-full rounded-2xl border border-[#e6ebf2] px-3 text-sm outline-none focus:border-[#1976F3]" />
      <ul className="mt-2">
        {rows.map((person) => {
          const phone = displayPhone(person.phone);
          const dial = dialPhone(person.phone);
          const date = new Date(person.created_at).toLocaleDateString();
          return (
            <li id={`interest-${person.id}`} key={person.id} className={`flex min-h-14 items-center gap-2 border-b border-[#eef2f7] py-1 text-sm ${person.id === highlightId ? "rounded-xl bg-[#e7f0ff] px-2" : ""}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7f0ff] text-xs font-semibold text-[#1976F3]">{person.first_name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{person.first_name}</span>
                <span className="block truncate text-xs text-[#667085] sm:hidden">{phone} · {date}</span>
              </span>
              <span className="hidden w-36 shrink-0 truncate text-[#142033] sm:block">{phone}</span>
              <span className="hidden w-24 shrink-0 text-xs text-[#667085] md:block">{date}</span>
              <span className="flex shrink-0 items-center">
                <button type="button" title={copiedId === person.id ? "Copied" : "Copy number"} aria-label="Copy phone number" onClick={() => onCopy(person.id, dial)} className="grid h-10 w-10 place-items-center text-[#1976F3]"><Copy size={16} /></button>
                <a href={`sms:${dial}?&body=${encodeURIComponent(welcome)}`} title="Text" aria-label={`Text ${person.first_name}`} className="grid h-10 w-10 place-items-center text-[#1976F3]"><MessageSquare size={16} /></a>
                <a href={`tel:${dial}`} title="Call" aria-label={`Call ${person.first_name}`} className="grid h-10 w-10 place-items-center text-[#1976F3]"><Phone size={16} /></a>
                {person.email ? <a href={`mailto:${person.email}`} title="Email" aria-label={`Email ${person.first_name}`} className="grid h-10 w-10 place-items-center text-[#1976F3]"><Mail size={16} /></a> : null}
              </span>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? <p className="py-3 text-sm text-[#667085]">No contacts match that search.</p> : null}
      {shown < filtered.length ? (
        <button type="button" onClick={() => setShown((count) => count + 25)} className="mt-3 inline-flex h-11 items-center rounded-full border border-[#e6ebf2] px-4 text-sm font-semibold">Load more</button>
      ) : null}
    </div>
  );
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
