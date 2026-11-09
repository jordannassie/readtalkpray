"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Globe } from "lucide-react";
import { ActionButton } from "@/components/leads/ActionButton";
import { CsvImport } from "@/components/leads/CsvImport";
import { leadNameFields, pageRange, sortLeadsForList, storedLeadName, withoutLeadNameColumns } from "@/lib/leads/csv";
import { LEADS_TABLE } from "@/lib/leads/table";
import { PAGE_SIZE, leadCategory, type LeadCategory, type SendingLead } from "@/lib/leads/types";
import { isWebsiteLead } from "@/lib/leads/website";
import { createClient } from "@/lib/supabase/client";

export function LeadTracker() {
  const [leads, setLeads] = useState<SendingLead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<LeadCategory>("join");
  const [schemaReady, setSchemaReady] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const load = useCallback(async () => {
    setError("");
    const supabase = createClient();
    const { from, to } = pageRange(page, PAGE_SIZE);
    const city = cityFilter.replace(/[%_,]/g, "").trim();
    const group = groupFilter.replace(/[%_,]/g, "").trim();
    const base = () => {
      let query = supabase.from(LEADS_TABLE).select("*", { count: "exact" }).order("created_at", { ascending: false });
      if (city) query = query.or(`city.ilike.%${city}%,location.ilike.%${city}%`);
      if (group) query = query.ilike("group_name", `%${group}%`);
      return query;
    };
    const filtered =
      tab === "start"
        ? base().eq("category", "start")
        : base().or("category.eq.join,category.is.null");
    let { data, error: readError, count } = await filtered.range(from, to);
    if (readError && /category/i.test(readError.message)) {
      setSchemaReady(false);
      if (tab === "start") {
        setLeads([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      ({ data, error: readError, count } = await base().range(from, to));
    } else if (!readError) {
      setSchemaReady(true);
    }

    if (readError) {
      const missing = /schema cache|could not find the table/i.test(readError.message);
      setError(
        missing
          ? "The rtp_leads table is not in this Supabase project yet. Run supabase/rtp.sql."
          : readError.message,
      );
      setLeads([]);
      setLoading(false);
      return;
    }
    setLeads(sortLeadsForList((data ?? []) as SendingLead[]));
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, tab, cityFilter, groupFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function persist(lead: SendingLead, patch: Partial<SendingLead>) {
    setSavingId(lead.id);
    setError("");
    setLeads((current) =>
      sortLeadsForList(current.map((item) => (item.id === lead.id ? { ...item, ...patch } : item))),
    );
    const supabase = createClient();
    const write = (body: Partial<SendingLead>) =>
      supabase.from(LEADS_TABLE).update(body).eq("id", lead.id);
    let { error: writeError } = await write(patch);
    if (writeError && /first_name|last_name/i.test(writeError.message)) {
      ({ error: writeError } = await write(withoutLeadNameColumns(patch)));
    }
    setSavingId(null);
    if (writeError) {
      setLeads((current) => sortLeadsForList(current.map((item) => (item.id === lead.id ? lead : item))));
      setError(writeError.message);
    }
  }

  function saveNames(lead: SendingLead, firstName: string, lastName: string) {
    const current = leadNameFields(lead);
    if (firstName === current.firstName && lastName === current.lastName) return;
    void persist(lead, {
      full_name: storedLeadName(firstName, lastName),
      first_name: firstName,
      last_name: lastName,
    });
  }

  function toggleDone(lead: SendingLead, checked: boolean) {
    if (checked) {
      void persist(lead, {
        status: "contacted",
        contacted_at: lead.contacted_at ?? new Date().toISOString(),
      });
      return;
    }
    void persist(lead, { status: "new", contacted_at: null });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Read Talk Pray Leads.</h1>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          value={cityFilter}
          onChange={(event) => {
            setCityFilter(event.target.value);
            setPage(0);
          }}
          placeholder="Filter by city"
          aria-label="Filter by city"
          className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[var(--sending-blue)]"
        />
        <input
          value={groupFilter}
          onChange={(event) => {
            setGroupFilter(event.target.value);
            setPage(0);
          }}
          placeholder="Filter by group"
          aria-label="Filter by group"
          className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[var(--sending-blue)]"
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Lead types">
        {(
          [
            ["join", "Join a Bible Group"],
            ["start", "New Bible Groups"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => {
              setTab(value);
              setPage(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === value
                ? "bg-[var(--sending-blue)] text-white"
                : "border border-black/10 bg-white text-[#111]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <CsvImport category={tab} onImported={() => void load()} />
      </div>
      {error ? (
        <p className="mt-4 rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm text-[#9a3412]" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="mt-6 text-sm text-[#666]">Loading leads…</p> : null}
      {!loading && !schemaReady && tab === "start" ? (
        <p className="mt-6 text-sm text-[#666]">
          New Bible Groups will show here after the leads database update is applied.
        </p>
      ) : null}
      {!loading && leads.length === 0 && (schemaReady || tab === "join") ? (
        <p className="mt-6 text-sm text-[#666]">
          {tab === "start" ? "No one has asked to start a group yet." : "No one has asked to join a group yet."}
        </p>
      ) : null}
      {leads.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-black/10 bg-white">
          <div
            className="grid min-w-[46rem] grid-cols-[3.5rem_1.1fr_1fr_1fr_1fr] gap-2 border-b border-black/5 px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#666]"
          >
            <span>Done</span>
            <span>{tab === "start" ? "Name" : "First name"}</span>
            <span>Phone</span>
            <span>Group</span>
            <span>City</span>
          </div>
          <ul className="divide-y divide-black/5">
            {leads.map((lead) => (
              <li key={lead.id} data-source={lead.source ?? ""}>
                <LeadRow
                  key={`${lead.id}-${leadCategory(lead.category)}`}
                  lead={lead}
                  wide={tab === "start"}
                  saving={savingId === lead.id}
                  onDone={(checked) => toggleDone(lead, checked)}
                  onSaveName={(firstName) =>
                    saveNames(
                      lead,
                      firstName,
                      tab === "start" ? "" : leadNameFields(lead).lastName,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {total > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <ActionButton tone="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
            Previous
          </ActionButton>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <ActionButton
            tone="secondary"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

function LeadRow({
  lead,
  wide,
  saving,
  onDone,
  onSaveName,
}: {
  lead: SendingLead;
  wide: boolean;
  saving: boolean;
  onDone: (checked: boolean) => void;
  onSaveName: (firstName: string) => void;
}) {
  const names = leadNameFields(lead);
  const savedName = wide ? [names.firstName, names.lastName].filter(Boolean).join(" ") : names.firstName;
  const [firstName, setFirstName] = useState(savedName);
  const phone = lead.phone;
  const location = lead.location?.trim() || "";

  return (
    <div
      className="grid min-w-[46rem] grid-cols-[3.5rem_1.1fr_1fr_1fr_1fr] items-center gap-2 px-3 py-2"
    >
      <label className="flex h-11 w-11 items-center justify-center">
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={lead.status !== "new"}
          disabled={saving}
          aria-label={`Done with ${firstName || "lead"}`}
          onChange={(event) => onDone(event.target.checked)}
        />
      </label>
      <Field
        value={firstName}
        label={wide ? "Name" : "First name"}
        website={isWebsiteLead(lead.source)}
        onChange={setFirstName}
        onCommit={() => onSaveName(firstName.trim())}
        disabled={saving}
      />
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 flex-1 tabular-nums">{phone}</span>
        <CopyButton value={phone} label={`Copy phone ${phone}`} />
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 flex-1">{lead.group_name || "—"}</span>
        {lead.group_name ? <CopyButton value={lead.group_name} label={`Copy group ${lead.group_name}`} /> : null}
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 flex-1">{lead.city || location || "—"}</span>
        {lead.city || location ? (
          <CopyButton value={lead.city || location} label={`Copy city ${lead.city || location}`} />
        ) : null}
      </div>
    </div>
  );
}

function Field({
  value,
  label,
  website,
  onChange,
  onCommit,
  disabled,
}: {
  value: string;
  label: string;
  website: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      {website ? (
        <span
          title="Website"
          aria-label="Website"
          className="group/website relative inline-flex h-11 w-6 shrink-0 items-center justify-center text-[var(--sending-blue)]"
        >
          <Globe size={15} aria-hidden="true" />
          <span
            role="tooltip"
            className="pointer-events-none absolute top-1/2 left-full z-10 ml-1 hidden -translate-y-1/2 rounded-md bg-[#111] px-2 py-1 text-xs font-medium whitespace-nowrap text-white group-hover/website:block"
          >
            Website
          </span>
        </span>
      ) : null}
      <input
        value={value}
        aria-label={label}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-xl bg-transparent px-2 py-2 text-base outline-none focus:bg-black/[0.03]"
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <CopyButton value={value} label={`Copy ${label.toLowerCase()} ${value}`} />
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--sending-blue)]"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
    </button>
  );
}
