"use client";

import Link from "next/link";
import { useDemoAuth } from "@/lib/demo/auth";

export function AccountLink({ className = "" }: { className?: string }) {
  const { user, ready } = useDemoAuth();
  if (!ready) return null;

  return (
    <Link href={user ? "/dashboard" : "/login"} className={className}>
      {user ? "Dashboard" : "Login"}
    </Link>
  );
}
