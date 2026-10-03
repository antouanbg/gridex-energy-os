"use client";

import { lazy, Suspense, useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { discoverGridexLoginRealms, requestInvitationResend, getGridexRuntimeConfig, GridexApiClient, GridexApiError, type GridexRuntimeConfig, type GridexSite, type GridexSiteSnapshot, type GridexUser } from "./lib/gridex-api";
import { getGridexAccessToken, gridexLoginForEmail, gridexLogout, initialiseGridexAuth, hasGridexAuthCallback, pendingGridexLogin, GridexSessionExpiredError, type GridexAuthSession } from "./lib/gridex-auth";
import { type UiLanguage } from "./i18n/messages";
import { bgnToEur } from "./lib/currency";
import { TranslationSuggestion } from './sections/translation-suggestion';
import { ProfileHelp } from './sections/profile-help';
import { ServiceCatalog } from './sections/service-catalog';
import { documentationLink } from './lib/documentation';
import { readRoute, sectionHref } from './lib/routes';
import {navItems,parentSection,navigationLabel,ancestors} from './lib/navigation';
import {useEnergyInventory,EnergyInventoryView} from './sections/energy-inventory';
import {InfrastructureCatalogue} from './sections/infrastructure-catalogue';
import {DemoAssetInventory,DemoInfrastructure,DemoSectionLinks} from './sections/demo-inventory';
import {useNavigation} from './lib/use-navigation';
import {translate} from './i18n/catalog';
import { forgetSession, releaseId, previousRelease } from './lib/session-policy';
import {clearGridexLoginIntent,clearGridexSession,logoutSignalKey} from './lib/gridex-auth';
import type { BatteryCostSettings, DataMode } from "./sections/types";


const mobilePrimaryNav = new Set(["overview", "battery", "market", "automation"]);
const liveViews = new Set(["overview", "sites", "devices", "visualisations", "members", "market", "profile", "login", "about", "help","services","weather","forecast","reports","modes","settings","market-settings","assets","battery","inverter","evse","loads"]);

function showDemoAfterExpiredSession() {
  forgetSession();
  clearGridexSession();
  try {
    for (const key of ['gridex.selected-site', 'gridex.selected-realm', 'gridex.live-return-path', 'gridex.auth-return-path'])
      sessionStorage.removeItem(key);
  } catch { /* Browser storage is optional. */ }
  window.location.replace('/demo/');
}

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
class LoginIdentityMismatchError extends Error {}

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
const SiteVisualisations = lazy(() => import("./sections/site-visualisations").then(module => ({ default: module.SiteVisualisations })));
const Battery = lazy(() => import("./sections/battery").then(module => ({ default: module.Battery })));
const Schedule = lazy(() => import("./sections/schedule").then(module => ({ default: module.Schedule })));
const Market = lazy(() => import("./sections/market").then(module => ({ default: module.Market })));
const LiveMarket = lazy(() => import("./sections/live-market").then(module => ({ default: module.LiveMarket })));
const Settlement = lazy(() => import("./sections/settlement").then(module => ({ default: module.Settlement })));
const Automation = lazy(() => import("./sections/automation").then(module => ({ default: module.Automation })));
const FlexibleLoads = lazy(() => import("./sections/flexible-loads").then(module => ({ default: module.FlexibleLoads })));
const Balance = lazy(() => import("./sections/balance").then(module => ({ default: module.Balance })));
const SupportedDevices = lazy(() => import("./sections/supported").then(module => ({ default: module.SupportedDevices })));
const Devices = lazy(() => import("./sections/devices").then(module => ({ default: module.Devices })));
const Alarms = lazy(() => import("./sections/alarms").then(module => ({ default: module.Alarms })));
const ReportsCenter = lazy(() => import("./sections/reports").then(module => ({ default: module.ReportsCenter })));
const SubscriptionPlans = lazy(() => import("./sections/plans").then(module => ({ default: module.SubscriptionPlans })));
const About = lazy(() => import("./sections/about").then(module => ({ default: module.About })));

export default function Home() {
  const sessionEpoch=useRef(0);
  const verifiedIdentity=useRef<{subject:string;realm?:string;email:string;name:string}|null>(null);
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
  const [accountIdentity,setAccountIdentity] = useState<GridexUser|null>(null);
  const [enabledServices,setEnabledServices] = useState<{subject:string;codes:string[]}|null>(null);
  const [serviceCheckFailed,setServiceCheckFailed] = useState(false);
  const [accountMenuOpen,setAccountMenuOpen] = useState(false);
  const [backendState, setBackendState] = useState<BackendState>(
    () => runtimeConfig.mode === "demo" ? "demo" : "checking",
  );
  const [authCallback] = useState(hasGridexAuthCallback);
  const [authState,setAuthState] = useState<AuthState>(()=>runtimeConfig.mode !== "demo" ? "checking" : "anonymous");
  const [loginSuccess,setLoginSuccess] = useState(false);
  const [integrationError,setIntegrationError] = useState("");
  const [sessionCheckError,setSessionCheckError] = useState(false);
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
  const navigation=useNavigation(apiClient,accountIdentity?.realm||'',accountIdentity?.subject||'',dataMode==='live'&&authState==='authenticated'&&backendState==='online');
  const renderedNav=(dataMode==='demo'||(view==='login'&&!accountIdentity&&authState==='anonymous'))?navItems:[...navItems].filter(([id])=>navigation.result?.items.some(item=>item.id===id&&item.visible)??['overview','sites','devices','profile','help','about'].includes(id)).sort((a,b)=>(navigation.result?.items.find(item=>item.id===a[0])?.sortOrder??0)-(navigation.result?.items.find(item=>item.id===b[0])?.sortOrder??0));
  const energyInventory=useEnergyInventory(apiClient,liveSites,`${accountIdentity?.realm}:${accountIdentity?.subject}`,dataMode==='live'&&authState==='authenticated'&&backendState==='online'&&sitesStatus==='ready');
  useEffect(()=>{
    if(dataMode!=='live'||authState!=='authenticated'||!accountIdentity){return;}
    const abort=new AbortController();
    apiClient.myServices(abort.signal).then(result=>{
      if(!abort.signal.aborted)setServiceCheckFailed(false);
      if(!abort.signal.aborted)setEnabledServices({subject:accountIdentity.subject,codes:result.services.map(service=>service.code)});
    }).catch(()=>{if(!abort.signal.aborted){setEnabledServices(null);setServiceCheckFailed(true);}});
    return()=>abort.abort();
  },[apiClient,dataMode,authState,accountIdentity]);
  useEffect(()=>{
    if(dataMode!=='live')return;
    const ended=()=>{
      sessionEpoch.current++;
      verifiedIdentity.current=null;
      clearGridexSession();
      setSessionUser(null);setAccountIdentity(null);setAccountMenuOpen(false);setAuthState('anonymous');
      setEnabledServices(null);
      setBackendState('unknown');setLiveSites([]);setLiveSnapshot(null);setSelectedSiteId('');
      setSitesStatus('loading');
      setSessionCheckError(false);
      setIntegrationError(lang==='en'?'Your session ended. Please sign in again.':'Сесията е прекратена. Моля, влезте отново.');
    };
    const expired=()=>{ended();showDemoAfterExpiredSession();};
    const suspend=(broadcast:boolean)=>{
      ended();setIntegrationError(lang==='en'?'Your organisation is temporarily suspended. Contact the super administrator.':'Организацията е временно спряна. Свържете се със супер администратора.');
      if(broadcast)try{localStorage.setItem('gridex.organisation-suspended',JSON.stringify({realm:runtimeConfig.realm,nonce:crypto.randomUUID()}));}catch{/* Other tabs recheck on resume. */}
    };
    const suspended=()=>suspend(true);
    const storage=(event:StorageEvent)=>{
      if(event.key===logoutSignalKey&&event.newValue){ended();showDemoAfterExpiredSession();}
      if(event.key==='gridex.organisation-suspended'&&event.newValue)try{if(JSON.parse(event.newValue).realm===runtimeConfig.realm)suspend(false);}catch{/* Ignore malformed optional browser signals. */}
    };
    window.addEventListener('gridex:session-ended',ended);
    window.addEventListener('gridex:session-expired',expired);
    window.addEventListener('gridex:reauth-required',expired);
    window.addEventListener('gridex:organisation-suspended',suspended);
    window.addEventListener('storage',storage);
    return()=>{window.removeEventListener('gridex:organisation-suspended',suspended);window.removeEventListener('gridex:session-ended',ended);window.removeEventListener('gridex:session-expired',expired);window.removeEventListener('gridex:reauth-required',expired);window.removeEventListener('storage',storage);};
  },[dataMode,lang,runtimeConfig.realm]);
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
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let successTimer: ReturnType<typeof setTimeout> | undefined;
    const epoch=sessionEpoch.current;
    const verifyMembership=async(session:GridexAuthSession,attempt=0)=>{
      let membershipIdentity: GridexUser;
      try {
        membershipIdentity = await apiClient.me();
        const expected=pendingGridexLogin();
        const verifiedEmail=(membershipIdentity.email||session.email||'').trim().toLowerCase();
        if(membershipIdentity.subject!==session.subject||
          (membershipIdentity.realm&&membershipIdentity.realm!==runtimeConfig.realm)||
          (membershipIdentity.email&&session.email&&membershipIdentity.email.toLowerCase()!==session.email.toLowerCase())||
          (expected&&(expected.realm!==runtimeConfig.realm||verifiedEmail!==expected.email))) {
          throw new LoginIdentityMismatchError();
        }
        if (runtimeConfig.realm !== 'gridex' && !membershipIdentity.memberships?.length && membershipIdentity.realm === runtimeConfig.realm) {
          const pending = (await apiClient.myOrganisationOnboarding()).invitations
            .filter(item => item.realm === membershipIdentity.realm);
          if (pending.length > 1) throw new Error('Ambiguous organisation invitations');
          if (pending.length === 1) {
            const result = await apiClient.acceptOrganisationOnboarding(pending[0].id);
            if (!result.accepted || result.realm !== membershipIdentity.realm) throw new Error('Organisation onboarding unconfirmed');
            membershipIdentity = await apiClient.me();
            if (!membershipIdentity.memberships?.some(item => item.role === 'administrator'))
              throw new Error('Organisation administrator membership unconfirmed');
          }
        }
        if (runtimeConfig.realm!=='gridex'&&!membershipIdentity.memberships?.length) {
          const pending=(await apiClient.invitations()).invitations;
          if(pending.length>1)throw new Error('Ambiguous membership invitations');
          if(pending.length===1){
            const result=await apiClient.acceptInvitation(pending[0].id);
            if(!result.accepted)throw new Error('Membership activation unconfirmed');
            membershipIdentity=await apiClient.me();
          }
        }
      } catch(error) {
        if (!active||epoch!==sessionEpoch.current) return;
        if(error instanceof LoginIdentityMismatchError) {
          forgetSession();clearGridexSession();
          try{sessionStorage.removeItem('gridex.selected-realm');sessionStorage.removeItem('gridex.selected-site');}catch{/* Optional storage. */}
          setSessionUser(null);setAccountIdentity(null);setLiveSites([]);setLiveSnapshot(null);
          window.location.replace('/login/?error=account-mismatch');
          return;
        }
        if ((error instanceof GridexApiError && error.status===503) || error instanceof TypeError || (error instanceof DOMException&&error.name==='TimeoutError')) {
          setAuthState('checking');setBackendState('unknown');setSessionCheckError(true);
          retryTimer=setTimeout(()=>void verifyMembership(session,attempt+1),Math.min(2000*2**attempt,15000));
          return;
        }
        setSessionUser(null);setAccountIdentity(null);setBackendState('unknown');setAuthState('error');
        setIntegrationError(document.documentElement.lang==='en'?'Sign-in completed, but organisation access could not be verified. Please try again.':'Входът приключи, но достъпът до организацията не може да се потвърди. Опитайте отново.');
        return;
      }
      if (!active||epoch!==sessionEpoch.current) return;
      if (membershipIdentity.subject !== session.subject || (membershipIdentity.email && membershipIdentity.email.toLowerCase() !== session.email.toLowerCase()) || (membershipIdentity.realm && membershipIdentity.realm !== runtimeConfig.realm)) {
        setSessionUser(null);setAccountIdentity(null);setLiveSites([]);setLiveSnapshot(null);setAuthState('error');
        setIntegrationError(document.documentElement.lang==='en'?'Identity mismatch. Sign in again.':'Несъответствие на профила. Влезте отново.');
        return;
      }
      const user=sessionToUser({ ...session, email:membershipIdentity.email||session.email, name:membershipIdentity.name||session.name, roles: membershipIdentity.roles });
      verifiedIdentity.current={subject:membershipIdentity.subject,realm:membershipIdentity.realm||runtimeConfig.realm,email:user.email,name:user.nameEn};
      clearGridexLoginIntent();
      setSessionUser(user);setAccountIdentity(membershipIdentity);setAuthState('authenticated');
      setBackendState('online');setSessionCheckError(false);setIntegrationError('');
      if(authCallback&&window.location.pathname==='/login/') {
        setLoginSuccess(true);
        successTimer=setTimeout(()=>{
          if(!active||epoch!==sessionEpoch.current)return;
          window.history.replaceState({},'',sectionHref('overview'));
          setView('overview');setLoginSuccess(false);
        },1000);
      }
    };
    initialiseGridexAuth(runtimeConfig).then(async session=>{
      if (!active||epoch!==sessionEpoch.current) return;
      if (!session) {
        // A confirmed anonymous result after a remembered/deep-linked session
        // returns to the public demo; an API outage is handled in catch below.
        if(window.location.pathname!=='/login/' && (previousRelease()!==null || window.location.pathname!=='/about/')) {
          showDemoAfterExpiredSession();
          return;
        }
        setSessionUser(null);
        setAccountIdentity(null);
        const loginError=new URLSearchParams(window.location.search).get('error');
        setAuthState(loginError?'error':'anonymous');
        // Login must not depend on a public unauthenticated health endpoint.
        setBackendState("unknown");
        setIntegrationError(loginError==='account-mismatch'
          ?(document.documentElement.lang==='en'?'The previous account was returned instead of the email you entered. That session was rejected. Try signing in again.':'Върна се предишният акаунт вместо въведения имейл. Отказахме тази сесия. Опитайте вход отново.')
          :loginError==='identity-init'
            ?(document.documentElement.lang==='en'?'The new sign-in could not be verified. No previous account was restored. Please try again.':'Новият вход не можа да се провери. Предишен акаунт не е възстановен. Опитайте отново.'):'');
        return;
      }
      await verifyMembership(session);
    }).catch(error=>{
      if (!active||epoch!==sessionEpoch.current) return;
      if(error instanceof GridexSessionExpiredError){showDemoAfterExpiredSession();return;}
      if(authCallback&&pendingGridexLogin()) {
        forgetSession();clearGridexSession();
        window.location.replace('/login/?error=identity-init');
        return;
      }
      setSessionUser(null);
      setAccountIdentity(null);
      setBackendState("unknown");
      setAuthState("error");
      setIntegrationError(document.documentElement.lang==="en"?"The identity service could not initialise.":"Услугата за реален вход не може да бъде инициализирана.");
    });
    return()=>{active=false;if(retryTimer)clearTimeout(retryTimer);if(successTimer)clearTimeout(successTimer);};
  },[runtimeConfig,apiClient,authCallback]);

  useEffect(()=>{
    if (dataMode!=="live"||backendState!=="online"||authState!=='authenticated') return;
    const controller=new AbortController();
    apiClient.sites(controller.signal).then(sites=>{
      if(controller.signal.aborted)return;
      setLiveSites(sites);
      setSitesStatus('ready');
      setIntegrationError(current=>current===(lang==='en'?'The site list could not be loaded.':'Списъкът с обекти не може да бъде зареден.')?'':current);
      if (!sites.length) {setSelectedSiteId('');setLiveSnapshot(null);return;}
      // A deep link to an inaccessible Site must never silently open another Site.
      const selected=selectedSiteId ? sites.find(item=>item.id===selectedSiteId) : sites[0];
      if(!selected){setSitesStatus('error');setLiveSnapshot(null);return;}
      setSelectedSiteId(selected.id);
      setSite(selected.name);
    }).catch(error=>{
      if(error instanceof GridexApiError&&error.code==='organisation_suspended')return;
      if(controller.signal.aborted)return;
      setLiveSites([]);setSitesStatus('error');setSelectedSiteId('');setLiveSnapshot(null);
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAccountIdentity(null);setAuthState("anonymous");return;}
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
      if(error instanceof GridexApiError&&error.code==='organisation_suspended')return;
      if(requestController.signal.aborted)return;
      if (error instanceof DOMException&&error.name==="AbortError") return;
      if(error instanceof GridexApiError&&error.status===401){setSessionUser(null);setAccountIdentity(null);setAuthState("anonymous");setLiveSnapshot(null);return;}
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
        window.dispatchEvent(new Event('gridex:session-expired'));
      };
    const verifySession=async()=>{
      if(pending||!active)return;
      pending=true;
      try {
        const identity=await apiClient.me(controller.signal).catch(error=>{
          if(error instanceof GridexApiError&&error.status===403&&error.code!=='organisation_suspended')expireSession();
          throw error;
        });
        if(verifiedIdentity.current && (identity.subject!==verifiedIdentity.current.subject || (identity.realm&&identity.realm!==verifiedIdentity.current.realm) || (identity.email&&identity.email.toLowerCase()!==verifiedIdentity.current.email.toLowerCase()))) {
          expireSession(); return;
        }
        const sites=await apiClient.sites(controller.signal).catch(error=>{
          if(error instanceof GridexApiError&&error.status===403) {
            setAccountIdentity(identity);setLiveSites([]);setLiveSnapshot(null);
            setSelectedSiteId('');setSitesStatus('error');setSessionCheckError(false);
            return null;
          }
          throw error;
        });
        if(!active)return;
        if(!sites)return;
        const email=identity.email||verifiedIdentity.current?.email;
        if(!email){expireSession();return;}
        const name=identity.name||verifiedIdentity.current?.name||email;
        verifiedIdentity.current={subject:identity.subject,realm:identity.realm||verifiedIdentity.current?.realm,email,name};
        setSessionUser(sessionToUser({subject:identity.subject,email,name,preferredUsername:identity.preferredUsername||'',roles:identity.roles}));
        setAccountIdentity(identity);
        setLiveSites(current=>JSON.stringify(current)===JSON.stringify(sites)?current:sites);
        setSitesStatus('ready');setSessionCheckError(false);
        if(selectedSiteId&&!sites.some(site=>site.id===selectedSiteId)) {
          setSelectedSiteId('');setLiveSnapshot(null);
        }
      }catch(error){
        if(error instanceof GridexApiError&&error.code==='organisation_suspended')return;
        if(error instanceof GridexApiError&&error.status===403)return;
        if(error instanceof GridexSessionExpiredError||(error instanceof GridexApiError&&error.status===401))expireSession();
        else if(active)setSessionCheckError(true);
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

  // The login route starts in live mode, but an anonymous visitor who has not
  // completed sign-in must return to the public demo, not an unauthenticated
  // live section in this still-mounted React tree.
  const browseAsDemoFromLogin=dataMode==='live'&&view==='login'&&!sessionUser&&authState!=='authenticated'&&!authCallback;
  const navigate = (id: string, siteId = selectedSiteId) => {
    const target=id === 'gateway' ? 'devices' : id;
    if(browseAsDemoFromLogin&&target!=='login') {
      window.location.assign(sectionHref(target,'',true));
      return;
    }
    window.history.pushState({},'',sectionHref(target,siteId,dataMode==='demo'));
    setView(target);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = async () => {
    if (authState === "authenticated") {
      try {
        try { await apiClient.revokeManagerAccess(); }
        catch { /* Keycloak sign-out must remain available if the API is offline. */ }
        await gridexLogout(runtimeConfig);
        return;
      } catch {
        setIntegrationError(lang==="en"?"Sign-out could not be completed by the identity service.":"Изходът не може да бъде завършен от услугата за идентичност.");
        return;
      }
    }
    setSessionUser(null);setAccountIdentity(null);
    navigate("login");
    notify(lang==="en"?"You have signed out safely":"Излязохте успешно от профила");
  };

  const openLogin = () => {
    if(dataMode==='demo') window.location.assign('/login/');
    else navigate('login');
  };
  const signIn = async (email: string, realm: string) => {
    try {
      sessionEpoch.current++;
      verifiedIdentity.current=null;
      setSessionUser(null);setAccountIdentity(null);setLiveSites([]);setLiveSnapshot(null);setSelectedSiteId('');
      setAuthState("checking");
      setIntegrationError("");
      await gridexLoginForEmail(runtimeConfig, realm, email);
    } catch {
      setAuthState("error");
      setIntegrationError(lang==="en"?"The sign-in service did not respond. Please try again.":"Услугата за вход не отговори. Моля, опитайте отново.");
      openLogin();
    }
  };

  const pageDocumentation = dataMode==='demo'?documentationLink('demo',lang):documentationLink(view, lang);
  const documentationHome = documentationLink('help', lang).href;
  const canManagePeople=accountIdentity?.permissions.includes('platform:manage')===true
    || accountIdentity?.memberships?.some(item=>item.role==='administrator')===true;
  const administrationDenied=dataMode==='live'&&authState==='authenticated'&&!canManagePeople
    &&['customers','members','plans','market-settings','settlement','balance'].includes(view);
  const platformAdmin=accountIdentity?.permissions.includes('platform:manage')===true;
  const marketEnabled=platformAdmin||(enabledServices!==null
    &&enabledServices.subject===accountIdentity?.subject
    &&enabledServices.codes.includes('day_ahead'));
  const grafanaEnabled=platformAdmin||(enabledServices!==null
    &&enabledServices.subject===accountIdentity?.subject
    &&enabledServices.codes.includes('day_ahead')&&enabledServices.codes.includes('visualisations'));
  const marketDenied=dataMode==='live'&&authState==='authenticated'&&!marketEnabled
    &&view==='market';

  return (
    <main className="app-shell" data-mode={dataMode}>
      <aside className={`sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
        <button className="brand" onClick={() => navigate("overview")} aria-label={lang==="en"?"GrideX Energy OS – home":"GrideX Energy OS – начало"}>
          <span>GX</span><div>GRIDEX<small>ENERGY OS</small></div>
        </button>
        <nav ref={navigationRef} id="main-navigation" aria-label={lang==="en"?"Main navigation":"Основна навигация"}>
          {renderedNav.map(([id, icon]) => {
            if(id==='members'&&dataMode==='live'&&!canManagePeople)return null;
            if(dataMode==='live'&&['plans','market-settings','settlement','balance'].includes(id)&&!canManagePeople)return null;
            if(dataMode==='live'&&!browseAsDemoFromLogin&&['assets','battery','inverter','evse','loads'].includes(id)
              &&!energyInventory.items.some(item=>id==='assets'||item.type===id))return null;
            const hasDeviceWarning=dataMode==='live'&&authState==='authenticated'&&backendState==='online'&&deviceWarning?.siteId===selectedSiteId&&deviceWarning.warning;
            const badge=dataMode==='live'?(id==='devices'&&hasDeviceWarning?'!':''):id==="battery"?(batteryNotice?"1":""):id==="automation"?"2":id==="alarms"?"3":"";
            const tone=id==="battery"?"amber":id==="automation"?"green":"red";
            const mobilePrimary=mobilePrimaryNav.has(id);
            return <a key={id} href={sectionHref(id,selectedSiteId,dataMode==='demo'||browseAsDemoFromLogin)} data-view-id={id} data-parent={parentSection[id]} aria-current={view===id?'page':undefined} title={navigationLabel(id,lang)} className={`${view === id ? "active" : ""} ${ancestors(view).includes(id)?'active-parent':''} ${mobilePrimary ? "mobile-primary" : ""} ${parentSection[id]?'nav-child':''} ${parentSection[id]&&parentSection[navItems[navItems.findIndex(item=>item[0]===id)+1]?.[0]]!==parentSection[id]?'nav-child-last':''}`} onClick={event => {if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(id);}}}>
              <i>{icon}</i><span>{navigationLabel(id,lang)}</span>{badge&&<em className={`nav-badge ${tone}`}>{badge}</em>}
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
          <button className={`profile ${!sessionUser?'quick-sign-in':''} ${accountMenuOpen?"open":""}`} disabled={dataMode==='live'&&authState==='checking'} onClick={()=>sessionUser?setAccountMenuOpen(!accountMenuOpen):openLogin()} aria-haspopup={sessionUser?"menu":undefined} aria-expanded={sessionUser?accountMenuOpen:undefined}>
            <span>{sessionUser?(lang==="en"?sessionUser.initialsEn:sessionUser.initialsBg):"↪"}</span>
            <div><strong>{sessionUser?(lang==="en"?sessionUser.nameEn:sessionUser.nameBg):(lang==="en"?"Sign in":"Вход")}</strong><small>{sessionUser?(lang==="en"?sessionUser.roleEn:sessionUser.roleBg):dataMode==='live'&&authState==='checking'?(lang==="en"?"Checking session…":"Проверка на сесията…"):dataMode==='live'&&authState==='error'?(lang==="en"?"Verification unavailable":"Проверката е недостъпна"):(lang==="en"?"No active session":"Няма активна сесия")}</small></div><b>⋮</b>
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
            <a role="menuitem" href={documentationHome} target="_blank" rel="noopener noreferrer"><i>?</i><span><strong>{lang==="en"?"Documentation":"Документация"}</strong><small>{lang==="en"?"Open the GrideX guides":"Отвори ръководствата"}</small></span><b>›</b></a>
            <button className="account-menu-logout" role="menuitem" onClick={signOut}><i>↪</i><span><strong>{lang==="en"?"Sign out":"Изход"}</strong><small>{lang==="en"?"End this portal session":"Прекрати тази сесия"}</small></span></button>
          </>:<><button role="menuitem" onClick={openLogin}><i>↪</i><span><strong>{lang==="en"?"Sign in":"Вход"}</strong><small>{lang==="en"?"Open secure sign-in":"Отвори защитения вход"}</small></span><b>›</b></button><a role="menuitem" href={documentationHome} target="_blank" rel="noopener noreferrer"><i>?</i><span><strong>{lang==="en"?"Documentation":"Документация"}</strong><small>{lang==="en"?"How to get access":"Как се получава достъп"}</small></span><b>›</b></a></>}
        </div>
      </>}

      <section className="content">
        <header className="page-heading">
          <div>
            <div role="navigation" aria-label={lang==='en'?'Breadcrumb':'Път до страницата'}>
              <h1 className="page-breadcrumb" data-testid="page-title">
                {ancestors(view).map(parent=><span key={parent}><a href={sectionHref(parent,selectedSiteId,dataMode==='demo'||browseAsDemoFromLogin)} onClick={event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(parent);}}}>{navigationLabel(parent,lang)}</a><span className="breadcrumb-separator" aria-hidden="true">→</span></span>)}
                <span aria-current="page">{view==='not-found'?(lang==='en'?'Page not found':'Страницата не е намерена'):navigationLabel(view,lang)}</span>
              </h1>
            </div>
            <p className="eyebrow page-site-context" data-testid="page-eyebrow">{dataMode==='live'?(liveSites.find(item=>item.id===selectedSiteId)?.name??'GrideX'):(lang==='bg'?'Соларен парк Изток':site)}</p>
          </div>
          <a className="page-help-link" href={pageDocumentation.href} target="_blank" rel="noopener noreferrer" aria-label={pageDocumentation.ready?(lang==='en'?'Help for this page (opens in a new tab)':'Помощ за тази страница (отваря се в нов раздел)'):(lang==='en'?'Help pending for this page (opens in a new tab)':'Очаква се помощ за тази страница (отваря се в нов раздел)')}><span aria-hidden="true">?</span><span><strong>{lang==='en'?'Help':'Помощ'}</strong><small>{pageDocumentation.ready?(lang==='en'?'Read the guide ↗':'Прочети ръководството ↗'):(lang==='en'?'Expected to be completed ↗':'Очаква се да се попълни ↗')}</small></span></a>
        </header>

        {!sessionUser&&view!=='login'&&<TranslationSuggestion key={lang}/>}

        {dataMode==="demo"&&demoNoticeVisible&&<section className={`demo-mode-notice ${backendState==="offline"?"offline":""}`} data-no-translate role="status">
          <i>{backendState==="offline"?"!":"DEMO"}</i>
          <span><strong>{lang==="en"?"This is Demo mode":"Това е Демо режим"}</strong><small>{backendState==="offline"?(lang==="en"?"API access could not be verified. You can retry sign-in.":"Достъпът до API не може да се потвърди. Можете да опитате вход отново."):(lang==="en"?"Please sign in to load your real sites and live OpenRemote data.":"Моля, логнете се, за да заредите реалните си обекти и данните на живо от OpenRemote.")}</small></span>
          <button className="demo-sign-in" onClick={openLogin}>{lang==="en"?"Sign in":"Вход"} →</button>
          <button className="demo-notice-close" aria-label={lang==="en"?"Hide demo notice":"Скрий демо съобщението"} onClick={dismissDemoNotice}>×</button>
        </section>}

        {sessionCheckError&&dataMode==='live'&&<section className="integration-warning" role="status"><i>!</i><span>{lang==='en'?'Session verification is temporarily unavailable. Retrying without signing you out.':'Проверката на сесията временно е недостъпна. Ще опитаме отново, без да те отписваме.'}</span></section>}
        {integrationError&&dataMode==="live"&&!['profile','help','about','login'].includes(view)&&<section className="integration-warning" role="alert"><i>!</i><span>{integrationError}</span></section>}

        <Suspense fallback={<SectionLoading view={view} lang={lang}/>}>
          {dataMode==='live'&&navigation.error&&<section className="integration-warning" role="alert"><i aria-hidden="true">!</i><div>{translate(lang,'access.unavailable')}</div></section>}
          {dataMode==='live'&&serviceCheckFailed&&view==='market'&&<section className="integration-warning" role="alert">{translate(lang,'access.unavailable')}</section>}
          <div key={sessionUser?.roleId??'anonymous'} className="portal-view" data-testid={"section-"+view} data-view={view}>
            {view==='devices'&&<section className="card config-card" data-no-translate><strong>{dataMode==='live'?(lang==='en'?'LIVE · Account data':'LIVE · Данни от акаунта'):(lang==='en'?'DEMO · Sample devices':'DEMO · Примерни устройства')}</strong><p>{lang==='en'?'Device connectivity is shown separately. A signed-in session does not confirm a heartbeat.':'Свързаността на устройствата се показва отделно. Активната сесия не потвърждава heartbeat.'}</p></section>}
        {view==='not-found'?<section className="card"><h2>{lang==='en'?'Page not found':'Страницата не е намерена'}</h2><a href={sectionHref('overview')}>{lang==='en'?'Home':'Начало'}</a></section>:dataMode==='live'&&backendState!=='online'&&view!=='login'&&view!=='about'&&view!=='help'?<section className="card config-card" role="status"><h2>{authState==='checking'?(lang==='en'?'Checking your session…':'Проверка на сесията…'):(lang==='en'?'Account data is unavailable':'Данните от акаунта са недостъпни')}</h2><p>{lang==='en'?'No demo data is shown while identity or API access is being verified.':'Не показваме демо данни, докато се проверяват сесията и достъпът до API.'}</p>{authState!=='checking'&&<button className="primary-btn" onClick={openLogin}>{lang==='en'?'Check sign-in':'Провери входа'}</button>}</section>:marketDenied?<section className="card config-card" role="status"><h2>{lang==='en'?'Service unavailable':'Услугата не е достъпна'}</h2><p>{translate(lang,serviceCheckFailed?'access.unavailable':'access.serviceNotGranted')}</p></section>:administrationDenied?<section className="card config-card" role="status"><h2>{lang==='en'?'Administrator access required':'Нужни са администраторски права'}</h2><p>{lang==='en'?'The Users and invitations section is available only to organisation or platform administrators. Your permitted Sites and Devices remain available for viewing.':'Разделът за клиенти и покани е само за администратори на организация или на платформата. Разрешените Ви Обекти и Устройства остават достъпни за преглед.'}</p></section>:dataMode==='live'&&(view==='sites'||((view==='devices'||view==='gateway')&&!selectedSiteId))?<LiveSites sites={liveSites} status={sitesStatus} lang={lang} api={apiClient} allowCreate={view==='sites'} organisations={accountIdentity?.memberships||[]} onCreated={item=>{setLiveSites(current=>[...current,item]);setSelectedSiteId(item.id);setSite(item.name);navigate('devices',item.id);}} onSelect={item=>{setSelectedSiteId(item.id);setSite(item.name);setLiveSnapshot(null);navigate('devices',item.id);}}/>:dataMode==="live"&&(view==='devices'||view==='gateway')?<DeviceInformation key={selectedSiteId} configure={view==='devices'&&accountIdentity?.memberships?.some(m=>m.organisationId===liveSites.find(s=>s.id===selectedSiteId)?.organisationId&&['administrator','integrator'].includes(m.role))===true} canCommission={accountIdentity?.memberships?.some(m=>m.organisationId===liveSites.find(s=>s.id===selectedSiteId)?.organisationId&&m.role==='administrator')===true} api={apiClient} siteId={selectedSiteId} lang={lang}/>:dataMode==="live"&&!liveViews.has(view)?<LiveModulePending view={view} lang={lang} onDevices={()=>navigate('devices')}/>:<>
        {view === "overview" && <Overview auto={auto} setAuto={setAuto} navigate={navigate} notify={notify} lang={lang} dataMode={dataMode} snapshot={liveSnapshot}/>}
        {view === "customers" && <Customers navigate={navigate} notify={notify} lang={lang}/>}
        {view === "sites" && <Sites setSite={setSite} navigate={navigate} lang={lang}/>}
        {view === "visualisations" && (dataMode==='live'
          ? <SiteVisualisations key={selectedSiteId} api={apiClient} siteId={selectedSiteId} siteName={liveSites.find(item=>item.id===selectedSiteId)?.name||''} lang={lang}/>
          : <><p>{translate(lang,'demo.graphNote')}</p><Devices notify={notify} lang={lang} historyOnly/></>)}
        {dataMode==='live'&&['assets','battery','inverter','evse','loads'].includes(view)&&<EnergyInventoryView state={energyInventory} sites={liveSites} view={view} lang={lang}/>}
        {dataMode==='demo'&&['inverter','evse'].includes(view)&&<DemoAssetInventory view={view} lang={lang}/>}
        {view === "assets" && dataMode==='demo' && (
          <DemoAssetInventory lang={lang}/>
        )}
        {view === "battery" && dataMode==='demo' && <Battery auto={auto} setAuto={setAuto} notify={notify} lang={lang} resolveNotice={()=>setBatteryNotice(false)} batteryCost={batteryCost} setBatteryCost={setBatteryCost}/>}
        {view === "schedule" && <Schedule notify={notify} lang={lang}/>}
        {view === "market" && (dataMode === 'live' ? <LiveMarket api={apiClient} lang={lang} platformAdmin={platformAdmin} grafanaEnabled={grafanaEnabled}/> : <Market lang={lang} notify={notify}/>)}
        {view === "settlement" && <Settlement notify={notify} lang={lang}/>}
        {view === "automation" && <Automation notify={notify} site={site} lang={lang} batteryCost={batteryCost}/>}
        {view === "loads" && dataMode==='demo' && <FlexibleLoads notify={notify} lang={lang}/>}
        {view === "balance" && <Balance notify={notify} lang={lang}/>}
        {view === "supported" && <SupportedDevices lang={lang}/>}
        {view === "devices" && <DemoInfrastructure lang={lang}/>}
        {view === "alarms" && <Alarms notify={notify} lang={lang}/>}
        {view === "reports" && (dataMode==='demo'?<ReportsCenter notify={notify} lang={lang} batteryCost={batteryCost}/>:<LiveModulePending view={view} lang={lang} onDevices={()=>navigate('devices')}/>)}
        {['weather','forecast'].includes(view)&&<section className="card"><h2>{navigationLabel(view,lang)}</h2><p>{lang==='en'?'Coming soon. This service is not activated by an access grant.':'Предстои. Разрешение за достъп не активира невнедрена услуга.'}</p></section>}
        {['settings','modes','market-settings'].includes(view)&&dataMode==='demo'&&<DemoSectionLinks view={view} lang={lang}/>}
        {['settings','modes','market-settings'].includes(view)&&dataMode==='live'&&<section className="sites-grid">{navItems.filter(([id])=>parentSection[id]===view).filter(([id])=>!['members','plans','market-settings','settlement','balance'].includes(id)||canManagePeople).map(([id])=><article className="card site-card" key={id}><h2>{navigationLabel(id,lang)}</h2><a className="secondary-btn" href={sectionHref(id,selectedSiteId,false)} onClick={event=>{if(!event.metaKey&&!event.ctrlKey){event.preventDefault();navigate(id);}}}>{lang==='en'?'Open':'Отвори'} →</a></article>)}</section>}
        {view==='services'&&(dataMode==='live'?<ServiceCatalog api={apiClient} lang={lang}/>:<DemoSectionLinks view="services" lang={lang}/>)}
        {view === "plans" && <SubscriptionPlans notify={notify} lang={lang}/>}
        {view === "about" && <About lang={lang} notify={notify} api={apiClient} live={dataMode==='live'} email={sessionUser?.email}/>}
        {view === "help" && <ProfileHelp lang={lang} live={dataMode==='live'}/>}
        {view === "profile" && <UserProfile lang={lang} user={sessionUser} api={apiClient} live={dataMode==='live'} navigate={navigate} signOut={signOut}/>}
        {view === "members" && dataMode==='demo' && <section className="card config-card"><h2>{lang==='en'?'Users & invitations':'Потребители и покани'}</h2><p>{lang==='en'?'Sign in as an organisation administrator to manage real invitations. No demo emails are sent.':'Влезте като администратор на организация, за да управлявате реални покани. В демо режима не се изпращат имейли.'}</p></section>}
        {view === "members" && dataMode==='live' && authState==='authenticated' && <Invitations key={`${accountIdentity?.realm}:${accountIdentity?.subject}`} api={apiClient} lang={lang} mode="manage" identity={accountIdentity}/>}
        {view === "login" && (loginSuccess?<section className="login-success-screen" role="status"><span aria-hidden="true">✓</span><h2>{lang==='en'?'Sign-in successful':'Входът е успешен'}</h2><p>{lang==='en'?'Opening your overview…':'Отваряме началния екран…'}</p></section>:<LoginPage lang={lang} user={sessionUser} config={runtimeConfig} onSignIn={signIn} onSignOut={signOut} navigate={navigate} backendState={backendState} authState={authState} error={integrationError} customerRealm={runtimeConfig.realm!=="gridex"&&new URLSearchParams(window.location.search).has('realm')}/>)}
            </>}
            {view==='devices'&&(dataMode==='demo'||backendState==='online')&&<InfrastructureCatalogue lang={lang}/>}
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

function LoginPage({lang,user,config,onSignIn,onSignOut,navigate,backendState,authState,error,customerRealm}:{lang:UiLanguage;user:DemoUser|null;config:GridexRuntimeConfig;onSignIn:(email:string,realm:string)=>Promise<void>;onSignOut:()=>void;navigate:(id:string)=>void;backendState:BackendState;authState:AuthState;error:string;customerRealm:boolean}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const backendAvailable=backendState==="online";
  const [email,setEmail]=useState('');
  const [realmChoices,setRealmChoices]=useState<string[]>([]);
  const [routingError,setRoutingError]=useState('');
  const [routingBusy,setRoutingBusy]=useState(false);
  const [resendNotice,setResendNotice]=useState('');
  const [resendBusy,setResendBusy]=useState(false);
  const resolveEmail=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(routingBusy)return;
    setRoutingBusy(true);setRoutingError('');setRealmChoices([]);
    try{
      const realms=customerRealm?[config.realm]:await discoverGridexLoginRealms(config,email.trim());
      if(realms.length===1)await onSignIn(email.trim(),realms[0]);
      else setRealmChoices(realms);
    }catch{
      setRoutingError(t('Организацията не може да се провери сега. Опитайте отново.','Your organisation could not be checked now. Please try again.'));
    }finally{setRoutingBusy(false);}
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
    <section className="login-card">
      <div className={`login-demo-chip ${backendAvailable?"ready":"offline"}`}>{t("СИГУРЕН ВХОД","SECURE SIGN-IN")}</div>
      <p>{t("ДОБРЕ ДОШЛИ","WELCOME BACK")}</p>
      <h2>{t("Вход в портала","Sign in to the portal")}</h2>
      {error&&<div className="login-error" role="alert">{error}</div>}
      <form className="login-email-form" onSubmit={resolveEmail}>
        <label htmlFor="gridex-login-email">{t('Имейл','Email')}</label>
        <input id="gridex-login-email" type="email" autoComplete="username" required maxLength={254} value={email}
          onChange={event=>{setEmail(event.target.value);setRealmChoices([]);setRoutingError('');}}/>
        {routingError&&<div className="login-error" role="alert">{routingError}</div>}
        <button className="login-submit" type="submit" disabled={routingBusy}>{routingBusy?t('Проверка…','Checking…'):user?t('Влез с друг акаунт','Sign in with another account'):t('Продължи към защитения вход','Continue to secure sign-in')} <b>→</b></button>
        {!!realmChoices.length&&<div className="login-realm-choices" aria-label={t('Изберете организация','Choose an organisation')}>
          <p>{t('Този имейл е поканен в повече от една организация:','This email was invited to more than one organisation:')}</p>
          {realmChoices.map(realm=><button type="button" key={realm} disabled={routingBusy} onClick={()=>void onSignIn(email.trim(),realm)}>{realm}</button>)}
        </div>}
      </form>
      <p>{t("Реалният достъп е само с покана. Въведете имейла от поканата. След потвърждение на адреса и задаване на парола първият администратор влиза без втори бутон за приемане.","Live access is invitation-only. Enter the invited email. After verification and password setup, the first administrator signs in without a second acceptance button.")}</p>
      <a className="profile-inline-help" href={documentationLink('login',lang).href} target="_blank" rel="noopener noreferrer">{t('Как се получава достъп?','How do I get access?')} <span aria-hidden="true">↗</span></a>
      <span className="login-intro">{t("Ще намерим правилната организация по имейла. Паролата се въвежда само в защитения OpenRemote / Keycloak вход.","We will find the right organisation from your email. Enter your password only on the secure OpenRemote / Keycloak sign-in page.")}</span>
      {user&&<div className="active-session-note"><i>●</i><span><strong>{t("Има активна сесия", "An active session is available")}</strong><small>{user.email}</small></span><button type="button" onClick={()=>navigate("profile")}>{t("Профил","Profile")}</button></div>}
      <div className={`login-connection-state ${backendAvailable?"online":"offline"}`}><i/>
        <span><strong>{authState==="checking"?t("Проверка на сесията","Checking session"):backendAvailable?t("Backend връзката е готова","Backend connection is ready"):backendState==="offline"?t("API достъпът не е потвърден","API access could not be verified"):t("Влезте за проверка на достъпа","Sign in to verify access")}</strong><small>{backendAvailable?t("Удостоверяване: OIDC Authorization Code + PKCE S256","Authentication: OIDC Authorization Code + PKCE S256"):t("Ще проверим отново при следващо отваряне или обновяване на страницата.","The connection will be checked again when the page is reopened or refreshed.")}</small></span>
      </div>
      {!user&&<div className="login-resend"><button type="button" className="login-secondary" disabled={resendBusy||!email.trim()} onClick={async()=>{
        setResendBusy(true);setResendNotice('');
        try{await requestInvitationResend(config,email.trim());setResendNotice(t('Ако има неприета покана за този имейл и не е използван еднократният опит, ще изпратим нов линк на същия адрес.','If a pending invitation exists and its one-time resend has not been used, a new link will be sent to the same address.'));}
        catch{setResendNotice(t('Не успяхме да обработим заявката сега. Опитайте по-късно или се свържете с администратора.','The request could not be processed now. Try later or contact your administrator.'));}
        finally{setResendBusy(false);}
      }}>{resendBusy?t('Изпращане…','Sending…'):t('Не получих поканата — изпрати отново','Did not receive the invitation — resend')}</button>{resendNotice&&<p role="status">{resendNotice}</p>}</div>}
      {!user&&customerRealm&&<a className="profile-inline-help" href="/login/?realm=gridex">{t('Вход в основния GrideX акаунт','Sign in to the main GrideX account')} →</a>}
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
        <div className="profile-panel-heading"><div><span className="profile-kicker">04 / {t('СИГУРНОСТ','SECURITY')}</span><h3>{t('Сесия','Session')}</h3></div><a href={`${helpHref}#session`} aria-label={t('Обяснение за сесията','Session explained')}>?</a></div>
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
