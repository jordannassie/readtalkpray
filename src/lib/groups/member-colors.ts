const GRADIENTS = [
  "linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)",
  "linear-gradient(135deg, #F43F8A 0%, #FB7185 100%)",
  "linear-gradient(135deg, #A855F7 0%, #6366F1 100%)",
  "linear-gradient(135deg, #10B981 0%, #84CC16 100%)",
  "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
  "linear-gradient(135deg, #14B8A6 0%, #38BDF8 100%)",
] as const;

function hashGroupId(groupId: string) {
  let hash = 2166136261;
  for (let index = 0; index < groupId.length; index += 1) {
    hash ^= groupId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function groupMemberColors(groupId: string) {
  const ranked = GRADIENTS.map((gradient, index) => ({ gradient, rank: hashGroupId(`${groupId}:${index}`) }));
  ranked.sort((left, right) => left.rank - right.rank);
  return ranked.slice(0, 4).map((item) => item.gradient);
}

export function groupMemberLabel(count: number) {
  const total = Math.max(0, Math.floor(count));
  return `${total} Group ${total === 1 ? "Member" : "Members"}`;
}
