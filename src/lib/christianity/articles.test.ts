import assert from "node:assert/strict";
import test from "node:test";
import { ARTICLES, FEATURED, filterArticles } from "./articles";

test("featured questions are in the library", () => {
  for (const card of FEATURED) {
    assert.equal(ARTICLES.some((article) => article.slug === card.slug && article.title === card.title), true);
  }
});

test("search matches title, topic, and keywords", () => {
  assert.equal(filterArticles(ARTICLES, "baptized").some((article) => article.slug === "why-get-baptized"), true);
  assert.equal(filterArticles(ARTICLES, "prayer").every((article) => article.topic === "Prayer"), true);
  assert.equal(filterArticles(ARTICLES, "resurrection").some((article) => article.slug === "did-jesus-rise-from-the-dead"), true);
  assert.equal(filterArticles(ARTICLES, "zzzz-no-match").length, 0);
});
