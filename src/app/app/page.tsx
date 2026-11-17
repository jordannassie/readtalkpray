import Link from "next/link";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { BibleGroupGuide } from "@/components/app/BibleGroupGuide";
import { loadAccount } from "@/lib/auth/account";
import { loadChecklist } from "@/lib/checklist";
import { ImpactCounters } from "@/components/app/ImpactCounters";
import { loadImpact } from "@/lib/impact";
import { googleAvatar } from "@/lib/auth/profile";
import { ownsGroup } from "@/lib/groups/ownership";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  const name = account.profile.full_name || "Welcome";
  const hasGroup = ownsGroup(account.applications, account.groups);
  const steps = await loadChecklist();
  const impactGroup = account.groups.find((group) => (group.status === "approved" || group.status === "paused") && (group.leader_user_id === account.user?.id || account.admin));
  const impact = impactGroup ? await loadImpact(impactGroup.id) : null;
  return (
    <div>
      <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#0a4cb5_0%,#1976F3_46%,#49d0ff_100%)] px-5 py-8 text-center text-white shadow-[0_18px_40px_rgba(21,101,216,0.28)] sm:px-10 sm:py-10">
        <div className="rtp-banner-flow pointer-events-none absolute -top-24 -right-16 h-64 w-80 rounded-full bg-white/20 blur-2xl" />
        <div className="rtp-banner-flow pointer-events-none absolute top-10 -left-20 h-44 w-72 rounded-[45%] bg-[#8ee7ff]/35 blur-xl" style={{ animationDelay: "-6s" }} />
        <div className="rtp-banner-flow pointer-events-none absolute -bottom-24 left-1/4 h-48 w-96 rotate-6 rounded-full bg-[#083a8a]/35" style={{ animationDelay: "-11s" }} />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <ProfilePhoto
            userId={account.profile.user_id}
            name={account.profile.full_name}
            email={account.user.email ?? ""}
            photoUrl={account.profile.photo_url}
            googlePhotoUrl={googleAvatar(account.user)}
            fullName={account.profile.full_name}
            phone={account.profile.phone}
            framed
            responsive
          />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{name}</h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">Welcome. Read, talk, and pray with people near you.</p>
          <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-3 min-[460px]:grid-cols-2">
            <Link href="/app/groups" className="flex h-12 items-center justify-center rounded-full bg-white px-4 text-center text-sm font-semibold text-[#1565d8] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">Find a Group</Link>
            <Link href={hasGroup ? "/app/group" : "/app/start"} className="flex h-12 items-center justify-center rounded-full bg-white/10 px-4 text-center text-sm font-semibold text-white ring-1 ring-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">{hasGroup ? "My Group" : "Start a Group"}</Link>
          </div>
        </div>
      </section>
      <AccountDashboard
        focus="home"
        profile={account.profile}
        email={account.user.email ?? ""}
        isAdmin={account.admin}
        applications={account.applications}
        groups={account.groups}
        requests={account.requests}
        details={account.details}
        locationChanges={account.locationChanges}
        invites={account.invites}
      />
      {impactGroup && impact ? <ImpactCounters groupId={impactGroup.id} initial={impact} /> : null}
      <BibleGroupGuide steps={steps} />
    </div>
  );
}
