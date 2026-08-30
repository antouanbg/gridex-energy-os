"use client";

import { useEffect, useState } from "react";
import { getGridexRuntimeConfig, GridexApiClient } from "./lib/gridex-api";

const navItems = [
  { id: "overview", label: "Преглед", labelEn:"Overview", icon: "⌂" },
  { id: "customers", label: "Клиенти и договори", labelEn:"Customers & contracts", icon: "◎" },
  { id: "sites", label: "Обекти", labelEn:"Sites", icon: "◇" },
  { id: "assets", label: "Енергийни активи", labelEn:"Energy assets", icon: "▦" },
  { id: "battery", label: "Батерия", labelEn:"Battery", icon: "▣" },
  { id: "schedule", label: "Графици", labelEn:"Schedules", icon: "▤" },
  { id: "market", label: "Пазар", labelEn:"Market", icon: "↗" },
  { id: "settlement", label: "Тарифи и сетълмент", labelEn:"Tariffs & settlement", icon: "¤" },
  { id: "automation", label: "Логика и режими", labelEn:"Logic & modes", icon: "⌘" },
  { id: "loads", label: "Управляеми товари", labelEn:"Flexible loads", icon: "ϟ" },
  { id: "balance", label: "Балансиране", labelEn:"Balancing", icon: "≋" },
  { id: "gateway", label: "Edge концентратор", labelEn:"Edge gateway", icon: "⌗" },
  { id: "devices", label: "Устройства", labelEn:"Devices", icon: "⊞" },
  { id: "alarms", label: "Аларми", labelEn:"Alarms", icon: "△" },
  { id: "reports", label: "Отчети и икономика", labelEn:"Reports & economics", icon: "▥" },
  { id: "settings", label: "Настройки", labelEn:"Settings", icon: "⚙" },
  { id: "plans", label: "Планове и абонамент", labelEn:"Plans & subscription", icon: "★" },
  { id: "about", label: "За нас", labelEn:"About us", icon: "○" },
];

const mobilePrimaryNav = new Set(["overview", "battery", "market", "automation"]);

const titles: Record<string, [string, string]> = {
  overview: ["Solar Park East", "ПОРТФОЛИО / СОФИЯ"],
  customers: ["Клиенти и договори", "ПОРТФОЛИО / CRM"],
  sites: ["Моите обекти", "ПОРТФОЛИО / 6 ОБЕКТА"],
  assets: ["Енергийни активи", "SOLAR PARK EAST / АКТИВИ"],
  battery: ["Батерия и оптимизация", "SOLAR PARK EAST / BESS"],
  schedule: ["Енергиен график", "SOLAR PARK EAST / 21 АВГУСТ"],
  market: ["Пазар и прогнози", "БЪЛГАРИЯ / IBEX ДЕН НАПРЕД"],
  settlement: ["Тарифи и сетълмент", "ПОРТФОЛИО / VEM"],
  automation: ["Логика и режими", "EMS / АВТОМАТИЗАЦИЯ"],
  loads: ["Управляеми товари", "EMS / FLEXIBLE LOADS"],
  balance: ["Балансираща група", "GRIDEX / 21 АВГУСТ"],
  gateway: ["Edge концентратор", "ХАРДУЕР / ЛОКАЛЕН КОНТРОЛ"],
  devices: ["Устройства и SCADA", "SOLAR PARK EAST / 12 УСТРОЙСТВА"],
  alarms: ["Аларми и събития", "ПОРТФОЛИО / АКТИВНИ"],
  reports: ["Отчети и икономика", "SOLAR PARK EAST / АНАЛИЗ"],
  settings: ["Настройки", "SOLAR PARK EAST / КОНФИГУРАЦИЯ"],
  plans: ["Планове и абонамент", "GRIDEX / ЛИЦЕНЗИ"],
  about: ["За нас", "GRIDEX / SUNSTORAGE PRO"],
  profile: ["Потребителски профил", "GRIDEX / МОЯТ ПРОФИЛ"],
  login: ["Вход в портала", "GRIDEX / СИГУРЕН ДОСТЪП"],
};

const titlesEn: Record<string, [string, string]> = {
  overview:["Solar Park East","PORTFOLIO / SOFIA"], customers:["Customers & contracts","PORTFOLIO / CRM"], sites:["My sites","PORTFOLIO / 6 SITES"], assets:["Energy assets","SOLAR PARK EAST / ASSETS"], battery:["Battery & optimisation","SOLAR PARK EAST / BESS"], schedule:["Energy schedule","SOLAR PARK EAST / 21 AUGUST"], market:["Market & forecasts","BULGARIA / IBEX DAY-AHEAD"], settlement:["Tariffs & settlement","PORTFOLIO / VEM"], automation:["Logic & operating modes","EMS / AUTOMATION"], loads:["Flexible loads","EMS / FLEXIBLE LOADS"], balance:["Balancing group","GRIDEX / 21 AUGUST"], gateway:["Edge gateway","HARDWARE / LOCAL CONTROL"], devices:["Devices & SCADA","SOLAR PARK EAST / 12 DEVICES"], alarms:["Alarms & events","PORTFOLIO / ACTIVE"], reports:["Reports & economics","SOLAR PARK EAST / ANALYTICS"], settings:["Settings","SOLAR PARK EAST / CONFIGURATION"], plans:["Plans & subscription","GRIDEX / LICENSING"], about:["About us","GRIDEX / SUNSTORAGE PRO"], profile:["User profile","GRIDEX / MY PROFILE"], login:["Sign in","GRIDEX / SECURE ACCESS"],
};

type DemoUser = {
  nameBg:string;
  nameEn:string;
  initialsBg:string;
  initialsEn:string;
  email:string;
  roleBg:string;
  roleEn:string;
};

const demoUser:DemoUser = {
  nameBg:"Антон Колев",
  nameEn:"Anton Kolev",
  initialsBg:"АК",
  initialsEn:"AK",
  email:"anton.kolev@gridex.tech",
  roleBg:"Администратор",
  roleEn:"Administrator",
};

const marketValues = [116, 104, 96, 88, 93, 118, 162, 188, 174, 148, 132, 126, 119, 128, 147, 176, 215, 242, 228, 204, 187, 164, 143, 126];
const scheduleValues = [-20, -28, -34, -30, -18, 0, 18, 30, 22, 8, 0, 0, -12, -25, -38, -46, 0, 30, 44, 50, 34, 18, 0, -10];

type UiLanguage = "bg" | "en";

type BatteryCostSettings = {
  capex:number;
  years:number;
  residual:number;
  maintenance:number;
  annualThroughput:number;
  warrantedCycles:number;
  todayCycles:number;
  method:"usage"|"straight";
  included:boolean;
};

const initialBatteryCost:BatteryCostSettings = {
  capex:420000,
  years:10,
  residual:10,
  maintenance:0.8,
  annualThroughput:720,
  warrantedCycles:8000,
  todayCycles:0.78,
  method:"usage",
  included:true,
};

const englishPhrases: [string, string][] = [
  ["Фотоволтаици", "Solar PV"],
  ["Към мрежата", "To grid"],
  ["Батерия · зарежда", "Battery · charging"],
  ["спрямо прогнозата", "versus forecast"],
  ["към мрежата", "to grid"],
  ["от мрежата", "from grid"],
  ["SOC достигна 72%", "SOC reached 72%"],
  ["IBEX ден напред · 24 интервала", "IBEX day-ahead · 24 intervals"],
  ["Отчетът е подготвен за изтегляне", "Report ready for download"],
  ["Графика на мощността по часове", "Hourly power chart"],
  ["Общо", "Total"],
  ["Обект", "Site"],
  ["Енергийни блокове", "Energy blocks"],
  ["Инвертори / BESS", "Inverters / BESS"],
  ["Инвертори / BMS", "Inverters / BMS"],
  ["Инвертори + електромери", "Inverters + meters"],
  ["Батерии и BMS", "Batteries & BMS"],
  ["Батерии", "Batteries"],
  ["Управление на зарядни станции", "EV-charger control"],
  ["Контролируем товар и settlement по групи", "Controllable load and group settlement"],
  ["Типове", "Types"],
  ["Серии", "Series"],
  ["Наличен", "Available"],
  ["Поддържан", "Supported"],
  ["Препоръчителен", "Recommended"],
  ["Задължителен", "Required"],
  ["Опционален", "Optional"],
  ["Обикновено read-only", "Usually read-only"],
  ["Няма директен power setpoint", "No direct power setpoint"],
  ["Производител и модел", "Manufacturer & model"],
  ["PCS производител и модел", "PCS manufacturer & model"],
  ["PCS — производител и модел", "PCS — manufacturer & model"],
  ["BMS/BAU модел", "BMS/BAU model"],
  ["Battery/BMS производител и модел", "Battery/BMS manufacturer & model"],
  ["AIO производител и модел", "AIO manufacturer & model"],
  ["AIO и inverter модел", "AIO & inverter model"],
  ["AC / DC по модел", "AC / DC by model"],
  ["DC / AC по модел", "DC / AC by model"],
  ["BESS капацитет", "BESS capacity"],
  ["BMS SOC/SOH и лимити", "BMS SOC/SOH & limits"],
  ["BMS лимити", "BMS limits"],
  ["Battery racks и BMS", "Battery racks & BMS"],
  ["Battery racks и BMS/BAU", "Battery racks & BMS/BAU"],
  ["Racks и contactors", "Racks & contactors"],
  ["Assembly status и availability", "Assembly status & availability"],
  ["AC/DC мощност и енергия", "AC/DC power & energy"],
  ["AC/DC защити и switchgear", "AC/DC protection & switchgear"],
  ["AC защити и релета", "AC protection & relays"],
  ["DC и AC protection", "DC & AC protection"],
  ["DC topology и voltage range", "DC topology & voltage range"],
  ["MPPT входове", "MPPT inputs"],
  ["MPPT канали и изолация", "MPPT channels & isolation"],
  ["PV MPPT входове", "PV MPPT inputs"],
  ["PV и battery DC диапазон", "PV & battery DC range"],
  ["Reactive power и power factor", "Reactive power & power factor"],
  ["Scale, offset и heartbeat", "Scale, offset & heartbeat"],
  ["Operating mode и alarms", "Operating mode & alarms"],
  ["Wake / sleep, ако е разрешено", "Wake / sleep, where permitted"],
  ["Reset demand — само ако е разрешено", "Reset demand — only where permitted"],
  ["Tariff selection при нужда", "Tariff selection where required"],
  ["CT/VT ratio и direction", "CT/VT ratio & direction"],
  ["Modbus address и phase order", "Modbus address & phase order"],
  ["AC coupling point и nominal power", "AC coupling point & rated power"],
  ["Напрежения, токове, честота", "Voltages, currents, frequency"],
  ["Температури, аларми, derating", "Temperatures, alarms, derating"],
  ["Независима енергия заряд/разряд и загуби", "Independent charge/discharge energy and losses"],
  ["Нетен внос/износ на целия обект", "Net site import/export"],
  ["Реално PV производство независимо от inverter telemetry", "Actual PV generation independent of inverter telemetry"],
  ["Физическо местоположение", "Physical location"],
  ["Логически измерван актив", "Logically metered asset"],
  ["Монтажна конфигурация", "Installation configuration"],
  ["Ако smart meter е в All-in-one шкафа, той остава отделен MeterAsset, но неговият parent е BESS assembly. Така може да се смени уредът без промяна на модела на PCS/BMS.", "If a smart meter is installed inside an all-in-one cabinet, it remains a separate MeterAsset whose parent is the BESS assembly. The meter can then be replaced without changing the PCS/BMS model."],
  ["Двупосочен battery DC порт", "Bidirectional battery DC port"],
  ["Общ AC инвертор", "Shared AC inverter"],
  ["Самостоятелен двупосочен AC/DC преобразувател между батерийната DC шина и AC шината на обекта.", "Standalone bidirectional AC/DC converter between the battery DC bus and the site's AC bus."],
  ["Преобразува DC енергията от PV масива към AC шината. Не управлява директно батерия.", "Converts DC energy from the PV array to the AC bus. It does not directly control a battery."],
  ["Съхранява енергията и определя реалния безопасен envelope. BMS лимитите винаги имат приоритет.", "Stores energy and defines the actual safe operating envelope. BMS limits always take priority."],
  ["Завършена AC-свързана BESS система. Към EMS се моделира като assembly с отделни PCS, Battery/BMS и вътрешни помощни assets.", "Complete AC-coupled BESS. In the EMS it is modelled as an assembly with separate PCS, Battery/BMS and internal auxiliary assets."],
  ["Обединява PV и батерия върху общ DC bus и използва един инвертор за връзка с AC мрежата.", "Combines PV and battery on a shared DC bus and uses one inverter for the AC-grid connection."],
  ["PV и батерията споделят DC bus преди общ hybrid inverter/PCS. Позволява съхранение на PV без допълнително AC преобразуване.", "PV and battery share a DC bus ahead of a common hybrid inverter/PCS, allowing PV energy storage without an additional AC conversion stage."],
  ["На AC изхода на PV инверторите или общото PV табло.", "At the AC output of the PV inverters or the common PV switchboard."],
  ["Между PCS AC изхода и общата AC шина; може да е физически в AIO шкафа.", "Between the PCS AC output and the common AC bus; it may be physically installed inside the AIO cabinet."],
  ["В точката на присъединяване — след главния прекъсвач, преди вътрешните разклонения.", "At the point of common coupling — after the main breaker and before the internal feeders."],
  ["На шината към основните консуматори, след отделяне на PV/BESS клоновете.", "On the main-load bus, downstream of the PV/BESS branches."],
  ["На отделен управляем клон — EV, HVAC или технологична линия.", "On a separate controllable feeder — EV, HVAC or a process line."],
  ["Батерията преминава в режим готовност", "Battery enters standby mode"],
  ["SOC цел е достигната", "SOC target reached"],
  ["В норма", "Within range"],
  ["Здраве на клетките", "Cell health"],
  ["Цикли", "Cycles"],
  ["от 8 000", "of 8,000"],
  ["1.44 MWh налични", "1.44 MWh available"],
  ["Максимална мощност заряд", "Maximum charge power"],
  ["Максимална мощност разряд", "Maximum discharge power"],
  ["Загуби", "Losses"],
  ["Зареждане", "Charging"],
  ["Заряд и разряд", "Charge & discharge"],
  ["Команди", "Commands"],
  ["Цена небаланс", "Imbalance price"],
  ["Проверка на нетния спред", "Check net spread"],
  ["Провери нетния спред", "Check net spread"],
  ["Над праг за продажба", "Above export-price threshold"],
  ["Минимална покупка от мрежата", "Minimum grid import"],
  ["Чиста консумация на обекта", "Net site consumption"],
  ["Мрежов внос", "Grid import"],
  ["Налична мощност", "Available power"],
  ["Максимална обща стойност", "Maximum total value"],
  ["Енергийна общност · август 2026", "Energy community · August 2026"],
  ["Калкулатор за периода", "Period calculator"],
  ["В сила от", "Effective from"],
  ["версия", "version"],
  ["Дневна", "Day"],
  ["Ниска тарифа", "Off-peak"],
  ["Пикова", "Peak"],
  ["Купена енергия", "Imported energy"],
  ["Продадена енергия", "Exported energy"],
  ["Виртуалната фактура е генерирана", "Virtual invoice generated"],
  ["Създадена е нова версия на тарифата", "New tariff version created"],
  ["Натиснете колона, за да промените мощността. Над линията е разряд, под нея — заряд.", "Select a column to change its power. Values above the line are discharge; values below it are charge."],
  ["Преизчисляване на всеки 5 минути · последно 14:30", "Recalculated every 5 minutes · last run 14:30"],
  ["Продавай", "Export"],
  ["Продавай сега", "Export now"],
  ["до 18:45", "until 18:45"],
  ["Продай 83.2 kW · запази 54% SOC", "Export 83.2 kW · retain 54% SOC"],
  ["Запази 54% SOC за пика", "Retain 54% SOC for the peak"],
  ["EMS РЕШАВАЩ МОДУЛ", "EMS DECISION ENGINE"],
  ["ОПТИМИЗАТОР", "OPTIMISER"],
  ["РЕШЕНИЕ", "DECISION"],
  ["ИЗХОД", "OUTPUT"],
  ["От арбитраж и график", "From arbitrage and schedule"],
  ["PCS команда", "PCS command"],
  ["общ модел и quality flags", "common model & quality flags"],
  ["2× Ethernet", "2× Ethernet"],
  ["метален корпус", "metal enclosure"],
  ["защита", "protection"],
  ["до +60°C", "to +60°C"],
  ["и може да работи с различна скорост, parity и timeout.", "and can operate with different baud rates, parity and timeouts."],
  ["24 VDC, reverse polarity, surge и brownout recovery", "24 VDC, reverse-polarity and surge protection, with brownout recovery"],
  ["Gateway няма връзка", "Gateway disconnected"],
  ["Температура 67.4°C · лимит 65°C", "Temperature 67.4°C · limit 65°C"],
  ["PV прогноза", "PV forecast"],
  ["PV утре", "PV tomorrow"],
  ["PV · следващи 3 дни", "PV · next 3 days"],
  ["Прогноза за утре", "Tomorrow's forecast"],
  ["Моделът използва", "The model uses"],
  ["обновява се на 30 мин.", "updated every 30 min"],
  ["Слаб PV ден: запази", "Low-PV day: retain"],
  ["и купи в", "and buy during"],
  ["евтини часа", "low-price hours"],
  ["без покупка от мрежата", "without grid imports"],
  ["Добра PV прогноза: зареди от слънцето и допускай арбитраж над", "Good PV forecast: charge from solar and allow arbitrage above"],
  ["Заявката е клампната от", "The request was clamped from"],
  ["Активна роля", "Active role"],
  ["ЕНЕРГИЕН ПОТОК", "ENERGY FLOW"],
  ["ПОРТФОЛИО / СОФИЯ", "PORTFOLIO / SOFIA"],
  ["ПОРТФОЛИО / 6 ОБЕКТА", "PORTFOLIO / 6 SITES"],
  ["ПОРТФОЛИО / АКТИВНИ", "PORTFOLIO / ACTIVE"],
  ["БЪЛГАРИЯ / IBEX ДЕН НАПРЕД", "BULGARIA / IBEX DAY-AHEAD"],
  ["SOLAR PARK EAST / АКТИВИ", "SOLAR PARK EAST / ASSETS"],
  ["SOLAR PARK EAST / 12 УСТРОЙСТВА", "SOLAR PARK EAST / 12 DEVICES"],
  ["SOLAR PARK EAST / 21 АВГУСТ", "SOLAR PARK EAST / 21 AUGUST"],
  ["GRIDEX / 21 АВГУСТ", "GRIDEX / 21 AUGUST"],
  ["ХАРДУЕР / ЛОКАЛЕН КОНТРОЛ", "HARDWARE / LOCAL CONTROL"],
  ["EMS / АВТОМАТИЗАЦИЯ", "EMS / AUTOMATION"],
  ["АКТИВИ НА ОБЕКТА", "SITE ASSETS"],
  ["ЕДИНЕН МОДЕЛ НА ДАННИТЕ", "UNIFIED DATA MODEL"],
  ["УНИВЕРСАЛЕН EDGE СЛОЙ", "UNIVERSAL EDGE LAYER"],
  ["EV ЗАРЯДНА ИНФРАСТРУКТУРА", "EV CHARGING INFRASTRUCTURE"],
  ["ЖИВА ИНТЕГРАЦИЯ С ВРЕМЕТО", "LIVE WEATHER INTEGRATION"],
  ["ВЛИЯНИЕ ВЪРХУ EMS", "IMPACT ON EMS"],
  ["DAY-AHEAD ПЛАНИРОВЧИК", "DAY-AHEAD PLANNER"],
  ["ПАЗАРЕН СИГНАЛ", "MARKET SIGNAL"],
  ["ЦЕНОВИ КОМПОНЕНТИ", "PRICE COMPONENTS"],
  ["15-МИНУТЕН ГРАФИК / АГРЕГИРАН ПО ЧАС", "15-MINUTE SCHEDULE / HOURLY AGGREGATION"],
  ["ГРАФИК СПРЯМО ИЗМЕРВАНЕ", "SCHEDULE VS METERING"],
  ["ИСТОРИЯ НА КОМАНДИТЕ", "COMMAND HISTORY"],
  ["РЕЖИМ НА РАБОТА", "OPERATING MODE"],
  ["ГРАНИЦИ И ЗАЩИТИ", "LIMITS & PROTECTION"],
  ["ОГРАНИЧЕНИЯ", "CONSTRAINTS"],
  ["ДРАЙВЕР-СЛОЙ", "DRIVER LAYER"],
  ["ЮГ → EDGE → СЕВЕР", "SOUTHBOUND → EDGE → NORTHBOUND"],
  ["ПОЛЕВИ УСТРОЙСТВА", "FIELD DEVICES"],
  ["EDGE КОНЦЕНТРАТОР", "EDGE GATEWAY"],
  ["НЕЗАОБИКОЛИМ ПРИНЦИП", "NON-BYPASSABLE PRINCIPLE"],
  ["БАЗОВА КОНФИГУРАЦИЯ", "BASE CONFIGURATION"],
  ["ПРИМЕРНА КАРТА · ЗА УТВЪРЖДАВАНЕ", "DRAFT MAP · FOR APPROVAL"],
  ["FIRMWARE АРХИТЕКТУРА", "FIRMWARE ARCHITECTURE"],
  ["ЛОКАЛЕН SOFTWARE FUSE", "LOCAL SOFTWARE FUSE"],
  ["ВИРТУАЛЕН СЕТЪЛМЕНТ", "VIRTUAL SETTLEMENT"],
  ["ВЕРСИОНИРАНА ТАРИФА", "VERSIONED TARIFF"],
  ["РАЗПРЕДЕЛЕНИЕ", "ALLOCATION"],
  ["УЧАСТНИЦИ", "PARTICIPANTS"],
  ["НОВО АЛАРМЕНО ПРАВИЛО", "NEW ALARM RULE"],
  ["3-дневна метео прогноза", "3-day weather forecast"],
  ["3 измервателни точки", "3 metering points"],
  ["4 × инверторни блока", "4 × inverter blocks"],
  ["9 зарядни точки", "9 charging points"],
  ["Обща мощност на обекта", "Total site power"],
  ["Обща мощност", "Total power"],
  ["Активни батерии", "Active batteries"],
  ["Последни автоматични действия", "Latest automated actions"],
  ["Автоматично управление на енергийния поток", "Automatic energy-flow control"],
  ["Автоматично управление", "Automatic control"],
  ["EMS изпълнява оптималния график", "The EMS executes the optimal schedule"],
  ["Висока пазарна цена", "High market price"],
  ["Ниска пазарна цена", "Low market price"],
  ["Висока цена + пик на товара", "High price + load peak"],
  ["PV излишък + ниска цена", "PV surplus + low price"],
  ["Комбинира пазарна цена, текущ поток, PV и товарова прогноза, SOC и всички технически ограничения.", "Combines market price, current power flow, PV and load forecasts, SOC and all technical constraints."],
  ["Използва първо PV за товара, съхранява излишъка и разрежда батерията при недостиг.", "Uses PV for the load first, stores the surplus and discharges the battery when required."],
  ["Зарежда в евтините часове и разрежда при висок пазарен сигнал, след отчитане на загубите и амортизацията.", "Charges during low-price hours and discharges on a high market signal, including losses and degradation cost."],
  ["Предзарежда батерията и покрива пиковете, за да не се надвишава договорената мощност.", "Pre-charges the battery and covers peaks to keep demand below the contracted capacity."],
  ["Поддържа потока в точката на присъединяване под зададения лимит чрез BESS и ограничаване на инверторите.", "Keeps power flow at the grid connection below the set limit using BESS and inverter curtailment."],
  ["Настройки за", "Settings for"],
  ["Запази този режим", "Save this mode"],
  ["Хоризонт на прогнозата", "Forecast horizon"],
  ["Хоризонт за предзаряд", "Pre-charge horizon"],
  ["Минимален резерв", "Minimum reserve"],
  ["Целеви SOC преди пик", "Target SOC before peak"],
  ["Цел след зареждане", "Post-charge target"],
  ["Цел след PV заряд", "Post-PV-charge target"],
  ["Целеви товарен пик", "Target load peak"],
  ["Допустим внос", "Allowed import"],
  ["Допустим износ", "Allowed export"],
  ["При пълна батерия", "When the battery is full"],
  ["Ограничи PV", "Curtail PV"],
  ["Ценови арбитраж", "Price arbitrage"],
  ["Самоконсумация", "Self-consumption"],
  ["Ограничаване на товарния пик", "Peak shaving"],
  ["Стратегия за оптимизация", "Optimisation strategy"],
  ["Покупка и продажба", "Import and export"],
  ["Печалба от ценови разлики", "Price-spread profit"],
  ["Енергия в края на деня", "End-of-day energy"],
  ["Позиция на групата", "Group position"],
  ["Разпределен дял", "Allocated share"],
  ["Разпределението е преизчислено", "Allocation recalculated"],
  ["Проверка на графика", "Schedule validation"],
  ["Графикът е записан и изпратен", "Schedule saved and submitted"],
  ["Изпратен в", "Submitted at"],
  ["Прогнозен резултат", "Forecast result"],
  ["спрямо пасивен режим", "versus passive operation"],
  ["Над минималния резерв", "Above the minimum reserve"],
  ["Точност", "Accuracy"],
  ["Препоръка за графика", "Schedule recommendation"],
  ["PV прогнозата участва в day-ahead графика към търговеца.", "The PV forecast is used in the day-ahead schedule submitted to the energy trader."],
  ["SOC целта се коригира преди облачни и силно слънчеви дни.", "The SOC target is adjusted before cloudy and highly sunny days."],
  ["Приложи към оптимизатора", "Apply to optimiser"],
  ["Прогнозата временно не е достъпна", "The forecast is temporarily unavailable"],
  ["Опитай отново", "Try again"],
  ["Зареждане...", "Loading..."],
  ["Свързване...", "Connecting..."],
  ["Изчакване на данни", "Waiting for data"],
  ["Очакване на актуална прогноза", "Waiting for an up-to-date forecast"],
  ["Праг за слабо слънце", "Low-solar threshold"],
  ["SOC цел при слаб PV ден", "SOC target for a low-PV day"],
  ["Условие „слабо слънце“", "Low-solar condition"],
  ["потенциал · праг", "potential · threshold"],
  ["Изчакване на прогноза", "Waiting for forecast"],
  ["Изчакване на метеорологични данни", "Waiting for weather data"],
  ["Автоматично", "Automatic"],
  ["Запази логиката и преизчисли графика", "Save logic and recalculate schedule"],
  ["Логиката и ценовите прагове са запазени", "Logic and price thresholds saved"],
  ["Активни правила", "Active rules"],
  ["Safety constraints винаги имат приоритет", "Safety constraints always take priority"],
  ["Всички защити са активни", "All protections are active"],
  ["Захранване и защита", "Power supply & protection"],
  ["Захранване", "Power supply"],
  ["Температура", "Temperature"],
  ["Монтаж", "Mounting"],
  ["Брой независими RS485 сегменти", "Number of independent RS485 segments"],
  ["порта", "ports"],
  ["RS485 портове", "RS485 ports"],
  ["2–4× изолиран RS485", "2–4× isolated RS485"],
  ["Отделяне на BMS, електромери, EV и проблемни шини", "Isolation of BMS, meters, EV and problematic buses"],
  ["Изолирана OT мрежа и връзка към EMS/VPN", "Isolated OT network and EMS/VPN uplink"],
  ["Рестарт при блокирал процес или комуникационен стек", "Restart after a stalled process or communication stack"],
  ["RTC и локален буфер", "RTC & local buffer"],
  ["Точни timestamp-и и store-and-forward при прекъсване", "Accurate timestamps and store-and-forward during outages"],
  ["Запази хардуерния профил", "Save hardware profile"],
  ["Регистрова карта", "Register map"],
  ["Регистър", "Register"],
  ["Канонично име", "Canonical name"],
  ["Формат", "Format"],
  ["Достъп", "Access"],
  ["Нормализация", "Normalisation"],
  ["валидирано качество", "validated quality"],
  ["фабричен лимит", "manufacturer limit"],
  ["унифициран знак", "unified sign convention"],
  ["след clamp", "after clamping"],
  ["Експорт на шаблон", "Export template"],
  ["Слоеве с ясна отговорност", "Layers with clear responsibilities"],
  ["Без валидни BMS лимити няма enable.", "Enable is blocked until valid BMS limits are available."],
  ["Heartbeat към PCS се поддържа локално.", "The PCS heartbeat is maintained locally."],
  ["Не се променят други настройки на устройството.", "No other device settings are changed."],
  ["Зададената мощност е 0 kW", "Power setpoint is 0 kW"],
  ["EMS връзка активна", "EMS connection active"],
  ["Последна команда преди 8 сек.", "Last command 8 sec ago"],
  ["Локален контрол работи", "Local control operational"],
  ["Без ограничение", "No limitation"],
  ["Клампване спрямо отпуснатата мощност", "Clamping against contracted capacity"],
  ["Текущ товар на обекта", "Current site load"],
  ["EMS връзката липсва — fail-safe нулира командата.", "EMS connection lost — fail-safe sets the command to zero."],
  ["Командата е в безопасния envelope.", "The command is within the safe envelope."],
  ["Активна мощност", "Active power"],
  ["Състояние на заряд", "State of charge"],
  ["Лимит заряд", "Charge limit"],
  ["Двупосочна", "Bidirectional"],
  ["Метрични точки", "Metric points"],
  ["Конектори", "Connectors"],
  ["Синхронизирай", "Synchronise"],
  ["Различните марки се превеждат към общи EMS точки. Командните точки се активират само след проверка на права и безопасни граници.", "Different brands are mapped to common EMS points. Command points are enabled only after permissions and safe limits are verified."],
  ["Възможности", "Capabilities"],
  ["Инсталиране · Настройка · Тест · Активиране", "Install · Configure · Test · Activate"],
  ["Продължи настройката", "Continue setup"],
  ["Мониторинг", "Monitoring"],
  ["Открий устройства", "Discover devices"],
  ["Добави устройство", "Add device"],
  ["Последни данни", "Latest data"],
  ["Обновено", "Updated"],
  ["общо", "total"],
  ["стабилна", "stable"],
  ["изпълнена", "completed"],
  ["Висока", "High"],
  ["Обхват", "Scope"],
  ["Канал", "Channel"],
  ["Условие", "Condition"],
  ["Праг", "Threshold"],
  ["Алармата е потвърдена", "Alarm acknowledged"],
  ["Ако температурата е над", "If the temperature is above"],
  ["извести чрез", "notify via"],
  ["Повторение след", "Repeat after"],
  ["Всички системи работят нормално", "All systems are operating normally"],
  ["Оптимизация по пазарна цена", "Market-price optimisation"],
  ["Автоматичната логика е активна", "Automatic control logic is active"],
  ["Първо комуникация, после мощност", "Communication first, power second"],
  ["Стратегията никога не пише директно към инвертора", "The strategy never writes directly to the inverter"],
  ["Един IP. Една регистрова карта. Локална безопасност.", "One IP. One register map. Local safety."],
  ["Индустриален Modbus концентратор между OpenRemote и разнородния хардуер на обекта.", "Industrial Modbus gateway between OpenRemote and the site's heterogeneous hardware."],
  ["Всеки измервател е отделен MeterAsset", "Every meter is a separate MeterAsset"],
  ["Къде са свързани измервателните точки?", "Where are the metering points connected?"],
  ["Какво представлява и какво съдържа всеки тип", "Definition and contents of each type"],
  ["Производители, типове и coupling", "Manufacturers, types and coupling"],
  ["Зареждане от външната мрежа", "Charging from the external grid"],
  ["Само при слаб PV ден и цена под прага", "Only on a low-PV day and below the price threshold"],
  ["3-дневна прогноза за PV оптимизация", "3-day forecast for PV optimisation"],
  ["Логика за утрешния ден", "Next-day control logic"],
  ["Планът се преизчислява при нова прогноза за време, PV, товар или IBEX цена.", "The plan is recalculated when a new weather, PV, load or IBEX price forecast arrives."],
  ["Прогнозата е приложена към оптимизационния хоризонт", "The forecast has been applied to the optimisation horizon"],
  ["Автоматична корекция спрямо PV прогноза", "Automatic adjustment based on the PV forecast"],
  ["Запази по-висок SOC за слаб PV ден", "Keep a higher SOC for a low-PV day"],
  ["Освободи капацитет в BESS преди PV пика", "Free BESS capacity before the PV peak"],
  ["Купува при ниска и продава при висока цена", "Buy at a low price and sell at a high price"],
  ["Ограничава върховото потребление", "Limits peak demand"],
  ["Без отдаване към мрежата", "Zero export to the grid"],
  ["Максимална собствена консумация", "Maximum self-consumption"],
  ["Балансиран заряд по цена и PV прогноза", "Balanced charging based on price and PV forecast"],
  ["Тарифи и сетълмент", "Tariffs & settlement"],
  ["Клиенти и договори", "Customers & contracts"],
  ["Енергийни активи", "Energy assets"],
  ["Батерия и оптимизация", "Battery & optimisation"],
  ["Пазар и прогнози", "Market & forecasts"],
  ["Логика и режими", "Logic & operating modes"],
  ["Балансираща група", "Balancing group"],
  ["Устройства и SCADA", "Devices & SCADA"],
  ["Аларми и събития", "Alarms & events"],
  ["Енергиен график", "Energy schedule"],
  ["Моите обекти", "My sites"],
  ["Енергиен поток", "Energy flow"],
  ["В реално време", "Real time"],
  ["ДНЕШЕН РЕЗУЛТАТ", "TODAY'S RESULT"],
  ["Нетен резултат", "Net result"],
  ["Спестени разходи", "Avoided costs"],
  ["Собствено потребление", "Self-consumption"],
  ["Приход от продажба", "Export revenue"],
  ["Разход за покупка", "Import cost"],
  ["Виж подробен отчет", "View detailed report"],
  ["PV производство", "PV generation"],
  ["Състояние на батерията", "Battery status"],
  ["Цена в момента", "Current price"],
  ["Продаваме към мрежата", "Exporting to the grid"],
  ["МОЩНОСТ И ПРОГНОЗА", "POWER & FORECAST"],
  ["Днешен профил", "Today's profile"],
  ["ПОСЛЕДНИ ДЕЙСТВИЯ", "RECENT ACTIONS"],
  ["Дневник на системата", "System log"],
  ["Продажба към мрежата", "Export to the grid"],
  ["автоматична команда", "automatic command"],
  ["Зареждането е ограничено", "Charging has been limited"],
  ["Графикът е приет", "Schedule accepted"],
  ["Всички събития", "All events"],
  ["КЛИЕНТСКО ПОРТФОЛИО", "CUSTOMER PORTFOLIO"],
  ["Активни договори", "Active contracts"],
  ["Управлявани активи", "Managed assets"],
  ["Месечна стойност", "Monthly value"],
  ["360° КЛИЕНТСКИ ПРОФИЛ", "360° CUSTOMER PROFILE"],
  ["Активна услуга", "Active service"],
  ["Договор", "Contract"],
  ["валиден до", "valid until"],
  ["Организация", "Organisation"],
  ["активни", "active"],
  ["свързани", "connected"],
  ["Оперативен преглед", "Operational overview"],
  ["Отвори логиката", "Open logic"],
  ["Ново правило", "New rule"],
  ["Ново алармено правило", "New alarm rule"],
  ["Метрична точка", "Metric point"],
  ["Температура на инвертор", "Inverter temperature"],
  ["Загуба на комуникация", "Communication loss"],
  ["Мощност към мрежата", "Grid power"],
  ["По-голямо от", "Greater than"],
  ["По-малко от", "Less than"],
  ["Няма данни", "No data"],
  ["За период", "For a period"],
  ["Всички PV инвертори", "All PV inverters"],
  ["Цялото портфолио", "Entire portfolio"],
  ["Предварителен преглед", "Preview"],
  ["Аларменото правило е активно", "The alarm rule is active"],
  ["КАТАЛОГ НА ДРАЙВЕРИТЕ", "DRIVER CATALOGUE"],
  ["ТИПОВ МОДЕЛ НА ДРАЙВЕРИТЕ", "DRIVER TYPE MODEL"],
  ["Задължителна идентификация", "Required identification"],
  ["Метрични точки и права за команда", "Metric points and command permissions"],
  ["Нормализация на данните", "Data normalisation"],
  ["Спецификата остава локално", "Vendor specifics stay local"],
  ["Инвертори и батерийни системи", "Inverters and battery systems"],
  ["Електромери и I/O", "Meters & I/O"],
  ["Зарядни станции", "EV chargers"],
  ["Управляеми товари", "Controllable loads"],
  ["Производител и модел", "Manufacturer & model"],
  ["Протоколи и управление", "Protocols & control"],
  ["Химия и капацитет", "Chemistry & capacity"],
  ["Лимити заряд/разряд", "Charge/discharge limits"],
  ["Температури и alarms", "Temperatures & alarms"],
  ["Номинална AC/DC мощност", "Rated AC/DC power"],
  ["Мрежова конфигурация", "Grid configuration"],
  ["Комуникационна архитектура", "Communication architecture"],
  ["Хардуерна платформа", "Hardware platform"],
  ["Интерфейси и надеждност", "Interfaces & reliability"],
  ["ЗАДЪЛЖИТЕЛНИ ХАРДУЕРНИ ФУНКЦИИ", "REQUIRED HARDWARE FUNCTIONS"],
  ["Всеки порт е галванично изолиран", "Each port is galvanically isolated"],
  ["автоматично възстановяване", "automatic recovery"],
  ["галванично изолирани", "galvanically isolated"],
  ["Локален контрол работи", "Local control is operational"],
  ["Устройствата остават в безопасно състояние", "Devices remain in a safe state"],
  ["Загуба на EMS връзка", "Loss of EMS connection"],
  ["Възстанови EMS връзката", "Restore EMS connection"],
  ["Симулирай загуба на EMS", "Simulate EMS loss"],
  ["Желана мощност", "Requested power"],
  ["Реални, не предполагаеми", "Actual, never assumed"],
  ["Отпусната мощност", "Contracted capacity"],
  ["Само safe стойност", "Safe value only"],
  ["Унифициран Modbus TCP интерфейс към OpenRemote", "Unified Modbus TCP interface to OpenRemote"],
  ["Един IP · унифицирана карта", "One IP · unified map"],
  ["пише желана мощност", "writes requested power"],
  ["получава safe стойност", "receives the safe value"],
  ["РЕЖИМИ НА УПРАВЛЕНИЕ", "CONTROL MODES"],
  ["Изберете режим, за да видите неговите настройки", "Select a mode to view its settings"],
  ["ВХОДОВЕ → РЕШЕНИЕ → КОМАНДИ", "INPUTS → DECISION → COMMANDS"],
  ["ЦЕЛ НА РЕЖИМА", "MODE OBJECTIVE"],
  ["ВХОДНИ СИГНАЛИ", "INPUT SIGNALS"],
  ["Генерирано решение", "Generated decision"],
  ["Цена + поток + PV и товарова прогноза", "Price + power flow + PV and load forecast"],
  ["Текущ поток", "Current power flow"],
  ["Текущ товар", "Current load"],
  ["Пазарна цена", "Market price"],
  ["Време + PV + товар", "Weather + PV + load"],
  ["Цена купува", "Import price"],
  ["Цена продава", "Export price"],
  ["Минимален SOC", "Minimum SOC"],
  ["Целеви SOC", "Target SOC"],
  ["Мрежов лимит", "Grid limit"],
  ["Мощностен лимит", "Power limit"],
  ["Цена на цикъл", "Cycle cost"],
  ["Запази настройките", "Save settings"],
  ["Обнови прогнозата", "Refresh forecast"],
  ["Автоматично обновяване", "Automatic refresh"],
  ["Сега", "Now"],
  ["Утре", "Tomorrow"],
  ["След 2 дни", "In 2 days"],
  ["валеж", "rain"],
  ["слънце", "sunshine"],
  ["облачност", "cloud cover"],
  ["Ясно", "Clear"],
  ["Облачно", "Cloudy"],
  ["Разкъсана облачност", "Partly cloudy"],
  ["Превалявания", "Showers"],
  ["Дъжд", "Rain"],
  ["Буря", "Storm"],
  ["Сняг", "Snow"],
  ["Мъгла", "Fog"],
  ["Покупка от мрежата", "Grid import"],
  ["Не е нужна", "Not required"],
  ["Минимална SOC цел", "Minimum SOC target"],
  ["Свободен капацитет", "Available headroom"],
  ["Приложена команда", "Applied command"],
  ["Софтуерен предпазител", "Software fuse"],
  ["Заявено зареждане BESS", "Requested BESS charging"],
  ["Командата е ограничена", "Command limited"],
  ["Пазарна цена по часове", "Hourly market price"],
  ["Разряд / продажба", "Discharge / export"],
  ["Мрежов заряд", "Grid charging"],
  ["Задържане", "Hold"],
  ["Заряд", "Charge"],
  ["Разряд", "Discharge"],
  ["Купува от мрежата", "Imports from grid"],
  ["Продава към мрежата", "Exports to grid"],
  ["Мрежови компоненти", "Network components"],
  ["Нетен ценови прозорец", "Net price spread"],
  ["Прогнозен резултат", "Forecast result"],
  ["Очакван SOC", "Expected SOC"],
  ["Статус към оператор", "Operator status"],
  ["Точност на прогнозата", "Forecast accuracy"],
  ["ГРАФИК СПРЯМО ИЗМЕРВАНЕ", "SCHEDULE VS METERING"],
  ["Измерено", "Measured"],
  ["Отклонение", "Deviation"],
  ["Небаланс", "Imbalance"],
  ["Участници", "Participants"],
  ["Обща позиция", "Total position"],
  ["Резерв за компенсация", "Balancing reserve"],
  ["Резултат днес", "Result today"],
  ["Последна телеметрия", "Latest telemetry"],
  ["Последна команда", "Latest command"],
  ["Търсене на устройство", "Search device"],
  ["Всички устройства", "All devices"],
  ["Сканирането откри 2 нови устройства", "Scan found 2 new devices"],
  ["Висока температура на инвертор", "High inverter temperature"],
  ["Метеостанция: забавени данни", "Weather station: delayed data"],
  ["Поток към мрежата", "Grid export"],
  ["Данните не са обновявани", "Data has not been updated"],
  ["Потвърди", "Acknowledge"],
  ["Отвори", "Open"],
  ["Затвори", "Close"],
  ["Запази", "Save"],
  ["Обнови", "Refresh"],
  ["Преизчисли", "Recalculate"],
  ["Преглед", "Overview"],
  ["Клиенти", "Customers"],
  ["Обекти", "Sites"],
  ["Батерия", "Battery"],
  ["Графици", "Schedules"],
  ["Пазар", "Market"],
  ["Балансиране", "Balancing"],
  ["Устройства", "Devices"],
  ["Аларми", "Alarms"],
  ["За нас", "About us"],
  ["Администратор", "Administrator"],
  ["Оператор", "Operator"],
  ["Клиент", "Customer"],
  ["Търговец", "Trader"],
  ["Работна роля", "Working role"],
  ["Избран обект", "Selected site"],
  ["Период", "Period"],
  ["Днес", "Today"],
  ["Тази седмица", "This week"],
  ["Този месец", "This month"],
  ["Известия", "Notifications"],
  ["Основна навигация", "Main navigation"],
  ["Онлайн", "Online"],
  ["Офлайн", "Offline"],
  ["Предупреждение", "Warning"],
  ["Внимание", "Warning"],
  ["Критична", "Critical"],
  ["Информация", "Information"],
  ["Активен", "Active"],
  ["Готов", "Ready"],
  ["Нормално", "Normal"],
  ["Няма връзка", "Disconnected"],
  ["Изпълнена", "Completed"],
  ["Приет", "Accepted"],
  ["Тест успешен", "Test passed"],
  ["Конфигуриране", "Configuration"],
  ["Последни данни", "Latest data"],
  ["Автоматичен режим", "Automatic mode"],
  ["Ръчен режим", "Manual mode"],
  ["Консумация", "Consumption"],
  ["Товар", "Load"],
  ["Мрежа", "Grid"],
  ["Мощност", "Power"],
  ["Енергия днес", "Energy today"],
  ["Производство", "Generation"],
  ["Потребление", "Consumption"],
  ["Прогноза", "Forecast"],
  ["Цена", "Price"],
  ["Статус", "Status"],
  ["Устройство", "Device"],
  ["Производител", "Manufacturer"],
  ["Модел", "Model"],
  ["Протокол", "Protocol"],
  ["Комуникация", "Communication"],
  ["Команда", "Command"],
  ["Резултат", "Result"],
  ["Причина", "Reason"],
  ["Посока", "Direction"],
  ["Източник", "Source"],
  ["Стойност", "Value"],
  ["Единица", "Unit"],
  ["Час", "Hour"],
  ["София", "Sofia"],
  ["Пловдив", "Plovdiv"],
  ["Варна", "Varna"],
  ["Бургас", "Burgas"],
  ["Русе", "Ruse"],
  ["21 август", "21 August"],
  ["август", "August"],
  ["преди", "ago"],
  ["мин.", "min"],
  ["сек.", "sec"],
  ["лв./MWh", "BGN/MWh"],
  ["лв.", "BGN"],
  ["Edge концентратор", "Edge gateway"],
  ["Отчети и икономика", "Reports & economics"],
  ["Настройки", "Settings"],
  ["Планове и абонамент", "Plans & subscription"],
  ["Оптимално", "Optimal"],
  ["Организации", "Organisations"],
  ["Нов клиент", "New customer"],
  ["2 обекта · 17 актива", "2 sites · 17 assets"],
  ["1 обекта · 12 актива", "1 site · 12 assets"],
  ["2 обекта · 21 актива", "2 sites · 21 assets"],
  ["1 обекта · 9 актива", "1 site · 9 assets"],
  ["За подновяване", "Renewal due"],
  ["Отвори договор", "Open contract"],
  ["Сетълмент", "Settlement"],
  ["PV инвертори", "PV inverters"],
  ["20 от 21 онлайн", "20 of 21 online"],
  ["PV масив", "PV array"],
  ["EV парк", "EV fleet"],
  ["Нови марки и модели се добавят като драйвери, без промяна на EMS логиката.", "New brands and models are added as drivers without changing the EMS logic."],
  ["Каталог", "Catalogue"],
  ["Нов драйвер", "New driver"],
  ["PV инвертор", "PV inverter"],
  ["Hybrid инвертор", "Hybrid inverter"],
  ["Съдържа", "Includes"],
  ["Локален контролер / EMS", "Local controller / EMS"],
  ["Телеметрия", "Telemetry"],
  ["Driver package = тип + производител + модел + firmware/register-map версия", "Driver package = type + manufacturer + model + firmware/register-map version"],
  ["„All-in-one“ не е един черен блок. PCS, Battery/BMS, smart meter и помощните системи се виждат като отделни child assets под общ assembly.", "“All-in-one” is not a black box. PCS, Battery/BMS, smart meter and auxiliary systems are shown as separate child assets under one assembly."],
  ["OPENREMOTE МОДЕЛ", "OPENREMOTE MODEL"],
  ["Запази измервателната топология", "Save metering topology"],
  ["Разпределение според свободната мощност", "Allocation based on available capacity"],
  ["Зареждане по цена", "Price-based charging"],
  ["Отлагане при скъпа енергия", "Postpone during expensive energy"],
  ["Приоритет на собственото PV производство", "Prioritise own PV generation"],
  ["OCPP контрол", "OCPP control"],
  ["Сесии, тарифи, лимити и статус", "Sessions, tariffs, limits and status"],
  ["Отлично състояние", "Excellent condition"],
  ["FEC днес", "FEC today"],
  ["от 8000 гарантирани", "of 8,000 warranted"],
  ["Интелигентен хибрид", "Intelligent hybrid"],
  ["Оперативни настройки", "Operating settings"],
  ["Запазен резерв", "Reserved capacity"],
  ["Продажба", "Export"],
  ["Ограничаване", "Curtailment"],
  ["SOC цел", "SOC target"],
  ["Очакван SOC в 24:00", "Expected SOC at 24:00"],
  ["Запази и изпрати", "Save and submit"],
  ["ПРОГНОЗА", "FORECAST"],
  ["Мрежови лимит 780 kW", "Grid limit 780 kW"],
  ["Бизнес Flex 2026", "Business Flex 2026"],
  ["Нова версия", "New version"],
  ["Купува от мрежата", "Imports from grid"],
  ["Продава към мрежата", "Exports to grid"],
  ["Генерирай виртуална фактура", "Generate virtual invoice"],
  ["УЧАСТНИК", "PARTICIPANT"],
  ["БАЛАНС", "BALANCE"],
  ["За преглед", "Review required"],
  ["Текущо решение", "Current decision"],
  ["Увереност", "Confidence"],
  ["Логика в реално време", "Real-time logic"],
  ["PV излишък", "PV surplus"],
  ["Има свободна енергия", "Available surplus energy"],
  ["Прогноза 3 дни", "3-day forecast"],
  ["лимит 32 kW", "limit 32 kW"],
  ["Инвертори", "Inverters"],
  ["без лимит", "no limit"],
  ["IBEX цена", "IBEX price"],
  ["PV + товар", "PV + load"],
  ["Оптимизирай целия хоризонт", "Optimise entire horizon"],
  ["Поток 20%", "Power flow 20%"],
  ["Резерв 15%", "Reserve 15%"],
  ["6 ч.", "6 h"],
  ["сб,", "Sat,"],
  ["нд,", "Sun,"],
  ["пн,", "Mon,"],
  ["Моделът използва 500 kWp и PR 82%; обновява се на 30 мин.", "The model uses 500 kWp and PR 82%; updated every 30 min."],
  ["Логика за утрешния ден · 96 × 15 минути", "Next-day control logic · 96 × 15-minute intervals"],
  ["Купувай от мрежата под", "Import from grid below"],
  ["Продавай над", "Export above"],
  ["Зареждане от външната мрежа", "Charging from the external grid"],
  ["Покупка от мрежата", "Grid import"],
  ["PV заряд", "PV charging"],
  ["Добра PV прогноза: зареди от слънцето и допускай арбитраж над", "Good PV forecast: charge from solar and allow arbitrage above"],
  ["Запази логиката", "Save logic"],
  ["Цена ≤ праг за покупка", "Price ≤ import threshold"],
  ["Зареждай батерията до 85%", "Charge battery to 85%"],
  ["Цена ≥ праг за продажба", "Price ≥ export threshold"],
  ["Разреждай до минималния SOC", "Discharge to minimum SOC"],
  ["Прогнозиран PV излишък", "Forecast PV surplus"],
  ["PV − товар > 80 kW за следващите 2 ч.", "PV − load > 80 kW for the next 2 h"],
  ["Освободи капацитет в батерията", "Free battery capacity"],
  ["Прогнозиран товарен пик", "Forecast load peak"],
  ["Товар > 620 kW в следващите 60 мин.", "Load > 620 kW in the next 60 min"],
  ["Запази енергия за peak shaving", "Reserve energy for peak shaving"],
  ["Ограничение на мрежата", "Grid constraint"],
  ["Поток към мрежата > 780 kW", "Grid export > 780 kW"],
  ["Ограничи PV или зареди BESS", "Curtail PV or charge BESS"],
  ["PV прогноза за утре < 60% или валеж > 55%", "Tomorrow's PV forecast < 60% or rain > 55%"],
  ["Коригирай SOC целта и day-ahead графика", "Adjust SOC target and day-ahead schedule"],
  ["BMS граници · минимален SOC · мрежова защита · ramp rate · комуникационен watchdog", "BMS limits · minimum SOC · grid protection · ramp rate · communication watchdog"],
  ["Текущи позиции", "Current positions"],
  ["ГРАФИК", "SCHEDULE"],
  ["локално · рег. 5301", "local · reg. 5301"],
  ["Архитектура", "Architecture"],
  ["Firmware и safety", "Firmware & safety"],
  ["Локално автономна", "Locally autonomous"],
  ["PCC електромер", "PCC meter"],
  ["Shelly контролери", "Shelly controllers"],
  ["Ethernet · локална LAN", "Ethernet · local LAN"],
  ["Положителен/отрицателен знак", "Positive/negative sign"],
  ["Мащабиране ×10 / ×100", "Scaling ×10 / ×100"],
  ["0-based PDU и +1 offset", "0-based PDU and +1 offset"],
  ["Word и byte order", "Word and byte order"],
  ["Quality и timeout логика", "Quality and timeout logic"],
  ["SCADA / КОМУНИКАЦИЯ", "SCADA / COMMUNICATION"],
  ["Всички", "All"],
  ["Данните не са обновени от 24 мин.", "Data has not been updated for 24 min"],
  ["Графикът е актуализиран", "Schedule updated"],
  ["Автоматична корекция спрямо PV прогнозата", "Automatic adjustment based on the PV forecast"],
  ["Онлайн · преди 8 сек.", "Online · 8 sec ago"],
  ["и PR 82%; обновява се на 30 мин.", "and PR 82%; updated every 30 min."],
  ["от 24 мин.", "for 24 min"],
  ["обекта", "sites"],
  ["актива", "assets"],
  ["Локален", "Local"],
  ["Продаваме", "Exporting"],
  ["Участник", "Participant"],
  ["Баланс", "Balance"],
  ["График", "Schedule"],
  ["DIN-rail индустриален контролер", "DIN-rail industrial controller"],
  ["Адресите са визуален работен шаблон, не финална спецификация.", "The addresses are a visual working template, not a final specification."],
  ["Финалната карта ще се заключи след получаване на Sinexcel PCS, BAU/BMS, Huawei SmartLogger и northbound спецификациите.", "The final map will be locked after the Sinexcel PCS, BAU/BMS, Huawei SmartLogger and northbound specifications are received."],
  ["Унифицирана карта, quality flags, timestamps", "Unified map, quality flags and timestamps"],
  ["Канонични единици, знак, scale, offset, byte order", "Canonical units, sign, scale, offset and byte order"],
  ["на 60 kW.", "to 60 kW."],
  ["Име", "Name"],
  ["Изход", "Output"],
  ["EV мощностен лимит", "EV power limit"],
  ["String или central", "String or central"],
  ["Firmware и register map", "Firmware and register map"],
  ["DC/AC преобразувател", "DC/AC converter"],
  ["контролер", "controller"],
  ["Поддържана батерия/BMS", "Supported battery/BMS"],
  ["PV, battery и grid power", "PV, battery and grid power"],
  ["SOC от външен/вграден BMS", "SOC from external/integrated BMS"],
  ["Номинални kW и kVA", "Rated kW and kVA"],
  ["Знакова конвенция", "Sign convention"],
  ["Battery DC power и SOC", "Battery DC power and SOC"],
  ["Независим измервателен Asset, поставен в конкретна електрическа точка. Ролята се задава чрез measurement point, не само чрез името на уреда.", "An independent metering asset placed at a specific electrical point. Its role is defined by the measurement point, not only by the meter name."],
  ["Разряд над", "Discharge above"],
  ["Зареждай под", "Charge below"],
  ["Следвай локалния баланс", "Follow the local balance"],
  ["Ограничи вноса до", "Limit import to"],
  ["PV мощност", "PV power"],
  ["Компенсирай за секунди", "Compensate within seconds"],
  ["Износ ≤", "Export ≤"],
  ["PCC поток 60%", "PCC flow 60%"],
  ["EV товар", "EV load"],
  ["Прогноза за пик", "Peak forecast"],
  ["Договорен лимит", "Contract limit"],
  ["Разреждай над лимита", "Discharge above the limit"],
  ["Целеви пик", "Target peak"],
  ["Метрика → условие → известяване", "Metric → condition → notification"],
  ["SOC на батерия", "Battery SOC"],
  ["Запази и активирай", "Save and enable"],
  ["Търсене на устройство...", "Search for a device..."],
  ["Търсене на устройство", "Search for a device"],
  ["Обнови прогнозата", "Refresh forecast"],
  ["Тарифен план", "Tariff plan"],
  ["изключи", "disable"],
  ["включи", "enable"],
  ["за", "for"],
  ["ч.", "h"],
];

const sortedEnglishPhrases = [...englishPhrases].sort(([left], [right]) => right.length - left.length);

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function translateText(value: string) {
  return sortedEnglishPhrases.reduce((result, [bg, en]) => {
    const escaped = bg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return result.replace(new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, "gu"), en);
  }, value);
}

function usePageLanguage(lang: UiLanguage) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".app-shell");
    if (!root) return;
    document.documentElement.lang = lang;

    const translateNode = (node: Text) => {
      if (node.parentElement?.closest("[data-no-translate]")) return;
      const current = node.nodeValue ?? "";
      let source = originalText.get(node);
      if (source === undefined) {
        source = current;
        originalText.set(node, source);
      } else if (lang === "en" && /[А-Яа-я]/.test(current) && current !== translateText(source)) {
        source = current;
        originalText.set(node, source);
      }
      const next = lang === "en" ? translateText(source) : source;
      if (current !== next) node.nodeValue = next;
    };

    const translateElement = (element: Element) => {
      if (element.closest("[data-no-translate]")) return;
      const names = ["aria-label", "placeholder", "title"];
      let sources = originalAttributes.get(element);
      if (!sources) {
        sources = new Map<string, string>();
        originalAttributes.set(element, sources);
      }
      names.forEach((name) => {
        const current = element.getAttribute(name);
        if (current === null) return;
        let source = sources!.get(name);
        if (source === undefined || (lang === "en" && /[А-Яа-я]/.test(current) && current !== translateText(source))) {
          source = current;
          sources!.set(name, source);
        }
        const next = lang === "en" ? translateText(source) : source;
        if (current !== next) element.setAttribute(name, next);
      });
    };

    const translateTree = (target: Node) => {
      if (target.nodeType === Node.TEXT_NODE) {
        translateNode(target as Text);
        return;
      }
      if (target.nodeType === Node.ELEMENT_NODE) {
        translateElement(target as Element);
        (target as Element).querySelectorAll("[aria-label], [placeholder], [title]").forEach(translateElement);
      }
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        translateNode(node as Text);
        node = walker.nextNode();
      }
    };

    translateTree(root);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") translateNode(record.target as Text);
        if (record.type === "attributes") translateElement(record.target as Element);
        record.addedNodes.forEach(translateTree);
      });
    });
    observer.observe(root, { childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "placeholder", "title"], subtree: true });
    return () => observer.disconnect();
  }, [lang]);
}

export default function Home() {
  const [view, setView] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [auto, setAuto] = useState(true);
  const [period, setPeriod] = useState("Днес");
  const [site, setSite] = useState("Solar Park East");
  const [role, setRole] = useState("Администратор");
  const [lang,setLang] = useState<"bg"|"en">("bg");
  const [batteryNotice,setBatteryNotice] = useState(true);
  const [batteryCost,setBatteryCost] = useState<BatteryCostSettings>(initialBatteryCost);
  const [toast, setToast] = useState("");
  const [sessionUser,setSessionUser] = useState<DemoUser|null>(demoUser);
  const [accountMenuOpen,setAccountMenuOpen] = useState(false);
  const [backendState, setBackendState] = useState<"demo" | "checking" | "online" | "offline">(
    () => getGridexRuntimeConfig().mode === "demo" ? "demo" : "checking",
  );
  usePageLanguage(lang);

  useEffect(() => {
    const config = getGridexRuntimeConfig();
    if (config.mode === "demo") return;
    const controller = new AbortController();
    const client = new GridexApiClient(config);
    client.health(controller.signal).then(() => setBackendState("online")).catch(() => setBackendState("offline"));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event:KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (id: string) => {
    setView(id);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = () => {
    setSessionUser(null);
    setRole("Администратор");
    navigate("login");
    notify(lang==="en"?"You have signed out safely":"Излязохте успешно от профила");
  };

  const signIn = (email:string) => {
    const nextUser = email.toLowerCase() === demoUser.email ? demoUser : {
      ...demoUser,
      email,
      nameBg:"Демо потребител",
      nameEn:"Demo User",
      initialsBg:"ДП",
      initialsEn:"DU",
    };
    setSessionUser(nextUser);
    setRole(nextUser.roleBg);
    navigate("overview");
    notify(lang==="en"?"Welcome to GrideX Energy OS":"Добре дошли в GrideX Energy OS");
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
        <button className="brand" onClick={() => navigate("overview")} aria-label={lang==="en"?"GrideX Energy OS – home":"GrideX Energy OS – начало"}>
          <span>GX</span><div>GRIDEX<small>ENERGY OS</small></div>
        </button>
        <nav id="main-navigation" aria-label={lang==="en"?"Main navigation":"Основна навигация"}>
          {navItems.map((item) => {
            const badge=item.id==="battery"?(batteryNotice?"1":""):item.id==="automation"?"2":item.id==="alarms"?"3":"";
            const tone=item.id==="battery"?"amber":item.id==="automation"?"green":"red";
            const mobilePrimary=mobilePrimaryNav.has(item.id);
            return <button key={item.id} className={`${view === item.id ? "active" : ""} ${mobilePrimary ? "mobile-primary" : ""}`} onClick={() => navigate(item.id)}>
              <i>{item.icon}</i><span>{lang==="en"?item.labelEn:item.label}</span>{badge&&<em className={`nav-badge ${tone}`}>{badge}</em>}
            </button>;
          })}
        </nav>
        {mobileNavOpen&&<button className="mobile-nav-scrim" aria-label={lang==="en"?"Close menu":"Затвори меню"} onClick={()=>setMobileNavOpen(false)}/>}
        <button className="mobile-menu-toggle" data-no-translate aria-controls="main-navigation" aria-expanded={mobileNavOpen} onClick={()=>setMobileNavOpen(!mobileNavOpen)}>
          <i>{mobileNavOpen?"×":"☰"}</i><span>{lang==="en"?"Menu":"Меню"}</span>
        </button>
        <div className="gateway"><span className="live-dot"/><div><strong>Edge Gateway</strong><small>Онлайн · преди 8 сек.</small></div></div>
        <div className="profile-wrap" data-no-translate>
          <button className={`profile ${accountMenuOpen?"open":""}`} onClick={()=>setAccountMenuOpen(!accountMenuOpen)} aria-haspopup="menu" aria-expanded={accountMenuOpen}>
            <span>{sessionUser?(lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg):"↪"}</span>
            <div><strong>{sessionUser?(lang==="en"?sessionUser.nameEn:sessionUser.nameBg):(lang==="en"?"Sign in":"Вход")}</strong><small>{sessionUser?(lang==="en"?sessionUser.roleEn:sessionUser.roleBg):(lang==="en"?"No active session":"Няма активна сесия")}</small></div><b>⋮</b>
          </button>
        </div>
      </aside>

      {accountMenuOpen&&<>
        <button className="account-menu-scrim" aria-label={lang==="en"?"Close account menu":"Затвори потребителското меню"} onClick={()=>setAccountMenuOpen(false)}/>
        <div className="account-menu" role="menu" data-no-translate>
          {sessionUser?<>
            <div className="account-menu-head"><span>{lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg}</span><div><strong>{lang==="en"?sessionUser.nameEn:sessionUser.nameBg}</strong><small>{sessionUser.email}</small></div></div>
            <button role="menuitem" onClick={()=>navigate("profile")}><i>◎</i><span><strong>{lang==="en"?"Profile & statistics":"Профил и статистика"}</strong><small>{lang==="en"?"Activity, permissions and sessions":"Активност, права и сесии"}</small></span><b>›</b></button>
            <button role="menuitem" onClick={()=>navigate("login")}><i>⇄</i><span><strong>{lang==="en"?"Switch account":"Смяна на профил"}</strong><small>{lang==="en"?"Open the sign-in page":"Отвори страницата за вход"}</small></span><b>›</b></button>
            <button className="account-menu-logout" role="menuitem" onClick={signOut}><i>↪</i><span><strong>{lang==="en"?"Sign out":"Изход"}</strong><small>{lang==="en"?"End this portal session":"Прекрати тази сесия"}</small></span></button>
          </>:<button role="menuitem" onClick={()=>navigate("login")}><i>↪</i><span><strong>{lang==="en"?"Sign in":"Вход"}</strong><small>{lang==="en"?"Open the secure-access page":"Отвори страницата за достъп"}</small></span><b>›</b></button>}
        </div>
      </>}

      <section className="content">
        <header>
          <div><p className="eyebrow">{(lang==="en"?titlesEn:titles)[view][1]}</p><h1>{view === "overview" ? site : (lang==="en"?titlesEn:titles)[view][0]}</h1></div>
          <div className="header-actions">
            <span className={`backend-badge ${backendState}`} data-no-translate>
              <i/>{backendState === "demo" ? "DEMO DATA" : backendState === "online" ? "OPENREMOTE LIVE" : backendState === "offline" ? "API OFFLINE" : "CONNECTING"}
            </span>
            <a className="open-source-badge" href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer" data-no-translate>OPEN SOURCE ↗</a>
            <button className="language-switch" data-no-translate onClick={()=>setLang(lang==="bg"?"en":"bg")} aria-label="Language">{lang==="bg"?"EN":"BG"}</button>
            <select value={role} onChange={(e) => { setRole(e.target.value); notify(`Активна роля: ${e.target.value}`); }} aria-label={lang==="en"?"Working role":"Работна роля"}><option>Администратор</option><option>Оператор</option><option>Клиент</option><option>Търговец</option></select>
            {view !== "sites" && <select value={site} onChange={(e) => setSite(e.target.value)} aria-label={lang==="en"?"Selected site":"Избран обект"}><option>Solar Park East</option><option>Logistics Hub Plovdiv</option><option>Factory Varna</option></select>}
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label={lang==="en"?"Period":"Период"}><option>Днес</option><option>Тази седмица</option><option>Този месец</option></select>
            <button className="icon-btn" aria-label={lang==="en"?"Notifications":"Известия"} onClick={() => navigate("alarms")}>△<em>3</em></button>
            <button className="mobile-account-button" data-no-translate aria-label={lang==="en"?"Account menu":"Потребителско меню"} aria-expanded={accountMenuOpen} onClick={()=>setAccountMenuOpen(!accountMenuOpen)}>{sessionUser?(lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg):"↪"}</button>
          </div>
        </header>

        {view === "overview" && <Overview auto={auto} setAuto={setAuto} navigate={navigate} notify={notify}/>} 
        {view === "customers" && <Customers navigate={navigate} notify={notify}/>}
        {view === "sites" && <Sites setSite={setSite} navigate={navigate}/>} 
        {view === "assets" && (
          <Assets navigate={navigate} notify={notify} lang={lang}/>
        )}
        {view === "battery" && <Battery auto={auto} setAuto={setAuto} notify={notify} lang={lang} resolveNotice={()=>setBatteryNotice(false)} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "schedule" && <Schedule notify={notify}/>}
        {view === "market" && <Market lang={lang} notify={notify}/>}
        {view === "settlement" && <Settlement notify={notify}/>}
        {view === "automation" && <Automation notify={notify} site={site} lang={lang} batteryCost={batteryCost}/>}
        {view === "loads" && <FlexibleLoads notify={notify} lang={lang}/>}
        {view === "balance" && <Balance notify={notify} lang={lang}/>}
        {view === "gateway" && (
          <Gateway notify={notify} lang={lang}/>
        )}
        {view === "devices" && <Devices notify={notify}/>}
        {view === "alarms" && <Alarms notify={notify}/>}
        {view === "reports" && <ReportsCenter notify={notify} lang={lang} batteryCost={batteryCost}/>}
        {view === "settings" && <SettingsHub notify={notify} lang={lang} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "plans" && <SubscriptionPlans notify={notify} lang={lang}/>}
        {view === "about" && <About lang={lang} notify={notify}/>}
        {view === "profile" && <UserProfile lang={lang} user={sessionUser} navigate={navigate} signOut={signOut} notify={notify}/>}
        {view === "login" && <LoginPage lang={lang} user={sessionUser} onSignIn={signIn} onSignOut={signOut} navigate={navigate}/>}
      </section>
      {toast && <div className="toast"><i>✓</i>{toast}</div>}
    </main>
  );
}

function LoginPage({lang,user,onSignIn,onSignOut,navigate}:{lang:UiLanguage;user:DemoUser|null;onSignIn:(email:string)=>void;onSignOut:()=>void;navigate:(id:string)=>void}) {
  const [email,setEmail] = useState(user?.email??demoUser.email);
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const submit=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("Въведете валиден имейл адрес.","Enter a valid email address."));
      return;
    }
    if (password.length < 6) {
      setError(t("Паролата трябва да съдържа поне 6 знака.","Password must contain at least 6 characters."));
      return;
    }
    setError("");
    onSignIn(email);
  };
  return <div className="login-layout" data-no-translate>
    <section className="login-brand-panel">
      <div className="login-brand-mark">GX</div>
      <p>GRIDEX ENERGY OS</p>
      <h2>{t("Енергийното управление започва с ясен контрол.","Energy management starts with clear control.")}</h2>
      <span>{t("Един портал за портфолио, пазари, батерии, прогнози, индустриални товари и Edge устройства.","One portal for portfolios, markets, batteries, forecasts, industrial loads and Edge devices.")}</span>
      <div className="login-trust-list">
        <span><i>✓</i>{t("Разделени потребителски роли","Separated user roles")}</span>
        <span><i>✓</i>{t("Одит на команди и промени","Audit trail for commands and changes")}</span>
        <span><i>✓</i>{t("Подготовка за OpenRemote / Keycloak","Ready for OpenRemote / Keycloak")}</span>
      </div>
    </section>
    <form className="login-card" onSubmit={submit} autoComplete="off">
      <div className="login-demo-chip">{t("ДЕМО ДОСТЪП","DEMO ACCESS")}</div>
      <p>{t("ДОБРЕ ДОШЛИ","WELCOME BACK")}</p>
      <h2>{t("Вход в портала","Sign in to the portal")}</h2>
      <span className="login-intro">{t("Използвайте профила си за достъп до управляваните обекти.","Use your account to access your managed sites.")}</span>
      {user&&<div className="active-session-note"><i>●</i><span><strong>{t("Има активна сесия", "An active session is available")}</strong><small>{user.email}</small></span><button type="button" onClick={()=>navigate("profile")}>{t("Профил","Profile")}</button></div>}
      <label><span>{t("Служебен имейл","Work email")}</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off" placeholder="name@company.com"/></label>
      <label><span>{t("Парола","Password")}</span><div className="password-field"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?t("Скрий паролата","Hide password"):t("Покажи паролата","Show password")}>{showPassword?"○":"◉"}</button></div></label>
      <div className="login-options"><label><input type="checkbox" defaultChecked/>{t("Запомни това устройство","Remember this device")}</label><button type="button" onClick={()=>setError(t("В демо режима възстановяването на парола не изпраща имейл.","Password recovery does not send email in demo mode."))}>{t("Забравена парола?","Forgot password?")}</button></div>
      {error&&<div className="login-error" role="alert">{error}</div>}
      <button className="login-submit" type="submit">{t("Вход в GrideX","Sign in to GrideX")} <b>→</b></button>
      {user&&<button className="login-secondary" type="button" onClick={onSignOut}>{t("Изход от текущата сесия","Sign out of the current session")}</button>}
      <small className="login-disclaimer">{t("Това е функционален демо вход. При продукционното внедряване удостоверяването и ролите се поемат от OpenRemote / Keycloak чрез OIDC; паролата не се записва от тази страница.","This is a functional demo sign-in. In production, authentication and roles will be handled by OpenRemote / Keycloak over OIDC; this page does not store the password.")}</small>
    </form>
  </div>;
}

function UserProfile({lang,user,navigate,signOut,notify}:{lang:UiLanguage;user:DemoUser|null;navigate:(id:string)=>void;signOut:()=>void;notify:(message:string)=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  if (!user) return <section className="empty-profile card" data-no-translate><span>↪</span><h2>{t("Няма активна сесия","No active session")}</h2><p>{t("Влезте, за да видите потребителската статистика, правата и историята на действията.","Sign in to view user statistics, permissions and activity history.")}</p><button className="primary-btn" onClick={()=>navigate("login")}>{t("Към входа","Go to sign in")}</button></section>;
  const activity = [
    ["14:28",t("Потвърдена аларма","Alarm acknowledged"),t("BESS температура · Solar Park East","BESS temperature · Solar Park East")],
    ["13:45",t("Експортиран отчет","Report exported"),t("Дневна икономика · PDF","Daily economics · PDF")],
    ["11:12",t("Променена стратегия","Strategy changed"),t("Ценови арбитраж · автоматичен режим","Price arbitrage · automatic mode")],
    ["09:04",t("Прегледан график","Schedule reviewed"),t("IBEX ден напред · 96 интервала","IBEX day-ahead · 96 intervals")],
  ];
  return <div className="user-profile-page" data-no-translate>
    <section className="user-hero card">
      <div className="user-avatar-large">{lang==="en"?user.initialsEn:user.initialsBg}<i/></div>
      <div><p>{t("АКТИВЕН ПОТРЕБИТЕЛ","ACTIVE USER")}</p><h2>{lang==="en"?user.nameEn:user.nameBg}</h2><span>{user.email}</span><div><b>{lang==="en"?user.roleEn:user.roleBg}</b><b>GrideX Ltd.</b><b>{t("Pro план","Pro plan")}</b></div></div>
      <div className="user-hero-actions"><button className="secondary-btn" onClick={()=>notify(t("Редакцията на профила ще се свърже с OpenRemote identity provider.","Profile editing will connect to the OpenRemote identity provider."))}>{t("Редакция на профил","Edit profile")}</button><button className="logout-btn" onClick={signOut}>{t("Изход","Sign out")} ↪</button></div>
    </section>

    <section className="user-kpis">
      <article className="card"><i>◇</i><small>{t("Управлявани обекти","Managed sites")}</small><strong>6</strong><span>{t("5 онлайн · 1 в сервиз","5 online · 1 in service")}</span></article>
      <article className="card"><i>▦</i><small>{t("Енергийни активи","Energy assets")}</small><strong>59</strong><span>{t("12 под директен контрол","12 under direct control")}</span></article>
      <article className="card"><i>⌘</i><small>{t("Действия днес","Actions today")}</small><strong>24</strong><span>{t("0 неуспешни команди","0 failed commands")}</span></article>
      <article className="card"><i>✓</i><small>{t("Изпълнен график","Schedule fulfilment")}</small><strong>99.2%</strong><span>{t("Средно за последните 30 дни","30-day average")}</span></article>
    </section>

    <section className="user-profile-grid">
      <article className="card user-activity-card">
        <PanelTitle eyebrow={t("ОДИТ И АКТИВНОСТ","AUDIT & ACTIVITY")} title={t("Последни действия","Recent actions")} action={<button className="text-action" onClick={()=>notify(t("Пълният одит ще се зарежда от OpenRemote.","The full audit trail will load from OpenRemote."))}>{t("Виж всички","View all")}</button>}/>
        <div className="user-activity-list">{activity.map(([time,title,note])=><div key={time}><time>{time}</time><i/><span><strong>{title}</strong><small>{note}</small></span></div>)}</div>
      </article>
      <article className="card user-access-card">
        <PanelTitle eyebrow={t("ДОСТЪП","ACCESS")} title={t("Роля и права","Role & permissions")}/>
        <div className="permission-role"><i>◎</i><span><strong>{lang==="en"?user.roleEn:user.roleBg}</strong><small>{t("Пълен достъп до организацията","Full organisation access")}</small></span><b>{t("АКТИВНА","ACTIVE")}</b></div>
        {[t("Мониторинг и телеметрия","Monitoring & telemetry"),t("Графици и прогнози","Schedules & forecasts"),t("Команди към активи","Asset commands"),t("Настройки и потребители","Settings & users")].map(item=><div className="permission-item" key={item}><i>✓</i><span>{item}</span><b>{t("Разрешено","Allowed")}</b></div>)}
      </article>
      <article className="card user-session-card">
        <PanelTitle eyebrow={t("СИГУРНОСТ","SECURITY")} title={t("Текуща сесия","Current session")}/>
        <div className="session-status"><i>●</i><span><strong>{t("Активна сега","Active now")}</strong><small>{t("Последен вход: днес, 08:42","Last sign-in: today, 08:42")}</small></span></div>
        <dl><div><dt>{t("Устройство","Device")}</dt><dd>Mac · Safari</dd></div><div><dt>{t("Местоположение","Location")}</dt><dd>Sofia, BG</dd></div><div><dt>{t("Двуфакторна защита","Two-factor authentication")}</dt><dd>{t("При продукционен вход","With production sign-in")}</dd></div></dl>
        <button className="secondary-btn" onClick={()=>notify(t("Настройките за сигурност ще се управляват от Keycloak.","Security settings will be managed by Keycloak."))}>{t("Настройки за сигурност","Security settings")}</button>
      </article>
    </section>
    <div className="identity-note"><i>i</i><span><strong>{t("Архитектура за продукционен достъп","Production access architecture")}</strong><small>{t("GrideX Frontend → OpenID Connect → OpenRemote / Keycloak. Ролите и разрешенията се прилагат и от backend API, не само от интерфейса.","GrideX Frontend → OpenID Connect → OpenRemote / Keycloak. Roles and permissions are enforced by the backend API, not only by the interface.")}</small></span></div>
  </div>;
}

function PanelTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="card-title"><div><p>{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function Overview({ auto, setAuto, navigate, notify }: { auto: boolean; setAuto: (v:boolean)=>void; navigate:(v:string)=>void; notify:(v:string)=>void }) {
  return <>
    <div className="status-strip">
      <span><i className="live-dot"/>Всички системи работят нормално</span>
      <span>Последни данни <b>14:32:08</b></span>
      <button onClick={() => setAuto(!auto)}><i className={auto ? "toggle on" : "toggle"}/><span><strong>{auto ? "Автоматичен режим" : "Ръчен режим"}</strong><small>Оптимизация по пазарна цена</small></span></button>
    </div>
    <section className="hero-grid">
      <article className="flow-card card">
        <PanelTitle eyebrow="ЕНЕРГИЕН ПОТОК" title="В реално време" action={<span className="pill green">● Оптимално</span>}/>
        <div className="flow">
          <div className="flow-node solar"><i>☀</i><strong>248.6 <small>kW</small></strong><span>Фотоволтаици</span></div>
          <div className="flow-line horizontal left"><b>248.6 kW</b></div>
          <div className="flow-center"><i>⚡</i><span>EMS</span></div>
          <div className="flow-line horizontal right"><b>83.2 kW</b></div>
          <div className="flow-node grid"><i>⌁</i><strong>83.2 <small>kW</small></strong><span>Към мрежата</span></div>
          <div className="flow-line down"><b>41.1 kW</b></div>
          <div className="flow-node battery"><i>▯</i><strong>72%</strong><span>Батерия · зарежда</span></div>
          <div className="flow-line down right-down"><b>124.3 kW</b></div>
          <div className="flow-node load"><i>⌂</i><strong>124.3 <small>kW</small></strong><span>Консумация</span></div>
        </div>
      </article>
      <aside className="summary card">
        <PanelTitle eyebrow="ДНЕШЕН РЕЗУЛТАТ" title="21 август 2026" action={<button onClick={() => notify("Отчетът е подготвен за изтегляне")}>•••</button>}/>
        <div className="profit"><span>Нетен резултат</span><strong>+1 842.60 лв.</strong><small>↑ 18.4% спрямо прогнозата</small></div>
        <div className="summary-row"><span>Спестени разходи<small>Собствено потребление</small></span><b>684.20 лв.</b></div>
        <div className="summary-row"><span>Приход от продажба<small>1.26 MWh към мрежата</small></span><b>1 296.80 лв.</b></div>
        <div className="summary-row"><span>Разход за покупка<small>0.42 MWh от мрежата</small></span><b className="negative">−138.40 лв.</b></div>
        <button className="details" onClick={() => navigate("balance")}>Виж подробен отчет →</button>
      </aside>
    </section>
    <section className="kpis">
      <Metric label="PV производство" value="2.84" unit="MWh" badge="↑ 8.2%" type="spark solar-spark"/>
      <Metric label="Консумация" value="1.92" unit="MWh" badge="↓ 3.1%" type="spark load-spark"/>
      <Metric label="Състояние на батерията" value="72" unit="% SOC" badge="SOH 98%" type="charge"/>
      <Metric label="Цена в момента" value="214.62" unit="лв./MWh" badge="Висока" type="price"/>
    </section>
    <section className="lower-grid">
      <article className="card chart-card"><PanelTitle eyebrow="МОЩНОСТ И ПРОГНОЗА" title="Днешен профил" action={<div className="legend"><span className="green-key">PV</span><span className="purple-key">Товар</span></div>}/><AreaChart/></article>
      <article className="card activity-card"><PanelTitle eyebrow="ПОСЛЕДНИ ДЕЙСТВИЯ" title="Дневник на системата"/><Activity icon="↗" title="Продажба към мрежата" note="83.2 kW · автоматична команда" time="14:31"/><Activity icon="▣" title="SOC достигна 72%" note="Зареждането е ограничено" time="14:18"/><Activity icon="✓" title="Графикът е приет" note="IBEX ден напред · 24 интервала" time="13:42"/><button className="details" onClick={() => navigate("alarms")}>Всички събития →</button></article>
    </section>
  </>;
}

function Metric({label,value,unit,badge,type,priceNote="Продаваме към мрежата"}:{label:string;value:string;unit:string;badge:string;type:string;priceNote?:string}) {
  return <article className="card metric"><p>{label}<span>{badge}</span></p><strong>{value} <small>{unit}</small></strong>{type === "charge" ? <div className="charge"><i style={{width:"72%"}}/></div> : type === "price" ? <div className="price-note">{priceNote}</div> : <div className={type}/>}</article>;
}

function AreaChart() {
  const values = [20,18,16,19,28,48,72,92,108,116,124,130,126,118,104,88,70,48,34,28,24,22,20,18];
  return <div className="area-chart" aria-label="Графика на мощността по часове"><div className="chart-grid"/>{values.map((v,i)=><div key={i} className="area-column"><i style={{height:`${v}px`}}/><b style={{height:`${Math.max(12,v*.62)}px`}}/>{i%4===0&&<span>{String(i).padStart(2,"0")}:00</span>}</div>)}</div>;
}

function Activity({icon,title,note,time}:{icon:string;title:string;note:string;time:string}) { return <div className="activity"><i>{icon}</i><span><strong>{title}</strong><small>{note}</small></span><time>{time}</time></div>; }

function Sites({ setSite, navigate }: {setSite:(v:string)=>void;navigate:(v:string)=>void}) {
  const data = [
    ["Solar Park East","София","Онлайн","248.6 kW","72%","+1 842 лв."],
    ["Logistics Hub Plovdiv","Пловдив","Онлайн","86.4 kW","64%","+638 лв."],
    ["Factory Varna","Варна","Онлайн","142.8 kW","81%","+1 104 лв."],
    ["Retail Park Burgas","Бургас","Предупреждение","64.2 kW","49%","+386 лв."],
    ["Warehouse Ruse","Русе","Онлайн","38.9 kW","76%","+214 лв."],
    ["Office Center Sofia","София","Офлайн","—","—","—"],
  ];
  return <><div className="portfolio-summary"><div><span>Обща мощност</span><strong>581 kW</strong></div><div><span>Енергия днес</span><strong>6.42 MWh</strong></div><div><span>Активни батерии</span><strong>5 / 6</strong></div><div><span>Резултат днес</span><strong className="positive">+4 184 лв.</strong></div></div><section className="sites-grid">{data.map((s,i)=><button className="site-card card" key={s[0]} onClick={()=>{setSite(s[0]);navigate("overview")}}><div className="site-visual"><span>{["☀","⌂","▦","◇","▥","□"][i]}</span><em className={s[2] === "Онлайн" ? "online" : s[2] === "Офлайн" ? "offline" : "warning"}>{s[2]}</em></div><h2>{s[0]}</h2><p>{s[1]} · BG</p><div className="site-stats"><span>PV<strong>{s[3]}</strong></span><span>SOC<strong>{s[4]}</strong></span><span>Днес<strong>{s[5]}</strong></span></div></button>)}</section></>;
}

function Customers({navigate,notify}:{navigate:(v:string)=>void;notify:(v:string)=>void}) {
  const customers = [
    {name:"Solaris Industries AD",city:"София",sites:2,assets:17,service:"EMS Pro + Балансиране",status:"Активен",result:"+2 480 лв."},
    {name:"LogiCore Bulgaria",city:"Пловдив",sites:1,assets:12,service:"EMS Flex",status:"Активен",result:"+638 лв."},
    {name:"Black Sea Manufacturing",city:"Варна",sites:2,assets:21,service:"EMS Pro + VEM",status:"Активен",result:"+1 104 лв."},
    {name:"Retail Parks BG",city:"Бургас",sites:1,assets:9,service:"Мониторинг",status:"За подновяване",result:"+386 лв."},
  ];
  const [selected,setSelected] = useState(0);
  const customer = customers[selected];
  return <>
    <section className="portfolio-summary"><div><span>Клиенти</span><strong>4</strong></div><div><span>Активни договори</span><strong>7</strong></div><div><span>Управлявани активи</span><strong>59</strong></div><div><span>Месечна стойност</span><strong className="positive">18 640 лв.</strong></div></section>
    <section className="customer-layout">
      <article className="card customer-list"><PanelTitle eyebrow="КЛИЕНТСКО ПОРТФОЛИО" title="Организации" action={<button className="secondary-btn" onClick={()=>notify("Новият клиентски формуляр е готов")}>+ Нов клиент</button>}/>{customers.map((c,i)=><button key={c.name} className={selected===i?"customer-row selected":"customer-row"} onClick={()=>setSelected(i)}><i>{c.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</i><span><strong>{c.name}</strong><small>{c.city} · {c.sites} обекта · {c.assets} актива</small></span><em>{c.status}</em><b>{c.result}</b></button>)}</article>
      <article className="card customer-detail"><PanelTitle eyebrow="360° КЛИЕНТСКИ ПРОФИЛ" title={customer.name} action={<span className={customer.status==="Активен"?"pill green":"pill amber-pill"}>● {customer.status}</span>}/><div className="relationship-flow"><button><span>Организация</span><strong>{customer.name}</strong></button><i>→</i><button onClick={()=>navigate("sites")}><span>Обекти</span><strong>{customer.sites} активни</strong></button><i>→</i><button onClick={()=>navigate("devices")}><span>Устройства</span><strong>{customer.assets} свързани</strong></button><i>→</i><button><span>Метрични точки</span><strong>{customer.assets*8} mapped</strong></button></div><div className="contract-card"><div><span>Активна услуга</span><strong>{customer.service}</strong><small>Договор GX-2026-{104+selected} · валиден до 31.12.2027</small></div><button className="primary-btn" onClick={()=>notify("Договорът е отворен")}>Отвори договор</button></div><div className="customer-actions"><button onClick={()=>navigate("overview")}>⌂ Оперативен преглед</button><button onClick={()=>navigate("settlement")}>¤ Сетълмент</button><button onClick={()=>navigate("alarms")}>△ Аларми</button></div></article>
    </section>
  </>;
}

function Battery({auto,setAuto,notify,lang,resolveNotice,batteryCost,setBatteryCost}:{auto:boolean;setAuto:(v:boolean)=>void;notify:(v:string)=>void;lang:UiLanguage;resolveNotice:()=>void;batteryCost:BatteryCostSettings;setBatteryCost:React.Dispatch<React.SetStateAction<BatteryCostSettings>>}) {
  const [strategy,setStrategy] = useState("Ценови арбитраж");
  const [soc,setSoc] = useState(20);
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const applyRecommendation=()=>{setAuto(true);setSoc(35);setStrategy("Интелигентен хибрид");resolveNotice();notify(t("Препоръката е приложена: резерв 35% и автоматичен режим","Recommendation applied: 35% reserve and automatic mode"));};
  return <><div className="battery-hero card"><div className="battery-gauge"><div className="gauge-ring"><strong>72%</strong><span>SOC</span></div><p>1.44 MWh налични</p></div><div className="battery-main"><PanelTitle eyebrow="BESS / TESVOLT TPS-E" title="2.0 MWh · 500 kW" action={<span className="pill green">● Отлично състояние</span>}/><div className="battery-values"><div><span>Мощност</span><strong>+41.1 kW</strong><small>Зареждане</small></div><div><span>SOH</span><strong>98.2%</strong><small>Здраве на клетките</small></div><div><span>Температура</span><strong>24.6°C</strong><small>В норма</small></div><div><span>FEC днес</span><strong>{batteryCost.todayCycles.toFixed(2)}</strong><small data-no-translate>{lang==="en"?"of ":"от "}{batteryCost.warrantedCycles.toLocaleString(lang==="en"?"en-US":"bg-BG")}{lang==="en"?" warranted":" гарантирани"}</small></div></div></div></div><section className="section-message warning" data-no-translate><i>!</i><div><small>{t("1 СЪОБЩЕНИЕ · НУЖДА ОТ ПРЕГЛЕД","1 MESSAGE · REVIEW NEEDED")}</small><strong>{t("Минималният SOC не съответства на утрешната прогноза","Minimum SOC does not match tomorrow’s forecast")}</strong><p>{t("Зададени са 20%, но при слаб PV ден и вечерен ценови пик автоматичният режим препоръчва резерв 35% и покупка само под ценовия праг.","The current target is 20%, but with a low-PV day and an evening price peak, automatic mode recommends a 35% reserve and grid charging only below the price threshold.")}</p></div><button onClick={applyRecommendation}>{t("Приложи препоръката","Apply recommendation")}</button></section><section className="settings-grid"><article className="card settings-panel"><PanelTitle eyebrow="РЕЖИМ НА РАБОТА" title="Стратегия за оптимизация"/><div className="switch-row"><span><strong>Автоматично управление</strong><small>EMS изпълнява оптималния график</small></span><button className={auto?"toggle on":"toggle"} onClick={()=>setAuto(!auto)} aria-label="Автоматично управление"/></div><div className="strategy-list">{["Интелигентен хибрид","Ценови арбитраж","Максимална собствена консумация","Zero export","Peak shaving"].map(s=><button key={s} className={strategy===s?"selected":""} onClick={()=>setStrategy(s)}><i>{strategy===s?"●":"○"}</i><span><strong>{s}</strong><small>{s === "Интелигентен хибрид" ? "Цена + поток + PV и товарова прогноза" : s === "Ценови арбитраж" ? "Купува при ниска и продава при висока цена" : s === "Peak shaving" ? "Ограничава върховото потребление" : "Автоматично управление на енергийния поток"}</small></span></button>)}</div></article><article className="card settings-panel"><PanelTitle eyebrow="ГРАНИЦИ И ЗАЩИТИ" title="Оперативни настройки"/><label className="range-label"><span>Минимален SOC<strong>{soc}%</strong></span><input type="range" min="10" max="50" value={soc} onChange={e=>setSoc(Number(e.target.value))}/><small>Запазен резерв: {(2*soc/100).toFixed(2)} MWh</small></label><div className="setting-row"><span>Максимална мощност заряд</span><b>450 kW</b></div><div className="setting-row"><span>Максимална мощност разряд</span><b>500 kW</b></div><div className="setting-row"><span>Софтуерен предпазител</span><b>780 kW</b></div><button className="primary-btn" onClick={()=>notify("Настройките на батерията са запазени")}>Запази настройките</button></article></section><BatteryAssetCost lang={lang} notify={notify} settings={batteryCost} setSettings={setBatteryCost}/><article className="card command-log"><PanelTitle eyebrow="ИСТОРИЯ НА КОМАНДИТЕ" title="Последни автоматични действия"/><DataTable headers={["Час","Команда","Мощност","Причина","Резултат"]} rows={[["14:31","Продажба","83.2 kW","Висока цена + пик на товара","Изпълнена"],["13:58","Ограничаване","41.1 kW","SOC цел 72%","Изпълнена"],["12:45","Зареждане","126.0 kW","PV излишък + ниска цена","Изпълнена"],["10:15","Zero export","0 kW","Мрежов лимит","Изпълнена"]]}/></article></>;
}

function BatteryAssetCost({lang,notify,settings,setSettings}:{lang:UiLanguage;notify:(v:string)=>void;settings:BatteryCostSettings;setSettings:React.Dispatch<React.SetStateAction<BatteryCostSettings>>}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const set=<K extends keyof BatteryCostSettings>(key:K,value:BatteryCostSettings[K])=>setSettings(current=>({...current,[key]:value}));
  const {capex,years,residual,maintenance,annualThroughput,warrantedCycles,todayCycles,method,included}=settings;
  const nominalCapacity=2;
  const depreciableBase=capex*(1-residual/100);
  const costPerCycle=depreciableBase/Math.max(1,warrantedCycles);
  const straightDailyDepreciation=depreciableBase/Math.max(1,years*365);
  const usageDailyDepreciation=costPerCycle*todayCycles;
  const dailyDepreciation=method==="usage"?usageDailyDepreciation:straightDailyDepreciation;
  const dailyMaintenance=capex*maintenance/100/365;
  const energyToday=todayCycles*nominalCapacity;
  const lossesAndTariffsPerMWh=24.8;
  const dailyEnergyCost=energyToday*lossesAndTariffsPerMWh;
  const totalDailyCost=dailyDepreciation+dailyMaintenance+dailyEnergyCost;
  const projectedMonthlyCost=totalDailyCost*30.44;
  const usageCostPerMWh=costPerCycle/nominalCapacity;
  const straightCostPerMWh=(straightDailyDepreciation+dailyMaintenance)/Math.max(1,annualThroughput/365);
  const assetCostPerMWh=method==="usage"?usageCostPerMWh:straightCostPerMWh;
  const profitableSpread=included?assetCostPerMWh+lossesAndTariffsPerMWh:lossesAndTariffsPerMWh;
  const money=(value:number,digits=0)=>new Intl.NumberFormat(lang==="en"?"en-GB":"bg-BG",{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
  return <section className="card asset-cost" data-no-translate>
    <div className="asset-cost-head"><div><p>{t("БАТЕРИЯ → СТОЙНОСТ НА АКТИВА И ДМА","BATTERY → ASSET VALUE & DEPRECIATION")}</p><h2>{t("Стойност, цикли и дневен разход","Asset value, cycles and daily cost")}</h2><span>{t("ДМА на ден се променя с реално използваните еквивалентни пълни цикли (FEC). Повече цикли означават по-висок дневен амортизационен разход.","Daily depreciation changes with the actual full equivalent cycles (FEC). More cycles produce a higher daily depreciation expense.")}</span></div><div className="switch-row"><span><strong>{t("Включи ДМА в режимите","Include depreciation in modes")}</strong><small>{included?t("Активно в оптимизатора","Active in optimiser"):t("Само информационно","Information only")}</small></span><button className={included?"toggle on":"toggle"} onClick={()=>set("included",!included)} aria-label={t("Включи ДМА в оптимизатора","Include depreciation in optimiser")}/></div></div>
    <div className="depreciation-method"><span>{t("Метод на калкулация","Calculation method")}</span><div><button className={method==="usage"?"active":""} onClick={()=>set("method","usage")}>{t("По използвани цикли","Usage-based cycles")}</button><button className={method==="straight"?"active":""} onClick={()=>set("method","straight")}>{t("Линеен по години","Straight-line by years")}</button></div><small>{method==="usage"?t("Препоръчан за EMS: разходът следва реалното натоварване на батерията.","Recommended for EMS: expense follows actual battery utilisation."):t("Фиксиран дневен ДМА, независимо от броя цикли.","Fixed daily depreciation regardless of cycle count.")}</small></div>
    <div className="asset-cost-body"><div className="asset-inputs">
      <label><span>{t("Стойност на придобиване","Acquisition value")} <b>BGN</b></span><input type="number" min="0" step="1000" value={capex} onChange={e=>set("capex",Number(e.target.value))}/></label>
      <label><span>{t("Гарантирани пълни цикли","Warranted full cycles")} <b>FEC</b></span><input type="number" min="1" step="100" value={warrantedCycles} onChange={e=>set("warrantedCycles",Number(e.target.value))}/></label>
      <label><span>{t("Срок на използване","Useful life")} <b>{t("години","years")}</b></span><input type="number" min="1" max="30" value={years} onChange={e=>set("years",Number(e.target.value))}/></label>
      <label><span>{t("Остатъчна стойност","Residual value")} <b>%</b></span><input type="number" min="0" max="80" value={residual} onChange={e=>set("residual",Number(e.target.value))}/></label>
      <label><span>{t("Поддръжка годишно","Annual maintenance")} <b>%</b></span><input type="number" min="0" max="20" step="0.1" value={maintenance} onChange={e=>set("maintenance",Number(e.target.value))}/></label>
      <label><span>{t("Очакван годишен поток","Expected annual throughput")} <b>MWh</b></span><input type="number" min="1" step="10" value={annualThroughput} onChange={e=>set("annualThroughput",Number(e.target.value))}/></label>
    </div><div className="asset-results">
      <div><small>{t("Цена на 1 пълен цикъл","Cost per full cycle")}</small><strong>{money(costPerCycle,2)} <b>BGN/FEC</b></strong></div>
      <div><small>{t("Енергиен поток днес","Energy throughput today")}</small><strong>{money(energyToday,2)} <b>MWh</b></strong></div>
      <div><small>{t("ДМА днес","Depreciation today")}</small><strong>{money(dailyDepreciation,2)} <b>BGN</b></strong></div>
      <div><small>{t("Поддръжка днес","Maintenance today")}</small><strong>{money(dailyMaintenance,2)} <b>BGN</b></strong></div>
      <div className="asset-total"><small>{t("Общ разход на батерията днес","Total battery cost today")}</small><strong>{money(totalDailyCost,2)} <b>BGN</b></strong></div>
      <div><small>{t("Прогноза за месеца","Monthly run-rate")}</small><strong>{money(projectedMonthlyCost)} <b>BGN</b></strong></div>
    </div></div>
    <label className="cycle-slider"><span><small>{t("ЕКВИВАЛЕНТНИ ПЪЛНИ ЦИКЛИ ДНЕС","FULL EQUIVALENT CYCLES TODAY")}</small><strong>{todayCycles.toFixed(2)} FEC</strong></span><input type="range" min="0" max="3" step="0.05" value={todayCycles} onChange={e=>set("todayCycles",Number(e.target.value))}/><em>{t("Променете циклите: ДМА и общият дневен разход се преизчисляват веднага.","Change the cycles: depreciation and total daily cost recalculate immediately.")}</em></label>
    <div className="daily-cost-formula"><span><small>{t("ДМА","DEPRECIATION")}</small><b>{money(dailyDepreciation,2)} BGN</b><em>{method==="usage"?`${todayCycles.toFixed(2)} FEC × ${money(costPerCycle,2)}`:t("линеен дневен план","straight-line daily plan")}</em></span><i>+</i><span><small>{t("ПОДДРЪЖКА","MAINTENANCE")}</small><b>{money(dailyMaintenance,2)} BGN</b><em>{maintenance}% / {t("година","year")}</em></span><i>+</i><span><small>{t("ЗАГУБИ И ТАРИФИ","LOSSES & TARIFFS")}</small><b>{money(dailyEnergyCost,2)} BGN</b><em>{money(energyToday,2)} MWh × {lossesAndTariffsPerMWh}</em></span><i>=</i><span className="formula-total"><small>{t("ОБЩО ДНЕС","TOTAL TODAY")}</small><b>{money(totalDailyCost,2)} BGN</b><em>{money(totalDailyCost/Math.max(.01,todayCycles),2)} BGN/FEC</em></span></div>
    <div className="profit-guard"><i>↗</i><span><small>{t("ЗАЩИТА НА РЕНТАБИЛНОСТТА","PROFITABILITY GUARD")}</small><strong>{t("Минимална прогнозна ценова разлика", "Minimum forecast price spread")}: {profitableSpread.toFixed(1)} BGN/MWh</strong><em>{t(`ДМА ${included?assetCostPerMWh.toFixed(1):"0.0"} + загуби и тарифи ${lossesAndTariffsPerMWh.toFixed(1)} BGN/MWh`,`Depreciation ${included?assetCostPerMWh.toFixed(1):"0.0"} + losses and tariffs ${lossesAndTariffsPerMWh.toFixed(1)} BGN/MWh`)}</em></span><button className="secondary-btn" onClick={()=>notify(t("Стойността на актива и ДМА калкулацията са запазени за всички режими","Asset value and depreciation calculation saved for all modes"))}>{t("Запази за режимите","Save for modes")}</button></div>
    <p className="asset-note">{t("Управленска калкулация за EMS решения. Счетоводният и данъчният амортизационен план се определят отделно според приложимата политика.","Management calculation for EMS decisions. The accounting and tax depreciation schedule is determined separately under the applicable policy.")}</p>
  </section>;
}

function Schedule({notify}:{notify:(v:string)=>void}) {
  const [editable,setEditable] = useState(scheduleValues);
  const change = (i:number) => setEditable(v=>v.map((x,n)=>n===i?(x>=50?-50:x+10):x));
  return <><div className="schedule-toolbar card"><div><span>Прогнозен резултат</span><strong>+2 146.30 лв.</strong><small>+16.5% спрямо пасивен режим</small></div><div><span>Очакван SOC в 24:00</span><strong>54%</strong><small>Над минималния резерв</small></div><div><span>Статус към оператор</span><strong className="positive">Приет</strong><small>Изпратен в 13:42</small></div><button className="primary-btn" onClick={()=>notify("Графикът е записан и изпратен")}>Запази и изпрати</button></div><article className="card schedule-card"><PanelTitle eyebrow="15-МИНУТЕН ГРАФИК / АГРЕГИРАН ПО ЧАС" title="Заряд и разряд" action={<div className="legend"><span className="green-key">Разряд</span><span className="blue-key">Заряд</span></div>}/><div className="schedule-chart">{editable.map((v,i)=><button key={i} className={v>=0?"discharge":"charging"} onClick={()=>change(i)} title={`${String(i).padStart(2,"0")}:00 · ${v} kW`}><span style={{height:`${Math.abs(v)*1.8}px`}}/><em>{i%3===0?String(i).padStart(2,"0"):""}</em></button>)}<i className="zero-line"/></div><p className="chart-help">Натиснете колона, за да промените мощността. Над линията е разряд, под нея — заряд.</p></article><section className="lower-grid"><article className="card settings-panel"><PanelTitle eyebrow="ПРОГНОЗА" title="Енергия в края на деня"/><div className="forecast-row"><span>PV производство</span><b>4.18 MWh</b></div><div className="forecast-row"><span>Консумация</span><b>2.76 MWh</b></div><div className="forecast-row"><span>Към мрежата</span><b>1.64 MWh</b></div><div className="forecast-row"><span>Загуби</span><b>0.08 MWh</b></div></article><article className="card settings-panel"><PanelTitle eyebrow="ОГРАНИЧЕНИЯ" title="Проверка на графика"/><Check text="BMS лимити"/><Check text="Мрежови лимит 780 kW"/><Check text="Минимален SOC 20%"/><Check text="Налична мощност"/></article></section></>;
}

function ForwardRevenueChart({lang}:{lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [horizon,setHorizon]=useState(24);
  const [selected,setSelected]=useState(7);
  const base=[
    [148,0.00,0.31,68,"idle",-12],[136,0.00,0.28,66,"charge",-34],[122,0.00,0.27,71,"charge",-48],[116,0.00,0.29,76,"charge",-46],
    [124,0.02,0.35,80,"hold",-9],[151,0.12,0.52,79,"hold",-4],[186,0.46,0.71,77,"discharge",42],[218,0.92,0.83,70,"discharge",86],
    [204,1.38,0.88,64,"pv",48],[176,1.74,0.94,68,"pv",36],[142,1.91,1.02,75,"charge",-18],[108,1.82,1.08,82,"charge",-31],
    [94,1.55,1.14,87,"charge",-40],[88,1.23,1.16,90,"hold",14],[116,0.88,1.09,89,"hold",18],[162,0.54,1.02,86,"hold",22],
    [226,0.24,1.21,78,"discharge",94],[248,0.06,1.34,66,"discharge",121],[231,0.00,1.26,56,"discharge",98],[196,0.00,1.08,48,"hold",26],
    [172,0.00,0.92,47,"hold",18],[154,0.00,0.76,46,"hold",12],[143,0.00,0.58,45,"hold",8],[138,0.00,0.42,44,"hold",6],
  ] as const;
  const actions:Record<string,[string,string]>= {idle:["Готовност","Standby"],charge:["Зареждане","Charge"],hold:["Задържане","Hold"],discharge:["Разряд","Discharge"],pv:["PV излишък","PV surplus"]};
  const data=base.slice(0,horizon).map((x,i)=>({hour:i,price:x[0],pv:x[1],load:x[2],soc:x[3],action:x[4],net:x[5]}));
  const current=data[Math.min(selected,data.length-1)];
  const income=data.reduce((s,x)=>s+Math.max(0,x.net),0);
  const cost=Math.abs(data.reduce((s,x)=>s+Math.min(0,x.net),0));
  return <article className="card forward-card" data-no-translate>
    <div className="forward-head"><div><p>{t("ПОЧАСОВ ХОРИЗОНТ","HOURLY OUTLOOK")}</p><h2>{t("Очаквани постъпления и оперативни параметри","Expected revenue and operating parameters")}</h2><span>{t("Кликнете върху час, за да видите цената, PV, товара, SOC и планираното действие.","Select an hour to inspect price, PV, load, SOC and the planned action.")}</span></div><div className="range-tabs">{[12,24].map(x=><button key={x} className={horizon===x?"active":""} onClick={()=>{setHorizon(x);setSelected(v=>Math.min(v,x-1));}}>{x}h</button>)}</div></div>
    <section className="forward-kpis"><span><small>{t("Очаквани приходи","Expected income")}</small><strong>+{income} BGN</strong></span><span><small>{t("Очаквани разходи","Expected costs")}</small><strong>−{cost} BGN</strong></span><span><small>{t("Нетен резултат","Net result")}</small><strong className="positive">+{income-cost} BGN</strong></span><span><small>{t("SOC в края","Closing SOC")}</small><strong>{data[data.length-1].soc}%</strong></span></section>
    <div className="forward-layout"><div className="revenue-chart"><div className="revenue-scale"><span>+120</span><span>0 BGN</span><span>−50</span></div><div className="revenue-hours">{data.map(x=><button key={x.hour} className={`${x.net>=0?"gain":"cost"} ${selected===x.hour?"selected":""}`} onClick={()=>setSelected(x.hour)} title={`${String(x.hour).padStart(2,"0")}:00 · ${x.net>=0?"+":""}${x.net} BGN`}><span style={{height:`${Math.max(5,Math.abs(x.net)*.7)}px`}}/><em>{x.hour%2===0?String(x.hour).padStart(2,"0"):""}</em></button>)}</div><i className="revenue-zero"/></div><aside className="forward-detail"><small>{t("ИЗБРАН ЧАС","SELECTED HOUR")}</small><h3>{String(current.hour).padStart(2,"0")}:00–{String(current.hour+1).padStart(2,"0")}:00</h3><div><span>{t("IBEX цена","IBEX price")}<b>{current.price} BGN/MWh</b></span><span>PV<b>{current.pv.toFixed(2)} MWh</b></span><span>{t("Товар","Load")}<b>{current.load.toFixed(2)} MWh</b></span><span>SOC<b>{current.soc}%</b></span></div><p className={`action-${current.action}`}><i>{current.net>=0?"↗":"↘"}</i><span><small>{t("ПЛАНИРАНО ДЕЙСТВИЕ","PLANNED ACTION")}</small><strong>{t(...actions[current.action])}</strong></span><b>{current.net>=0?"+":""}{current.net} BGN</b></p></aside></div>
    <div className="forecast-legend"><span><i className="gain"/>{t("Приход","Revenue")}</span><span><i className="cost"/>{t("Разход","Cost")}</span><span><i className="price"/>{t("Данните включват пълна цена, тарифи, загуби и ДМА","Data includes all-in price, tariffs, losses and fixed-asset cost")}</span></div>
  </article>;
}

function Market({lang,notify}:{lang:UiLanguage;notify:(v:string)=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"live"|"history"|"ai">("live");
  const [range,setRange]=useState("12M");
  const [model,setModel]=useState("Hybrid Ensemble");
  const [lookback,setLookback]=useState(365);
  const [trained,setTrained]=useState(true);
  const history=[
    ["Sep","Сеп",142,48,286,10.8],["Oct","Окт",156,54,318,12.6],["Nov","Ное",181,66,372,15.9],["Dec","Дек",196,72,418,18.4],
    ["Jan","Яну",188,61,396,17.2],["Feb","Фев",164,49,344,14.1],["Mar","Мар",126,31,282,11.3],["Apr","Апр",104,18,246,9.8],
    ["May","Май",92,-12,218,10.6],["Jun","Юни",108,-6,268,12.1],["Jul","Юли",137,24,322,13.8],["Aug","Авг",172,61,348,16.7],
  ];
  const algorithms=[
    {name:"XGBoost",tag:t("ТАБЛИЧЕН ML","TABULAR ML"),icon:"XB",mape:"9.4%",mae:"16.8",score:87,desc:t("Улавя нелинейни зависимости между цена, час, товар, време и пазарни лагове.","Captures nonlinear relationships between price, hour, load, weather and market lags."),best:t("Краткосрочни ценови пикове","Short-term price spikes")},
    {name:"LSTM",tag:t("ВРЕМЕВИ РЕД","TIME SERIES"),icon:"LS",mape:"10.2%",mae:"18.6",score:84,desc:t("Невронна мрежа за последователности, сезонност и зависимост между 15-минутни интервали.","Sequence neural network for seasonality and dependencies across 15-minute intervals."),best:t("Интрадей профил","Intraday profile")},
    {name:"Prophet",tag:t("СЕЗОНЕН МОДЕЛ","SEASONAL MODEL"),icon:"PR",mape:"12.8%",mae:"22.1",score:77,desc:t("Обясним базов модел за годишна, седмична и дневна сезонност и празници.","Explainable baseline for annual, weekly and daily seasonality and holidays."),best:t("Дългосрочен тренд","Long-term trend")},
    {name:"Hybrid Ensemble",tag:t("ПРЕПОРЪЧАН","RECOMMENDED"),icon:"AI",mape:"7.8%",mae:"14.3",score:92,desc:t("Комбинира XGBoost, LSTM и сезонен baseline с динамични тегла според пазарния режим.","Combines XGBoost, LSTM and a seasonal baseline with dynamic weights by market regime."),best:t("Оперативно управление","Operational control")},
  ];
  const selected=algorithms.find(x=>x.name===model)??algorithms[3];
  const train=()=>{setTrained(false);window.setTimeout(()=>{setTrained(true);notify(t(`Моделът ${model} е преобучен и валидиран`,`The ${model} model has been retrained and validated`));},900)};
  return <div className="market-page" data-no-translate>
    <div className="market-subnav">
      <button className={tab==="live"?"active":""} onClick={()=>setTab("live")}>{t("Ден напред","Day-ahead")}</button>
      <button className={tab==="history"?"active":""} onClick={()=>setTab("history")}>{t("Исторически данни","Historical data")}</button>
      <button className={tab==="ai"?"active":""} onClick={()=>setTab("ai")}><i>AI</i>{t("Модели и прогнозиране","Models & forecasting")}</button>
      <span>{t("Демо набор · не е официален IBEX архив","Demo dataset · not an official IBEX archive")}</span>
    </div>

    {tab==="live"&&<><section className="kpis market-kpis"><Metric label={t("IBEX в момента","Current IBEX price")} value="214.62" unit="BGN/MWh" badge="↑ 12.8%" type="price" priceNote={t("Продаваме към мрежата","Exporting to the grid")}/><Metric label={t("Цена купува","Import price")} value="229.40" unit="BGN/MWh" badge={t("с тарифи","incl. tariffs")} type="spark solar-spark"/><Metric label={t("Цена продава","Export price")} value="207.80" unit="BGN/MWh" badge={t("нетна","net")} type="spark load-spark"/><Metric label={t("Небаланс","Imbalance")} value="−18.42" unit="BGN/MWh" badge={t("прогноза","forecast")} type="charge"/></section><article className="card market-chart-card"><PanelTitle eyebrow={t("IBEX ДЕН НАПРЕД","IBEX DAY-AHEAD")} title={t("Пазарна цена по часове","Hourly market price")} action={<div className="legend"><span className="green-key">{t("Цена","Price")}</span><span className="amber-key">{t("Прогноза","Forecast")}</span></div>}/><div className="market-chart">{marketValues.map((v,i)=><div key={i} className={i>=15?"forecast":""}><span style={{height:`${v*.66}px`}}/><em>{i%3===0?`${String(i).padStart(2,"0")}:00`:""}</em><b>{i===16?`${v}`:""}</b></div>)}</div></article><section className="triple-grid"><article className="card weather-card"><PanelTitle eyebrow={t("ВРЕМЕТО","WEATHER")} title={t("София · днес","Sofia · today")}/><div className="weather-main"><span>☀</span><strong>29°</strong><small>{t("Ясно","Clear")}</small></div><div className="weather-hours"><span>{t("Сега","Now")}<b>29°</b></span><span>16:00<b>30°</b></span><span>18:00<b>27°</b></span><span>20:00<b>23°</b></span></div></article><article className="card settings-panel"><PanelTitle eyebrow={t("PV ПРОГНОЗА","PV FORECAST")} title="4.18 MWh"/><div className="forecast-bars">{[18,26,42,66,88,100,94,76,48,22].map((v,i)=><i key={i} style={{height:`${v}px`}}/>)}</div><p className="confidence">{t("Точност на прогнозата","Forecast accuracy")} <b>94.2%</b></p></article><article className="card settings-panel"><PanelTitle eyebrow={t("ПАЗАРЕН СИГНАЛ","MARKET SIGNAL")} title={t("Препоръчано действие","Recommended action")}/><div className="signal"><i>↗</i><strong>{t("Продавай","Export")}</strong><span>{t("до 18:45","until 18:45")}</span></div><p className="signal-note">{t("Очакван ценови пик","Expected price peak")}: <b>242 BGN/MWh</b> {t("в 17:00","at 17:00")}</p></article></section></>}

    {tab==="live"&&<ForwardRevenueChart lang={lang}/>}

    {tab==="history"&&<><section className="history-toolbar card"><div><p>{t("ИСТОРИЧЕСКИ ПАЗАРНИ ДАННИ","HISTORICAL MARKET DATA")}</p><h2>{t("IBEX цена · последните 12 месеца","IBEX price · trailing 12 months")}</h2><span>{t("Почасови стойности, агрегирани по месец за обучение и backtest на моделите.","Hourly values aggregated by month for model training and backtesting.")}</span></div><div className="range-tabs">{["1M","3M","6M","12M"].map(x=><button key={x} className={range===x?"active":""} onClick={()=>setRange(x)}>{x}</button>)}</div></section><section className="history-kpis"><article className="card"><small>{t("СРЕДНА ЦЕНА","AVERAGE PRICE")}</small><strong>147.2 <b>BGN/MWh</b></strong><span>↑ 8.6% YoY</span></article><article className="card"><small>{t("МИНИМУМ","MINIMUM")}</small><strong>−12.0 <b>BGN/MWh</b></strong><span>{t("19 отрицателни часа","19 negative-price hours")}</span></article><article className="card"><small>{t("МАКСИМУМ","MAXIMUM")}</small><strong>418.0 <b>BGN/MWh</b></strong><span>{t("Декември · 18:00","December · 18:00")}</span></article><article className="card"><small>{t("ВОЛАТИЛНОСТ","VOLATILITY")}</small><strong>± 34.8%</strong><span>{t("Висока · подходяща за арбитраж","High · suitable for arbitrage")}</span></article></section><article className="card history-chart-card"><PanelTitle eyebrow={t("МЕСЕЧЕН ПРОФИЛ","MONTHLY PROFILE")} title={t("Средна цена и дневен диапазон","Average price and intraday range")} action={<div className="history-legend"><span><i/>Min–Max</span><span><i/>Avg</span></div>}/><div className="history-chart">{history.map((m,i)=><div className="history-month" key={m[0]} title={`${m[0]} · Avg ${m[2]} · Min ${m[3]} · Max ${m[4]} BGN/MWh`}><div className="range-whisker" style={{bottom:`${Math.max(3,Number(m[3])*.36+10)}px`,height:`${Math.min(180,(Number(m[4])-Number(m[3]))*.36)}px`}}/><span style={{height:`${Number(m[2])*.62}px`}} className={i===11?"current":""}><b>{m[2]}</b></span><em>{lang==="en"?m[0]:m[1]}</em></div>)}</div></article><section className="history-bottom"><article className="card history-pattern"><PanelTitle eyebrow={t("СЕДМИЧЕН ПАТЕРН","WEEKLY PATTERN")} title={t("Средна цена по ден и часови зона","Average price by day and time band")}/><div className="price-heatmap"><span/><b>{t("Нощ","Night")}</b><b>{t("Сутрин","Morning")}</b><b>{t("Ден","Day")}</b><b>{t("Вечер","Evening")}</b>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,day)=><div className="heat-row" key={d}><em>{lang==="en"?d:["Пн","Вт","Ср","Чт","Пт","Сб","Нд"][day]}</em>{[78+day*2,142+day*3,106-day*3,204-day*4].map((v,n)=><i key={n} style={{"--heat":`${Math.min(1,v/230)}`} as React.CSSProperties}>{v}</i>)}</div>)}</div></article><article className="card history-quality"><PanelTitle eyebrow={t("КАЧЕСТВО НА ДАННИТЕ","DATA QUALITY")} title={t("Готовност за AI обучение","AI training readiness")}/><div className="quality-score"><strong>98.7%</strong><span>{t("пълнота на реда","series completeness")}</span></div><Check text={t("8 760 почасови ценови точки","8,760 hourly price points")}/><Check text={t("Часова зона и DST са нормализирани","Timezone and DST normalised")}/><Check text={t("Празници и календарни признаци са добавени","Holiday and calendar features added")}/><button className="primary-btn" onClick={()=>{setTab("ai");notify(t("Историческите данни са подадени към AI моделите","Historical data sent to the AI models"));}}>{t("Използвай за AI модели","Use for AI models")} →</button></article></section></>}

    {tab==="ai"&&<><section className="ai-hero card"><div><p>{t("AI ЦЕНОВИ МОДЕЛИ","AI PRICE MODELS")}</p><h2>{t("Прогноза, backtest и избор на най-добра стратегия","Forecasting, backtesting and best-strategy selection")}</h2><span>{t("Всеки модел се валидира върху невиждани 15-минутни интервали. EMS използва само прогноза с достатъчно качество и никога не заобикаля BMS и safety ограниченията.","Each model is validated on unseen 15-minute intervals. The EMS uses only forecasts that meet the quality threshold and never bypasses BMS or safety constraints.")}</span></div><div className="ai-score"><small>{t("АКТИВЕН МОДЕЛ","ACTIVE MODEL")}</small><strong>{selected.name}</strong><span>{t("AI confidence","AI confidence")} <b>{selected.score}%</b></span></div></section><section className="algorithm-grid">{algorithms.map(a=><button key={a.name} className={model===a.name?"algorithm-card card selected":"algorithm-card card"} onClick={()=>setModel(a.name)}><i>{a.icon}</i><span className="algo-tag">{a.tag}</span><h3>{a.name}</h3><p>{a.desc}</p><div><span>MAPE<strong>{a.mape}</strong></span><span>MAE<strong>{a.mae}</strong></span><span>{t("ОЦЕНКА","SCORE")}<strong>{a.score}/100</strong></span></div><em>{t("Най-подходящ","Best for")}: {a.best}</em></button>)}</section><section className="ai-workbench"><article className="card ai-config"><PanelTitle eyebrow={t("ОБУЧЕНИЕ И ВАЛИДАЦИЯ","TRAINING & VALIDATION")} title={selected.name}/><ModeRange label={t("Исторически прозорец","Historical lookback")} value={lookback} unit={t("дни","days")} min={90} max={730} onChange={setLookback}/><div className="ai-setting"><span>{t("Прогнозен хоризонт","Forecast horizon")}</span><strong>36 h · 15 min</strong></div><div className="ai-setting"><span>{t("Преобучаване","Retraining")}</span><strong>{t("Всеки ден · 02:15","Daily · 02:15")}</strong></div><div className="feature-chips"><span>IBEX lag 1–168 h</span><span>{t("Време и облачност","Weather & cloud cover")}</span><span>PV / Load forecast</span><span>{t("Ден, час, празник","Day, hour, holiday")}</span><span>SOC / BESS limits</span><span>{t("Цена небаланс","Imbalance price")}</span></div><button className="primary-btn" disabled={!trained} onClick={train}>{trained?t("Пусни backtest и преобучи","Run backtest & retrain"):t("Обучение и валидация…","Training & validation…")}</button></article><article className="card backtest-card"><PanelTitle eyebrow={t("365-ДНЕВЕН BACKTEST","365-DAY BACKTEST")} title={t("Сравнение с реалната цена","Forecast vs actual price")} action={<span className="pill green">● {t("Валидиран","Validated")}</span>}/><div className="backtest-chart"><div className="backtest-grid"/>{[82,94,88,106,121,116,143,168,151,134,126,148,176,202,188,164,142,136,158,194,224,208,178,152].map((v,i)=><span key={i} style={{height:`${v*.68}px`}}><i style={{height:`${Math.max(8,(v+(i%4-2)*9)*.68)}px`}}/></span>)}</div><div className="backtest-metrics"><span><small>MAPE</small><strong>{selected.mape}</strong></span><span><small>MAE</small><strong>{selected.mae} BGN</strong></span><span><small>RMSE</small><strong>{(Number(selected.mae)*1.46).toFixed(1)} BGN</strong></span><span><small>{t("ПИКОВЕ","SPIKES")}</small><strong>{selected.score-8}%</strong></span></div></article></section><section className="card ai-decision"><div><i>AI</i><span><small>{t("ПРОГНОЗА → EMS РЕШЕНИЕ","FORECAST → EMS DECISION")}</small><strong>{t("Очакван ценови пик 242 BGN/MWh · 17:00–18:00","Expected price peak 242 BGN/MWh · 17:00–18:00")}</strong><p>{t("Запази 54% SOC до 16:45, след което разреждай до 180 kW при запазване на минимален резерв 25%.","Retain 54% SOC until 16:45, then discharge up to 180 kW while maintaining a 25% minimum reserve.")}</p></span></div><div className="decision-chain"><span>{t("AI прогноза","AI forecast")}</span><b>→</b><span>{t("Оптимизатор","Optimiser")}</span><b>→</b><span>Safety envelope</span><b>→</b><span>{t("PCS команда","PCS command")}</span></div><button className="primary-btn" onClick={()=>notify(t("AI прогнозата е приложена към симулацията на графика","AI forecast applied to the schedule simulation"))}>{t("Симулирай в графика","Simulate in schedule")}</button></section><p className="ai-disclaimer">{t("Демо функционалност: показаните исторически стойности и метрики са примерни. В продукционна среда моделите се обучават с лицензиран IBEX архив, измерванията на обекта и контролирана MLOps процедура.","Demo functionality: the historical values and metrics shown are illustrative. In production, models are trained using licensed IBEX history, site measurements and a controlled MLOps process.")}</p></>}
  </div>;
}

function Settlement({notify}:{notify:(v:string)=>void}) {
  const [tariff,setTariff] = useState("Бизнес Flex 2026");
  const [importEnergy,setImportEnergy] = useState(18.4);
  const [exportEnergy,setExportEnergy] = useState(26.8);
  const tariffs = {
    "Бизнес Flex 2026": {buy:229.40,sell:207.80,network:31.20},
    "Solar PPA 2026": {buy:218.10,sell:214.60,network:28.40},
    "Spot + premium": {buy:224.80,sell:211.20,network:30.10},
  };
  const active = tariffs[tariff as keyof typeof tariffs];
  const total = exportEnergy*active.sell-importEnergy*(active.buy+active.network);
  return <>
    <section className="settlement-head card"><div><p className="eyebrow">ВЕРСИОНИРАНА ТАРИФА</p><h2>{tariff}</h2><span>В сила от 01.07.2026 · версия 3.2</span></div><select value={tariff} onChange={e=>setTariff(e.target.value)} aria-label="Тарифен план">{Object.keys(tariffs).map(t=><option key={t}>{t}</option>)}</select><button className="secondary-btn" onClick={()=>notify("Създадена е нова версия на тарифата")}>+ Нова версия</button></section>
    <section className="tariff-grid"><article className="card tariff-card"><PanelTitle eyebrow="ЦЕНОВИ КОМПОНЕНТИ" title="Покупка и продажба"/><div className="tariff-price"><span>Купува от мрежата<strong>{active.buy.toFixed(2)} <small>лв./MWh</small></strong></span><span>Продава към мрежата<strong>{active.sell.toFixed(2)} <small>лв./MWh</small></strong></span><span>Мрежови компоненти<strong>{active.network.toFixed(2)} <small>лв./MWh</small></strong></span></div><div className="tou"><span><i className="offpeak"/>Ниска тарифа <b>22:00–06:00</b></span><span><i className="midpeak"/>Дневна <b>06:00–17:00</b></span><span><i className="peak"/>Пикова <b>17:00–22:00</b></span></div></article><article className="card settlement-card"><PanelTitle eyebrow="ВИРТУАЛЕН СЕТЪЛМЕНТ" title="Калкулатор за периода"/><label><span>Купена енергия <b>{importEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={importEnergy} onChange={e=>setImportEnergy(Number(e.target.value))}/></label><label><span>Продадена енергия <b>{exportEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={exportEnergy} onChange={e=>setExportEnergy(Number(e.target.value))}/></label><div className={total>=0?"settlement-total positive":"settlement-total negative"}><span>Нетен резултат</span><strong>{total>=0?"+":""}{total.toFixed(2)} лв.</strong></div><button className="primary-btn" onClick={()=>notify("Виртуалната фактура е генерирана")}>Генерирай виртуална фактура</button></article></section>
    <article className="card table-card settlement-table"><PanelTitle eyebrow="РАЗПРЕДЕЛЕНИЕ" title="Енергийна общност · август 2026" action={<button className="secondary-btn" onClick={()=>notify("Разпределението е преизчислено")}>Преизчисли</button>}/><DataTable headers={["Участник","Потребление","Производство","Разпределен дял","Баланс","Статус"]} rows={[["Solaris Industries","18.4 MWh","26.8 MWh","42%","+1 486 лв.","Готов"],["LogiCore Bulgaria","12.2 MWh","9.6 MWh","21%","−684 лв.","Готов"],["Black Sea Manufacturing","21.7 MWh","18.4 MWh","27%","−812 лв.","Готов"],["Retail Parks BG","8.9 MWh","3.2 MWh","10%","−1 428 лв.","За преглед"]]}/></article>
  </>;
}

function FlexibleLoads({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"assets"|"rules"|"erp"|"thermal">("assets");
  const [maxPrice,setMaxPrice]=useState(142);
  const [reserve,setReserve]=useState(18);
  const [occupancy,setOccupancy]=useState(64);
  const [softwareFuse,setSoftwareFuse]=useState(180);
  const loads=[
    {icon:"♨",name:t("Електрически котел 1","Electric boiler 1"),type:t("Термичен буфер","Thermal storage"),power:"72 kW",state:t("Готов","Ready"),plan:"11:00–14:00"},
    {icon:"❄",name:t("Чилърна група","Chiller plant"),type:"HVAC",power:"96 kW",state:t("Ограничен","Limited"),plan:"16:30–18:30"},
    {icon:"ϟ",name:t("EV парк · 9 точки","EV fleet · 9 points"),type:"OCPP",power:"132 kW",state:t("Зарежда","Charging"),plan:"01:00–06:00"},
    {icon:"⌘",name:t("Процесна линия B","Process line B"),type:t("Отложим товар","Deferrable load"),power:"185 kW",state:t("Планиран","Scheduled"),plan:"22:00–02:00"},
    {icon:"◇",name:t("Компресорна станция","Compressor station"),type:t("Гъвкав товар","Flexible load"),power:"55 kW",state:t("Готов","Ready"),plan:"08:00–10:00"},
  ];
  return <div className="loads-page" data-no-translate>
    <section className="loads-hero card"><div><p>{t("FLEXIBLE LOAD ORCHESTRATION","FLEXIBLE LOAD ORCHESTRATION")}</p><h2>{t("Ценово управление на всеки управляем консуматор","Price-aware control for every controllable load")}</h2><span>{t("Бойлери, нагреватели, HVAC, EV, компресори и производствени линии участват в общия график, software fuse и прогнозата за небаланс.","Boilers, heaters, HVAC, EV, compressors and production lines participate in the shared schedule, software fuse and imbalance forecast.")}</span></div><div className="loads-live"><small>{t("УПРАВЛЯЕМ КАПАЦИТЕТ","CONTROLLABLE CAPACITY")}</small><strong>540 kW</strong><span>5 {t("актива · 4 онлайн","assets · 4 online")}</span></div></section>
    <div className="subnav loads-tabs">{[["assets",t("Активи и график","Assets & schedule")],["rules",t("Правила за покупка","Purchase rules")],["erp",t("ERP производствен план","ERP production plan")],["thermal",t("Термичен модел","Thermal model")]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0] as typeof tab)}>{x[1]}</button>)}</div>
    {tab==="assets"&&<><section className="load-kpis"><article className="card"><small>{t("ТЕКУЩ ТОВАР","CURRENT LOAD")}</small><strong>168 kW</strong><span>31% {t("от наличния","of available")}</span></article><article className="card"><small>{t("ПРЕМЕСТЕН КЪМ ЕВТИНИ ЧАСОВЕ","SHIFTED TO LOW-PRICE HOURS")}</small><strong>1.42 MWh</strong><span className="positive">+286 BGN</span></article><article className="card"><small>{t("PV ИЗЛИШЪК УСВОЕН","PV SURPLUS ABSORBED")}</small><strong>86%</strong><span>1.18 MWh</span></article><article className="card"><small>SOFTWARE FUSE</small><strong>{softwareFuse} kW</strong><span>{t("общ лимит","shared limit")}</span></article></section><section className="load-grid">{loads.map((item,i)=><article className="card load-card" key={item.name}><i>{item.icon}</i><span className={i===1?"load-state amber-pill":"load-state"}>● {item.state}</span><h3>{item.name}</h3><p>{item.type}</p><div><span>{t("Мощност","Power")}<b>{item.power}</b></span><span>{t("Оптимален прозорец","Optimal window")}<b>{item.plan}</b></span></div><button className="secondary-btn" onClick={()=>notify(t(`Отворен е графикът за ${item.name}`,`Schedule opened for ${item.name}`))}>{t("Отвори график","Open schedule")}</button></article>)}</section><article className="card load-fuse"><PanelTitle eyebrow="SHARED SOFTWARE FUSE" title={t("Обща отпусната мощност за гъвкави товари","Shared capacity for flexible loads")}/><ModeRange label={t("Лимит за всички управляеми товари","Limit for all controllable loads")} value={softwareFuse} unit="kW" min={60} max={360} onChange={setSoftwareFuse}/><div><span><i style={{width:"64%"}}/><b>Site 412 kW</b></span><span><i style={{width:"26%"}}/><b>{t("Гъвкави товари","Flexible loads")} 168 kW</b></span><span><i style={{width:"10%"}}/><b>{t("Резерв","Reserve")} 65 kW</b></span></div></article></>}
    {tab==="rules"&&<section className="load-rules-layout"><article className="card load-rule-config"><PanelTitle eyebrow={t("ПОЛИТИКА ЗА ПОКУПКА","PURCHASE POLICY")} title={t("Цена, PV излишък и оперативна нужда","Price, PV surplus and operational demand")}/><ModeRange label={t("Максимална пълна цена","Maximum all-in price")} value={maxPrice} unit="BGN/MWh" min={40} max={260} onChange={setMaxPrice}/><ModeRange label={t("Оперативен резерв","Operational reserve")} value={reserve} unit="%" min={0} max={40} onChange={setReserve}/><div className="load-rule-types"><button className="active"><i>¤</i><span><strong>{t("Максимална цена","Maximum price")}</strong><small>{t("Работи под зададения праг","Run below the threshold")}</small></span></button><button><i>↓</i><span><strong>{t("Най-евтин час","Cheapest hour")}</strong><small>{t("Избира най-ниската цена за деня","Select the day’s lowest price")}</small></span></button><button><i>☀</i><span><strong>{t("Само PV излишък","PV surplus only")}</strong><small>{t("Без покупка от мрежата","No grid import")}</small></span></button><button><i>0</i><span><strong>{t("Без продажба","No export")}</strong><small>{t("Усвоява целия локален излишък","Absorb all local surplus")}</small></span></button></div><button className="primary-btn" onClick={()=>notify(t("Правилата за управляемите товари са запазени","Flexible-load rules saved"))}>{t("Запази политиката","Save policy")}</button></article><article className="card occupancy-card"><PanelTitle eyebrow={t("ВЪНШЕН ОПЕРАТИВЕН СИГНАЛ","EXTERNAL OPERATING SIGNAL")} title={t("Резервации, смени и производствен план","Bookings, shifts and production plan")}/><div className="occupancy-value"><strong>{occupancy}%</strong><span>{t("очаквано натоварване утре","expected utilisation tomorrow")}</span></div><ModeRange label={t("Симулация на заетостта","Utilisation simulation")} value={occupancy} unit="%" min={0} max={100} onChange={setOccupancy}/><div className="occupancy-source"><span><i>API</i><b>{t("Резервационна / ERP система","Booking / ERP system")}</b><small>{t("Обновено преди 6 мин.","Updated 6 min ago")}</small></span><span><i>↗</i><b>{t("Прогнозен товар","Forecast load")}</b><small>{Math.round(260+occupancy*2.8)} kWh</small></span></div><p>{t("Сигналът променя нужния термичен резерв, EV капацитета и допустимото отлагане на процесните товари.","The signal changes required thermal reserve, EV capacity and allowable deferral of process loads.")}</p></article></section>}
    {tab==="erp"&&<ErpProductionPlan notify={notify} lang={lang}/>}
    {tab==="thermal"&&<section className="thermal-layout"><article className="card thermal-tank"><div className="tank-visual"><span style={{height:"68%"}}/><strong>68°C</strong><small>4.2 MWhth</small></div><div><PanelTitle eyebrow={t("ТЕРМИЧЕН БУФЕР","THERMAL STORAGE")} title={t("Индустриален бойлерен каскад","Industrial boiler cascade")}/><div className="thermal-stats"><span>{t("Минимум","Minimum")}<b>48°C</b></span><span>{t("Максимум","Maximum")}<b>78°C</b></span><span>{t("Хистерезис","Hysteresis")}<b>3°C</b></span><span>{t("Загуби","Losses")}<b>0.006 / h</b></span></div><div className="thermal-flow"><span><i>☀</i>{t("PV излишък","PV surplus")}</span><b>+</b><span><i>¤</i>{t("Евтин ток","Low-cost power")}</span><b>→</b><span><i>♨</i>{t("Топлинен запас","Thermal reserve")}</span></div></div></article><article className="card thermal-sensors"><PanelTitle eyebrow={t("СЕНЗОРИ И САМООБУЧЕНИЕ","SENSORS & SELF-LEARNING")} title={t("Загуби срещу реална консумация","Losses versus actual demand")}/><div><span><i>●</i><b>{t("Топла вода","Hot water")}</b><strong>68.2°C</strong></span><span><i>●</i><b>{t("Студена вода","Cold water")}</b><strong>14.6°C</strong></span><span><i>●</i><b>{t("Помещение","Plant room")}</b><strong>25.1°C</strong></span><span><i>AI</i><b>{t("Модел на загубите","Loss model")}</b><strong>96.4%</strong></span></div><button className="primary-btn" onClick={()=>notify(t("Коефициентът на топлинни загуби е преизчислен","Thermal-loss coefficient recalculated"))}>{t("Преизчисли коефициента","Recalculate coefficient")}</button></article></section>}
  </div>;
}

function ErpProductionPlan({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [reserve,setReserve]=useState(12);
  const forecast=[38,32,29,31,46,68,92,118,146,172,188,196,184,169,158,174,205,228,214,182,136,98,71,52];
  const orders=[
    ["PO-4821",t("Линия A · партида 14","Line A · batch 14"),"08:00–11:30","412 kWh",t("Висок","High")],
    ["PO-4827",t("Линия B · термообработка","Line B · thermal process"),"12:15–16:00","684 kWh",t("Задължителен","Mandatory")],
    ["PO-4830",t("Компресори · партида 9","Compressors · batch 9"),"22:00–01:00","188 kWh",t("Гъвкав","Flexible")],
    ["PO-4834",t("Опаковъчна линия","Packaging line"),"05:30–07:30","126 kWh",t("Среден","Medium")],
  ];
  return <section className="erp-plan" data-no-translate>
    <div className="erp-status card">
      <div><span className="plan-chip enterprise">ENTERPRISE</span><p>{t("ERP / MES ВХОДЕН СИГНАЛ","ERP / MES INPUT SIGNAL")}</p><h2>{t("Производственият план става прогноза за електрическия товар","The production plan becomes an electrical-load forecast")}</h2><small>{t("Поръчки, смени, партиди и крайни срокове се преобразуват в 15-минутен товар и се оптимизират спрямо PV, батерията, цената и отпуснатата мощност.","Orders, shifts, batches and deadlines are converted into a 15-minute load forecast and optimised against PV, battery, price and contracted capacity.")}</small></div>
      <div className="erp-connection"><i>API</i><span><b>SAP S/4HANA</b><small>Online · 14:32:08</small></span></div>
    </div>
    <div className="erp-kpis">
      <article className="card"><small>{t("ХОРИЗОНТ","HORIZON")}</small><strong>72 h</strong><span>{t("обновяване на 15 мин.","15-minute refresh")}</span></article>
      <article className="card"><small>{t("АКТИВНИ ПОРЪЧКИ","ACTIVE ORDERS")}</small><strong>18</strong><span>4 {t("линии","lines")}</span></article>
      <article className="card"><small>{t("ОЧАКВАНА ЕНЕРГИЯ УТРЕ","EXPECTED ENERGY TOMORROW")}</small><strong>3.84 MWh</strong><span>+12% vs baseline</span></article>
      <article className="card"><small>{t("ДОВЕРИЕ НА МОДЕЛА","MODEL CONFIDENCE")}</small><strong>94.2%</strong><span>MAE 18.6 kW</span></article>
    </div>
    <div className="erp-main">
      <article className="card erp-orders">
        <PanelTitle eyebrow={t("ПОРЪЧКИ И ЕНЕРГИЕН ОТПЕЧАТЪК","ORDERS & ENERGY SIGNATURE")} title={t("План за следващите 24 часа","Next 24-hour plan")} action={<button className="secondary-btn" onClick={()=>notify(t("ERP планът е синхронизиран","ERP plan synchronised"))}>{t("Синхронизирай","Synchronise")}</button>}/>
        <DataTable headers={["ERP ID",t("Процес","Process"),t("Прозорец","Window"),t("Енергия","Energy"),t("Приоритет","Priority")]} rows={orders}/>
      </article>
      <article className="card erp-forecast">
        <PanelTitle eyebrow={t("ПРОГНОЗА ОТ ERP","ERP-DRIVEN FORECAST")} title={t("Очакван товар по часове","Expected hourly load")}/>
        <div className="erp-bars">{forecast.map((value,i)=><span key={i}><i style={{height:`${value/2.4}px`}} className={i>=7&&i<=18?"peak":""}/><small>{String(i).padStart(2,"0")}</small></span>)}</div>
        <div className="erp-legend"><span><i/>ERP baseline</span><span><i className="peak"/>Production orders</span></div>
      </article>
    </div>
    <div className="erp-bottom">
      <article className="card erp-flow">
        <PanelTitle eyebrow={t("ИНДУСТРИАЛНА ЛОГИКА","INDUSTRIAL LOGIC")} title={t("От поръчка до безопасна команда","From production order to safe command")}/>
        <div><span><i>ERP</i><b>{t("Поръчки и смени","Orders & shifts")}</b></span><em>→</em><span><i>AI</i><b>{t("Прогноза на товара","Load forecast")}</b></span><em>→</em><span><i>¤</i><b>{t("Цена + PV + BESS","Price + PV + BESS")}</b></span><em>→</em><span><i>GX</i><b>{t("Безопасен график","Safe schedule")}</b></span></div>
      </article>
      <article className="card erp-policy">
        <PanelTitle eyebrow={t("ОПЕРАТИВЕН РЕЗЕРВ","OPERATING RESERVE")} title={t("Защита на производството","Production protection")}/>
        <ModeRange label={t("Резерв над ERP прогнозата","Reserve above ERP forecast")} value={reserve} unit="%" min={0} max={30} onChange={setReserve}/>
        <div className="setting-row"><span>{t("При липса на ERP сигнал","When ERP signal is unavailable")}</span><b>{t("Последен план + 18%","Last plan + 18%")}</b></div>
        <div className="setting-row"><span>{t("Крайните срокове","Production deadlines")}</span><b>{t("Никога не се нарушават","Never violated")}</b></div>
      </article>
    </div>
  </section>;
}

function BalancingPolicy({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [priority,setPriority]=useState(62);
  const [scheduleWeight,setScheduleWeight]=useState(11);
  const [enabled,setEnabled]=useState(true);
  return <section className="card balancing-policy" data-no-translate><div><p>{t("АВТОМАТИЗИРАНО БАЛАНСИРАНЕ","AUTOMATED BALANCING")}</p><h2>{t("Приоритет, риск и изпълнение на графика","Priority, risk and schedule adherence")}</h2><span>{t("Стратегията управлява само когато очакваната стойност на небаланса превишава пазарната алтернатива и всички договорни условия са валидни.","The strategy acts only when expected imbalance value exceeds the market alternative and all contractual conditions are valid.")}</span></div><div className="balancing-switch"><span><strong>{enabled?t("Активно","Enabled"):t("Наблюдение","Monitoring only")}</strong><small>{t("Договорът е валидиран","Contract validated")}</small></span><button className={enabled?"toggle on":"toggle"} onClick={()=>setEnabled(v=>!v)}/></div><div className="balancing-sliders"><ModeRange label={t("Приоритет на балансирането","Balancing priority")} value={priority} unit="%" min={0} max={100} onChange={setPriority}/><ModeRange label={t("Тежест за изпълнение на графика","Schedule-adherence weight")} value={scheduleWeight} unit="EUR/MWh" min={0} max={30} onChange={setScheduleWeight}/></div><div className="eligibility-checks"><Check text={t("Индивидуално балансиране по договор","Individual balancing agreement")}/><Check text={t("15-минутен график към търговеца","15-minute schedule to trader")}/><Check text={t("Отклонение спрямо официален електромер < 2%","Deviation from official meter < 2%")}/><Check text={t("Локален буфер и възстановяване на данни","Local buffer and data recovery")}/></div><button className="primary-btn" onClick={()=>notify(t("Политиката за балансиране е запазена","Balancing policy saved"))}>{t("Запази политиката","Save policy")}</button></section>;
}

function Balance({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) { return <><BalanceCore/><BalancingPolicy notify={notify} lang={lang}/></>; }

function BalanceCore() {
  return <><section className="portfolio-summary"><div><span>Участници</span><strong>24</strong></div><div><span>Обща позиция</span><strong className="positive">+186 kWh</strong></div><div><span>Прогнозен резултат</span><strong>+3 428 лв.</strong></div><div><span>Точност</span><strong>96.8%</strong></div></section><article className="card balance-chart"><PanelTitle eyebrow="ГРАФИК СПРЯМО ИЗМЕРВАНЕ" title="Позиция на групата" action={<span className="pill amber-pill">Обновено 14:30</span>}/><div className="deviation-chart"><div className="deviation-line"/>{[22,18,24,16,12,-8,-12,4,18,26,14,-5,-16,-24,-8,6,18,22,16,8,-4,-10,-6,2].map((v,i)=><div key={i}><i className={v>=0?"surplus":"shortage"} style={{height:`${Math.abs(v)*3}px`}}/><span>{i%4===0?`${i}:00`:""}</span></div>)}</div></article><article className="card table-card"><PanelTitle eyebrow="УЧАСТНИЦИ" title="Текущи позиции"/><DataTable headers={["Обект","График","Измерено","Отклонение","Цена небаланс","Резултат"]} rows={[["Solar Park East","2.46 MWh","2.51 MWh","+2.0%","−18.42 лв.","+1 842 лв."],["Logistics Hub Plovdiv","1.18 MWh","1.12 MWh","−5.1%","−24.18 лв.","+638 лв."],["Factory Varna","1.86 MWh","1.83 MWh","−1.6%","−18.42 лв.","+1 104 лв."],["Retail Park Burgas","0.82 MWh","0.91 MWh","+11.0%","−31.24 лв.","+386 лв."] , ["Warehouse Ruse","0.42 MWh","0.41 MWh","−2.4%","−18.42 лв.","+214 лв."]]}/></article></>;
}

function Assets({navigate,notify,lang}:{navigate:(v:string)=>void;notify:(v:string)=>void;lang:UiLanguage}) {
  const assetGroups = [
    { icon:"☀", type:"PV инвертори", count:"6 / 6", power:"248.6 kW", note:"Deye · Sungrow · Huawei · Growatt", tone:"sun" },
    { icon:"▣", type:"Батерии и BMS", count:"2 / 2", power:"1.44 MWh", note:"TESVOLT · Deye · Sungrow · Huawei", tone:"storage" },
    { icon:"ϟ", type:"Зарядни станции", count:"8 / 9", power:"46.2 kW", note:"OCPP · ABB · Wallbox · Alfen", tone:"ev" },
    { icon:"⌁", type:"Електромери и I/O", count:"4 / 4", power:"98.6%", note:"Modbus · SunSpec · IEC 61850", tone:"meter" },
  ];
  const vendors = [
    ["Deye","SUN / BOS / RW","PV, Hybrid, BESS","DC / AC по модел","Modbus TCP/RTU","Поддържан"],
    ["Sungrow","SG / SH / PowerTitan","PV, Hybrid, AIO BESS","DC / AC по модел","Modbus TCP / SunSpec","Поддържан"],
    ["Huawei","SUN2000 / LUNA2000","PV, Hybrid, ESS","DC / AC по модел","Modbus TCP","Поддържан"],
    ["Growatt","MAX / MID / WIT / APX","PV, Hybrid, BESS","DC / AC по модел","Modbus TCP/RTU","Поддържан"],
    ["SMA","Sunny Tripower / Storage","PV, Battery inverter","AC / DC по модел","Modbus TCP / SunSpec","Каталог"],
    ["GoodWe","ET / BT / Lynx","Hybrid, Battery","DC coupled","Modbus TCP","Каталог"],
    ["Fronius","Tauro / GEN24","PV, Hybrid","DC coupled","SunSpec / Solar API","Каталог"],
    ["Victron","Cerbo GX / MultiPlus","Battery inverter / ESS","AC coupled","Modbus TCP / MQTT","Каталог"],
  ];
  return <>
    <section className="asset-summary-grid">{assetGroups.map(a=><button key={a.type} className="asset-block card" onClick={()=>navigate(a.type.includes("Батерии")?"battery":"devices")}><i className={a.tone}>{a.icon}</i><div><span>{a.type}</span><strong>{a.count}</strong><small>{a.note}</small></div><b>{a.power}</b></button>)}</section>
    <section className="asset-detail-grid">
      <article className="card asset-map"><PanelTitle eyebrow="АКТИВИ НА ОБЕКТА" title="Енергийни блокове" action={<span className="pill green">● 20 от 21 онлайн</span>}/><div className="energy-bus"><div className="bus-line"/><AssetNode icon="☀" title="PV масив" model="4 × инверторни блока" value="248.6 kW"/><AssetNode icon="▣" title="BESS" model="2.0 MWh / 500 kW" value="72% SOC"/><AssetNode icon="ϟ" title="EV парк" model="9 зарядни точки" value="46.2 kW"/><AssetNode icon="⌂" title="Товар" model="3 измервателни точки" value="124.3 kW"/><AssetNode icon="⌁" title="Мрежа" model="PCC + защита" value="−83.2 kW"/></div></article>
      <article className="card protocol-card"><PanelTitle eyebrow="УНИВЕРСАЛЕН EDGE СЛОЙ" title="Протоколи и управление"/><div className="protocol-cloud"><span>Modbus TCP</span><span>Modbus RTU</span><span>SunSpec</span><span>OCPP 1.6 / 2.0.1</span><span>CAN</span><span>MQTT</span><span>IEC 61850</span><span>REST API</span></div><div className="edge-note"><i>↻</i><div><strong>Driver adapter layer</strong><small>Нови марки и модели се добавят като драйвери, без промяна на EMS логиката.</small></div></div></article>
    </section>
    <article className="card table-card vendor-table"><PanelTitle eyebrow="КАТАЛОГ НА ДРАЙВЕРИТЕ" title="Производители, типове и coupling"/><DataTable headers={["Производител","Серии","Типове","Coupling","Протокол","Статус"]} rows={vendors}/></article>
    <DriverCatalog notify={notify}/>
    <OpenProtocolReference notify={notify} lang={lang}/>
    <MeterTopology notify={notify}/>
    <section className="charger-strip card"><PanelTitle eyebrow="EV ЗАРЯДНА ИНФРАСТРУКТУРА" title="Управление на зарядни станции" action={<button className="secondary-btn" onClick={()=>navigate("automation")}>Отвори логиката →</button>}/><div className="charger-features"><span><i>ϟ</i><strong>Dynamic load balancing</strong><small>Разпределение според свободната мощност</small></span><span><i>¤</i><strong>Зареждане по цена</strong><small>Отлагане при скъпа енергия</small></span><span><i>☀</i><strong>Solar surplus</strong><small>Приоритет на собственото PV производство</small></span><span><i>⌁</i><strong>OCPP контрол</strong><small>Сесии, тарифи, лимити и статус</small></span></div></section>
  </>;
}

function AssetNode({icon,title,model,value}:{icon:string;title:string;model:string;value:string}) { return <div className="asset-node"><i>{icon}</i><span><strong>{title}</strong><small>{model}</small></span><b>{value}</b></div>; }

function DriverCatalog({notify}:{notify:(v:string)=>void}) {
  const driverTypes = [
    {name:"PV инвертор",icon:"☀",coupling:"DC → AC",kind:"String / central",description:"Преобразува DC енергията от PV масива към AC шината. Не управлява директно батерия.",contains:["MPPT входове","DC/AC преобразувател","AC защити и релета","Локален контролер"],telemetry:["AC/DC мощност и енергия","Напрежения, токове, честота","MPPT канали и изолация","Температури, аларми, derating"],commands:["Active power limit","Reactive power / cos φ","Start / stop","Ramp rate"],identity:["Производител и модел","String или central","Номинална AC/DC мощност","Firmware и register map"]},
    {name:"Hybrid инвертор",icon:"⇄",coupling:"DC coupled",kind:"PV + battery inverter",description:"Обединява PV и батерия върху общ DC bus и използва един инвертор за връзка с AC мрежата.",contains:["PV MPPT входове","Двупосочен battery DC порт","DC bus","Общ AC инвертор"],telemetry:["PV, battery и grid power","SOC от външен/вграден BMS","DC bus voltage","Operating mode и alarms"],commands:["Battery charge/discharge","Export/import limit","PV curtailment","Backup / EPS mode"],identity:["Производител и модел","Поддържана батерия/BMS","PV и battery DC диапазон","Мрежова конфигурация"]},
    {name:"Battery PCS",icon:"↔",coupling:"AC coupled",kind:"Bidirectional inverter",description:"Самостоятелен двупосочен AC/DC преобразувател между батерийната DC шина и AC шината на обекта.",contains:["AC/DC power stage","DC contactor interface","Grid relay / protection","PCS controller"],telemetry:["AC/DC active power","DC voltage/current","Available charge/discharge","PCS state, temperature, faults"],commands:["Requested active power","Reactive power","Enable / disable","Heartbeat / watchdog"],identity:["PCS производител и модел","Номинални kW и kVA","Знакова конвенция","Scale, offset и heartbeat"]},
    {name:"Батерия / BMS",icon:"▣",coupling:"DC subsystem",kind:"Rack / cabinet / container",description:"Съхранява енергията и определя реалния безопасен envelope. BMS лимитите винаги имат приоритет.",contains:["Cell modules","Racks и contactors","BMU / CMU","BMS / BAU controller"],telemetry:["SOC / SOH","Cell min/max voltage","Температури и alarms","Charge/discharge limits"],commands:["Wake / sleep, ако е разрешено","Contactor request","Alarm reset","Няма директен power setpoint"],identity:["Химия и капацитет","BMS/BAU модел","Rack/module topology","CAN/RS485 register map"]},
    {name:"All-in-one AC",icon:"▦",coupling:"AC coupled",kind:"Integrated BESS",description:"Завършена AC-свързана BESS система. Към EMS се моделира като assembly с отделни PCS, Battery/BMS и вътрешни помощни assets.",contains:["Battery racks и BMS/BAU","PCS — производител и модел","AC/DC защити и switchgear","HVAC, fire system, auxiliary meter","Локален controller / EMS"],telemetry:["Assembly status и availability","PCS active/reactive power","BMS SOC/SOH и лимити","HVAC/fire/door/aux alarms"],commands:["Assembly power setpoint","PCS enable / standby","Reactive power","Safe shutdown"],identity:["AIO производител и модел","PCS производител и модел","Battery/BMS производител и модел","AC coupling point и nominal power"]},
    {name:"All-in-one DC",icon:"◈",coupling:"DC coupled",kind:"PV + BESS integrated",description:"PV и батерията споделят DC bus преди общ hybrid inverter/PCS. Позволява съхранение на PV без допълнително AC преобразуване.",contains:["PV MPPT/DC combiner","Battery racks и BMS","DC/DC battery stage","Hybrid inverter / common PCS","DC и AC protection"],telemetry:["PV power before inverter","Battery DC power и SOC","DC bus state","Combined AC output"],commands:["Battery DC charge/discharge","AC export limit","PV curtailment","Hybrid operating mode"],identity:["AIO и inverter модел","DC topology и voltage range","Battery compatibility","PV/BESS power ratios"]},
    {name:"Smart meter",icon:"⌁",coupling:"Measurement",kind:"PCC / branch / submeter",description:"Независим измервателен Asset, поставен в конкретна електрическа точка. Ролята се задава чрез measurement point, не само чрез името на уреда.",contains:["3-phase voltage/current inputs","CT/VT ratio configuration","Energy counters","Communication interface"],telemetry:["Import/export active power","Reactive power и power factor","Voltage/current/frequency","Import/export energy counters"],commands:["Обикновено read-only","Reset demand — само ако е разрешено","Time sync","Tariff selection при нужда"],identity:["Производител и модел","PCC/PV/Load/BESS/EV role","CT/VT ratio и direction","Modbus address и phase order"]},
  ];
  const [selected,setSelected]=useState(4);
  const type=driverTypes[selected];
  return <article className="card driver-taxonomy"><PanelTitle eyebrow="ТИПОВ МОДЕЛ НА ДРАЙВЕРИТЕ" title="Какво представлява и какво съдържа всеки тип" action={<button className="secondary-btn" onClick={()=>notify("Шаблонът за нов драйвер е отворен")}>+ Нов драйвер</button>}/><div className="driver-type-tabs">{driverTypes.map((d,i)=><button key={d.name} className={selected===i?"active":""} onClick={()=>setSelected(i)}><i>{d.icon}</i><span><strong>{d.name}</strong><small>{d.coupling}</small></span></button>)}</div><section className="driver-type-detail"><div className="driver-description"><div className="driver-badge"><i>{type.icon}</i><span><small>{type.kind}</small><strong>{type.name}</strong><em>{type.coupling}</em></span></div><p>{type.description}</p><div className="driver-identity"><span>Задължителна идентификация</span>{type.identity.map(x=><b key={x}>✓ {x}</b>)}</div></div><DriverFieldList title="Съдържа" icon="▦" items={type.contains}/><DriverFieldList title="Телеметрия" icon="↗" items={type.telemetry}/><DriverFieldList title="Команди" icon="⌘" items={type.commands}/></section><div className="driver-rule"><i>!</i><span><strong>Driver package = тип + производител + модел + firmware/register-map версия</strong><small>„All-in-one“ не е един черен блок. PCS, Battery/BMS, smart meter и помощните системи се виждат като отделни child assets под общ assembly.</small></span></div></article>;
}

function OpenProtocolReference({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"inverter"|"bms"|"wiring">("inverter");
  const inverterRows=[
    ["DEYE_CAN","Deye","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["GOODWE_CAN","GoodWe HV","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["GROWATT_CAN","Growatt LV","CAN","SPF 5000 ES · ES 5000"],
    ["GROWATT_HV_CAN","Growatt HV","CAN","SPH Series"],
    ["GROWATT_MODBUS","Growatt","Modbus",t("По модел · register-map тест","Per model · register-map test")],
    ["HUAWEI_MODBUS","Huawei","Modbus",t("По модел · register-map тест","Per model · register-map test")],
    ["LUXPOWER_CAN","Luxpower","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["PYLON_CAN","Pylon-compatible","CAN","Growatt SPH TL3 BH UP · OEM families"],
    ["PYLON_RS485","Pylon-compatible","RS485 / UART","Growatt SPF 3000 ES · OEM families"],
    ["PYLON_HV_CAN","Pylon HV-compatible","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["SMA_CAN","SMA Sunny Island","CAN","4.0H · 6.0H · 8.0H · 4548-US · 6048-US"],
    ["SOLARK_CAN","Sol-Ark","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["SOLIS_HV_CAN","Solis HV","CAN",t("По модел · лабораторен тест","Per model · bench test")],
  ];
  const bmsRows=[
    ["BYD","CAN"],["Daly","CAN · RS485 · UART / RS232"],["Growatt LV / HV","CAN"],["Huawei","Modbus"],["JBD","RS485 · UART / RS232"],
    ["JK","CAN · RS485 · UART / RS232 · Modbus"],["Megarevo","CAN"],["LIA","CAN"],["Luxpower","CAN"],["Narada","Modbus"],
    ["PACE","CAN"],["PylonTech LV","CAN · RS485 · UART / RS232 · Modbus"],["PylonTech HV","CAN"],["SacredSun","RS485"],["Samsung / Vertiv","CAN"],
    ["Seplos","CAN"],["SMA","CAN"],["TianPower","Modbus"],
  ].map(row=>[row[0],row[1],t("R&D референция","R&D reference"),t("Изисква тест с точния BMS firmware","Exact BMS firmware test required")]);
  const wiringRows=[
    ["Deye BMS RJ45","CAN H: 4 · CAN L: 5 · GND: 6","RS485 B/A: 1/2 · A/B: 7/8"],
    ["Growatt CAN RJ45","CAN H: 4 · CAN L: 5 · GND: 2",t("Провери серията и firmware","Verify series and firmware")],
    ["Pylon compatible RJ45","CAN H: 4 · CAN L: 5 · GND: 6","RS485 A/B: 7/8 · pins 1–3 NC"],
    ["SMA CAN RJ45","CAN H: 4 · CAN L: 5",t("Sunny Island family reference","Sunny Island family reference")],
  ];
  return <article className="card protocol-reference" data-no-translate>
    <div className="protocol-reference-head"><div><p>{t("ОТВОРЕН R&D КАТАЛОГ","OPEN R&D CATALOGUE")}</p><h2>{t("BMS ↔ инвертор протоколи и serial/CAN карта","BMS ↔ inverter protocols and serial/CAN map")}</h2><span>{t("Използваме публичния проект ai-republic/bms-to-inverter като референция за протоколни семейства, тестови сценарии и съвместими модели — не като директно копиран firmware.","We use the public ai-republic/bms-to-inverter project as a reference for protocol families, test scenarios and compatible models — not as copied firmware.")}</span></div><a href="https://github.com/ai-republic/bms-to-inverter" target="_blank" rel="noreferrer">GitHub reference ↗</a></div>
    <section className="protocol-reference-kpis"><span><small>{t("ИНВЕРТОРНИ BINDINGS","INVERTER BINDINGS")}</small><strong>13</strong></span><span><small>{t("BMS СЕМЕЙСТВА","BMS FAMILIES")}</small><strong>18+</strong></span><span><small>{t("ТРАНСПОРТИ","TRANSPORTS")}</small><strong>CAN · RS485 · RS232 · Modbus</strong></span><span><small>{t("СТАТУС","STATUS")}</small><strong>{t("R&D / за валидация","R&D / validation")}</strong></span></section>
    <div className="protocol-reference-tabs"><button className={tab==="inverter"?"active":""} onClick={()=>setTab("inverter")}>{t("Инверторни протоколи","Inverter protocols")}</button><button className={tab==="bms"?"active":""} onClick={()=>setTab("bms")}>{t("BMS протоколи","BMS protocols")}</button><button className={tab==="wiring"?"active":""} onClick={()=>setTab("wiring")}>{t("Serial / CAN pin map","Serial / CAN pin map")}</button></div>
    {tab==="inverter"&&<div className="protocol-table-wrap"><DataTable headers={[t("Binding","Binding"),t("Марка / семейство","Brand / family"),t("Транспорт","Transport"),t("Публично описани модели / статус","Publicly described models / status")]} rows={inverterRows}/></div>}
    {tab==="bms"&&<div className="protocol-table-wrap"><DataTable headers={[t("BMS семейство","BMS family"),t("Транспорт","Transport"),t("Източник","Source"),t("GrideX статус","GrideX status")]} rows={bmsRows}/></div>}
    {tab==="wiring"&&<><div className="protocol-table-wrap"><DataTable headers={[t("Интерфейс","Interface"),"CAN",t("Serial / бележка","Serial / note")]} rows={wiringRows}/></div><div className="wiring-warning"><i>!</i><span><strong>{t("RJ45 тук не означава Ethernet.","RJ45 does not mean Ethernet here.")}</strong><small>{t("Pinout-ът е R&D референция. Преди окабеляване задължително се сверява ръководството за точния модел, hardware revision и firmware; CAN шината се терминира само в двата края.","The pinout is an R&D reference. Before wiring, verify the exact model, hardware revision and firmware manual; terminate the CAN bus only at both ends.")}</small></span></div></>}
    <div className="protocol-license-note"><i>CC</i><span><strong>{t("Лицензионна граница: идеи и проверка, без директно копиране на код","Licence boundary: ideas and verification, no direct code copying")}</strong><small>{t("Референтното repo е под CC BY-NC-SA 4.0. За комерсиално вграждане на негов код е нужно отделно разрешение. GrideX драйверите ще бъдат собствена реализация по официалните протоколи и лабораторни traces.","The reference repository is licensed CC BY-NC-SA 4.0. Commercial embedding of its code requires separate permission. GrideX drivers will be independently implemented from official protocols and laboratory traces.")}</small></span><button onClick={()=>notify(t("Създаден е план за bench validation по модел и firmware","A per-model and firmware bench-validation plan has been created"))}>{t("План за валидация","Validation plan")}</button></div>
  </article>;
}

function DriverFieldList({title,icon,items}:{title:string;icon:string;items:string[]}) { return <div className="driver-field-list"><h3><i>{icon}</i>{title}</h3>{items.map(x=><span key={x}>{x}</span>)}</div>; }

function MeterTopology({notify}:{notify:(v:string)=>void}) {
  const [meterCount,setMeterCount]=useState(3);
  const meters=[
    {id:"M1",name:"PCC / Grid meter",role:"Задължителен",place:"В точката на присъединяване — след главния прекъсвач, преди вътрешните разклонения.",measures:"Нетен внос/износ на целия обект",parent:"Site"},
    {id:"M2",name:"PV production meter",role:"Препоръчителен",place:"На AC изхода на PV инверторите или общото PV табло.",measures:"Реално PV производство независимо от inverter telemetry",parent:"PV System"},
    {id:"M3",name:"Main load meter",role:"Препоръчителен",place:"На шината към основните консуматори, след отделяне на PV/BESS клоновете.",measures:"Чиста консумация на обекта",parent:"Site / Load group"},
    {id:"M4",name:"BESS branch meter",role:"Опционален",place:"Между PCS AC изхода и общата AC шина; може да е физически в AIO шкафа.",measures:"Независима енергия заряд/разряд и загуби",parent:"BESS assembly"},
    {id:"M5",name:"EV / process submeter",role:"Опционален",place:"На отделен управляем клон — EV, HVAC или технологична линия.",measures:"Контролируем товар и settlement по групи",parent:"EV / Load group"},
  ];
  const active=meters.slice(0,meterCount);
  return <article className="card meter-topology"><PanelTitle eyebrow="SMART METER ASSETS" title="Къде са свързани измервателните точки?" action={<div className="meter-count">{[1,2,3,5].map(x=><button key={x} className={meterCount===x?"active":""} onClick={()=>setMeterCount(x)}>{x} meter{x>1?"s":""}</button>)}</div>}/><div className="single-line"><div className="grid-source"><i>⌁</i><strong>Мрежа</strong></div><b>→</b><div className="meter-node primary"><i>M1</i><strong>PCC meter</strong><small>Import / export</small></div><b>→</b><div className="ac-bus"><strong>AC BUS</strong><span>{meterCount>1&&<em><i>M2</i> PV</em>}{meterCount>2&&<em><i>M3</i> Load</em>}{meterCount>3&&<em><i>M4</i> BESS</em>}{meterCount>4&&<em><i>M5</i> EV / Process</em>}</span></div></div><section className="meter-layout"><div className="meter-cards">{active.map(m=><article key={m.id}><div><i>{m.id}</i><span><strong>{m.name}</strong><small>{m.role}</small></span></div><p>{m.place}</p><b>{m.measures}</b><em>OpenRemote parent: {m.parent}</em></article>)}</div><aside className="meter-model"><p>OPENREMOTE МОДЕЛ</p><h3>Всеки измервател е отделен MeterAsset</h3><div><span><small>parentId</small><strong>Физическо местоположение</strong></span><span><small>measurementPoint</small><strong>PCC / PV / LOAD / BESS / EV</strong></span><span><small>measuresAssetId</small><strong>Логически измерван актив</strong></span><span><small>direction</small><strong>Import / Export / Bidirectional</strong></span><span><small>ctRatio / phaseOrder</small><strong>Монтажна конфигурация</strong></span></div><p className="meter-note">Ако smart meter е в All-in-one шкафа, той остава отделен MeterAsset, но неговият parent е BESS assembly. Така може да се смени уредът без промяна на модела на PCS/BMS.</p><button className="primary-btn" onClick={()=>notify(`Топологията с ${meterCount} smart meter-а е записана`)}>Запази измервателната топология</button></aside></section></article>;
}

function ModeCostAccounting({mode,lang,settings}:{mode:string;lang:UiLanguage;settings:BatteryCostSettings}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const nominalCapacity=2;
  const depreciableBase=settings.capex*(1-settings.residual/100);
  const costPerCycle=depreciableBase/Math.max(1,settings.warrantedCycles);
  const straightDaily=depreciableBase/Math.max(1,settings.years*365);
  const maintenanceDaily=settings.capex*settings.maintenance/100/365;
  const profiles=[
    {bg:"Интелигентен хибрид",en:"Smart hybrid",fec:.78,income:186},
    {bg:"Ценови арбитраж",en:"Price arbitrage",fec:1.24,income:268},
    {bg:"Самоконсумация",en:"Self-consumption",fec:.56,income:132},
    {bg:"Zero export",en:"Zero export",fec:.32,income:74},
    {bg:"Peak shaving",en:"Peak shaving",fec:.68,income:164},
  ].map(item=>{
    const depreciation=settings.method==="usage"?costPerCycle*item.fec:straightDaily;
    const variableCost=item.fec*nominalCapacity*24.8;
    const total=depreciation+maintenanceDaily+variableCost;
    return {...item,depreciation,variableCost,total,net:item.income-total};
  });
  const selected=profiles.find(item=>item.bg===mode)??profiles[0];
  const money=(value:number)=>new Intl.NumberFormat(lang==="en"?"en-GB":"bg-BG",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  return <section className="card mode-cost-accounting" data-no-translate>
    <div className="mode-cost-head"><div><p>{t("РЕЖИМ → ЦИКЛИ → ДМА → НЕТЕН РЕЗУЛТАТ","MODE → CYCLES → DEPRECIATION → NET RESULT")}</p><h2>{t("Дневен разход на батерията по режими","Daily battery cost by operating mode")}</h2><span>{t("Всеки режим прогнозира различен брой еквивалентни цикли. При повече цикли ДМА и променливият разход се увеличават автоматично.","Each mode forecasts a different number of equivalent cycles. More cycles automatically increase depreciation and variable cost.")}</span></div><span className={settings.included?"cost-status active":"cost-status"}><i>{settings.included?"✓":"i"}</i><b>{settings.included?t("ДМА участва в решенията","Depreciation included in decisions"):t("ДМА е само информационно","Depreciation is informational")}</b></span></div>
    <div className="mode-cost-kpis"><span><small>{t("Стойност на актива","Asset value")}</small><strong>{settings.capex.toLocaleString(lang==="en"?"en-GB":"bg-BG")} BGN</strong></span><span><small>{t("Цена на 1 FEC","Cost per FEC")}</small><strong>{money(costPerCycle)} BGN</strong></span><span><small>{t("Прогноза за активния режим","Active-mode forecast")}</small><strong>{selected.fec.toFixed(2)} FEC/{t("ден","day")}</strong></span><span><small>{t("ДМА за деня","Daily depreciation")}</small><strong>{money(selected.depreciation)} BGN</strong></span><span className="mode-cost-total"><small>{t("Общ разход за деня","Total daily cost")}</small><strong>{money(selected.total)} BGN</strong></span></div>
    <div className="mode-cost-formula"><span><small>{t("АКТИВЕН РЕЖИМ","ACTIVE MODE")}</small><strong>{t(selected.bg,selected.en)}</strong></span><b>→</b><span><small>{t("ПРОГНОЗНИ ЦИКЛИ","FORECAST CYCLES")}</small><strong>{selected.fec.toFixed(2)} FEC</strong></span><b>×</b><span><small>{t("ЦЕНА НА ЦИКЪЛ","COST PER CYCLE")}</small><strong>{money(costPerCycle)} BGN</strong></span><b>=</b><span className="mode-dma"><small>{t("ДМА ЗА ДЕНЯ","DAILY DEPRECIATION")}</small><strong>{money(selected.depreciation)} BGN</strong></span></div>
    <div className="mode-cost-table"><div className="mode-cost-row head"><span>{t("Режим","Mode")}</span><span>FEC/{t("ден","day")}</span><span>{t("ДМА","Depreciation")}</span><span>{t("Загуби + тарифи","Losses + tariffs")}</span><span>{t("Общ разход","Total cost")}</span><span>{t("Очаквана полза","Expected benefit")}</span><span>{t("Нетен резултат","Net result")}</span></div>{profiles.map(item=><div key={item.bg} className={item.bg===mode?"mode-cost-row selected":"mode-cost-row"}><span><i>{item.bg===mode?"●":"○"}</i><b>{t(item.bg,item.en)}</b></span><span>{item.fec.toFixed(2)}</span><span>{money(item.depreciation)} BGN</span><span>{money(item.variableCost)} BGN</span><span>{money(item.total)} BGN</span><span>+{money(item.income)} BGN</span><span className={item.net>=0?"positive":"negative"}>{item.net>=0?"+":""}{money(item.net)} BGN</span></div>)}</div>
    <p className="mode-cost-note">{t(`Пример: при ${selected.fec.toFixed(2)} FEC режимът начислява ${money(selected.depreciation)} BGN ДМА. Ако прогнозните цикли се удвоят, usage-based ДМА също се удвоява. Реално отчетените ${settings.todayCycles.toFixed(2)} FEC се използват в дневния отчет на батерията.`,`Example: at ${selected.fec.toFixed(2)} FEC the mode allocates ${money(selected.depreciation)} BGN depreciation. If forecast cycles double, usage-based depreciation doubles as well. The actual ${settings.todayCycles.toFixed(2)} FEC is used in the battery daily report.`)}</p>
  </section>;
}

function Automation({notify,site,lang,batteryCost}:{notify:(v:string)=>void;site:string;lang:UiLanguage;batteryCost:BatteryCostSettings}) {
  const [mode,setMode] = useState("Интелигентен хибрид");
  const [optimised,setOptimised] = useState(false);
  const [buy,setBuy] = useState(105);
  const [sell,setSell] = useState(195);
  const [reserve,setReserve] = useState(20);
  const [targetSoc,setTargetSoc] = useState(85);
  const [forecastHorizon,setForecastHorizon] = useState(6);
  const [exportLimit,setExportLimit] = useState(0);
  const [peakTarget,setPeakTarget] = useState(620);
  const [gridImport,setGridImport] = useState(40);
  const [rules,setRules] = useState([true,true,true,true,true,true]);
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const applyLogicTuning=()=>{setMode("Интелигентен хибрид");setReserve(25);setTargetSoc(54);setRules([true,true,true,true,true,true]);setOptimised(true);notify(t("Автоматичната логика е синхронизирана с прогнозата","Automatic logic synchronised with the forecast"));};
  const toggleRule=(i:number)=>setRules(r=>r.map((v,n)=>n===i?!v:v));
  const ruleData = [
    ["Ниска пазарна цена","Цена ≤ праг за покупка","Зареждай батерията до 85%"],
    ["Висока пазарна цена","Цена ≥ праг за продажба","Разреждай до минималния SOC"],
    ["Прогнозиран PV излишък","PV − товар > 80 kW за следващите 2 ч.","Освободи капацитет в батерията"],
    ["Прогнозиран товарен пик","Товар > 620 kW в следващите 60 мин.","Запази енергия за peak shaving"],
    ["Ограничение на мрежата","Поток към мрежата > 780 kW","Ограничи PV или зареди BESS"],
    ["3-дневна метео прогноза","PV прогноза за утре < 60% или валеж > 55%","Коригирай SOC целта и day-ahead графика"],
  ];
  const modeProfiles = {
    "Интелигентен хибрид": {icon:"◎",goal:"Максимална обща стойност",description:"Комбинира пазарна цена, текущ поток, PV и товарова прогноза, SOC и всички технически ограничения.",signals:["Цена 35%","Прогноза 30%","Поток 20%","Резерв 15%"],inputs:["IBEX цена","PV + товар","SOC + BMS"],decision:"Оптимизирай целия хоризонт",result:"Продай 83.2 kW · запази 54% SOC"},
    "Ценови арбитраж": {icon:"¤",goal:"Печалба от ценови разлики",description:"Зарежда в евтините часове и разрежда при висок пазарен сигнал, след отчитане на загубите и амортизацията.",signals:["Цена 65%","Прогноза 20%","SOC 15%"],inputs:["Цена купува","Цена продава","Цена на цикъл"],decision:"Провери нетния спред",result:`Разряд над ${sell} лв./MWh`},
    "Самоконсумация": {icon:"☀",goal:"Минимална покупка от мрежата",description:"Използва първо PV за товара, съхранява излишъка и разрежда батерията при недостиг.",signals:["PV излишък 45%","Товар 35%","SOC 20%"],inputs:["PV производство","Текущ товар","Мрежов внос"],decision:"Следвай локалния баланс",result:`Ограничи вноса до ${gridImport} kW`},
    "Zero export": {icon:"⌁",goal:"Без отдаване към мрежата",description:"Поддържа потока в точката на присъединяване под зададения лимит чрез BESS и ограничаване на инверторите.",signals:["PCC поток 60%","BESS 25%","PV 15%"],inputs:["PCC електромер","BESS капацитет","PV мощност"],decision:"Компенсирай за секунди",result:`Износ ≤ ${exportLimit} kW`},
    "Peak shaving": {icon:"⌂",goal:"Ограничаване на товарния пик",description:"Предзарежда батерията и покрива пиковете, за да не се надвишава договорената мощност.",signals:["Товар 50%","Прогноза 30%","SOC 20%"],inputs:["Текущ товар","Прогноза за пик","Договорен лимит"],decision:"Разреждай над лимита",result:`Целеви пик ${peakTarget} kW`},
  };
  const profile = modeProfiles[mode as keyof typeof modeProfiles];
  return <>
    <section className="logic-status card"><div className="logic-engine"><i>⌘</i><div><p>EMS РЕШАВАЩ МОДУЛ</p><h2>Автоматичната логика е активна</h2><span><b className="live-dot"/> Преизчисляване на всеки 5 минути · последно 14:30</span></div></div><div className="current-decision"><span>Текущо решение</span><strong>Разряд към мрежата</strong><b>83.2 kW</b><small>Увереност 94%</small></div></section>
    <section className="logic-message-grid" data-no-translate><article className="section-message success"><i>✓</i><div><small>{t("2 ЗЕЛЕНИ ПРЕПОРЪКИ · АВТОМАТИЧНА ОПТИМИЗАЦИЯ","2 GREEN RECOMMENDATIONS · AUTOMATIC OPTIMISATION")}</small><strong>{optimised?t("Логиката е синхронизирана с прогнозата","Logic is synchronised with the forecast"):t("Автоматичният режим може да изпълнява графика по-добре","Automatic mode can execute the schedule more effectively")}</strong><p>{t("Оптимизаторът може да подобри очаквания резултат с 6.8% чрез динамичен SOC резерв и по-ранна подготовка за вечерния ценови пик.","The optimiser can improve the expected result by 6.8% using a dynamic SOC reserve and earlier preparation for the evening price peak.")}</p></div><button disabled={optimised} onClick={applyLogicTuning}>{optimised?t("Приложено","Applied"):t("Приложи безопасната настройка","Apply safe tuning")}</button></article><article className="logic-mismatch"><i>!</i><div><small>{t("ОТКРИТО НЕСЪОТВЕТСТВИЕ","MISMATCH DETECTED")}</small><strong>{t("Фиксираното правило допуска разряд до 20% SOC","The fixed rule allows discharge down to 20% SOC")}</strong><p>{t("Day-ahead прогнозата изисква 54% резерв за следващия пик. Автоматичният режим ще даде приоритет на прогнозния хоризонт и всички BMS ограничения.","The day-ahead forecast requires a 54% reserve for the next peak. Automatic mode will prioritise the forecast horizon and every BMS constraint.")}</p></div></article></section>
    <section className="decision-flow card"><PanelTitle eyebrow="ВХОДОВЕ → РЕШЕНИЕ → КОМАНДИ" title="Логика в реално време"/><div className="logic-flow"><LogicSource icon="¤" title="Пазарна цена" value="214.62 лв./MWh" state="Над праг за продажба"/><LogicSource icon="⌁" title="Текущ поток" value="+124.3 kW PV излишък" state="Има свободна енергия"/><LogicSource icon="☁" title="Прогноза 3 дни" value="Време + PV + товар" state="Автоматично обновяване"/><div className="decision-box"><i>⌘</i><span>ОПТИМИЗАТОР</span><strong>Продавай сега</strong><small>Запази 54% SOC за пика</small></div><div className="command-stack"><span><i>▣</i><b>BESS</b><strong>−83.2 kW</strong></span><span><i>ϟ</i><b>EV парк</b><strong>лимит 32 kW</strong></span><span><i>☀</i><b>Инвертори</b><strong>без лимит</strong></span></div></div></section>
    <section className="mode-workbench card">
      <PanelTitle eyebrow="РЕЖИМИ НА УПРАВЛЕНИЕ" title="Изберете режим, за да видите неговите настройки" action={<span className="pill green">● {mode}</span>}/>
      <div className="mode-cards">{Object.entries(modeProfiles).map(([name,item],i)=><button key={name} className={mode===name?`mode-card active tone-${i}`:`mode-card tone-${i}`} onClick={()=>setMode(name)}><i>{item.icon}</i><span><strong>{name}</strong><small>{item.goal}</small></span><em>{mode===name?"Активен":"Преглед"}</em></button>)}</div>
      <div className="mode-detail">
        <article className="mode-map"><div className="mode-intro"><i>{profile.icon}</i><div><p>ЦЕЛ НА РЕЖИМА</p><h3>{profile.goal}</h3><span>{profile.description}</span></div></div><div className="mode-path"><div><small>ВХОДНИ СИГНАЛИ</small>{profile.inputs.map(x=><span key={x}>{x}</span>)}</div><b>→</b><div className="mode-decision"><small>РЕШЕНИЕ</small><strong>{profile.decision}</strong></div><b>→</b><div><small>ИЗХОД</small><span className="mode-result">{profile.result}</span></div></div><div className="signal-weights">{profile.signals.map((x,i)=><span key={x}><i style={{width:`${[92,76,58,42][i]}%`}}/><b>{x}</b></span>)}</div></article>
        <article className="mode-settings"><h3>Настройки за „{mode}“</h3>{mode==="Интелигентен хибрид"&&<><ModeRange label="Хоризонт на прогнозата" value={forecastHorizon} unit="ч." min={1} max={24} onChange={setForecastHorizon}/><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><ModeRange label="Целеви SOC преди пик" value={targetSoc} unit="%" min={50} max={100} onChange={setTargetSoc}/></>}{mode==="Ценови арбитраж"&&<><ModeRange label="Зареждай под" value={buy} unit="лв./MWh" min={40} max={180} onChange={setBuy}/><ModeRange label="Продавай над" value={sell} unit="лв./MWh" min={120} max={300} onChange={setSell}/><ModeRange label="Цел след зареждане" value={targetSoc} unit="% SOC" min={50} max={100} onChange={setTargetSoc}/><div className="price-window"><span>Нетен ценови прозорец</span><strong>{sell-buy} лв./MWh</strong></div></>}{mode==="Самоконсумация"&&<><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><ModeRange label="Допустим внос" value={gridImport} unit="kW" min={0} max={200} onChange={setGridImport}/><ModeRange label="Цел след PV заряд" value={targetSoc} unit="% SOC" min={60} max={100} onChange={setTargetSoc}/></>}{mode==="Zero export"&&<><ModeRange label="Допустим износ" value={exportLimit} unit="kW" min={0} max={50} onChange={setExportLimit}/><ModeRange label="Резерв за компенсация" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><div className="setting-choice"><span>При пълна батерия</span><div><button className="active">Ограничи PV</button><button>EV товар</button></div></div></>}{mode==="Peak shaving"&&<><ModeRange label="Целеви товарен пик" value={peakTarget} unit="kW" min={300} max={780} onChange={setPeakTarget}/><ModeRange label="Хоризонт за предзаряд" value={forecastHorizon} unit="ч." min={1} max={12} onChange={setForecastHorizon}/><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={60} onChange={setReserve}/></>}<button className="primary-btn" onClick={()=>notify(`Настройките за „${mode}“ са запазени`)}>Запази този режим</button></article>
      </div>
    </section>
    <ModeCostAccounting mode={mode} lang={lang} settings={batteryCost}/>
    <WeatherLogic notify={notify} site={site}/>
    <article className="card rule-engine"><PanelTitle eyebrow="RULE ENGINE" title="Активни правила" action={<button className="primary-btn" onClick={()=>notify("Логиката и ценовите прагове са запазени")}>Запази логиката</button>}/><div className="rule-list">{ruleData.map((r,i)=><div className={rules[i]?"rule-row":"rule-row disabled"} key={r[0]}><button className={rules[i]?"toggle on":"toggle"} onClick={()=>toggleRule(i)} aria-label={`${r[0]} – ${rules[i]?"изключи":"включи"}`}/><span><strong>{r[0]}</strong><small>{r[1]}</small></span><i>→</i><b>{r[2]}</b></div>)}</div></article>
    <section className="safety-band"><div><i>✓</i><span><strong>Safety constraints винаги имат приоритет</strong><small>BMS граници · минимален SOC · мрежова защита · ramp rate · комуникационен watchdog</small></span></div><button onClick={()=>notify("Всички защити са активни")}>5 / 5 активни</button></section>
  </>;
}

type ForecastDay = { date:string; code:number; max:number; min:number; rain:number; sunshine:number; radiation:number; pv:number; };

function WeatherLogic({notify,site}:{notify:(v:string)=>void;site:string}) {
  const [days,setDays] = useState<ForecastDay[]>([]);
  const [current,setCurrent] = useState<{temperature:number;cloud:number;code:number}|null>(null);
  const [updated,setUpdated] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const [refresh,setRefresh] = useState(0);
  const locations:Record<string,{lat:number;lon:number;city:string;capacity:number}>={"Solar Park East":{lat:42.6977,lon:23.3219,city:"София",capacity:.5},"Logistics Hub Plovdiv":{lat:42.1354,lon:24.7453,city:"Пловдив",capacity:.22},"Factory Varna":{lat:43.2141,lon:27.9147,city:"Варна",capacity:.32}};
  const location=locations[site]||locations["Solar Park East"];
  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      setLoading(true); setError(false);
      try {
        const response=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunshine_duration,shortwave_radiation_sum&timezone=Europe%2FSofia&forecast_days=3`,{cache:"no-store"});
        if(!response.ok) throw new Error("forecast unavailable");
        const data=await response.json();
        if(cancelled) return;
        const forecast:ForecastDay[]=data.daily.time.map((date:string,i:number)=>({date,code:data.daily.weather_code[i],max:Math.round(data.daily.temperature_2m_max[i]),min:Math.round(data.daily.temperature_2m_min[i]),rain:Math.round(data.daily.precipitation_probability_max[i]),sunshine:Math.round(data.daily.sunshine_duration[i]/360)/10,radiation:data.daily.shortwave_radiation_sum[i],pv:Math.round((data.daily.shortwave_radiation_sum[i]/3.6)*location.capacity*0.82*100)/100}));
        setDays(forecast);
        setCurrent({temperature:Math.round(data.current.temperature_2m),cloud:Math.round(data.current.cloud_cover),code:data.current.weather_code});
        setUpdated(new Intl.DateTimeFormat("bg-BG",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}).format(new Date()));
      } catch { if(!cancelled){setError(true);setDays([]);} }
      finally { if(!cancelled)setLoading(false); }
    };
    void load();
    const timer=window.setInterval(load,30*60*1000);
    return()=>{cancelled=true;window.clearInterval(timer);};
  },[refresh,location.lat,location.lon,location.capacity]);
  const weather=(code:number)=>code===0?["☀","Ясно"]:code<=2?["🌤","Разкъсана облачност"]:code===3?["☁","Облачно"]:code<=48?["≋","Мъгла"]:code<=67?["☂","Дъжд"]:code<=77?["❄","Сняг"]:code<=82?["☔","Превалявания"]:["⚡","Буря"];
  const tomorrow=days[1]||days[0];
  const totalPv=days.reduce((sum,d)=>sum+d.pv,0);
  const recommendation=!tomorrow?"Очакване на актуална прогноза":tomorrow.radiation>20?"Освободи капацитет в BESS преди PV пика":tomorrow.rain>55?"Запази по-висок SOC за слаб PV ден":"Балансиран заряд по цена и PV прогноза";
  return <article className="card weather-logic"><PanelTitle eyebrow="ЖИВА ИНТЕГРАЦИЯ С ВРЕМЕТО" title="3-дневна прогноза за PV оптимизация" action={<div className="weather-source"><i className={error?"source-dot error":"source-dot"}/><span>{error?"Няма връзка":updated?`Open-Meteo · ${updated}`:"Свързване..."}</span><button onClick={()=>setRefresh(x=>x+1)} aria-label="Обнови прогнозата">↻</button></div>}/><div className="weather-logic-grid"><section className="forecast-days">{loading&&days.length===0&&[0,1,2].map(i=><div className="forecast-day loading" key={i}><span>Зареждане...</span></div>)}{error&&<div className="weather-error"><i>!</i><strong>Прогнозата временно не е достъпна</strong><button className="secondary-btn" onClick={()=>setRefresh(x=>x+1)}>Опитай отново</button></div>}{days.map((day,i)=>{const [icon,label]=weather(day.code);return <div className="forecast-day" key={day.date}><div><span>{i===0?"Днес":i===1?"Утре":"След 2 дни"}</span><small>{new Intl.DateTimeFormat("bg-BG",{weekday:"short",day:"2-digit",month:"2-digit"}).format(new Date(`${day.date}T12:00:00`))}</small></div><i>{icon}</i><strong>{day.max}° <small>{day.min}°</small></strong><p>{label}</p><div className="weather-metrics"><span><b>☂ {day.rain}%</b><small>валеж</small></span><span><b>☀ {day.sunshine} h</b><small>слънце</small></span><span><b>{day.pv} MWh</b><small>PV прогноза</small></span></div><div className="solar-index"><i style={{width:`${Math.min(100,Math.round(day.radiation/28*100))}%`}}/></div></div>})}</section><aside className="forecast-impact"><div className="current-weather"><i>{current?weather(current.code)[0]:"◌"}</i><span><small>Сега · {site} / {location.city}</small><strong>{current?`${current.temperature}°C · ${current.cloud}% облачност`:"Изчакване на данни"}</strong></span></div><p>ВЛИЯНИЕ ВЪРХУ EMS</p><div className="impact-kpis"><span><small>PV · следващи 3 дни</small><strong>{days.length?`${totalPv.toFixed(2)} MWh`:"—"}</strong></span><span><small>Прогноза за утре</small><strong>{tomorrow?`${tomorrow.pv.toFixed(2)} MWh · ${tomorrow.rain}% валеж`:"—"}</strong></span></div><div className="forecast-decision"><i>⌘</i><span><small>Препоръка за графика</small><strong>{recommendation}</strong></span></div><ul><li>PV прогнозата участва в day-ahead графика към търговеца.</li><li>SOC целта се коригира преди облачни и силно слънчеви дни.</li><li>Моделът използва {Math.round(location.capacity*1000)} kWp и PR 82%; обновява се на 30 мин.</li></ul><button className="primary-btn" disabled={!days.length} onClick={()=>notify("Прогнозата е приложена към оптимизационния хоризонт")}>Приложи към оптимизатора</button></aside></div><ForwardPlanner tomorrow={tomorrow} notify={notify}/></article>;
}

function ForwardPlanner({tomorrow,notify}:{tomorrow?:ForecastDay;notify:(v:string)=>void}) {
  const [solarThreshold,setSolarThreshold] = useState(65);
  const [reserveTarget,setReserveTarget] = useState(80);
  const [buyThreshold,setBuyThreshold] = useState(120);
  const [sellThreshold,setSellThreshold] = useState(205);
  const [gridCharge,setGridCharge] = useState(true);
  const solarIndex=tomorrow?Math.min(100,Math.round(tomorrow.radiation/28*100)):0;
  const lowSolar=Boolean(tomorrow&&solarIndex<solarThreshold);
  const effectiveReserve=lowSolar?reserveTarget:30;
  const plan=marketValues.map((price,hour)=>{if(!tomorrow)return"hold";if(lowSolar&&gridCharge&&price<=buyThreshold)return"grid";if(!lowSolar&&hour>=10&&hour<=15)return"solar";if(!lowSolar&&price>=sellThreshold)return"sell";return"hold";});
  const buyHours=plan.filter(x=>x==="grid").length;
  const estimatedGridEnergy=buyHours*.25;
  const estimatedCost=plan.reduce((sum,action,i)=>sum+(action==="grid"?marketValues[i]*.25:0),0);
  return <section className="forward-planner"><div className="planner-title"><div><p>DAY-AHEAD ПЛАНИРОВЧИК</p><h3>Логика за утрешния ден · 96 × 15 минути</h3><span>Планът се преизчислява при нова прогноза за време, PV, товар или IBEX цена.</span></div><div className={lowSolar?"planner-trigger on":"planner-trigger"}><i>{lowSolar?"!":"✓"}</i><span><small>Условие „слабо слънце“</small><strong>{tomorrow?`${solarIndex}% потенциал · праг ${solarThreshold}%`:"Изчакване на прогноза"}</strong></span></div></div><div className="planner-body"><div className="planner-settings"><ModeRange label="Праг за слабо слънце" value={solarThreshold} unit="%" min={20} max={95} onChange={setSolarThreshold}/><ModeRange label="SOC цел при слаб PV ден" value={reserveTarget} unit="%" min={50} max={95} onChange={setReserveTarget}/><ModeRange label="Купувай от мрежата под" value={buyThreshold} unit="лв./MWh" min={40} max={180} onChange={setBuyThreshold}/><ModeRange label="Продавай над" value={sellThreshold} unit="лв./MWh" min={150} max={300} onChange={setSellThreshold}/><div className="grid-charge-toggle"><span><strong>Зареждане от външната мрежа</strong><small>Само при слаб PV ден и цена под прага</small></span><button className={gridCharge?"toggle on":"toggle"} onClick={()=>setGridCharge(!gridCharge)} aria-label="Зареждане от външната мрежа"/></div></div><div className="planner-output"><div className="plan-summary"><span><small>PV утре</small><strong>{tomorrow?`${tomorrow.pv.toFixed(2)} MWh`:`—`}</strong></span><i>→</i><span><small>Минимална SOC цел</small><strong>{effectiveReserve}%</strong></span><i>→</i><span><small>Покупка от мрежата</small><strong>{lowSolar&&gridCharge?`${estimatedGridEnergy.toFixed(2)} MWh`:`Не е нужна`}</strong></span></div><div className="day-plan"><div className="plan-zero"/>{plan.map((action,hour)=><div className={`plan-hour ${action}`} key={hour} title={`${String(hour).padStart(2,"0")}:00 · ${marketValues[hour]} лв./MWh · ${action}`}><span style={{height:`${Math.max(10,marketValues[hour]*.22)}px`}}/><em>{hour%3===0?String(hour).padStart(2,"0"):""}</em></div>)}</div><div className="plan-legend"><span className="grid-key">Мрежов заряд</span><span className="solar-plan-key">PV заряд</span><span className="sell-key">Разряд / продажба</span><span className="hold-key">Задържане</span></div><div className={lowSolar?"planner-decision warning":"planner-decision"}><i>⌘</i><span><small>Генерирано решение</small><strong>{!tomorrow?"Изчакване на метеорологични данни":lowSolar?gridCharge&&buyHours>0?`Слаб PV ден: запази ${reserveTarget}% SOC и купи в ${buyHours} евтини часа.`:`Слаб PV ден: запази ${reserveTarget}% SOC без покупка от мрежата.`:`Добра PV прогноза: зареди от слънцето и допускай арбитраж над ${sellThreshold} лв./MWh.`}</strong></span><b>{lowSolar&&gridCharge?`≈ ${estimatedCost.toFixed(0)} лв.`:"Автоматично"}</b></div><button className="primary-btn" disabled={!tomorrow} onClick={()=>notify("Day-ahead логиката е записана и графикът е преизчислен")}>Запази логиката и преизчисли графика</button></div></div></section>;
}

function LogicSource({icon,title,value,state}:{icon:string;title:string;value:string;state:string}) { return <div className="logic-source"><i>{icon}</i><span><small>{title}</small><strong>{value}</strong><em>{state}</em></span></div>; }

function ModeRange({label,value,unit,min,max,onChange}:{label:string;value:number;unit:string;min:number;max:number;onChange:(value:number)=>void}) { return <label className="mode-range"><span>{label}<strong>{value} {unit}</strong></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/><small><b>{min}</b><b>{max}</b></small></label>; }

function Gateway({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const [tab,setTab] = useState("Архитектура");
  const [rs485,setRs485] = useState(4);
  const [siteLoad,setSiteLoad] = useState(720);
  const [contractLimit,setContractLimit] = useState(780);
  const [requestedCharge,setRequestedCharge] = useState(100);
  const [emsConnected,setEmsConnected] = useState(true);
  const headroom = Math.max(0,contractLimit-siteLoad);
  const appliedCharge = emsConnected ? Math.min(requestedCharge,headroom) : 0;
  const gatewayDevices = [
    ["PCS","Sinexcel","Modbus TCP · :3200","Heartbeat < 50 s","Онлайн"],
    ["BAU / BMS","261 kWh cabinet","RS485-1 · Modbus RTU","Лимити заряд/разряд","Онлайн"],
    ["PV","Huawei SmartLogger","Ethernet · Modbus TCP","Инвертори + електромери","Онлайн"],
    ["EV","Зарядни станции","RS485-2 / Ethernet","Мощностен лимит","Онлайн"],
    ["Meter","PCC електромер","RS485-3 · Modbus RTU","Обща мощност на обекта","Онлайн"],
    ["I/O","Shelly контролери","Ethernet · локална LAN","Управляеми товари","Онлайн"],
    ["CAN×2","Waveshare 2-CH CAN TO ETH","OT LAN · TCP/UDP","Две изолирани CAN шини","Предвиден"],
    ["RS485","Waveshare serial channel","OT LAN · TCP/UDP","Допълнителен serial transport","Предвиден"],
  ];
  const registerRows = [
    ["40001","site.active_power","kW ×10","Read","PCC meter","0-based → +1"],
    ["40100","bess.soc","% ×10","Read","BAU / BMS","валидирано качество"],
    ["40110","bess.charge_limit","kW ×10","Read","BAU / BMS","фабричен лимит"],
    ["40111","bess.discharge_limit","kW ×10","Read","BAU / BMS","фабричен лимит"],
    ["40200","ems.requested_power","kW ×10","Write","OpenRemote","унифициран знак"],
    ["40201","safe.applied_power","kW ×10","Read","Safety layer","след clamp"],
    ["40900","gateway.status","enum","Read","Local service","online / safe mode"],
  ];
  return <>
    <section className="gateway-hero card"><div className="gateway-ident"><i>⌗</i><div><p>GRIDEX EDGE GATEWAY</p><h2>Един IP. Една регистрова карта. Локална безопасност.</h2><span>Индустриален Modbus концентратор между OpenRemote и разнородния хардуер на обекта.</span></div></div><div className={emsConnected?"gateway-live":"gateway-live safe"}><span>{emsConnected?"EMS връзка активна":"SAFE MODE"}</span><strong>{emsConnected?"Локален контрол работи":"Зададената мощност е 0 kW"}</strong><small>{emsConnected?"Последна команда преди 8 сек.":"Устройствата остават в безопасно състояние"}</small></div></section>
    <section className="gateway-kpis"><div className="card"><span>RS485 портове</span><strong>{rs485}×</strong><small>галванично изолирани</small></div><div className="card"><span>Ethernet</span><strong>2× GbE</strong><small>OT LAN + EMS uplink</small></div><div className="card"><span>Watchdog</span><strong>Hardware</strong><small>автоматично възстановяване</small></div><div className="card"><span>PCS heartbeat</span><strong>35 s</strong><small>локално · рег. 5301</small></div></section>
    <div className="subnav gateway-tabs">{["Архитектура","Хардуерна платформа","Регистрова карта","Firmware и safety"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</div>
    {tab==="Архитектура"&&<><article className="card gateway-architecture"><PanelTitle eyebrow="ЮГ → EDGE → СЕВЕР" title="Комуникационна архитектура" action={<span className="pill green">● Локално автономна</span>}/><div className="gateway-flow"><div className="field-devices"><small>ПОЛЕВИ УСТРОЙСТВА</small>{gatewayDevices.map(d=><span key={d[1]}><i>{d[0]}</i><b>{d[1]}</b><em>{d[2]}</em></span>)}</div><b className="flow-arrow">→</b><div className="edge-stack"><small>EDGE КОНЦЕНТРАТОР</small><span><i>1</i><b>Device drivers</b><em>offset · sign · scale · byte order</em></span><span><i>2</i><b>Normalization</b><em>общ модел и quality flags</em></span><span><i>3</i><b>Local services</b><em>heartbeat · cache · timestamps</em></span><span className="safety-layer"><i>4</i><b>Safety envelope</b><em>BMS clamp · software fuse · fail-safe</em></span></div><b className="flow-arrow">→</b><div className="north-stack"><small>OPENREMOTE</small><div><i>OR</i><strong>Modbus TCP Agent</strong><span>Един IP · унифицирана карта</span></div><p><b>Strategy asset</b> пише желана мощност</p><p><b>Control asset</b> получава safe стойност</p></div></div></article><WaveshareTransport mode="path" lang={lang} notify={notify}/><section className="gateway-bottom"><article className="card engineering-rule"><PanelTitle eyebrow="НЕЗАОБИКОЛИМ ПРИНЦИП" title="Стратегията никога не пише директно към инвертора"/><div className="safety-chain"><span><i>1</i><b>Желана мощност</b><small>От арбитраж и график</small></span><em>→</em><span><i>2</i><b>BMS лимити</b><small>Реални, не предполагаеми</small></span><em>→</em><span><i>3</i><b>Software fuse</b><small>Отпусната мощност</small></span><em>→</em><span><i>4</i><b>PCS команда</b><small>Само safe стойност</small></span></div></article><article className="card driver-principle"><PanelTitle eyebrow="ДРАЙВЕР-СЛОЙ" title="Спецификата остава локално"/><ul><li>Положителен/отрицателен знак</li><li>Мащабиране ×10 / ×100</li><li>0-based PDU и +1 offset</li><li>Word и byte order</li><li>Quality и timeout логика</li></ul></article></section></>}
    {tab==="Хардуерна платформа"&&<section className="hardware-grid"><article className="card hardware-config"><PanelTitle eyebrow="БАЗОВА КОНФИГУРАЦИЯ" title="DIN-rail индустриален контролер"/><div className="hardware-unit"><div className="din-box"><span>GRIDEX</span><strong>EDGE 400</strong><small>24 VDC · DIN rail</small><div>{Array.from({length:rs485}).map((_,i)=><i key={i}>RS{i+1}</i>)}</div><em>LAN 1</em><em>LAN 2</em></div><div className="hardware-specs"><span><b>CPU</b> Radxa ROCK Pi E · RK3328</span><span><b>Мрежа</b> 2× Gigabit Ethernet</span><span><b>RAM / Flash</b> Индустриална microSD / eMMC вариант</span><span><b>Захранване</b> 12 VDC през защитен DC/DC модул</span><span><b>Монтаж</b> DIN rail, индустриален корпус</span></div></div><label className="port-selector"><span>Брой независими RS485 сегменти<strong>{rs485} порта</strong></span><input type="range" min="2" max="6" step="2" value={rs485} onChange={e=>setRs485(Number(e.target.value))}/><small>Всеки порт е галванично изолиран и може да работи с различна скорост, parity и timeout.</small></label></article><article className="card interface-card"><PanelTitle eyebrow="ЗАДЪЛЖИТЕЛНИ ХАРДУЕРНИ ФУНКЦИИ" title="Интерфейси и надеждност"/><div className="interface-list"><span><i>↔</i><b>2–4× изолиран RS485</b><small>Отделяне на BMS, електромери, EV и проблемни шини</small></span><span><i>⌁</i><b>2× Ethernet</b><small>LAN 1: изолирана OT мрежа · LAN 2: EMS/VPN uplink</small></span><span><i>⟳</i><b>Hardware watchdog</b><small>Рестарт при блокирал процес или комуникационен стек</small></span><span><i>⚡</i><b>Захранване и защита</b><small>DC/DC, reverse polarity, surge и brownout recovery</small></span><span><i>◷</i><b>RTC и локален буфер</b><small>Точни timestamp-и и store-and-forward при прекъсване</small></span></div><button className="primary-btn" onClick={()=>notify(`Хардуерният профил с ${rs485} RS485 порта е записан`)}>Запази хардуерния профил</button></article><WaveshareTransport mode="spec" lang={lang} notify={notify}/></section>}
    {tab==="Регистрова карта"&&<><article className="card table-card register-table"><PanelTitle eyebrow="ПРИМЕРНА КАРТА · ЗА УТВЪРЖДАВАНЕ" title="Унифициран Modbus TCP интерфейс към OpenRemote" action={<button className="secondary-btn" onClick={()=>notify("Шаблонът на регистровата карта е подготвен")}>Експорт на шаблон</button>}/><DataTable headers={["Регистър","Канонично име","Формат","Достъп","Източник","Нормализация"]} rows={registerRows}/></article><div className="register-note"><i>!</i><span><strong>Адресите са визуален работен шаблон, не финална спецификация.</strong><small>Финалната карта ще се заключи след получаване на Sinexcel PCS, BAU/BMS, Huawei SmartLogger и northbound спецификациите.</small></span></div></>}
    {tab==="Firmware и safety"&&<><section className="firmware-grid"><article className="card firmware-layers"><PanelTitle eyebrow="FIRMWARE АРХИТЕКТУРА" title="Слоеве с ясна отговорност"/><div><span><i>04</i><b>Northbound Modbus TCP / MQTT</b><small>Унифицирана карта, quality flags, timestamps</small></span><span><i>03</i><b>Safety & command arbiter</b><small>BMS envelope, software fuse, slew/ramp limits</small></span><span><i>02</i><b>Normalization core</b><small>Канонични единици, знак, scale, offset, byte order</small></span><span><i>01</i><b>Device drivers</b><small>Sinexcel, BAU/BMS, Huawei, ai-republic protocol references</small></span><span><i>00</i><b>HAL & transport adapters</b><small>RS485 · TCP/UDP · Waveshare 13-byte CAN frames · watchdog</small></span></div></article><article className="card state-machine"><PanelTitle eyebrow="STATE MACHINE" title="Първо комуникация, после мощност"/><div><span className="done">Boot</span><i>→</i><span className="done">Comms OK</span><i>→</i><span className="done">BMS limits valid</span><i>→</i><span className={emsConnected?"active":""}>{emsConnected?"Ready":"Safe mode"}</span></div><ul><li>Без валидни BMS лимити няма enable.</li><li>Heartbeat към PCS се поддържа локално.</li><li>Загуба на EMS връзка → setpoint 0 kW.</li><li>Waveshare е transport, не safety controller.</li></ul><button className={emsConnected?"secondary-btn danger":"primary-btn"} onClick={()=>setEmsConnected(!emsConnected)}>{emsConnected?"Симулирай загуба на EMS":"Възстанови EMS връзката"}</button></article></section><article className="card fuse-simulator"><PanelTitle eyebrow="ЛОКАЛЕН SOFTWARE FUSE" title="Клампване спрямо отпуснатата мощност" action={<span className={appliedCharge===requestedCharge?"pill green":"pill amber-pill"}>{appliedCharge===requestedCharge?"Без ограничение":"Командата е ограничена"}</span>}/><div className="fuse-grid"><ModeRange label="Текущ товар на обекта" value={siteLoad} unit="kW" min={300} max={900} onChange={setSiteLoad}/><ModeRange label="Отпусната мощност" value={contractLimit} unit="kW" min={500} max={1000} onChange={setContractLimit}/><ModeRange label="Заявено зареждане BESS" value={requestedCharge} unit="kW" min={0} max={300} onChange={setRequestedCharge}/><div className="fuse-result"><span><small>Свободен капацитет</small><strong>{headroom} kW</strong></span><i>→</i><span><small>Приложена команда</small><strong>{appliedCharge} kW</strong></span><p>{!emsConnected?"EMS връзката липсва — fail-safe нулира командата.":appliedCharge<requestedCharge?`Заявката е клампната от ${requestedCharge} на ${appliedCharge} kW.`:"Командата е в безопасния envelope."}</p></div></div></article></>}
  </>;
}

function WaveshareTransport({mode,lang,notify}:{mode:"path"|"spec";lang:UiLanguage;notify:(v:string)=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  if(mode==="path") return <article className="card waveshare-path" data-no-translate>
    <div className="waveshare-path-head"><div><p>{t("ДОПЪЛНИТЕЛЕН OT TRANSPORT","ADDITIONAL OT TRANSPORT")}</p><h2>Waveshare 2-CH CAN TO ETH</h2><span>{t("Две изолирани CAN шини и един RS485 канал се пренасят по вътрешната Ethernet мрежа до ROCK Pi E.","Two isolated CAN buses and one RS485 channel are transported over the internal Ethernet network to ROCK Pi E.")}</span></div><a href="https://www.waveshare.com/2-ch-can-to-eth.htm" target="_blank" rel="noreferrer">Waveshare ↗</a></div>
    <div className="waveshare-flow"><span><i>CAN 1</i><b>{t("BMS / батерия","BMS / battery")}</b></span><span><i>CAN 2</i><b>{t("Инвертор / PCS","Inverter / PCS")}</b></span><span><i>485</i><b>{t("Serial устройство","Serial device")}</b></span><em>→</em><strong><small>WAVESHARE</small>TCP / UDP</strong><em>→</em><strong><small>ROCK Pi E · LAN 1</small>{t("13-byte frame parser","13-byte frame parser")}</strong><em>→</em><strong><small>GRIDEX EDGE</small>{t("Драйвер + safety","Driver + safety")}</strong></div>
    <div className="transport-rule"><i>!</i><span><strong>{t("Не се свързва директно към интернет или OpenRemote.","It is not connected directly to the internet or OpenRemote.")}</strong><small>{t("Устройството е прозрачен transport шлюз в изолираната OT LAN. ROCK Pi E извършва декодиране, timestamps, quality, timeout, BMS envelope и safe-state.","The device is a transparent transport gateway on the isolated OT LAN. ROCK Pi E handles decoding, timestamps, quality, timeouts, the BMS envelope and safe state.")}</small></span></div>
  </article>;
  return <article className="card waveshare-spec" data-no-translate>
    <div className="waveshare-product"><div className="waveshare-product-mark"><small>WAVESHARE</small><strong>2-CH</strong><span>CAN → ETH</span></div><div><p>{t("ИЗБРАН РАЗШИРИТЕЛЕН ШЛЮЗ","SELECTED EXPANSION GATEWAY")}</p><h2>2-CH CAN TO ETH</h2><span>{t("Индустриален прозрачен шлюз за CAN/RS485 устройства към вътрешната мрежа на GrideX Edge.","Industrial transparent gateway for CAN/RS485 devices on the internal GrideX Edge network.")}</span></div><a href="https://www.waveshare.com/wiki/2-CH-CAN-TO-ETH" target="_blank" rel="noreferrer">{t("Техническо ръководство ↗","Technical manual ↗")}</a></div>
    <div className="waveshare-spec-grid"><span><small>CAN</small><strong>2 × CAN 2.0B</strong><em>10 kbps–1 Mbps · 8,000 frames/s/channel</em></span><span><small>Serial</small><strong>1 × RS485</strong><em>600 bps–115.2 kbps</em></span><span><small>Ethernet</small><strong>10/100 Mbps RJ45</strong><em>Auto-MDI/MDIX · 1.5 kV isolation</em></span><span><small>{t("Захранване","Power")}</small><strong>DC 5–36 V</strong><em>Surge protection · −40…+85°C</em></span><span><small>{t("Режими","Modes")}</small><strong>TCP / UDP</strong><em>Client · Server · static IP / DHCP</em></span><span><small>{t("Физическа защита","Bus protection")}</small><strong>CAN isolation</strong><em>120 Ω termination switch</em></span></div>
    <div className="can-frame-map"><div><p>{t("CAN ↔ ETHERNET КАДЪР","CAN ↔ ETHERNET FRAME")}</p><h3>{t("Фиксирана 13-byte структура","Fixed 13-byte structure")}</h3></div><span><b>Byte 0</b><small>{t("Frame control + DLC","Frame control + DLC")}</small></span><span><b>Bytes 1–4</b><small>{t("CAN ID · 4 bytes","CAN ID · 4 bytes")}</small></span><span><b>Bytes 5–12</b><small>{t("До 8 data bytes · zero padding","Up to 8 data bytes · zero padding")}</small></span><em>&lt;20 ms {t("средно закъснение","average latency")}</em></div>
    <div className="waveshare-actions"><span><i>✓</i><b>{t("Статичен IP само в OT subnet","Static IP only on the OT subnet")}</b></span><span><i>✓</i><b>{t("Смяна на фабричните admin данни","Change factory admin credentials")}</b></span><span><i>✓</i><b>{t("Отделни CAN1/CAN2 queues и health metrics","Separate CAN1/CAN2 queues and health metrics")}</b></span><span><i>✓</i><b>{t("Reconnect, buffering и frame validation в ROCK Pi E","Reconnect, buffering and frame validation on ROCK Pi E")}</b></span><button onClick={()=>notify(t("Waveshare transport профилът е добавен към Edge конфигурацията","Waveshare transport profile added to the Edge configuration"))}>{t("Добави към конфигурацията","Add to configuration")}</button></div>
  </article>;
}

function Devices({notify}:{notify:(v:string)=>void}) {
  const [tab,setTab] = useState("Устройства");
  const [connectorStatus,setConnectorStatus] = useState(["Активен","Активен","Конфигуриране","Наличен"]);
  const devices = [["PV инвертор 01","Deye SUN-50K-SG01HP3","Modbus TCP","Онлайн","48.6 kW","8 сек."],["PV инвертор 02","Sungrow SG125CX-P2","Modbus TCP","Онлайн","72.4 kW","6 сек."],["PV инвертор 03","Huawei SUN2000-100KTL","Modbus TCP","Онлайн","68.8 kW","7 сек."],["PV инвертор 04","Growatt MAX 125KTL3-X","Modbus RTU","Онлайн","58.8 kW","9 сек."],["BESS PCS","TESVOLT TPS-E","Modbus TCP","Онлайн","+41.1 kW","7 сек."],["BMS Controller","Deye BOS-G","CAN / TCP","Онлайн","72% SOC","7 сек."],["Grid meter","Janitza UMG 604","Modbus TCP","Онлайн","−83.2 kW","5 сек."],["Load meter","Schneider PM8000","Modbus TCP","Онлайн","124.3 kW","5 сек."],["EV charger 01","ABB Terra AC","OCPP 1.6","Онлайн","11.0 kW","12 сек."],["EV charger 02","Wallbox Commander","OCPP 1.6","Онлайн","22.0 kW","10 сек."],["Weather station","Kipp & Zonen","RS-485","Внимание","844 W/m²","2 мин."],["Protection relay","Siemens 7SJ82","IEC 61850","Онлайн","Нормално","6 сек."]];
  const metrics = [["active_power","Активна мощност","PV инвертор 01","kW","Изход","48.6","8 сек."],["daily_yield","Енергия днес","PV инвертор 01","kWh","Изход","286.4","8 сек."],["soc","Състояние на заряд","BMS Controller","%","Двупосочна","72.0","7 сек."],["charge_limit","Лимит заряд","BESS PCS","kW","Команда","450","7 сек."],["grid_power","Поток към мрежата","Grid meter","kW","Двупосочна","−83.2","5 сек."],["ev_power_limit","EV мощностен лимит","EV парк","kW","Команда","32.0","12 сек."]];
  const connectors = [["Deye Cloud + Modbus","Инвертори / BMS","Telemetry + control","Активен"],["Sungrow iSolarCloud","Инвертори / BESS","Telemetry + control","Активен"],["Huawei FusionSolar","Инвертори / BESS","Telemetry","Конфигуриране"],["Growatt ShineServer","Инвертори / BESS","Telemetry + control","Наличен"]];
  const advanceConnector=(i:number)=>setConnectorStatus(s=>s.map((x,n)=>n===i?(x==="Наличен"?"Инсталиран":x==="Инсталиран"?"Конфигуриране":x==="Конфигуриране"?"Тест успешен":"Активен"):x));
  return <><div className="device-toolbar"><div className="searchbox">⌕ <input aria-label="Търсене на устройство" placeholder="Търсене на устройство..."/></div><button className="secondary-btn" onClick={()=>notify("Сканирането откри 2 нови устройства")}>↻ Открий устройства</button><button className="primary-btn" onClick={()=>notify("Каталогът е отворен")}>+ Добави устройство</button></div><div className="subnav">{["Устройства","Метрични точки","Конектори"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</div>{tab==="Устройства"&&<><section className="kpis compact-kpis"><Metric label="Устройства" value="12" unit="общо" badge="" type="charge"/><Metric label="Онлайн" value="11" unit="активни" badge="91.7%" type="spark solar-spark"/><Metric label="Комуникация" value="98.6" unit="%" badge="стабилна" type="spark load-spark"/><Metric label="Последна команда" value="14:31" unit="ч." badge="изпълнена" type="price"/></section><article className="card table-card devices-table"><PanelTitle eyebrow="SCADA / КОМУНИКАЦИЯ" title="Всички устройства"/><DataTable headers={["Устройство","Модел","Протокол","Статус","Последни данни","Обновено"]} rows={devices}/></article></>}{tab==="Метрични точки"&&<article className="card table-card metric-table"><PanelTitle eyebrow="ЕДИНЕН МОДЕЛ НА ДАННИТЕ" title="Метрични точки и права за команда" action={<button className="primary-btn" onClick={()=>notify("Метричните точки са синхронизирани")}>Синхронизирай</button>}/><DataTable headers={["ID","Име","Източник","Единица","Посока","Стойност","Обновено"]} rows={metrics}/><div className="mapping-note"><i>↔</i><span><strong>Нормализация на данните</strong><small>Различните марки се превеждат към общи EMS точки. Командните точки се активират само след проверка на права и безопасни граници.</small></span></div></article>}{tab==="Конектори"&&<section className="connector-grid">{connectors.map((c,i)=><article className="card connector-card" key={c[0]}><div className="connector-icon">{c[0].slice(0,2).toUpperCase()}</div><span className={`connector-state s${connectorStatus[i].replace(" ","")}`}>{connectorStatus[i]}</span><h2>{c[0]}</h2><p>{c[1]}</p><div><span>Възможности</span><strong>{c[2]}</strong></div><div className="connector-steps"><i className={connectorStatus[i]!=="Наличен"?"done":""}>1</i><b/><i className={["Конфигуриране","Тест успешен","Активен"].includes(connectorStatus[i])?"done":""}>2</i><b/><i className={["Тест успешен","Активен"].includes(connectorStatus[i])?"done":""}>3</i><b/><i className={connectorStatus[i]==="Активен"?"done":""}>4</i></div><small>Инсталиране · Настройка · Тест · Активиране</small><button className="secondary-btn" onClick={()=>{advanceConnector(i);notify(connectorStatus[i]==="Активен"?"Конекторът е наблюдаван в реално време":"Преминахте към следващата стъпка");}}>{connectorStatus[i]==="Активен"?"Мониторинг":"Продължи настройката"}</button></article>)}</section>}</>;
}

function Alarms({notify}:{notify:(v:string)=>void}) {
  const [filter,setFilter]=useState("Всички"); const [builder,setBuilder]=useState(false); const [threshold,setThreshold]=useState(65); const [duration,setDuration]=useState(5); const [channel,setChannel]=useState("Push + Email"); const alarms=[["Критична","Office Center Sofia","Gateway няма връзка","Данните не са обновявани от 24 мин.","14:08"],["Внимание","Retail Park Burgas","Висока температура на инвертор","Температура 67.4°C · лимит 65°C","13:52"],["Внимание","Solar Park East","Метеостанция: забавени данни","Последна телеметрия преди 2 мин.","13:47"],["Информация","Factory Varna","Графикът е актуализиран","Автоматична корекция спрямо PV прогноза","13:32"],["Информация","Logistics Hub Plovdiv","SOC цел е достигната","Батерията преминава в режим готовност","12:58"]];
  const shown=filter==="Всички"?alarms:alarms.filter(a=>a[0]===filter);
  return <><div className="alarm-tabs">{["Всички","Критична","Внимание","Информация"].map(x=><button className={filter===x?"active":""} key={x} onClick={()=>setFilter(x)}>{x}</button>)}<button className="secondary-btn" onClick={()=>setBuilder(!builder)}>{builder?"Затвори":"+ Ново правило"}</button></div>{builder&&<article className="card alarm-builder"><PanelTitle eyebrow="НОВО АЛАРМЕНО ПРАВИЛО" title="Метрика → условие → известяване"/><div className="builder-grid"><label><span>Метрична точка</span><select><option>Температура на инвертор</option><option>Загуба на комуникация</option><option>SOC на батерия</option><option>Мощност към мрежата</option></select></label><label><span>Условие</span><select><option>По-голямо от</option><option>По-малко от</option><option>Няма данни</option></select></label><label><span>Праг</span><input type="number" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label><label><span>За период</span><div className="input-unit"><input type="number" value={duration} onChange={e=>setDuration(Number(e.target.value))}/><b>мин.</b></div></label><label><span>Обхват</span><select><option>Всички PV инвертори</option><option>Solar Park East</option><option>Цялото портфолио</option></select></label><label><span>Канал</span><select value={channel} onChange={e=>setChannel(e.target.value)}><option>Push + Email</option><option>Inbox</option><option>Webhook</option><option>SMS</option></select></label></div><div className="rule-preview"><i>△</i><span><strong>Предварителен преглед</strong><small>Ако температурата е над {threshold}°C за {duration} мин., извести чрез {channel}. Повторение след 30 мин.</small></span><button className="primary-btn" onClick={()=>{notify("Аларменото правило е активно");setBuilder(false)}}>Запази и активирай</button></div></article>}<article className="card alarm-list">{shown.map((a,i)=><div className="alarm-row" key={a[2]}><i className={`severity s${a[0]}`}>{a[0]==="Критична"?"!":a[0]==="Внимание"?"△":"i"}</i><div><span className={`severity-label s${a[0]}`}>{a[0]}</span><h3>{a[2]}</h3><p>{a[1]} · {a[3]}</p></div><time>{a[4]}</time><button onClick={()=>notify(`Алармата е потвърдена`)}>{i<3?"Потвърди":"Отвори"}</button></div>)}</article></>;
}

function ReportsCenter({notify,lang,batteryCost}:{notify:(v:string)=>void;lang:UiLanguage;batteryCost:BatteryCostSettings}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"energy"|"battery"|"pv"|"ev">("energy");
  const depBase=batteryCost.capex*(1-batteryCost.residual/100);
  const depToday=(depBase/Math.max(1,batteryCost.warrantedCycles))*batteryCost.todayCycles;
  const reportRows={
    energy:[[t("Купена енергия","Imported energy"),"18.42 MWh","229.40 BGN/MWh","4 225.55 BGN"],[t("Използвана PV енергия","Self-consumed PV"),"24.68 MWh","78.4%","+3 841.20 BGN"],[t("Продадена енергия","Exported energy"),"26.81 MWh","207.80 BGN/MWh","+5 571.12 BGN"],[t("Прогнозен небаланс","Forecast imbalance"),"0.84 MWh","−18.42 BGN/MWh","−15.47 BGN"]],
    battery:[[t("Енергия за зареждане","Charging input"),"31.84 MWh","8.1% loss","5 168.40 BGN"],[t("Енергия при разреждане","Discharged energy"),"28.62 MWh","7.4% loss","+6 432.10 BGN"],[t("Собствена консумация","Self-consumption"),"16.42 MWh","11.8% loss","+2 184.60 BGN"],[t("ДМА днес","Depreciation today"),`${batteryCost.todayCycles.toFixed(2)} FEC`,`${depToday.toFixed(2)} BGN`,t("Включено в резултата","Included in result")]],
    pv:[[t("Производство","Generation"),"34.26 MWh","94.2% forecast","—"],[t("Собствено потребление","Self-consumption"),"24.68 MWh","72.0%","+3 841.20 BGN"],[t("Ограничено при отрицателна цена","Curtailed at negative price"),"1.18 MWh","7 intervals","+286.44 BGN"],[t("Продадено","Exported"),"8.40 MWh","205.12 BGN/MWh","+1 723.01 BGN"]],
    ev:[[t("Продадена енергия EV","EV energy sold"),"4.82 MWh","684 sessions","+4 318.40 BGN"],[t("Разход за зареждане","Charging cost"),"4.96 MWh","241.60 BGN/MWh","−1 198.34 BGN"],[t("PV дял","PV share"),"2.18 MWh","45.2%","+322.18 BGN"],[t("Нетен EV резултат","Net EV result"),"—","—","+3 120.06 BGN"]],
  };
  const headers={energy:[t("Показател","Metric"),t("Количество","Quantity"),t("Средна цена / дял","Average price / share"),t("Резултат","Result")],battery:[t("Поток","Flow"),t("Количество","Quantity"),t("Загуби / ДМА","Losses / depreciation"),t("Стойност","Value")],pv:[t("Показател","Metric"),t("Количество","Quantity"),t("Качество / дял","Quality / share"),t("Резултат","Result")],ev:[t("Показател","Metric"),t("Количество","Quantity"),t("Цена / сесии","Price / sessions"),t("Резултат","Result")]};
  return <div className="reports-page" data-no-translate><section className="reports-head card"><div><p>{t("ПРОВЕРИМА ИКОНОМИКА ПО АКТИВ","AUDITABLE ECONOMICS BY ASSET")}</p><h2>{t("Енергия, загуби, спестявания и очаквана фактура","Energy, losses, savings and expected invoice")}</h2><span>{t("Всеки резултат е проследим до измерване, пазарна цена, тарифа, команда и използван оптимизационен режим.","Every result is traceable to a meter reading, market price, tariff, command and optimisation mode.")}</span></div><div><button className="secondary-btn" onClick={()=>notify(t("CSV отчетът е подготвен","CSV report prepared"))}>CSV ↓</button><button className="primary-btn" onClick={()=>notify(t("Месечният PDF отчет е подготвен","Monthly PDF report prepared"))}>PDF ↓</button></div></section><section className="report-kpis"><article className="card"><small>{t("НЕТЕН РЕЗУЛТАТ","NET RESULT")}</small><strong className="positive">+8 432 BGN</strong><span>↑ 18.4%</span></article><article className="card"><small>{t("СПЕСТЕНО ОТ ОПТИМИЗАЦИЯ","OPTIMISATION SAVINGS")}</small><strong>2 846 BGN</strong><span>PV + BESS + Loads</span></article><article className="card"><small>{t("РАЗХОД ЗА НЕБАЛАНС","IMBALANCE COST")}</small><strong>−184 BGN</strong><span>−32% vs baseline</span></article><article className="card"><small>{t("ПРОГНОЗНА ФАКТУРА","EXPECTED INVOICE")}</small><strong>4 918 BGN</strong><span>{t("с ДДС и мрежови такси","incl. VAT & network fees")}</span></article></section><div className="subnav report-tabs">{[["energy",t("Електроенергия","Energy")],["battery",t("Батерия","Battery")],["pv","PV"],["ev",t("EV и товари","EV & loads")]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0] as typeof tab)}>{x[1]}</button>)}</div><article className="card report-table"><PanelTitle eyebrow={t("МЕСЕЧЕН ОТЧЕТ · АВГУСТ 2026","MONTHLY REPORT · AUGUST 2026")} title={t("Разбивка по измерени потоци","Measured-flow breakdown")} action={<span className="pill green">● {t("Данните са сверени","Data reconciled")}</span>}/><DataTable headers={headers[tab]} rows={reportRows[tab]}/></article><section className="report-bottom"><article className="card savings-waterfall"><PanelTitle eyebrow={t("ОТ БАЗОВ РЕЖИМ ДО РЕЗУЛТАТ","FROM BASELINE TO RESULT")} title={t("Източници на добавена стойност","Value contribution")}/><div>{[[t("Базова сметка","Baseline bill"),4918,"base"],["PV",1842,"green"],["BESS",864,"green"],[t("Гъвкави товари","Flexible loads"),286,"green"],[t("Небаланс","Imbalance"),-184,"amber"],[t("ДМА","Depreciation"),-Math.round(depToday*30.44),"amber"]].map(x=><span key={x[0]}><i className={String(x[2])} style={{height:`${Math.max(12,Math.abs(Number(x[1]))/32)}px`}}/><b>{x[0]}</b><em>{Number(x[1])>0?"+":""}{x[1]} BGN</em></span>)}</div></article><article className="card report-delivery"><PanelTitle eyebrow={t("АВТОМАТИЧНО ДОСТАВЯНЕ","AUTOMATED DELIVERY")} title={t("Месечен управленски пакет","Monthly management pack")}/><Check text={t("Енергия и прогнозна фактура","Energy and expected invoice")}/><Check text={t("PV, BESS, EV и товари","PV, BESS, EV and loads")}/><Check text={t("График спрямо измерване и небаланс","Schedule versus metering and imbalance")}/><Check text={t("Команди, аларми и SLA","Commands, alarms and SLA")}/><button className="primary-btn" onClick={()=>notify(t("Автоматичният месечен отчет е активиран","Automated monthly report enabled"))}>{t("Активирай изпращане","Enable delivery")}</button></article></section></div>;
}

function SettingsHub({notify,lang,batteryCost,setBatteryCost}:{notify:(v:string)=>void;lang:UiLanguage;batteryCost:BatteryCostSettings;setBatteryCost:React.Dispatch<React.SetStateAction<BatteryCostSettings>>}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"site"|"pv"|"bess"|"ev"|"notify">("site");
  const [weatherWeight,setWeatherWeight]=useState(72);
  const [bias,setBias]=useState(-8);
  const [learningDays,setLearningDays]=useState(45);
  const [lossDays,setLossDays]=useState(30);
  const [negativeStop,setNegativeStop]=useState(true);
  const [gridCharge,setGridCharge]=useState(true);
  const [gridDischarge,setGridDischarge]=useState(true);
  const [exportLimit,setExportLimit]=useState(450);
  const [evMargin,setEvMargin]=useState(180);
  const [evMin,setEvMin]=useState(420);
  const [evHorizon,setEvHorizon]=useState(3);
  const [notifyEmail,setNotifyEmail]=useState("energy.manager@client.bg");
  const tabs:[[typeof tab,string],...Array<[typeof tab,string]>]=[["site",t("Обект и пазар","Site & market")],["pv",t("PV и прогноза","PV & forecast")],["bess","BESS"],["ev",t("EV тарифи","EV tariffs")],["notify",t("Известия","Notifications")]];
  return <div className="settings-hub" data-no-translate><section className="settings-overview card"><div><p>{t("ЕДНА КОНФИГУРАЦИЯ ЗА ЦЯЛАТА EMS","ONE CONFIGURATION FOR THE ENTIRE EMS")}</p><h2>{t("Договорни, прогнозни и технически ограничения","Contractual, forecast and technical constraints")}</h2><span>{t("Пазарната стратегия използва само валидирани настройки. Safety границите от BMS и Edge никога не могат да бъдат заобиколени.","The market strategy uses validated settings only. BMS and Edge safety boundaries can never be bypassed.")}</span></div><span className="settings-health"><i>✓</i><b>42 / 42</b><small>{t("валидирани полета","validated fields")}</small></span></section><div className="subnav settings-tabs">{tabs.map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0])}>{x[1]}</button>)}</div>
  {tab==="site"&&<section className="settings-two"><article className="card config-card"><PanelTitle eyebrow={t("ОБЕКТ И ИЗМЕРВАНЕ","SITE & METERING")} title="Solar Park East"/><div className="config-form"><label><span>{t("Държава / пазар","Country / market")}</span><select><option>Bulgaria · IBEX</option></select></label><label><span>{t("Часова зона","Time zone")}</span><select><option>Europe/Sofia · UTC+2/+3</option></select></label><label><span>{t("Пазарен интервал","Market interval")}</span><select><option>15 min</option><option>60 min</option></select></label><label><span>{t("Резервна средна консумация","Fallback average load")}</span><div className="input-unit"><input defaultValue="124"/><b>kW</b></div></label><label><span>{t("Продажба по договор","Export agreement")}</span><select><option>{t("Да · валидиран","Yes · validated")}</option></select></label><label><span>{t("Регулиран пазар за покупка","Regulated import market")}</span><select><option>{t("Не","No")}</option><option>{t("Да","Yes")}</option></select></label></div></article><article className="card trader-card"><PanelTitle eyebrow={t("ГРАФИК КЪМ ТЪРГОВЕЦ","TRADER SCHEDULE")} title={t("Автоматична доставка до 11:30","Automatic delivery by 11:30")}/><div><span><small>{t("Получател","Recipient")}</small><strong>schedule@energy-trader.bg</strong></span><span><small>{t("Код покупка","Import code")}</small><strong>BG-GX-IMP-0142</strong></span><span><small>{t("Код продажба","Export code")}</small><strong>BG-GX-EXP-0142</strong></span><span><small>{t("Формат","Format")}</small><strong>CSV · 96 × 15 min</strong></span></div><Check text={t("Последният график е приет","Latest schedule accepted")}/><button className="primary-btn" onClick={()=>notify(t("Тестовият график е изпратен","Test schedule sent"))}>{t("Изпрати тест","Send test")}</button></article></section>}
  {tab==="pv"&&<section className="settings-two"><article className="card config-card"><PanelTitle eyebrow={t("КАЛИБРАЦИЯ НА ПРОГНОЗАТА","FORECAST CALIBRATION")} title={t("Време срещу реално производство","Weather versus actual generation")}/><ModeRange label={t("Тежест на прогнозата за времето","Weather forecast weight")} value={weatherWeight} unit="%" min={0} max={100} onChange={setWeatherWeight}/><ModeRange label={t("Консервативна корекция","Conservative bias")} value={bias} unit="%" min={-30} max={20} onChange={setBias}/><ModeRange label={t("Период за самообучение","Self-learning period")} value={learningDays} unit={t("дни","days")} min={7} max={180} onChange={setLearningDays}/><div className="forecast-calibration"><span><small>{t("Прогноза утре","Tomorrow forecast")}</small><strong>3.42 MWh</strong></span><b>→</b><span><small>{t("След корекция","After calibration")}</small><strong>{(3.42*(1+bias/100)).toFixed(2)} MWh</strong></span></div></article><article className="card config-card"><PanelTitle eyebrow={t("ОТРИЦАТЕЛНИ ЦЕНИ И ОГРАНИЧАВАНЕ","NEGATIVE PRICE & CURTAILMENT")} title={t("Не продавай на загуба","Do not export at a loss")}/><div className="switch-row"><span><strong>{t("Автоматично спиране на продажбата","Automatic export stop")}</strong><small>{t("Пълна цена след такси и комисионни","All-in price after fees and commissions")}</small></span><button className={negativeStop?"toggle on":"toggle"} onClick={()=>setNegativeStop(v=>!v)}/></div><div className="setting-row"><span>{t("Праг за спиране","Stop threshold")}</span><b>−18 BGN/MWh</b></div><div className="setting-row"><span>{t("Ръчен график за ограничаване","Manual curtailment schedule")}</span><b>{t("Разрешен","Enabled")}</b></div><div className="setting-row"><span>{t("Известяване","Notification")}</span><b>Push + Email</b></div><button className="primary-btn" onClick={()=>notify(t("PV настройките са записани","PV settings saved"))}>{t("Запази PV политиката","Save PV policy")}</button></article></section>}
  {tab==="bess"&&<section className="settings-two"><article className="card config-card"><PanelTitle eyebrow={t("РАЗРЕШЕНИЯ И ДОГОВОРНИ ЛИМИТИ","PERMISSIONS & CONTRACT LIMITS")} title={t("Мрежа, PV и батерия","Grid, PV and battery")}/><div className="switch-row"><span><strong>{t("Зареждане от мрежата","Grid charging")}</strong><small>{t("Разрешено по договор","Permitted by contract")}</small></span><button className={gridCharge?"toggle on":"toggle"} onClick={()=>setGridCharge(v=>!v)}/></div><div className="switch-row"><span><strong>{t("Разреждане към мрежата","Grid export")}</strong><small>{t("Разрешено по договор","Permitted by contract")}</small></span><button className={gridDischarge?"toggle on":"toggle"} onClick={()=>setGridDischarge(v=>!v)}/></div><ModeRange label={t("Максимално отдаване по договор","Contract export limit")} value={exportLimit} unit="kW" min={0} max={780} onChange={setExportLimit}/><div className="setting-row"><span>{t("Минимална скорост на разреждане","Minimum discharge power")}</span><b>32 kW</b></div><div className="setting-row"><span>{t("PV + BESS общ export guard","Combined PV + BESS export guard")}</span><b>90%</b></div></article><article className="card config-card"><PanelTitle eyebrow={t("САМООБУЧЕНИЕ НА ЗАГУБИТЕ","LOSS SELF-LEARNING")} title={t("Отделни модели по режим и мощност","Separate models by mode and power")}/><ModeRange label={t("Исторически период","Historical period")} value={lossDays} unit={t("дни","days")} min={7} max={180} onChange={setLossDays}/><div className="loss-models"><span><small>{t("Зареждане","Charging")}</small><strong>8.1%</strong><em>100–450 kW</em></span><span><small>{t("Разреждане","Discharging")}</small><strong>7.4%</strong><em>80–500 kW</em></span><span><small>{t("Самоконсумация","Self-consumption")}</small><strong>11.8%</strong><em>20–140 kW</em></span></div><div className="switch-row"><span><strong>{t("Включи ДМА в решенията","Include depreciation in decisions")}</strong><small>{batteryCost.included?t("Активно","Active"):t("Изключено","Disabled")}</small></span><button className={batteryCost.included?"toggle on":"toggle"} onClick={()=>setBatteryCost(v=>({...v,included:!v.included}))}/></div><button className="primary-btn" onClick={()=>notify(t("BESS политиката е записана","BESS policy saved"))}>{t("Запази BESS политиката","Save BESS policy")}</button></article></section>}
  {tab==="ev"&&<section className="settings-two"><article className="card config-card"><PanelTitle eyebrow={t("ДИНАМИЧНА EV ТАРИФА","DYNAMIC EV TARIFF")} title={t("Пазарна цена + гарантиран марж","Market price + guaranteed margin")}/><ModeRange label={t("Надбавка","Markup")} value={evMargin} unit="BGN/MWh" min={0} max={500} onChange={setEvMargin}/><ModeRange label={t("Минимална клиентска цена","Minimum customer price")} value={evMin} unit="BGN/MWh" min={100} max={900} onChange={setEvMin}/><ModeRange label={t("Хоризонт за максимална цена","Maximum-price horizon")} value={evHorizon} unit="h" min={1} max={8} onChange={setEvHorizon}/><div className="ev-price-result"><span><small>{t("IBEX + тарифи","IBEX + tariffs")}</small><strong>241.60</strong></span><b>+</b><span><small>{t("Надбавка","Markup")}</small><strong>{evMargin}</strong></span><b>=</b><span><small>{t("Клиентска цена","Customer price")}</small><strong>{Math.max(evMin,241.6+evMargin).toFixed(2)} BGN/MWh</strong></span></div></article><article className="card config-card"><PanelTitle eyebrow="EV POWER CONTROL" title={t("Мощност според свободния капацитет","Power from available site capacity")}/><div className="setting-row"><span>{t("Максимална мощност станция","Charger maximum power")}</span><b>132 kW</b></div><div className="setting-row"><span>Software fuse</span><b>180 kW</b></div><div className="setting-row"><span>{t("PV излишък в цената","PV surplus in tariff")}</span><b>{t("Да","Yes")}</b></div><div className="setting-row"><span>{t("Последно обновяване","Last update")}</span><b>14:31:08</b></div><button className="primary-btn" onClick={()=>notify(t("EV тарифата и мощностният лимит са обновени","EV tariff and power limit updated"))}>{t("Публикувай EV тарифа","Publish EV tariff")}</button></article></section>}
  {tab==="notify"&&<section className="settings-two"><article className="card config-card"><PanelTitle eyebrow={t("ПОЛУЧАТЕЛИ И КАНАЛИ","RECIPIENTS & CHANNELS")} title={t("Оперативни известия","Operational notifications")}/><label className="notify-email"><span>{t("Допълнителен получател","Additional recipient")}</span><input value={notifyEmail} onChange={e=>setNotifyEmail(e.target.value)}/></label><div className="notification-channels"><button className="active">Push</button><button className="active">Email</button><button>SMS</button><button>Webhook</button></div><div className="setting-row"><span>{t("Повторение при непотвърдена аларма","Repeat unacknowledged alarm")}</span><b>30 min</b></div><div className="setting-row"><span>{t("Месечен управленски отчет","Monthly management report")}</span><b>{t("1-во число · 08:00","1st day · 08:00")}</b></div></article><article className="card notification-matrix"><PanelTitle eyebrow={t("МАТРИЦА НА СЪБИТИЯТА","EVENT MATRIX")} title={t("Какво наблюдава системата","What the system monitors")}/>{[[t("Загуба на интернет / gateway","Internet / gateway loss"),"Critical"],[t("PV, BESS или EV не изпълнява команда","PV, BESS or EV command not executed"),"Critical"],[t("Температура, SOC или мрежов лимит","Temperature, SOC or grid limit"),"Warning"],[t("Необичайна консумация / забравен товар","Abnormal consumption / forgotten load"),"Warning"],[t("График, прогноза и месечен отчет","Schedule, forecast and monthly report"),"Info"]].map(x=><span key={x[0]}><i className={x[1]==="Critical"?"critical":x[1]==="Warning"?"warning":"info"}/><b>{x[0]}</b><small>{x[1]} · Push + Email</small></span>)}<button className="primary-btn" onClick={()=>notify(t("Настройките за известия са записани","Notification settings saved"))}>{t("Запази известията","Save notifications")}</button></article></section>}
  </div>;
}

function SubscriptionPlans({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [annual,setAnnual]=useState(true);
  const [selected,setSelected]=useState<"free"|"pro"|"enterprise">("enterprise");
  const plans=[
    {id:"free" as const,name:"GrideX Free",label:t("БЕЗПЛАТЕН ЗАВИНАГИ","FREE FOREVER"),price:t("0 лв.","BGN 0"),suffix:t("със SunStorage Pro 261","with SunStorage Pro 261"),description:t("Наблюдение, защита и основно управление на един обект.","Monitoring, protection and basic control for one site."),features:[t("1 обект и до 12 устройства","1 site and up to 12 devices"),t("Live PV, BESS, мрежа и товари","Live PV, BESS, grid and loads"),t("Edge failsafe и Software Fuse","Edge failsafe and Software Fuse"),t("Ръчни команди и базов график","Manual commands and basic schedule"),t("Аларми и 30 дни история","Alerts and 30-day history"),t("Дневна енергия, цикли и ДМА","Daily energy, cycles and depreciation")]},
    {id:"pro" as const,name:"GrideX Pro",label:t("АБОНАМЕНТ НА ОБЕКТ","SUBSCRIPTION PER SITE"),price:t("Месечен план","Monthly plan"),suffix:annual?t("2 месеца бонус при годишно плащане","2 months included with annual billing"):t("без дългосрочен договор","no long-term commitment"),description:t("Автоматична икономическа оптимизация на един енергиен обект.","Automated economic optimisation for one energy site."),features:[t("Всичко от Free","Everything in Free"),t("IBEX и пълна покупна/продажна цена","IBEX and all-in import/export price"),t("3-дневна прогноза за време, PV и товар","3-day weather, PV and load forecast"),t("AI режими и ценови арбитраж","AI modes and price arbitrage"),t("96 × 15 min график към търговеца","96 × 15 min trader schedule"),t("Разширени отчети, тарифи и сетълмент","Advanced reports, tariffs and settlement")]},
    {id:"enterprise" as const,name:"GrideX Enterprise",label:t("ИНДУСТРИАЛЕН АБОНАМЕНТ","INDUSTRIAL SUBSCRIPTION"),price:t("Индивидуална оферта","Custom quote"),suffix:t("според мощност, обекти и интеграции","by capacity, sites and integrations"),description:t("Индустриално управление, ERP интеграция и портфолио от обекти.","Industrial control, ERP integration and multi-site portfolio."),features:[t("Всичко от Pro","Everything in Pro"),t("ERP / MES / WMS входни сигнали","ERP / MES / WMS input signals"),t("Товар по поръчки, смени и партиди","Load by orders, shifts and batches"),t("Управляеми индустриални товари","Controllable industrial loads"),t("15-минутно балансиране и VPP","15-minute balancing and VPP"),t("Custom драйвери, API, SLA и audit log","Custom drivers, API, SLA and audit log")]},
  ];
  const rows=[
    [t("Live мониторинг и основни KPI","Live monitoring and core KPIs"),"✓","✓","✓"],
    [t("Edge защити, heartbeat и safe mode","Edge protection, heartbeat and safe mode"),"✓","✓","✓"],
    [t("Software Fuse и BMS ограничения","Software Fuse and BMS limits"),"✓","✓","✓"],
    [t("Дневен разход и ДМА на батерията","Daily battery cost and depreciation"),"✓","✓","✓"],
    [t("IBEX, 3-дневна прогноза и AI режими","IBEX, 3-day forecast and AI modes"),"—","✓","✓"],
    [t("Автоматичен график към търговец","Automated trader schedule"),"—","✓","✓"],
    [t("Тарифи, сетълмент и управленски отчети","Tariffs, settlement and management reports"),"—","✓","✓"],
    [t("ERP / MES прогнозно натоварване","ERP / MES load forecast"),"—","—","✓"],
    [t("Индустриални товари и термичен буфер","Industrial loads and thermal storage"),"—","—","✓"],
    [t("Балансиране, VPP и multi-site dispatch","Balancing, VPP and multi-site dispatch"),"—","—","✓"],
  ];
  return <div className="plans-page" data-no-translate>
    <section className="plans-hero card">
      <div><p>{t("ПРОЗРАЧНО РАЗДЕЛЕНИЕ НА ФУНКЦИИТЕ","TRANSPARENT FEATURE TIERS")}</p><h2>{t("Безплатна безопасност. Платена оптимизация. Индустриална интеграция.","Free safety. Paid optimisation. Industrial integration.")}</h2><span>{t("Критичните защити никога не зависят от абонамент. Платените планове добавят прогнози, автоматизация и измерима икономическа стойност.","Critical protection never depends on a subscription. Paid plans add forecasts, automation and measurable economic value.")}</span></div>
      <div className="billing-toggle"><button className={!annual?"active":""} onClick={()=>setAnnual(false)}>{t("Месечно","Monthly")}</button><button className={annual?"active":""} onClick={()=>setAnnual(true)}>{t("Годишно","Annual")} <em>−16%</em></button></div>
    </section>
    <div className="plan-safety">
      <i>✓</i><div><strong>{t("Защитите остават активни дори без абонамент","Protection remains active even without a subscription")}</strong><span>{t("Edge failsafe, BMS лимити, heartbeat, аварийно нулиране и Software Fuse са част от GrideX Free.","Edge failsafe, BMS limits, heartbeat, emergency zeroing and Software Fuse are part of GrideX Free.")}</span></div>
    </div>
    <section className="plan-grid">{plans.map(plan=><article className={`card plan-card ${plan.id==="pro"?"featured":""} ${selected===plan.id?"selected":""}`} key={plan.id}>
      {plan.id==="pro"&&<span className="recommended">{t("ПРЕПОРЪЧАН","RECOMMENDED")}</span>}
      <span className={`plan-chip ${plan.id}`}>{plan.label}</span><h3>{plan.name}</h3><p>{plan.description}</p>
      <div className="plan-price"><strong>{plan.price}</strong><small>{plan.suffix}</small></div>
      <ul>{plan.features.map(feature=><li key={feature}><i>✓</i>{feature}</li>)}</ul>
      <button className={plan.id==="pro"?"primary-btn":"secondary-btn"} onClick={()=>{setSelected(plan.id);notify(plan.id==="free"?t("GrideX Free е включен завинаги","GrideX Free is included forever"):t(`Избран е ${plan.name} за търговска оферта`,`${plan.name} selected for a commercial quote`));}}>{selected===plan.id?t("Текущ избор","Current selection"):plan.id==="free"?t("Включен","Included"):t("Избери план","Select plan")}</button>
    </article>)}</section>
    <article className="card plan-matrix">
      <PanelTitle eyebrow={t("СРАВНЕНИЕ НА ВЪЗМОЖНОСТИТЕ","CAPABILITY COMPARISON")} title={t("Какво получава клиентът във всеки план","What the customer receives in each plan")}/>
      <DataTable headers={[t("Функционалност","Capability"),"Free","Pro","Enterprise"]} rows={rows}/>
    </article>
    <section className="commercial-note card">
      <div><span className="plan-chip free">FREE FOREVER</span><h3>SunStorage Pro 261</h3><p>{t("Включва GrideX Free лиценз за целия живот на системата и безплатен електропроект. Няма такса за основното наблюдение и защитите.","Includes a lifetime GrideX Free licence and a complimentary electrical design. There is no fee for core monitoring and protection.")}</p></div>
      <div><span className="plan-chip enterprise">ENTERPRISE</span><h3>{t("ERP интеграцията е проектна услуга","ERP integration is a project service")}</h3><p>{t("Включва анализ на данните, mapping на поръчки към енергиен профил, API конектор, тестове и договорен SLA.","Includes data analysis, mapping orders to energy profiles, an API connector, testing and a contractual SLA.")}</p></div>
    </section>
  </div>;
}

function About({lang,notify}:{lang:UiLanguage;notify:(v:string)=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const included=[
    ["⌁",t("Драйвер и унифициран asset модел","Driver and unified asset model")],
    ["▦",t("Табла, телеметрия, аларми и отчети","Dashboards, telemetry, alarms and reports")],
    ["⌘",t("IBEX, времева прогноза и day-ahead логика","IBEX, weather forecast and day-ahead logic")],
    ["✓",t("Safety envelope, BMS лимити и software fuse","Safety envelope, BMS limits and software fuse")],
  ];
  const telemetry=["SOC / SOH",t("Зарядни и разрядни лимити","Charge and discharge limits"),t("Клетъчни температури и напрежения","Cell temperatures and voltages"),t("Аларми, contactors и availability","Alarms, contactors and availability")];
  return <div className="about-page" data-no-translate>
    <section className="about-hero card">
      <div className="about-copy">
        <div className="sponsor-mark">SPONSORED BY <strong>SUNTECH</strong></div>
        <p className="about-kicker">SUNSTORAGE PRO SERIES</p>
        <h2>SunStorage Pro 261</h2>
        <p className="about-lead">{t("Индустриална батерийна система от 261 kWh клас, готова за интелигентно управление с GrideX Energy OS.","A 261 kWh-class industrial battery storage system, ready for intelligent control with GrideX Energy OS.")}</p>
        <div className="lifetime-offer"><i>∞</i><span><small>{t("ВКЛЮЧЕНО В ДОСТАВКАТА","INCLUDED WITH THE SYSTEM")}</small><strong>{t("Безплатна интеграция + безсрочен GrideX лиценз","Free integration + perpetual GrideX licence")}</strong><em>{t("за целия жизнен цикъл на доставената система","for the full service life of the supplied system")}</em></span></div>
        <div className="about-actions"><button className="primary-btn" onClick={()=>notify(t("Запитването за SunStorage Pro 261 е подготвено","Your SunStorage Pro 261 enquiry is ready"))}>{t("Поискай оферта","Request an offer")}</button><button className="secondary-btn" onClick={()=>notify(t("Техническата конфигурация е отворена за проектно уточнение","The technical configuration is ready for project review"))}>{t("Проектна конфигурация","Project configuration")}</button></div>
      </div>
      <div className="storage-product" aria-label="SunStorage Pro 261 battery cabinet">
        <div className="storage-halo"/><div className="storage-cabinet"><span>SUNTECH</span><strong>SunStorage</strong><small>PRO 261</small><div className="cabinet-screen"><i/><b>READY</b></div><div className="cabinet-vents">••••••••••••</div></div><div className="storage-floor"/>
      </div>
    </section>

    <section className="about-specs">
      <article className="card"><span>01</span><small>{t("Енергиен клас","ENERGY CLASS")}</small><strong>261 kWh</strong><p>{t("Кабинетна BESS система","Cabinet BESS")}</p></article>
      <article className="card"><span>02</span><small>{t("Батериен контрол","BATTERY CONTROL")}</small><strong>BAU / BMS</strong><p>Modbus RTU · RS485</p></article>
      <article className="card"><span>03</span><small>{t("Силова част","POWER CONVERSION")}</small><strong>{t("PCS по проект","Project PCS")}</strong><p>{t("AC coupling конфигурация","AC-coupled configuration")}</p></article>
      <article className="card"><span>04</span><small>{t("EMS интеграция","EMS INTEGRATION")}</small><strong>OpenRemote ready</strong><p>GrideX Edge · Modbus TCP</p></article>
    </section>

    <section className="about-product-grid">
      <article className="card about-included"><PanelTitle eyebrow={t("ИНТЕГРАЦИОНЕН ПАКЕТ","INTEGRATION PACKAGE")} title={t("Какво получава клиентът","What the customer receives")}/><div>{included.map(item=><span key={item[1]}><i>{item[0]}</i><strong>{item[1]}</strong></span>)}</div><div className="product-flow"><b>SunStorage Pro 261</b><i>→</i><b>GrideX Edge</b><i>→</i><b>OpenRemote</b><i>→</i><b>Energy OS</b></div></article>
      <article className="card about-telemetry"><PanelTitle eyebrow={t("BMS ДАННИ","BMS DATA")} title={t("Наблюдавани параметри","Monitored parameters")}/><div>{telemetry.map(x=><span key={x}>✓ {x}</span>)}</div><p>{t("Командите към PCS се изпълняват само след проверка на валидните фабрични BMS граници.","PCS commands are executed only after the valid manufacturer-defined BMS limits have been checked.")}</p></article>
    </section>

    <section className="card licence-card">
      <div><p>{t("GRIDEX FOREVER LIFE","GRIDEX FOREVER LIFE")}</p><h2>{t("Една система. Един безсрочен лиценз.","One system. One perpetual licence.")}</h2><span>{t("Лицензът е включен без годишна софтуерна такса за конкретната доставена SunStorage Pro 261 система.","The licence is included without an annual software fee for the specific supplied SunStorage Pro 261 system.")}</span></div>
      <div className="licence-points"><span><i>✓</i>{t("Достъп до EMS таблата","Access to EMS dashboards")}</span><span><i>✓</i>{t("Оптимизационни режими","Optimisation modes")}</span><span><i>✓</i>{t("Драйвер за модела","Model driver")}</span><span><i>✓</i>{t("Актуализации на базовата интеграция","Core integration updates")}</span></div>
    </section>

    <section className="card project-offer">
      <div className="project-offer-icon">⌁</div>
      <div className="project-offer-copy"><p>{t("СПЕЦИАЛНА ОФЕРТА","SPECIAL OFFER")}</p><h2>{t("Безплатен електротехнически проект","Complimentary electrical engineering design")}</h2><strong>{t("с всяка закупена SunStorage Pro 261 система","with every purchased SunStorage Pro 261 system")}</strong><span>{t("Еднолинейна схема, оразмеряване на кабели и защити, AC coupling архитектура, измервателни точки и интерфейси към GrideX Edge.","Single-line diagram, cable and protection sizing, AC-coupling architecture, metering points and GrideX Edge interfaces.")}</span></div>
      <div className="project-offer-points"><span><i>✓</i>{t("Еднолинейна схема","Single-line diagram")}</span><span><i>✓</i>{t("Кабели и защити","Cables and protection")}</span><span><i>✓</i>{t("PCS, BMS и Smart Meter точки","PCS, BMS and smart-meter points")}</span><span><i>✓</i>{t("EMS комуникационна схема","EMS communications diagram")}</span></div>
      <button className="primary-btn" onClick={()=>notify(t("Запитването за безплатен електротехнически проект е подготвено","Your complimentary electrical design enquiry is ready"))}>{t("Заяви проект","Request design")}</button>
      <small className="project-scope">{t("Обхватът се уточнява за конкретния обект и търговска оферта. Такси за съгласуване, разрешителни и строителен надзор не са включени, освен ако не са изрично договорени.","Scope is confirmed for the individual site and commercial offer. Permitting, utility fees and construction supervision are excluded unless expressly agreed.")}</small>
    </section>

    <section className="card opensource-card">
      <div className="opensource-mark">&lt;/&gt;</div>
      <div className="opensource-copy"><p>OPEN SOURCE · MIT LICENSE</p><h2>{t("GrideX Energy OS е отворен проект","GrideX Energy OS is an open-source project")}</h2><span>{t("Изходният код на демонстрационната платформа е публичен. Архитектурата може да бъде преглеждана, развивана и адаптирана за нови устройства, пазари и енергийни сценарии при условията на MIT лиценза.","The demonstration platform source code is public. Its architecture can be reviewed, extended and adapted for new devices, markets and energy scenarios under the MIT License.")}</span></div>
      <div className="opensource-points"><span><i>✓</i>{t("Публичен изходен код","Public source code")}</span><span><i>✓</i>{t("Прозрачна EMS архитектура","Transparent EMS architecture")}</span><span><i>✓</i>{t("Отворен за драйвери и интеграции","Open to drivers and integrations")}</span><span><i>✓</i>{t("Подходящ за научно и индустриално развитие","Ready for research and industrial development")}</span></div>
      <div className="opensource-actions"><a href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer">GitHub repository ↗</a><a href="https://github.com/antouanbg/gridex-energy-os/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License ↗</a></div>
    </section>

    <section className="card founder-profile">
      <header className="founder-head">
        <div className="developer-avatar">AA</div>
        <div className="founder-title"><p>{t("ОСНОВАТЕЛ · АРХИТЕКТ И РАЗРАБОТЧИК НА СИСТЕМАТА","FOUNDER · SYSTEM ARCHITECT & DEVELOPER")}</p><h2>{t("Д-р инж. Антоан Христов Ангелов","Dr. Eng. Antouan Hristov Anguelov")}</h2><strong>{t("Технологичен предприемач, инвеститор и преподавател | Експерт по Изкуствен интелект, Телекомуникации и Системи за възобновяема енергия (BESS)","Technology entrepreneur, investor and lecturer | Expert in Artificial Intelligence, Telecommunications and Renewable Energy Systems (BESS)")}</strong></div>
        <div className="developer-links"><a href="https://linkmy.cards/en/antouan-anguelov/" target="_blank" rel="noreferrer">Digital profile ↗</a><a href="https://www.linkedin.com/in/antouan/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
      </header>

      <p className="founder-lead">{t("Утвърден визионер с над 25 години професионален опит на пресечната точка между бизнеса, иновациите и академичната наука. Съчетава дълбока техническа експертиза в изкуствения интелект и софтуерната интеграция с практически решения за енергийния сектор и телекомуникациите. Основател и мениджър на технологични компании в България, създател на патенти и активен изследовател.","An established technology visionary with more than 25 years of experience at the intersection of business, innovation and academic research. He combines deep expertise in artificial intelligence and software integration with practical solutions for energy and telecommunications. He is the founder and manager of Bulgarian technology companies, an inventor and an active researcher.")}</p>

      <div className="founder-grid">
        <article className="profile-column"><div className="profile-icon">01</div><p>{t("АКАДЕМИЧНА ДЕЙНОСТ","ACADEMIC WORK")}</p><h3>{t("Преподавател и изследовател","Lecturer and researcher")}</h3><ul><li>{t("Главен асистент в Техническия университет – София; води дисциплината „Интелигентни системи“.","Assistant Professor at the Technical University of Sofia, teaching Intelligent Systems.")}</li><li>{t("Ключов член на Лабораторията за възобновяеми енергийни източници към ТУ-София.","Core member of the university's Renewable Energy Sources Laboratory.")}</li><li>{t("PhD по „Системи с изкуствен интелект“ с фокус върху роевия интелект; магистър по маркетинг и мениджмънт и инженер по роботика.","PhD in Artificial Intelligence Systems with a focus on swarm intelligence; Master's degree in Marketing and Management and an engineering background in Robotics.")}</li></ul></article>

        <article className="profile-column"><div className="profile-icon">02</div><p>{t("БИЗНЕС И ПРЕДПРИЕМАЧЕСТВО","BUSINESS & ENTREPRENEURSHIP")}</p><h3>{t("От телекомуникации до енергиен SaaS","From telecommunications to energy SaaS")}</h3><ul><li>{t("Основател, съосновател и мениджър на Novacom Group, GridEx Ltd. и Lancom; бивш Country Manager за България на Tornado Systems.","Founder, co-founder and manager of Novacom Group, GridEx Ltd. and Lancom; former Country Manager for Bulgaria at Tornado Systems.")}</li><li>{t("Основател и изпълнителен директор на eHub — интеграционна SaaS платформа, отличена със Seal of Excellence по Horizon 2020.","Founder and CEO of eHub, an integration SaaS platform awarded the Horizon 2020 Seal of Excellence.")}</li><li>{t("Съосновател и бивш CTO и изпълнителен директор на локален интернет доставчик и телекомуникационен оператор в София.","Co-founder and former CTO and CEO of a local internet service provider and telecommunications operator in Sofia.")}</li></ul></article>
      </div>

      <article className="research-highlight">
        <div className="research-number">2×</div>
        <div><p>{t("ИЗСЛЕДОВАТЕЛСКИ АКЦЕНТ","RESEARCH HIGHLIGHT")}</p><h3>{t("Индустриален PV + BESS диспечинг на българския пазар „ден напред“","Industrial PV + BESS dispatch in the Bulgarian day-ahead market")}</h3><span>{t("Най-новата публикация в Electronics (MDPI), базирана на реални данни от оборудване на Suntech, изследва как BESS може да удвои приходите на съществуващи PV централи и да трансформира енергийните общности от нетни платци в нетни получатели.","The latest publication in Electronics (MDPI), based on real operational data from Suntech equipment, examines how BESS can double the revenue of existing PV plants and transform energy communities from net payers into net beneficiaries.")}</span></div>
      </article>

      <div className="innovation-row">
        <div><p>{t("ПАТЕНТИ И ПРИЛОЖНИ ИНОВАЦИИ","PATENTS & APPLIED INNOVATION")}</p><h3>{t("Решения за реални индустриални проблеми","Solutions for real industrial challenges")}</h3></div>
        <span><i>01</i><b>{t("Телекомуникации","Telecommunications")}</b><small>{t("Техники за интеграция и комуникация на данни","Data integration and communication techniques")}</small></span>
        <span><i>02</i><b>{t("Възобновяема енергия","Renewable energy")}</b><small>{t("Системи за генериране и разпределение, оптимизиращи PV мрежи","Generation and distribution systems optimising PV grids")}</small></span>
        <div className="developer-focus"><span>AI / SWARM</span><span>OPENREMOTE</span><span>EDGE / MODBUS</span><span>PV + BESS</span><span>IBEX / EMS</span><span>TELECOM</span></div>
      </div>
    </section>

    <p className="product-disclaimer">{t("Бележка: означението 261 kWh е продуктовият клас в настоящата проектна конфигурация. Окончателните електрически параметри, изборът на PCS, степента на защита, гаранцията и сертификатите се определят от подписаната спецификация на производителя и конкретния проект.","Note: the 261 kWh designation is the product class used in this project configuration. Final electrical parameters, PCS selection, enclosure rating, warranty and certifications are governed by the signed manufacturer specification and the individual project.")}</p>
  </div>;
}

function DataTable({headers,rows}:{headers:string[];rows:string[][]}) { return <div className="data-table" role="table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{rows.map((r,i)=><div className="table-row" key={i}>{r.map((c,n)=><span key={n} className={c==="Изпълнена"||c==="Онлайн"?"positive":c==="Внимание"?"warning-text":""}>{c}</span>)}</div>)}</div>; }
function Check({text}:{text:string}) { return <div className="check-row"><i>✓</i><span>{text}</span><b>OK</b></div>; }
