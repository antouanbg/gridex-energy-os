"use client";

import { lazy, Suspense, useEffect, useMemo, useState, useRef } from "react";
import { getGridexRuntimeConfig, GridexApiClient, GridexApiError, type GridexSite, type GridexSiteSnapshot } from "./lib/gridex-api";
import { getGridexAccessToken, gridexLogin, gridexLogout, initialiseGridexAuth, hasGridexAuthCallback, GridexSessionExpiredError, type GridexAuthSession } from "./lib/gridex-auth";
import { useT, type MessageKey, type UiLanguage } from "./i18n/messages";
import { bgnToEur } from "./lib/currency";
import { TranslationSuggestion } from './sections/translation-suggestion';
import { ProfileHelp } from './sections/profile-help';
import { readRoute, sectionHref } from './lib/routes';
import { releaseId, previousRelease } from './lib/session-policy';
import {clearGridexSession,logoutSignalKey} from './lib/gridex-auth';
import type { BatteryCostSettings, DataMode } from "./sections/types";

const navItems = [
  ["overview", "⌂"], ["customers", "◎"], ["sites", "◇"], ["assets", "▦"], ["battery", "▣"], ["loads", "ϟ"],
  ["market", "↗"], ["settlement", "¤"], ["balance", "≋"], ["automation", "⌘"], ["schedule", "▤"],
  ["devices", "⊞"], ["supported", "✓"], ["alarms", "△"],
  ["reports", "▥"], ["settings", "⚙"], ["plans", "★"], ["about", "○"],
] as const;
const parentSection:Record<string,string>={assets:'sites',battery:'sites',loads:'sites',settlement:'market',balance:'market',schedule:'automation',supported:'devices',plans:'settings'};

const mobilePrimaryNav = new Set(["overview", "battery", "market", "automation"]);
const liveViews = new Set(["overview", "sites", "devices", "profile", "login", "about", "help"]);

type DemoUser = {
  nameBg:string;
  nameEn:string;
  initialsBg:string;
  initialsEn:string;
  email:string;
  roleBg:string;
  roleEn:string;
  roleId:"admin"|"operator"|"trader"|"customer";
};

type BackendState = "demo" | "checking" | "unknown" | "online" | "offline";
type AuthState = "checking" | "authenticated" | "anonymous" | "error";

function initials(name:string):string {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("") || "GX";
}

function sessionToUser(session:GridexAuthSession):DemoUser {
  const normalisedRoles=session.roles.map(item=>item.toLowerCase());
  const role=normalisedRoles.some(item=>item.includes("admin"))
    ? ["Администратор","Administrator","admin"] as const
    : normalisedRoles.some(item=>item.includes("operator"))
      ? ["Оператор","Operator","operator"] as const
      : normalisedRoles.some(item=>item.includes("trader"))
        ? ["Търговец","Trader","trader"] as const
        : ["Клиент","Customer","customer"] as const;
  return {
    nameBg:session.name,
    nameEn:session.name,
    initialsBg:initials(session.name),
    initialsEn:initials(session.name),
    email:session.email,
    roleBg:role[0],
    roleEn:role[1],
    roleId:role[2],
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
const Invitations = lazy(() => import('./sections/invitations').then(module => ({ default: module.Invitations })));
const DeviceInformation = lazy(() => import('./sections/device-information').then(module => ({ default: module.DeviceInformation })));
const Customers = lazy(() => import("./sections/customers").then(module => ({ default: module.Customers })));
const Sites = lazy(() => import("./sections/sites").then(module => ({ default: module.Sites })));
const LiveSites = lazy(() => import("./sections/live-sites").then(module => ({ default: module.LiveSites })));
const Assets = lazy(() => import("./sections/assets").then(module => ({ default: module.Assets })));
const Battery = lazy(() => import("./sections/battery").then(module => ({ default: module.Battery })));
const Schedule = lazy(() => import("./sections/schedule").then(module => ({ default: module.Schedule })));
const Market = lazy(() => import("./sections/market").then(module => ({ default: module.Market })));
const Settlement = lazy(() => import("./sections/settlement").then(module => ({ default: module.Settlement })));
const Automation = lazy(() => import("./sections/automation").then(module => ({ default: module.Automation })));
const FlexibleLoads = lazy(() => import("./sections/flexible-loads").then(module => ({ default: module.FlexibleLoads })));
const Balance = lazy(() => import("./sections/balance").then(module => ({ default: module.Balance })));
const SupportedDevices = lazy(() => import("./sections/supported").then(module => ({ default: module.SupportedDevices })));
const Devices = lazy(() => import("./sections/devices").then(module => ({ default: module.Devices })));
const Alarms = lazy(() => import("./sections/alarms").then(module => ({ default: module.Alarms })));
const ReportsCenter = lazy(() => import("./sections/reports").then(module => ({ default: module.ReportsCenter })));
const SettingsHub = lazy(() => import("./sections/settings").then(module => ({ default: module.SettingsHub })));
const SubscriptionPlans = lazy(() => import("./sections/plans").then(module => ({ default: module.SubscriptionPlans })));
const About = lazy(() => import("./sections/about").then(module => ({ default: module.About })));

export default function Home() {
  const sessionEpoch=useRef(0);
  const [deviceWarning,setDeviceWarning]=useState<{siteId:string;warning:boolean}|null>(null);
  const liveReturnPath=useMemo(()=>{
    try {
      const path=sessionStorage.getItem('gridex.live-return-path');
      if(path?.startsWith('/')&&!path.startsWith('//')&&!path.startsWith('/demo')&&new URL(path,window.location.origin).origin===window.location.origin)return path;
    }catch{/* Optional navigation context. */}
    return previousRelease()===null?'/login/':'/';
  },[]);
  const runtimeConfig = useMemo(() => {
    const config=getGridexRuntimeConfig();
    if(typeof window==='undefined')return config;
    const path=window.location.pathname;
    const demo=/^\/demo(?:\/|$)/.test(path);
    const publicHome=['/','/en/'].includes(path)&&previousRelease()===null&&!hasGridexAuthCallback();
    return demo||publicHome?{...config,mode:'demo' as const}:config;
  }, []);
  useEffect(()=>{
    if(runtimeConfig.mode==='demo'&&!/^\/demo(?:\/|$)/.test(window.location.pathname)) {
      window.history.replaceState({},'',sectionHref(readRoute(window.location.pathname).view,'',true));
    }
  },[runtimeConfig]);
  const apiClient = useMemo(
    () => new GridexApiClient(runtimeConfig, force => getGridexAccessToken(runtimeConfig,force)),
    [runtimeConfig],
  );
  const [view, setView] = useState(() => typeof window === 'undefined' ? 'overview' : readRoute(window.location.pathname).view);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigationRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const revealActive=()=>{
      const nav=navigationRef.current;
      if(!nav||mobileNavOpen||!window.matchMedia('(max-width:680px)').matches)return;
      const active=nav.querySelector<HTMLElement>('[aria-current="page"]');
      if(active)nav.scrollTo({left:active.offsetLeft-nav.offsetLeft-(nav.clientWidth-active.offsetWidth)/2,behavior:'instant'});
    };
    revealActive();
    window.addEventListener('resize',revealActive);
    return()=>window.removeEventListener('resize',revealActive);
  },[view,mobileNavOpen]);
  const [auto, setAuto] = useState(true);
  const [site, setSite] = useState("Solar Park East");
  const [lang,setLang] = useState<"bg"|"en">(
    () => typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "bg",
  );
  const tKey = useT(lang);
  useEffect(()=>{
    if(window.location.pathname.startsWith('/en'))return;
    // Client-only preference is read after hydration to preserve the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const saved=localStorage.getItem('gridex.ui-language');if(saved==='bg'||saved==='en'){setLang(saved);return;} } catch { /* Storage is optional. */ }
    if(navigator.language&&!navigator.language.toLowerCase().startsWith('bg'))setLang('en');
  },[]);
  const [batteryNotice,setBatteryNotice] = useState(true);
  const [demoNoticeVisible,setDemoNoticeVisible] = useState(true);
  const [batteryCost,setBatteryCost] = useState<BatteryCostSettings>(initialBatteryCost);
  const [toast, setToast] = useState("");
  const [sessionUser,setSessionUser] = useState<DemoUser|null>(null);
  const [accountMenuOpen,setAccountMenuOpen] = useState(false);
  const [backendState, setBackendState] = useState<BackendState>(
    () => runtimeConfig.mode === "demo" ? "demo" : "checking",
  );
  const [authCallback] = useState(hasGridexAuthCallback);
  const [authState,setAuthState] = useState<AuthState>(()=>runtimeConfig.mode !== "demo" ? "checking" : "anonymous");
  const [integrationError,setIntegrationError] = useState("");
  const [liveSites,setLiveSites] = useState<GridexSite[]>([]);
  const [sitesStatus,setSitesStatus] = useState<'loading'|'ready'|'error'>('loading');
  const [selectedSiteId,setSelectedSiteId] = useState(() => {
    if(typeof window==='undefined')return '';
    const route=readRoute(window.location.pathname);
    try{return route.siteId || sessionStorage.getItem('gridex.selected-site') || '';}catch{return route.siteId;}
  });
  const [liveSnapshot,setLiveSnapshot] = useState<GridexSiteSnapshot|null>(null);
  // Demo is only for confirmed anonymous visitors, never an API-error fallback.
  const dataMode:DataMode = runtimeConfig.mode === 'demo' ? 'demo' : 'live';
  useEffect(()=>{
    if(dataMode!=='live')return;
    const ended=()=>{
      sessionEpoch.current++;
      clearGridexSession();
      setSessionUser(null);setAccountMenuOpen(false);setAuthState('anonymous');
      setBackendState('unknown');setLiveSites([]);setLiveSnapshot(null);setSelectedSiteId('');
      setSitesStatus('loading');
      setIntegrationError(lang==='en'?'Your session ended. Please sign in again.':'Сесията е прекратена. Моля, влезте отново.');
    };
    const storage=(event:StorageEvent)=>{if(event.key===logoutSignalKey&&event.newValue)ended();};
    window.addEventListener('gridex:session-ended',ended);
    window.addEventListener('storage',storage);
    return()=>{window.removeEventListener('gridex:session-ended',ended);window.removeEventListener('storage',storage);};
  },[dataMode,lang]);
  useEffect(()=>{
    if(selectedSiteId&&liveSites.some(site=>site.id===selectedSiteId)) {
      try{sessionStorage.setItem('gridex.selected-site',selectedSiteId);}catch{/* Optional navigation context. */}
    }
  },[selectedSiteId,liveSites]);
  useEffect(()=>{
    const restore=()=>{const route=readRoute(window.location.pathname);setView(route.view);if(route.siteId)setSelectedSiteId(route.siteId);setMobileNavOpen(false);};
    window.addEventListener('popstate',restore);
    return()=>window.removeEventListener('popstate',restore);
  },[]);
  useEffect(()=>{
    let pending=false;
    const reauthenticate=()=>{
      if(pending)return;
      pending=true;
      setAuthState('checking');
      setBackendState('unknown');
      void gridexLogin(runtimeConfig,true).catch(()=>{pending=false;setAuthState('error');});
    };
    window.addEventListener('gridex:reauth-required',reauthenticate);
    return()=>window.removeEventListener('gridex:reauth-required',reauthenticate);
  },[runtimeConfig]);
  useEffect(()=>{
    if(authState!=='authenticated')return;
    const controller=new AbortController();
    const check=async()=>{
      try {
        const result=await fetch('/release.json',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(5000)])});
        if(!result.ok)return;
        const release=await result.json();
        if(typeof release.id==='string'&&release.id!==releaseId())window.location.reload();
      } catch { /* A network outage is not a logout. */ }
    };
    const timer=window.setInterval(()=>void check(),30000);
    return()=>{controller.abort();window.clearInterval(timer);};
  },[authState]);
  // Text is selected by React during render. Do not mutate rendered text nodes:
  // doing so can overwrite fresh telemetry and form values after an update.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  useEffect(() => {
    const restoreNotice = window.setTimeout(() => {
      setDemoNoticeVisible(sessionStorage.getItem("gridex-demo-notice-dismissed") !== "1");
    }, 0);
    return () => window.clearTimeout(restoreNotice);
  }, []);

  useEffect(() => {
    if (runtimeConfig.mode === "demo") return;
    let active=true;
    const epoch=sessionEpoch.current;
    initialiseGridexAuth(runtimeConfig).then(async session=>{
      if (!active||epoch!==sessionEpoch.current) return;
      if (!session) {
        setSessionUser(null);
        setAuthState("anonymous");
        // Login must not depend on a public unauthenticated health endpoint.
        setBackendState("unknown");
        setIntegrationError("");
        return;
      }
      let membershipIdentity;
      try {
        membershipIdentity = await apiClient.me();
      } catch {
        if (!active||epoch!==sessionEpoch.current) return;
        setSessionUser(null);
        setBackendState("offline");
        setAuthState("error");
        setIntegrationError(document.documentElement.lang==="en"?"Sign-in completed, but API access could not be verified. Please retry.":"Входът приключи, но достъпът до API не може да се потвърди. Опитайте отново.");
        return;
      }
      if (!active||epoch!==sessionEpoch.current) return;
      const user=sessionToUser({ ...session, roles: membershipIdentity.roles });
      setSessionUser(user);
      setAuthState("authenticated");
      setBackendState("online");
      setIntegrationError("");
    }).catch(()=>{
      if (!active||epoch!==sessionEpoch.current) return;
      setSessionUser(null);
      setBackendState("unknown");
      setAuthState("error");
      setIntegrationError(document.documentElement.lang==="en"?"The identity service could not initialise.":"Услугата за реален вход не може да бъде инициализирана.");
    });
    return()=>{active=false;};
  },[runtimeConfig,apiClient,authCallback]);

  useEffect(()=>{
    if (dataMode!=="live"||backendState!=="online"||authState!=='authenticated') return;
    const controller=new AbortController();
    apiClient.sites(controller.signal).then(sites=>{
      if(controller.signal.aborted)return;
      setLiveSites(sites);
      setSitesStatus('ready');
      if (!sites.length) {setSelectedSiteId('');setLiveSnapshot(null);return;}
      // A deep link to an inaccessible Site must never silently open another Site.
      const selected=selectedSiteId ? sites.find(item=>item.id===selectedSiteId) : sites[0];
      if(!selected){setSitesStatus('error');setLiveSnapshot(null);return;}
      setSelectedSiteId(selected.id);
      setSite(selected.name);
    }).catch(error=>{
      if(controller.signal.aborted)return;
      setLiveSites([]);setSitesStatus('error');setSelectedSiteId('');setLiveSnapshot(null);
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAuthState("anonymous");return;}
      setIntegrationError(lang==="en"?"The site list could not be loaded.":"Списъкът с обекти не може да бъде зареден.");
    });
    return()=>controller.abort();
  },[apiClient,dataMode,backendState,lang,selectedSiteId,authState]);

  useEffect(()=>{
    if(dataMode!=='live'||authState!=='authenticated'||backendState!=='online'||!selectedSiteId||
      !liveSites.some(item=>item.id===selectedSiteId))return;
    const controller=new AbortController();
    const poll=async()=>{
      try{
        const result=await apiClient.deviceHeartbeats(selectedSiteId,controller.signal);
        if(!controller.signal.aborted)setDeviceWarning({siteId:selectedSiteId,warning:result.items.some(item=>item.status==='offline')});
      }catch{if(!controller.signal.aborted)setDeviceWarning(null);}
    };
    void poll();
    const timer=window.setInterval(()=>void poll(),10000);
    return()=>{controller.abort();window.clearInterval(timer);};
  },[apiClient,authState,backendState,dataMode,selectedSiteId,liveSites]);

  useEffect(()=>{
    if (dataMode!=="live"||authState!=='authenticated'||!selectedSiteId||!liveSites.some(item=>item.id===selectedSiteId)) return;
    let controller=new AbortController();
    const loadSnapshot=()=>{
      const requestController=controller;
      return apiClient.snapshot(selectedSiteId,requestController.signal).then(snapshot=>{
      if(requestController.signal.aborted)return;
      setLiveSnapshot(snapshot);
      setIntegrationError("");
    }).catch(error=>{
      if(requestController.signal.aborted)return;
      if (error instanceof DOMException&&error.name==="AbortError") return;
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAuthState("anonymous");setLiveSnapshot(null);return;}
      setIntegrationError(lang==="en"?"Live telemetry is temporarily unavailable.":"Телеметрията на живо временно не е достъпна.");
    });};
    void loadSnapshot();
    const interval=window.setInterval(()=>{
      controller.abort();
      controller=new AbortController();
      void loadSnapshot();
    },runtimeConfig.snapshotRefreshMs);
    return()=>{window.clearInterval(interval);controller.abort();};
  },[apiClient,dataMode,selectedSiteId,runtimeConfig.snapshotRefreshMs,lang,liveSites,authState]);

  useEffect(()=>{
    if(authState!=="authenticated"||backendState!=="online")return;
    let active=true;
    let pending=false;
    const controller=new AbortController();
    const expireSession=()=>{
        if(!active)return;
        window.dispatchEvent(new Event('gridex:session-ended'));
      };
    const verifySession=async()=>{
      if(pending||!active)return;
      pending=true;
      try {
        const identity=await apiClient.me(controller.signal);
        const sites=await apiClient.sites(controller.signal);
        if(!active)return;
        setSessionUser(current=>current?sessionToUser({subject:identity.subject,email:current.email,name:current.nameEn,preferredUsername:'',roles:identity.roles}):null);
        setLiveSites(current=>JSON.stringify(current)===JSON.stringify(sites)?current:sites);
        if(selectedSiteId&&!sites.some(site=>site.id===selectedSiteId)) {
          expireSession();
        }
      }catch(error){
        if(error instanceof GridexSessionExpiredError||(error instanceof GridexApiError&&[401,403].includes(error.status)))expireSession();
        else if(active)setIntegrationError(lang==='en'?'Session verification is temporarily unavailable. Retrying without signing you out.':'Проверката на сесията временно е недостъпна. Ще опитаме отново, без да те отписваме.');
      }finally{pending=false;}
    };
    const resume=()=>{if(document.visibilityState==='visible')void verifySession();};
    window.addEventListener('focus',resume);window.addEventListener('online',resume);
    document.addEventListener('visibilitychange',resume);
    window.addEventListener('pageshow',resume);
    const interval=window.setInterval(()=>{void verifySession();},20000);
    return()=>{active=false;controller.abort();window.clearInterval(interval);window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('pageshow',resume);};
  },[authState,backendState,apiClient,lang,selectedSiteId]);

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

  const navigate = (id: string, siteId = selectedSiteId) => {
    const target=id === 'gateway' ? 'devices' : id;
    window.history.pushState({},'',sectionHref(target,siteId,dataMode==='demo'));
    setView(target);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = async () => {
    if (authState === "authenticated") {
      try {
        await gridexLogout(runtimeConfig);
        return;
      } catch {
        setIntegrationError(lang==="en"?"Sign-out could not be completed by the identity service.":"Изходът не може да бъде завършен от услугата за идентичност.");
        return;
      }
    }
    setSessionUser(null);
    navigate("login");
    notify(lang==="en"?"You have signed out safely":"Излязохте успешно от профила");
  };

  const signIn = async () => {
    try {
      setAuthState("checking");
      setIntegrationError("");
      await gridexLogin(getGridexRuntimeConfig());
    } catch {
      setAuthState("error");
      setIntegrationError(lang==="en"?"The sign-in service did not respond. Please try again.":"Услугата за вход не отговори. Моля, опитайте отново.");
      if(dataMode==='demo')window.location.assign('/login/');
      else navigate('login');
    }
  };

  return (
    <main className="app-shell" data-mode={dataMode}>
      <aside className={`sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
        <button className="brand" onClick={() => navigate("overview")} aria-label={lang==="en"?"GrideX Energy OS – home":"GrideX Energy OS – начало"}>
          <span>GX</span><div>GRIDEX<small>ENERGY OS</small></div>
        </button>
        <nav ref={navigationRef} id="main-navigation" aria-label={lang==="en"?"Main navigation":"Основна навигация"}>
          {navItems.map(([id, icon]) => {
            const hasDeviceWarning=dataMode==='live'&&authState==='authenticated'&&backendState==='online'&&deviceWarning?.siteId===selectedSiteId&&deviceWarning.warning;
            const badge=dataMode==='live'?(id==='devices'&&hasDeviceWarning?'!':''):id==="battery"?(batteryNotice?"1":""):id==="automation"?"2":id==="alarms"?"3":"";
            const tone=id==="battery"?"amber":id==="automation"?"green":"red";
            const mobilePrimary=mobilePrimaryNav.has(id);
            return <a key={id} href={sectionHref(id,selectedSiteId,dataMode==='demo')} data-view-id={id} data-parent={parentSection[id]} aria-current={view===id?'page':undefined} title={id==='devices'&&hasDeviceWarning?(lang==='en'?'Devices — heartbeat warning':'Устройства — предупреждение: липсва heartbeat'):tKey(`nav.${id}` as MessageKey)} className={`${view === id ? "active" : ""} ${parentSection[view]===id?'active-parent':''} ${mobilePrimary ? "mobile-primary" : ""} ${parentSection[id]?'nav-child':''} ${parentSection[id]&&parentSection[navItems[navItems.findIndex(item=>item[0]===id)+1]?.[0]]!==parentSection[id]?'nav-child-last':''}`} onClick={event => {if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(id);}}}>
              <i>{icon}</i><span>{tKey(`nav.${id}` as MessageKey)}</span>{badge&&<em className={`nav-badge ${tone}`}>{badge}</em>}
            </a>;
          })}
          <a data-testid="mode-link" href={dataMode==='demo'?liveReturnPath:'/demo/'} onClick={()=>{
            try {
              if(dataMode==='live')sessionStorage.setItem('gridex.live-return-path',window.location.pathname+window.location.search);
            }catch{/* Optional non-secret navigation context. */}
          }}><i>◇</i><span>{dataMode==='demo'?(lang==='en'?'Live portal':'Реален портал'):(lang==='en'?'Demo':'Демо')}</span></a>
        </nav>
        {mobileNavOpen&&<button className="mobile-nav-scrim" aria-label={lang==="en"?"Close menu":"Затвори меню"} onClick={()=>setMobileNavOpen(false)}/>}
        <button className="mobile-menu-toggle" data-no-translate aria-controls="main-navigation" aria-expanded={mobileNavOpen} onClick={()=>setMobileNavOpen(!mobileNavOpen)}>
          <i>{mobileNavOpen?"×":"☰"}</i><span>{lang==="en"?"Menu":"Меню"}</span>
        </button>
        <div className="profile-wrap" data-no-translate>
          <button className={`profile ${!sessionUser?'quick-sign-in':''} ${accountMenuOpen?"open":""}`} onClick={()=>sessionUser?setAccountMenuOpen(!accountMenuOpen):void signIn()} aria-haspopup={sessionUser?"menu":undefined} aria-expanded={sessionUser?accountMenuOpen:undefined}>
            <span>{sessionUser?(lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg):"↪"}</span>
            <div><strong>{sessionUser?(lang==="en"?sessionUser.nameEn:sessionUser.nameBg):(lang==="en"?"Sign in":"Вход")}</strong><small>{sessionUser?(lang==="en"?sessionUser.roleEn:sessionUser.roleBg):(lang==="en"?"No active session":"Няма активна сесия")}</small></div><b>⋮</b>
          </button>
          <button className="language-switch sidebar-language" data-no-translate onClick={()=>{const next=lang==='bg'?'en':'bg';setLang(next);try{localStorage.setItem('gridex.ui-language',next);}catch{/* Storage is optional. */}}} aria-label="Language">{lang==="bg"?"EN":"BG"}</button>
        </div>
      </aside>

      {accountMenuOpen&&<>
        <button className="account-menu-scrim" aria-label={lang==="en"?"Close account menu":"Затвори потребителското меню"} onClick={()=>setAccountMenuOpen(false)}/>
        <div className="account-menu" role="menu" data-no-translate>
          {sessionUser?<>
            <div className="account-menu-head"><span>{lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg}</span><div><strong>{lang==="en"?sessionUser.nameEn:sessionUser.nameBg}</strong><small>{sessionUser.email}</small></div></div>
            <button role="menuitem" onClick={()=>navigate("profile")}><i>◎</i><span><strong>{lang==="en"?"User profile":"Потребителски профил"}</strong><small>{lang==="en"?"Access, alerts and session":"Достъп, известия и сесия"}</small></span><b>›</b></button>
            <button role="menuitem" onClick={()=>navigate("help")}><i>?</i><span><strong>{lang==="en"?"Documentation":"Документация"}</strong><small>{lang==="en"?"Profile settings explained":"Обяснение на настройките"}</small></span><b>›</b></button>
            <button role="menuitem" onClick={()=>navigate("login")}><i>⇄</i><span><strong>{lang==="en"?"Switch account":"Смяна на профил"}</strong><small>{lang==="en"?"Open the sign-in page":"Отвори страницата за вход"}</small></span><b>›</b></button>
            <button className="account-menu-logout" role="menuitem" onClick={signOut}><i>↪</i><span><strong>{lang==="en"?"Sign out":"Изход"}</strong><small>{lang==="en"?"End this portal session":"Прекрати тази сесия"}</small></span></button>
          </>:<><button role="menuitem" onClick={signIn}><i>↪</i><span><strong>{lang==="en"?"Sign in":"Вход"}</strong><small>{lang==="en"?"Open secure sign-in":"Отвори защитения вход"}</small></span><b>›</b></button><button role="menuitem" onClick={()=>navigate("help")}><i>?</i><span><strong>{lang==="en"?"Documentation":"Документация"}</strong><small>{lang==="en"?"How the profile works":"Как работи профилът"}</small></span><b>›</b></button></>}
        </div>
      </>}

      <section className="content">
        <header className="page-heading">
          <div>
            <div role="navigation" aria-label={lang==='en'?'Breadcrumb':'Път до страницата'}>
              <h1 className="page-breadcrumb" data-testid="page-title">
                {parentSection[view]&&<><a href={sectionHref(parentSection[view],selectedSiteId,dataMode==='demo')} onClick={event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(parentSection[view]);}}}>{tKey(`nav.${parentSection[view]}` as MessageKey)}</a><span className="breadcrumb-separator" aria-hidden="true">→</span></>}
                <span aria-current="page">{view==='not-found'?(lang==='en'?'Page not found':'Страницата не е намерена'):view==='help'?(lang==='en'?'Documentation':'Документация'):tKey(`nav.${view}` as MessageKey)}</span>
              </h1>
            </div>
            <p className="eyebrow page-site-context" data-testid="page-eyebrow">{dataMode==='live'?(liveSites.find(item=>item.id===selectedSiteId)?.name??'GrideX'):(lang==='bg'?'Соларен парк Изток':site)}</p>
          </div>
        </header>

        {!sessionUser&&view!=='login'&&<TranslationSuggestion key={lang}/>}

        {dataMode==="demo"&&demoNoticeVisible&&<section className={`demo-mode-notice ${backendState==="offline"?"offline":""}`} data-no-translate role="status">
          <i>{backendState==="offline"?"!":"DEMO"}</i>
          <span><strong>{lang==="en"?"This is Demo mode":"Това е Демо режим"}</strong><small>{backendState==="offline"?(lang==="en"?"API access could not be verified. You can retry sign-in.":"Достъпът до API не може да се потвърди. Можете да опитате вход отново."):(lang==="en"?"Please sign in to load your real sites and live OpenRemote data.":"Моля, логнете се, за да заредите реалните си обекти и данните на живо от OpenRemote.")}</small></span>
          <button className="demo-sign-in" onClick={signIn}>{lang==="en"?"Sign in":"Вход"} →</button>
          <button className="demo-notice-close" aria-label={lang==="en"?"Hide demo notice":"Скрий демо съобщението"} onClick={dismissDemoNotice}>×</button>
        </section>}

        {integrationError&&dataMode==="live"&&!['profile','help','about','login'].includes(view)&&<section className="integration-warning" role="alert"><i>!</i><span>{integrationError}</span></section>}

        <Suspense fallback={<SectionLoading view={view} lang={lang}/>}>
          <div key={sessionUser?.roleId??'anonymous'} className="portal-view" data-testid={"section-"+view} data-view={view}>
            {view==='devices'&&<section className="card config-card" data-no-translate><strong>{dataMode==='live'?(lang==='en'?'LIVE · Account data':'LIVE · Данни от акаунта'):(lang==='en'?'DEMO · Sample devices':'DEMO · Примерни устройства')}</strong><p>{lang==='en'?'Device connectivity is shown separately. A signed-in session does not confirm a heartbeat.':'Свързаността на устройствата се показва отделно. Активната сесия не потвърждава heartbeat.'}</p></section>}
            {view==='not-found'?<section className="card"><h2>{lang==='en'?'Page not found':'Страницата не е намерена'}</h2><a href={sectionHref('overview')}>{lang==='en'?'Home':'Начало'}</a></section>:dataMode==='live'&&backendState!=='online'&&view!=='login'&&view!=='about'&&view!=='help'?<section className="card config-card" role="status"><h2>{authState==='checking'?(lang==='en'?'Checking your session…':'Проверка на сесията…'):(lang==='en'?'Account data is unavailable':'Данните от акаунта са недостъпни')}</h2><p>{lang==='en'?'No demo data is shown while identity or API access is being verified.':'Не показваме демо данни, докато се проверяват сесията и достъпът до API.'}</p>{authState!=='checking'&&<button className="primary-btn" onClick={signIn}>{lang==='en'?'Check sign-in':'Провери входа'}</button>}</section>:dataMode==='live'&&(view==='sites'||((view==='devices'||view==='gateway')&&!selectedSiteId))?<LiveSites sites={liveSites} status={sitesStatus} lang={lang} onSelect={item=>{setSelectedSiteId(item.id);setSite(item.name);setLiveSnapshot(null);navigate('devices',item.id);}}/>:dataMode==="live"&&(view==='devices'||view==='gateway')?<DeviceInformation key={selectedSiteId} configure={view==='devices'} api={apiClient} siteId={selectedSiteId} lang={lang}/>:dataMode==="live"&&!liveViews.has(view)?<LiveModulePending view={view} lang={lang} onDevices={()=>navigate('devices')}/>:<>
        {view === "overview" && <Overview auto={auto} setAuto={setAuto} navigate={navigate} notify={notify} lang={lang} dataMode={dataMode} snapshot={liveSnapshot}/>}
        {view === "customers" && <Customers navigate={navigate} notify={notify} lang={lang}/>}
        {view === "sites" && <Sites setSite={setSite} navigate={navigate} lang={lang}/>}
        {view === "assets" && (
          <Assets navigate={navigate} notify={notify} lang={lang}/>
        )}
        {view === "battery" && <Battery auto={auto} setAuto={setAuto} notify={notify} lang={lang} resolveNotice={()=>setBatteryNotice(false)} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "schedule" && <Schedule notify={notify} lang={lang}/>}
        {view === "market" && <Market lang={lang} notify={notify}/>}
        {view === "settlement" && <Settlement notify={notify} lang={lang}/>}
        {view === "automation" && <Automation notify={notify} site={site} lang={lang} batteryCost={batteryCost}/>}
        {view === "loads" && <FlexibleLoads notify={notify} lang={lang}/>}
        {view === "balance" && <Balance notify={notify} lang={lang}/>}
        {view === "supported" && <SupportedDevices lang={lang}/>}
        {view === "devices" && <Devices notify={notify} lang={lang}/>}
        {view === "alarms" && <Alarms notify={notify} lang={lang}/>}
        {view === "reports" && <ReportsCenter notify={notify} lang={lang} batteryCost={batteryCost}/>}
        {view === "settings" && <SettingsHub notify={notify} lang={lang} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "plans" && <SubscriptionPlans notify={notify} lang={lang}/>}
        {view === "about" && <About lang={lang} notify={notify}/>}
        {view === "help" && <ProfileHelp lang={lang} live={dataMode==='live'}/>}
        {view === "profile" && <UserProfile lang={lang} user={sessionUser} api={apiClient} live={dataMode==='live'} navigate={navigate} signOut={signOut}/>}
        {view === "login" && <LoginPage lang={lang} user={sessionUser} onSignIn={signIn} onSignOut={signOut} navigate={navigate} backendState={backendState} authState={authState} error={integrationError}/>}
        {(view === 'profile' || view === 'login') && authState === 'authenticated' && backendState === 'online' && <Invitations api={apiClient} lang={lang}/>}
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

function LiveModulePending({view,lang,onDevices}:{view:string;lang:UiLanguage;onDevices:()=>void}) {
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
    <i>API</i><p>{t("ИЗИСКВА НАСТРОЙКА И ДАННИ","REQUIRES SETUP AND DATA")}</p>
    <h2>{t("Този раздел очаква провизиране на реални данни","This section requires provisioning of real data")}</h2>
    <span>{t("За да се използва, трябва да бъдат свързани съответните източници на данни и да бъде завършена интеграцията с backend. Само регистрацията на устройство не активира всички раздели. Входът Ви остава активен; примерни стойности не се показват.","To use this section, the relevant data sources must be configured and the backend integration completed. Registering a device alone does not activate every section. You remain signed in; sample values are never displayed.")}</span>
    <code>{endpoints[view]??"/api/v1"}</code>
    <p>{t('Регистрираните ROCK Pi и ESP32 са в раздел „Устройства“, не в енергийните активи.','Registered ROCK Pi and ESP32 units are under Devices, not energy assets.')}</p>
    <button type="button" className="primary-btn" onClick={onDevices}>{t('Отвори регистрираните устройства','Open registered devices')}</button>
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
      <div className={`login-demo-chip ${backendAvailable?"ready":"offline"}`}>{t("СИГУРЕН ВХОД","SECURE SIGN-IN")}</div>
      <p>{t("ДОБРЕ ДОШЛИ","WELCOME BACK")}</p>
      <h2>{t("Вход в портала","Sign in to the portal")}</h2>
      <p>{t("Регистрацията е с покана по имейл от администратор на организация. След потвърждение на имейла задайте парола в Keycloak и приемете поканата в профила си.","Registration requires an email invitation from your organisation administrator. Verify your email, set your password in Keycloak and accept the invitation in your profile.")}</p>
      <span className="login-intro">{t("Използвайте служебния си GrideX профил. Ще бъдете пренасочени към защитения OpenRemote / Keycloak вход.","Use your GrideX work account. You will be redirected to the secure OpenRemote / Keycloak sign-in.")}</span>
      {user&&<div className="active-session-note"><i>●</i><span><strong>{t("Има активна сесия", "An active session is available")}</strong><small>{user.email}</small></span><button type="button" onClick={()=>navigate("profile")}>{t("Профил","Profile")}</button></div>}
      <div className={`login-connection-state ${backendAvailable?"online":"offline"}`}><i/>
        <span><strong>{authState==="checking"?t("Проверка на сесията","Checking session"):backendAvailable?t("Backend връзката е готова","Backend connection is ready"):backendState==="offline"?t("API достъпът не е потвърден","API access could not be verified"):t("Влезте за проверка на достъпа","Sign in to verify access")}</strong><small>{backendAvailable?t("Удостоверяване: OIDC Authorization Code + PKCE S256","Authentication: OIDC Authorization Code + PKCE S256"):t("Ще проверим отново при следващо отваряне или обновяване на страницата.","The connection will be checked again when the page is reopened or refreshed.")}</small></span>
      </div>
      {error&&<div className="login-error" role="alert">{error}</div>}
      {!user&&<button className="login-submit" type="button" disabled={backendState==="demo"} onClick={onSignIn}>{t("Вход с GrideX / Keycloak","Sign in with GrideX / Keycloak")} <b>→</b></button>}
      {user&&<button className="login-secondary" type="button" onClick={onSignOut}>{t("Изход от текущата сесия","Sign out of the current session")}</button>}
      <button className="login-demo-return" type="button" onClick={()=>navigate("overview")}>{user?t('Към моите обекти','Back to my sites'):t("Към прегледа","Back to overview")}</button>
      <small className="login-disclaimer">{t("GrideX никога не приема или записва паролата на тази страница. Keycloak издава краткоживеещ token, който се държи само в паметта на браузъра.","GrideX never accepts or stores your password on this page. Keycloak issues a short-lived token that is kept only in browser memory.")}</small>
    </section>
  </div>;
}

function UserProfile({lang,user,api,live,navigate,signOut}:{lang:UiLanguage;user:DemoUser|null;api:GridexApiClient;live:boolean;navigate:(id:string)=>void;signOut:()=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  if (!user) return <section className="empty-profile card" data-no-translate><span aria-hidden="true">◎</span><h2>{t("Няма активна сесия","No active session")}</h2><p>{t('Влезте, за да видите профила и настройките си.','Sign in to view your profile and preferences.')}</p><button className="primary-btn" onClick={()=>navigate("login")}>{t("Към входа","Go to sign in")}</button></section>;
  const helpHref=sectionHref('help','',!live);
  return <section className="user-profile-page" data-no-translate>
    <div className="card user-hero">
      <span className="user-avatar-large" aria-hidden="true">{lang==='en'?user.initialsEn:user.initialsBg}<i/></span>
      <div><p>{t('МОЯТ ПРОФИЛ','MY PROFILE')}</p><h2>{lang==='en'?user.nameEn:user.nameBg}</h2><span>{user.email}</span><div><b>{t('Активен профил','Active account')}</b></div></div>
      <a className="profile-action light" href={helpHref}>{t('Помощ за профила','Profile guide')} <span aria-hidden="true">↗</span></a>
    </div>
    <div className="profile-dashboard">
      <article className="card profile-panel">
        <div className="profile-panel-heading"><div><span className="profile-kicker">01 / {t('ДОСТЪП','ACCESS')}</span><h3>{t('Идентичност и права','Identity and access')}</h3></div><a href={`${helpHref}#identity`} aria-label={t('Обяснение за идентичността','Identity explained')}>?</a></div>
        <dl className="profile-facts">
          <div><dt>{t('Имейл на профила','Account email')}</dt><dd>{user.email}</dd></div>
          <div><dt>{t('Роля','Role')}</dt><dd>{lang==='en'?user.roleEn:user.roleBg} <a href={`${helpHref}#access`}>{t('Какво означава?','What does this mean?')}</a></dd></div>
        </dl>
        <p className="profile-panel-note">{t('Името, имейлът и ролята идват от защитения Ви вход. Тук не се въвежда парола.','Your name, email and role come from your secure sign-in. Passwords are not entered here.')}</p>
        <button className="profile-action subtle" type="button" onClick={()=>navigate('sites')}>{t('Моите обекти','My Sites')} <span aria-hidden="true">→</span></button>
      </article>
      {live&&<HeartbeatEmailOptIn api={api} lang={lang} helpHref={helpHref}/>}
      <article className="card profile-panel profile-session-panel">
        <div className="profile-panel-heading"><div><span className="profile-kicker">03 / {t('СИГУРНОСТ','SECURITY')}</span><h3>{t('Сесия','Session')}</h3></div><a href={`${helpHref}#session`} aria-label={t('Обяснение за сесията','Session explained')}>?</a></div>
        <div className="profile-session-state"><span className="live-dot"/><div><strong>{t('Влезли сте в портала','Signed in to the portal')}</strong><small>{t('Изход прекратява тази сесия в браузъра.','Sign out ends this browser session.')}</small></div></div>
        <button className="profile-action outline" type="button" onClick={signOut}>{t('Изход','Sign out')} <span aria-hidden="true">↪</span></button>
      </article>
    </div>
  </section>;
}

function HeartbeatEmailOptIn({api,lang,helpHref}:{api:GridexApiClient;lang:UiLanguage;helpHref:string}) {
  const [preference,setPreference]=useState<{enabled:boolean;email:string|null}|null>(null);
  const [state,setState]=useState<'loading'|'ready'|'error'|'saving'>('loading');
  useEffect(()=>{
    const controller=new AbortController();
    void api.heartbeatEmailPreference(controller.signal).then(value=>{
      if(!controller.signal.aborted){setPreference(value);setState('ready');}
    }).catch(()=>{if(!controller.signal.aborted)setState('error');});
    return()=>controller.abort();
  },[api]);
  const t=(bg:string,en:string)=>lang==='en'?en:bg;
  const change=async(enabled:boolean)=>{
    setState('saving');
    try{setPreference(await api.setHeartbeatEmailPreference(enabled));setState('ready');}
    catch{setState('error');}
  };
  return <article className="card profile-panel heartbeat-email-opt-in">
    <div className="profile-panel-heading"><div><span className="profile-kicker">02 / {t('ИЗВЕСТИЯ','NOTIFICATIONS')}</span><h3>{t('Имейл известия','Email notifications')}</h3></div><a href={`${helpHref}#email-notifications`} aria-label={t('Обяснение за известията','Notifications explained')}>?</a></div>
    <p className="profile-panel-intro">{t('Една настройка за бъдещите събития във Вашите обекти.','One preference for future events at your Sites.')}</p>
    <label className="profile-notification-choice" htmlFor="profile-email-events"><input id="profile-email-events" type="checkbox" aria-label={t('Получавай имейл за всички бъдещи събития','Email me about all future events')} checked={preference?.enabled===true} disabled={state!=='ready'||!preference?.email}
      onChange={event=>void change(event.target.checked)}/>
      <span><strong>{t('Получавай имейл за всички бъдещи събития','Email me about all future events')}</strong><small>{t('Включвате веднъж; не одобрявате всеки отделен имейл.','Enable once; no approval for each individual email.')}</small></span></label>
    <div className="profile-notification-details"><span>{t('Работи сега','Available now')}</span><strong>{t('Прекъсване на heartbeat · 1 имейл на прекъсване','Missed heartbeat · 1 email per outage')}</strong></div>
    <p className="profile-panel-note">{t('Останалите видове събития ще използват същия избор, след като бъдат внедрени. Минали събития не се изпращат.','Other event types will use this choice once implemented. Past events are not emailed.')}</p>
    {preference?.email?<small className="profile-recipient">{t('Получател','Recipient')}: <strong>{preference.email}</strong></small>:state==='ready'&&<small className="profile-recipient warning">{t('Първо потвърдете имейла в профила си.','Verify your account email first.')}</small>}
    {state!=='ready'&&<p className="profile-save-state" role="status">{state==='error'?t('Настройката е недостъпна. Презаредете страницата и опитайте отново.','Setting unavailable. Reload and try again.'):state==='saving'?t('Записване…','Saving…'):t('Зареждане…','Loading…')}</p>}
    <a className="profile-inline-help" href={`${helpHref}#email-notifications`}>{t('Как работят известията?','How do notifications work?')} <span aria-hidden="true">↗</span></a>
  </article>;
}
