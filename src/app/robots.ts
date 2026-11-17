import type { MetadataRoute } from "next";
import { SITE } from "@/lib/groups/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/admin", "/dashboard", "/login", "/signup", "/csv", "/profile", "/leader", "/events", "/training"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
