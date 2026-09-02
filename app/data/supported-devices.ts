export type SupportedDeviceCategory = "aio" | "pcs" | "inverter" | "bms";
export type SupportedDeviceStatus = "manufacturer-confirmed" | "documented" | "external-reference";

export type SupportedDeviceDriver = {
  id: string;
  brand: string;
  profile: string;
  category: SupportedDeviceCategory;
  interfaces: string[];
  module: string;
  status: SupportedDeviceStatus;
  scopeBg: string;
  scopeEn: string;
  modelsBg: string;
  modelsEn: string;
  sourceUrl: string;
};

const gridexRepository = "https://github.com/antouanbg/gridex-energy-os";
const referenceRepository = "https://github.com/ai-republic/bms-to-inverter/tree/main";

const referenceDriver = (
  module: string,
  brand: string,
  profile: string,
  category: "inverter" | "bms",
  interfaces: string[],
  modelsBg = "Моделът и firmware версията трябва да бъдат потвърдени с лабораторен тест.",
  modelsEn = "The exact model and firmware version require bench validation.",
): SupportedDeviceDriver => ({
  id: module,
  brand,
  profile,
  category,
  interfaces,
  module,
  status: "external-reference",
  scopeBg: category === "inverter"
    ? "Външна протоколна реализация за подаване на BMS данни към инвертора. Не е интегриран GrideX production драйвер."
    : "Външна протоколна реализация за четене и нормализиране на BMS телеметрия. Не е интегриран GrideX production драйвер.",
  scopeEn: category === "inverter"
    ? "External protocol implementation for sending BMS data to the inverter. This is not an integrated GrideX production driver."
    : "External protocol implementation for reading and normalising BMS telemetry. This is not an integrated GrideX production driver.",
  modelsBg,
  modelsEn,
  sourceUrl: `${referenceRepository}/${module}`,
});

export const supportedDeviceDrivers: SupportedDeviceDriver[] = [
  {
    id: "gridex-suntech-ste261l",
    brand: "Suntech",
    profile: "SunPro / SunStorage Pro STE-261L",
    category: "aio",
    interfaces: ["Modbus TCP"],
    module: "gridex.suntech261.ste261l",
    status: "manufacturer-confirmed",
    scopeBg: "Пълна телеметрия и управление на мощността с readiness gate, SOC, динамични BMS лимити, атомарни енергийни броячи и heartbeat safe-state.",
    scopeEn: "Full telemetry and power control with readiness gate, SOC, dynamic BMS limits, atomic energy counters and heartbeat safe state.",
    modelsBg: "Потвърдено за 261 kWh кабинета, Modbus TCP порт 3200, Unit ID 1 и директни адреси без offset.",
    modelsEn: "Confirmed for the 261 kWh cabinet, Modbus TCP port 3200, Unit ID 1 and direct register addresses without offset.",
    sourceUrl: `${gridexRepository}/tree/main/edge/rock-pi-e/src`,
  },
  {
    id: "gridex-sinexcel-pcs-261",
    brand: "Sinexcel",
    profile: "PCS profile for STE-261L",
    category: "pcs",
    interfaces: ["Modbus TCP"],
    module: "gridex.suntech261.pcs",
    status: "manufacturer-confirmed",
    scopeBg: "P/Q команда ×10, положителна стойност за разряд, отрицателна за заряд, operational prerequisites и heartbeat 5301/5302.",
    scopeEn: "P/Q command ×10, positive for discharge, negative for charge, operational prerequisites and heartbeat 5301/5302.",
    modelsBg: "Профилът е част от интеграцията на Suntech 261 и използва factory BMS charge/discharge limits.",
    modelsEn: "The profile is part of the Suntech 261 integration and uses the factory BMS charge/discharge limits.",
    sourceUrl: `${gridexRepository}/tree/main/edge/rock-pi-e/src`,
  },
  {
    id: "gridex-bcq-261",
    brand: "BCQ",
    profile: "261 kWh cabinet controller / BMS gateway",
    category: "bms",
    interfaces: ["Modbus TCP"],
    module: "gridex.suntech261.bcq",
    status: "documented",
    scopeBg: "SOC, статус, аларми, DC енергийни броячи и динамични ограничения за заряд и разряд.",
    scopeEn: "SOC, state, alarms, DC energy counters and dynamic charge/discharge limits.",
    modelsBg: "Регистровата карта е налична; остава commissioning проверка с реалния кабинет и firmware.",
    modelsEn: "The register map is available; commissioning validation with the physical cabinet and firmware remains required.",
    sourceUrl: `${gridexRepository}/tree/main/edge/rock-pi-e/src`,
  },

  referenceDriver("inverter-byd-can", "BYD", "BYD CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-deye-can", "Deye", "Deye CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-goodwe-can", "GoodWe", "GoodWe HV CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-growatt-can", "Growatt", "Growatt LV CAN inverter binding", "inverter", ["CAN"], "Референцията посочва SPF 5000 ES и ES 5000; необходим е тест на точната серия.", "The reference lists SPF 5000 ES and ES 5000; the exact series still requires validation."),
  referenceDriver("inverter-growatt-hv-can", "Growatt", "Growatt HV CAN inverter binding", "inverter", ["CAN"], "Референцията посочва SPH Series; необходим е тест на конкретния модел и firmware.", "The reference lists the SPH Series; the exact model and firmware require validation."),
  referenceDriver("inverter-growatt-modbus", "Growatt", "Growatt Modbus inverter binding", "inverter", ["Modbus", "RS485"]),
  referenceDriver("inverter-growatt-rs485", "Growatt", "Growatt RS485 inverter binding", "inverter", ["RS485"]),
  referenceDriver("inverter-huawei-modbus", "Huawei", "Huawei Modbus inverter binding", "inverter", ["Modbus"]),
  referenceDriver("inverter-luxpower-can", "Luxpower", "Luxpower CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-pylon-can", "Pylon-compatible", "Pylon LV CAN inverter binding", "inverter", ["CAN"], "Референцията посочва Growatt SPH TL3 BH UP и други Pylon-compatible семейства.", "The reference lists Growatt SPH TL3 BH UP and other Pylon-compatible families."),
  referenceDriver("inverter-pylon-hv-can", "Pylon-compatible", "Pylon HV CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-pylon-rs485", "Pylon-compatible", "Pylon LV RS485 inverter binding", "inverter", ["RS485", "RS232/UART"], "Референцията посочва Growatt SPF 3000 ES с настройка L52; необходим е bench test.", "The reference lists Growatt SPF 3000 ES with setting L52; bench validation is required."),
  referenceDriver("inverter-pylon2-rs485", "Pylon-compatible", "Pylon RS485 v2 inverter binding", "inverter", ["RS485", "RS232/UART"]),
  referenceDriver("inverter-sma-si-can", "SMA", "Sunny Island CAN inverter binding", "inverter", ["CAN"], "Референцията посочва Sunny Island 4.0H, 6.0H, 8.0H, 4548-US и 6048-US.", "The reference lists Sunny Island 4.0H, 6.0H, 8.0H, 4548-US and 6048-US."),
  referenceDriver("inverter-solark-can", "Sol-Ark", "Sol-Ark CAN inverter binding", "inverter", ["CAN"]),
  referenceDriver("inverter-solis-hv-can", "Solis", "Solis HV CAN inverter binding", "inverter", ["CAN"]),

  referenceDriver("bms-byd-can", "BYD", "BYD BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-daly-can", "Daly", "Daly BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-daly-rs485", "Daly", "Daly BMS binding", "bms", ["RS485", "RS232/UART"]),
  referenceDriver("bms-growatt-can", "Growatt", "Growatt LV BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-growatt-hv-can", "Growatt", "Growatt HV BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-hngce-modbus", "HNGCE", "HNGCE BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-huawei-modbus", "Huawei", "Huawei BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-jbd-rs485", "JBD", "JBD BMS binding", "bms", ["RS485", "RS232/UART"]),
  referenceDriver("bms-jk-can", "JK", "JK BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-jk-modbus", "JK", "JK BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-jk-rs485", "JK", "JK BMS binding", "bms", ["RS485", "RS232/UART"]),
  referenceDriver("bms-lia-can", "LIA", "LIA BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-luxpower-can", "Luxpower", "Luxpower BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-megarevo-can", "Megarevo", "Megarevo BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-mppsolar-modbus", "MPP Solar", "MPP Solar BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-narada-modbus", "Narada", "Narada BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-pace-can", "PACE", "PACE BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-pylon-can", "PylonTech", "PylonTech LV BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-pylon-hv-can", "PylonTech", "PylonTech HV BMS binding", "bms", ["CAN"], "Референцията посочва PowerCube X1/X2; необходим е тест на точния firmware.", "The reference lists PowerCube X1/X2; the exact firmware requires validation."),
  referenceDriver("bms-pylon-rs485", "PylonTech", "PylonTech LV BMS binding", "bms", ["RS485", "RS232/UART"]),
  referenceDriver("bms-sacredsun-rs485", "SacredSun", "SacredSun BMS binding", "bms", ["RS485"]),
  referenceDriver("bms-samsung-can", "Samsung / Vertiv", "Samsung BMS binding", "bms", ["CAN"], "Референтната документация посочва съвместимост и с Vertiv BMS.", "The reference documentation also lists compatibility with Vertiv BMS."),
  referenceDriver("bms-seplos-can", "Seplos", "Seplos BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-seplos-rs485", "Seplos", "Seplos BMS binding", "bms", ["RS485"]),
  referenceDriver("bms-shoto-modbus", "Shoto", "Shoto BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-sma-si-can", "SMA", "SMA Sunny Island BMS binding", "bms", ["CAN"]),
  referenceDriver("bms-tian-modbus", "TianPower", "TianPower BMS binding", "bms", ["Modbus"], "Референцията посочва TP-BMS48100-LT-06 в YouSolar 51.2 V rack battery.", "The reference lists TP-BMS48100-LT-06 in a YouSolar 51.2 V rack battery."),
  referenceDriver("bms-voltronic-modbus", "Voltronic", "Voltronic BMS binding", "bms", ["Modbus"]),
  referenceDriver("bms-zte-modbus", "ZTE", "ZTE BMS binding", "bms", ["Modbus"]),
];
