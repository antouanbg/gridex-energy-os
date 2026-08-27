import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", process.pid + "-" + Date.now());
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the GrideX Energy OS interface", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>GrideX Energy OS<\/title>/i);
  assert.match(html, /GrideX Energy OS – начало/);
  assert.match(html, /Основна навигация/);
  assert.match(html, /class="mobile-menu-toggle"/);
  assert.match(html, /aria-controls="main-navigation"/);
  assert.match(html, /mobile-primary/);
  assert.match(html, /OPEN SOURCE/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps typography readable and mobile navigation inside the viewport", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /mobileNavOpen/);
  assert.match(page, /mobile-menu-toggle/);
  assert.match(page, /mobile-nav-scrim/);
  assert.match(page, /mobilePrimaryNav/);

  assert.match(css, /body\s*\{[^}]*font-size:16px;[^}]*line-height:1\.45;/);
  assert.doesNotMatch(css, /font-size:(?:[1-9]|10)px/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /\.sidebar\.mobile-nav-open nav/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /max-height:calc\(100vh - 110px\)/);
  assert.match(css, /\.header-actions select\s*\{\s*display:none!important;/);
});
