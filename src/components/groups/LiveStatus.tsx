export function LiveStatus({ live }: { live: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${live ? "text-[#157a3a]" : "text-[#667085]"}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-[#16A34A] motion-reduce:animate-none" : "bg-[#98a2b3]"}`} />
      {live ? "Live" : "Paused"}
    </span>
  );
}

export function LiveToggle({ live, busy, onChange }: { live: boolean; busy?: boolean; onChange: (live: boolean) => void }) {
  return (
    <div className="inline-flex rounded-full bg-[#f2f4f7] p-1">
      <button type="button" disabled={busy || !live} onClick={() => onChange(false)} className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold ${live ? "text-[#667085]" : "bg-white text-[#111]"}`}>Paused</button>
      <button type="button" disabled={busy || live} onClick={() => onChange(true)} className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold ${live ? "bg-white text-[#157a3a]" : "text-[#667085]"}`}>Live</button>
    </div>
  );
}
