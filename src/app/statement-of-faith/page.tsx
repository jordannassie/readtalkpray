import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BELIEFS } from "@/components/home/Beliefs";

export const metadata: Metadata = {
  title: "Statement of Faith · Read Talk Pray",
  description: "The statement of faith for Read Talk Pray groups.",
};

export default function StatementOfFaithPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 text-[#1c1c1c]">
        <h1 className="text-4xl font-semibold tracking-tight">Statement of Faith</h1>
        <p className="mt-4 text-base leading-relaxed">
          We believe the Bible is God&apos;s Word, Jesus Christ is Lord, and every believer is called to follow Jesus, make disciples, and share the gospel with the world.
        </p>
        <ol className="mt-8 space-y-6">
          {BELIEFS.map((item, index) => (
            <li key={item.title}>
              <h2 className="text-xl font-semibold tracking-tight">{index + 1}. {item.title}</h2>
              <p className="mt-1 text-base leading-relaxed">{item.body}</p>
              <p className="mt-1 text-sm text-[#666]">Scripture: {item.scripture}</p>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
