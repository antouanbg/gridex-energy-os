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
  assert.match(css, /\.content small,\.content em\s*\{\s*font-size:12px!important;/);
  assert.match(css, /\.sidebar nav button span,\.mobile-menu-toggle span\s*\{\s*font-size:12px;/);
});

test("keeps mobile reports within the viewport and scrolls wide data internally", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.report-bottom,\.report-bottom>\*\s*\{\s*min-width:0;\s*max-width:100%;/);
  assert.match(css, /\.savings-waterfall>div\s*\{\s*width:100%;\s*max-width:100%;/);
  assert.match(css, /\.flow-scenario-tabs button,\.flow-scenario-tabs button span\s*\{\s*min-width:0;/);
  assert.match(css, /\.flow-scenario-tabs button span>\*\s*\{\s*overflow-wrap:anywhere;\s*white-space:normal;/);
  assert.match(css, /\.report-table\s*\{\s*overflow-x:auto/);
  assert.match(css, /\.subnav\s*\{\s*overflow-x:auto/);
});

test("keeps energy-flow status badges in their own grid row", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.energy-asset\s*\{[^}]*grid-template-rows:auto 1fr;/);
  assert.match(css, /\.energy-asset mark\s*\{[^}]*grid-column:2;[^}]*grid-row:1;/);
  assert.doesNotMatch(css, /\.energy-asset mark\s*\{[^}]*position:absolute;/);
});

test("provides a one-device-per-gateway hardware configurator", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function EdgeHardwareConfigurator/);
  assert.match(page, /1 gate = 1 device/);
  assert.match(page, /LilyGo T-CAN485/);
  assert.match(page, /Waveshare 2-CH CAN To Ethernet/);
  assert.match(page, /Compile driver/);
  assert.match(page, /Install on gateway/);
  assert.match(page, /ESP32 node firmware/);
  assert.match(page, /ROCK Pi E driver service/);
  assert.match(css, /\.gateway-config-fields\s*\{/);
  assert.match(css, /@media\(max-width:680px\).*\.gateway-config-fields\{grid-template-columns:1fr\}/s);
});

test("publishes a traceable supported-device catalogue", async () => {
  const [page, catalogue, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/supported-devices.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function SupportedDevices/);
  assert.match(page, /Supported devices/);
  assert.match(page, /GROUP-CONTROL READINESS/);
  assert.match(catalogue, /gridex-suntech-ste261l/);
  assert.match(catalogue, /manufacturer-confirmed/);
  assert.match(catalogue, /inverter-deye-can/);
  assert.match(catalogue, /inverter-growatt-rs485/);
  assert.match(catalogue, /bms-pylon-hv-can/);
  assert.match(catalogue, /bms-zte-modbus/);
  assert.match(catalogue, /external-reference/);
  assert.match(css, /\.supported-driver-grid\s*\{/);
  assert.match(css, /@media\(max-width:680px\).*\.supported-driver-grid\{grid-template-columns:1fr\}/s);
});
