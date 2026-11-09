"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { DEMO_CHURCH } from "@/lib/demo/data";
import { useDemoAuth } from "@/lib/demo/auth";

export default function ProfilePage() {
  const { user } = useDemoAuth();

  return (
    <DashboardShell>
      <p className="text-sm text-[#777]">Profile</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">{user?.name ?? "Jordan"}</h1>
      <div className="mt-8 max-w-lg rounded-[28px] border border-[#eee] bg-white p-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name ?? "Jordan"}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold">{user?.name ?? "Jordan"}</p>
            <p className="text-sm text-[#777]">{DEMO_CHURCH.city}</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-t border-[#f2f2f2] pt-3">
            <dt className="text-[#888]">Church</dt>
            <dd className="font-medium">{user?.church}</dd>
          </div>
          <div className="flex justify-between border-t border-[#f2f2f2] pt-3">
            <dt className="text-[#888]">Role</dt>
            <dd className="font-medium">Demo member</dd>
          </div>
        </dl>
      </div>
    </DashboardShell>
  );
}
