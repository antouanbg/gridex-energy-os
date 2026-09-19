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
const { LiveSites } = load('../app/sections/live-sites.tsx');
for(const lang of ['en','bg']) {
  test(`live pages never substitute sample sites or power (${lang})`,()=>{
    const html=renderToStaticMarkup(React.createElement(Overview,{auto:false,setAuto(){},navigate(){},notify(){},lang,dataMode:'live',snapshot:null}));
    assert.doesNotMatch(html,/72%|14:32:08|87%/);
    for(const status of ['loading','error','ready']) {
      const empty=renderToStaticMarkup(React.createElement(LiveSites,{sites:[],status,lang,onSelect(){}}));
      assert.doesNotMatch(empty,/Solar Park|581|6.42/);
    }
    const site=renderToStaticMarkup(React.createElement(LiveSites,{sites:[{id:'test',name:'Owned site'}],status:'ready',lang,onSelect(){}}));
    assert.match(site,/Owned site/);
    assert.doesNotMatch(site,/online|Онлайн/);
  });
}
for (const lang of ['en', 'bg']) {
  for (const battery of [null, { socPct: null, sohPct: null }, { socPct: 50, sohPct: 97 }]) {
    test(`live overview renders missing battery safely (${lang}, ${JSON.stringify(battery)})`, () => {
      const snapshot = { timestamp: '2026-01-01T12:00:00Z', quality: 'INVALID', power: { gridKw: null, batteryKw: null, pvKw: null, siteLoadKw: null }, battery, strategy: null };
      const html = renderToStaticMarkup(React.createElement(Overview, { auto: false, setAuto() {}, navigate() {}, notify() {}, lang, dataMode: 'live', snapshot }));
      assert.match(html, battery?.sohPct == null ? /SOH —/ : /SOH 97.0%/);
      assert.doesNotMatch(html, /SOH 98%/);
      assert.doesNotMatch(html, /0\.0 kW/);
    });
  }
}
