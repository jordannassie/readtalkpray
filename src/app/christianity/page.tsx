import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ChristianityCenter } from "@/components/christianity/ChristianityCenter";
import { ARTICLES, articlePlainText } from "@/lib/christianity/articles";
import { publicMetadata } from "@/lib/groups/seo";

export const metadata: Metadata = publicMetadata({
  title: "Questions About Christianity",
  description: "Simple, Bible-based answers to life's biggest questions. Learn about Jesus, baptism, the Bible, and Bible groups.",
  path: "/christianity",
});

export default function ChristianityPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ARTICLES.map((article) => ({
      "@type": "Question",
      name: article.title,
      acceptedAnswer: { "@type": "Answer", text: articlePlainText(article) },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-[#142033]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <SiteHeader activeHref="/christianity" />
      <main>
        <ChristianityCenter />
      </main>
      <SiteFooter />
    </div>
  );
}
