"use client";

import { useState } from "react";
import { AdminUsers, type AccountUser } from "@/components/admin/AdminUsers";
import { DemoToggle } from "@/components/admin/DemoToggle";

export function AdminDemoBar({ initial, demoAccounts }: { initial: boolean; demoAccounts: AccountUser[] }) {
  const [enabled, setEnabled] = useState(initial);
  return (
    <>
      <DemoToggle initial={initial} onChange={setEnabled} />
      <AdminUsers demoOn={enabled} demoAccounts={demoAccounts} />
    </>
  );
}
