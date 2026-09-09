import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "github-pages",
  base: "/",
  publicDir: "../public",
  plugins: [react()],
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
