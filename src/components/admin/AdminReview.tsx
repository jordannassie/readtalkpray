"use client";

import { ChevronDown, ExternalLink, Eye, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GroupMembersDisplay } from "@/components/groups/GroupMembersDisplay";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { LeaderFaces } from "@/components/groups/LeaderFaces";
import { GroupStatusToggle, SyncedLiveStatus } from "@/components/groups/LiveStatus";
import { CopyButton } from "@/components/app/CopyButton";
import { groupMarketingUrl } from "@/lib/groups/slug";
import { cityState, meetingWhen, type PublicGroup } from "@/lib/groups/types";
import { dialPhone, displayPhone } from "@/lib/phone";

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
  duration?: string | null;
  timezone?: string | null;
  description: string | null;
  leader_photo_url?: string | null;
  group_name?: string | null;
  status: string;
  faith_agreed?: boolean;
  commitments_agreed?: boolean;
  privacy_agreed?: boolean;
  created_at?: string;
  co_leader_name?: string | null;
  co_leader_photo_url?: string | null;
};

type JoinRequest = { id: string; first_name: string; phone: string; email: string | null; status: string; address_shared: boolean; group_id: string };
type Group = {
  id: string;
  name: string;
  city: string;
  state?: string | null;
  status: string;
  public_location: string;
  address?: string | null;
  location_type?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meeting_day?: string | null;
  meeting_time?: string | null;
  description?: string | null;
  leader_name: string;
  leader_photo_url?: string | null;
  co_leader_name?: string | null;
  co_leader_photo_url?: string | null;
  leader_email?: string | null;
  leader_phone?: string | null;
  members?: number;
  slug?: string | null;
};
type Review = { id: string; application_id: string; action: string; note: string | null; message: string | null; created_at: string };
type LocationChange = { id: string; group_id: string; public_location: string; private_address: string | null; status: string };
type Filter = "pending" | "approved" | "suspended" | "all";

const FILTERS: Array<[Filter, string]> = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["suspended", "Suspended"],
  ["all", "All"],
];

export function AdminReview({
  applications,
  requests,
  groups,
  reviews,
  locationChanges,
  counts,
  filter,
  query,
  page,
  pageCount,
  total,
  groupTotal,
}: {
  applications: Application[];
  requests: JoinRequest[];
  groups: Group[];
  reviews: Review[];
  locationChanges: LocationChange[];
  counts: { pending: number; approved: number; active: number; leaders: number; interested: number; suspended: number };
  filter: Filter;
  query: string;
  page: number;
  pageCount: number;
  total: number;
  groupTotal: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [openId, setOpenId] = useState("");
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [managedId, setManagedId] = useState("");
  const [viewing, setViewing] = useState<Group | null>(null);
  useEffect(() => {
    if (!viewing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setViewing(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  async function send(id: string, payload: Record<string, unknown>) {
    setBusy(id);
    setError("");
    const response = await fetch("/api/admin/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
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
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Pending applications", counts.pending],
          ["Approved groups", counts.approved],
          ["Active groups", counts.active],
          ["Leaders", counts.leaders],
          ["Interested people", counts.interested],
          ["Suspended groups", counts.suspended],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-3xl bg-white p-4 shadow-sm">
            <dt className="text-xs text-[#666]">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {error ? <p className="rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm text-[#9a3412]">{error}</p> : null}

      <section className="min-w-0">
        <h2 className="text-xl font-semibold">Application review</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map(([value, label]) => (
            <Link key={value} href={listHref(value, query, 1)} className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ${filter === value ? "bg-[#1976F3] text-white" : "bg-white text-[#222] shadow-sm"}`}>
              {label}
            </Link>
          ))}
        </div>
        <form action="/app/admin" className="mt-3 flex gap-2">
          <input type="hidden" name="status" value={filter} />
          <input name="q" defaultValue={query} placeholder="Group, applicant, email, or city" className="h-11 min-w-0 flex-1 rounded-2xl border border-[#e6e6e6] bg-white px-3 text-sm" />
          <button className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Search</button>
        </form>
        {applications.length === 0 ? <p className="mt-3 text-sm text-[#666]">No applications match this view.</p> : null}
        <ul className="mt-3 space-y-2">
          {applications.map((item) => {
            const open = openId === item.id;
            const history = reviews.filter((review) => review.application_id === item.id);
            const confirmed = verified[item.id] === true;
            const place = [item.city, item.state].filter(Boolean).join(", ");
            return (
              <li key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : item.id)}
                  className="flex min-h-[76px] w-full items-center gap-3 px-3 py-2 text-left sm:h-[88px]"
                >
                  <LeaderFaces leaderName={item.leader_name} leaderPhoto={item.leader_photo_url} coLeaderName={item.co_leader_name} coLeaderPhoto={item.co_leader_photo_url} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.group_name || "Group name not provided"}</span>
                    <span className="block truncate text-xs text-[#555]">{item.leader_name}{item.co_leader_name ? ` & ${item.co_leader_name}` : ""} · {place}</span>
                    <span className="block truncate text-xs text-[#777] sm:hidden">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-[#666] sm:block">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillClass(item.status)}`}>{pillLabel(item.status)}</span>
                  <ChevronDown size={18} aria-hidden className={`shrink-0 text-[#667085] transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="space-y-3 border-t border-black/5 px-3 py-4 text-sm">
                    <p>Primary leader: {item.leader_name}</p>
                    <p>{item.email} · <a className="inline-flex min-h-11 items-center font-semibold text-[#1976F3]" href={`tel:${dialPhone(item.phone)}`}>{displayPhone(item.phone)}</a></p>
                    {item.co_leader_name ? (
                      <p className="flex items-center gap-2 text-[#157a3a]">
                        {item.co_leader_photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.co_leader_photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : null}
                        Co-leader: {item.co_leader_name}. Shown publicly when this group is approved.
                      </p>
                    ) : (
                      <p className="text-[#667085]">Co-leader: none</p>
                    )}
                    <p><a className="inline-flex min-h-11 items-center font-semibold text-[#1976F3]" href={`mailto:${item.email ?? ""}`}>Email applicant</a></p>
                    <p className="text-[#444]">{[item.city, item.state, item.country].filter(Boolean).join(", ")} · {item.location_type.replaceAll("_", " ")}</p>
                    <p className="text-[#444]">{item.meeting_location}</p>
                    <p className="text-[#444]">{[item.meeting_day, item.meeting_time, item.duration, item.timezone].filter(Boolean).join(" · ")}</p>
                    {item.description ? <p>{item.description}</p> : null}
                    <ul className="space-y-1">
                      <li>Statement of faith: {item.faith_agreed ? "Agreed" : "Not agreed"}</li>
                      <li>Leader commitments: {item.commitments_agreed ? "Agreed" : "Not agreed"}</li>
                      <li>Privacy disclosure: {item.privacy_agreed ? "Agreed" : "Not agreed"}</li>
                    </ul>
                    {item.status === "pending" || item.status === "changes_requested" ? (
                      <div className="space-y-2">
                        <label className="flex min-h-11 items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-5 w-5 shrink-0"
                            checked={confirmed}
                            onChange={(event) => setVerified((current) => ({ ...current, [item.id]: event.target.checked }))}
                          />
                          <span>I have personally contacted the applicant and verified the leader and meeting location.</span>
                        </label>
                        <button type="button" disabled={!confirmed || busy === item.id} onClick={() => void send(item.id, { decision: "approve", checklist: { verified: true } })} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white disabled:opacity-40">Approve Group</button>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {(item.status === "pending" || item.status === "changes_requested" || item.status === "approved") ? (
                        <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { action: "suspend" })} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">Suspend</button>
                      ) : null}
                      {item.status === "suspended" ? (
                        <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { action: "reactivate" })} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">Reactivate</button>
                      ) : null}
                    </div>
                    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const message = String(new FormData(event.currentTarget).get("message") ?? ""); void send(item.id, { action: "request_changes", message }); }}>
                      <input name="message" placeholder="What needs to change" className="h-11 min-w-0 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                      <button className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm">Request changes</button>
                    </form>
                    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const message = String(new FormData(event.currentTarget).get("message") ?? ""); void send(item.id, { decision: "reject", message }); }}>
                      <input name="message" placeholder="Reason for rejecting" className="h-11 min-w-0 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                      <button className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm">Reject</button>
                    </form>
                    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const note = String(new FormData(event.currentTarget).get("note") ?? ""); void send(item.id, { action: "note", note }); }}>
                      <input name="note" placeholder="Private admin note" className="h-11 min-w-0 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                      <button className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm">Save note</button>
                    </form>
                    {history.length > 0 ? (
                      <ol className="space-y-1 text-xs text-[#555]">
                        {history.map((review) => (
                          <li key={review.id}>{new Date(review.created_at).toLocaleString()} · {review.action}{review.message ? ` · ${review.message}` : ""}{review.note ? ` · ${review.note}` : ""}</li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <p className="text-[#666]">{total} application{total === 1 ? "" : "s"} · page {page} of {pageCount}</p>
          <div className="flex gap-2">
            {page > 1 ? <Link href={listHref(filter, query, page - 1)} className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-4">Previous</Link> : null}
            {page < pageCount ? <Link href={listHref(filter, query, page + 1)} className="inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-4">Next</Link> : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Approved groups</h2>
        {groups.length === 0 ? <p className="mt-3 text-sm text-[#666]">No groups match this view.</p> : null}
        <ul className="mt-3 space-y-2">
          {groups.map((group) => {
            const open = managedId === group.id;
            const place = cityState({ city: group.city, state: group.state ?? null });
            const when = meetingWhen({ meeting_day: group.meeting_day ?? null, meeting_time: group.meeting_time ?? null });
            return (
              <li key={group.id} className="rounded-2xl border border-[#e6ebf2] bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <LeaderFaces leaderName={group.leader_name} leaderPhoto={group.leader_photo_url} coLeaderName={group.co_leader_name} coLeaderPhoto={group.co_leader_photo_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{group.name}</p>
                    <p className="truncate text-xs text-[#555]">{group.leader_name}{group.co_leader_name ? ` & ${group.co_leader_name}` : ""}</p>
                    <p className="truncate text-xs text-[#667085]">{[place, when].filter(Boolean).join(" · ")}</p>
                    {typeof group.members === "number" ? <div className="mt-1"><GroupMembersDisplay groupId={group.id} count={group.members} compact /></div> : null}
                  </div>
                  {group.status === "approved" || group.status === "paused" ? <SyncedLiveStatus groupId={group.id} serverLive={group.status === "approved"} /> : <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillClass(group.status)}`}>{pillLabel(group.status)}</span>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {group.status === "approved" || group.status === "paused" ? (
                    <button type="button" onClick={() => setViewing(group)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1976F3] px-3 text-sm font-semibold text-white">
                      <Eye size={15} aria-hidden />
                      View Group
                    </button>
                  ) : null}
                  {group.status === "approved" ? <MarketingLink group={group} /> : null}
                  <button type="button" onClick={() => setManagedId(open ? "" : group.id)} className="inline-flex h-10 items-center rounded-full border border-[#e6ebf2] px-3 text-sm font-semibold">
                    {open ? "Close" : "Manage"}
                  </button>
                </div>
                {open ? (
                  <div className="mt-3 space-y-1 border-t border-[#e6ebf2] pt-3 text-sm text-[#444]">
                    <p>{group.description || "No description."}</p>
                    <p>Leader: {group.leader_name}{group.leader_email ? ` · ${group.leader_email}` : ""}{group.leader_phone ? ` · ${displayPhone(group.leader_phone)}` : ""}</p>
                    <p>Co-leader: {group.co_leader_name || "None"}</p>
                    <p>Location: {group.location_type === "home" ? `${place} area` : group.public_location}</p>
                    {group.location_type === "home" && group.address ? <p>Private address: {group.address}</p> : null}
                    {group.status === "approved" || group.status === "paused" ? (
                      <div className="pt-2">
                        <GroupStatusToggle groupId={group.id} serverLive={group.status === "approved"} />
                      </div>
                    ) : null}
                    <div className="pt-2">
                      <button type="button" disabled={busy === group.id} onClick={() => void send(group.id, { action: "group", decision: group.status === "suspended" ? "reactivate" : "suspend" })} className="inline-flex h-10 items-center rounded-full border border-black/10 px-3 text-sm">
                        {group.status === "suspended" ? "Reactivate" : "Suspend group"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-[#666]">{groupTotal} group{groupTotal === 1 ? "" : "s"} · page {page} of {Math.max(1, Math.ceil(groupTotal / 20))}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Location changes</h2>
        {locationChanges.filter((item) => item.status === "pending").length === 0 ? <p className="mt-3 text-sm text-[#666]">No location changes are waiting.</p> : null}
        <ul className="mt-4 space-y-3">
          {locationChanges.filter((item) => item.status === "pending").map((item) => (
            <li key={item.id} className="rounded-3xl bg-white p-4 text-sm shadow-sm">
              <p>Public location: {item.public_location}</p>
              {item.private_address ? <p className="mt-1">Private address: {item.private_address}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void send(item.id, { action: "location", decision: "approve", publicLocation: item.public_location })} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Approve public location</button>
                <button type="button" onClick={() => void send(item.id, { action: "location", decision: "reject" })} className="inline-flex h-11 items-center rounded-full border border-black/10 px-4 text-sm">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Interested people</h2>
        {requests.length === 0 ? <p className="mt-3 text-sm text-[#666]">No join requests yet.</p> : null}
        <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white">
          {requests.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{item.first_name} · <a href={`tel:${dialPhone(item.phone)}`}>{displayPhone(item.phone)}</a>{item.email ? ` · ${item.email}` : ""}</span>
              <span className="text-[#666]">{item.status}{item.address_shared ? " · address shared" : ""}</span>
            </li>
          ))}
        </ul>
      </section>
      {viewing ? <GroupDrawer group={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}

function GroupDrawer({ group, onClose }: { group: Group; onClose: () => void }) {
  const locationType = group.location_type === "home" || group.location_type === "other" ? group.location_type : "public_venue";
  const profile: PublicGroup = {
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    city: group.city,
    state: group.state ?? null,
    country: group.country || "",
    location_type: locationType,
    public_location: group.public_location,
    address: locationType === "home" ? null : group.address ?? null,
    latitude: Number(group.latitude ?? 0),
    longitude: Number(group.longitude ?? 0),
    meeting_day: group.meeting_day ?? null,
    meeting_time: group.meeting_time ?? null,
    leader_name: group.leader_name,
    leader_photo_url: group.leader_photo_url ?? null,
    co_leader_name: group.co_leader_name ?? null,
    co_leader_photo_url: group.co_leader_photo_url ?? null,
    members: group.members,
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="flex h-full w-full flex-col overflow-y-auto bg-[#f4f7fb] shadow-xl sm:w-[440px]" role="dialog" aria-modal="true" aria-label={group.name} onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center justify-between px-4">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center text-sm font-semibold sm:hidden">Close</button>
          <p className="text-sm font-semibold">Group profile</p>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center"><X size={18} /></button>
        </div>
        <div className="px-4 pb-6">
          <JoinGroupForm group={profile} variant="page" hideJoin availability={group.status === "paused" ? "paused" : group.status === "approved" ? "live" : undefined} statusLabel={group.status === "approved" || group.status === "paused" ? undefined : pillLabel(group.status)} />
        </div>
      </aside>
    </div>
  );
}

function MarketingLink({ group }: { group: Group }) {
  const url = groupMarketingUrl(group);
  return (
    <>
      <CopyButton value={url} idleLabel="Copy Marketing Link" successLabel="Copied!" variant="icon" className="border border-[#e6ebf2]" />
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open marketing page" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e6ebf2] text-[#1976F3]">
        <ExternalLink size={15} aria-hidden />
      </a>
    </>
  );
}

function listHref(filter: Filter, query: string, page: number) {
  const params = new URLSearchParams();
  if (filter !== "pending") params.set("status", filter);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const text = params.toString();
  return text ? `/app/admin?${text}` : "/app/admin";
}

function pillLabel(status: string) {
  if (status === "pending") return "Pending";
  if (status === "changes_requested") return "Changes";
  if (status === "approved") return "Approved";
  if (status === "suspended") return "Suspended";
  return status.replaceAll("_", " ");
}

function pillClass(status: string) {
  if (status === "approved") return "bg-[#e8f8ee] text-[#157a3a]";
  if (status === "suspended" || status === "rejected") return "bg-[#f3f4f6] text-[#444]";
  return "bg-[#fff7ed] text-[#9a3412]";
}
