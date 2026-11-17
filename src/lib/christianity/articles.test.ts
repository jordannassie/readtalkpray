import assert from "node:assert/strict";
import test from "node:test";
import { ARTICLES, FEATURED, filterArticles, scriptureHref } from "./articles";
import { QUESTION_CARDS } from "./questions";

test("featured questions are in the library", () => {
  for (const card of FEATURED) {
    assert.equal(ARTICLES.some((article) => article.slug === card.slug && article.title === card.title), true);
  }
});

test("search matches title, topic, and keywords", () => {
  assert.equal(filterArticles(ARTICLES, "baptized").some((article) => article.slug === "why-get-baptized"), true);
  assert.equal(filterArticles(ARTICLES, "prayer").some((article) => article.topic === "Prayer"), true);
  assert.equal(filterArticles(ARTICLES, "resurrection").some((article) => article.slug === "did-jesus-rise-from-the-dead"), true);
  assert.equal(filterArticles(ARTICLES, "who is jesus").some((article) => article.slug === "who-is-jesus"), true);
  assert.equal(filterArticles(ARTICLES, "zzzz-no-match").length, 0);
});

test("new questions are searchable articles with images", () => {
  const slugs = new Set(ARTICLES.map((article) => article.slug));
  assert.equal(slugs.size, ARTICLES.length);
  assert.equal(QUESTION_CARDS.length, 10);
  for (const card of QUESTION_CARDS) {
    const article = ARTICLES.find((item) => item.slug === card.slug);
    assert.ok(article);
    assert.equal(article.title, card.title);
    assert.equal(article.image, card.image);
    assert.ok(article.sections && article.sections.length >= 3);
    assert.ok(article.cta);
    for (const reference of article.references) assert.ok(scriptureHref(reference), reference);
  }
  const prayer = filterArticles(ARTICLES, "prayer").map((article) => article.slug);
  assert.ok(prayer.includes("how-do-i-pray"));
  assert.ok(prayer.includes("does-god-hear-my-prayers"));
  for (const word of ["church", "friends"]) {
    const found = filterArticles(ARTICLES, word).map((article) => article.slug);
    assert.ok(found.includes("why-join-a-bible-group"));
    assert.ok(found.includes("how-can-i-find-community"));
  }
  const jesus = filterArticles(ARTICLES, "jesus").map((article) => article.slug);
  assert.ok(jesus.includes("who-is-jesus"));
  assert.ok(jesus.includes("how-do-i-follow-jesus"));
});
