"use client";

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
  attended?: boolean;
  faith_agreed?: boolean;
  commitments_agreed?: boolean;
  zoom_agreed?: boolean;
  privacy_agreed?: boolean;
  group_id?: string | null;
};

type JoinRequest = { id: string; first_name: string; phone: string; email: string | null; status: string; address_shared: boolean; group_id: string };
type Group = { id: string; name: string; city: string; status: string; public_location: string; leader_name: string };
type Review = { id: string; application_id: string; action: string; note: string | null; message: string | null; created_at: string };
type LocationChange = { id: string; group_id: string; public_location: string; private_address: string | null; status: string };

const CHECK_LABELS: Record<(typeof REVIEW_CHECKS)[number], string> = {
  contacted: "Contacted the applicant personally",
  phoneConversation: "Completed a phone conversation",
  attended: "Verified they attended Read Talk Pray once",
  faithCommitments: "Confirmed the statement of faith and leader commitments",
  locationReviewed: "Reviewed the meeting location",
  locationApproved: "Approved the meeting location",
};

const emptyChecks = Object.fromEntries(REVIEW_CHECKS.map((key) => [key, false])) as Record<(typeof REVIEW_CHECKS)[number], boolean>;

export function AdminReview({
  applications,
  requests,
  groups,
  reviews,
  locationChanges,
}: {
  applications: Application[];
  requests: JoinRequest[];
  groups: Group[];
  reviews: Review[];
  locationChanges: LocationChange[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [checks, setChecks] = useState(emptyChecks);
  const pending = applications.filter((item) => item.status === "pending" || item.status === "changes_requested");
  const counts = {
    pending: applications.filter((item) => item.status === "pending").length,
    approved: groups.filter((item) => item.status === "approved").length,
    active: groups.filter((item) => item.status === "approved").length,
    leaders: new Set(groups.map((item) => item.leader_name)).size,
    interested: requests.length,
    suspended: groups.filter((item) => item.status === "suspended").length,
  };

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

      <section>
        <h2 className="text-xl font-semibold">Application review</h2>
        {pending.length === 0 ? <p className="mt-3 text-sm text-[#666]">No applications are waiting.</p> : null}
        <ul className="mt-4 space-y-4">
          {pending.map((item) => {
            const history = reviews.filter((review) => review.application_id === item.id);
            return (
              <li key={item.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  {item.leader_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.leader_photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : null}
                  <div>
                    <p className="font-semibold">{item.leader_name}</p>
                    <p className="text-sm text-[#555]">{item.group_name || "Group name not provided"} · {item.status.replaceAll("_", " ")}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{item.email} · <a className="font-semibold text-[#1976F3]" href={`tel:${item.phone}`}>{item.phone}</a></p>
                <p className="mt-1 text-sm">
                  <a className="font-semibold text-[#1976F3]" href={`mailto:${item.email ?? ""}`}>Email applicant</a>
                </p>
                <p className="mt-3 text-sm text-[#444]">
                  {[item.city, item.state, item.country].filter(Boolean).join(", ")} · {item.location_type.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-[#444]">{item.meeting_location}</p>
                <p className="mt-1 text-sm text-[#444]">{[item.meeting_day, item.meeting_time, item.duration, item.timezone].filter(Boolean).join(" · ")}</p>
                {item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Attended a group: {item.attended ? "Yes" : "No"}</li>
                  <li>Statement of faith: {item.faith_agreed ? "Agreed" : "Not agreed"}</li>
                  <li>Leader commitments: {item.commitments_agreed ? "Agreed" : "Not agreed"}</li>
                  <li>Monthly leader Zoom: {item.zoom_agreed ? "Agreed" : "Not agreed"}</li>
                  <li>Contact and privacy consent: {item.privacy_agreed ? "Yes" : "No"}</li>
                </ul>
                <fieldset className="mt-4 space-y-2">
                  <legend className="text-sm font-semibold">Approval checklist</legend>
                  {REVIEW_CHECKS.map((key) => (
                    <label key={key} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checks[key]}
                        onChange={(event) => setChecks((current) => ({ ...current, [key]: event.target.checked }))}
                      />
                      {CHECK_LABELS[key]}
                    </label>
                  ))}
                </fieldset>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { decision: "approve", checklist: checks })} className="rounded-full bg-[#1976F3] px-4 py-2 text-sm font-semibold text-white">Approve group</button>
                  <button type="button" disabled={busy === item.id} onClick={() => void send(item.id, { action: "suspend" })} className="rounded-full border border-black/10 px-4 py-2 text-sm">Suspend</button>
                </div>
                <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); const message = String(new FormData(event.currentTarget).get("message") ?? ""); void send(item.id, { action: "request_changes", message }); }}>
                  <input name="message" placeholder="What needs to change" className="h-11 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                  <button className="rounded-full border border-black/10 px-4 text-sm">Request changes</button>
                </form>
                <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); const message = String(new FormData(event.currentTarget).get("message") ?? ""); void send(item.id, { decision: "reject", message }); }}>
                  <input name="message" placeholder="Reason for rejecting" className="h-11 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                  <button className="rounded-full border border-black/10 px-4 text-sm">Reject</button>
                </form>
                <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); const note = String(new FormData(event.currentTarget).get("note") ?? ""); void send(item.id, { action: "note", note }); }}>
                  <input name="note" placeholder="Private admin note" className="h-11 flex-1 rounded-2xl border border-[#e6e6e6] px-3 text-sm" />
                  <button className="rounded-full border border-black/10 px-4 text-sm">Save note</button>
                </form>
                {history.length > 0 ? (
                  <ol className="mt-4 space-y-1 text-xs text-[#555]">
                    {history.map((review) => (
                      <li key={review.id}>{new Date(review.created_at).toLocaleString()} · {review.action}{review.message ? ` · ${review.message}` : ""}{review.note ? ` · ${review.note}` : ""}</li>
                    ))}
                  </ol>
                ) : null}
              </li>
            );
          })}
        </ul>
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
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => void send(item.id, { action: "location", decision: "approve", publicLocation: item.public_location })} className="rounded-full bg-[#1976F3] px-4 py-2 text-sm font-semibold text-white">Approve public location</button>
                <button type="button" onClick={() => void send(item.id, { action: "location", decision: "reject" })} className="rounded-full border border-black/10 px-4 py-2 text-sm">Reject</button>
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
