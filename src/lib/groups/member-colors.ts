const COLORS = ["#1D4ED8", "#15803D", "#C2410C", "#6D28D9", "#BE185D", "#0F766E", "#3730A3", "#BE123C"] as const;

function hashGroupId(groupId: string) {
  let hash = 2166136261;
  for (let index = 0; index < groupId.length; index += 1) {
    hash ^= groupId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function groupMemberColors(groupId: string) {
  const hash = hashGroupId(groupId);
  const start = hash % COLORS.length;
  const step = [1, 3, 5, 7][Math.floor(hash / COLORS.length) % 4];
  return Array.from({ length: 4 }, (_, offset) => COLORS[(start + offset * step) % COLORS.length]);
}

export function groupMemberLabel(count: number) {
  const total = Math.max(0, Math.floor(count));
  return `${total} Group ${total === 1 ? "Member" : "Members"}`;
}
