"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ARTICLES, FEATURED, TOPICS, filterArticles } from "@/lib/christianity/articles";

export function ChristianityCenter() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterArticles(ARTICLES, query), [query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <section className="bg-gradient-to-b from-[#1d74e0] to-[#0e4ea8] text-white">
        <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Questions About Christianity?</h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">Simple, Bible-based answers to life&apos;s biggest questions.</p>
            <label className="relative mx-auto mt-6 block max-w-xl text-left">
              <span className="sr-only">Search questions</span>
              <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search questions..."
                className="h-12 w-full rounded-full border border-white/40 bg-white pr-4 pl-11 text-base text-[#142033] outline-none placeholder:text-[#667085] focus:border-white"
              />
            </label>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {FEATURED.map((card) => (
              <li key={card.slug}>
                <article className="relative h-[460px] overflow-hidden rounded-[28px] sm:h-[520px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h2 className="text-3xl font-semibold tracking-tight text-white">{card.title}</h2>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90">{card.description}</p>
                    <Link
                      href={`/christianity/${card.slug}`}
                      className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-white px-4 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#142033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {card.button}
                      <ArrowRight size={16} aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6" aria-live="polite">
        <h2 className="text-2xl font-semibold tracking-tight text-[#142033]">Answers by topic</h2>
        {results.length === 0 ? <p className="mt-6 text-[#52627a]">No questions match that search.</p> : null}
        <div className="mt-6 space-y-8">
          {TOPICS.map((topic) => {
            const items = results.filter((article) => article.topic === topic);
            if (!items.length) return null;
            return (
              <section key={topic}>
                <h3 className="text-sm font-semibold tracking-wide text-[#1976F3]">{topic}</h3>
                <ul className="mt-3 divide-y divide-[#e6ebf2] rounded-3xl border border-[#e6ebf2] bg-white">
                  {items.map((article) => (
                    <li key={article.slug}>
                      <Link href={`/christianity/${article.slug}`} className="block px-5 py-4 hover:bg-[#f8fafc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1976F3]">
                        <span className="block text-base font-semibold text-[#142033]">{article.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-[#52627a]">{article.intro}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        {searching ? <p className="mt-4 text-sm text-[#667085]">{results.length} {results.length === 1 ? "question" : "questions"}</p> : null}
      </section>
    </>
  );
}
