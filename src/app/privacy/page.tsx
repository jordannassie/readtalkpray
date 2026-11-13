import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy · Read Talk Pray",
  description: "How Read Talk Pray handles accounts, group applications, and interested people.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 text-[#1c1c1c]">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[#666]">Last updated November 13, 2026. This page describes how the site works today. It has not been reviewed by a lawyer.</p>
        <Legal>
          <h2>Who operates this site</h2>
          <p>
            Read Talk Pray is the name used on this website. A legal entity name, mailing address, and designated privacy contact are not published here. Do not treat this page as naming an organization that has not been identified on the site. Questions can be sent through the Start a Group form while signed in.
          </p>
          <h2>Accounts</h2>
          <p>
            You can create an account with email and a password, or continue with Google. Authentication is provided by Supabase Auth. Email accounts may require a confirmation message before a session starts. Google sign-in sends you to Google and then back to this site. While Google authentication is in testing, only Google accounts that have been approved as testers can sign in.
          </p>
          <p>
            If you continue with Google, Google may share the email address, name, and profile photo on that Google account. Read Talk Pray uses those fields to create the account, sign you in, and fill the name and photo on your profile. Google user data is not used for advertising and is not sold. You can remove this site&apos;s access from your Google Account. The account record described on this page remains until it is no longer needed to run the site.
          </p>
          <p>
            A profile stores your name, phone number, and profile photo, along with the time the profile was created. Your email comes from the authentication account. The profile does not store an admin role, and you cannot grant yourself admin access by editing your profile.
          </p>
          <h2>Group applications</h2>
          <p>
            Starting a group asks for your name, phone number, photo, group name, city, state, country, meeting place, day, time, time zone, and an optional description. The application records that you agreed to the statement of faith and leader commitments, and the time that agreement was saved. Prior attendance at a group is not required. A separate privacy checkbox is not stored as accepted.
          </p>
          <p>
            Applications stay pending until an admin reviews them. A private home address is stored separately from the location shown on the public map. The public map shows an approved public location, not an applicant&apos;s private home address, unless an admin has approved that text as the public location.
          </p>
          <h2>Interested people</h2>
          <p>
            Someone who asks to join a group submits a name and phone number. That information is visible to the leader of that group and to admins. It is not shown on the public map or on another group&apos;s dashboard.
          </p>
          <h2>Photos</h2>
          <p>
            Leader and profile photos are stored in Supabase Storage. A photo attached to an approved group can be visible on the public group page.
          </p>
          <h2>Administrators</h2>
          <p>
            Admins can review applications, record private notes, see contact details, approve or reject a group, request changes, suspend a group, and approve a public location. Private admin notes are not shown to the applicant. A message sent with a rejection or a request for changes is shown to that applicant.
          </p>
          <h2>Processors</h2>
          <p>
            The site is hosted on Netlify. Account data, applications, group records, and photos are stored with Supabase. Google handles Google sign-in. Map locations may be geocoded to place a city-level pin. These providers process the data needed to run those features.
          </p>
          <h2>Deleting an account</h2>
          <p>
            Signed-in people can delete an account from Me after signing in again within 15 minutes and typing DELETE. Deletion removes the Read Talk Pray profile, group applications, uploaded Read Talk Pray photos, and groups that person leads, including the interested-person details on those groups. An admin can delete another Read Talk Pray user from the admin dashboard. The deletion is written to an admin-only account event. The main administrator account cannot be deleted, and the last remaining admin cannot be deleted.
          </p>
          <p>
            This login system is shared with an older Sending Church tool. If the same login is a Sending Church admin, Read Talk Pray deletes only its own data and keeps the login so the other tool is not disrupted. That is a completed Read Talk Pray deletion, not a deactivation, and it is not a deletion of Sending Church records. Where a review record must keep the reviewer, the login is also kept after the profile data is removed.
          </p>
          <h2>Retention</h2>
          <p>
            Until someone deletes an account, profile, application, and group records stay while they are needed to run the site. There is no separate automatic deletion schedule. This page does not claim that every backup or legal hold disappears the same minute. No specific legal retention period is published here because one has not been established for this site.
          </p>
          <h2>What this page does not claim</h2>
          <p>
            This policy is not a legal opinion. A privacy contact email, a postal address, a legal entity, and a specific retention period are not published because they are not established on this site.
          </p>
        </Legal>
      </main>
      <SiteFooter />
    </div>
  );
}

function Legal({ children }: { children: ReactNode }) {
  return <div className="mt-8 space-y-4 text-base leading-relaxed [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight">{children}</div>;
}
