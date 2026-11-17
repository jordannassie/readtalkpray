import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/christianity/articles";

const SITE = "https://readtalkpray.com";

const PAGES = ["", "/christianity", "/privacy", "/terms", "/statement-of-faith", "/leader-commitments", "/start-a-church"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: `${SITE}${path || "/"}` })),
    ...ARTICLES.map((article) => ({ url: `${SITE}/christianity/${article.slug}` })),
  ];
}
