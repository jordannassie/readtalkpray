const APPLICATION_STATUSES = new Set(["pending", "changes_requested", "approved", "suspended"]);
const GROUP_STATUSES = new Set(["pending", "approved", "paused", "suspended"]);

export function ownsGroup(
  applications: { status: string }[],
  groups: { status: string }[],
) {
  return applications.some((item) => APPLICATION_STATUSES.has(item.status)) || groups.some((item) => GROUP_STATUSES.has(item.status));
}
