const GRADIENTS = [
  "linear-gradient(135deg, #3E6BA8 0%, #6A90C0 100%)",
  "linear-gradient(135deg, #B56B80 0%, #C992A4 100%)",
  "linear-gradient(135deg, #6E629E 0%, #8B84B8 100%)",
  "linear-gradient(135deg, #3F7F6C 0%, #6A9E88 100%)",
  "linear-gradient(135deg, #B56E48 0%, #C99670 100%)",
  "linear-gradient(135deg, #3A7C82 0%, #6A9EAA 100%)",
  "linear-gradient(135deg, #A85A68 0%, #C08A78 100%)",
  "linear-gradient(135deg, #54648F 0%, #7278A4 100%)",
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
