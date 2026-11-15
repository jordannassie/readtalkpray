export function slugifyGroupName(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "bible-group";
}

export function nextGroupSlug(name: string, taken: string[]) {
  const base = slugifyGroupName(name);
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let count = 2;
  while (used.has(`${base}-${count}`)) count += 1;
  return `${base}-${count}`;
}

export function groupPublicPath(group: { id: string; slug?: string | null }) {
  return group.slug ? `/g/${group.slug}` : `/groups/${group.id}`;
}
