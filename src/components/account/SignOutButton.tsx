import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <form action={signOut}>
      <button type="submit" className={className ?? "rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium"}>
        Sign out
      </button>
    </form>
  );
}
