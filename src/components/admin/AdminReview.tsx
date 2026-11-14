"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { REVIEW_CHECKS } from "@/lib/auth/review";

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
  co_leader?: { id: string; name: string; email: string; status: string; approved: boolean } | null;
};

type JoinRequest = { id: string; first_name: string; phone: string; email: string | null; status: string; address_shared: boolean; group_id: string };
type Group = { id: string; name: string; city: string; status: string; public_location: string; leader_name: string };
type Review = { id: string; application_id: string; action: string; note: string | null; message: string | null; created_at: string };
type LocationChange = { id: string; group_id: string; public_location: string; private_address: string | null; status: string };
type Filter = "pending" | "approved" | "suspended" | "all";
type Checks = Record<(typeof REVIEW_CHECKS)[number], boolean>;

const CHECK_LABELS: Record<(typeof REVIEW_CHECKS)[number], string> = {
  contacted: "Contacted the applicant personally",
  phoneConversation: "Completed a phone conversation",
  faithCommitments: "Confirmed the statement of faith and leader commitments",
  locationReviewed: "Reviewed the meeting location",
  locationApproved: "Approved the meeting location",
};

const emptyChecks = Object.fromEntries(REVIEW_CHECKS.map((key) => [key, false])) as Checks;
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
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [openId, setOpenId] = useState("");
  const [checks, setChecks] = useState<Record<string, Checks>>({});

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
            const itemChecks = checks[item.id] ?? emptyChecks;
            const place = [item.city, item.state].filter(Boolean).join(", ");
            return (
              <li key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : item.id)}
                  className="flex min-h-[76px] w-full items-center gap-3 px-3 py-2 text-left sm:h-[88px]"
                >
                  {item.leader_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.leader_photo_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e7f0ff] text-sm font-semibold text-[#1976F3]">{item.leader_name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.group_name || "Group name not provided"}</span>
                    <span className="block truncate text-xs text-[#555]">{item.leader_name}{item.co_leader ? ` & ${item.co_leader.name}` : ""} · {place}</span>
                    <span className="block truncate text-xs text-[#777] sm:hidden">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-[#666] sm:block">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillClass(item.status)}`}>{pillLabel(item.status)}</span>
                  <ChevronDown size={18} aria-hidden className={`shrink-0 text-[#667085] transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="space-y-3 border-t border-black/5 px-3 py-4 text-sm">
                    <p>Primary leader: {item.leader_name}</p>
                    <p>{item.email} · <a className="inline-flex min-h-11 items-center font-semibold text-[#1976F3]" href={`tel:${item.phone}`}>{item.phone}</a></p>
                    {item.co_leader ? (
                      <p className="text-[#157a3a]">
                        Co-leader: {item.co_leader.name} · {item.co_leader.email} · {item.co_leader.approved ? "Approved" : item.co_leader.status === "accepted" ? "Accepted" : "Invitation Pending"}
                      </p>
                    ) : (
                      <p className="text-[#667085]">Co-leader: none</p>
                    )}
                    {item.co_leader && item.co_leader.status === "accepted" && !item.co_leader.approved ? (
                      <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { action: "approve_co_leader" })} className="inline-flex h-11 items-center rounded-full bg-[#157a3a] px-4 text-sm font-semibold text-white">Approve co-leader</button>
                    ) : null}
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
                    <fieldset className="space-y-2">
                      <legend className="font-semibold">Approval checklist</legend>
                      {REVIEW_CHECKS.map((key) => (
                        <label key={key} className="flex min-h-11 items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-5 w-5"
                            checked={itemChecks[key]}
                            onChange={(event) => setChecks((current) => ({ ...current, [item.id]: { ...itemChecks, [key]: event.target.checked } }))}
                          />
                          {CHECK_LABELS[key]}
                        </label>
                      ))}
                    </fieldset>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { decision: "approve", checklist: itemChecks })} className="inline-flex h-11 items-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">Approve</button>
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
        <h2 className="text-xl font-semibold">Groups</h2>
        <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white">
          {groups.map((group) => (
            <li key={group.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{group.name} · {group.city} · {group.public_location}</span>
              <span className="text-[#666]">{group.status} · {group.leader_name}</span>
            </li>
          ))}
        </ul>
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
              <span>{item.first_name} · <a href={`tel:${item.phone}`}>{item.phone}</a>{item.email ? ` · ${item.email}` : ""}</span>
              <span className="text-[#666]">{item.status}{item.address_shared ? " · address shared" : ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
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
