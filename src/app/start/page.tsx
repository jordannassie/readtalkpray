import type { Metadata } from "next";
import { StartGroupForm } from "@/components/groups/StartGroupForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Start a Group · Read Talk Pray",
  description: "Start a simple Read Talk Pray Bible study wherever you are.",
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Start a Group</h1>
        <p className="mt-3 text-[#555]">
          Anyone can open the Bible, invite a few people, and begin. Share a few details and an administrator will review the group before it appears on the map.
        </p>
        <div className="mt-8">
          <StartGroupForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
