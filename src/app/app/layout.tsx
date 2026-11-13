import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { loadAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "App · Read Talk Pray",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  themeColor: "#1976F3",
  viewportFit: "cover",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await loadAccount();
  if (!account.configured) return <main className="mx-auto max-w-lg px-5 py-16">Supabase is not configured.</main>;
  if (!account.user) redirect("/login?next=/app");
  return (
    <AppShell name={account.profile.full_name} photoUrl={account.profile.photo_url} isAdmin={account.admin}>
      {children}
    </AppShell>
  );
}
