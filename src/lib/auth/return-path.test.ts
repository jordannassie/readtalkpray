import assert from "node:assert/strict";
import test from "node:test";
import { publicRequestOrigin, safeAppReturnPath } from "./return-path";

test("allows the account pages", () => {
  assert.equal(safeAppReturnPath("/app"), "/app");
  assert.equal(safeAppReturnPath("/app/group"), "/app/group");
  assert.equal(safeAppReturnPath("/dashboard"), "/dashboard");
  assert.equal(safeAppReturnPath("/login/update-password"), "/login/update-password");
  assert.equal(safeAppReturnPath("/admin"), "/admin");
});

test("uses the public host when Netlify rewrites the request URL", () => {
  const request = new Request("https://6af780b41d2e9a534d491cfe--readtalkpray.netlify.app/auth/callback", {
    headers: { "x-forwarded-host": "readtalkpray.com", "x-forwarded-proto": "https" },
  });
  assert.equal(publicRequestOrigin(request), "https://readtalkpray.com");
});

test("keeps production auth redirects on the public site", () => {
  const previous = { CONTEXT: process.env.CONTEXT, URL: process.env.URL };
  process.env.CONTEXT = "production";
  process.env.URL = "https://readtalkpray.com";
  try {
    const request = new Request("https://6af780b41d2e9a534d491cfe--readtalkpray.netlify.app/auth/callback");
    assert.equal(publicRequestOrigin(request), "https://readtalkpray.com");
  } finally {
    if (previous.CONTEXT === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = previous.CONTEXT;
    if (previous.URL === undefined) delete process.env.URL;
    else process.env.URL = previous.URL;
  }
});

test("rejects open redirects", () => {
  assert.equal(safeAppReturnPath("https://example.com"), null);
  assert.equal(safeAppReturnPath("//example.com"), null);
  assert.equal(safeAppReturnPath("/dashboard/../../admin"), null);
  assert.equal(safeAppReturnPath("/app/../admin"), null);
  assert.equal(safeAppReturnPath("/unknown"), null);
});
