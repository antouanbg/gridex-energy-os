"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getGridexRuntimeConfig, GridexApiClient, GridexApiError, type GridexSite, type GridexSiteSnapshot } from "./lib/gridex-api";
import { getGridexAccessToken, gridexLogin, gridexLogout, initialiseGridexAuth, type GridexAuthSession } from "./lib/gridex-auth";
import { useT, type MessageKey, type UiLanguage } from "./i18n/messages";
import { LANGUAGE_PREFERENCE_STORAGE_KEY, resolveUiLanguage } from "./i18n/locale";
import { bgnToEur } from "./lib/currency";
import { PanelTitle } from "./sections/shared";
import type { BatteryCostSettings, DataMode } from "./sections/types";

const navItems = [
  ["overview", "⌂"], ["customers", "◎"], ["sites", "◇"], ["assets", "▦"], ["battery", "▣"],
  ["schedule", "▤"], ["market", "↗"], ["settlement", "¤"], ["automation", "⌘"], ["loads", "ϟ"],
  ["balance", "≋"], ["gateway", "⌗"], ["supported", "✓"], ["devices", "⊞"], ["alarms", "△"],
  ["reports", "▥"], ["settings", "⚙"], ["plans", "★"], ["about", "○"],
] as const;

const mobilePrimaryNav = new Set(["overview", "battery", "market", "automation"]);

type DemoUser = {
  nameBg:string;
  nameEn:string;
  initialsBg:string;
  initialsEn:string;
  email:string;
  roleBg:string;
  roleEn:string;
};

type BackendState = "demo" | "checking" | "online" | "offline";
type AuthState = "checking" | "authenticated" | "anonymous" | "error";

function initials(name:string):string {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("") || "GX";
}

function sessionToUser(session:GridexAuthSession):DemoUser {
  const normalisedRoles=session.roles.map(item=>item.toLowerCase());
  const role=normalisedRoles.some(item=>item.includes("admin"))
    ? ["Администратор","Administrator"]
    : normalisedRoles.some(item=>item.includes("operator"))
      ? ["Оператор","Operator"]
      : normalisedRoles.some(item=>item.includes("trader"))
        ? ["Търговец","Trader"]
        : ["Клиент","Customer"];
  return {
    nameBg:session.name,
    nameEn:session.name,
    initialsBg:initials(session.name),
    initialsEn:initials(session.name),
    email:session.email,
    roleBg:role[0],
    roleEn:role[1],
  };
}

const initialBatteryCost:BatteryCostSettings = {
  capex:bgnToEur(420000),
  years:10,
  residual:10,
  maintenance:0.8,
  annualThroughput:720,
  warrantedCycles:8000,
  todayCycles:0.78,
  method:"usage",
  included:true,
};


const Overview = lazy(() => import("./sections/overview").then(module => ({ default: module.Overview })));
const Customers = lazy(() => import("./sections/customers").then(module => ({ default: module.Customers })));
const Sites = lazy(() => import("./sections/sites").then(module => ({ default: module.Sites })));
const Assets = lazy(() => import("./sections/assets").then(module => ({ default: module.Assets })));
const Battery = lazy(() => import("./sections/battery").then(module => ({ default: module.Battery })));
const Schedule = lazy(() => import("./sections/schedule").then(module => ({ default: module.Schedule })));
const Market = lazy(() => import("./sections/market").then(module => ({ default: module.Market })));
const Settlement = lazy(() => import("./sections/settlement").then(module => ({ default: module.Settlement })));
const Automation = lazy(() => import("./sections/automation").then(module => ({ default: module.Automation })));
const FlexibleLoads = lazy(() => import("./sections/flexible-loads").then(module => ({ default: module.FlexibleLoads })));
const Balance = lazy(() => import("./sections/balance").then(module => ({ default: module.Balance })));
const Gateway = lazy(() => import("./sections/gateway").then(module => ({ default: module.Gateway })));
const SupportedDevices = lazy(() => import("./sections/supported").then(module => ({ default: module.SupportedDevices })));
const Devices = lazy(() => import("./sections/devices").then(module => ({ default: module.Devices })));
const Alarms = lazy(() => import("./sections/alarms").then(module => ({ default: module.Alarms })));
const ReportsCenter = lazy(() => import("./sections/reports").then(module => ({ default: module.ReportsCenter })));
const SettingsHub = lazy(() => import("./sections/settings").then(module => ({ default: module.SettingsHub })));
const SubscriptionPlans = lazy(() => import("./sections/plans").then(module => ({ default: module.SubscriptionPlans })));
const About = lazy(() => import("./sections/about").then(module => ({ default: module.About })));

export default function Home() {
  const runtimeConfig = useMemo(() => getGridexRuntimeConfig(), []);
  const apiClient = useMemo(
    () => new GridexApiClient(runtimeConfig, () => getGridexAccessToken(runtimeConfig)),
    [runtimeConfig],
  );
  const [view, setView] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [auto, setAuto] = useState(true);
  const [period, setPeriod] = useState("Днес");
  const [site, setSite] = useState("Solar Park East");
  const [role, setRole] = useState("Администратор");
  // The same browser-only initialisation previously handled the /en route.
  // A user's explicit choice still takes precedence over the regional default.
  const [lang,setLang] = useState<UiLanguage>(() => typeof window === "undefined" ? "bg" : resolveUiLanguage({
    pathname: window.location.pathname,
    savedPreference: localStorage.getItem(LANGUAGE_PREFERENCE_STORAGE_KEY),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
  const tKey = useT(lang);
  const [batteryNotice,setBatteryNotice] = useState(true);
  const [demoNoticeVisible,setDemoNoticeVisible] = useState(true);
  const [batteryCost,setBatteryCost] = useState<BatteryCostSettings>(initialBatteryCost);
  const [toast, setToast] = useState("");
  const [sessionUser,setSessionUser] = useState<DemoUser|null>(null);
  const [accountMenuOpen,setAccountMenuOpen] = useState(false);
  const [backendState, setBackendState] = useState<BackendState>(
    () => runtimeConfig.mode === "demo" ? "demo" : "checking",
  );
  const [authState,setAuthState] = useState<AuthState>(runtimeConfig.mode === "demo" ? "anonymous" : "checking");
  const [integrationError,setIntegrationError] = useState("");
  const [liveSites,setLiveSites] = useState<GridexSite[]>([]);
  const [selectedSiteId,setSelectedSiteId] = useState(runtimeConfig.defaultSiteId);
  const [liveSnapshot,setLiveSnapshot] = useState<GridexSiteSnapshot|null>(null);
  const dataMode:DataMode = backendState === "online" && authState === "authenticated" ? "live" : "demo";
  // Text is selected by React during render. Do not mutate rendered text nodes:
  // doing so can overwrite fresh telemetry and form values after an update.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const selectLanguage = (next:UiLanguage) => {
    localStorage.setItem(LANGUAGE_PREFERENCE_STORAGE_KEY, next);
    setLang(next);
  };

  useEffect(() => {
    const restoreNotice = window.setTimeout(() => {
      setDemoNoticeVisible(sessionStorage.getItem("gridex-demo-notice-dismissed") !== "1");
    }, 0);
    return () => window.clearTimeout(restoreNotice);
  }, []);

  useEffect(() => {
    if (runtimeConfig.mode === "demo") return;
    let controller = new AbortController();
    const checkBackend=()=>apiClient.health(controller.signal).then(() => {
        setBackendState("online");
        setIntegrationError("");
      }).catch(error => {
        if(error instanceof DOMException&&error.name==="AbortError")return;
        setBackendState("offline");
        setAuthState("anonymous");
        setSessionUser(null);
        setLiveSnapshot(null);
        setIntegrationError(lang==="en"?"The GrideX backend is currently unavailable.":"В момента няма връзка с GrideX backend-а.");
      });
    void checkBackend();
    const interval=window.setInterval(()=>{
      controller.abort();
      controller=new AbortController();
      void checkBackend();
    },runtimeConfig.backendHealthRefreshMs);
    return () => {window.clearInterval(interval);controller.abort();};
  }, [apiClient, runtimeConfig.mode, runtimeConfig.backendHealthRefreshMs, lang]);

  useEffect(() => {
    if (backendState !== "online") return;
    let active=true;
    initialiseGridexAuth(runtimeConfig).then(session=>{
      if (!active) return;
      if (!session) {
        setSessionUser(null);
        setAuthState("anonymous");
        return;
      }
      const user=sessionToUser(session);
      setSessionUser(user);
      setRole(user.roleBg);
      setAuthState("authenticated");
      setIntegrationError("");
    }).catch(()=>{
      if (!active) return;
      setSessionUser(null);
      setAuthState("error");
      setIntegrationError(lang==="en"?"The identity service could not initialise.":"Услугата за реален вход не може да бъде инициализирана.");
    });
    return()=>{active=false;};
  },[backendState,runtimeConfig,lang]);

  useEffect(()=>{
    if (dataMode!=="live") return;
    const controller=new AbortController();
    apiClient.sites(controller.signal).then(sites=>{
      if (!sites.length) return;
      setLiveSites(sites);
      const selected=sites.find(item=>item.id===selectedSiteId)??sites[0];
      setSelectedSiteId(selected.id);
      setSite(selected.name);
    }).catch(error=>{
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAuthState("anonymous");return;}
      setIntegrationError(lang==="en"?"The site list could not be loaded.":"Списъкът с обекти не може да бъде зареден.");
    });
    return()=>controller.abort();
  },[apiClient,dataMode,lang,selectedSiteId]);

  useEffect(()=>{
    if (dataMode!=="live"||!selectedSiteId) return;
    let controller=new AbortController();
    const loadSnapshot=()=>apiClient.snapshot(selectedSiteId,controller.signal).then(snapshot=>{
      setLiveSnapshot(snapshot);
      setIntegrationError("");
    }).catch(error=>{
      if (error instanceof DOMException&&error.name==="AbortError") return;
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAuthState("anonymous");setLiveSnapshot(null);return;}
      setIntegrationError(lang==="en"?"Live telemetry is temporarily unavailable.":"Телеметрията на живо временно не е достъпна.");
    });
    void loadSnapshot();
    const interval=window.setInterval(()=>{
      controller.abort();
      controller=new AbortController();
      void loadSnapshot();
    },runtimeConfig.snapshotRefreshMs);
    return()=>{window.clearInterval(interval);controller.abort();};
  },[apiClient,dataMode,selectedSiteId,runtimeConfig.snapshotRefreshMs,lang]);

  useEffect(()=>{
    if(authState!=="authenticated"||backendState!=="online")return;
    const expireSession=()=>{
        setSessionUser(null);
        setAuthState("anonymous");
        setLiveSnapshot(null);
        setIntegrationError(lang==="en"?"Your session has expired. Please sign in again.":"Сесията Ви е изтекла. Моля, логнете се отново.");
      };
    const verifySession=()=>getGridexAccessToken(runtimeConfig).then(token=>{if(!token)expireSession();}).catch(expireSession);
    const interval=window.setInterval(()=>{void verifySession();},20000);
    return()=>window.clearInterval(interval);
  },[authState,backendState,runtimeConfig,lang]);

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

  const dismissDemoNotice = () => {
    sessionStorage.setItem("gridex-demo-notice-dismissed", "1");
    setDemoNoticeVisible(false);
  };

  const navigate = (id: string) => {
    setView(id);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = async () => {
    if (authState === "authenticated" && backendState === "online") {
      try {
        await gridexLogout(runtimeConfig);
        return;
      } catch {
        setIntegrationError(lang==="en"?"Sign-out could not be completed by the identity service.":"Изходът не може да бъде завършен от услугата за идентичност.");
      }
    }
    setSessionUser(null);
    setRole("Администратор");
    navigate("login");
    notify(lang==="en"?"You have signed out safely":"Излязохте успешно от профила");
  };

  const signIn = async () => {
    if (backendState !== "online") {
      setIntegrationError(lang==="en"?"Sign-in is unavailable because the backend cannot be reached.":"Входът не е достъпен, защото няма връзка с backend-а.");
      return;
    }
    try {
      setIntegrationError("");
      await gridexLogin(runtimeConfig);
    } catch {
      setIntegrationError(lang==="en"?"The sign-in service did not respond. Please try again.":"Услугата за вход не отговори. Моля, опитайте отново.");
    }
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
        <button className="brand" onClick={() => navigate("overview")} aria-label={lang==="en"?"GrideX Energy OS – home":"GrideX Energy OS – начало"}>
          <span>GX</span><div>GRIDEX<small>ENERGY OS</small></div>
        </button>
        <nav id="main-navigation" aria-label={lang==="en"?"Main navigation":"Основна навигация"}>
          {navItems.map(([id, icon]) => {
            const badge=id==="battery"?(batteryNotice?"1":""):id==="automation"?"2":id==="alarms"?"3":"";
            const tone=id==="battery"?"amber":id==="automation"?"green":"red";
            const mobilePrimary=mobilePrimaryNav.has(id);
            return <button key={id} data-view-id={id} title={tKey(`nav.${id}` as MessageKey)} className={`${view === id ? "active" : ""} ${mobilePrimary ? "mobile-primary" : ""}`} onClick={() => navigate(id)}>
              <i>{icon}</i><span>{tKey(`nav.${id}` as MessageKey)}</span>{badge&&<em className={`nav-badge ${tone}`}>{badge}</em>}
            </button>;
          })}
        </nav>
        {mobileNavOpen&&<button className="mobile-nav-scrim" aria-label={lang==="en"?"Close menu":"Затвори меню"} onClick={()=>setMobileNavOpen(false)}/>}
        <button className="mobile-menu-toggle" data-no-translate aria-controls="main-navigation" aria-expanded={mobileNavOpen} onClick={()=>setMobileNavOpen(!mobileNavOpen)}>
          <i>{mobileNavOpen?"×":"☰"}</i><span>{lang==="en"?"Menu":"Меню"}</span>
        </button>
          <div className="gateway"><span className="live-dot"/><div><strong>{lang==="en"?"Edge gateway":"Edge шлюз"}</strong><small>{lang==="en"?"Online · 8 sec ago":"Онлайн · преди 8 сек."}</small></div></div>
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
          <div><p className="eyebrow" data-testid="page-eyebrow">{tKey(`eyebrow.${view}` as MessageKey)}</p><h1 data-testid="page-title">{view === "overview" ? (lang === "bg" ? "Соларен парк Изток" : site) : tKey(`title.${view}` as MessageKey)}</h1></div>
          <div className="header-actions">
            <span className={`backend-badge ${dataMode==="live"?"online":backendState==="offline"?"offline":"demo"}`} data-no-translate>
              <i/>{dataMode === "live" ? "OPENREMOTE LIVE" : backendState === "offline" ? "API OFFLINE · DEMO" : backendState === "checking" ? "CONNECTING · DEMO" : "DEMO DATA"}
            </span>
            <a className="open-source-badge" href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer" data-no-translate>OPEN SOURCE ↗</a>
            <button className="language-switch" data-no-translate onClick={()=>selectLanguage(lang==="bg"?"en":"bg")} aria-label="Language">{lang==="bg"?"EN":"BG"}</button>
            <select value={role} disabled={dataMode==="live"} onChange={(e) => { setRole(e.target.value); notify(`Активна роля: ${e.target.value}`); }} aria-label={lang==="en"?"Working role":"Работна роля"}><option>Администратор</option><option>Оператор</option><option>Клиент</option><option>Търговец</option></select>
            {view !== "sites" && <select value={site} onChange={(e) => {
              setSite(e.target.value);
              const selected=liveSites.find(item=>item.name===e.target.value);
              if(selected)setSelectedSiteId(selected.id);
            }} aria-label={lang==="en"?"Selected site":"Избран обект"}>{dataMode==="live"&&liveSites.length?liveSites.map(item=><option key={item.id}>{item.name}</option>):<><option>Solar Park East</option><option>Logistics Hub Plovdiv</option><option>Factory Varna</option></>}</select>}
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label={lang==="en"?"Period":"Период"}><option>Днес</option><option>Тази седмица</option><option>Този месец</option></select>
            <button className="icon-btn" aria-label={lang==="en"?"Notifications":"Известия"} onClick={() => navigate("alarms")}>△<em>3</em></button>
            <button className="mobile-account-button" data-no-translate aria-label={lang==="en"?"Account menu":"Потребителско меню"} aria-expanded={accountMenuOpen} onClick={()=>setAccountMenuOpen(!accountMenuOpen)}>{sessionUser?(lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg):"↪"}</button>
          </div>
        </header>

        {dataMode==="demo"&&demoNoticeVisible&&<section className={`demo-mode-notice ${backendState==="offline"?"offline":""}`} data-no-translate role="status">
          <i>{backendState==="offline"?"!":"DEMO"}</i>
          <span><strong>{lang==="en"?"This is Demo mode":"Това е Демо режим"}</strong><small>{backendState==="offline"?(lang==="en"?"The backend connection is unavailable. Sign-in will become active automatically after the service recovers.":"Няма връзка с backend-а. Входът ще стане активен автоматично след възстановяване на услугата."):(lang==="en"?"Please sign in to load your real sites and live OpenRemote data.":"Моля, логнете се, за да заредите реалните си обекти и данните на живо от OpenRemote.")}</small></span>
          <button onClick={()=>navigate("login")}>{lang==="en"?"Sign in":"Вход"} →</button>
          <button className="demo-notice-close" aria-label={lang==="en"?"Hide demo notice":"Скрий демо съобщението"} onClick={dismissDemoNotice}>×</button>
        </section>}

        {integrationError&&dataMode==="live"&&<section className="integration-warning" role="alert"><i>!</i><span>{integrationError}</span></section>}

        <Suspense fallback={<SectionLoading view={view} lang={lang}/>}>
          <div className="portal-view" data-testid={"section-"+view} data-view={view}>
            {dataMode==="live"&&!new Set(["overview","profile","login"]).has(view)?<LiveModulePending view={view} lang={lang}/>:<>
        {view === "overview" && <Overview auto={auto} setAuto={setAuto} navigate={navigate} notify={notify} lang={lang} dataMode={dataMode} snapshot={liveSnapshot}/>}
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
        {view === "supported" && <SupportedDevices lang={lang}/>}
        {view === "devices" && <Devices notify={notify} lang={lang}/>}
        {view === "alarms" && <Alarms notify={notify} lang={lang}/>}
        {view === "reports" && <ReportsCenter notify={notify} lang={lang} batteryCost={batteryCost}/>}
        {view === "settings" && <SettingsHub notify={notify} lang={lang} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "plans" && <SubscriptionPlans notify={notify} lang={lang}/>}
        {view === "about" && <About lang={lang} notify={notify}/>}
        {view === "profile" && <UserProfile lang={lang} user={sessionUser} navigate={navigate} signOut={signOut} notify={notify}/>}
        {view === "login" && <LoginPage lang={lang} user={sessionUser} onSignIn={signIn} onSignOut={signOut} navigate={navigate} backendState={backendState} authState={authState} error={integrationError}/>}
            </>}
          </div>
        </Suspense>
      </section>
      {toast && <div className="toast"><i>✓</i>{toast}</div>}
    </main>
  );
}


function SectionLoading({view,lang}:{view:string;lang:UiLanguage}) {
  return <section className="card section-loading" role="status" aria-live="polite" data-view={view}>
    <span className="live-dot"/><strong>{lang === "en" ? "Loading section…" : "Зареждане на раздела…"}</strong>
  </section>;
}

function LiveModulePending({view,lang}:{view:string;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const endpoints:Record<string,string>={
    customers:"/api/v1/organisations · /api/v1/contracts",
    sites:"/api/v1/sites",
    assets:"/api/v1/sites/{siteId}/assets",
    battery:"/api/v1/sites/{siteId}/snapshot · /configurations/battery",
    schedule:"/api/v1/sites/{siteId}/schedules",
    market:"/api/v1/market/prices · /forecast",
    settlement:"/api/v1/sites/{siteId}/settlement",
    automation:"/api/v1/sites/{siteId}/configurations/strategy",
    loads:"/api/v1/sites/{siteId}/loads",
    balance:"/api/v1/sites/{siteId}/balancing",
    gateway:"/api/v1/sites/{siteId}/gateways",
    supported:"/api/v1/drivers",
    devices:"/api/v1/sites/{siteId}/devices",
    alarms:"/api/v1/sites/{siteId}/alarms · /incidents",
    reports:"/api/v1/sites/{siteId}/reports",
    settings:"/api/v1/sites/{siteId}/configurations/{section}",
    plans:"/api/v1/subscription",
    about:"/api/v1/system/version",
  };
  return <section className="live-module-pending card" data-no-translate>
    <i>API</i><p>{t("LIVE РЕЖИМ · БЕЗ ДЕМО СТОЙНОСТИ","LIVE MODE · NO DEMO VALUES")}</p>
    <h2>{t("Модулът очаква своя backend договор","This module is waiting for its backend contract")}</h2>
    <span>{t("Вие сте в реална сесия. За да не смесваме демонстрационни и реални данни, примерният екран е скрит, докато съответният endpoint бъде активиран.","You are in a real session. To prevent mixing representative and live data, the preview screen is hidden until its endpoint is enabled.")}</span>
    <code>{endpoints[view]??"/api/v1"}</code>
    <small>{t("Договорът и всички полета са описани в docs/integration/FRONTEND_BACKEND_IMPLEMENTATION_PLAN.md","The contract and all fields are documented in docs/integration/FRONTEND_BACKEND_IMPLEMENTATION_PLAN.md")}</small>
  </section>;
}

function LoginPage({lang,user,onSignIn,onSignOut,navigate,backendState,authState,error}:{lang:UiLanguage;user:DemoUser|null;onSignIn:()=>void;onSignOut:()=>void;navigate:(id:string)=>void;backendState:BackendState;authState:AuthState;error:string}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const backendAvailable=backendState==="online";
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
    <section className="login-card">
      <div className={`login-demo-chip ${backendAvailable?"ready":"offline"}`}>{backendAvailable?t("СИГУРЕН ВХОД","SECURE SIGN-IN"):t("BACKEND НЕДОСТЪПЕН","BACKEND UNAVAILABLE")}</div>
      <p>{t("ДОБРЕ ДОШЛИ","WELCOME BACK")}</p>
      <h2>{t("Вход в портала","Sign in to the portal")}</h2>
      <span className="login-intro">{backendAvailable?t("Използвайте служебния си GrideX профил. Ще бъдете пренасочени към защитения OpenRemote / Keycloak вход.","Use your GrideX work account. You will be redirected to the secure OpenRemote / Keycloak sign-in."):t("Има проблем с връзката към backend-а. Демото остава достъпно, но реалният вход и данните на живо са временно спрени.","There is a backend connection problem. The demo remains available, but real sign-in and live data are temporarily disabled.")}</span>
      {user&&<div className="active-session-note"><i>●</i><span><strong>{t("Има активна сесия", "An active session is available")}</strong><small>{user.email}</small></span><button type="button" onClick={()=>navigate("profile")}>{t("Профил","Profile")}</button></div>}
      <div className={`login-connection-state ${backendAvailable?"online":"offline"}`}><i/>
        <span><strong>{backendState==="checking"?t("Проверка на връзката","Checking connection"):backendAvailable?t("Backend връзката е готова","Backend connection is ready"):t("Няма връзка с backend-а","Backend connection unavailable")}</strong><small>{backendAvailable?t("Удостоверяване: OIDC Authorization Code + PKCE S256","Authentication: OIDC Authorization Code + PKCE S256"):t("Ще проверим отново при следващо отваряне или обновяване на страницата.","The connection will be checked again when the page is reopened or refreshed.")}</small></span>
      </div>
      {error&&<div className="login-error" role="alert">{error}</div>}
      {!user&&<button className="login-submit" type="button" disabled={!backendAvailable||authState==="checking"} onClick={onSignIn}>{authState==="checking"?t("Проверка на сесията…","Checking session…"):t("Вход с GrideX / Keycloak","Sign in with GrideX / Keycloak")} <b>→</b></button>}
      {user&&<button className="login-secondary" type="button" onClick={onSignOut}>{t("Изход от текущата сесия","Sign out of the current session")}</button>}
      <button className="login-demo-return" type="button" onClick={()=>navigate("overview")}>{t("Продължи в ясно обозначен Демо режим","Continue in clearly labelled Demo mode")}</button>
      <small className="login-disclaimer">{t("GrideX никога не приема или записва паролата на тази страница. Keycloak издава краткоживеещ token, който се държи само в паметта на браузъра.","GrideX never accepts or stores your password on this page. Keycloak issues a short-lived token that is kept only in browser memory.")}</small>
    </section>
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
