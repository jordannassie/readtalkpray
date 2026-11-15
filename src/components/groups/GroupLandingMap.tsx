"use client";

import dynamic from "next/dynamic";
import type { PublicGroup } from "@/lib/groups/types";

const GroupsMap = dynamic(() => import("@/components/home/GroupsMap").then((mod) => mod.GroupsMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[280px] animate-pulse bg-[#e7eef8]" />,
});

export function GroupLandingMap({ group }: { group: PublicGroup }) {
  return <GroupsMap groups={[group]} focus={null} selectedId={group.id} onSelect={() => undefined} />;
}
