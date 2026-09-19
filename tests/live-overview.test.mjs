import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', code)(exports, name => {
    if (name === './shared') return load('../app/sections/shared.tsx');
    if (name === '../lib/currency') return load('../app/lib/currency.ts');
    return require(name);
  });
  return exports;
}
const { Overview } = load('../app/sections/overview.tsx');
for (const lang of ['en', 'bg']) {
  for (const battery of [null, { socPct: null, sohPct: null }, { socPct: 50, sohPct: 97 }]) {
    test(`live overview renders missing battery safely (${lang}, ${JSON.stringify(battery)})`, () => {
      const snapshot = { timestamp: '2026-01-01T12:00:00Z', quality: 'INVALID', power: { gridKw: null, batteryKw: null, pvKw: null, siteLoadKw: null }, battery, strategy: null };
      const html = renderToStaticMarkup(React.createElement(Overview, { auto: false, setAuto() {}, navigate() {}, notify() {}, lang, dataMode: 'live', snapshot }));
      assert.match(html, battery?.sohPct == null ? /SOH —/ : /SOH 97.0%/);
      assert.doesNotMatch(html, /SOH 98%/);
    });
  }
}
