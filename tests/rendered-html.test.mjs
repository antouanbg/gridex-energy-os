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

test("uses the public GrideX domain for generated metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /metadataBase: new URL\("https:\/\/gridex\.tech"\)/);
  assert.doesNotMatch(layout, /technosun-energy-os\.novacom-grou-6812\.chatgpt\.site/);
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
  assert.doesNotMatch(page, /MutationObserver/);
  assert.match(page, /document\.documentElement\.lang = lang/);
  assert.match(page, /gridex-demo-notice-dismissed/);
  assert.match(page, /demo-notice-close/);

  assert.match(css, /body\s*\{[^}]*font-size:16px;[^}]*line-height:1\.45;/);
  assert.doesNotMatch(css, /font-size:(?:[1-9]|10)px/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /\.sidebar\.mobile-nav-open nav/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /max-height:calc\(100vh - 110px\)/);
  assert.match(css, /\.header-actions select\s*\{\s*display:none!important;/);
  assert.match(css, /\.content small,\.content em\s*\{\s*font-size:12px!important;/);
  assert.match(css, /\.sidebar nav button span,\.mobile-menu-toggle span\s*\{\s*font-size:12px;/);
  assert.match(css, /Mobile readability and overlap guard/);
  assert.match(css, /\.content small,\.content em\s*\{\s*font-size:13px!important;/);
  assert.match(css, /@media\(max-width:420px\)\{[\s\S]*\.energy-flow-map\s*\{\s*grid-template-columns:1fr;/);
  assert.match(css, /Real phones can report a CSS width above 480px/);
  assert.match(css, /@media\(max-width:680px\)\{[\s\S]*\.energy-flow-map\s*\{\s*grid-template-columns:minmax\(0,1fr\);/);
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*\.energy-asset span>strong\s*\{\s*font-size:22px;\s*white-space:normal;/);
  assert.match(css, /supported-devices-hero-stats\s*\{\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
  assert.match(css, /Strategy cards are content cards/);
  assert.match(css, /\.mode-cards\s*\{\s*grid-template-columns:minmax\(0,1fr\);/);
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
  assert.match(page, /OLIMEX ESP32-EVB-EA-IND/);
  assert.match(page, /Modbus TCP :1502/);
  assert.match(page, /Compile driver/);
  assert.match(page, /Install on gateway/);
  assert.match(page, /ESP32-EVB node firmware/);
  assert.match(page, /ROCK Pi E only/);
  assert.match(css, /\.gateway-config-fields\s*\{/);
  assert.match(css, /@media\(max-width:680px\).*\.gateway-config-fields\{grid-template-columns:1fr\}/s);
});

test("publishes a traceable supported-device catalogue", async () => {
  const [page, catalogue, css, messages] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/supported-devices.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/messages.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function SupportedDevices/);
  assert.match(messages, /"nav\.supported":"Supported devices"/);
  assert.match(page, /GROUP-CONTROL READINESS/);
  assert.match(catalogue, /gridex-suntech-ste261l/);
  assert.match(catalogue, /manufacturer-confirmed/);
  assert.match(catalogue, /inverter-deye-can/);
  assert.match(catalogue, /inverter-growatt-rs485/);
  assert.match(catalogue, /bms-pylon-hv-can/);
  assert.match(catalogue, /bms-zte-modbus/);
  assert.match(catalogue, /external-reference/);
  assert.match(catalogue, /open-giv-givenergy-lv-source/);
  assert.match(catalogue, /open-giv-pylontech-can-target/);
  assert.match(catalogue, /open-giv-sunspec-modbus-target/);
  assert.match(catalogue, /design-reference/);
  assert.match(catalogue, /ha-solarman\/wiki\/Documentation/);
  assert.match(catalogue, /solarmanReference/);
  assert.match(catalogue, /DTSD422-D3/);
  assert.match(css, /\.supported-driver-grid\s*\{/);
  assert.match(css, /@media\(max-width:680px\).*\.supported-driver-grid\{grid-template-columns:1fr\}/s);
});

test("uses a safe backend-aware demo and OIDC integration state", async () => {
  const [response, page, config, auth, api, plan] = await Promise.all([
    render(),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/gridex-config.js", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/gridex-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/gridex-api.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/integration/FRONTEND_BACKEND_IMPLEMENTATION_PLAN.md", import.meta.url), "utf8"),
  ]);
  const html = await response.text();

  assert.match(html, /Това е Демо режим/);
  assert.match(html, /Моля, логнете се/);
  assert.match(config, /mode:\s*"auto"/);
  assert.match(config, /backendHealthRefreshMs/);
  assert.match(page, /backendState === "online" && authState === "authenticated" \? "live" : "demo"/);
  assert.match(page, /Няма връзка с backend-а/);
  assert.match(page, /LIVE РЕЖИМ · БЕЗ ДЕМО СТОЙНОСТИ/);
  assert.match(auth, /flow:\s*"standard"/);
  assert.match(auth, /pkceMethod:\s*"S256"/);
  assert.doesNotMatch(auth, /localStorage|sessionStorage/);
  assert.match(api, /subscribeSiteEvents/);
  assert.match(api, /commands\/power/);
  assert.match(plan, /Frontend acceptance criteria/);
  assert.match(plan, /Критерии за приемане/);
});

test("exposes device provisioning and transparent no-sale-at-loss economics", async () => {
  const [page, api, contracts, schema] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/gridex-api.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/gridex-contracts.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/integration/schemas/strategy-configuration.schema.json", import.meta.url), "utf8"),
  ]);
  assert.match(api, /provisionDevice/);
  assert.match(api, /createHardwareConfiguration/);
  assert.match(api, /GridexEconomicForecast24h/);
  assert.match(contracts, /cash_cost/);
  assert.match(schema, /priceForecastSources/);
  assert.match(page, /function LossProtectionPanel/);
  assert.match(page, /Do not sell at a loss/);
  assert.match(page, /PV → GRID/);
  assert.match(page, /BATTERY → GRID/);
  assert.match(page, /gridChargeEquivalentCycles/);
  assert.match(page, /pvChargeEquivalentCycles/);
});
