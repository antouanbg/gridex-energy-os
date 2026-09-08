// Public runtime configuration. Never place secrets or MQTT credentials here.
window.__GRIDEX_CONFIG__ = {
  // auto: use live data only when both the API and an OIDC session are available;
  // otherwise keep the public portal in clearly labelled demo mode.
  mode: "auto",
  apiBaseUrl: "https://api.gridex.tech",
  realm: "gridex",
  oidcIssuer: "https://ems.gridex.tech/auth/realms/gridex",
  oidcClientId: "gridex-portal",
  defaultSiteId: "solar-park-east",
  backendTimeoutMs: 5000,
  backendHealthRefreshMs: 30000,
  snapshotRefreshMs: 5000,
  authEnabled: true,
};
