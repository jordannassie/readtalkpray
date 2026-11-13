import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Terms of Use · Read Talk Pray",
  description: "Terms for using the Read Talk Pray website, accounts, and group tools.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 text-[#1c1c1c]">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="mt-4 text-sm text-[#666]">Last updated November 13, 2026. These terms describe the website as it works today. They have not been reviewed by a lawyer.</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight">
          <h2>Using the site</h2>
          <p>
            Read Talk Pray is a website for finding a Bible study group, asking to join one, or applying to start one. You may use the public pages without an account. Starting a group and opening the dashboard require a sign-in.
          </p>
          <h2>Accounts</h2>
          <p>
            You can sign in with email and a password or with Google. You are responsible for the activity on your account. Google sign-in only works for accounts Google currently allows while the Google app is in testing. If you continue with Google, Google may provide the email address, name, and profile photo used for the account. Email confirmation and password reset depend on the message reaching your inbox. How that information is stored is described in the <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <h2>Groups</h2>
          <p>
            A group application is not a published group. It stays pending until an admin approves it. Only an approved, active group appears on the public map. Pending, rejected, paused, and suspended groups stay off the map.
          </p>
          <p>
            Groups are locally led. Read Talk Pray does not collect donations on this site, and a group does not need a building. The site is a way to read the Bible, talk about it, and pray together. It does not replace the responsibilities of a local church, including baptism, communion, and the ongoing care of a congregation.
          </p>
          <h2>Your information</h2>
          <p>
            You agree that the name, phone number, photo, and meeting details you submit are accurate. A private home address is not placed on the public map. If you later change the public location, the last approved public location stays up until an admin approves the change.
          </p>
          <p>
            If you ask to join a group, you agree that your name and phone number may be shown to that group&apos;s leader and to site admins so they can contact you.
          </p>
          <h2>Leaders</h2>
          <p>
            Applying to lead means confirming that you have attended a Read Talk Pray group, that you agree to the statement of faith published on this site, that you accept the leader commitments shown on the application, and that you will join the monthly leader Zoom meeting. An admin may call or email you before approving the group.
          </p>
          <h2>Administration</h2>
          <p>
            Admins may approve, reject, request changes, suspend, or reactivate a group. Suspension removes the group from the public map. Admin access is not granted by signing up.
          </p>
          <h2>Acceptable use</h2>
          <p>
            Do not use the site to post someone else&apos;s contact information without their consent, to misrepresent a meeting location, or to attempt to access another person&apos;s application, another group&apos;s interested people, or the admin tools.
          </p>
          <h2>Missing legal details</h2>
          <p>
            A legal entity, governing law, venue, and liability cap are not stated here because they are not established on this site. These terms are not a substitute for legal advice.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
