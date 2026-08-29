export type GridexRuntimeMode = "demo" | "live";

export type GridexRuntimeConfig = {
  mode: GridexRuntimeMode;
  apiBaseUrl: string;
  realm: string;
  oidcIssuer: string;
  oidcClientId: string;
  defaultSiteId: string;
};

export type GridexSiteSnapshot = {
  assetId: string;
  timestamp: string;
  quality: "GOOD" | "STALE" | "INVALID" | "FAULT";
  battery: {
    socPct: number;
    sohPct: number;
    maxChargeKw: number;
    maxDischargeKw: number;
    limitsValid: boolean;
    controlReady?: boolean;
  };
  power: {
    actualKw: number;
    requestedKw: number;
    appliedKw: number;
    dcKw?: number;
    reactiveKvar?: number;
    siteLoadKw?: number;
  };
};

declare global {
  interface Window {
    __GRIDEX_CONFIG__?: Partial<GridexRuntimeConfig>;
  }
}

const defaults: GridexRuntimeConfig = {
  mode: "demo",
  apiBaseUrl: "",
  realm: "gridex",
  oidcIssuer: "https://ems.gridex.tech/auth/realms/gridex",
  oidcClientId: "gridex-portal",
  defaultSiteId: "solar-park-east",
};

export function getGridexRuntimeConfig(): GridexRuntimeConfig {
  if (typeof window === "undefined") return defaults;
  return { ...defaults, ...window.__GRIDEX_CONFIG__ };
}

export class GridexApiClient {
  constructor(
    private readonly config: GridexRuntimeConfig,
    private readonly getAccessToken: () => Promise<string | undefined> = async () => undefined,
  ) {}

  async health(signal?: AbortSignal): Promise<{ status: string; openRemote: string }> {
    if (this.config.mode === "demo") return { status: "demo", openRemote: "not-connected" };
    const response = await fetch(`${this.config.apiBaseUrl}/health`, { signal, cache: "no-store" });
    if (!response.ok) throw new Error(`GridEx API health failed: ${response.status}`);
    return response.json();
  }

  async snapshot(siteId = this.config.defaultSiteId, signal?: AbortSignal): Promise<GridexSiteSnapshot> {
    const response = await this.authorizedFetch(`/api/v1/sites/${encodeURIComponent(siteId)}/snapshot`, {
      signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`GridEx snapshot failed: ${response.status}`);
    return response.json();
  }

  async requestPower(siteId: string, command: {
    sequence: number;
    requestedPowerKw: number;
    enable: boolean;
    source: "automatic" | "schedule" | "operator" | "safe-mode";
    ttlSeconds?: number;
  }): Promise<unknown> {
    const response = await this.authorizedFetch(`/api/v1/sites/${encodeURIComponent(siteId)}/commands/power`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`GridEx command failed: ${response.status}`);
    return response.json();
  }

  private async authorizedFetch(path: string, init: RequestInit): Promise<Response> {
    if (this.config.mode !== "live") throw new Error("Live GridEx API is disabled in demo mode");
    const token = await this.getAccessToken();
    if (!token) throw new Error("Authentication is required for live GridEx data");
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${this.config.apiBaseUrl}${path}`, { ...init, headers });
  }
}

