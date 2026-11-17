import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowCta } from "@/components/christianity/GrowCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SHARE_IMAGE } from "@/components/brand/logos";
import { ARTICLES, FEATURED, getArticle, relatedArticles } from "@/lib/christianity/articles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `https://readtalkpray.com/christianity/${article.slug}`;
  const image = FEATURED.find((card) => card.slug === article.slug)?.image ?? SHARE_IMAGE;
  return {
    title: `${article.title} · Read Talk Pray`,
    description: article.intro,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.intro,
      url,
      siteName: "Read Talk Pray",
      type: "article",
      images: [{ url: image, alt: article.title }],
    },
  };
}

export default async function ChristianityArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = relatedArticles(article.slug);
  const url = `https://readtalkpray.com/christianity/${article.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.intro,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "Read Talk Pray" },
        publisher: { "@type": "Organization", name: "Read Talk Pray" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: article.title,
            acceptedAnswer: { "@type": "Answer", text: [article.intro, ...article.paragraphs].join(" ") },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-[#142033]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader activeHref="/christianity" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/christianity" className="text-sm font-semibold text-[#1976F3]">Christianity</Link>
        <p className="mt-5 text-sm font-semibold text-[#1976F3]">{article.topic}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{article.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#334155]">{article.intro}</p>
        <h2 className="mt-8 text-sm font-semibold tracking-wide text-[#52627a]">Bible</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {article.references.map((reference) => (
            <li key={reference} className="rounded-full bg-[#e8f1ff] px-3 py-1 text-sm font-medium text-[#1565d8]">{reference}</li>
          ))}
        </ul>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-[#1c1c1c]">
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <h2 className="mt-10 text-xl font-semibold tracking-tight">Related questions</h2>
        <ul className="mt-3 space-y-2">
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={`/christianity/${item.slug}`} className="font-medium text-[#1976F3] hover:underline">{item.title}</Link>
            </li>
          ))}
        </ul>
        <GrowCta />
      </main>
      <SiteFooter />
    </div>
  );
}
