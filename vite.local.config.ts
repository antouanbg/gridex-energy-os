import { defineConfig, mergeConfig } from "vite";
import pages from "./vite.pages.config";

// Local-only runtime config; public/gridex-config.js is deliberately unchanged.
export default mergeConfig(pages, defineConfig({
  plugins: [{
    name: "gridex-local-backend",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/gridex-config.js") return next();
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader("Cache-Control", "no-store");
        res.end(`window.__GRIDEX_CONFIG__=${JSON.stringify({
          mode: "auto", apiBaseUrl: "", realm: "gridex",
          oidcIssuer: "https://localhost:8443/auth/realms/gridex",
          oidcClientId: "gridex-portal", defaultSiteId: "",
          backendTimeoutMs: 5000, backendHealthRefreshMs: 30000,
          snapshotRefreshMs: 5000, authEnabled: true,
        })};`);
      });
    },
  }],
  server: {
    host: "127.0.0.1", port: 4173, strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8081",
      "/health": "http://127.0.0.1:8081",
    },
  },
}));
