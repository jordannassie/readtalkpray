const GRADIENTS = [
  "linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)",
  "linear-gradient(135deg, #F43F8A 0%, #FB7185 100%)",
  "linear-gradient(135deg, #A855F7 0%, #6366F1 100%)",
  "linear-gradient(135deg, #10B981 0%, #84CC16 100%)",
  "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
  "linear-gradient(135deg, #14B8A6 0%, #38BDF8 100%)",
  "linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)",
  "linear-gradient(135deg, #38BDF8 0%, #4F46E5 100%)",
] as const;

const GRADIENT_SETS: number[][] = [];
for (let first = 0; first < GRADIENTS.length; first += 1) {
  for (let second = first + 1; second < GRADIENTS.length; second += 1) {
    for (let third = second + 1; third < GRADIENTS.length; third += 1) {
      for (let fourth = third + 1; fourth < GRADIENTS.length; fourth += 1) {
        GRADIENT_SETS.push([first, second, third, fourth]);
      }
    }
  }
}

function hashGroupId(groupId: string) {
  let hash = 2166136261;
  for (let index = 0; index < groupId.length; index += 1) {
    hash ^= groupId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function permute<T>(items: readonly T[], seed: number) {
  const copy = [...items];
  let state = seed || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = Math.imul(state ^ (state >>> 15), 2246822519) >>> 0;
    const swap = state % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function groupMemberColors(groupId: string) {
  const hash = hashGroupId(groupId);
  const chosen = GRADIENT_SETS[hash % GRADIENT_SETS.length].map((index) => GRADIENTS[index]);
  return permute(chosen, hashGroupId(`${groupId}:order`));
}

export function groupMemberLabel(count: number) {
  const total = Math.max(0, Math.floor(count));
  return `${total} Group ${total === 1 ? "Member" : "Members"}`;
}
