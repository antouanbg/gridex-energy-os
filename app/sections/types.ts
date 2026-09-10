export type DataMode = "demo" | "live";

export type BatteryCostSettings = {
  capex: number;
  years: number;
  residual: number;
  maintenance: number;
  annualThroughput: number;
  warrantedCycles: number;
  todayCycles: number;
  method: "usage" | "straight";
  included: boolean;
};
