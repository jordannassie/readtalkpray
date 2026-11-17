import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ChristianityCenter } from "@/components/christianity/ChristianityCenter";
import { ARTICLES } from "@/lib/christianity/articles";

const title = "Questions About Christianity";
const description = "Simple, Bible-based answers to life's biggest questions. Learn about Jesus, baptism, the Bible, and Bible groups.";
const url = "https://readtalkpray.com/christianity";

export const metadata: Metadata = {
  title: `${title} · Read Talk Pray`,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Read Talk Pray", type: "website" },
};

export default function ChristianityPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ARTICLES.map((article) => ({
      "@type": "Question",
      name: article.title,
      acceptedAnswer: { "@type": "Answer", text: [article.intro, ...article.paragraphs].join(" ") },
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
