import Link from "next/link";

export function GrowCta() {
  return (
    <section className="mt-12 rounded-3xl border border-[#d5deea] bg-[#f8fafc] px-5 py-8 text-center sm:px-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[#142033]">Grow Your Faith Together</h2>
      <p className="mt-2 text-base text-[#52627a]">Read the Bible. Talk about it. Pray together.</p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/#groups" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white sm:w-auto">
          Find a Group
        </Link>
        <Link href="/app/start" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#1976F3] bg-white px-5 text-sm font-semibold text-[#1976F3] sm:w-auto">
          Start a Group
        </Link>
      </div>
    </section>
  );
}
