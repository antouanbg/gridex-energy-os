import type {
  GridexStrategyCatalogItem,
  GridexStrategyConfiguration,
  GridexStrategyDraft,
  GridexStrategyEnvelope,
  GridexStrategySimulation,
  GridexStrategyStatus,
  GridexUserPreferences,
} from "./gridex-contracts";

export type GridexRuntimeMode = "auto" | "demo" | "live";

export type GridexRuntimeConfig = {
  mode: GridexRuntimeMode;
  apiBaseUrl: string;
  realm: string;
  oidcIssuer: string;
  oidcClientId: string;
  defaultSiteId: string;
  backendTimeoutMs: number;
  backendHealthRefreshMs: number;
  snapshotRefreshMs: number;
  authEnabled: boolean;
};

export type GridexUser = {
  subject: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  roles: string[];
  permissions: string[];
};

export type GridexSite = {
  id: string;
  organisationId: string;
  name: string;
  status?: string;
  timezone?: string;
  marketCode?: string;
};

export type GridexSiteSnapshot = {
  assetId?: string;
  siteId: string;
  siteName: string;
  timestamp: string;
  quality: "GOOD" | "STALE" | "INVALID" | "FAULT";
  battery: null | {
    deviceId: string;
    socPct: number | null;
    sohPct: number | null;
    maxChargeKw: number | null;
    maxDischargeKw: number | null;
    limitsValid: boolean | null;
    controlReady: boolean | null;
  };
  power: {
    batteryKw: number | null;
    requestedKw: number | null;
    appliedKw: number | null;
    pvKw: number | null;
    gridKw: number | null;
    siteLoadKw: number | null;
    evKw: number | null;
  };
  strategy: null | {
    mode?: string;
    code?: GridexStrategyConfiguration["code"];
    targetSocPct?: number | null;
    desiredRevision?: number | null;
    appliedRevision?: number | null;
    lifecycle?: GridexStrategyStatus["lifecycle"];
    economicForecast24h?: GridexEconomicForecast24h | null;
    cycleForecast24h?: GridexBatteryCycleForecast24h | null;
  };
  devices: GridexDeviceLive[];
  batteryEconomicsToday: {
    available: boolean;
    currency?: "BGN" | "EUR";
    intervals?: number;
    pvToBatteryKwh?: number;
    gridToBatteryKwh?: number;
    batteryToLoadKwh?: number;
    batteryToGridKwh?: number;
    chargeKwh?: number;
    dischargeKwh?: number;
    pvChargeEquivalentCycles?: number | null;
    gridChargeEquivalentCycles?: number | null;
    equivalentFullCycles?: number | null;
    degradationCost?: number;
    depreciationCost?: number;
    conversionLossCost?: number;
  };
};

export type GridexDeviceType = "inverter" | "battery" | "meter" | "evse";

export type GridexDeviceInput = {
  type: GridexDeviceType;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber?: string | null;
  driverKey: string;
  protocol: string;
  parentDeviceId?: string | null;
  gatewayId?: string | null;
  gatewayPortId?: string | null;
  connection?: Record<string, unknown>;
};

export type GridexDeviceConfiguration = Omit<GridexDeviceInput, "connection"> & {
  id: string;
  siteId: string;
  status: string;
  revision: number;
  live?: GridexDeviceLive | null;
};

export type GridexDeviceLive = {
  id: string;
  siteId: string;
  type: GridexDeviceType;
  name: string;
  manufacturer: string;
  model: string;
  protocol: string;
  driverKey: string;
  status: "online" | "offline" | "unknown";
  quality: "GOOD" | "STALE" | "INVALID";
  observedAt: string | null;
  operatingState: string | null;
  alarmCodes: string | null;
  measurementPoint: string | null;
  capabilities: string[];
  measurements: Record<string, number | null>;
};

export type GridexGatewayPort = {
  id?: string;
  name: string;
  transport: "ethernet" | "modbus-tcp" | "rs485" | "can" | "ocpp" | "mqtt";
  channel: string;
  settings?: Record<string, unknown>;
};

export type GridexGateway = {
  id?: string;
  name: string;
  hardwareModel: "rock-pi-e" | "olimex-esp32-evb-ea-ind" | "olimex-esp32-evb-lab";
  role: "controller" | "device-node";
  managementNetwork?: Record<string, unknown>;
  ports: GridexGatewayPort[];
};

export type GridexHardwareTopology = {
  configuration: null | { id: string; revision: number; status: string };
  gateways: GridexGateway[];
  devices: GridexDeviceConfiguration[];
};

export type GridexBatteryCycleForecast24h = {
  horizonHours: 24;
  gridChargeKwh: number;
  pvChargeKwh: number;
  dischargeKwh: number;
  gridChargeEquivalentCycles: number;
  pvChargeEquivalentCycles: number;
  equivalentFullCycles: number;
};

export type GridexEconomicForecast24h = {
  currency: "BGN" | "EUR";
  grossRevenue: number;
  energyPurchaseCost: number;
  tariffsAndFees: number;
  imbalanceRiskCost: number;
  conversionLossCost: number;
  batteryDegradationCost: number;
  assetDepreciationCost: number;
  netProfit: number;
  pvDirect: { energyKwh: number; netProfit: number; minimumSalePricePerMwh: number };
  batteryDischarge: { energyKwh: number; netProfit: number; minimumSalePricePerMwh: number };
  priceForecastSources: Array<{ source: string; version: string; generatedAt: string }>;
  weatherForecastVersion: string;
  sunrise: string;
  sunset: string;
};

export type GridexHistoryPoint = {
  timestamp: string;
  values: Record<string, number | string | boolean | null>;
  quality?: GridexSiteSnapshot["quality"];
};

export type GridexForecastPoint = GridexHistoryPoint & {
  confidencePct?: number;
  model?: string;
};

export type GridexAlarm = {
  id: string;
  siteId: string;
  severity: "info" | "warning" | "critical";
  state: "open" | "acknowledged" | "closed";
  title: string;
  message?: string;
  createdAt: string;
};

export class GridexApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "GridexApiError";
  }
}

declare global {
  interface Window {
    __GRIDEX_CONFIG__?: Partial<GridexRuntimeConfig>;
  }
}

const defaults: GridexRuntimeConfig = {
  mode: "auto",
  apiBaseUrl: "",
  realm: "gridex",
  oidcIssuer: "https://ems.gridex.tech/auth/realms/gridex",
  oidcClientId: "gridex-portal",
  defaultSiteId: "solar-park-east",
  backendTimeoutMs: 5000,
  backendHealthRefreshMs: 30000,
  snapshotRefreshMs: 5000,
  authEnabled: true,
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

  async health(signal?: AbortSignal): Promise<{ status: string; openRemote: string; writesEnabled?: boolean }> {
    if (this.config.mode === "demo") return { status: "demo", openRemote: "not-connected" };
    const timeout = AbortSignal.timeout(this.config.backendTimeoutMs);
    const response = await fetch(`${this.config.apiBaseUrl}/health`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      cache: "no-store",
    });
    if (!response.ok) throw new GridexApiError(`GridEx API health failed: ${response.status}`, response.status);
    return response.json();
  }

  async me(signal?: AbortSignal): Promise<GridexUser> {
    return this.getJson<GridexUser>("/api/v1/me", signal);
  }

  async userPreferences(signal?: AbortSignal): Promise<GridexUserPreferences> {
    return this.getJson<GridexUserPreferences>("/api/v1/me/preferences", signal);
  }

  async updateUserPreferences(preferences: GridexUserPreferences): Promise<GridexUserPreferences> {
    return this.putJson<GridexUserPreferences>("/api/v1/me/preferences", preferences, preferences.revision);
  }

  async sites(signal?: AbortSignal): Promise<GridexSite[]> {
    const payload = await this.getJson<{ sites?: GridexSite[]; items?: GridexSite[] }>("/api/v1/sites", signal);
    return payload.sites ?? payload.items ?? [];
  }

  async deviceTypes(signal?: AbortSignal): Promise<{ items: GridexDeviceType[]; hardware: Record<string, unknown> }> {
    return this.getJson("/api/v1/device-types", signal);
  }

  async hardware(siteId: string, signal?: AbortSignal): Promise<GridexHardwareTopology> {
    return this.getJson(`/api/v1/sites/${encodeURIComponent(siteId)}/hardware`, signal);
  }

  async createHardwareConfiguration(siteId: string, gateways: GridexGateway[]): Promise<{ id: string; siteId: string; revision: number; status: string }> {
    return this.postJson(`/api/v1/sites/${encodeURIComponent(siteId)}/hardware-configurations`, { gateways });
  }

  async devices(siteId: string, signal?: AbortSignal): Promise<GridexDeviceConfiguration[]> {
    const result = await this.getJson<{ items: GridexDeviceConfiguration[] }>(`/api/v1/sites/${encodeURIComponent(siteId)}/devices`, signal);
    return result.items;
  }

  async provisionDevice(siteId: string, input: GridexDeviceInput): Promise<GridexDeviceConfiguration> {
    return this.postJson(`/api/v1/sites/${encodeURIComponent(siteId)}/devices`, input);
  }

  async device(siteId: string, deviceId: string, signal?: AbortSignal): Promise<GridexDeviceConfiguration> {
    return this.getJson(`/api/v1/sites/${encodeURIComponent(siteId)}/devices/${encodeURIComponent(deviceId)}`, signal);
  }

  async updateDevice(siteId: string, deviceId: string, patch: Partial<GridexDeviceInput>, revision: number): Promise<GridexDeviceConfiguration> {
    const response = await this.authorizedFetch(`/api/v1/sites/${encodeURIComponent(siteId)}/devices/${encodeURIComponent(deviceId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "If-Match": String(revision) },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new GridexApiError(`GridEx device update failed: ${response.status}`, response.status);
    return response.json();
  }

  async snapshot(siteId = this.config.defaultSiteId, signal?: AbortSignal): Promise<GridexSiteSnapshot> {
    const response = await this.authorizedFetch(`/api/v1/sites/${encodeURIComponent(siteId)}/snapshot`, {
      signal,
      cache: "no-store",
    });
    if (!response.ok) throw new GridexApiError(`GridEx snapshot failed: ${response.status}`, response.status);
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
    if (!response.ok) throw new GridexApiError(`GridEx command failed: ${response.status}`, response.status);
    return response.json();
  }

  async history(siteId: string, query: {
    from: string;
    to: string;
    resolution: "raw" | "1m" | "15m" | "1h" | "1d";
    metrics: string[];
  }, signal?: AbortSignal): Promise<GridexHistoryPoint[]> {
    const parameters = new URLSearchParams({
      from: query.from,
      to: query.to,
      resolution: query.resolution,
      metrics: query.metrics.join(","),
    });
    return this.getJson<GridexHistoryPoint[]>(`/api/v1/sites/${encodeURIComponent(siteId)}/history?${parameters}`, signal);
  }

  async forecast(siteId: string, horizonHours = 72, signal?: AbortSignal): Promise<GridexForecastPoint[]> {
    return this.getJson<GridexForecastPoint[]>(`/api/v1/sites/${encodeURIComponent(siteId)}/forecast?horizonHours=${horizonHours}`, signal);
  }

  async strategyCatalog(signal?: AbortSignal): Promise<GridexStrategyCatalogItem[]> {
    const payload = await this.getJson<{ items: GridexStrategyCatalogItem[] }>("/api/v1/strategies/catalog", signal);
    return payload.items;
  }

  async strategy(siteId: string, signal?: AbortSignal): Promise<GridexStrategyEnvelope> {
    return this.getJson<GridexStrategyEnvelope>(`/api/v1/sites/${encodeURIComponent(siteId)}/strategy`, signal);
  }

  async createStrategyDraft(
    siteId: string,
    configuration: GridexStrategyConfiguration,
    baseRevision: number,
  ): Promise<GridexStrategyDraft> {
    return this.postJson<GridexStrategyDraft>(`/api/v1/sites/${encodeURIComponent(siteId)}/strategy/drafts`, {
      baseRevision,
      configuration,
    });
  }

  async updateStrategyDraft(
    siteId: string,
    draftId: string,
    configuration: GridexStrategyConfiguration,
    revision: number,
  ): Promise<GridexStrategyDraft> {
    return this.putJson<GridexStrategyDraft>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/strategy/drafts/${encodeURIComponent(draftId)}`,
      { configuration },
      revision,
    );
  }

  async validateStrategyDraft(siteId: string, draftId: string): Promise<GridexStrategyDraft["validation"]> {
    return this.postJson<GridexStrategyDraft["validation"]>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/strategy/drafts/${encodeURIComponent(draftId)}/validate`,
      {},
    );
  }

  async simulateStrategyDraft(
    siteId: string,
    draftId: string,
    input: { horizonFrom: string; horizonTo: string },
  ): Promise<GridexStrategySimulation> {
    return this.postJson<GridexStrategySimulation>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/strategy/drafts/${encodeURIComponent(draftId)}/simulate`,
      input,
    );
  }

  async activateStrategyDraft(
    siteId: string,
    draftId: string,
    input: { expectedDraftRevision: number; simulationId: string; approvalReason?: string },
    idempotencyKey: string,
  ): Promise<GridexStrategyStatus> {
    return this.postJson<GridexStrategyStatus>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/strategy/drafts/${encodeURIComponent(draftId)}/activate`,
      input,
      { "Idempotency-Key": idempotencyKey },
    );
  }

  async strategyStatus(siteId: string, signal?: AbortSignal): Promise<GridexStrategyStatus> {
    return this.getJson<GridexStrategyStatus>(`/api/v1/sites/${encodeURIComponent(siteId)}/strategy/status`, signal);
  }

  async strategyVersions(siteId: string, signal?: AbortSignal): Promise<GridexStrategyEnvelope[]> {
    const payload = await this.getJson<{ items: GridexStrategyEnvelope[] }>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/strategy/versions`,
      signal,
    );
    return payload.items;
  }

  async alarms(siteId: string, signal?: AbortSignal): Promise<GridexAlarm[]> {
    return this.getJson<GridexAlarm[]>(`/api/v1/sites/${encodeURIComponent(siteId)}/alarms`, signal);
  }

  async acknowledgeAlarm(siteId: string, alarmId: string): Promise<void> {
    const response = await this.authorizedFetch(
      `/api/v1/sites/${encodeURIComponent(siteId)}/alarms/${encodeURIComponent(alarmId)}/acknowledge`,
      { method: "POST" },
    );
    if (!response.ok) throw new GridexApiError(`GridEx alarm acknowledgement failed: ${response.status}`, response.status);
  }

  async saveConfiguration(siteId: string, section: string, configuration: unknown, revision: number): Promise<unknown> {
    const response = await this.authorizedFetch(
      `/api/v1/sites/${encodeURIComponent(siteId)}/configurations/${encodeURIComponent(section)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "If-Match": String(revision) },
        body: JSON.stringify(configuration),
      },
    );
    if (!response.ok) throw new GridexApiError(`GridEx configuration update failed: ${response.status}`, response.status);
    return response.json();
  }

  async configuration<T>(siteId: string, section: string, signal?: AbortSignal): Promise<{ revision: number; configuration: T }> {
    return this.getJson<{ revision: number; configuration: T }>(
      `/api/v1/sites/${encodeURIComponent(siteId)}/configurations/${encodeURIComponent(section)}`,
      signal,
    );
  }

  async subscribeSiteEvents(
    siteId: string,
    onEvent: (event: MessageEvent<string>) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const response = await this.authorizedFetch(`/api/v1/sites/${encodeURIComponent(siteId)}/events`, {
      headers: { Accept: "text/event-stream" },
      signal,
      cache: "no-store",
    });
    if (!response.ok || !response.body) throw new GridexApiError(`GridEx event stream failed: ${response.status}`, response.status);
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      frames.forEach((frame) => {
        const data = frame.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
        if (data) onEvent(new MessageEvent("message", { data }));
      });
    }
  }

  private async getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await this.authorizedFetch(path, { signal, cache: "no-store" });
    if (!response.ok) throw new GridexApiError(`GridEx API request failed: ${response.status}`, response.status);
    return response.json();
  }

  private async postJson<T>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    const response = await this.authorizedFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new GridexApiError(`GridEx API request failed: ${response.status}`, response.status);
    return response.json();
  }

  private async putJson<T>(path: string, body: unknown, revision: number): Promise<T> {
    const response = await this.authorizedFetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "If-Match": String(revision) },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new GridexApiError(`GridEx API request failed: ${response.status}`, response.status);
    return response.json();
  }

  private async authorizedFetch(path: string, init: RequestInit): Promise<Response> {
    if (this.config.mode === "demo") throw new Error("Live GridEx API is disabled in demo mode");
    let token: string | undefined;
    try {
      token = await this.getAccessToken();
    } catch {
      throw new GridexApiError("Authentication refresh failed", 401);
    }
    if (!token) throw new GridexApiError("Authentication is required for live GridEx data", 401);
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${this.config.apiBaseUrl}${path}`, { ...init, headers });
  }
}
