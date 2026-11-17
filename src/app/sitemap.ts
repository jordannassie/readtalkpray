import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/christianity/articles";
import { listApprovedGroups } from "@/lib/groups/queries";
import { SITE } from "@/lib/groups/seo";
import { groupPublicPath } from "@/lib/groups/slug";

const PAGES = ["", "/why", "/christianity", "/privacy", "/terms", "/statement-of-faith", "/leader-commitments"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const groups = await listApprovedGroups().catch(() => []);
  return [
    ...PAGES.map((path) => ({ url: path ? `${SITE}${path}` : `${SITE}/` })),
    ...ARTICLES.map((article) => ({ url: `${SITE}/christianity/${article.slug}` })),
    ...groups.filter((group) => !group.is_demo).map((group) => ({ url: `${SITE}${groupPublicPath(group)}` })),
  ];
}
