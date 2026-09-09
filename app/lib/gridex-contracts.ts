export type GridexStrategyCode =
  | "intelligent_hybrid"
  | "price_arbitrage"
  | "self_consumption"
  | "zero_export"
  | "peak_shaving"
  | "schedule_following"
  | "backup_reserve"
  | "manual";

export type GridexStrategyLifecycle =
  | "draft"
  | "validating"
  | "invalid"
  | "ready"
  | "activating"
  | "active"
  | "rejected"
  | "superseded";

export type GridexStrategyCatalogItem = {
  code: GridexStrategyCode;
  label: { en: string; bg: string };
  description: { en: string; bg: string };
  requiredCapabilities: string[];
  requiredRoles: string[];
  simulationRequired: boolean;
};

export type GridexStrategyConfiguration = {
  schemaVersion: "1.0";
  code: GridexStrategyCode;
  enabled: boolean;
  timezone: string;
  validFrom?: string;
  validTo?: string;
  control: {
    intervalSeconds: number;
    reoptimiseEveryMinutes: number;
    fallbackMode: "safe_idle" | "self_consumption" | "schedule_following";
    rampRateKwPerMinute?: number;
  };
  battery: {
    minimumSocPct: number;
    maximumSocPct: number;
    emergencyReserveSocPct: number;
    targetSocPct?: number;
    maximumChargeKw?: number;
    maximumDischargeKw?: number;
    allowGridCharge: boolean;
    allowGridDischarge: boolean;
  };
  grid: {
    importLimitKw: number;
    exportLimitKw: number;
    softwareFuseMarginKw: number;
    zeroExportToleranceKw?: number;
  };
  forecast: {
    horizonHours: number;
    minimumConfidencePct: number;
    maximumAgeMinutes: number;
    useWeather: boolean;
    usePv: boolean;
    useLoad: boolean;
    usePrice: boolean;
    useImbalance: boolean;
    useErpLoad: boolean;
    lowSolarTomorrowThresholdPct?: number;
    lowSolarReserveSocPct?: number;
  };
  market?: {
    marketCode: string;
    buyBelowPerMwh?: number;
    sellAbovePerMwh?: number;
    minimumNetSpreadPerMwh?: number;
    stopExportBelowPerMwh?: number;
    minimumNetProfitPerDay?: number;
    tariffConfigurationId: string;
  };
  peakShaving?: {
    targetPeakKw: number;
    warningMarginKw: number;
    prechargeHorizonHours: number;
    recoveryHysteresisKw: number;
  };
  selfConsumption?: {
    maximumGridImportKw: number;
    pvSurplusPriority: "battery" | "flexible_loads" | "export" | "curtailment";
  };
  schedule?: {
    scheduleId: string;
    adherenceWeightPerMwh: number;
    deviationToleranceKw: number;
  };
  flexibleLoads?: Array<{
    assetId: string;
    priority: number;
    minimumKw: number;
    maximumKw: number;
    energyTargetKwh?: number;
    deadline?: string;
  }>;
  economics: {
    includeBatteryDegradation: boolean;
    batteryAssetConfigurationId?: string;
    minimumMarginAfterDegradationPerMwh?: number;
    trackChargeOrigin?: boolean;
    cycleForecastHorizonHours?: 24;
    priceForecastSources?: Array<{ source: string; weight?: number }>;
    lossProtection?: {
      enabled: boolean;
      mode: "cash_cost" | "full_cost";
      minimumMarginPerMwh: number;
      blockNegativePriceExport: boolean;
      includeImbalanceRisk: boolean;
      includeBatteryDegradation: boolean;
      includeAssetDepreciation: boolean;
    };
  };
};

export type GridexStrategyEnvelope = {
  siteId: string;
  revision: number;
  etag: string;
  lifecycle: GridexStrategyLifecycle;
  configuration: GridexStrategyConfiguration;
  createdAt: string;
  createdBy: string;
};

export type GridexStrategyDraft = GridexStrategyEnvelope & {
  draftId: string;
  baseRevision: number;
  validation: {
    valid: boolean;
    errors: Array<{ path: string; code: string; message: string }>;
    warnings: Array<{ path: string; code: string; message: string }>;
  };
};

export type GridexStrategySimulation = {
  simulationId: string;
  draftId: string;
  status: "queued" | "running" | "completed" | "failed";
  horizonFrom: string;
  horizonTo: string;
  inputVersions: Record<string, string>;
  projected?: {
    grossRevenue: number;
    energyCost: number;
    imbalanceCost: number;
    batteryDegradationCost: number;
    netProfit: number;
    equivalentFullCycles: number;
    minimumSocPct: number;
    maximumGridImportKw: number;
    maximumGridExportKw: number;
  };
  violations: Array<{ code: string; message: string; timestamp?: string }>;
};

export type GridexStrategyStatus = {
  siteId: string;
  code: GridexStrategyCode;
  lifecycle: GridexStrategyLifecycle;
  desiredRevision: number;
  appliedRevision?: number;
  openRemoteAssetId?: string;
  requestedAt?: string;
  appliedAt?: string;
  requestedBy?: string;
  rejectionReasons: Array<{ code: string; message: string }>;
  safety: {
    limitsValid: boolean;
    controlReady: boolean;
    writesEnabled: boolean;
    edgeOnline: boolean;
  };
};

export type GridexUserPreferences = {
  revision: number;
  locale: "en" | "bg";
  displayTimezone: "site" | "browser" | string;
  units: "metric";
  currency: "BGN" | "EUR";
  theme: "light" | "system";
  defaultSiteId?: string;
  dashboardLayout?: string[];
  notifications: {
    channels: Array<"push" | "email" | "sms" | "webhook">;
    minimumSeverity: "info" | "warning" | "critical";
    quietHours?: { from: string; to: string; timezone: string };
  };
};
