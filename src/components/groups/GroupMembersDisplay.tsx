import { UserRound } from "lucide-react";
import { groupMemberColors, groupMemberLabel } from "@/lib/groups/member-colors";

export function GroupMembersDisplay({
  groupId,
  count,
  example = false,
  compact = false,
}: {
  groupId: string;
  count: number;
  example?: boolean;
  compact?: boolean;
}) {
  const colors = groupMemberColors(groupId);
  const size = compact ? 24 : 28;
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex shrink-0 items-center" aria-hidden>
        {colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="relative grid place-items-center rounded-full border-2 border-white text-white"
            style={{ width: size, height: size, marginLeft: index === 0 ? 0 : -8, backgroundColor: color, zIndex: colors.length - index }}
          >
            <UserRound size={compact ? 13 : 15} strokeWidth={2.4} />
          </span>
        ))}
      </span>
      <span className={`${compact ? "text-xs" : "text-sm"} font-medium text-[#142033]`}>
        {groupMemberLabel(count)}
        {example ? <span className="ml-1.5 text-[10px] font-bold tracking-wide text-[#1976F3] uppercase">Example</span> : null}
      </span>
    </p>
  );
}
