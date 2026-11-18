import Link from "next/link";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { BLACK_LOGO } from "@/components/brand/logos";
import { StoreBadges } from "@/components/layout/SiteFooter";
import { groupJsonLd, groupSeoDescription, SITE } from "@/lib/groups/seo";
import { groupPublicPath } from "@/lib/groups/slug";
import { cityState, type PublicGroup } from "@/lib/groups/types";

export function GroupLanding({ group }: { group: PublicGroup }) {
  const place = cityState(group);
  const schema = groupJsonLd(group, `${SITE}${groupPublicPath(group)}`);
  return (
    <div className="min-h-screen overflow-x-clip bg-[#eef3fb] text-[#142033]">
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null}
      <header className="flex justify-center px-5 pt-6">
        <BrandMark />
      </header>
      <main className="mx-auto w-full max-w-[600px] px-4 pt-5 pb-10">
        <h1 className="text-center text-[1.85rem] leading-[1.05] font-semibold tracking-tight sm:text-4xl">{place ? `Bible Group in ${place}` : "Join a Bible Group Near You."}</h1>
        <p className="mt-2 text-center text-base text-[#52627a] sm:text-lg">{group.name}. Read the Bible. Talk about it. Pray together.</p>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-[#52627a]">{groupSeoDescription(group)}</p>
        <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm sm:p-7">
          <JoinGroupForm group={group} variant="landing" faces="profile" />
        </div>
        <p className="mt-4 text-center text-xs text-[#6d7b90]">
          <Link href="/privacy" className="underline">Privacy</Link>
        </p>
        <div className="mt-5">
          <StoreBadges align="center" />
        </div>
      </main>
    </div>
  );
}

export function PausedGroupPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#eef3fb] text-[#142033]">
      <header className="flex justify-center px-5 pt-8">
        <BrandMark />
      </header>
      <main className="mx-auto max-w-[600px] px-5 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">This group is paused.</h1>
        <p className="mt-3 text-base leading-relaxed text-[#52627a]">It is not meeting publicly right now, so new signups are closed.</p>
        <p className="mt-8 text-xs text-[#6d7b90]">
          <Link href="/privacy" className="underline">Privacy</Link>
        </p>
        <div className="mt-5">
          <StoreBadges align="center" />
        </div>
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BLACK_LOGO} alt="Read Talk Pray" width={1254} height={1254} className="h-14 w-auto" />
  );
}
