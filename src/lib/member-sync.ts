const EVENT = "rtp-members";

export function publishMemberCount(groupId: string, count: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { groupId, count } }));
}

export function subscribeMemberCount(groupId: string, onCount: (count: number) => void) {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ groupId?: string; count?: number }>).detail;
    if (detail?.groupId === groupId && typeof detail.count === "number") onCount(Math.max(0, detail.count));
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
