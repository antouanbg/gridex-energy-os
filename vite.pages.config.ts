import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { sectionPaths } from './app/lib/routes';

const release = process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();

export default defineConfig({
  root: "github-pages",
  base: "/",
  publicDir: "../public",
  plugins: [react(), {
    name:'gridex-section-pages',
    transformIndexHtml(html) { return html.replace('</head>',`<meta name="gridex-release" content="${release}"></head>`); },
    closeBundle() {
      const root=resolve(import.meta.dirname,'dist-pages');
      const html=readFileSync(resolve(root,'index.html'),'utf8');
      for(const path of Object.values(sectionPaths)) {
        if(path==='/')continue;
        const directory=resolve(root,'.'+path);
        mkdirSync(directory,{recursive:true});
        const publicPage=path==='/about/';
        writeFileSync(resolve(directory,'index.html'),html.replace('</head>',`${publicPage?'':'<meta name="robots" content="noindex">'}</head>`));
      }
      // GitHub Pages serves this shell at private, site-scoped deep links.
      // The original URL is preserved; client auth and API authorization still apply.
      writeFileSync(resolve(root,'404.html'),html.replace('</head>','<meta name="robots" content="noindex"></head>'));
      writeFileSync(resolve(root,'release.json'),JSON.stringify({id:release}));
    },
  }],
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        bg: resolve(import.meta.dirname, "github-pages/index.html"),
        en: resolve(import.meta.dirname, "github-pages/en/index.html"),
      },
    },
  },
});
